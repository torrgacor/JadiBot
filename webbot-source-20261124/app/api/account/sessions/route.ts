import { z } from 'zod'
import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAuth, requireAuthWithCsrf } from '@/lib/auth/guards'
import { db } from '@/lib/db'
import { revokeOtherSessions, revokeSession } from '@/lib/auth/session'
import { logActivity } from '@/lib/auth/audit'
import { badRequest } from '@/lib/errors'

/**
 * GET    /api/account/sessions         → active devices
 * DELETE /api/account/sessions?id=...  → revoke one device
 * DELETE /api/account/sessions?all=1   → revoke every other device
 *
 * These are *login* sessions (browsers), distinct from WhatsApp sessions.
 */

export async function GET() {
  try {
    const context = await requireAuth()

    const sessions = await db.loginSession.findMany({
      where: {
        userId: context.user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        device: true,
        ip: true,
        location: true,
        rememberMe: true,
        createdAt: true,
        lastActiveAt: true,
        expiresAt: true,
      },
    })

    return ok(
      sessions.map((session) => ({
        ...session,
        // Lets the UI label the row the user is currently on.
        isCurrent: session.id === context.sessionId,
      }))
    )
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const context = await requireAuthWithCsrf(request)
    const url = new URL(request.url)

    if (url.searchParams.get('all') === '1') {
      const revoked = await revokeOtherSessions(context.user.id, context.token)
      await logActivity({
        userId: context.user.id,
        event: 'auth.sessions_revoked',
        title: 'Signed out all other devices',
        detail: `${revoked} session(s) revoked`,
        level: 'warning',
      })
      return ok({ revoked })
    }

    const { id } = await parseBody(request, z.object({ id: z.string().min(1) }))

    if (id === context.sessionId) {
      throw badRequest(
        'Anda tidak dapat mencabut sesi yang sedang Anda pakai. Keluar saja sebagai gantinya.'
      )
    }

    await revokeSession(context.user.id, id)
    await logActivity({
      userId: context.user.id,
      event: 'auth.session_revoked',
      title: 'Device signed out',
      detail: `Session ${id} revoked`,
      level: 'warning',
    })

    return ok({ revoked: 1, id })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
