#!/usr/bin/env bash
# Start the local MongoDB that nano-gateway uses. Idempotent: safe to re-run.
# Data lives in /opt/mongo-data; the binary in /opt/mongo-dl.
set -euo pipefail

MONGOD=/opt/mongo-dl/mongodb-linux-x86_64-ubuntu2204-7.0.14/bin/mongod
DBPATH=/opt/mongo-data
LOGPATH=/opt/mongo-logs

mkdir -p "$DBPATH" "$(dirname "$LOGPATH")"

if pgrep -x mongod >/dev/null 2>&1; then
  echo "mongod already running (pid $(pgrep -x mongod | tr '\n' ' '))"
  exit 0
fi

"$MONGOD" --dbpath "$DBPATH" --logpath "$LOGPATH/mongod.log" \
  --bind_ip 127.0.0.1 --port 27017 --fork
echo "mongod started on 127.0.0.1:27017"
