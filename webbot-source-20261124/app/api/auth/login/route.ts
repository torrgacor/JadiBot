import { z } from 'zod'
import { fail, ok, parseBody } from '@/lib/api/response'
import { clientIp, rateLimit, resetRateLimit } from '@/lib/security/rate-limit'
import { authenticateUser, recordSessionStart } from '@/lib/services/auth-service'
import { createUserSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session'
import { CSRF_COOKIE, csrfCookieOptions, generateCsrfToken } from '@/lib/security/csrf'
import { rateLimited } from '@/lib/errors'
import { cookies } from 'next/headers'

/**
 * POST /api/auth/login
 *
 * Rate limited per IP and per email so neither a single source nor a single
 * account can be brute-forced. When 2FA is enabled the response reports
 * `requiresTwoFactor` and NO session cookie is set — the client must then call
 * /api/auth/2fa/verify to complete the sign-in.
 */

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Kata sandi wajib diisi.'),
  rememberMe: z.boolean().default(false),
})

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, schema)
    const ip = clientIp(request.headers)
    const headers = request.headers

    // Two independent limiters: flood from one IP, and targeted attempts on one
    // account from many IPs.
    // Both limiters must throw a real `AppError`: a plain `Error` carrying a
    // `code` property is not recognised by `toErrorPayload`, so it would be
    // reported as an unhandled fault — a 500 on the very control that is
    // supposed to answer 429, plus a stack trace in the log on every blocked
    // brute-force run. `rateLimited()` also forwards `Retry-After`.
    const ipLimit = await rateLimit('auth', `login:ip:${ip}`)
    if (!ipLimit.allowed) {
      throw rateLimited(
        'Terlalu banyak percobaan masuk dari jaringan ini. Tunggu sebentar lalu coba lagi.',
        ipLimit.retryAfterSeconds
      )
    }

    const emailLimit = await rateLimit('auth', `login:email:${body.email}`)
    if (!emailLimit.allowed) {
      throw rateLimited(
        'Terlalu banyak percobaan untuk akun ini. Tunggu sebentar lalu coba lagi.',
        emailLimit.retryAfterSeconds
      )
    }

    const { user, requiresTwoFactor } = await authenticateUser({
      email: body.email,
      password: body.password,
      ip,
      userAgent: headers.get('user-agent'),
    })

    if (requiresTwoFactor) {
      // Clear the counters: the password was correct, the second factor is next.
      await resetRateLimit('auth', `login:email:${body.email}`)

      return ok({
        requiresTwoFactor: true,
        userId: user.id,
        message: 'Masukkan 6 digit kode dari aplikasi autentikator Anda untuk menyelesaikan proses masuk.',
      })
    }

    const { token, session } = await createUserSession({
      userId: user.id,
      userAgent: headers.get('user-agent'),
      ip,
      rememberMe: body.rememberMe,
    })

    const store = await cookies()
    store.set(SESSION_COOKIE, token, sessionCookieOptions(body.rememberMe, process.env.NODE_ENV === 'production'))
    store.set(
      CSRF_COOKIE,
      generateCsrfToken(session.id),
      csrfCookieOptions(process.env.NODE_ENV === 'production')
    )

    await resetRateLimit('auth', `login:email:${body.email}`)
    await recordSessionStart({
      userId: user.id,
      ip,
      userAgent: headers.get('user-agent'),
    })

    return ok({
      requiresTwoFactor: false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: Boolean(user.emailVerifiedAt),
      },
      redirectTo: '/dashboard',
    })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
