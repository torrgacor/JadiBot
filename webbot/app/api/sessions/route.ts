import { z } from 'zod'
import { fail, created, paginated, parseBody, parseQuery } from '@/lib/api/response'
import { requireAuth, requireAuthWithCsrf } from '@/lib/auth/guards'
import { createSession, listSessions } from '@/lib/services/session-service'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { rateLimited } from '@/lib/errors'
import { paginationSchema, phoneSchema, sessionStatusSchema } from '@/lib/validation/schemas'

/**
 * GET  /api/sessions   → paginated list for the signed-in user
 * POST /api/sessions   → create a session and connect it
 */

export async function GET(request: Request) {
  try {
    const auth = await requireAuth()

    const query = parseQuery(
      request,
      paginationSchema.extend({
        status: sessionStatusSchema.optional(),
        q: z.string().trim().max(120).optional(),
      })
    )

    const { items, total } = await listSessions(auth.user.id, {
      status: query.status,
      search: query.q,
      page: query.page,
      pageSize: query.pageSize,
    })

    return paginated(items, total, query.page, query.pageSize)
  } catch (error) {
    return fail(error)
  }
}

const createSchema = z.object({
  name: z.string().trim().min(2, 'Beri nama untuk sesi ini.').max(60),
  description: z.string().trim().max(300).optional(),
  /**
   * The number this bot will run on. Stored on the session row and used as the
   * default for the pairing request, so the user sets it once here instead of
   * retyping it during the handshake.
   */
  phoneNumber: phoneSchema.optional(),
  autoReconnect: z.boolean().default(true),
  alwaysOnline: z.boolean().default(false),
  readReceipts: z.boolean().default(true),
  typingSimulation: z.boolean().default(false),
  defaultDelayMs: z.coerce.number().int().min(0).max(60_000).default(1200),
  // Left optional on purpose: when omitted, the service uses the configured
  // ENGINE_DRIVER. Defaulting here would silently override that setting.
  driver: z.enum(['local-baileys', 'nano-process']).optional(),
  connect: z.boolean().default(true),
})

export async function POST(request: Request) {
  try {
    const auth = await requireAuthWithCsrf(request)

    // Creating a session provisions a real WhatsApp socket; cap the rate so a
    // script cannot rapidly churn connections.
    const limit = await rateLimit('mutation', `sessions:create:${clientIp(request.headers)}`)
    if (!limit.allowed) {
      throw rateLimited('Terlalu banyak operasi sesi. Mohon perlambat.', limit.retryAfterSeconds)
    }

    const body = await parseBody(request, createSchema)

    const session = await createSession(auth.user.id, {
      name: body.name,
      description: body.description,
      phoneNumber: body.phoneNumber,
      autoReconnect: body.autoReconnect,
      alwaysOnline: body.alwaysOnline,
      readReceipts: body.readReceipts,
      typingSimulation: body.typingSimulation,
      defaultDelayMs: body.defaultDelayMs,
      driver: body.driver,
      connect: body.connect,
    })

    return created(session)
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
