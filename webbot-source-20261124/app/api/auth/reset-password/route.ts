import { z } from 'zod'
import { fail, ok, parseBody } from '@/lib/api/response'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { rateLimited } from '@/lib/errors'
import { resetPassword } from '@/lib/services/auth-service'
import { passwordSchema } from '@/lib/validation/schemas'
import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/auth/session'
import { CSRF_COOKIE } from '@/lib/security/csrf'

/**
 * POST /api/auth/reset-password
 *
 * Consumes the one-time token, sets the new password and — critically —
 * revokes every active session, so a reset also evicts whoever may have had
 * access before.
 */
const schema = z.object({
  token: z.string().min(10, 'Token reset wajib diisi.'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Kata sandi tidak sama.',
  path: ['confirmPassword'],
})

export async function POST(request: Request) {
  try {
    const limit = await rateLimit('auth', `reset:${clientIp(request.headers)}`)
    if (!limit.allowed) {
      throw rateLimited('Terlalu banyak percobaan. Silakan coba lagi nanti.', limit.retryAfterSeconds)
    }

    const body = await parseBody(request, schema)
    await resetPassword(body.token, body.password)

    // The caller is now signed out everywhere; drop their cookies too.
    const store = await cookies()
    store.delete(SESSION_COOKIE)
    store.delete(CSRF_COOKIE)

    return ok({
      reset: true,
      redirectTo: '/login',
      message: 'Kata sandi Anda sudah diganti. Silakan masuk dengan kata sandi baru.',
    })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
