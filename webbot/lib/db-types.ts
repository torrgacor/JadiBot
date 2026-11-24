/**
 * Row types for the MongoDB data layer.
 *
 * These mirror the Prisma model shapes (from prisma/schema.prisma) as plain
 * TypeScript interfaces. The 8 files that previously did
 * `import type { User } from '@prisma/client'` now do
 * `import type { User } from '@/lib/db'` (re-exported from here).
 *
 * The `_id` field is stripped by the adapter before rows are returned to
 * callers, so these types never mention `_id`.
 */

export interface User {
  id: string
  email: string
  _count?: { whatsappSessions: number; notifications: number; activityLogs: number }
  username: string
  name: string
  passwordHash: string
  avatarUrl?: string | null
  phone?: string | null
  timezone: string
  locale: string
  role: string
  status: string
  emailVerifiedAt?: Date | null
  lastLoginAt?: Date | null
  lastLoginIp?: string | null
  twoFactorEnabled: boolean
  twoFactorSecret?: string | null
  twoFactorBackupCodes?: string | null
  failedLoginAttempts: number
  lockedUntil?: Date | null
  themePreference: string
  notifyEmail: boolean
  notifyPush: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LoginSession {
  id: string
  userId: string
  user?: import('./db-types').User
  tokenHash: string
  userAgent?: string | null
  ip?: string | null
  device?: string | null
  location?: string | null
  rememberMe: boolean
  createdAt: Date
  lastActiveAt: Date
  expiresAt: Date
  revokedAt?: Date | null
}

export interface OAuthAccount {
  id: string
  userId: string
  provider: string
  providerAccountId: string
  createdAt: Date
}

export interface VerificationToken {
  id: string
  userId: string
  user?: import('./db-types').User
  tokenHash: string
  type: string
  expiresAt: Date
  usedAt?: Date | null
  createdAt: Date
}

export interface Plan {
  id: string
  slug: string
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  currency: string
  maxWhatsappSessions: number
  maxMessagesPerDay: number
  maxApiRequestsDay: number
  maxContacts: number
  maxAutomationRules: number
  maxTeamMembers: number
  features: string
  isTrial: boolean
  isPublic: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  plan: import('./db-types').Plan
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  canceledAt?: Date | null
  trialStartedAt?: Date | null
  trialExpiresAt?: Date | null
  trialStatus: string
  trialUsed: boolean
  renewalNoticeFor?: Date | null
  messagesUsedToday: number
  apiRequestsUsedDay: number
  usageResetAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  userId: string
  user?: import('./db-types').User
  plan?: import('./db-types').Plan
  subscriptionId?: string | null
  invoiceNumber: string
  amount: number
  currency: string
  status: string
  method: string
  description: string
  providerRef?: string | null
  paidAt?: Date | null
  failureReason?: string | null
  planId?: string | null
  cycle: string
  createdAt: Date
  updatedAt: Date
}

export interface WhatsAppSession {
  id: string
  userId: string
  name: string
  description?: string | null
  status: string
  statusMessage?: string | null
  phoneNumber?: string | null
  profileName?: string | null
  profilePicUrl?: string | null
  platform?: string | null
  driver: string
  engineRef?: string | null
  authStateDir: string
  autoReconnect: boolean
  alwaysOnline: boolean
  readReceipts: boolean
  typingSimulation: boolean
  defaultDelayMs: number
  lastConnectedAt?: Date | null
  lastDisconnectedAt?: Date | null
  connectedSince?: Date | null
  lastQrAt?: Date | null
  lastError?: string | null
  messagesSent: number
  messagesReceived: number
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  userId: string
  sessionId: string
  campaignId?: string | null
  type: string
  direction: string
  recipient: string
  recipientName?: string | null
  body?: string | null
  mediaUrl?: string | null
  mediaMime?: string | null
  mediaSize?: number | null
  caption?: string | null
  quotedId?: string | null
  status: string
  externalId?: string | null
  errorCode?: string | null
  errorMessage?: string | null
  requestPayload?: string | null
  responsePayload?: string | null
  retryCount: number
  scheduledFor?: Date | null
  sentAt?: Date | null
  deliveredAt?: Date | null
  readAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Campaign {
  id: string
  userId: string
  sessionId: string
  name: string
  messageBody?: string | null
  mediaUrl?: string | null
  messageType: string
  caption?: string | null
  status: string
  delayMinMs: number
  delayMaxMs: number
  scheduledFor?: Date | null
  totalCount: number
  sentCount: number
  failedCount: number
  pendingCount: number
  startedAt?: Date | null
  completedAt?: Date | null
  canceledAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ScheduledMessage {
  id: string
  userId: string
  sessionId: string
  recipient: string
  messageBody?: string | null
  messageType: string
  mediaUrl?: string | null
  caption?: string | null
  status: string
  scheduledFor: Date
  recurrence: string
  nextRunAt?: Date | null
  lastError?: string | null
  kind: string
  payload?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Contact {
  id: string
  userId: string
  sessionId?: string | null
  name: string
  phone: string
  jid?: string | null
  email?: string | null
  notes?: string | null
  status: string
  lastMessageAt?: Date | null
  lastMessagePreview?: string | null
  avatarUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ContactTag {
  id: string
  userId: string
  contactId: string
  tag: string
  color: string
  createdAt: Date
}

export interface Group {
  id: string
  userId: string
  sessionId: string
  name: string
  jid: string
  description?: string | null
  inviteCode?: string | null
  isAdmin: boolean
  memberCount: number
  pictureUrl?: string | null
  createdAtWa?: Date | null
  syncedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface GroupMember {
  id: string
  groupId: string
  jid: string
  phone?: string | null
  name?: string | null
  isAdmin: boolean
  isSuperAdmin: boolean
  createdAt: Date
}

export interface AutomationRule {
  id: string
  userId: string
  sessionId?: string | null
  name: string
  description?: string | null
  enabled: boolean
  priority: number
  trigger: string
  matchOperator: string
  matchValue: string
  matchMode: string
  matchValue2?: string | null
  matchOperator2?: string | null
  caseSensitive: boolean
  chatScope: string
  actions: string
  triggerCount: number
  lastTriggeredAt?: Date | null
  cooldownSeconds: number
  createdAt: Date
  updatedAt: Date
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  prefix: string
  keyHash: string
  lastFour: string
  scopes: string
  lastUsedAt?: Date | null
  requestCount: number
  expiresAt?: Date | null
  revokedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ApiRequestLog {
  id: string
  userId?: string | null
  apiKeyId?: string | null
  method: string
  path: string
  statusCode: number
  durationMs: number
  ip?: string | null
  userAgent?: string | null
  requestBody?: string | null
  errorMessage?: string | null
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  user?: import('./db-types').User
  type: string
  severity: string
  title: string
  message: string
  actionUrl?: string | null
  metadata?: string | null
  readAt?: Date | null
  createdAt: Date
}

export interface Ticket {
  id: string
  userId: string
  user?: import('./db-types').User
  _count?: { messages: number }
  reference: string
  subject: string
  category: string
  priority: string
  status: string
  assignedToId?: string | null
  attachmentUrl?: string | null
  lastReplyAt?: Date | null
  closedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  body: string
  isStaffReply: boolean
  attachmentUrl?: string | null
  createdAt: Date
}

export interface ActivityLog {
  id: string
  userId?: string | null
  sessionId?: string | null
  event: string
  title: string
  detail?: string | null
  level: string
  metadata?: string | null
  ip?: string | null
  createdAt: Date
}

export interface Job {
  id: string
  userId?: string | null
  type: string
  status: string
  priority: number
  payload: string
  attempts: number
  maxAttempts: number
  runAt: Date
  lockedAt?: Date | null
  lockedBy?: string | null
  lastError?: string | null
  result?: string | null
  createdAt: Date
  updatedAt: Date
  finishedAt?: Date | null
}

export interface Outbox {
  id: string
  to: string
  subject: string
  body: string
  status: string
  error?: string | null
  sentAt?: Date | null
  createdAt: Date
}
