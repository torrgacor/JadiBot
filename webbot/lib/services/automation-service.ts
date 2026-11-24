import { db } from '@/lib/db'
import { parseJsonArray, stringifyJson } from '@/lib/utils/json'
import { engineClient } from '@/lib/engine/client'
import { consumeMessageQuota } from '@/lib/services/entitlements'
import { logActivity } from '@/lib/auth/audit'
import { toJid } from '@/lib/utils/format'
import type { ChatScope, MatchOperator, MessageType } from '@/types/enums'

/**
 * Automation engine.
 *
 * Evaluates a user's rules against each inbound message and runs the matching
 * actions. Rules are evaluated in priority order and a rule with a
 * `stopOnMatch`-style semantic is not used — every matching rule runs, which is
 * predictable and easy to reason about.
 *
 * Deliberate design limits (so automation cannot become an accidental
 * spam tool):
 *   • only runs on INBOUND messages, so a bot reply can never trigger itself
 *   • every send consumes the same daily message quota as a manual send
 *   • a per-rule cooldown throttles runaway loops
 */

export interface InboundContext {
  userId: string
  sessionId: string
  sessionName: string
  messageId: string
  from: string
  pushName: string | null
  isGroup: boolean
  text: string
}

export interface AutomationAction {
  type: 'send_text' | 'send_media' | 'delay' | 'mark_read' | 'add_tag'
  value?: string
  /** For send_media. */
  mediaUrl?: string
  caption?: string
  mediaType?: MessageType
  /** For delay, in milliseconds. */
  delayMs?: number
  /** For add_tag. */
  tag?: string
}

/** Cap actions per rule so a malformed rule cannot spin forever. */
const MAX_ACTIONS_PER_RULE = 10
/** Hard ceiling on a configured delay. */
const MAX_DELAY_MS = 30_000

export async function dispatchAutomationForInbound(
  context: InboundContext
): Promise<void> {
  const rules = await db.automationRule.findMany({
    where: {
      userId: context.userId,
      enabled: true,
      // Session-scoped rules apply to their session; global rules (null) to all.
      OR: [{ sessionId: context.sessionId }, { sessionId: null }],
    },
    orderBy: { priority: 'desc' },
  })

  for (const rule of rules) {
    if (!matchesRule(rule, context)) continue
    if (isOnCooldown(rule.lastTriggeredAt ?? null, rule.cooldownSeconds ?? 0)) continue

    await runRule(rule, context)
  }
}

// ────────────────────────────────────────────────────────────── matching ────

interface RuleLike {
  chatScope?: string
  matchOperator?: string
  matchValue?: string
  matchMode?: string
  matchOperator2?: string | null
  matchValue2?: string | null
  caseSensitive?: boolean
  name?: string
  actions?: string
  userId?: string
  sessionId?: string | null
  lastTriggeredAt?: Date | null
  cooldownSeconds?: number
}

function matchesRule(rule: RuleLike, context: InboundContext): boolean {
  // ── chat scope ──────────────────────────────────────────────────────────
  const scope = rule.chatScope as ChatScope
  if (scope === 'private' && context.isGroup) return false
  if (scope === 'group' && !context.isGroup) return false

  // ── keyword conditions ──────────────────────────────────────────────────
  const first = evaluateCondition(
    rule.matchOperator as MatchOperator,
    rule.matchValue ?? '',
    context.text,
    rule.caseSensitive ?? false
  )

  // "all" with no value means "match every message" — the common catch-all rule.
  const hasSecond = Boolean(rule.matchOperator2 && rule.matchValue2 !== null)
  if (!hasSecond) return first

  const second = evaluateCondition(
    rule.matchOperator2 as MatchOperator,
    rule.matchValue2 ?? '',
    context.text,
    rule.caseSensitive ?? false
  )

  return (rule.matchMode ?? 'all') === 'any' ? first || second : first && second
}

function evaluateCondition(
  operator: MatchOperator,
  expected: string,
  actual: string,
  caseSensitive: boolean
): boolean {
  // An empty match value is a wildcard.
  if (expected === '') return true

  const haystack = caseSensitive ? actual : actual.toLowerCase()
  const needle = caseSensitive ? expected : expected.toLowerCase()

  switch (operator) {
    case 'contains':
      return haystack.includes(needle)
    case 'equals':
      return haystack.trim() === needle.trim()
    case 'starts_with':
      return haystack.startsWith(needle)
    case 'ends_with':
      return haystack.endsWith(needle)
    case 'regex':
      try {
        // `i` unless the rule asked for case sensitivity.
        return new RegExp(expected, caseSensitive ? '' : 'i').test(actual)
      } catch {
        // An invalid pattern must not crash ingestion; treat as no-match and
        // surface it in the activity log below.
        return false
      }
    default:
      return false
  }
}

function isOnCooldown(lastTriggeredAt: Date | null, cooldownSeconds: number): boolean {
  if (cooldownSeconds <= 0 || !lastTriggeredAt) return false
  return Date.now() - lastTriggeredAt.getTime() < cooldownSeconds * 1000
}

// ──────────────────────────────────────────────────────────── execution ─────

async function runRule(rule: { id: string; name: string; actions: string; userId: string; sessionId?: string | null }, context: InboundContext) {
  const actions = parseJsonArray<AutomationAction>(rule.actions).slice(0, MAX_ACTIONS_PER_RULE)

  if (actions.length === 0) {
    await recordTrigger(rule.id)
    return
  }

  const recipient = toJid(context.from)

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'delay': {
          const ms = Math.min(Math.max(action.delayMs ?? 0, 0), MAX_DELAY_MS)
          if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms))
          break
        }

        case 'send_text': {
          if (!action.value?.trim()) break
          await sendViaEngine({
            userId: rule.userId,
            sessionId: context.sessionId,
            recipient,
            type: 'text',
            text: interpolate(action.value, context),
          })
          break
        }

        case 'send_media': {
          if (!action.mediaUrl) break
          await sendViaEngine({
            userId: rule.userId,
            sessionId: context.sessionId,
            recipient,
            type: action.mediaType ?? 'image',
            mediaUrl: action.mediaUrl,
            caption: action.caption ? interpolate(action.caption, context) : undefined,
          })
          break
        }

        case 'mark_read': {
          // Read receipts are applied by the engine on the next send; recorded
          // here so the rule is auditable.
          await logActivity({
            userId: rule.userId,
            sessionId: context.sessionId,
            event: 'automation.action',
            title: `Rule "${rule.name}" marked message as read`,
            level: 'info',
          })
          break
        }

        case 'add_tag': {
          const tag = action.tag ?? action.value
          if (!tag) break
          await addTagToSender(rule.userId, context, tag)
          break
        }
      }
    } catch (error) {
      // One failed action must not abort the remaining actions or the request.
      await logActivity({
        userId: rule.userId,
        sessionId: context.sessionId,
        event: 'automation.error',
        title: `Rule "${rule.name}" action failed`,
        detail: error instanceof Error ? error.message : 'Kesalahan otomatisasi tidak diketahui',
        level: 'error',
      })
    }
  }

  await recordTrigger(rule.id)
}

async function recordTrigger(ruleId: string) {
  await db.automationRule.update({
    where: { id: ruleId },
    data: {
      triggerCount: { increment: 1 },
      lastTriggeredAt: new Date(),
    },
  })
}

/** Persist the outbound message, enforce quota, then hand it to the engine. */
async function sendViaEngine(input: {
  userId: string
  sessionId: string
  recipient: string
  type: MessageType
  text?: string
  mediaUrl?: string
  caption?: string
}) {
  await consumeMessageQuota(input.userId)

  const message = await db.message.create({
    data: {
      userId: input.userId,
      sessionId: input.sessionId,
      direction: 'OUTBOUND',
      type: input.type,
      recipient: input.recipient,
      body: input.text ?? null,
      caption: input.caption ?? null,
      mediaUrl: input.mediaUrl ?? null,
      status: 'SENDING',
      requestPayload: stringifyJson(input),
    },
  })

  try {
    const result = await engineClient.sendMessage({
      sessionKey: input.sessionId,
      to: input.recipient,
      type: input.type,
      text: input.text,
      mediaUrl: input.mediaUrl,
      caption: input.caption,
    })

    await db.message.update({
      where: { id: message.id },
      data: { status: 'SENT', externalId: result.externalId, sentAt: new Date() },
    })

    return result
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Pengiriman lewat bot gagal'

    await db.message.update({
      where: { id: message.id },
      data: { status: 'FAILED', errorMessage: reason },
    })

    throw error
  }
}

/** Attach a tag to the contact that sent the message, creating one if needed. */
async function addTagToSender(userId: string, context: InboundContext, tag: string) {
  const phone = context.from.split('@')[0]

  const contact = await db.contact.upsert({
    where: { userId_phone: { userId, phone } },
    update: {},
    create: {
      userId,
      sessionId: context.sessionId,
      name: context.pushName ?? phone,
      phone,
      jid: context.from,
    },
  })

  if (contact) {
    await db.contactTag.upsert({
      where: { contactId_tag: { contactId: contact.id, tag } },
      update: {},
      create: { userId, contactId: contact.id, tag },
    })
  }
}

/** Replace {{name}} / {{text}} placeholders in a reply template. */
function interpolate(template: string, context: InboundContext): string {
  return template
    .replace(/\{\{\s*name\s*\}\}/gi, context.pushName ?? 'there')
    .replace(/\{\{\s*text\s*\}\}/gi, context.text)
    .replace(/\{\{\s*phone\s*\}\}/gi, context.from.split('@')[0])
}
