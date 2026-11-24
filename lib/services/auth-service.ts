import type { User } from '@/lib/db'
import { db } from '@/lib/db'
import {
  conflict,
  badRequest,
  notFound,
  unauthorized,
  forbidden,
} from '@/lib/errors'
import { hashPassword, verifyPassword } from '@/lib/security/password'
import { generateToken, hmac } from '@/lib/security/crypto'
import { isUniqueConstraintError } from '@/lib/errors'
import { notify, logActivity } from '@/lib/auth/audit'
import { parseUserAgent } from '@/lib/auth/session'
import { authLinksExposed } from '@/lib/security/dev-links'
import {
  queueMail,
  verificationEmail,
  passwordResetEmail,
  securityAlertEmail,
} from '@/lib/services/mailer'

/**
 * Authentication business logic.
 *
 * Route handlers stay thin: they parse input, call one of these functions, and
 * translate the result. All brute-force protection, token issuance and audit
 * logging lives here so it cannot be forgotten on a new endpoint.
 */

/** Failed attempts before the account is temporarily locked. */
export const MAX_FAILED_ATTEMPTS = 6
/** Lock duration once the threshold is reached. */
export const LOCK_DURATION_MS = 15 * 60 * 1000

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

function appUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}${path}`
}

// ────────────────────────────────────────────────────────── registration ────

export interface RegisterInput {
  name: string
  username: string
  email: string
  password: string
  ip?: string | null
  userAgent?: string | null
}

export async function registerUser(input: RegisterInput) {
  const existingEmail = await db.user.findUnique({ where: { email: input.email } })
  if (existingEmail) {
    throw conflict('Akun dengan email tersebut sudah ada.')
  }

  const existingUsername = await db.user.findUnique({
    where: { username: input.username },
  })
  if (existingUsername) {
    throw conflict('Nama pengguna tersebut sudah dipakai.')
  }

  let user
  try {
    user = await db.user.create({
      data: {
        name: input.name,
        username: input.username,
        email: input.email,
        passwordHash: await hashPassword(input.password),
      },
    })
  } catch (error) {
    // Race condition: someone claimed the same email/username a moment ago.
    if (isUniqueConstraintError(error)) {
      throw conflict('Email atau nama pengguna itu baru saja dipakai orang lain. Coba yang lain.')
    }
    throw error
  }

  // Attach the Free plan immediately so quota checks have something to read.
  const freePlan = await db.plan.findFirst({ where: { slug: 'free' } })
  if (freePlan) {
    await db.subscription.create({
      data: {
        userId: user.id,
        planId: freePlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
  }

  const { link, token } = await issueVerificationToken(user.id, 'EMAIL_VERIFY')

  await queueMail({
    to: user.email,
    subject: 'Verifikasi email NANO GATEWAY Anda',
    body: verificationEmail(user.name, link),
  })

  await logActivity({
    userId: user.id,
    event: 'auth.registered',
    title: 'Akun dibuat',
    detail: `${user.email} mendaftar`,
    level: 'success',
    ip: input.ip,
  })

  await notify({
    userId: user.id,
    type: 'SYSTEM',
    severity: 'info',
    title: 'Selamat datang di NANO GATEWAY',
    message:
      'Verifikasi alamat email Anda, lalu buat sesi WhatsApp pertama untuk memulai.',
    actionUrl: '/dashboard/sessions/new',
  })

  return { user, verificationToken: token }
}

// ─────────────────────────────────────────────────────────────── login ──────

export interface LoginInput {
  email: string
  password: string
  ip?: string | null
  userAgent?: string | null
}

export interface LoginSuccess {
  /** Never null: `authenticateUser` throws on any failure path. */
  user: User
  requiresTwoFactor: boolean
}

export async function authenticateUser(input: LoginInput): Promise<LoginSuccess> {
  const user = await db.user.findUnique({ where: { email: input.email } })

  // Uniform failure message: never reveal whether the email exists.
  const invalid = unauthorized('Email atau kata sandi salah.')

  if (!user) {
    // Still run a hash to keep response time roughly constant, so timing does
    // not disclose whether the account exists.
    await verifyPassword(input.password, 'scrypt$16384$8$1$AAAA$AAAA')
    throw invalid
  }

  if (user.status === 'SUSPENDED') {
    throw forbidden('Akun ini sedang ditangguhkan. Hubungi dukungan untuk bantuan.')
  }
  if (user.status === 'DELETED') {
    throw invalid
  }

  // Account lockout after repeated failures.
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000)
    throw unauthorized(`Terlalu banyak percobaan gagal. Coba lagi dalam ${minutes} menit.`)
  }

  const valid = await verifyPassword(input.password, user.passwordHash)

  if (!valid) {
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
    }

    throw invalid
  }

  // Success: clear counters.
  await db.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: input.ip ?? null,
    },
  })

  return { user, requiresTwoFactor: user.twoFactorEnabled }
}

export async function recordSessionStart(options: {
  userId: string
  ip?: string | null
  userAgent?: string | null
}) {
  const { device } = parseUserAgent(options.userAgent)

  await logActivity({
    userId: options.userId,
    event: 'auth.login',
    title: 'Berhasil masuk',
    detail: device,
    level: 'info',
    ip: options.ip,
  })
}

// ────────────────────────────────────────────────── tokens (verify/reset) ───

async function issueVerificationToken(
  userId: string,
  type: 'EMAIL_VERIFY' | 'PASSWORD_RESET'
) {
  const token = generateToken(32)

  await db.verificationToken.create({
    data: {
      userId,
      tokenHash: hmac(token),
      type,
      expiresAt: new Date(
        Date.now() + (type === 'EMAIL_VERIFY' ? VERIFY_TOKEN_TTL_MS : RESET_TOKEN_TTL_MS)
      ),
    },
  })

  const path =
    type === 'EMAIL_VERIFY'
      ? `/verify-email?token=${token}`
      : `/reset-password?token=${token}`

  return { token, link: appUrl(path) }
}

/** Verify an email address using a one-time token. */
export async function verifyEmail(token: string) {
  const record = await db.verificationToken.findUnique({
    where: { tokenHash: hmac(token) },
    include: { user: true },
  })

  if (!record || record.type !== 'EMAIL_VERIFY') {
    throw badRequest('Tautan verifikasi ini tidak valid.')
  }
  if (record.usedAt) {
    throw badRequest('Tautan verifikasi ini sudah pernah dipakai.')
  }
  if (record.expiresAt.getTime() < Date.now()) {
    throw badRequest('Tautan verifikasi ini sudah kedaluwarsa. Minta tautan baru.')
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    db.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  await logActivity({
    userId: record.userId,
    event: 'auth.email_verified',
    title: 'Email terverifikasi',
    detail: record.user!.email,
    level: 'success',
  })

  return record.user!
}

export async function resendVerificationEmail(email: string) {
  const user = await db.user.findUnique({ where: { email } })

  // Always report success so this endpoint cannot enumerate accounts.
  if (!user || user.emailVerifiedAt) return { sent: false }

  const { link } = await issueVerificationToken(user.id, 'EMAIL_VERIFY')
  await queueMail({
    to: user.email,
    subject: 'Verifikasi email NANO GATEWAY Anda',
    body: verificationEmail(user.name, link),
  })

  return { sent: true }
}

export async function requestPasswordReset(email: string): Promise<{
  sent: boolean
  /**
   * Returned **only** when there is no mail transport AND the operator opted in
   * with `DEV_AUTH_LINKS=1` (see `lib/security/dev-links.ts`).
   *
   * This is a reset token for an arbitrary account, so handing it to an
   * unauthenticated caller is an account-takeover primitive. The default is
   * therefore to send nothing back at all; an operator who needs to test the
   * flow without SMTP asks for it explicitly and knowingly.
   */
  devLink?: string
}> {
  const user = await db.user.findUnique({ where: { email } })

  // Deliberately identical response whether or not the account exists.
  if (!user) return { sent: false }

  const { link } = await issueVerificationToken(user.id, 'PASSWORD_RESET')

  await queueMail({
    to: user.email,
    subject: 'Atur ulang kata sandi NANO GATEWAY Anda',
    body: passwordResetEmail(user.name, link),
  })

  await logActivity({
    userId: user.id,
    event: 'auth.password_reset_requested',
    title: 'Permintaan atur ulang kata sandi',
    level: 'warning',
  })

  return { sent: true, devLink: authLinksExposed() ? link : undefined }
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await db.verificationToken.findUnique({
    where: { tokenHash: hmac(token) },
    include: { user: true },
  })

  if (!record || record.type !== 'PASSWORD_RESET') {
    throw badRequest('Tautan atur ulang ini tidak valid.')
  }
  if (record.usedAt) {
    throw badRequest('Tautan atur ulang ini sudah pernah dipakai. Minta tautan baru.')
  }
  if (record.expiresAt.getTime() < Date.now()) {
    throw badRequest('Tautan atur ulang ini sudah kedaluwarsa. Minta tautan baru.')
  }

  const passwordHash = await hashPassword(newPassword)

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    db.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Every existing session is invalidated — a reset must evict an attacker.
    db.loginSession.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])

  await queueMail({
    to: record.user!.email,
    subject: 'Kata sandi NANO GATEWAY Anda telah diganti',
    body: securityAlertEmail(
      record.user!.name,
      'Kata sandi Anda telah diatur ulang dan semua sesi lain dikeluarkan.'
    ),
  })

  await logActivity({
    userId: record.userId,
    event: 'auth.password_reset',
    title: 'Atur ulang kata sandi selesai',
    level: 'warning',
  })

  return { userId: record.userId }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) throw notFound('Akun tidak ditemukan.')

  const valid = await verifyPassword(currentPassword, user.passwordHash)
  if (!valid) throw badRequest('Kata sandi Anda saat ini salah.')

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  })

  await queueMail({
    to: user.email,
    subject: 'Kata sandi NANO GATEWAY Anda telah diganti',
    body: securityAlertEmail(user.name, 'Kata sandi akun Anda telah diganti.'),
  })

  await logActivity({
    userId,
    event: 'auth.password_changed',
    title: 'Kata sandi diganti',
    level: 'warning',
  })

  return user
}
