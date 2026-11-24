import { z } from 'zod'
import { db } from '@/lib/db'
import { fail, ok, parseBody } from '@/lib/api/response'
import { requireAuth, requireAuthWithCsrf } from '@/lib/auth/guards'
import { conflict, badRequest } from '@/lib/errors'
import { logActivity } from '@/lib/auth/audit'
import { usernameSchema } from '@/lib/validation/schemas'

/**
 * GET   /api/account/profile — the signed-in user's own record.
 * PATCH /api/account/profile — update it.
 *
 * Deliberately narrow: email changes go through the verification flow (not
 * implemented here) and role/status are never client-writable, so a crafted
 * request cannot escalate privileges.
 */

const updateSchema = z.object({
  name: z.string().trim().min(2, 'Masukkan nama Anda.').max(80).optional(),
  username: usernameSchema.optional(),
  phone: z
    .string()
    .trim()
    .max(24)
    .regex(/^[+\d][\d\s-]*$/, 'Masukkan nomor telepon yang valid.')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  timezone: z.string().trim().max(64).optional(),
  notifyEmail: z.boolean().optional(),
  notifyPush: z.boolean().optional(),
})

const PROFILE_SELECT = {
  id: true,
  email: true,
  username: true,
  name: true,
  phone: true,
  timezone: true,
  avatarUrl: true,
  role: true,
  notifyEmail: true,
  notifyPush: true,
  twoFactorEnabled: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
} as const

export async function GET() {
  try {
    const { user } = await requireAuth()
    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: PROFILE_SELECT,
    })
    return ok(profile)
  } catch (error) {
    return fail(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await requireAuthWithCsrf(request)
    const input = await parseBody(request, updateSchema)

    if (Object.keys(input).length === 0) {
      throw badRequest('Tidak ada yang perlu diperbarui.')
    }

    // Usernames are unique; check explicitly so the user gets a clear message
    // instead of a raw Prisma constraint error.
    if (input.username && input.username !== user.username) {
      const taken = await db.user.findUnique({
        where: { username: input.username },
        select: { id: true },
      })
      if (taken) throw conflict('Nama pengguna itu sudah dipakai.')
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: input,
      select: PROFILE_SELECT,
    })

    await logActivity({
      userId: user.id,
      event: 'profile.updated',
      title: 'Profil diperbarui',
      detail: Object.keys(input).join(', '),
      level: 'info',
    })

    return ok(updated)
  } catch (error) {
    return fail(error)
  }
}
