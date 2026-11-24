import { z } from 'zod'
import {
  CAMPAIGN_STATUSES,
  MATCH_OPERATORS,
  MESSAGE_STATUSES,
  MESSAGE_TYPES,
  SCHEDULE_STATUSES,
  SESSION_STATUSES,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from '@/types/enums'

/** Reusable Zod fragments so validation rules stay identical everywhere. */

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  // Hard cap so a client cannot request pageSize=1000000 and hammer the DB.
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
})

export const cuidSchema = z.string().min(8).max(64)

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Email wajib diisi.')
  .max(254)
  .email('Masukkan alamat email yang valid.')

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Nama pengguna minimal 3 karakter.')
  .max(30, 'Nama pengguna maksimal 30 karakter.')
  .regex(
    /^[a-z0-9_.]+$/,
    'Nama pengguna hanya boleh berisi huruf kecil, angka, garis bawah, dan titik.'
  )

export const passwordSchema = z
  .string()
  .min(8, 'Kata sandi minimal 8 karakter.')
  .max(128, 'Kata sandi maksimal 128 karakter.')
  .regex(/[a-z]/, 'Kata sandi harus memuat huruf kecil.')
  .regex(/[A-Z]/, 'Kata sandi harus memuat huruf besar.')
  .regex(/[0-9]/, 'Kata sandi harus memuat angka.')

/** Accepts 6281234567890, +62 812-3456-7890, 0812... (normalised server-side). */
export const phoneSchema = z
  .string()
  .trim()
  .min(6, 'Masukkan nomor telepon yang valid.')
  .max(20)
  .regex(/^[+]?[0-9\s\-()]+$/, 'Nomor telepon hanya boleh berisi angka dan tanda + - ( ).')

/** Reusable absolute-URL validator for media and remote resource fields. */
export const urlSchema = z
  .string()
  .trim()
  .url('Masukkan URL yang valid beserta http:// atau https://')
  .max(2048)

export const sessionStatusSchema = z.enum(SESSION_STATUSES)
export const messageStatusSchema = z.enum(MESSAGE_STATUSES)
export const messageTypeSchema = z.enum(MESSAGE_TYPES)
export const matchOperatorSchema = z.enum(MATCH_OPERATORS)
export const campaignStatusSchema = z.enum(CAMPAIGN_STATUSES)
export const scheduleStatusSchema = z.enum(SCHEDULE_STATUSES)
export const ticketStatusSchema = z.enum(TICKET_STATUSES)
export const ticketPrioritySchema = z.enum(TICKET_PRIORITIES)
export const ticketCategorySchema = z.enum(TICKET_CATEGORIES)

/**
 * WhatsApp chat id, exactly as the bot stores it (`…@g.us`, `…@s.whatsapp.net`,
 * newsletter channel, or the LID form Baileys now returns for some users).
 */
export const chatIdSchema = z
  .string()
  .trim()
  .regex(
    /^[0-9]{6,}(:[0-9]+)?@(g\.us|s\.whatsapp\.net|newsletter|lid)$/,
    'Gunakan ID chat lengkap dari bot, contoh 120363199179422985@g.us.'
  )

/**
 * Runtime settings that are written into the bot's own database.
 *
 * A discriminated union rather than a loose object so an unknown operation is
 * rejected at the edge — the gateway only ever receives something it can map to
 * a real Nano table.
 */
export const botSettingSchema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('access-mode'),
    mode: z.enum(['normal', 'onlygc', 'onlypc']),
  }),
  z.object({ op: z.literal('anticall'), enabled: z.boolean() }),
  z.object({
    op: z.literal('group-welcome'),
    chatId: chatIdSchema,
    enabled: z.boolean(),
    /** Omit to keep the stored text; send null to clear it. */
    message: z.string().trim().max(1500).nullable().optional(),
    leftMessage: z.string().trim().max(1500).nullable().optional(),
  }),
  z.object({
    op: z.literal('group-antilink'),
    chatId: chatIdSchema,
    groupEnabled: z.boolean(),
    channelEnabled: z.boolean(),
  }),
  z.object({
    op: z.literal('chat-prefix'),
    chatId: chatIdSchema,
    /** null resets the chat back to the script's default prefix. */
    prefix: z.string().trim().max(3).nullable(),
  }),
  z.object({
    op: z.literal('add-owner'),
    number: phoneSchema,
    name: z.string().trim().max(60).nullable().optional(),
  }),
  z.object({ op: z.literal('remove-owner'), number: phoneSchema }),
])

/**
 * Keys the panel may rewrite in the script's `config/settings.js`.
 *
 * The whitelist lives in the shared Nano types so the form, the API and the
 * gateway all agree on what is editable.
 */
export const botConfigSchema = z
  .object({
    botName: z.string().trim().min(1).max(80).optional(),
    botAlias: z.string().trim().min(1).max(24).optional(),
    ownerName: z.string().trim().min(1).max(80).optional(),
    ownerNumbers: z.array(phoneSchema).min(1).max(20).optional(),
    defaultPrefix: z.string().trim().min(1).max(3).optional(),
    timezone: z.string().trim().min(1).max(64).optional(),
    footerText: z.string().trim().min(1).max(80).optional(),
    footerYear: z.string().trim().min(4).max(8).optional(),
    botVersion: z.string().trim().min(1).max(16).optional(),
    botMode: z.enum(['Public', 'Self', 'Private']).optional(),
    pairingNumber: phoneSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Tidak ada setting yang dikirim.',
  })

export type BotSettingInput = z.infer<typeof botSettingSchema>
export type BotConfigInput = z.infer<typeof botConfigSchema>

export const idParamSchema = z.object({ id: cuidSchema })

export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})

export const searchSchema = z.object({
  q: z.string().trim().max(120).optional(),
})
