import { z } from 'zod'
import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAuthWithCsrf, requireAuth } from '@/lib/auth/guards'
import {
  connectSession,
  disconnectSession,
  logoutSession,
  requestPairingCode,
  requestQr,
  restartSession,
  syncGroups,
} from '@/lib/services/session-service'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { rateLimited } from '@/lib/errors'
import { phoneSchema } from '@/lib/validation/schemas'

/**
 * POST /api/sessions/:id/actions
 *
 * One endpoint for every lifecycle action. Keeping them together means the CSRF
 * check, ownership check and rate limit are applied once, and a new action
 * cannot accidentally ship without them.
 */

type Params = { params: Promise<{ id: string }> }

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('connect') }),
  z.object({ action: z.literal('disconnect') }),
  z.object({ action: z.literal('restart') }),
  z.object({ action: z.literal('logout') }),
  z.object({ action: z.literal('refresh-qr') }),
  z.object({ action: z.literal('sync-groups') }),
  z.object({
    action: z.literal('pairing-code'),
    /**
     * Optional: when omitted the session's stored bot number is used, so the
     * number the user saved during setup is the one that gets requested.
     */
    phoneNumber: phoneSchema.optional(),
  }),
])

export async function POST(request: Request, { params }: Params) {
  try {
    const auth = await requireAuthWithCsrf(request)
    const { id } = await params

    // Lifecycle actions hit WhatsApp; throttle them per user.
    const limit = await rateLimit('mutation', `session-action:${auth.user.id}`)
    if (!limit.allowed) {
      throw rateLimited(
        'Terlalu banyak operasi sesi. Mohon tunggu sebentar.',
        limit.retryAfterSeconds
      )
    }

    const body = await parseBody(request, schema)

    switch (body.action) {
      case 'connect':
        return ok(await connectSession(auth.user.id, id))

      case 'disconnect':
        return ok(await disconnectSession(auth.user.id, id))

      case 'restart':
        return ok(await restartSession(auth.user.id, id))

      case 'logout':
        await logoutSession(auth.user.id, id)
        return ok({ done: true, status: 'LOGGED_OUT' })

      case 'refresh-qr':
        return ok(await requestQr(auth.user.id, id))

      case 'sync-groups':
        return ok(await syncGroups(auth.user.id, id))

      case 'pairing-code':
        return ok(await requestPairingCode(auth.user.id, id, body.phoneNumber))
    }
  } catch (error) {
    return fail(error)
  }
}

/** GET returns the live engine state, useful for a poll-on-focus refresh. */
export async function GET(_request: Request, { params }: Params) {
  try {
    const auth = await requireAuth()
    const { id } = await params
    const { getLiveState } = await import('@/lib/services/session-service')
    return ok(await getLiveState(auth.user.id, id))
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
