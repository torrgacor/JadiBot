import { cookies } from 'next/headers'
import type { User } from '@/lib/db'
import { db } from '@/lib/db'
import { generateToken, hmac } from '@/lib/security/crypto'
import { SESSION_COOKIE } from '@/lib/security/constants'

/**
 * Session management.
 *
 * Design decision: sessions are **database-backed opaque tokens**, not
 * self-contained JWTs. That costs one indexed lookup per request but buys the
 * things the product actually needs — "active sessions" listing, per-device
 * revocation, and instant invalidation on password change. A stateless JWT
 * cannot be revoked, which would make section 20's "revoke device" a lie.
 *
 * The raw token is never stored: only HMAC-SHA256(token) is persisted, so a
 * database leak does not hand over live sessions.
 */

/** Re-exported from the shared constants module so there is one definition. */
export { SESSION_COOKIE }

const REMEMBER_ME_DAYS = 30
const DEFAULT_DAYS = 1

/** Only refresh `lastActiveAt` if it is staler than this, to cut write load. */
const ACTIVITY_WRITE_INTERVAL_MS = 60_000

export interface SessionUser extends Omit<User, 'passwordHash' | 'twoFactorSecret' | 'twoFactorBackupCodes'> {
  hasTwoFactor: boolean
}

export interface AuthContext {
  user: User
  sessionId: string
  /** Raw token — needed to keep this session when revoking the others. */
  token: string
}

// ─────────────────────────────────────────────────────────── device ─────────

interface DeviceInfo {
  device: string
  browser: string
  os: string
}

/** Tiny UA parser — no need for a dependency to label a handful of browsers. */
export function parseUserAgent(userAgent: string | null | undefined): DeviceInfo {
  if (!userAgent) return { device: 'Perangkat tidak dikenal', browser: 'Tidak diketahui', os: 'Tidak diketahui' }

  const ua = userAgent.toLowerCase()

  const browsers: Array<[string, RegExp]> = [
    ['Edge', /edg[e/]/],
    ['Opera', /(opr\/|opera)/],
    ['Brave', /brave/],
    ['Chrome', /chrome|crios/],
    ['Firefox', /firefox|fxios/],
    ['Safari', /safari/],
  ]
  const browser = browsers.find(([, re]) => re.test(ua))?.[0] ?? 'Tidak diketahui'

  const systems: Array<[string, RegExp]> = [
    ['Windows', /windows/],
    ['macOS', /mac os x|macintosh/],
    ['Android', /android/],
    ['iOS', /iphone|ipad|ipod/],
    ['Linux', /linux/],
  ]
  const os = systems.find(([, re]) => re.test(ua))?.[0] ?? 'Tidak diketahui'

  const device = os === 'Tidak diketahui' ? 'Perangkat tidak dikenal' : `${browser} di ${os}`
  return { device, browser, os }
}

export function sessionCookieOptions(rememberMe: boolean, isProduction: boolean) {
  const maxAge = (rememberMe ? REMEMBER_ME_DAYS : DEFAULT_DAYS) * 24 * 60 * 60
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge,
  }
}

// ────────────────────────────────────────────────────── create / destroy ────

export async function createUserSession(options: {
  userId: string
  userAgent?: string | null
  ip?: string | null
  rememberMe?: boolean
}) {
  const { userId, userAgent, ip, rememberMe = false } = options

  const token = generateToken(32)
  const tokenHash = hmac(token)
  const days = rememberMe ? REMEMBER_ME_DAYS : DEFAULT_DAYS
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  const { device } = parseUserAgent(userAgent)

  const session = await db.loginSession.create({
    data: {
      userId,
      tokenHash,
      userAgent: userAgent ?? null,
      ip: ip ?? null,
      device,
      rememberMe,
      expiresAt,
    },
  })

  return { token, session, expiresAt }
}

/**
 * Resolve a raw cookie token to its session + user.
 *
 * Returns null for expired, revoked, suspended or deleted accounts so every
 * caller gets the same "not signed in" outcome.
 */
export async function validateSessionToken(
  token: string | undefined | null
): Promise<AuthContext | null> {
  if (!token) return null

  const session = await db.loginSession.findUnique({
    where: { tokenHash: hmac(token) },
    include: { user: true },
  })

  if (!session) return null
  if (session.revokedAt) return null
  // `expiresAt` is a required column, but guard anyway: a row that lost it
  // (partial migration / manual edit) is treated as invalid rather than
  // throwing a 500 on every request for that session.
  if (!session.expiresAt || session.expiresAt.getTime() <= Date.now()) return null
  if (!session.user || session.user.status !== 'ACTIVE') return null

  // Opportunistically extend activity, but not on every single request.
  const lastActive = session.lastActiveAt?.getTime()
  if (lastActive == null || Date.now() - lastActive > ACTIVITY_WRITE_INTERVAL_MS) {
    await db.loginSession
      .update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      })
      .catch(() => {
        // Activity tracking is best-effort; never fail a request over it.
      })
  }

  return { user: session.user!, sessionId: session.id, token }
}

export async function destroySessionByToken(token: string): Promise<void> {
  await db.loginSession
    .update({
      where: { tokenHash: hmac(token) },
      data: { revokedAt: new Date() },
    })
    .catch(() => {
      // Already gone — logging out twice is not an error.
    })
}

export async function revokeSession(userId: string, sessionId: string) {
  await db.loginSession.updateMany({
    where: { id: sessionId, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function revokeOtherSessions(userId: string, keepToken: string) {
  const result = await db.loginSession.updateMany({
    where: {
      userId,
      revokedAt: null,
      NOT: { tokenHash: hmac(keepToken) },
    },
    data: { revokedAt: new Date() },
  })
  return result.count
}

/** Called after a password change or 2FA change. */
export async function revokeAllSessions(userId: string) {
  const result = await db.loginSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
  return result.count
}

// ────────────────────────────────────────────────────── cookie plumbing ─────

/** Read and validate the session from the request cookies. */
export async function getAuthContext(): Promise<AuthContext | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return validateSessionToken(token)
}

/** Strip secrets before a user object crosses the wire. */
export function toSessionUser(user: User): SessionUser {
  const {
    passwordHash: _passwordHash,
    twoFactorSecret: _twoFactorSecret,
    twoFactorBackupCodes: _twoFactorBackupCodes,
    ...safe
  } = user
  return { ...safe, hasTwoFactor: user.twoFactorEnabled }
}

export async function listActiveSessions(userId: string) {
  return db.loginSession.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActiveAt: 'desc' },
    select: {
      id: true,
      device: true,
      ip: true,
      location: true,
      userAgent: true,
      rememberMe: true,
      createdAt: true,
      lastActiveAt: true,
      expiresAt: true,
    },
  })
}

/** Delete expired/revoked rows. Invoked by the queue's cleanup job. */
export async function pruneSessions(olderThanDays = 7): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
  const result = await db.loginSession.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: cutoff } }],
    },
  })
  return result.count
}
