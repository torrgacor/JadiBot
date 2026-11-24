import { cookies } from 'next/headers'
import { fail, ok } from '@/lib/api/response'
import {
  destroySessionByToken,
  SESSION_COOKIE,
  validateSessionToken,
} from '@/lib/auth/session'
import { CSRF_COOKIE } from '@/lib/security/csrf'
import { validateCsrfRequest } from '@/lib/security/csrf'
import { forbidden } from '@/lib/errors'
import { logActivity } from '@/lib/auth/audit'

/**
 * POST /api/auth/logout
 *
 * Revokes the current session server-side, then clears both cookies. The CSRF
 * check matters here: without it a third-party page could force a logout.
 */
export async function POST(request: Request) {
  try {
    const store = await cookies()
    const token = store.get(SESSION_COOKIE)?.value
    const context = await validateSessionToken(token)

    // With no valid session there is nothing to protect, so let the call through.
    if (context) {
      const csrf = validateCsrfRequest(
        request,
        context.sessionId,
        store.get(CSRF_COOKIE)?.value ?? null
      )
      if (!csrf.valid) {
        throw forbidden(
          `Permintaan diblokir oleh perlindungan CSRF (${csrf.reason}). Muat ulang halaman lalu coba lagi.`
        )
      }

      await destroySessionByToken(token!)
      await logActivity({
        userId: context.user.id,
        event: 'auth.logout',
        title: 'Signed out',
        level: 'info',
      })
    }

    store.delete(SESSION_COOKIE)
    store.delete(CSRF_COOKIE)

    return ok({ signedOut: true, redirectTo: '/' })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
