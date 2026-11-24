import { requireAuth } from '@/lib/auth/guards'
import { fail, ok } from '@/lib/api/response'
import { getNanoOverview } from '@/lib/services/nano-service'

/**
 * GET /api/nano/overview
 *
 * Installation health, live bot config and the plugin breakdown — everything
 * the Nano features page needs in one round trip. Read-only: this endpoint
 * never modifies the installation.
 *
 * The absolute path of the installation is deliberately removed before the
 * payload leaves the server. No screen renders it, and a filesystem layout is
 * exactly the kind of detail that turns a harmless information leak into a
 * useful one for someone probing the host.
 */
export async function GET() {
  try {
    await requireAuth()
    const overview = await getNanoOverview()
    return ok({ ...overview, install: { ...overview.install, dir: null } })
  } catch (error) {
    return fail(error)
  }
}
