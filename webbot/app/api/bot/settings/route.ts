import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAuthWithCsrf } from '@/lib/auth/guards'
import { applyBotSettingForUser } from '@/lib/services/bot-service'
import { rateLimit } from '@/lib/security/rate-limit'
import { rateLimited } from '@/lib/errors'
import { botSettingSchema } from '@/lib/validation/schemas'

/**
 * POST /api/bot/settings
 *
 * Applies one runtime setting to the caller's own bot database. The operation is
 * a discriminated union, so an unknown setting never reaches the gateway.
 */

export async function POST(request: Request) {
  try {
    const auth = await requireAuthWithCsrf(request)

    const limit = await rateLimit('mutation', `bot:setting:${auth.user.id}`)
    if (!limit.allowed) {
      throw rateLimited(
        'Terlalu banyak perubahan setting. Coba lagi sebentar lagi.',
        limit.retryAfterSeconds
      )
    }

    const body = await parseBody(request, botSettingSchema)
    const result = await applyBotSettingForUser(auth.user.id, body)
    return ok(result)
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
