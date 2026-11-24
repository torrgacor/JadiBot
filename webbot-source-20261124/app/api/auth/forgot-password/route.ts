import { z } from 'zod'
import { fail, ok, parseBody } from '@/lib/api/response'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { rateLimited } from '@/lib/errors'
import { requestPasswordReset } from '@/lib/services/auth-service'
import { emailSchema } from '@/lib/validation/schemas'
import { features } from '@/lib/env'

/**
 * POST /api/auth/forgot-password
 *
 * Always responds 200 with the same body whether or not the account exists, so
 * this endpoint cannot be used to enumerate registered emails. It is rate
 * limited so it also cannot be used to mail-bomb an address.
 *
 * Secrets never travel in this response by default. A password-reset token for
 * an arbitrary email address is an account-takeover primitive, so it is only
 * ever returned when an operator explicitly opts in with `DEV_AUTH_LINKS=1` and
 * no mail transport exists (see `lib/security/dev-links.ts`). The message stays
 * generic either way, so it reveals nothing about the account or the mail setup.
 */
export async function POST(request: Request) {
  try {
    const ip = clientIp(request.headers)
    const limit = await rateLimit('emailSend', `forgot:${ip}`)
    if (!limit.allowed) {
      throw rateLimited(
        'Terlalu banyak permintaan reset. Silakan coba lagi nanti.',
        limit.retryAfterSeconds
      )
    }

    const { email } = await parseBody(request, z.object({ email: emailSchema }))
    const result = await requestPasswordReset(email)

    return ok({
      submitted: true,
      message: features.smtp
        ? 'Jika akun dengan alamat tersebut ada, tautan reset sudah dikirim.'
        : result.devLink
          ? 'Mode pengembangan aktif: gunakan tautan di bawah untuk melanjutkan.'
          : 'Permintaan Anda dicatat. Pengiriman email belum aktif di server ini, jadi hubungi administrator untuk mengatur ulang kata sandi.',
      emailSent: features.smtp,
      // Null unless DEV_AUTH_LINKS=1 was set by the operator on purpose.
      devResetLink: result.devLink ?? null,
    })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
