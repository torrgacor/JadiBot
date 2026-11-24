import path from 'path'
import QRCode from 'qrcode'
import { db } from '@/lib/db'
import { engineClient } from '@/lib/engine/client'
import { assertCanCreateSession } from '@/lib/services/entitlements'
import { assertBotCanRun } from '@/lib/services/bot-access'
import { logActivity, notify } from '@/lib/auth/audit'
import { badRequest, notFound, sessionNotConnected } from '@/lib/errors'
import { EngineCapabilityError } from '@/lib/engine/types'
import { parseJsonArray } from '@/lib/utils/json'
import type { SessionStatus } from '@/types/enums'

/**
 * Session service.
 *
 * Owns the two-way mapping between a `WhatsAppSession` row and its engine
 * counterpart. The database is the source of truth for *configuration*; the
 * engine is the source of truth for *live state*, and the engine wins whenever
 * they disagree (it is the thing actually talking to WhatsApp).
 */

/**
 * Session ids are cuids minted by the database, but the value becomes a
 * directory name — so it is constrained before it is joined into a path. An id
 * containing `..` or a leading slash would otherwise resolve outside the
 * storage root (see the gateway's `assertSessionKey`, which enforces the same
 * rule on its side of the boundary).
 */
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

/** Absolute directory holding a session's Baileys credentials. */
export function authStateDir(sessionId: string): string {
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    throw badRequest('ID sesi tidak valid.')
  }
  const root = process.env.GATEWAY_STORAGE_DIR ?? './storage/sessions'
  return path.resolve(process.cwd(), root, sessionId)
}

/**
 * Reduce a typed number to the digits WhatsApp expects.
 *
 * The UI lets people type `+62 812-3456-7890` and the API accepts it, but the
 * engine and the pairing call only ever want `6281234567890`. Normalising in
 * one place keeps the stored value identical to the one actually used.
 */
function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  return digits.length >= 6 ? digits : null
}

export interface CreateSessionInput {
  name: string
  description?: string
  /**
   * The number this bot runs on, in international format. Persisted on the row
   * and reused as the default for the pairing request — it is never a
   * front-end-only value.
   */
  phoneNumber?: string
  autoReconnect?: boolean
  alwaysOnline?: boolean
  readReceipts?: boolean
  typingSimulation?: boolean
  defaultDelayMs?: number
  driver?: 'local-baileys' | 'nano-process'
  /** Connect immediately after creating. Defaults to true. */
  connect?: boolean
}

export async function createSession(userId: string, input: CreateSessionInput) {
  // Two gates, in order of fundamentality: an account with no active plan may
  // not run a bot at all, and an account that does have one may not exceed it.
  await assertBotCanRun(userId)
  await assertCanCreateSession(userId)

  // Default to the configured engine rather than hard-coding one: this platform
  // is built around the Nano bot, and the gateway reads the same env var.
  const driver =
    input.driver ?? (process.env.ENGINE_DRIVER === 'local-baileys' ? 'local-baileys' : 'nano-process')

  // The Nano driver needs the script configured; fail early with a clear
  // message instead of creating a session that can never connect.
  if (driver === 'nano-process' && !process.env.NANO_ENGINE_DIR) {
    throw badRequest(
      'Driver proses Nano memerlukan NANO_ENGINE_DIR yang menunjuk ke folder script Nano.'
    )
  }

  const session = await db.whatsAppSession.create({
    data: {
      userId,
      name: input.name,
      description: input.description ?? null,
      phoneNumber: normalizePhone(input.phoneNumber),
      driver,
      authStateDir: '',
      autoReconnect: input.autoReconnect ?? true,
      alwaysOnline: input.alwaysOnline ?? false,
      readReceipts: input.readReceipts ?? true,
      typingSimulation: input.typingSimulation ?? false,
      defaultDelayMs: input.defaultDelayMs ?? 1200,
      status: 'CREATED',
    },
  })

  // The auth-state path depends on the generated id, so it is set immediately
  // after creation in the same logical operation.
  await db.whatsAppSession.update({
    where: { id: session.id },
    data: { authStateDir: authStateDir(session.id) },
  })

  await engineClient.createSession({
    key: session.id,
    driver,
    authStateDir: authStateDir(session.id),
    name: session.name,
    autoReconnect: session.autoReconnect,
    alwaysOnline: session.alwaysOnline,
    readReceipts: session.readReceipts,
    typingSimulation: session.typingSimulation,
    defaultDelayMs: session.defaultDelayMs,
  })

  await logActivity({
    userId,
    sessionId: session.id,
    event: 'session.created',
    title: 'Sesi dibuat',
    detail: session.name,
    level: 'success',
  })

  if (input.connect !== false) {
    await connectSession(userId, session.id)
  }

  return getSession(userId, session.id)
}

/** Fetch one session, scoped to its owner. */
export async function getSession(userId: string, sessionId: string) {
  const session = await db.whatsAppSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      _count: {
        select: { messages: true, contacts: true, groups: true, automationRules: true },
      },
    },
  })

  if (!session) throw notFound('Sesi tidak ditemukan.')

  return session
}

export interface ListSessionsOptions {
  status?: SessionStatus
  search?: string
  page?: number
  pageSize?: number
}

export async function listSessions(userId: string, options: ListSessionsOptions = {}) {
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? 20

  const where = {
    userId,
    ...(options.status ? { status: options.status } : {}),
    ...(options.search
      ? {
          OR: [
            { name: { contains: options.search } },
            { phoneNumber: { contains: options.search } },
            { description: { contains: options.search } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    db.whatsAppSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.whatsAppSession.count({ where }),
  ])

  return { items, total, page, pageSize }
}

/**
 * Patchable session settings.
 *
 * `description` accepts null to explicitly clear it, which is distinct from
 * omitting the key (leave unchanged).
 */
export interface UpdateSessionInput {
  name?: string
  description?: string | null
  /** Null clears the stored number; a string replaces it. */
  phoneNumber?: string | null
  autoReconnect?: boolean
  alwaysOnline?: boolean
  readReceipts?: boolean
  typingSimulation?: boolean
  defaultDelayMs?: number
}

export async function updateSession(
  userId: string,
  sessionId: string,
  input: UpdateSessionInput
) {
  await getSession(userId, sessionId)

  const session = await db.whatsAppSession.update({
    where: { id: sessionId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.phoneNumber !== undefined
        ? { phoneNumber: normalizePhone(input.phoneNumber) }
        : {}),
      ...(input.autoReconnect !== undefined ? { autoReconnect: input.autoReconnect } : {}),
      ...(input.alwaysOnline !== undefined ? { alwaysOnline: input.alwaysOnline } : {}),
      ...(input.readReceipts !== undefined ? { readReceipts: input.readReceipts } : {}),
      ...(input.typingSimulation !== undefined
        ? { typingSimulation: input.typingSimulation }
        : {}),
      ...(input.defaultDelayMs !== undefined ? { defaultDelayMs: input.defaultDelayMs } : {}),
    },
  })

  await logActivity({
    userId,
    sessionId,
    event: 'session.updated',
    title: 'Pengaturan sesi diperbarui',
    detail: session?.name ?? null,
    level: 'info',
  })

  return session
}

export async function deleteSession(userId: string, sessionId: string) {
  const session = await getSession(userId, sessionId)

  // Remove engine state first. If this fails the DB row stays, so the user can
  // retry rather than being left with an orphaned socket nobody can manage.
  await engineClient.removeSession(sessionId)

  await db.whatsAppSession.delete({ where: { id: sessionId } })

  await logActivity({
    userId,
    event: 'session.deleted',
    title: 'Sesi dihapus',
    detail: session.name,
    level: 'warning',
  })
}

// ────────────────────────────────────────────────────────────── lifecycle ───

export async function connectSession(userId: string, sessionId: string) {
  const session = await getSession(userId, sessionId)

  // A bot may not be put online without an active plan or a running trial, no
  // matter which route the request took to get here.
  await assertBotCanRun(userId)

  // Re-assert the session in the engine: the gateway may have restarted since
  // this row was created, in which case it has no runtime for this key.
  await engineClient.createSession({
    key: session.id,
    driver: session.driver as 'local-baileys' | 'nano-process',
    authStateDir: session.authStateDir || authStateDir(session.id),
    name: session.name,
    autoReconnect: session.autoReconnect,
    alwaysOnline: session.alwaysOnline,
    readReceipts: session.readReceipts,
    typingSimulation: session.typingSimulation,
    defaultDelayMs: session.defaultDelayMs,
  })

  const state = await engineClient.connect(session.id)

  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: { status: state.status, statusMessage: state.statusMessage ?? null },
  })

  await logActivity({
    userId,
    sessionId,
    event: 'session.connect_requested',
    title: 'Koneksi dimulai',
    detail: session.name,
    level: 'info',
  })

  return state
}

export async function disconnectSession(userId: string, sessionId: string) {
  await getSession(userId, sessionId)
  const state = await engineClient.disconnect(sessionId)

  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: {
      status: state.status,
      statusMessage: state.statusMessage ?? null,
      connectedSince: null,
      lastDisconnectedAt: new Date(),
    },
  })

  await logActivity({
    userId,
    sessionId,
    event: 'session.disconnected',
    title: 'Sesi terputus',
    detail: 'Diputuskan secara manual',
    level: 'warning',
  })

  return state
}

export async function restartSession(userId: string, sessionId: string) {
  await getSession(userId, sessionId)
  await assertBotCanRun(userId)
  const state = await engineClient.restart(sessionId)

  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: { status: state.status, statusMessage: state.statusMessage ?? null },
  })

  return state
}

export async function logoutSession(userId: string, sessionId: string) {
  await getSession(userId, sessionId)
  await engineClient.logout(sessionId)

  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: {
      status: 'LOGGED_OUT',
      statusMessage: 'Sesi dilepas dari WhatsApp.',
      phoneNumber: null,
      profileName: null,
      profilePicUrl: null,
      connectedSince: null,
      lastDisconnectedAt: new Date(),
    },
  })

  await logActivity({
    userId,
    sessionId,
    event: 'session.logged_out',
    title: 'WhatsApp dilepas',
    detail: 'Perangkat dihapus dan kredensial lokal dihilangkan',
    level: 'warning',
  })

  await notify({
    userId,
    type: 'SESSION_DISCONNECTED',
    severity: 'warning',
    title: 'Sesi dilepas',
    message: 'Perangkat telah dilepas dari WhatsApp. Tautkan ulang untuk menyambung kembali.',
    actionUrl: `/dashboard/sessions/${sessionId}`,
  })
}

// ─────────────────────────────────────────────────────── qr / pairing ───────

export interface QrPayload {
  qr: string
  /** PNG data URL rendered from the real QR payload. */
  image: string
  expiresAt: string
}

/**
 * Request a fresh QR code and render it server-side.
 *
 * The `qr` value is the payload WhatsApp issued — we only encode it into an
 * image here. Nothing is generated locally.
 */
export async function requestQr(userId: string, sessionId: string): Promise<QrPayload> {
  await getSession(userId, sessionId)
  // Handing out a QR or pairing code starts a link attempt, so it is gated too.
  await assertBotCanRun(userId)
  const { qr, expiresAt } = await engineClient.refreshQr(sessionId)

  const image = await QRCode.toDataURL(qr, {
    width: 320,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#0b1220', light: '#ffffff' },
  })

  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: { status: 'QR_REQUIRED', lastQrAt: new Date() },
  })

  return { qr, image, expiresAt }
}

export async function requestPairingCode(
  userId: string,
  sessionId: string,
  phoneNumber?: string
) {
  const session = await getSession(userId, sessionId)
  await assertBotCanRun(userId)

  // Nano's single-session process cannot produce a pairing code for a session
  // that already has credentials; surface that rather than trying and failing.
  if (session.status === 'CONNECTED') {
    throw badRequest('Sesi ini sudah tertaut ke sebuah akun WhatsApp.')
  }

  // Prefer the number saved on the session (set on the Bot Number step) and
  // only fall back to one supplied with the request.
  const normalized = normalizePhone(phoneNumber ?? session.phoneNumber)
  if (!normalized || normalized.length < 8) {
    throw badRequest(
      'Masukkan nomor telepon internasional lengkap beserta kode negara, hanya angka.'
    )
  }

  const result = await engineClient.requestPairingCode({
    sessionKey: sessionId,
    phoneNumber: normalized,
  })

  await db.whatsAppSession.update({
    where: { id: sessionId },
    data: {
      status: 'PAIRING_REQUIRED',
      statusMessage: 'Masukkan kode pairing di ponsel Anda untuk menyelesaikan penautan.',
      phoneNumber: normalized,
    },
  })

  await logActivity({
    userId,
    sessionId,
    event: 'session.pairing_requested',
    title: 'Kode pairing diminta',
    detail: `Nomor berakhiran ${normalized.slice(-4)}`,
    level: 'info',
  })

  return result
}

/** Live engine state merged with the stored row. */
export async function getLiveState(userId: string, sessionId: string) {
  const session = await getSession(userId, sessionId)

  try {
    const state = await engineClient.getState(sessionId)
    if (!state) {
      return { session, engineOnline: true, live: null }
    }
    return { session, engineOnline: true, live: state }
  } catch {
    // Gateway unreachable — report that plainly instead of pretending.
    return { session, engineOnline: false, live: null }
  }
}

/**
 * Pull group metadata from the engine and reconcile it into the database.
 *
 * Upserts by `(sessionId, jid)`; groups that no longer exist on WhatsApp are
 * left in place rather than deleted, so historical message references stay
 * resolvable.
 */
export async function syncGroups(userId: string, sessionId: string) {
  const session = await getSession(userId, sessionId)

  if (session.status !== 'CONNECTED') {
    throw sessionNotConnected()
  }

  let groups
  try {
    groups = await engineClient.listGroups(sessionId)
  } catch (error) {
    // A driver that cannot export groups says so explicitly — pass that through
    // as a 400 with the driver's own explanation.
    if (error instanceof EngineCapabilityError) throw badRequest(error.message)
    throw error
  }

  await db.$transaction(async (tx) => {
    for (const group of groups) {
      const record = await tx.group.upsert({
        where: { sessionId_jid: { sessionId, jid: group.jid } },
        update: {
          name: group.name,
          description: group.description ?? null,
          inviteCode: group.inviteCode ?? null,
          isAdmin: group.isAdmin,
          memberCount: group.memberCount,
          pictureUrl: group.pictureUrl ?? null,
          syncedAt: new Date(),
        },
        create: {
          userId,
          sessionId,
          name: group.name,
          jid: group.jid,
          description: group.description ?? null,
          inviteCode: group.inviteCode ?? null,
          isAdmin: group.isAdmin,
          memberCount: group.memberCount,
          pictureUrl: group.pictureUrl ?? null,
          createdAtWa: group.createdAt ? new Date(group.createdAt) : null,
        },
      })

      // Replace the participant list wholesale: it is always published as a
      // complete snapshot by the engine, so a diff would be strictly worse.
      if (!record) continue
      await tx.groupMember.deleteMany({ where: { groupId: record.id } })

      if (group.participants.length > 0) {
        await tx.groupMember.createMany({
          data: group.participants.map((participant) => ({
            groupId: record.id,
            jid: participant.jid,
            phone: participant.phone ?? null,
            name: participant.name ?? null,
            isAdmin: participant.isAdmin,
            isSuperAdmin: participant.isSuperAdmin,
          })),
        })
      }
    }
  })

  await logActivity({
    userId,
    sessionId,
    event: 'group.updated',
    title: 'Grup disinkronkan',
    detail: `${groups.length} grup disinkronkan dari WhatsApp`,
    level: 'success',
  })

  return { synced: groups.length }
}

export { parseJsonArray }
