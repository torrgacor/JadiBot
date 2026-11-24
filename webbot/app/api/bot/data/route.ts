import { fail, ok } from '@/lib/api/response'
import { requireAuth } from '@/lib/auth/guards'
import { getBotPageData } from '@/lib/services/bot-service'

/**
 * GET /api/bot/data
 *
 * Everything the bot pages poll after a change: the live engine state plus the
 * contents of the bot's own database. Reads the same sources the server-rendered
 * page does, so a refresh never shows a different truth.
 */

export async function GET() {
  try {
    const auth = await requireAuth()
    const { session, live, engineOffline, botData } = await getBotPageData(auth.user.id)

    return ok({
      sessionId: session?.id ?? null,
      live,
      engineOffline,
      botData,
    })
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
