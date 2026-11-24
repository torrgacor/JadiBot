#!/usr/bin/env bash
set -euo pipefail
# nano-health.sh — probe web + gateway reachability (for cron/SYSTEMD).
# Exit non-zero when an endpoint is unreachable or returns non-OK.
# Returns immediately on first failure so upstream alerters don't get noisy repeats.

WEB_PORT="${WEB_PORT:-3005}"
GW_PORT="${GW_PORT:-4001}"
TIMEOUT_SEC=5

check() {
  local label=$1 url=$2 want=$3
  local code body
  code=$(curl -sS -o /tmp/nano-health-body --connect-timeout "$TIMEOUT_SEC" --max-time 10 -w '%{http_code}' "$url") || {
    echo "FAIL $label reachable (curl error)"; return 1
  }
  if [[ "$code" != "$want" ]]; then
    body=$(cat /tmp/nano-health-body 2>/dev/null | head -c 200)
    echo "FAIL $label status=$code want=$want body='$body'"
    return 1
  fi
  echo "OK   $label http=$code"
}

rc=0
check "web:$WEB_PORT"        "http://127.0.0.1:${WEB_PORT}/"              "200" || rc=1
check "gw:$GW_PORT health"   "http://127.0.0.1:${GW_PORT}/health"         "200" || rc=1

if [[ $rc -ne 0 ]]; then
  echo "# ALERT: origin down"
  exit 2
fi
exit 0
