import { z } from 'zod'
import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAuthWithCsrf } from '@/lib/auth/guards'
import { changePassword } from '@/lib/services/auth-service'
import { passwordSchema } from '@/lib/validation/schemas'
import { revokeOtherSessions } from '@/lib/auth/session'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { rateLimited } from '@/lib/errors'

/**
 * POST /api/auth/change-password
 *
 * Requires the current password (so a stolen session alone cannot lock the
 * owner out) and revokes every *other* session afterwards, keeping the current
 * device signed in.
 */
const schema = z
  .object({
    currentPassword: z.string().min(1, 'Masukkan kata sandi Anda saat ini.'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
    signOutOtherDevices: z.boolean().default(true),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Kata sandi tidak sama.',
    path: ['confirmPassword'],
  })

export async function POST(request: Request) {
  try {
    const context = await requireAuthWithCsrf(request)

    const limit = await rateLimit('auth', `change-password:${clientIp(request.headers)}`)
    if (!limit.allowed) {
      throw rateLimited('Terlalu banyak percobaan. Silakan coba lagi nanti.', limit.retryAfterSeconds)
    }

    const body = await parseBody(request, schema)
    await changePassword(context.user.id, body.currentPassword, body.newPassword)

    let revoked = 0
    if (body.signOutOtherDevices) {
      revoked = await revokeOtherSessions(context.user.id, context.token)
    }

    return ok({
      changed: true,
      otherSessionsRevoked: revoked,
      message:
        revoked > 0
          ? `Kata sandi diubah. ${revoked} sesi lain telah dikeluarkan.`
          : 'Kata sandi diubah.',
    })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
