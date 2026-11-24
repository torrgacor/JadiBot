/**
 * Rate limiting.
 *
 * Ships with a process-local sliding-window limiter so the platform is safe by
 * default with zero infrastructure. The `RateLimitStore` interface is what the
 * rest of the app depends on, so a Redis implementation can be dropped in
 * without touching a single call site.
 *
 * ── REQUIRES REDIS FOR MULTI-INSTANCE ──────────────────────────────────────
 * This in-memory store is per-process. Behind a load balancer with N web
 * replicas, the effective limit becomes N× the configured value. Implement
 * `RateLimitStore` against Redis (`lib/security/rate-limit-redis.ts`) and swap
 * the export at the bottom of this file when scaling horizontally.
 */

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  /** Epoch ms when the window resets. */
  resetAt: number
  retryAfterSeconds: number
}

export interface RateLimitStore {
  hit(key: string, windowMs: number, limit: number): RateLimitResult | Promise<RateLimitResult>
  reset(key: string): void | Promise<void>
}

interface Bucket {
  count: number
  resetAt: number
}

class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, Bucket>()
  private lastSweep = Date.now()

  hit(key: string, windowMs: number, limit: number): RateLimitResult {
    const now = Date.now()
    this.sweep(now)

    let bucket = this.buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs }
      this.buckets.set(key, bucket)
    }

    bucket.count++

    const remaining = Math.max(0, limit - bucket.count)
    return {
      allowed: bucket.count <= limit,
      limit,
      remaining,
      resetAt: bucket.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  reset(key: string) {
    this.buckets.delete(key)
  }

  /** Drop expired buckets occasionally so the map cannot grow unbounded. */
  private sweep(now: number) {
    if (now - this.lastSweep < 60_000) return
    this.lastSweep = now
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key)
    }
  }
}

const store: RateLimitStore = new MemoryRateLimitStore()

/** Named policies, so limits are declared once and reused consistently. */
export const RATE_LIMITS = {
  /** Login / 2FA / password reset — brute force surface. */
  auth: { windowMs: 15 * 60_000, limit: 10 },
  /** Registration and other account-creating writes. */
  register: { windowMs: 60 * 60_000, limit: 5 },
  /** Sending an email (verification / reset) to a given address. */
  emailSend: { windowMs: 60 * 60_000, limit: 5 },
  /** Authenticated dashboard mutations. */
  mutation: { windowMs: 60_000, limit: 60 },
  /** Outbound WhatsApp sends — protects the user's number from a self-inflicted ban. */
  send: { windowMs: 60_000, limit: 30 },
  /** Public REST API, per API key. */
  api: { windowMs: 60_000, limit: 120 },
} as const

export type RateLimitPolicy = keyof typeof RATE_LIMITS

/**
 * Consume one unit for `key` under a named policy.
 *
 * `key` should identify the actor, e.g. `auth:login:ip:1.2.3.4` or
 * `api:key:<apiKeyId>` — including the policy in the key keeps separate limits
 * from colliding.
 *
 * Async because a Redis-backed store must be awaited; the in-memory store
 * simply resolves immediately.
 */
export async function rateLimit(
  policy: RateLimitPolicy,
  key: string
): Promise<RateLimitResult> {
  const { windowMs, limit } = RATE_LIMITS[policy]
  return store.hit(`${policy}:${key}`, windowMs, limit)
}

/** Clear a limiter after a successful action (e.g. correct password). */
export async function resetRateLimit(policy: RateLimitPolicy, key: string) {
  await store.reset(`${policy}:${key}`)
}

/**
 * Client IP used for rate limiting.
 *
 * Only headers that a *proxy we trust* sets may be believed. `X-Forwarded-For`
 * is client-controlled — a caller can send `X-Forwarded-For: 1.2.3.4` and, if we
 * read the first entry, every request looks like it came from a different IP,
 * which silently switches off every IP-based limit (login brute force being the
 * one that matters most).
 *
 * So the order is: `CF-Connecting-IP` (Cloudflare overwrites this at the edge,
 * so a spoofed value cannot survive), then `X-Real-IP`, and only then the *last*
 * hop of `X-Forwarded-For` — the entry appended by the proxy closest to us, not
 * the one the caller typed.
 */
export function clientIp(headers: Headers): string {
  const cf = headers.get('cf-connecting-ip')
  if (cf) return cf.trim()

  const real = headers.get('x-real-ip')
  if (real) return real.trim()

  // A chain of proxies: trust the right-most entry, since every earlier one was
  // supplied by a client somewhere upstream.
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const hops = forwarded
      .split(',')
      .map((hop) => hop.trim())
      .filter(Boolean)
    if (hops.length > 0) return hops[hops.length - 1]
  }

  return 'unknown'
}
