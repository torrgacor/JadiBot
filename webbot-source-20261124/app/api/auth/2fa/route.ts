import { z } from 'zod'
import { cookies } from 'next/headers'
import QRCode from 'qrcode'
import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAuth, requireAuthWithCsrf } from '@/lib/auth/guards'
import { db } from '@/lib/db'
import {
  consumeBackupCode,
  createTwoFactorEnrollment,
  generateBackupCodes,
  hashBackupCode,
  sealTotpSecret,
  verifyTotpCode,
} from '@/lib/security/totp'
import { verifyPassword } from '@/lib/security/password'
import { MAX_FAILED_ATTEMPTS, LOCK_DURATION_MS } from '@/lib/services/auth-service'
import { badRequest, rateLimited, unauthorized } from '@/lib/errors'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import {
  createUserSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/auth/session'
import { CSRF_COOKIE, csrfCookieOptions, generateCsrfToken } from '@/lib/security/csrf'
import { logActivity, notify } from '@/lib/auth/audit'
import { parseJsonArray, stringifyJson } from '@/lib/utils/json'

/**
 * Two-factor authentication.
 *
 *   action: "setup"    → generate a secret + QR (not yet active)
 *   action: "enable"   → confirm a code, activate 2FA, return backup codes once
 *   action: "disable"  → requires the account password
 *   action: "verify"   → second step of login (no session required)
 *   action: "backup-codes" → regenerate recovery codes (requires a valid code)
 *
 * "setup" stores the secret but leaves `twoFactorEnabled` false, so an
 * abandoned enrolment cannot lock the user out.
 */

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('setup') }),
  z.object({ action: z.literal('enable'), code: z.string().min(6).max(10) }),
  z.object({
    action: z.literal('disable'),
    password: z.string().min(1),
  }),
  z.object({
    action: z.literal('verify'),
    userId: z.string().min(1),
    code: z.string().min(6).max(12),
    rememberMe: z.boolean().default(false),
  }),
  z.object({ action: z.literal('backup-codes'), code: z.string().min(6).max(12) }),
])

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, bodySchema)

    switch (body.action) {
      case 'verify':
        return await handleVerify(request, body.userId, body.code, body.rememberMe)

      case 'setup': {
        const context = await requireAuthWithCsrf(request)

        // Per-user limiter on the enrollment actions so a stolen session cannot
        // probe the TOTP secret or churn backup codes (see audit item: 2fa
        // enable/setup had no per-user lockout beyond the global limiter).
        const setupLimit = await rateLimit('auth', `2fa:setup:${context.user.id}`)
        if (!setupLimit.allowed) {
          throw rateLimited(
            'Terlalu banyak permintaan untuk akun ini. Tunggu sebentar lalu coba lagi.',
            setupLimit.retryAfterSeconds
          )
        }

        if (context.user.twoFactorEnabled) {
          throw badRequest(
            'Autentikasi dua faktor sudah aktif. Nonaktifkan dulu untuk mendaftar ulang.'
          )
        }

        const enrollment = createTwoFactorEnrollment(context.user.email)

        await db.user.update({
          where: { id: context.user.id },
          data: { twoFactorSecret: sealTotpSecret(enrollment.secret) },
        })

        // The QR is generated from the real otpauth:// URI for this account.
        const qrDataUrl = await QRCode.toDataURL(enrollment.otpauthUrl, {
          width: 240,
          margin: 1,
          color: { dark: '#0b1220', light: '#ffffff' },
        })

        return ok({
          secret: enrollment.secret,
          otpauthUrl: enrollment.otpauthUrl,
          qrDataUrl,
          // Backup codes are issued on enable, not now, so a cancelled setup
          // does not leave unused codes recorded anywhere.
        })
      }

      case 'enable': {
        const context = await requireAuthWithCsrf(request)

        const enableLimit = await rateLimit('auth', `2fa:enable:${context.user.id}`)
        if (!enableLimit.allowed) {
          throw rateLimited(
            'Terlalu banyak percobaan aktivasi. Tunggu sebentar lalu coba lagi.',
            enableLimit.retryAfterSeconds
          )
        }

        if (!verifyTotpCode(context.user.twoFactorSecret ?? null, body.code)) {
          throw badRequest('Kode itu tidak valid. Periksa aplikasi authenticator Anda lalu coba lagi.')
        }

        const backupCodes = generateBackupCodes(8)

        await db.user.update({
          where: { id: context.user.id },
          data: {
            twoFactorEnabled: true,
            twoFactorBackupCodes: stringifyJson(backupCodes.map(hashBackupCode)),
          },
        })

        await logActivity({
          userId: context.user.id,
          event: 'auth.2fa_enabled',
          title: 'Autentikasi dua faktor diaktifkan',
          level: 'success',
        })
        await notify({
          userId: context.user.id,
          type: 'SECURITY_ALERT',
          severity: 'success',
          title: 'Autentikasi dua faktor diaktifkan',
          message: 'Masuk sekarang memerlukan kode dari aplikasi authenticator Anda.',
        })

        // Shown exactly once — only hashes are persisted.
        return ok({ enabled: true, backupCodes })
      }

      case 'disable': {
        const context = await requireAuthWithCsrf(request)

        const valid = await verifyPassword(body.password, context.user.passwordHash)
        if (!valid) throw badRequest('Kata sandi Anda salah.')

        await db.user.update({
          where: { id: context.user.id },
          data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: null,
          },
        })

        await logActivity({
          userId: context.user.id,
          event: 'auth.2fa_disabled',
          title: 'Autentikasi dua faktor dinonaktifkan',
          level: 'warning',
        })

        return ok({ enabled: false })
      }

      case 'backup-codes': {
        const context = await requireAuthWithCsrf(request)

        const backupLimit = await rateLimit('auth', `2fa:backup:${context.user.id}`)
        if (!backupLimit.allowed) {
          throw rateLimited(
            'Terlalu banyak permintaan kode cadangan. Tunggu sebentar lalu coba lagi.',
            backupLimit.retryAfterSeconds
          )
        }

        if (!context.user.twoFactorEnabled) {
          throw badRequest('Aktifkan autentikasi dua faktor terlebih dahulu.')
        }

        const result = verifyTotpWithBackup(
          { twoFactorSecret: context.user.twoFactorSecret ?? null, twoFactorBackupCodes: context.user.twoFactorBackupCodes ?? null },
          body.code
        )
        if (!result.valid)        throw badRequest('Kode itu tidak valid.')

        const backupCodes = generateBackupCodes(8)

        await db.user.update({
          where: { id: context.user.id },
          data: { twoFactorBackupCodes: stringifyJson(backupCodes.map(hashBackupCode)) },
        })

        return ok({ backupCodes })
      }
    }
  } catch (error) {
    return fail(error)
  }
}

/** Second login step: exchange a valid TOTP/backup code for a session. */
async function handleVerify(
  request: Request,
  userId: string,
  code: string,
  rememberMe: boolean
) {
  const ip = clientIp(request.headers)

  // Two limiters, for the same reason the password step has two: one source
  // flooding us, and one account being guessed at from many sources. A TOTP code
  // is six digits, so an unthrottled per-account counter is a real brute force.
  const ipLimit = await rateLimit('auth', `2fa:ip:${ip}`)
  if (!ipLimit.allowed) {
    throw rateLimited('Terlalu banyak percobaan verifikasi. Tunggu sebentar lalu coba lagi.', ipLimit.retryAfterSeconds)
  }

  const userLimit = await rateLimit('auth', `2fa:user:${userId}`)
  if (!userLimit.allowed) {
    throw rateLimited('Terlalu banyak percobaan untuk akun ini. Tunggu sebentar lalu coba lagi.', userLimit.retryAfterSeconds)
  }

  const user = await db.user.findUnique({ where: { id: userId } })

  // Uniform failure: do not reveal whether the user id exists or 2FA is on.
  if (!user || !user.twoFactorEnabled || user.status !== 'ACTIVE') {
    throw unauthorized('Kode itu tidak valid.')
  }

  // The account lockout from the password step covers the second factor too, so
  // the two cannot be attacked as if they were independent.
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000)
    throw unauthorized(`Terlalu banyak percobaan gagal. Coba lagi dalam ${minutes} menit.`)
  }

  const result = verifyTotpWithBackup(
    { twoFactorSecret: user.twoFactorSecret ?? null, twoFactorBackupCodes: user.twoFactorBackupCodes ?? null },
    code
  )

  if (!result.valid) {
    const attempts = user.failedLoginAttempts + 1
    const shouldLock = attempts >= MAX_FAILED_ATTEMPTS

    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
      },
    })

    if (shouldLock) {
      await notify({
        userId: user.id,
        type: 'SECURITY_ALERT',
        severity: 'warning',
        title: 'Akun terkunci sementara',
        message: `Kami memblokir proses masuk setelah ${MAX_FAILED_ATTEMPTS} percobaan gagal. Jika bukan Anda, segera ganti kata sandi.`,
        actionUrl: '/forgot-password',
      })
      await logActivity({
        userId: user.id,
        event: 'auth.2fa_locked',
        title: 'Akun terkunci setelah percobaan kode 2FA gagal',
        level: 'warning',
        ip,
      })
    }

    throw unauthorized('Kode itu tidak valid.')
  }

  // Second factor passed — clear the failure counters, exactly as a correct
  // password does.
  await db.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  })

  // A consumed backup code is removed from the stored set.
  if (result.remainingBackupCodes) {
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorBackupCodes: stringifyJson(result.remainingBackupCodes),
      },
    })
    await logActivity({
      userId: user.id,
      event: 'auth.2fa_backup_code_used',
      title: 'Kode cadangan dipakai untuk masuk',
      level: 'warning',
    })
  }

  const { token, session } = await createUserSession({
    userId: user.id,
    userAgent: request.headers.get('user-agent'),
    ip,
    rememberMe,
  })

  const store = await cookies()
  store.set(SESSION_COOKIE, token, sessionCookieOptions(rememberMe, process.env.NODE_ENV === 'production'))
  store.set(
    CSRF_COOKIE,
    generateCsrfToken(session.id),
    csrfCookieOptions(process.env.NODE_ENV === 'production')
  )

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), lastLoginIp: ip },
  })

  await logActivity({
    userId: user.id,
    event: 'auth.login',
    title: 'Masuk dengan autentikasi dua faktor',
    level: 'success',
    ip,
  })

  return ok({ requiresTwoFactor: false, redirectTo: '/dashboard' })
}

/**
 * Accept either a TOTP code or an unused backup code. Returns the remaining
 * backup codes when one was consumed.
 */
function verifyTotpWithBackup(
  user: { twoFactorSecret: string | null; twoFactorBackupCodes: string | null },
  code: string
): { valid: boolean; remainingBackupCodes?: string[] } {
  if (verifyTotpCode(user.twoFactorSecret, code)) return { valid: true }

  // Fall back to recovery codes. They have the shape XXXXX-XXXXX.
  const stored = parseJsonArray<string>(user.twoFactorBackupCodes)
  if (stored.length === 0) return { valid: false }

  const remaining = consumeBackupCode(stored, code)
  if (!remaining) return { valid: false }

  return { valid: true, remainingBackupCodes: remaining }
}

export const dynamic = 'force-dynamic'
