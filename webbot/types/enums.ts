/**
 * Domain enums.
 *
 * SQLite has no native enum support in Prisma, so every "enum" column is a
 * String in the schema and validated here. Keeping the allowed values in one
 * place means the API, the UI and the DB can never drift apart.
 */

export const USER_ROLES = ['USER', 'ADMIN', 'SUPER_ADMIN'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'DELETED'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const SESSION_STATUSES = [
  'CREATED',
  'CONNECTING',
  'QR_REQUIRED',
  'PAIRING_REQUIRED',
  'CONNECTED',
  'DISCONNECTED',
  'RECONNECTING',
  'LOGGED_OUT',
  /**
   * The device was linked once but its stored credentials are gone or were
   * rejected, so the engine cannot reconnect without a new handshake. Distinct
   * from `LOGGED_OUT`, which means the user deliberately unlinked the device.
   */
  'AUTH_REQUIRED',
  'BANNED',
  'ERROR',
] as const
export type SessionStatus = (typeof SESSION_STATUSES)[number]

export const MESSAGE_STATUSES = [
  'PENDING',
  'QUEUED',
  'SENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
] as const
export type MessageStatus = (typeof MESSAGE_STATUSES)[number]

export const MESSAGE_TYPES = [
  'text',
  'image',
  'video',
  'audio',
  'document',
  'sticker',
  'location',
  'contact',
] as const
export type MessageType = (typeof MESSAGE_TYPES)[number]

export const MESSAGE_DIRECTIONS = ['OUTBOUND', 'INBOUND'] as const
export type MessageDirection = (typeof MESSAGE_DIRECTIONS)[number]

export const CAMPAIGN_STATUSES = [
  'DRAFT',
  'RUNNING',
  'PAUSED',
  'COMPLETED',
  'FAILED',
  'CANCELED',
] as const
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]

export const SCHEDULE_STATUSES = [
  'PENDING',
  'RUNNING',
  'DONE',
  'FAILED',
  'CANCELED',
] as const
export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number]

export const SUBSCRIPTION_STATUSES = [
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'EXPIRED',
  'TRIALING',
] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const PAYMENT_STATUSES = [
  'SUCCESS',
  'PENDING',
  'FAILED',
  'REFUNDED',
] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const TICKET_STATUSES = ['OPEN', 'PENDING', 'ANSWERED', 'CLOSED'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const TICKET_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]

export const TICKET_CATEGORIES = [
  'BILLING',
  'TECHNICAL',
  'WHATSAPP_SESSION',
  'API',
  'OTHER',
] as const
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]

export const JOB_STATUSES = ['PENDING', 'RUNNING', 'DONE', 'FAILED', 'DEAD'] as const
export type JobStatus = (typeof JOB_STATUSES)[number]

export const JOB_TYPES = [
  'send_message',
  'campaign_batch',
  'scheduled_message',
  'sync_groups',
  'usage_reset',
  'subscription_renewal',
  'cleanup',
] as const
export type JobType = (typeof JOB_TYPES)[number]

export const NOTIFICATION_TYPES = [
  'SESSION_DISCONNECTED',
  'MESSAGE_FAILED',
  'API_LIMIT',
  'PAYMENT_SUCCESS',
  'SUBSCRIPTION_EXPIRED',
  /** A paid period is about to end and the bot will stop unless it is renewed. */
  'SUBSCRIPTION_RENEWAL',
  'SECURITY_ALERT',
  'TICKET_REPLY',
  'SYSTEM',
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const NOTIFICATION_SEVERITIES = ['info', 'success', 'warning', 'error'] as const
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number]

export const MATCH_OPERATORS = [
  'contains',
  'equals',
  'starts_with',
  'ends_with',
  'regex',
] as const
export type MatchOperator = (typeof MATCH_OPERATORS)[number]

export const AUTOMATION_ACTIONS = [
  'send_text',
  'send_media',
  'delay',
  'mark_read',
  'add_tag',
] as const
export type AutomationActionType = (typeof AUTOMATION_ACTIONS)[number]

export const CHAT_SCOPES = ['all', 'private', 'group'] as const
export type ChatScope = (typeof CHAT_SCOPES)[number]

// ──────────────────────────────────────────────────────────── label maps ─────

export const STATUS_LABELS: Record<SessionStatus, string> = {
  CREATED: 'Dibuat',
  CONNECTING: 'Menghubungkan',
  QR_REQUIRED: 'Perlu scan QR',
  PAIRING_REQUIRED: 'Perlu kode pairing',
  CONNECTED: 'Terhubung',
  DISCONNECTED: 'Terputus',
  RECONNECTING: 'Menyambung ulang',
  LOGGED_OUT: 'Sudah logout',
  AUTH_REQUIRED: 'Perlu taut ulang',
  BANNED: 'Diblokir',
  ERROR: 'Error',
}

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  PENDING: 'Menunggu',
  QUEUED: 'Dalam antrean',
  SENDING: 'Mengirim',
  SENT: 'Terkirim',
  DELIVERED: 'Diterima',
  READ: 'Dibaca',
  FAILED: 'Gagal',
}

/**
 * Catalogue slugs, in storefront order. `trial` is the time-boxed free tier and
 * `free` is the (unadvertised) fallback every new account starts on.
 */
export const PLAN_SLUGS = [
  'trial',
  'starter',
  'pro',
  'popular',
  'premium',
  'ultimate',
  'free',
] as const
export type PlanSlug = (typeof PLAN_SLUGS)[number]
