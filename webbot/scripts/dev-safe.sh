#!/usr/bin/env bash
# Safe dev wrapper: keeps `next dev` from clobbering the production .next build.
#
# How it works:
#   1. If .next/BUILD_ID exists (a production build is present), rename it to
#      .next-prod so `next dev` can write to .next without touching prod files.
#   2. Run `next dev` with the remaining args (NOT via exec, so the trap fires).
#   3. On exit, if .next-prod exists and .next has no BUILD_ID, restore it.
#
# Usage:
#   ./scripts/dev-safe.sh            # plain dev
#   ./scripts/dev-safe.sh -p 3200    # dev on port 3200
set -uo pipefail
cd "$(dirname "$0")/.."

NEXT_DIR=".next"
PROD_DIR=".next-prod"

if [ -f "$NEXT_DIR/BUILD_ID" ]; then
  echo "[dev-safe] Production build detected. Preserving it in $PROD_DIR…"
  if [ -d "$PROD_DIR" ]; then
    rm -rf "$PROD_DIR"
  fi
  mv "$NEXT_DIR" "$PROD_DIR"
  mkdir -p "$NEXT_DIR"
fi

cleanup() {
  # Only restore if we actually moved a prod build aside
  [ -d "$PROD_DIR" ] || return
  if [ ! -f "$NEXT_DIR/BUILD_ID" ]; then
    echo "[dev-safe] Restoring production build from $PROD_DIR…"
    rm -rf "$NEXT_DIR"
    mv "$PROD_DIR" "$NEXT_DIR"
  else
    echo "[dev-safe] New build present; discarding old prod backup."
    rm -rf "$PROD_DIR"
  fi
}
trap cleanup EXIT INT TERM

echo "[dev-safe] Running next dev with isolated .next…"
# Run next dev as a child (not exec) so the trap fires on exit/signal.
npx next dev "$@"
exit_code=$?
exit $exit_code
