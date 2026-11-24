# NANO GATEWAY

A control panel for the **Nano WhatsApp bot**. One bot per account. You link a
WhatsApp number with a pairing code, and everything after that — the commands,
the plugins, the users, the group settings — comes from Nano itself.

The dashboard does not maintain a parallel copy of the bot's features. It reads
them:

| Shown in the dashboard | Read from |
| --- | --- |
| Bot name, owner, prefix, timezone | `<engine>/config/settings.js` |
| Command catalogue (~198 commands) | `<engine>/plugins/**/*.js` |
| Users, limits, premium flags | the bot's own `nano.sqlite` |
| Per-chat prefixes | the bot's own `nano.sqlite` |
| Group welcome / antilink settings | the bot's own `nano.sqlite` |
| Group schedules | the bot's own `nano.sqlite` |

So adding a plugin file makes its commands appear in the dashboard, and removing
one takes them away. Nothing is configured twice.

---

## Running it

```bash
npm install
npm run db:migrate      # create the database
npm run db:seed         # plans + an admin account
npm run dev             # web + gateway together
```

The dev and start scripts default to port 3000 and honour `PORT`:

```bash
PORT=3005 npm run dev
```

If you change the port, update `NEXT_PUBLIC_APP_URL` in `.env` to match — the
gateway pushes realtime events to that address.

### Production on this deployment

Live at **https://wagetway.danznanooffc.my.id**.

```bash
PORT=3005 npx next start -p 3005        # web   (systemd unit not created yet)
npx tsx gateway/index.ts                 # gateway
systemctl status cloudflared-nano-gateway # public ingress
```

Both app processes are started by hand rather than by systemd. Creating units
for them is the obvious next step — the tunnel already is one.

### Rotate the seeded admin password

The seed ships a published default password. Rotate it before exposing the app to
anyone:

```bash
npx tsx scripts/rotate-admin-password.ts            # generate a strong one
npx tsx scripts/rotate-admin-password.ts --password '…'
```

It also revokes every open session for the account, so a session created with the
old password cannot survive the change.

### Requirements

`.env` must point at your Nano installation:

```bash
ENGINE_DRIVER="nano-process"
NANO_ENGINE_DIR="/path/to/Nanoai"   # the folder containing index.js
```

Without `NANO_ENGINE_DIR` the gateway starts but cannot link or run a bot, and
the dashboard says so instead of showing an empty page.

---

## How the Nano integration works

### One installation, many bots

Nano derives its credentials and database paths from its own file location, so by
default every process shares one `sessions/auth.db` and one `nano.sqlite` — that
is one bot for the whole machine. Two small additive patches fix this:

| File | Change |
| --- | --- |
| `core/sesi.js` | `SESSION_DIR` honours `NANO_SESSION_DIR` |
| `core/sqlite.js` | `DB_DIR` honours `NANO_DATA_DIR` |
| `index.js` | loads the bridge inside `onReady` |

With those variables unset, the script behaves **exactly** as shipped. The shared
code (`plugins/`, `config/`, `lib/`, `node_modules/`) is never duplicated; only
per-bot state is separated:

```
<engine>/                      ← shared, one copy
  plugins/  config/  lib/  core/

storage/nano-state/<botId>/     ← per bot
  sessions/auth.db              credentials
  data/database/nano.sqlite     users, prefixes, group settings
  bridge/                       send requests + results
```

Apply or remove them with:

```bash
npx tsx scripts/install-nano-bridge.ts           # install / refresh (idempotent)
npx tsx scripts/install-nano-bridge.ts --revert  # restore the stock script
```

Originals are copied to `<engine>/.gateway-patch-backup/` before the first edit.

### Linking

Pairing code is the primary flow; QR is available as an alternative. The two are
mutually exclusive in the script, so requesting one cancels the other.

```
dashboard → gateway → `node index.js` with PAIRING_NUMBER=<number>
                    → conn.requestPairingCode(number)
                    → driver parses the code from stdout
```

The QR is likewise real: the script prints
`QR_IMAGE=https://api.qrserver.com/...&data=<payload>` and the driver decodes the
payload, so the code rendered in the browser is the one WhatsApp issued.

### Sending

The script owns the only socket, so messages go through a bridge
(`core/gateway-bridge.js`): the gateway appends a request to
`bridge/commands.jsonl`, the bot's `onReady` hook sends it and appends the result
to `bridge/results.jsonl`. Confirmed sends return WhatsApp's real message id.

### What Nano cannot do

Reported as unavailable rather than faked (`EngineCapabilityError` → HTTP 501):

- **Group participant export** — the script has no module that enumerates group
  members. Group *settings* are still readable, from the bot's database.
- **Media upload from the dashboard** — the script accepts media by URL only.

---

## Deployment notes

DNS for `wagetway.danznanooffc.my.id` originally pointed straight at the VPS
(an A record, DNS-only). That path does **not** work here: the machine is an
OpenVZ container on `10.46.0.194` behind 1:1 NAT, and port 80 is never forwarded
to it — external checks reach the IP and get a broken pipe. So Let's Encrypt's
HTTP-01 challenge cannot succeed, and neither can plain HTTP access.

Ingress therefore goes through a **Cloudflare Tunnel**, which dials outbound and
needs no inbound port at all, with TLS terminated at Cloudflare's edge:

```
https://wagetway.danznanooffc.my.id
  → Cloudflare edge (TLS)
  → cloudflared tunnel ebc3f56c-4837-4bda-b7c3-2f2ce632ea8d
  → http://127.0.0.1:3005 (Next.js)
```

The DNS record is a proxied CNAME to `<tunnel-id>.cfargotunnel.com`. The original
value (`A 192.154.111.198`, DNS-only) is recorded in the record's comment in case
it needs to be restored.

Files (copied from `deploy/`):

| Repo | Installed to |
| --- | --- |
| `deploy/cloudflared-nano-gateway.yml` | `/etc/cloudflared/nano-gateway.yml` |
| `deploy/cloudflared-nano-gateway.service` | `/etc/systemd/system/` |
| `deploy/nginx-wagetway.danznanooffc.my.id.conf` | `/etc/nginx/sites-available/wagetway.conf` |

The nginx block is kept for local/direct access; the public path goes straight to
the app, so there is no extra hop. `certbot` is installed but unused — it cannot
authenticate on this network.

## Architecture

```
app/                     Next.js App Router — pages and REST API
components/              UI, grouped by feature
lib/
  engine/                the contract both halves speak
  services/              domain logic (sessions, bots, Nano reads)
  security/              scrypt hashing, AES-GCM secrets, CSRF, TOTP
  queue/                 DB-backed job queue
gateway/                 standalone process that owns WhatsApp
  drivers/               local-baileys | nano-process
  nano/introspect.ts     reads the installation: config, plugins, bot database
  nano/mutate.ts         writes runtime settings into the bot's own database
  nano/settings-file.ts  rewrites config/settings.js (backup + parse check)
prisma/                  schema + migrations
scripts/                 nano-doctor, bridge installer
```

### Bot control from the panel

The panel is a control room for the Nano bot, so its controls are wired to the
same tables and files the script itself uses:

| Panel control | Real target |
| --- | --- |
| Start / Stop / Restart | spawns or signals the actual bot child process |
| Bot logs | the child process's stdout/stderr, bounded ring buffer per session |
| Access mode (normal / groups / private) | `bot_access_mode` (what `.onlygc` writes) |
| Anticall | `anticall_status` |
| Welcome / goodbye / antilink / per-chat prefix | `group_welcome`, `group_antilink`, `prefixes` |
| Extra owners | `owners` |
| Bot name, prefix, timezone, owner numbers… | `config/settings.js`, rewritten with a
  timestamped backup in `.gateway-patch-backup/` and only installed after the
  candidate file parses back to the requested values |

Runtime settings apply on the bot's next message. `config/settings.js` is read at
startup, so the UI asks for a restart — and only admins may write it, because it
is shared by every bot in the installation.

**The gateway is a separate process on purpose.** Baileys pulls in native
modules and protobuf codegen that fight Next's bundler, and a socket crash must
not take the web app down. The web app talks to it over localhost HTTP with a
shared token; nothing else touches Baileys.

### Notable decisions

- **SQLite, Postgres-ready.** No enums, no `Json`, no scalar arrays, money as
  integer cents — switching `provider` is the only change needed.
- **DB-backed queue instead of Redis.** Redis is not required to run this. The
  interface marks where a Redis driver would drop in.
- **SSE instead of Socket.IO.** No custom server, no extra port, no sticky
  sessions. `lib/realtime/hub.ts` marks where Redis pub/sub goes for multi-replica.
- **Server-side list components.** `StatCard` is a server component because a
  server page cannot pass an icon *component* to a client one — the count-up
  animation is isolated in `AnimatedNumber`.

### Diagnostics

```bash
npx tsx scripts/nano-doctor.ts
```

Reports the installation, whether the patch and bridge are present, the plugin
breakdown, and each bot's state.

---

## Single-instance caveats

`lib/security/rate-limit.ts` and `lib/realtime/hub.ts` keep state in-process.
Fine for one instance; behind multiple replicas, rate limits multiply and SSE
events do not cross instances. Both files mark the driver seam.

## Not built yet

Every link in the app and on the marketing site resolves — nothing 404s. These
are designed but unimplemented:

- messaging UI (send / bulk / scheduled / history) — the bot still answers
  commands it receives in WhatsApp, and send-path services exist
- group member sync (Nano exports no group metadata; group *settings* are managed)
- contacts and tags management
- the automation rule builder (service layer exists)
- API keys and the public `/api/v1/*` surface with key auth — `/api-docs` says so
- analytics pages (the dashboard chart is real)
- subscriptions and billing
- ticket replies and the staff inbox (opening a ticket works; the thread does not)
- the rest of the admin panel (user suspend/activate works)

There are no social sign-in buttons: the build authenticates with email +
password (plus optional TOTP), and a provider button without an OAuth route would
dead-end.

