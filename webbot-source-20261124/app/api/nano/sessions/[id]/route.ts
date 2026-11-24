import { requireAuth } from '@/lib/auth/guards'
import { fail, ok } from '@/lib/api/response'
import { getNanoSessionDataForUser } from '@/lib/services/nano-service'

/**
 * GET /api/nano/sessions/:id
 *
 * One bot's own data — users, premium flags, custom prefixes, group settings and
 * schedules — read from the database that bot writes. Ownership is enforced, so
 * this can only ever return the caller's own session.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth()
    const { id } = await params
    return ok(await getNanoSessionDataForUser(id, user.id))
  } catch (error) {
    return fail(error)
  }
}
