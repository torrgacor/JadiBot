import { z } from 'zod'
import { requireAuth } from '@/lib/auth/guards'
import { fail, ok, parseQuery } from '@/lib/api/response'
import { getNanoPlugins } from '@/lib/services/nano-service'

const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  // Query params arrive as strings; "true" is the only truthy spelling we accept.
  activeOnly: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  /** `free` = never spends the user's daily limit, `limited` = does. */
  limit: z.enum(['free', 'limited']).optional(),
})

/**
 * GET /api/nano/plugins?q=&category=&limit=&activeOnly=
 *
 * The command catalogue, read from the engine's own plugin loader. Filtering is
 * done server-side so the client never downloads all ~200 entries, and `scope`
 * carries the counts per category for the current search/limit so the UI can
 * label its filters with numbers that match what clicking them shows.
 */
export async function GET(request: Request) {
  try {
    await requireAuth()
    const query = parseQuery(request, querySchema)

    const { filtered, ...catalogue } = await getNanoPlugins({
      q: query.q,
      category: query.category,
      limit: query.limit,
      activeOnly: query.activeOnly,
    })

    return ok({ ...catalogue, plugins: filtered })
  } catch (error) {
    return fail(error)
  }
}
