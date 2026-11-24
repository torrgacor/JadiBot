import type { User } from '@/lib/db'
import { getAuthContext, SESSION_COOKIE, type AuthContext } from '@/lib/auth/session'
import { forbidden, notFound, unauthorized } from '@/lib/errors'
import { validateCsrfRequest, CSRF_COOKIE } from '@/lib/security/csrf'
import { cookies } from 'next/headers'
import type { UserRole } from '@/types/enums'

/**
 * Guards for route handlers and server actions.
 *
 * Every protected endpoint calls exactly one of these first, so there is a
 * single, auditable place where "who is allowed to do this" is decided.
 */

/** Require a signed-in, active user. */
export async function requireAuth(): Promise<AuthContext> {
  const context = await getAuthContext()
  if (!context) throw unauthorized()
  return context
}

/** Require one of the given roles. */
export async function requireRole(...roles: UserRole[]): Promise<AuthContext> {
  const context = await requireAuth()
  if (!roles.includes(context.user.role as UserRole)) {
    throw forbidden('Akun Anda tidak memiliki akses ke bagian ini.')
  }
  return context
}

export const requireAdmin = () => requireRole('ADMIN', 'SUPER_ADMIN')
export const requireSuperAdmin = () => requireRole('SUPER_ADMIN')

/**
 * Admin role + CSRF, for admin routes that change state.
 *
 * Role and CSRF protect against different things and neither implies the other:
 * a cross-site request can carry the admin's cookie, and a CSRF token says
 * nothing about whether the caller is an admin. Every mutating admin endpoint
 * must have both.
 */
export async function requireAdminWithCsrf(request: Request): Promise<AuthContext> {
  const context = await requireAuthWithCsrf(request)
  if (context.user.role !== 'ADMIN' && context.user.role !== 'SUPER_ADMIN') {
    throw forbidden('Akun Anda tidak memiliki akses ke bagian ini.')
  }
  return context
}

/**
 * Require a valid CSRF token on a state-changing request.
 *
 * Must be called by anything that mutates state through cookie auth. Public
 * API-key endpoints are exempt because they do not rely on ambient browser
 * credentials — the key itself is the proof.
 */
export async function requireCsrf(request: Request, sessionId: string): Promise<void> {
  const cookieStore = await cookies()
  const result = validateCsrfRequest(
    request,
    sessionId,
    cookieStore.get(CSRF_COOKIE)?.value ?? null
  )

  if (!result.valid) {
    throw forbidden(
      `Permintaan diblokir oleh perlindungan CSRF (${result.reason}). Muat ulang halaman lalu coba lagi.`
    )
  }
}

/** Convenience: authenticate + CSRF in one call for mutating endpoints. */
export async function requireAuthWithCsrf(request: Request): Promise<AuthContext> {
  const context = await requireAuth()
  await requireCsrf(request, context.sessionId)
  return context
}

/**
 * Assert that the caller may act on a resource they must own.
 *
 * Returns the resource so handlers can use it without a second query, and
 * reports "not found" rather than "forbidden" to avoid leaking the existence of
 * other users' records.
 */
export function assertOwnership(
  resource: { userId: string } | null | undefined,
  userId: string,
  resourceName = 'Resource'
): asserts resource is { userId: string } {
  // `notFound()`, not a plain `Error` with a `code` property: only an AppError
  // survives `toErrorPayload` as a 404, and a bare Error would surface as a 500.
  if (!resource || resource.userId !== userId) {
    throw notFound(`${resourceName} tidak ditemukan.`)
  }
}

/** Read the raw session cookie without validating it (for logout). */
export async function readSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export function isAdmin(user: Pick<User, 'role'>): boolean {
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
}
