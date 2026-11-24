import { z } from 'zod'
import QRCode from 'qrcode'
import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAuthWithCsrf } from '@/lib/auth/guards'
import { getSession } from '@/lib/services/session-service'

/**
 * POST /api/sessions/:id/qr-image
 *
 * The gateway streams raw QR payloads (via realtime events). Rendering them
 * `qrcode` in the browser would ship that library to every client, so instead
 * the client posts the payload back here and receives a PNG data URL.
 *
 * The payload is a real string issued by WhatsApp — this endpoint only encodes
 * it. Ownership is verified before any work happens, so a session id cannot be
 * used to render someone else's code.
 */

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const auth = await requireAuthWithCsrf(request)
    const { id } = await params

    // Throws 404 when the session is not owned by the caller.
    await getSession(auth.user.id, id)

    const { payload } = await parseBody(
      request,
      z.object({ payload: z.string().min(8).max(4096) })
    )

    const image = await QRCode.toDataURL(payload, {
      width: 512,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0b1220', light: '#ffffff' },
    })

    return ok({ image })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
