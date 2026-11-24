#!/usr/bin/env bash
set -euo pipefail
# nano-backup.sh — point-in-time backup of all critical bot state + DB.
# Usage:
#   cron 0 3 * * * /root/webbot/scripts/ops/nano-backup.sh
#   KEEP_DAYS=14 bash scripts/ops/nano-backup.sh
#   DRY_RUN=1 bash scripts/ops/nano-backup.sh
# Outputs: <root>/backups/YYYYMMDD-HHMMSS.tar.gz (db + sessions + config)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_ROOT="$ROOT_DIR/backups"
KEEP_DAYS="${KEEP_DAYS:-14}"
DRY_RUN="${DRY_RUN:-}"

stamp() { date '+%Y%m%d-%H%M%S'; }
log() { printf '[backup] %s\n' "$*"; }

mkdir -p "$BACKUP_ROOT"
tag="$(stamp)"
srcdir="/tmp/nano-backup-$tag"
trap 'rm -rf "$srcdir"' EXIT
mkdir -p "$srcdir"

# 1) Database
db="$ROOT_DIR/prisma/dev.db"
if [[ -f "$db" ]]; then
  cp -a "$db" "$srcdir/dev.db"
  log "DB copied: $(du -h "$srcdir/dev.db" | cut -f1)"
else
  log "no database at $db — skipping DB"
fi

# 2) Per-bot session state (auth credentials + bot SQLite)
sessions_dir="$ROOT_DIR/storage/nano-state"
if [[ -d "$sessions_dir" ]]; then
  mkdir -p "$srcdir/sessions"
  cp -a "$sessions_dir"/. "$srcdir/sessions/" 2>/dev/null || true
  count="$(find "$srcdir/sessions" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')"
  log "Sessions backed up: $count bots"
else
  log "sessions dir absent: $sessions_dir"
fi

# 3) Config patch backup (safety net — originals before edits)
if [[ -d "$ROOT_DIR/nano-engine/.gateway-patch-backup" ]]; then
  mkdir -p "$srcdir/config-backup"
  cp -a "$ROOT_DIR/nano-engine/.gateway-patch-backup"/. "$srcdir/config-backup/" 2>/dev/null || true
  log "Config patch-backup included"
fi

tar="$BACKUP_ROOT/$tag.tar.gz"
if [[ -n "$DRY_RUN" ]]; then
  log "dry-run — tar $tar not written"
  exit 0
fi

tar -czf "$tar" -C "$srcdir" .
sz="$(du -h "$tar" | cut -f1)"
log "Saved $tar ($sz)"

# Rotate old backups
find "$BACKUP_ROOT" -maxdepth 1 -type f -name '*.tar.gz' -mtime "+$KEEP_DAYS" -delete 2>/dev/null || true
log "Retention: <=${KEEP_DAYS}d"
