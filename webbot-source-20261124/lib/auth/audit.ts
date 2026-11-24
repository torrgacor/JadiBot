import { db } from '@/lib/db'
import { stringifyJson } from '@/lib/utils/json'
import type { NotificationSeverity, NotificationType } from '@/types/enums'

/**
 * Audit trail + notification fan-out.
 *
 * Both are fire-and-forget by design: failing to record an audit entry must
 * never fail the user's actual operation. Errors are logged, not thrown.
 */

export interface ActivityInput {
  userId?: string | null
  sessionId?: string | null
  /** Machine-readable event name, e.g. "session.connected". */
  event: string
  title: string
  detail?: string | null
  level?: 'info' | 'success' | 'warning' | 'error'
  metadata?: unknown
  ip?: string | null
}

export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        userId: input.userId ?? null,
        sessionId: input.sessionId ?? null,
        event: input.event,
        title: input.title,
        detail: input.detail ?? null,
        level: input.level ?? 'info',
        metadata: input.metadata ? stringifyJson(input.metadata) : null,
        ip: input.ip ?? null,
      },
    })
  } catch (error) {
    console.error('[audit] failed to write activity log', error)
  }
}

export interface NotificationInput {
  userId: string
  type: NotificationType
  severity?: NotificationSeverity
  title: string
  message: string
  actionUrl?: string
  metadata?: unknown
}

export async function notify(input: NotificationInput) {
  try {
    return await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        severity: input.severity ?? 'info',
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl ?? null,
        metadata: input.metadata ? stringifyJson(input.metadata) : null,
      },
    })
  } catch (error) {
    console.error('[audit] failed to create notification', error)
    return null
  }
}

/**
 * Notification that also respects the user's channel preferences.
 * Returns true when an in-app notification row was created.
 */
export async function notifyRespectingPreferences(
  input: NotificationInput
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { notifyPush: true },
  })
  if (!user?.notifyPush) return false
  const created = await notify(input)
  return Boolean(created)
}
