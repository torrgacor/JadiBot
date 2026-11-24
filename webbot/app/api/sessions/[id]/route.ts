import { z } from 'zod'
import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAuth, requireAuthWithCsrf } from '@/lib/auth/guards'
import { phoneSchema } from '@/lib/validation/schemas'
import {
  deleteSession,
  getLiveState,
  updateSession,
} from '@/lib/services/session-service'

/**
 * GET    /api/sessions/:id   → stored row + live engine state
 * PATCH  /api/sessions/:id   → update settings
 * DELETE /api/sessions/:id   → remove the session and its credentials
 */

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const auth = await requireAuth()
    const { id } = await params
    const result = await getLiveState(auth.user.id, id)
    return ok(result)
  } catch (error) {
    return fail(error)
  }
}

const patchSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  description: z.string().trim().max(300).nullable().optional(),
  /** Null clears it; the pairing request then asks the user for the number. */
  phoneNumber: phoneSchema.nullable().optional(),
  autoReconnect: z.boolean().optional(),
  alwaysOnline: z.boolean().optional(),
  readReceipts: z.boolean().optional(),
  typingSimulation: z.boolean().optional(),
  defaultDelayMs: z.coerce.number().int().min(0).max(60_000).optional(),
})

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAuthWithCsrf(request)
    const { id } = await params
    const body = await parseBody(request, patchSchema)

    const session = await updateSession(auth.user.id, id, body)
    return ok(session)
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const auth = await requireAuthWithCsrf(request)
    const { id } = await params

    await deleteSession(auth.user.id, id)
    return ok({ deleted: true })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
