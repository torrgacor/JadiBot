# Swap for build OOM protection

This VPS has 4 GB RAM and no swap. `next build` peaks at ~2.5 GB and OOMs
randomly when co-located processes (PM2 `nano-ai`/`storewebnano`, other
projects) are active. An OOM-killed build leaves a corrupt `.next`, and the
*next* build then fails with a misleading
`Cannot read properties of undefined (reading 'length')`.

## Enable on the host (one command)

The web container/cgroup blocks the `swapon` syscall (EPERM even with
CAP_SYS_ADMIN), so this must run on the **host**:

```bash
ssh <vps>
sudo bash deploy/enable-swap.sh      # copies: enable a 2 GB /swapfile + persist
```

The script is idempotent. After it runs, `next build` uses swap for the tail of
the compile and no longer OOMs. `deploy/deploy.sh` already detects a corrupt
`.next` and clears it before building.

## Why not inside the container

`swapon` requires the cgroup to allow it. This environment's cgroup returns
`Operation not permitted` for the syscall, so the swap file can be created but
not activated from here.

## Deploy without OOM (until swap is on)

`npm run deploy:ram` stops the co-located PM2 apps (`nano-ai`, `storewebnano`)
before the build to free RAM, then restarts them after. This is a stop-gap;
swap is the real fix.
