import { z } from 'zod'
import { db } from '@/lib/db'
import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAdminWithCsrf } from '@/lib/auth/guards'
import { generatePassword, hashPassword } from '@/lib/security/password'
import { revokeAllSessions } from '@/lib/auth/session'
import { logActivity, notify } from '@/lib/auth/audit'
import { badRequest, notFound } from '@/lib/errors'
import { passwordSchema } from '@/lib/validation/schemas'

/**
 * POST /api/admin/users/:id/password
 *
 * Set a new password for an account from the admin panel.
 *
 * Two modes:
 *   • `mode: "generate"` — the server creates a compliant random password and
 *     returns it once so the operator can hand it over. Nothing weak ever
 *     reaches the database because the operator never types it.
 *   • `mode: "set"` — the operator supplies one; it is validated against the
 *     same `passwordSchema` the sign-up form uses.
 *
 * Guarded by `requireAdminWithCsrf` for the same reasons as the suspend action:
 * the role check proves the caller is an operator and the CSRF check proves the
 * request came from our own UI rather than a page riding the admin's cookie.
 * A plain ADMIN cannot reset a SUPER_ADMIN, and nobody can reset themselves
 * here — changing your own password belongs in account settings, where the
 * current password is required.
 *
 * Every existing session is revoked, exactly as the self-service reset flow
 * does, so the old credential cannot be used by whoever had it.
 */

const schema = z
  .object({
    mode: z.enum(['generate', 'set']),
    password: z.string().min(1).max(128).optional(),
  })
  .refine((value) => value.mode !== 'set' || Boolean(value.password), {
    message: 'Kata sandi wajib diisi.',
    path: ['password'],
  })

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminWithCsrf(request)
    const { id } = await params
    const body = await parseBody(request, schema)

    if (id === admin.user.id) {
      throw badRequest(
        'Gunakan halaman Keamanan untuk mengganti kata sandi Anda sendiri.'
      )
    }

    const target = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    })
    if (!target) throw notFound('Pengguna tidak ditemukan.')

    // An ADMIN must not be able to take over a SUPER_ADMIN account.
    if (target.role === 'SUPER_ADMIN' && admin.user.role !== 'SUPER_ADMIN') {
      throw badRequest('Hanya super admin yang dapat mengubah super admin lain.')
    }

    // Validate an operator-supplied password with the shared schema so it can
    // never be weaker than one chosen at sign-up.
    if (body.mode === 'set') {
      const result = passwordSchema.safeParse(body.password)
      if (!result.success) {
        throw badRequest(result.error.issues[0]?.message ?? 'Kata sandi tidak valid.')
      }
    }

    const newPassword = body.mode === 'generate' ? generatePassword(12) : body.password!
    const passwordHash = await hashPassword(newPassword)

    await db.user.update({
      where: { id },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    })

    await revokeAllSessions(id)

    await logActivity({
      userId: admin.user.id,
      event: 'admin.user.password_reset',
      title: 'Kata sandi pengguna diatur ulang',
      detail: target.email,
      level: 'warning',
    })

    await notify({
      userId: id,
      type: 'SECURITY_ALERT',
      title: 'Kata sandi akun Anda diatur ulang',
      message:
        'Administrator mengatur ulang kata sandi akun ini. Semua sesi lama telah dikeluarkan.',
      severity: 'warning',
    })

    // The generated value travels back exactly once so the operator can pass it
    // on; only its hash is stored. In generate mode the response carries a
    // credential, so it must never be cached or stored by any proxy/CDN/APM in
    // the path — `no-store` guarantees that.
    const response = ok({
      id,
      email: target.email,
      ...(body.mode === 'generate' ? { password: newPassword } : {}),
    })
    if (body.mode === 'generate') {
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
    }
    return response
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
