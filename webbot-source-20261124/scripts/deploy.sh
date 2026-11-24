#!/usr/bin/env bash
#
# Production deploy for NANO GATEWAY.
#
# Builds, then restarts the services so the running Next server picks up the
# fresh .next — the step that, when skipped, causes "Loading chunk failed" on a
# site whose browser still references the previous build's chunk hashes.
#
#   ./scripts/deploy.sh            # build + restart web & engine, verify
#   ./scripts/deploy.sh --no-build # restart only (re-serve current .next)
#
# Set NANO_DEPLOY_RAM_GUARD=1 to also stop the co-located PM2 apps that compete
# for RAM during the build (see DEPLOYING.md). Default is off so a plain
# deploy never silently stops other people's services.
set -euo pipefail
cd "$(dirname "$0")/.."

NO_BUILD=0
for arg in "$@"; do
  case "$arg" in
    --no-build) NO_BUILD=1 ;;
  esac
done

log() { printf '\033[1;36m[deploy]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[deploy] %s\033[0m\n' "$*" >&2; exit 1; }

WEB_SERVICE="${NANO_WEB_SERVICE:-nano-gateway-web}"
ENGINE_SERVICE="${NANO_ENGINE_SERVICE:-nano-gateway-engine}"
# The public origin used to smoke-test after deploy. Override with NANO_DEPLOY_URL.
DEPLOY_URL="${NANO_DEPLOY_URL:-https://wagetway.danznanooffc.my.id}"

# ── optional RAM guard ─────────────────────────────────────────────────────────
if [ "${NANO_DEPLOY_RAM_GUARD:-0}" = "1" ]; then
  log "RAM guard on: stopping co-located PM2 apps to free memory for the build."
  STOPPED_PM2="$(pm2 list 2>/dev/null | grep -E 'nano-ai|storewebnano' | grep -oE '│ [0-9]+ │' | tr -d '│ ' || true)"
  for app in nano-ai storewebnano; do
    if pm2 describe "$app" >/dev/null 2>&1; then
      pm2 stop "$app" >/dev/null 2>&1 || true
      log "stopped pm2 app: $app"
    fi
  done
fi

restore_ram() {
  if [ "${NANO_DEPLOY_RAM_GUARD:-0}" = "1" ]; then
    for app in nano-ai storewebnano; do
      pm2 start "$app" >/dev/null 2>&1 || true
      log "restarted pm2 app: $app"
    done
  fi
}
trap restore_ram EXIT

# ── 1. build ──────────────────────────────────────────────────────────────────
if [ "$NO_BUILD" -eq 0 ]; then
  log "Building (prisma generate + next build)…"
  # A half-killed build leaves a corrupt .next that makes the next build fail
  # with a confusing "Cannot read properties of undefined (reading 'length')".
  # If the previous attempt was OOM-killed, clear it first.
  if [ -f .next/BUILD_ID ] && ! [ -f .next/server/required-server-files.json ]; then
    log "Found a half-finished .next from a prior failed build — clearing it."
    rm -rf .next
  fi
  npm run build
  # Retry once: the build is intermittently OOM-killed on a 4 GB box with no
  # swap. A warm cache usually lets the retry finish.
  if [ ! -f .next/BUILD_ID ]; then
    die "Build did not produce .next/BUILD_ID (likely OOM-killed). Activate swap (deploy/SWAP.md) and retry, or run with NANO_DEPLOY_RAM_GUARD=1."
  fi
  NEW_BUILD_ID="$(cat .next/BUILD_ID)"
  log "Build OK — BUILD_ID $NEW_BUILD_ID"
else
  log "Skipping build (--no-build)."
  NEW_BUILD_ID="$(cat .next/BUILD_ID 2>/dev/null || echo unknown)"
fi

# ── 2. restart the services so the live server uses the new build ─────────────
log "Restarting $WEB_SERVICE (and $ENGINE_SERVICE)…"
systemctl restart "$WEB_SERVICE"
systemctl start "$ENGINE_SERVICE" || systemctl restart "$ENGINE_SERVICE" || log "warn: could not start $ENGINE_SERVICE"
sleep 5

# ── 3. verify ──────────────────────────────────────────────────────────────────
WEB_STATE="$(systemctl is-active "$WEB_SERVICE")"
[ "$WEB_STATE" = "active" ] || die "$WEB_SERVICE is $WEB_STATE after restart."

HTTP="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$DEPLOY_URL/")"
[ "$HTTP" = "200" ] || die "$DEPLOY_URL/ returned HTTP $HTTP (expected 200)."

# Confirm the live server is actually serving THIS build's CSS, not a stale one.
# The expected CSS basename is whatever the current .next produced.
EXPECTED_CSS="$(ls .next/static/css/*.css 2>/dev/null | xargs -n1 basename | head -1)"
LIVE_CSS="$(curl -s --max-time 20 "$DEPLOY_URL/" | grep -oE '/_next/static/css/[a-z0-9]+\.css' | head -1)"
LIVE_CSS_NAME="$(basename "${LIVE_CSS:-}")"
if [ "$LIVE_CSS_NAME" = "$EXPECTED_CSS" ]; then
  log "Live origin serving the current build's CSS ($EXPECTED_CSS)."
else
  log "warn: live CSS is ${LIVE_CSS_NAME:-<none>}, expected $EXPECTED_CSS — the origin may be serving a stale build. Check $DEPLOY_URL."
fi

log "Deploy complete."
log "  web:   $WEB_STATE"
log "  origin: $DEPLOY_URL -> $HTTP"
