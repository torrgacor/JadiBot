import { z } from 'zod'
import { db } from '@/lib/db'
import { created, fail, ok, paginated, parseBody, parseQuery } from '@/lib/api/response'
import { requireAuth, requireAuthWithCsrf } from '@/lib/auth/guards'
import { paginationSchema } from '@/lib/validation/schemas'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { rateLimited, isUniqueConstraintError } from '@/lib/errors'
import { logActivity } from '@/lib/auth/audit'

/**
 * GET  /api/support/tickets — the caller's own tickets.
 * POST /api/support/tickets — open a ticket, with the opening message.
 *
 * Scoped to the signed-in user in both directions: a user can never read or
 * append to someone else's ticket.
 */

const TICKET_CATEGORIES = ['BILLING', 'TECHNICAL', 'WHATSAPP_SESSION', 'API', 'OTHER'] as const
const TICKET_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const

const createSchema = z.object({
  subject: z.string().trim().min(4, 'Beri subjek untuk tiket ini.').max(140),
  category: z.enum(TICKET_CATEGORIES).default('TECHNICAL'),
  priority: z.enum(TICKET_PRIORITIES).default('NORMAL'),
  message: z.string().trim().min(10, 'Jelaskan masalahnya sedikit lebih rinci.').max(5000),
})

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth()
    const { page, pageSize } = parseQuery(request, paginationSchema)

    const [items, total] = await Promise.all([
      db.ticket.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          reference: true,
          subject: true,
          category: true,
          priority: true,
          status: true,
          createdAt: true,
          lastReplyAt: true,
          _count: { select: { messages: true } },
        },
      }),
      db.ticket.count({ where: { userId: user.id } }),
    ])

    return paginated(items, total, page, pageSize)
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuthWithCsrf(request)
    const input = await parseBody(request, createSchema)

    // Opening tickets is cheap for the user but not for whoever reads them.
    const limit = await rateLimit('mutation', `tickets:create:${clientIp(request.headers)}`)
    if (!limit.allowed) {
      throw rateLimited('Terlalu banyak tiket dibuat. Silakan coba lagi nanti.', limit.retryAfterSeconds)
    }

    const ticket = await createTicketWithReference(user.id, input)

    await logActivity({
      userId: user.id,
      event: 'ticket.created',
      title: 'Tiket dukungan dibuka',
      detail: `${ticket.reference} — ${input.subject}`,
      level: 'info',
      ip: clientIp(request.headers),
    })

    return created(ticket)
  } catch (error) {
    return fail(error)
  }
}

/**
 * Create a ticket with a human-readable reference.
 *
 * `reference` is unique, so two people opening a ticket at the same moment would
 * collide on a naive count. Retrying on a conflict keeps the format readable
 * without a dedicated sequence table.
 */
async function createTicketWithReference(
  userId: string,
  input: z.infer<typeof createSchema>
): Promise<{ id: string; reference: string }> {
  const year = new Date().getFullYear()
  let sequence = await db.ticket.count()

  for (let attempt = 0; attempt < 5; attempt += 1) {
    sequence += 1
    const reference = `QG-${year}-${String(sequence).padStart(4, '0')}`

    try {
      const ticket = await db.ticket.create({
        data: {
          userId,
          reference,
          subject: input.subject,
          category: input.category,
          priority: input.priority,
          status: 'OPEN',
        },
        select: { id: true, reference: true },
      })
      if (input.message) {
        await db.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            userId,
            body: input.message,
            isStaffReply: false,
          },
        })
      }
      return ticket
    } catch (error) {
      const isConflict = isUniqueConstraintError(error)
      if (!isConflict) throw error
      // Someone took this reference; try the next one.
    }
  }

  throw new Error('Gagal membuat nomor tiket. Silakan coba lagi.')
}
