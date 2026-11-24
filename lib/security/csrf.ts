import { createHmac } from 'crypto'
import { safeEqual } from '@/lib/security/crypto'
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  SAFE_METHODS,
  SESSION_COOKIE,
} from '@/lib/security/constants'

/**
 * CSRF protection — signed double-submit cookie.
 *
 * The cookie value is `HMAC(sessionId)` so it cannot be forged without the
 * server secret, and it is bound to the session so a token from one account
 * cannot be replayed against another. Because the token is stored in a cookie
 * that JavaScript can read, the browser will only expose it to same-origin
 * scripts; a cross-site form post cannot read it to populate the header.
 *
 * Cookie refresh (rotateCsrfToken) is called whenever a session is created or
 * destroyed, so tokens never outlive the session they belong to.
 */

// Re-exported so server-side callers have a single import site, while browser
// code imports from `@/lib/security/constants` directly (see that file).
export { CSRF_COOKIE, CSRF_HEADER, SAFE_METHODS, SESSION_COOKIE }

function csrfSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is required for CSRF protection.')
  return secret
}

/** Deterministic token for a session — same session always yields same token. */
export function generateCsrfToken(sessionId: string): string {
  return createHmac('sha256', csrfSecret())
    .update(`csrf:${sessionId}`)
    .digest('base64url')
}

export function verifyCsrfToken(sessionId: string, token: string | null): boolean {
  if (!token) return false
  return safeEqual(generateCsrfToken(sessionId), token)
}

/**
 * Validate a state-changing request.
 *
 * Returns a reason string when invalid so route handlers can log why, rather
 * than a bare boolean that makes CSRF failures impossible to debug.
 */
export function validateCsrfRequest(
  request: Request,
  sessionId: string | null,
  cookieToken: string | null
): { valid: true } | { valid: false; reason: string } {
  if (SAFE_METHODS.has(request.method)) return { valid: true }

  if (!sessionId) return { valid: false, reason: 'no-session' }
  if (!cookieToken) return { valid: false, reason: 'missing-cookie' }

  const headerToken = request.headers.get(CSRF_HEADER)
  if (!headerToken) return { valid: false, reason: 'missing-header' }

  // Both sides must agree AND match the signature for the active session.
  if (!safeEqual(cookieToken, headerToken)) {
    return { valid: false, reason: 'cookie-header-mismatch' }
  }
  if (!verifyCsrfToken(sessionId, headerToken)) {
    return { valid: false, reason: 'bad-signature' }
  }

  return { valid: true }
}

export function csrfCookieOptions(isProduction: boolean) {
  return {
    // Readable by JS by design — the client copies it into the header.
    httpOnly: false,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  }
}
