import { z } from 'zod'
import { fail, ok, parseBody } from '@/lib/api/response'
import { resendVerificationEmail, verifyEmail } from '@/lib/services/auth-service'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { rateLimited } from '@/lib/errors'
import { emailSchema } from '@/lib/validation/schemas'
import { getAuthContext } from '@/lib/auth/session'

/**
 * POST /api/auth/verify-email   { token }
 * POST /api/auth/verify-email?resend=1 { email }
 *
 * `resend` always reports success for a valid-shaped address so the endpoint
 * cannot be used to discover which emails are registered.
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url)

    if (url.searchParams.get('resend') === '1') {
      const limit = await rateLimit('emailSend', `resend:${clientIp(request.headers)}`)
      if (!limit.allowed) {
        throw rateLimited(
          'Terlalu banyak permintaan email verifikasi. Silakan coba lagi nanti.',
          limit.retryAfterSeconds
        )
      }

      // Prefer the signed-in user's address, falling back to the submitted one.
      const context = await getAuthContext()
      const body = await parseBody(request, z.object({ email: emailSchema.optional() }))
      const email = context?.user.email ?? body.email

      if (email) await resendVerificationEmail(email)

      return ok({
        submitted: true,
        message: 'Jika alamat itu memang perlu diverifikasi, emailnya sedang dikirim.',
      })
    }

    const { token } = await parseBody(request, z.object({ token: z.string().min(10) }))
    const user = await verifyEmail(token)

    return ok({
      verified: true,
      email: user.email,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
