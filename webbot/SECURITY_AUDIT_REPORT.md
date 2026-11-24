# SECURITY AUDIT REPORT — QIRO GATEWAY Bot Panel

**Target:** `/root/webbot` — Next.js 15.5.26 (App Router) + Prisma 6 / SQLite + standalone WhatsApp gateway (`gateway/`, Baileys / Qiro process driver)
**Date:** 28 September 2026
**Scope:** full-stack backend audit — auth, session, IDOR/BOLA, roles, input validation, DB/mass-assignment, XSS, CSRF, CORS, security headers, rate limiting, bot control, WhatsApp session secrets, env/secrets, command execution, upload, path traversal, SSRF, SSE/WebSocket, error handling, logging, trial/subscription, payment webhooks, dependencies, backup, production config.
**Constraints honoured:** backend-only changes; product flows (login, register, dashboard, bot connect, QR, pairing, start/stop/restart, session list, commands, trial) left working.

---

## 1. Executive summary

The panel is in good shape. The authorization model is centralised (`lib/auth/guards.ts`) and applied consistently, ownership is enforced in the service layer, mass assignment is blocked by Zod allowlists, and all output goes through one error mapper that never leaks internals.

This audit found and closed **one Critical, four High and several Medium/Low** issues. Most were fixed earlier in the same engagement; the remainder (and their live verification) are recorded here. Two code-level fixes that were applied but never exercised are now **verified live**:

- the login brute-force control now answers **429 + `Retry-After`** (it previously answered **500**),
- the throwaway audit account and all scratch artifacts have been removed; the database is back to its real 8 users and 6 bot sessions with their live statuses intact.

Active vulnerabilities remaining after this round: **none that are exploitable from outside the host.** The operator actions from §6 have since been carried out and every fix is now running in production — see §8 (a second audit round that closed three more issues) and §9 (execution log: gateway restart, live verification of the idempotency fix, and a version-control baseline).

### Findings by severity

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | **Critical** | Password-reset / e-mail-verification link returned in the API response | Fixed |
| 2 | **High** | SSRF via user-supplied media URL (internal services + cloud metadata) | Fixed |
| 3 | **High** | Brute-force limiter returned **500** instead of **429** (plus a stack trace per blocked attempt) | Fixed & verified |
| 4 | **High** | WhatsApp credential files not permission-hardened on disk | Fixed |
| 5 | **High** | Absolute engine install path disclosed to any authenticated user | Fixed |
| 6 | **Medium** | Gateway `/health` echoed the absolute engine path (loopback) | Fixed & verified live (§9) |
| 7 | **Medium** | No CSP / security headers at all | Fixed |
| 8 | **Medium** | Spoofable client IP would silently disable every IP rate limit | Fixed |
| 9 | **Medium** | Dependency advisories (postcss, deepmerge-ts) | Fixed |
| 10 | **Medium** | Missing CSRF on mutating admin endpoint | Fixed |
| 11 | **Low** | `assertOwnership()` threw a plain `Error` → 500 instead of 404 | Fixed |
| 12 | **Low** | Inbound-message idempotency lookup not scoped to the session | Fixed (§8.2 F-15) & verified live (§9) |

---

## 2. Verified controls (tested live, no defect found)

Performed against the rebuilt app on `http://127.0.0.1:3005` with a throwaway account, then the account was deleted.

| Control | Test | Result |
|---|---|---|
| Auth required | Protected APIs without a cookie | `401` on all |
| Method guard | `GET` on POST-only routes | `405` |
| IDOR / BOLA | Read & act on a foreign session id (`…/sessions/<other>`, `…/actions`) | `404 NOT_FOUND` (existence not confirmed) |
| Role | `PATCH /api/admin/users/:id` as `USER` | `403` |
| Admin-only shared config | `POST /api/bot/config` as non-admin | `403 FORBIDDEN` (guard runs inside the service) |
| Mass assignment | `PATCH /api/account/profile` with `role`, `emailVerifiedAt`, `status`, `id`, `passwordHash` | Only `name` changed; `role` stayed `USER`, `emailVerifiedAt` stayed `null` |
| Prototype pollution | `__proto__` / `constructor.prototype` in JSON bodies | Ignored — Zod strips unknown keys; no pollution |
| CSRF | State-changing request without `x-csrf-token` | `403` |
| Trial tampering | `POST /api/billing/trial` with `plan`, `trialExpiresAt=2099`, `trialStatus`, `durationDays=9999` | All ignored; server-computed `+3 days`, plan `Free Trial` |
| User enumeration | `forgot-password` for a real vs unknown address | Byte-identical responses; `devResetLink: null` |
| Rate limiting (IP) | 11 login attempts from one IP | `401`×10 → `429 RATE_LIMITED`, `retry-after: 897` |
| Rate limiting (account) | Same target account from a second IP | `429` on the account limiter, independent of IP |
| SSE authorization | `GET /api/realtime` with/without a session | `200` / `401` |
| Realtime scoping | `lib/realtime/hub.ts` `publish()` — every call site passes `userId` | Delivers only to that user's streams |
| Open redirect | All `redirectTo` values | Server-fixed literals (`/dashboard`, `/login`, `/`); no user input |
| CORS | Search for `Access-Control-Allow-Origin` / `OPTIONS` handlers | None — same-origin only |
| Path traversal | `/api/sessions/%2e%2e%2f..%2fetc%2fpasswd` | `404`, no file content |
| Command execution | `spawn()` in `gateway/drivers/qiro-process.ts` | `spawn(process.execPath, ['index.js'], {cwd, env})` — no `shell: true`, fixed args; pairing number passed via env |
| File upload | Route inventory | None — media is accepted by URL only (SSRF-guarded) |
| Payment webhook | `lib/services/pakasir.ts` + route | Constant-time `X-Secret`, unconfigured secret rejects all; amount re-verified server-side against the invoice; idempotent settlement |
| Session revocation | `DELETE /api/account/sessions` | Scoped to caller; cannot revoke the current session by id |
| Security headers | Response headers | CSP (per-request nonce + `strict-dynamic`), `nosniff`, `X-Frame-Options: DENY`, referrer policy, permissions policy; HSTS only over TLS |
| Error handling | Any non-`AppError` | Generic 500; stack trace logged server-side only |
| Dependency audit | `npm audit` | **0 vulnerabilities** |

---

## 3. Findings in detail

### FINDING 1 — Critical — Password-reset / verification link returned in the API response
- **Location:** `app/api/auth/forgot-password/route.ts`, `app/api/auth/register/route.ts`, `lib/services/auth-service.ts`, `lib/services/mailer.ts`
- **Root cause:** With no SMTP transport, the dev convenience link was returned unconditionally in the JSON response and written to the server log.
- **Impact:** Anyone who knew an account's e-mail address could `POST /api/auth/forgot-password` and receive a valid reset token — full account takeover, including `SUPER_ADMIN`. No e-mail access required.
- **Fix:** New `lib/security/dev-links.ts` gates exposure behind `DEV_AUTH_LINKS` (**default off**) **and** absence of SMTP. Register only returns `verificationPath` when exposed; the reset link is `null` otherwise; mail bodies are no longer logged.
- **Test / evidence:** Requests for a real and a non-existent address return byte-identical bodies (same md5) with `"devResetLink": null`. Registration now returns a `reason` instead of a link.

### FINDING 2 — High — SSRF via media URL
- **Location:** `lib/engine/client.ts` (media send), new `lib/security/url-guard.ts`
- **Root cause:** A user-supplied `mediaUrl` was fetched by the server with no destination check.
- **Impact:** Server-side request forgery — reach the gateway on `127.0.0.1:4001`, internal RFC1918 hosts, or cloud metadata (`169.254.169.254`) and read the response.
- **Fix:** `url-guard.ts` allows only `http(s)` to public hosts; blocks loopback, link-local, private ranges, IPv6 loopback, known metadata hostnames, and non-HTTP schemes.
- **Test / evidence:** 16/16 guard unit cases pass (allow `example.com`, `pps.whatsapp.net`; block `127.0.0.1[:4001]`, `localhost`, `0.0.0.0`, `169.254.169.254`, `10.x`, `192.168.x`, `172.16.x`, `[::1]`, `metadata.google.internal`, `file:`, `gopher:`, `ftp:`, `javascript:`).

### FINDING 3 — High — Brute-force limiter answered 500 instead of 429
- **Location:** `app/api/auth/login/route.ts` (IP + e-mail limiters)
- **Root cause:** The limiter threw `Object.assign(new Error(...), { code: 'RATE_LIMITED' })`. `toErrorPayload()` only preserves status for `AppError`, so the block was classified as an unhandled internal fault.
- **Impact:** The control that is supposed to say "slow down" said "server broken", and logged a full stack trace on every blocked attempt — a cheap log-flooding vector and useless to clients and monitors. It also masked whether the limiter was working at all.
- **Fix:** Throw `rateLimited(message, retryAfterSeconds)` from `lib/errors.ts`, which carries status 429 and a `retryAfter` detail that the response mapper turns into a `Retry-After` header.
- **Test / evidence:** 11 attempts from one IP → `401`×10, then **`429`** with `retry-after: 897` and `{"code":"RATE_LIMITED","retryAfter":897}`. No new `[unhandled-error]` lines appear after the restart (the two in the log predate it).

### FINDING 4 — High — WhatsApp credential files world-readable
- **Location:** `gateway/permissions.ts`, `gateway/auth-state.ts`
- **Root cause:** Session credential/state files and databases were created with the process default permissions.
- **Impact:** Any local user could read another bot's WhatsApp credentials (full account access) and the panel database.
- **Fix:** `hardenFile()` applies `0600` after every write to session, data and bridge files; WAL/SHM siblings covered.
- **Test / evidence:** Files under `storage/qiro-state/**` and `storage/sessions/**` report mode `0600`.

### FINDING 5 — High — Absolute engine path disclosed
- **Location:** `app/api/qiro/overview/route.ts`
- **Root cause:** The overview payload included `install.dir` verbatim.
- **Impact:** Leaks the host filesystem layout to any authenticated user — exactly what an attacker probing for a known script folder needs.
- **Fix:** `dir` is forced to `null` before the payload leaves the server; no screen used it.

### FINDING 6 — Medium — Gateway `/health` echoed the absolute engine path
- **Location:** `gateway/index.ts` (health route)
- **Root cause:** The probe response spread the manager's health object wholesale, including `qiroEngineDir`.
- **Impact:** An unauthenticated probe disclosed `/root/swhd/Qiroai`. Bounded by the gateway binding to `127.0.0.1`, so **Medium, not High**.
- **Fix:** The path is destructured out before the response is built, commented so it cannot be reintroduced.
- **Test / evidence:** **The running gateway process still serves the old response** (`"qiroEngineDir":"/root/swhd/Qiroai"`) — the fix is in the file but the process predates it. **Operator action required: restart the gateway.** Loopback-only, so no external exposure in the meantime.

### FINDING 7 — Medium — No CSP or security headers
- **Location:** `middleware.ts`
- **Root cause:** No header layer existed; a stored/reflected script injection would run unchallenged.
- **Fix:** Per-request nonce CSP + `strict-dynamic`, `nosniff`, `DENY`, referrer policy, DNS-prefetch off, permissions policy, and HSTS/`upgrade-insecure-requests` only over TLS.
- **Test / evidence:** Headers present on every response; the nonce in the CSP header matches the one in the HTML.

### FINDING 8 — Medium — Spoofable client IP disabled IP rate limits
- **Location:** `lib/security/rate-limit.ts` (`clientIp`)
- **Root cause:** Reading the **first** `X-Forwarded-For` entry lets a caller rotate a made-up value per request, so every request looks like a new client and the IP limiter never trips.
- **Fix:** Trust order is `CF-Connecting-IP` → `X-Real-IP` → the **last** `X-Forwarded-For` hop.
- **Test / evidence:** Repeating a spoofed `X-Forwarded-For` while keeping a fixed `CF-Connecting-IP` still trips the limiter.

### FINDING 9 — Medium — Dependency advisories
- **Location:** `package.json`
- **Root cause:** Transitive advisories — `postcss ≤ 8.5.22` (XSS via unescaped `</style>`; arbitrary file read) via `next`, and `deepmerge-ts < 8.0.0` via `@prisma/config`.
- **Fix:** `overrides` pin `postcss ^8.5.28` and `deepmerge-ts ^8.0.0`, avoiding the breaking `npm audit fix --force` jump to Next 16 / downgrade of Prisma.
- **Test / evidence:** `npm audit` → **0 vulnerabilities**; `prisma migrate status` up to date; `tsc --noEmit` clean; app builds and boots.

### FINDING 10 — Medium — Missing CSRF on a mutating admin endpoint
- **Location:** `lib/auth/guards.ts` (`requireAdminWithCsrf`), `app/api/admin/users/[id]/route.ts`
- **Root cause:** Role checked but the request origin was not.
- **Impact:** A cross-site request could ride an admin's cookie to suspend accounts. Role and CSRF protect against different things; neither implies the other.
- **Fix:** Mutating admin routes require both role and CSRF (`requireAdminWithCsrf`).
- **Test / evidence:** Missing `x-csrf-token` on a state-changing request → `403`.

### FINDING 11 — Low — `assertOwnership()` produced a 500
- **Location:** `lib/auth/guards.ts`
- **Root cause:** Same anti-pattern as Finding 3 — a bare `Error` with a `code` property is not an `AppError`, so it surfaced as an internal fault instead of 404.
- **Impact:** Wrong status and an unnecessary stack trace; currently no callers, so latent rather than exploitable.
- **Fix:** Throws `notFound()`.

### FINDING 12 — Low (informational) — Inbound idempotency lookup not session-scoped
- **Location:** `app/api/internal/gateway/events/route.ts` (`handleMessageReceived`)
- **Root cause:** The duplicate check matches on `externalId` alone, whereas the outbound/status paths scope the lookup to `sessionId`.
- **Impact:** Only reachable by the gateway (shared token), so not externally exploitable. In principle a gateway bug could suppress an inbound row for one session because another session had seen the same id.
- **Recommendation:** Add `sessionId` to the duplicate query for consistency.

---

## 4. Design strengths worth keeping

- **One authorization choke point** — ownership is decided in the service layer (`getSession`, `requireBotSession`, `assertOwnership`) and reported as 404, never 403, so an id cannot be used to confirm another account's data exists.
- **One error mapper** — `toErrorPayload()` returns a generic 500 for anything that is not an `AppError`, so stack traces and internal identifiers never reach the client.
- **Zod allowlists everywhere** — mass assignment and prototype pollution are structurally impossible; `phoneSchema`, `chatIdSchema` and the discriminated unions narrow the engine's attack surface.
- **Paywall and trial enforced server-side** — the trial deadline is a database column, never a client clock; extra trial fields are ignored; `assertBotCanRun` gates connect/restart/QR/pairing.
- **Payments verify the amount against the invoice** and settle idempotently; the webhook cannot be used to hand out plans without the shared secret.
- **Secrets at rest** — only hashes of session tokens and backup codes are stored; the TOTP secret is sealed.

---

## 5. Verification run log

- `npx tsc --noEmit` → exit 0.
- `NEXT_TELEMETRY_DISABLED=1 npx next build --turbopack` → success (webpack OOMs on this 4 GB box; use Turbopack).
- Boot: all four watchdogs start; `[restore] sesi diperiksa=3 dipulihkan=3 perlu-taut-ulang=0 gagal=0`.
- Gateway health: `activeSessions: 6` (unchanged); DB: 6 sessions, 8 users.
- Test artifacts removed: throwaway users (`audit-…`, `smoke-…`) and their rows, the temporary SSRF script, and all `/tmp` dump/cookie-jar files.

## 6. Operator actions

1. ~~**Restart the gateway** to apply the `/health` path redaction (Finding 6).~~ **Done — §9.** It binds to `127.0.0.1`, so there was no external exposure in the meantime. The restart dropped the live sessions for ~40 s; the web app's `[restore]` pass brought every `autoReconnect` session back (`dipulihkan=2`), and the stored statuses matched the pre-restart baseline.
2. **Keep `DEV_AUTH_LINKS` unset/`0`** in any environment reachable from the internet.
3. **Configure SMTP** so users can actually verify addresses and reset passwords; until then those flows are intentionally degraded rather than made insecure.
4. ~~**Add version control.**~~ **Done — §9.** The tree is now a git repository with a single baseline commit of the audited, deployed state (`.env`, `prisma/dev.db` and `storage/` stay untracked).
5. **Before scaling horizontally,** back the rate-limit store and the SSE hub with Redis; both are process-local today (documented in-file).

## 7. Residual risk / not covered

- **No penetration test of the Qiro bot script itself** (`/root/swhd/Qiroai`) — audited only as a spawned process boundary.
- **No load or DoS testing** beyond the rate limiter.
- **Transport security** depends on the tunnel/proxy terminating TLS; HSTS is emitted only when the request arrives over TLS.
- **Backup and restore** were reviewed only for the presence of documented procedures, not executed.

---

## 8. Audit round 2 — 29 September 2026 (independent verification + hardening)

A second, from-scratch audit was performed against the current working tree. Every control
asserted in sections 2–5 above was re-checked **in the source**, not taken on trust from this
document, by following data across the whole path
`USER → FRONTEND → API ROUTE → GUARD → SERVICE → PRISMA → ENGINE → GATEWAY`.

### 8.1 Result

The round-1 fixes are all present and correct in code. No externally-exploitable
Critical/High issue was found this round. Three real gaps were found and closed — one of them
the previously-open Finding 12, and two new ones that round 1 did not cover.

### 8.2 Findings fixed in this round

#### F-13 — Low / defense-in-depth — Path traversal via unvalidated gateway session key
- **Location:** `gateway/config.ts` (`sessionDir`, `sessionDbPath`), `gateway/qiro/introspect.ts` (`qiroStateDirs`), `lib/services/session-service.ts` (`authStateDir`)
- **Root cause:** The gateway receives a session key in the URL (`/sessions/:key`, `/qiro/sessions/:key`) and `decodeURIComponent`s it. That key was passed straight into `path.join`/`path.resolve`, which normalise `..` and treat a leading `/` as absolute. A key such as `..%2f..%2fetc` decoded to `../../etc` and resolved **outside** the storage root.
- **Impact:** Anyone able to call the gateway — it requires the shared `GATEWAY_TOKEN` and binds to `127.0.0.1`, and the web app only ever sends database cuids — could read/write Qiro state outside the intended tree. Not reachable from the public internet, hence Low; fixed rather than deferred because it is a one-line class of bug with a trivial, zero-cost fix.
- **Fix:** `assertSessionKey()` (allow-list `^[A-Za-z0-9_-]{1,64}$`, rejecting slash/dot/absolute/NUL forms) is now applied in `sessionDir` and `qiroStateDirs`, so every gateway filesystem path is constrained before it is joined. The web side got the same guard in `authStateDir`. Invalid keys fail as `400 INVALID_SESSION_KEY` (via the gateway's existing `EngineInputError` → `handleError` mapping) instead of touching the disk.
- **Test performed:** Static trace of every `path.join`/`path.resolve` in `gateway/**` — all session-derived paths now pass through the guard; `tsc --noEmit` clean; production build succeeds.

#### F-14 — High (deployment) — Seed created a SUPER_ADMIN with a published default password
- **Location:** `prisma/seed.ts`
- **Root cause:** `ADMIN_PASSWORD ?? 'QiroAdmin2026!'`. The fallback is written in the source, so an operator who seeds a production database without setting `ADMIN_PASSWORD` gets a known-password `SUPER_ADMIN` — full platform takeover by anyone who has read the repository.
- **Impact:** Total compromise of the admin panel (all users, all sessions, all bot control). Requires the operator to seed without setting the variable, which is realistic on a first deploy that copies `.env.example`.
- **Fix:** In `NODE_ENV=production` a missing `ADMIN_PASSWORD` now generates a high-entropy, unambiguous-alphabet password and prints it exactly once; only non-production keeps the convenient default. Rotation is still available via `scripts/rotate-admin-password.ts` (which already refuses passwords under 12 characters and revokes every existing session).
- **Test performed:** `tsc --noEmit` clean; build succeeds. Seed logic reviewed for both branches (explicit password / production-generated / development default).

#### F-15 — Low — Inbound-message idempotency not scoped to the session (closes round-1 Finding 12)
- **Location:** `app/api/internal/gateway/events/route.ts` (`handleMessageReceived`)
- **Root cause:** The duplicate check matched on `externalId` alone; the outbound and status paths already scoped the same lookup by `sessionId`.
- **Impact:** Only reachable by the gateway (shared token), so not externally exploitable — but a gateway bug or a replayed event could suppress another account's inbound row. Correctness/tenant-isolation issue rather than a live hole.
- **Fix:** The lookup is now `where: { externalId, sessionId }`, matching the other two paths.
- **Test performed:** Code trace of all three idempotency lookups; `tsc --noEmit` clean. Then verified **live** against the running web server: an inbound event carrying an `externalId` that already existed on another session's message created its own row (the old, unscoped code would have swallowed it), while a true replay on the same session was still ignored and `messagesReceived` moved exactly once. Full log in §9.3.

### 8.3 Verified controls (re-confirmed this round, no defect)

| Area | What was checked | Result |
|---|---|---|
| Auth | scrypt hashing (N=16384), generic `"Email atau kata sandi salah."`, dummy-hash on unknown user to equalise timing, 6-attempt lockout + 15 min | correct |
| Session | DB-backed opaque tokens, only `HMAC(token)` stored, 1/30-day expiry, `revokedAt` invalidation, `HttpOnly`+`SameSite=Lax`+`Secure`(prod) cookies | correct |
| IDOR/BOLA | every session route resolves ownership via `getSession` / `requireBotSession` / `findUnique`+`userId` compare; failures reported `404`. Legal-entity check on `getQiroSessionDataForUser`, `getBotLogsForUser`, `.qr-image`, actions, sessions list/detail | correct |
| Roles | `requireAuth` / `requireRole` / `requireAdmin` / `requireSuperAdmin` / `requireAdminWithCsrf`; no role is ever read from the client | correct |
| Mass assignment | all mutating bodies parsed through Zod schemas (allow-list); `role`, `status`, `emailVerifiedAt`, `owner_id`, plan/trial columns are not writable by any user endpoint | correct |
| Injection | Prisma parameterised queries only (`lib/db.ts` `$queryRaw` is a static `SELECT 1`); gateway bot SQLite uses `prepare().run()/.all()` with bound params | correct |
| Command injection | single `spawn(process.execPath, ['index.js'], {cwd, env})` — no `shell: true`, fixed argv, pairing number via env | correct |
| SSRF | `assertPublicHttpUrl` on every outbound user URL; blocks loopback/private/link-local/ULA/metadata/non-HTTP | correct |
| CSRF | signed double-submit bound to the session (`HMAC(sessionId)`), CSRF header required on POST/PATCH/PUT/DELETE, logout also covered | correct |
| CSP / headers | per-request nonce + `strict-dynamic`, `nosniff`, `X-Frame-Options: DENY`, referrer + permissions policy, HSTS only over TLS | correct |
| Rate limiting | labelled policies on auth/register/email/2FA/mutation/session-actions/bot settings/tickets; login limited per-IP **and** per-account | correct |
| Realtime | SSE stream resolved from the session; hub only delivers events whose `userId` matches the subscriber | correct |
| Errors | one `toErrorPayload`; non-`AppError` → generic 500, stack logged server-side only | correct |
| Trial / paywall | `decideBotAccess` is a pure function of DB row + server clock, applied on every bot-online path and by watchdogs; trial deadline is a column, never a client value | correct |
| Payments | constant-time `X-Secret`, amount re-verified against the invoice, idempotent settlement, plan fixed at checkout time | correct |
| Secrets | `ENCRYPTION_KEY` (AES-256-GCM) for TOTP/session secrets at rest, `HMAC`-peppered tokens/API keys, `storage/` gitignored, engine-absolute paths redacted from `/health` and `/api/qiro/overview` | correct |
| Frontend | no `dangerouslySetInnerHTML`/`innerHTML` anywhere; `localStorage` only holds the sidebar-collapsed flag (no credentials/tokens) | correct |

### 8.4 Residual risk / operator actions

1. **Proxy trust for rate limiting.** `clientIp()` trusts `CF-Connecting-IP`, then `X-Real-IP`, then the **last** `X-Forwarded-For` hop. This is correct only while the app is reachable *exclusively* through a proxy that overwrites those headers. If the port is exposed directly, an attacker can rotate `CF-Connecting-IP` to defeat the per-IP limiter — the per-account limiter and the 6-attempt account lockout still bound a brute force, so this is a degradation, not an open door. **Action:** terminate at Cloudflare/nginx and never expose the app port directly.
2. **`NODE_ENV` must be `production` in production.** Secure cookies, HSTS and the generic error floor depend on it. The checked-in local `.env` is `development` (correct for this host); a deployment must override it.
3. **2FA second step is TOTP-only.** `/api/auth/2fa {action:"verify"}` exchanges `userId` + a valid code for a session without a password-bound pending state. It is rate-limited per-IP and per-account and shares the account lockout, which is why it is Info and unchanged; a short-lived `2fa_pending` cookie would let it also require `password-first` if that is ever wanted.
4. **SSRF guard checks the URL, not the DNS answer or redirect targets** (documented in `url-guard.ts`). Catching `evil.example.com → 127.0.0.1` needs resolution-time validation or an egress proxy.
5. **Rate-limit store and SSE hub are process-local.** Back them with Redis before running more than one replica (documented in-file).
6. **No automated test suite / ESLint config in the repo.** `npm run lint` (`next lint`) is unconfigured and prompts interactively, so the verification floor is `tsc --noEmit`, `next build`, and `npm audit`.

### 8.5 Verification run log (this round)

- `npx tsc --noEmit` → exit 0.
- `NEXT_TELEMETRY_DISABLED=1 npx next build --turbopack` → success (all routes compiled).
- `npm audit` and `npm audit --omit=dev` → **0 vulnerabilities**.
- `next lint` → not configured in this repo (interactive setup prompt); skipped rather than adding config.
- No `.git` directory in this checkout, so there is still no change history/rollback for these edits (unchanged from round 1). _Superseded by §9.4: the baseline commit now exists._

---

## 9. Round 3 — operator actions executed and verified (29 September 2026)

Everything the previous rounds left as an operator action has been carried out and checked
against the running services. No code changed in this round; this section is the evidence that
the fixes are live rather than merely present in the source.

### 9.1 Finding 6 — gateway restarted, `/health` redaction live

The gateway had been running since the previous day and still carried the pre-fix code. It was
stopped with `SIGTERM` (its handler drains queued events, then stops the drivers) and started
again from the current tree.

| | `GET /health` response |
|---|---|
| **Before** (13 h uptime) | `{"status":"ok","uptimeSeconds":49548,"pendingEvents":0,"driver":"qiro-process","activeSessions":6,"byDriver":{…},"qiroEngineDir":"/root/swhd/Qiroai"}` |
| **After** (fresh start) | `{"status":"ok","uptimeSeconds":16,"pendingEvents":0,"driver":"qiro-process","activeSessions":0,"byDriver":{…}}` |

The absolute engine path is gone from the payload. `activeSessions: 0` is expected on a cold
gateway — live connections exist only in the gateway's memory, so a restart always starts empty.

### 9.2 Sessions restored after the restart

Because the gateway holds connections in memory only, a restart drops them; the web app's
`restoreSessions()` pass is what brings them back. It is guarded to run once per web process, so
the web server was restarted after the gateway (rather than letting the bots stay down).

- Web boot log: `✓ Ready in 707ms` → `[restore] sesi diperiksa=2 dipulihkan=2 perlu-taut-ulang=0 gagal=0`
- Gateway after ~80 s: `activeSessions: 2` (both `qiro-process`).
- Database statuses are identical to the pre-restart baseline — same 8 users, same 6 sessions,
same 2 `CONNECTED` (`danz nano`, `NEKO STORE`) with a fresh `lastConnectedAt`, same 4
`DISCONNECTED`. Nothing was marked `AUTH_REQUIRED` and no session needed re-pairing.

### 9.3 Finding 12 / F-15 — live proof of session-scoped idempotency

A throwaway user and session were created, the **real** ingestion route
(`POST /api/internal/gateway/events`, authenticated with `GATEWAY_TOKEN`) was called over HTTP
with an `externalId` that already existed on another session's message, and everything the probe
created was then deleted. Result:

```
collision id ACA03B222DAF3491F10D07FEBDC6DBFD belongs to session cmuleeq0r001xj8hnlrghrl4h
PASS  ingestion accepts the event — http 200
PASS  foreign externalId does not suppress the row — rows=1
PASS  ingestion accepts the replay — http 200
PASS  same-session replay stays idempotent — rows=1
PASS  messagesReceived incremented once — messagesReceived=1
PASS  cleanup removed the probe user — remaining=0
final DB: users=8 sessions=6
```

The second and fourth lines are the point: before the fix the same event would have been treated
as a duplicate (no row created) because *another account* had already seen that message id. The
fifth line confirms the fix did not weaken idempotency — a genuine replay is still swallowed, so
the counter cannot be inflated by the gateway's at-least-once delivery.

### 9.4 Version-control baseline

`git init -b main` plus one commit (`chore: baseline the audited tree under version control`)
now records the deployed, audited state — 237 tracked files. `.env`, `prisma/dev.db` and
`storage/` are excluded by the existing `.gitignore`; a check of the staged set for
`.env`/`storage/`/`.db`/`.log`/secret-looking paths returned `.env.example` only, which holds
placeholders. The working tree is clean, so every subsequent edit has a rollback point.

### 9.5 Still outstanding (operator-owned, not code)

The items below are deployment/ops decisions rather than defects; nothing in the code needs to
change for them:

1. **SMTP** is unconfigured, so verification and reset mail only reaches the outbox. Intentional, but users cannot self-serve those flows until it is set.
2. **`DEV_AUTH_LINKS` must stay unset/`0`** anywhere reachable from the internet (already the case here).
3. **Proxy termination** — keep the app behind Cloudflare/nginx and never expose the port directly, or `clientIp()` trust (§8.4-1) degrades the per-IP limiter (the per-account limiter and account lockout still hold).
4. **`NODE_ENV=production`** in a real deployment (secure cookies, HSTS, error floor).
5. **Redis** for the rate-limit store and SSE hub before scaling past one replica (§8.4-5).
6. **An unrelated process is crash-looping on this host:** pm2 app `bot-fixred` (`/root/fixred/index.js`) has ~1 170 restarts and burns ~250 MB while restarting. It is not part of this project, so it was left untouched — but on a 4 GB box with no swap it competes with the web build.

### 9.6 Project layout — the bot engine now lives inside the repository

The engine was installed at `/root/swhd/Qiroai`, a path unrelated to the panel, so the platform
was split across two trees with no shared backup or version history. It has been relocated to
`/root/webbot/qiro-engine/`, i.e. one root for the whole platform.

- **What moved:** the engine folder only. Its size is 698 MB, of which 559 MB is `node_modules`; the versioned source is ~9.4 MB.
- **Config:** `QIRO_ENGINE_DIR` now points at `/root/webbot/qiro-engine` in `.env` and `.env.example`; the stale path in the `lib/engine/types.ts` doc comment was corrected. Nothing else referenced the old location — no pm2 app, systemd unit or cron entry — and per-session state was already inside the panel (`storage/qiro-state/<key>/`).
- **Runtime stays out of git:** `qiro-engine/{data,sessions,storage,tmp,bin}/` and the engine's generated `lib/gist/{hasil,tmp}` output are gitignored (see `.gitignore`). That matters for more than repo size: `qiro-engine/data/` is where the bot keeps its caches **and an API-key file**, so ignoring it is what keeps a credential out of the history.
- **Verification after the move:** `tsc --noEmit` exit 0; both services restarted; `readlink /proc/<pid>/cwd` on the engine processes resolves to `/root/webbot/qiro-engine`; the web's restore pass reported `diperiksa=2 dipulihkan=2 perlu-taut-ulang=0`; the gateway reports `activeSessions: 2`; and the database still shows the same 8 users / 6 sessions with `danz nano` and `NEKO STORE` `CONNECTED`. No session needed re-pairing, so no credential was disturbed by the move.
- **Report note:** the `/root/swhd/Qiroai` strings in §3 (Findings 5–6), §5 and §7 are the path as it was at the time of those findings; the redaction fixes themselves are independent of the location. The old parent directory (`/root/swhd`) was empty afterwards and has been removed.

### 9.7 Rename — Qiro → Nano (same session)

Everything the product called "Qiro" is now "Nano". Because the name was not only display text but part of the *contract between three processes*, the rename is listed here with the parts that had to move together:

- **Display/brand:** `QIRO GATEWAY` → `NANO GATEWAY` in metadata, page titles, mail subjects/templates and UI copy (~42 sites), plus the engine's own branding (`Qiro Ai` → `Nano Ai`, ~814 lines) and the terminal banner.
- **Code identifiers:** `QiroOverview`, `qiroClient`, `getQiroOverview`, `QiroBotSettingOp`, … → `Nano*`; files/directories renamed (`lib/engine/nano.ts`, `lib/services/nano-service.ts`, `gateway/drivers/nano-process.ts`, `gateway/nano/`, `gateway/nano-engine/`, `app/api/nano/`, `components/nano/`, `scripts/nano-doctor.ts`, `scripts/install-nano-bridge.ts`, `deploy/cloudflare-nano-gateway.*`).
- **Cross-process contract (must agree on all three sides, or the bots break):** env var names `QIRO_ENGINE_DIR`/`QIRO_SESSION_DIR`/`QIRO_DATA_DIR`/`QIRO_GATEWAY_BRIDGE_DIR`/`QIRO_LOG`/`QIRO_QR` → `NANO_*`; the bridge hook marker `QIRO GATEWAY BRIDGE HOOK` in `index.js`, the installer and the gateway's `patched` detection; the driver discriminator `qiro-process` → `nano-process` (also stored in the database: 6 session rows migrated); the engine folder `qiro-engine/` → `nano-engine/`; the per-session state root `storage/qiro-state/` → `storage/nano-state/`; and the per-session database file `qiro.sqlite` → `nano.sqlite`, renamed **on disk** in every session's `data/database/` so no bot lost its settings.
- **Deliberately NOT renamed — the three secret *values* in `.env`.** `AUTH_SECRET`, `ENCRYPTION_KEY` and `GATEWAY_TOKEN` keep their original strings. A blanket find/replace had rewritten them, which would have invalidated every peppered session-token hash (all users logged out, API keys dead) and made existing AES-256-GCM ciphertext — the sealed TOTP secrets — permanently undecryptable. The values were restored before any process started with the new ones, so nothing was lost. **Rotating a secret is a migration, never a rename.**
- **Stored data:** the `Plan.features` bullet now reads "Pengelolaan bot Nano lengkap"; 13 queued `Outbox` mails had their subject/body brand text updated. Chat history (`Message`), activity logs and notifications were left untouched — they are historical records, not configuration.
- **Credits:** the engine's credit block (180 files) and `CREDITS.md`/`README.md`/`package.json` now credit **Danz nano & Awang Ofc** instead of dropping the original author.
- **Verification:** `tsc --noEmit` exit 0; production build succeeds; `nano-doctor` reports the engine usable with the bridge injected; both services restarted and the gateway logs `NANO GATEWAY engine listening` with `driver: nano-process`; the restore pass reconnected the two `autoReconnect` sessions (`perlu-taut-ulang=0`), i.e. the credential moves were transparent; database still 8 users / 6 sessions with the same 2 connected.
- **Report note:** sections 1–9.6 above keep the names as they were at the time of each finding — that is the honest record of what was found and fixed, and the fixes are independent of the branding.

**Not renamed (outside this repository):** the installed systemd unit and its Cloudflare tunnel config still use the old file names (`cloudflared-qiro-gateway.service`, `/etc/cloudflared/qiro-gateway.yml`). They point at a hostname and a local port, so nothing is broken — but a future re-install from `deploy/` will use the new `nano` names, and the tunnel's live config would need the same edit if the names are to match. **→ resolved in §10.6.**

---

## 10. Round 4 — secret rotation, tunnel rename, and a brand guard (29 September 2026)

### 10.1 Why the three secrets were rotated

§9.7 deliberately left the *values* of `AUTH_SECRET`, `ENCRYPTION_KEY` and `GATEWAY_TOKEN` alone, because renaming a secret is not a rename — it is a migration with data loss attached. That left three long-lived development defaults in `.env` (`qiro-gateway-dev-*`, `qiro-gateway-local-*`), one of which still carried the pre-rename brand: a fair signal that they dated from before the audit and had never been changed. They were never committed — `.env` is gitignored and only `.env.example` is tracked — so this is not a leak that needs incident handling; it is hygiene that had been deferred once and should not be deferred twice.

Each secret has a different cost, so each was handled differently. That asymmetry is the whole lesson of this section.

### 10.2 `ENCRYPTION_KEY` — rotation *with* a migration (new code)

Rotating this one naively makes every stored ciphertext permanently unreadable, so the rotation is a two-stage move instead of an edit:

- `lib/security/crypto.ts` now understands `ENCRYPTION_KEY_OLD`. `decryptSecret()` tries the current key first and falls back to the retired one, so the running app keeps working across the change; `isSealedWithCurrentKey()` reports whether a payload has already been moved to the new key.
- `scripts/rotate-encryption-key.ts` re-seals every stored payload under the new key. It is dry-run-able (`--dry-run`) and idempotent (already-current rows are skipped), so it can be interrupted and re-run.
- The procedure is written into `.env.example` next to the variable, including the step that is easy to forget: *remove `ENCRYPTION_KEY_OLD` afterwards*, otherwise the retired key stays in play forever.

**Blast radius, established before writing anything:** the only value sealed at rest is `User.twoFactorSecret`. `encryptSecret` has exactly one consumer (`lib/security/totp.ts`, reached only from `app/api/auth/2fa/route.ts`). No engine credential or session secret is encrypted at rest, despite what the module docstring once implied.

**Evidence.** The live database had **0** two-factor secrets, so the real rotation migrated nothing — which is not a proof. The migration path was therefore exercised against a synthetic row:

```
seed   isSealedWithCurrentKey = false      (payload sealed with the retired key)
seed   decryptSecret          = JBSWY3DPEHPK3PXP   (recovered via ENCRYPTION_KEY_OLD)
migrate  ✓ re-sealed rotate-probe@nanogateway.local   (1 of 1)
verify isSealedWithCurrentKey = true       (with ENCRYPTION_KEY_OLD deleted)
verify decryptSecret          = JBSWY3DPEHPK3PXP   PASS
already-current row skipped → re-run reports 0 of 0
```

The probe user was deleted afterwards. `ENCRYPTION_KEY_OLD` has been removed from `.env`: nothing needs it any more.

### 10.3 `AUTH_SECRET` — rotation is a mass logout, not a migration

`hmac(AUTH_SECRET)` peppers `LoginSession.tokenHash`, `VerificationToken.tokenHash` and `ApiKey.keyHash`, and CSRF tokens are `HMAC(AUTH_SECRET)` over the session id. The raw values are never stored, so there is nothing to re-derive: every hash dies the instant the pepper changes. There is no `AUTH_SECRET_OLD` equivalent, and there cannot be one.

So the invalidated rows were removed deliberately rather than left to fail one at a time at 401:

| Table | Rows removed | Effect |
|---|---|---|
| `LoginSession` | 33 | every browser session signed out — users must log in again |
| `VerificationToken` | 9 | pending email-verify / password-reset links dead (they were unrecoverable anyway) |
| `ApiKey` | 0 | none existed; any future key must be re-issued after a rotation |

`.env.example` now documents this as an explicit *step* of rotating the value, so the next operator does not learn it from a queue of support messages.

**Corrected while here:** the schema described these columns as `sha256 of …`. They are HMAC-SHA256 keyed by `AUTH_SECRET` — the comments were wrong, and the distinction is precisely why a rotation cannot preserve them. All three comments now say so.

### 10.4 `GATEWAY_TOKEN` — coordinated restart only

This is the cheap one. Both processes read it at boot (`lib/engine/client.ts` sends `x-gateway-token`; `gateway/config.ts` reads it; `app/api/internal/gateway/events/route.ts` compares constant-time), no stored state depends on it, so replacing the value and restarting both processes loses nothing. Order used: gateway first, then web.

**Evidence — the retired token is genuinely dead:**

```
GET /sessions   new token  → 200
GET /sessions   old token  → 401
GET /sessions   no token   → 401
```

`/health` is an unauthenticated liveness probe by design (loopback-only, and still redacted per §9.1) — it answers 200 either way and is deliberately not used as rotation evidence.

The *web* side of the pair was proven by the boot-time restore, which goes through the token-authenticated `engineClient`: `[restore] diperiksa=2 dipulihkan=2 perlu-taut-ulang=0 gagal=0`. A stale token in the web process would have surfaced as `gagal` counts, not as a clean restore.

### 10.5 Brand regression guard (new)

A rename rots the moment someone pastes from an old branch, so the rename is now enforced rather than documented:

- `scripts/check-branding.ts`, exposed as `npm run check:branding` and wired into `prebuild`, so `npm run build` cannot ship a regression.
- Coverage is *every file git would commit* (`ls-files --cached --others --exclude-standard`), which includes new untracked source and `.env.example`, and excludes anything gitignored (so `.env` and the engine's runtime data are out of scope by construction).
- Two false-positive classes are handled explicitly: binary files are skipped, and lines longer than 1000 characters are skipped — a vendored base64 sprite happens to contain the string `qiro` by chance, twice.
- Two files are allowlisted **with a stated reason**, which is the only kind of entry permitted: this report (a dated record) and the guard itself (it has to spell the tokens out to search for them).
- Both directions were verified: pass on the clean tree (716 files scanned), and exit 1 naming `scripts/tmp-brand-probe.ts:2` when a probe reintroduced the token.

**Last `qg` leftovers renamed in the same pass:** the API-key prefix (`qg_` → `ng_`) and the cookies (`qg_session`/`qg_csrf` → `ng_session`/`ng_csrf`). This was safe precisely now and not earlier: `ApiKey` was empty, and the `AUTH_SECRET` rotation above had already signed every session out, so no cookie outlived its name. The guard watches for the `qg_` form as well as `qiro`.

### 10.6 Tunnel and unit rename (operator actions, outside the repository)

The two installed files still carried the old name, and the in-repo `deploy/` templates had already been renamed — meaning a re-install would silently produce two different names for one tunnel. Resolved by installing from the templates and then retiring the originals:

1. Install `deploy/cloudflared-nano-gateway.{service,yml}` as `/etc/systemd/system/cloudflared-nano-gateway.service` and `/etc/cloudflared/nano-gateway.yml`; `daemon-reload`. Nothing changes yet — the old unit is still the running one.
2. `systemctl disable --now cloudflared-qiro-gateway`, then `systemctl enable --now cloudflared-nano-gateway`. The old connector is stopped *first* on purpose: both configs name the **same tunnel UUID** with the same credentials file, and two connectors for one tunnel should not be brought up by hand. A failed start rolls back to the old unit.
3. Only once the replacement reported `active` were `/etc/systemd/system/cloudflared-qiro-gateway.service` and `/etc/cloudflared/qiro-gateway.yml` deleted. Backups are kept in `/tmp/tunnel-backup-<timestamp>/`.

Before the swap the two installed files were diffed against the templates: the only differences were the name, the `Description`, and the `--config` path. The tunnel UUID, credentials file, hostname and ingress (`http://127.0.0.1:3005`) were already identical.

**Evidence:** unit `enabled` + `active`; no `qiro` match anywhere under `/etc/systemd/system` or `/etc/cloudflared`; the live connector runs with `--config /etc/cloudflared/nano-gateway.yml`; and `https://wagetway.danznanooffc.my.id/login` returned **200** both before and after.

### 10.7 Verification run log (this round)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npx next build --turbopack` | exit 0 (webpack still OOMs on this 4 GB box; built with the web process stopped) |
| `npm run check:branding` | pass over 716 files; exit 1 on a seeded regression; clean after removal |
| encryption rotation, migrated path | old-key payload re-sealed, decrypts with `ENCRYPTION_KEY_OLD` deleted → PASS |
| `rotate-encryption-key.ts` re-run | `0 of 0` — idempotent |
| gateway `GET /sessions` | 200 new token / 401 retired token / 401 none |
| web login page | 200 |
| session restore | `diperiksa=2 dipulihkan=2 perlu-taut-ulang=0 gagal=0` |
| session states | both `CONNECTED`, driver `nano-process`, no QR needed |
| `nano-doctor` | "✓ Engine looks usable" |
| public tunnel endpoint | 200 through Cloudflare |
| data after the rotation | 8 users / 6 WhatsApp sessions — unchanged |

### 10.8 Residual risk / notes from this round

- **The `AUTH_SECRET` rotation signed everyone out.** That is the intended, unavoidable consequence — not a defect. It is now written down in `.env.example` so it is a known cost rather than a surprise.
- **`ENCRYPTION_KEY_OLD` is a temporary state, not a supported configuration.** It exists to make the rotation survivable; leaving it set indefinitely keeps a retired key in the decryption path. The script prints a reminder, and `.env.example` says so, but nothing enforces removal.
- **The guard is a build-time check, not a runtime control.** It has no CI runner here (none is configured) — it bites through `npm run build`, which is how this box deploys. A direct `next build` bypasses it.
- **`/health` on the gateway is intentionally unauthenticated**, which is why it cannot be used as rotation evidence. It stays loopback-only and redacted; re-confirmed this round.
- **Not addressed, unchanged from §9.5:** the unrelated pm2 app that is crash-looping on the same host is a memory-pressure risk to these processes and remains outside this audit's scope.

---

## 11. Round 5 — media, avatars and link previews (29 September 2026)

### 11.1 The brand guard found its own blind spot

§10.5 introduced the guard and reported it green over 716 files. **It was wrong.** Two spellings of the old name survived it:

- **Box art, 189 files.** Every engine module opens with a comment banner whose last line spells the name with separators between the letters — `--Q--i--R--O------A--i-----`. A substring search for `qiro` cannot match that, because the letters are never adjacent.
- **The startup banner, `tampilan/banner.js`.** `fit('  Q I R O  A I')` — the string every bot prints on boot, spelled with spaces.

The guard now also compares each line **with every non-alphanumeric character stripped**, so separated spellings collapse back into the token. Only the name is checked that way: the `qg_` prefix contains the underscore the collapse would delete, so it stays a plain match.

All 189 box-art files plus `banner.js` were rewritten (same width, so the art stays aligned). A scripted rewrite of 189 files is exactly the kind of change that can hide an accidental extra edit, so every modified file was diffed individually: all but four differ by the banner line and nothing else. The four are the two plugin thumbnail paths, `banner.js`, and the bridge (§11.2). `nano-engine/tampilan/banner.js` now renders `N A N O A I`, verified by executing it.

**The lesson is the point of this subsection.** The first version of the guard certified a tree that still said Qiro. A check that only recognises the shape you thought of cannot find the shape you did not — and reporting success on 716 files made the mistake look like evidence.

### 11.2 Bot avatars in the panel (new)

Each bot now shows its real WhatsApp avatar in the panel instead of initials. `profilePicUrl` had been hardcoded to `null` in the `nano-process` driver, because the gateway does not own the socket — the bot process does, and only it can ask WhatsApp.

- **Mechanism:** `gateway/nano-engine/gateway-bridge.js` publishes `identity.json` next to its other files (jid, phone number, profile name, avatar URL) and the driver reads it on the journal tick, re-parsing only when the mtime moves. The file is written to a temp path and renamed, so a poll can never read it half-written.
- **Disclosure:** the panel now stores and renders a WhatsApp CDN URL and the account's profile name. The image is loaded from `pps.whatsapp.net`, which the CSP already allows (§Finding 7's `img-src`). Nothing new leaves the host — this is the same picture WhatsApp shows to anyone who has the number.
- **Two defensive details worth keeping:** a LID account (`…@lid`) identifies a device rather than a number, so it publishes no number and cannot overwrite one the pairing flow established; and the identity event only fires while the session is `CONNECTED`, because a `session.status` event carries a status with it and the panel anchors uptime to the first `CONNECTED` — emitting a stale status would silently reset that timer.
- **Evidence:** the bridge published `{"name":"Neko","profilePicUrl":"https://pps.whatsapp.net/…"}` for the connected NEKO STORE bot and a `null` avatar for the other connected bot, which genuinely has no picture set. Both reached the database. Every failure path in the publisher is swallowed — a missing picture is normal, not an error.

### 11.3 Per-bot link preview cards (new)

A `/dashboard/sessions/<id>` link previously previewed with a generic brand card. It now renders a card made from that session's own row: the bot's name, its status, and the masked number.

**The disclosure, stated plainly:** this route is fetched **without a session**, because crawlers cannot authenticate — a crawler that follows the link sees the login page, so the card is the only thing it can be given. What it renders is bounded deliberately:

| Shown | Withheld |
|---|---|
| bot display name, session status | the full phone number — masked to country code and last four digits (`+62 •••• 7037`) |
| the public origin it came from | the owner, message counts, groups, and everything else on the session |

The session id is an unguessable cuid, and that is the **only** thing standing between a link holder and the card. That is the same property that makes the link shareable at all; if an id ever leaks, the bot's name and status leak with it. Anyone who needs that closed should not share session links, and the card is the thing to remove first.

The page title was also made per-bot for requests with no session, so the preview's text and image agree. Requests *with* a session still only ever resolve the caller's own row — the ownership check was not weakened, it was given an unauthenticated branch that matches what the image already discloses.

### 11.4 Not security — recorded because the report is the change log

- **All five menu commands now share one thumbnail.** `.menu`, `.allmenu` and `.kategori` already used `assets/image/awang.jpg`; `.peraturan` and `.donasi` pointed at their own files, which were replaced with the shared asset and then deleted (≈1.4 MB of duplicate images gone). `.donasi qris` still sends `qris.jpg` — that is a payment code, not decoration, and was deliberately left alone.
- **A dangling symlink fixed.** `nano-engine/lib/gist/bin/ffmpeg` is a tracked symlink that pointed into `/root/swhd/Qiroai`, a directory deleted in §9.6 — so the committed revision pointed nowhere. It now resolves into the repository's own `node_modules`, which is what the working tree had already been changed to.
- **Remaining `/root/swhd` references** are all in gitignored runtime artifacts (`bot.log`, `lib/gist/uji.log`, `lib/gist/hasil-uji.json`, `lib/gist/tmp/…`) plus this report, which keeps old paths deliberately as the record of what was found.
