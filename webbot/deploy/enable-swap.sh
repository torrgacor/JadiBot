#!/usr/bin/env bash
#
# Enable a 2 GB swap file for the NANO GATEWAY VPS.
#
# This must run on the HOST (not inside the web container/cgroup, which blocks
# the `swapon` syscall even with CAP_SYS_ADMIN). Run it from the host console
# (SSH to the VPS, `sudo bash enable-swap.sh`).
#
# It is idempotent: safe to re-run.
set -euo pipefail

SWAP_FILE="/swapfile"
SIZE_MB=2048

need_root() {
  [ "$(id -u)" = "0" ] || { echo "Run as root: sudo bash $0" >&2; exit 1; }
}

need_root

if swapon --show 2>/dev/null | grep -qF "$SWAP_FILE"; then
  echo "Swap file $SWAP_FILE is already active. Nothing to do."
  exit 0
fi

# Create the backing file if it is not already there.
if [ ! -f "$SWAP_FILE" ]; then
  echo "Creating ${SIZE_MB} MB swap file at $SWAP_FILE …"
  fallocate -l "${SIZE_MB}M" "$SWAP_FILE" 2>/dev/null || \
    dd if=/dev/zero of="$SWAP_FILE" bs=1M count="$SIZE_MB" status=none
  chmod 600 "$SWAP_FILE"
  mkswap "$SWAP_FILE"
fi

echo "Activating swap …"
swapon "$SWAP_FILE"

# Persist across reboots.
if ! grep -qxF "$SWAP_FILE none swap sw 0 0" /etc/fstab; then
  echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab
  echo "Added $SWAP_FILE to /etc/fstab."
fi

# Prefer RAM first; only swap when memory is genuinely tight.
sysctl vm.swappiness=10 2>/dev/null || true
grep -qxF "vm.swappiness=10" /etc/sysctl.d/99-swappiness.conf 2>/dev/null || \
  echo "vm.swappiness=10" > /etc/sysctl.d/99-swappiness.conf 2>/dev/null || true

echo
echo "Swap enabled:"
free -h | sed -n '1,2p'
