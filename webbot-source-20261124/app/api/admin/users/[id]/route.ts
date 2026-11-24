import { z } from 'zod'
import { db } from '@/lib/db'
import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAdminWithCsrf } from '@/lib/auth/guards'
import { revokeAllSessions } from '@/lib/auth/session'
import { badRequest, notFound } from '@/lib/errors'
import { logActivity, notify } from '@/lib/auth/audit'

/**
 * PATCH /api/admin/users/:id
 *
 * Suspend or reactivate an account. Suspending also revokes every session, so
 * the user loses access immediately rather than at cookie expiry.
 *
 * Guarded by `requireAdminWithCsrf`: the role check proves the caller is an
 * operator, the CSRF check proves the request came from our own UI rather than a
 * page on another site riding the admin's cookie. A SUPER_ADMIN cannot be
 * suspended by a plain ADMIN, and nobody can suspend themselves.
 */

const schema = z.object({
  action: z.enum(['suspend', 'activate']),
  reason: z.string().trim().max(300).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminWithCsrf(request)
    const { id } = await params
    const body = await parseBody(request, schema)

    if (id === admin.user.id) {
      throw badRequest('Anda tidak dapat mengubah status akun Anda sendiri.')
    }

    const target = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, status: true },
    })
    if (!target) throw notFound('Pengguna tidak ditemukan.')

    // An ADMIN must not be able to lock out a SUPER_ADMIN.
    if (target.role === 'SUPER_ADMIN' && admin.user.role !== 'SUPER_ADMIN') {
      throw badRequest('Hanya super admin yang dapat mengubah super admin lain.')
    }

    const status = body.action === 'suspend' ? 'SUSPENDED' : 'ACTIVE'

    await db.user.update({ where: { id }, data: { status } })

    if (status === 'SUSPENDED') {
      await revokeAllSessions(id)
    }

    await logActivity({
      userId: admin.user.id,
      event: status === 'SUSPENDED' ? 'admin.user.suspended' : 'admin.user.activated',
      title: status === 'SUSPENDED' ? 'Pengguna ditangguhkan' : 'Pengguna diaktifkan',
      detail: `${target.email}${body.reason ? ` — ${body.reason}` : ''}`,
      level: status === 'SUSPENDED' ? 'warning' : 'info',
    })

    // Tell the affected user what happened and why.
    await notify({
      userId: id,
      type: 'SECURITY_ALERT',
      title: status === 'SUSPENDED' ? 'Akun Anda ditangguhkan' : 'Akun Anda dipulihkan',
      message:
        status === 'SUSPENDED'
          ? body.reason ?? 'Administrator menangguhkan akun ini. Hubungi dukungan untuk detailnya.'
          : 'Administrator mengaktifkan kembali akun Anda.',
      severity: status === 'SUSPENDED' ? 'error' : 'success',
    })

    return ok({ id, status })
  } catch (error) {
    return fail(error)
  }
}
