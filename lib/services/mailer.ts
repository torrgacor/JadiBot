import { db } from '@/lib/db'
import { env, features } from '@/lib/env'
import { devAuthLinksEnabled } from '@/lib/security/dev-links'

/**
 * Mail delivery.
 *
 * Without SMTP configured (the default) messages are persisted to the `Outbox`
 * table, and printed to the console only when an operator opted in with
 * `DEV_AUTH_LINKS=1` — a mail body carries a one-time token, so logging it by
 * default would write a live password-reset link into the server log.
 *
 * ── REQUIRES SMTP FOR REAL DELIVERY ──────────────────────────────────────────
 * Set SMTP_HOST / SMTP_USER / SMTP_PASSWORD in .env to enable delivery. The
 * transport is intentionally not implemented against a specific provider so a
 * deployment can drop in nodemailer, SES, Resend, or Postmark in `deliverMail()`
 * without touching any caller.
 */

export interface MailInput {
  to: string
  subject: string
  body: string
}

export async function queueMail(input: MailInput) {
  const record = await db.outbox.create({
    data: { to: input.to, subject: input.subject, body: input.body },
  })

  /*
    Without a transport there is nothing to send, so the body used to be printed
    instead. Mail bodies carry one-time tokens (password reset, email verify),
    which means printing them writes live credentials into the server log.
    That is a development affordance, not production behaviour, so it is now
    gated on the same explicit opt-in as the other dev links.
  */
  if (!features.smtp && devAuthLinksEnabled()) {
    console.info(
      [
        '',
        '┌─────────────────────────────────────────────────────────────┐',
        '│  MAIL (not sent — SMTP is not configured)                   │',
        '├─────────────────────────────────────────────────────────────┤',
        `│  to:      ${input.to}`,
        `│  subject: ${input.subject}`,
        '├─────────────────────────────────────────────────────────────┤',
        input.body,
        '└─────────────────────────────────────────────────────────────┘',
        '',
      ].join('\n')
    )
    return { queued: true, delivered: false, id: record.id }
  }

  try {
    await deliverMail(input)
    await db.outbox.update({
      where: { id: record.id },
      data: { status: 'SENT', sentAt: new Date() },
    })
    return { queued: true, delivered: true, id: record.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kesalahan email tidak diketahui'
    await db.outbox.update({
      where: { id: record.id },
      data: { status: 'FAILED', error: message },
    })
    console.error('[mailer] delivery failed', error)
    return { queued: true, delivered: false, id: record.id }
  }
}

/**
 * Transport hook.
 *
 * ── REQUIRES SMTP INTEGRATION ────────────────────────────────────────────────
 * Implement this with your provider's SDK/transport. It is the only function
 * that needs to change to make email delivery real; every caller in the app
 * already goes through `queueMail`.
 */
async function deliverMail(input: MailInput): Promise<void> {
  throw new Error(
    `No mail transport configured. Implement deliverMail() in lib/services/mailer.ts for SMTP host "${env.SMTP_HOST}".`
  )
}

// ──────────────────────────────────────────────────────── templates ─────────

export function verificationEmail(name: string, link: string): MailInput['body'] {
  return [
    `Halo ${name},`,
    '',
    'Konfirmasi alamat email Anda untuk mengaktifkan akun NANO GATEWAY:',
    '',
    link,
    '',
    'Tautan ini berlaku 24 jam. Jika Anda tidak membuat akun, abaikan email ini.',
  ].join('\n')
}

export function passwordResetEmail(name: string, link: string): MailInput['body'] {
  return [
    `Halo ${name},`,
    '',
    'Kami menerima permintaan mengatur ulang kata sandi NANO GATEWAY Anda:',
    '',
    link,
    '',
    'Tautan ini berlaku 1 jam dan hanya bisa dipakai sekali.',
    'Jika bukan Anda yang meminta, tidak ada yang perlu dilakukan — kata sandi Anda belum berubah.',
  ].join('\n')
}

export function securityAlertEmail(name: string, detail: string): MailInput['body'] {
  return [
    `Halo ${name},`,
    '',
    'Ada perubahan penting terkait keamanan pada akun NANO GATEWAY Anda:',
    '',
    detail,
    '',
    'Jika bukan Anda, segera atur ulang kata sandi dan cabut semua sesi aktif.',
  ].join('\n')
}
