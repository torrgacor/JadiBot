import { db } from '@/lib/db'
import { engineClient } from '@/lib/engine/client'
import { authStateDir } from '@/lib/services/session-service'
import { getBotAccess } from '@/lib/services/bot-access'
import { stopUserSessions } from '@/lib/services/trial'
import { logActivity } from '@/lib/auth/audit'
import type { SessionStatus } from '@/types/enums'

/**
 * Session restore.
 *
 * The gateway keeps live WhatsApp connections in memory only — that is
 * deliberate, since a child process cannot outlive its supervisor. So when the
 * service is restarted, a bot that was up before has nothing running it any
 * more, even though its credentials are still perfectly good on disk.
 *
 * This pass closes that gap: for every session the user asked to keep alive
 * (`autoReconnect`), it re-registers the session with the engine and asks it to
 * connect again. Nothing is invented — if the credentials are gone the session
 * is marked `AUTH_REQUIRED` instead, which is the honest state and tells the
 * user exactly what to do.
 *
 * The database lives in the web app, not the gateway, so this runs here: the web
 * app decides *what* should be running, the gateway owns *how*.
 */

/**
 * Statuses worth restoring: anything that means "this bot was meant to be up".
 * `LOGGED_OUT` and `BANNED` are deliberately excluded — those need a human, not
 * a retry.
 *
 * Sessions whose owner is no longer entitled to a bot — a trial that ran out,
 * a plan that closed, an account with no plan at all — are excluded as well: a
 * restart must not undo a lock.
 */
const RESUMABLE: SessionStatus[] = [
  'CONNECTED',
  'CONNECTING',
  'RECONNECTING',
  'QR_REQUIRED',
  'PAIRING_REQUIRED',
]

export interface RestoreSummary {
  /** Sessions the engine accepted and started connecting. */
  restored: number
  /** Sessions whose credentials are missing, so they need a fresh link. */
  needsAuth: number
  /** Sessions the restore could not touch (engine down, no runtime, …). */
  failed: number
  /** Total candidates examined. */
  considered: number
}

/** Only ever run once per process — instrumentation can be invoked repeatedly. */
let hasRun = false

export async function restoreSessions(): Promise<RestoreSummary> {
  const summary: RestoreSummary = { restored: 0, needsAuth: 0, failed: 0, considered: 0 }

  if (hasRun) return summary
  hasRun = true

  const sessions = await db.whatsAppSession.findMany({
    where: { autoReconnect: true, status: { in: RESUMABLE } },
    select: {
      id: true,
      userId: true,
      name: true,
      driver: true,
      authStateDir: true,
      status: true,
      phoneNumber: true,
      lastConnectedAt: true,
      connectedSince: true,
    },
  })

  /*
    A bot whose account is not entitled must not be resurrected by a restart.
    The lock itself stops the sessions; this is the other half of the guarantee,
    because a web restart a minute later would otherwise bring them straight
    back up.

    Judged per owner through the same gate the API uses, so there is exactly one
    definition of "may run a bot" — and a paying customer can never lose their
    bot to leftover trial bookkeeping. For an account that is not entitled the
    sessions are stopped here rather than quietly skipped, because the honest
    `DISCONNECTED` row and its reason have to come from somewhere.
  */
  const owners = [...new Set(sessions.map((session) => session.userId))]
  const blocked = new Map<string, string>()

  await Promise.all(
    owners.map(async (userId) => {
      try {
        const access = await getBotAccess(userId)
        if (access.allowed) return
        blocked.set(userId, access.message)
        await stopUserSessions(userId, access.message)
      } catch (error) {
        // A failed decision must not block the other accounts' restores.
        console.warn(`[restore] gagal memeriksa akses pengguna ${userId}:`, error)
      }
    })
  )

  const candidates = sessions.filter((session) => !blocked.has(session.userId))

  summary.considered = candidates.length
  if (candidates.length === 0) return summary

  for (const session of candidates) {
    // A Nano session cannot run without the script configured; leave the row
    // untouched rather than marking it as broken.
    if (session.driver === 'nano-process' && !process.env.NANO_ENGINE_DIR) {
      summary.failed += 1
      continue
    }

    try {
      // Re-register with the engine first. `createSession` is idempotent — after
      // a gateway restart it prepares the runtime, and when the gateway is still
      // running it simply returns the existing snapshot.
      const prepared = await engineClient.createSession({
        key: session.id,
        driver: session.driver as 'local-baileys' | 'nano-process',
        authStateDir: session.authStateDir || authStateDir(session.id),
        name: session.name,
        autoReconnect: true,
      })

      /*
        Two independent signals have to agree before we start a process:

          1. the engine found a credential file to try, and
          2. our own history says this bot was actually linked once.

        The second check exists because the credential *file* is a poor witness
        on its own: Nano creates its `auth.db` the first time it runs, before any
        device is linked, so the file proves only that the bot has run — not that
        it can be resumed. Without this, a never-linked bot would be relaunched on
        every restart purely to print a QR code nobody asked for.
      */
      const wasLinked = Boolean(
        session.phoneNumber || session.lastConnectedAt || session.connectedSince
      )

      if (prepared.hasCredentials === false || !wasLinked) {
        await db.whatsAppSession.update({
          where: { id: session.id },
          data: {
            status: 'AUTH_REQUIRED',
            statusMessage: wasLinked
              ? 'Kredensial tersimpan tidak lagi tersedia setelah layanan dijalankan ulang. Tautkan ulang perangkat ini.'
              : 'Sesi ini belum pernah tertaut ke sebuah perangkat. Tautkan dengan kode penautan atau kode QR untuk menjalankannya.',
          },
        })

        await logActivity({
          userId: session.userId,
          sessionId: session.id,
          event: 'session.auth_required',
          title: wasLinked ? 'Perlu taut ulang' : 'Belum tertaut',
          detail: `${session.name} tidak dijalankan otomatis karena belum ada penautan yang bisa dipulihkan`,
          level: 'warning',
        })

        summary.needsAuth += 1
        continue
      }

      const state = await engineClient.connect(session.id)

      await db.whatsAppSession.update({
        where: { id: session.id },
        data: { status: state.status, statusMessage: state.statusMessage ?? null },
      })

      await logActivity({
        userId: session.userId,
        sessionId: session.id,
        event: 'session.restored',
        title: 'Sesi dipulihkan',
        detail: `${session.name} dijalankan kembali setelah layanan dimulai ulang`,
        level: 'info',
      })

      summary.restored += 1
    } catch {
      // The engine may not be up yet, or may refuse this session. Either way
      // one failure must not stop the others, and the stored row is left as it
      // was so nothing is lost.
      summary.failed += 1
    }
  }

  return summary
}
