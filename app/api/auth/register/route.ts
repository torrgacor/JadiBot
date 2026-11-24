import { z } from 'zod'
import { cookies } from 'next/headers'
import { fail, created, parseBody } from '@/lib/api/response'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { rateLimited } from '@/lib/errors'
import { registerUser } from '@/lib/services/auth-service'
import {
  createUserSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/auth/session'
import {
  CSRF_COOKIE,
  csrfCookieOptions,
  generateCsrfToken,
} from '@/lib/security/csrf'
import { features } from '@/lib/env'
import { authLinksExposed } from '@/lib/security/dev-links'
import { emailSchema, passwordSchema, usernameSchema } from '@/lib/validation/schemas'

/**
 * POST /api/auth/register
 *
 * Creates the account, seeds the Free subscription, queues a verification email
 * and signs the user straight in (they can use the dashboard before verifying,
 * but sending is gated on a verified address — see assertVerified in the send
 * route).
 */

const schema = z
  .object({
    name: z.string().trim().min(2, 'Masukkan nama Anda.').max(80),
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    // `literal(true)` rejects a missing, false, or non-boolean value with one
    // clear message instead of leaking Zod's default English type error.
    acceptTerms: z.literal(true, {
      message: 'Anda harus menyetujui Ketentuan Layanan.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Kata sandi tidak sama.',
    path: ['confirmPassword'],
  })

export async function POST(request: Request) {
  try {
    const ip = clientIp(request.headers)
    const limit = await rateLimit('register', `ip:${ip}`)
    if (!limit.allowed) {
      throw rateLimited(
        'Terlalu banyak akun dibuat dari jaringan ini. Silakan coba lagi nanti.',
        limit.retryAfterSeconds
      )
    }

    const body = await parseBody(request, schema)

    const { user, verificationToken } = await registerUser({
      name: body.name,
      username: body.username,
      email: body.email,
      password: body.password,
      ip,
      userAgent: request.headers.get('user-agent'),
    })

    const { token, session } = await createUserSession({
      userId: user.id,
      userAgent: request.headers.get('user-agent'),
      ip,
      rememberMe: false,
    })

    const store = await cookies()
    store.set(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(false, process.env.NODE_ENV === 'production')
    )
    store.set(
      CSRF_COOKIE,
      generateCsrfToken(session.id),
      csrfCookieOptions(process.env.NODE_ENV === 'production')
    )

    return created({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: false,
      },
      redirectTo: '/dashboard',
      /**
       * The verification token is a one-time secret, so it leaves the server
       * only when an operator has explicitly asked for development links
       * (`DEV_AUTH_LINKS=1`, and no SMTP transport). Without that switch the
       * account is simply left unverified: the mail was never sent, and
       * returning the token anyway would let anyone mark an address they do not
       * own as verified — the same class of leak as the password-reset link.
       * The UI says delivery is unavailable instead of implying a mail went out.
       */
      verification: features.smtp
        ? { emailSent: true }
        : authLinksExposed()
          ? {
              emailSent: false,
              reason: 'SMTP belum dikonfigurasi, jadi email verifikasi tidak terkirim.',
              verificationPath: `/verify-email?token=${verificationToken}`,
            }
          : {
              emailSent: false,
              reason:
                'SMTP belum dikonfigurasi, jadi email verifikasi tidak terkirim. Minta admin mengaktifkan pengiriman email sebelum alamat ini diverifikasi.',
            },
    })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
