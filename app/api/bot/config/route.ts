import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAuthWithCsrf } from '@/lib/auth/guards'
import { updateEngineConfigForUser } from '@/lib/services/bot-service'
import { rateLimit } from '@/lib/security/rate-limit'
import { rateLimited } from '@/lib/errors'
import { botConfigSchema } from '@/lib/validation/schemas'

/**
 * POST /api/bot/config
 *
 * Rewrites whitelisted keys in the script's own `config/settings.js`.
 *
 * Admin-only: that file is shared by every bot in the installation, so letting a
 * user change `botName` would change it for everyone. The gateway keeps a backup
 * of the previous version and refuses to install a file it cannot parse back.
 */

export async function POST(request: Request) {
  try {
    const auth = await requireAuthWithCsrf(request)

    const limit = await rateLimit('mutation', `bot:config:${auth.user.id}`)
    if (!limit.allowed) {
      throw rateLimited(
        'Terlalu banyak perubahan konfigurasi. Coba lagi sebentar lagi.',
        limit.retryAfterSeconds
      )
    }

    const body = await parseBody(request, botConfigSchema)
    const result = await updateEngineConfigForUser(auth.user, body)
    return ok(result)
  } catch (error) {
    return fail(error)
  }
}

export const dynamic = 'force-dynamic'
