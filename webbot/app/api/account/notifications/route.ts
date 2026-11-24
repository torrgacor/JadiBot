import { z } from 'zod'
import { db } from '@/lib/db'
import { fail, ok, paginated, parseBody, parseQuery } from '@/lib/api/response'
import { requireAuth, requireAuthWithCsrf } from '@/lib/auth/guards'
import { paginationSchema } from '@/lib/validation/schemas'

/**
 * GET   /api/account/notifications          → paginated list
 * PATCH /api/account/notifications          → { action: "read-all" } | { action: "read", id }
 */

export async function GET(request: Request) {
  try {
    const context = await requireAuth()
    const { page, pageSize } = parseQuery(request, paginationSchema)

    const [items, total] = await Promise.all([
      db.notification.findMany({
        where: { userId: context.user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.notification.count({ where: { userId: context.user.id } }),
    ])

    return paginated(items, total, page, pageSize)
  } catch (error) {
    return fail(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireAuthWithCsrf(request)
    const body = await parseBody(
      request,
      z.discriminatedUnion('action', [
        z.object({ action: z.literal('read-all') }),
        z.object({ action: z.literal('read'), id: z.string().min(1) }),
      ])
    )

    if (body.action === 'read-all') {
      const result = await db.notification.updateMany({
        where: { userId: context.user.id, readAt: null },
        data: { readAt: new Date() },
      })
      return ok({ updated: result.count })
    }

    // Scoped to the caller so one user cannot mark another user's rows.
    const result = await db.notification.updateMany({
      where: { id: body.id, userId: context.user.id },
      data: { readAt: new Date() },
    })

    return ok({ updated: result.count })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
