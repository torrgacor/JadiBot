import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'
import { SESSION_STATUSES, STATUS_LABELS, type SessionStatus } from '@/types/enums'

/**
 * Social preview card for one bot session.
 *
 * A `/dashboard/sessions/<id>` link asks the visitor to sign in, so a crawler
 * following it sees the login screen — and a preview that says nothing about the
 * bot. This renders a card from the session itself instead, so a link shared in
 * a chat identifies which bot it points at.
 *
 * ── Deliberately unauthenticated ────────────────────────────────────────────
 * Crawlers cannot sign in, so this cannot be behind `requireAuth`. That is a
 * bounded, intended disclosure: the bot's display name, its status, and the phone
 * number reduced to a country code and last four digits. The full number is never
 * rendered — anyone holding the link could otherwise simply read it off the
 * image. The session id is an unguessable cuid, which is what stops the card from
 * becoming an enumeration surface for other people's bots.
 *
 * The artwork is drawn with layout rather than an image asset, matching the way
 * the dashboard's own hero banner is built: nothing to fetch, nothing to keep in
 * sync, no layout shift.
 */

export const runtime = 'nodejs'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'NANO GATEWAY — kartu sesi bot'

/** `6285147107037` → `+62 •••• 7037`. Null when there is nothing worth showing. */
function maskedNumber(value: string | null): string | null {
  const digits = (value ?? '').replace(/\D/g, '')
  if (digits.length < 8) return null
  return `+${digits.slice(0, 2)} •••• ${digits.slice(-4)}`
}

function statusLabel(status: string): string {
  const known = (SESSION_STATUSES as readonly string[]).includes(status)
  return known ? STATUS_LABELS[status as SessionStatus] : status
}

/** Host shown in the footer, so the image states where it came from. */
function publicHost(): string {
  const raw = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'localhost:3000'
  try {
    return new URL(raw).host
  } catch {
    return 'NANO GATEWAY'
  }
}

export default async function SessionPreview({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Not scoped to a user on purpose — see the note above. A malformed or
  // unknown id simply falls through to the generic card.
  const session = await db.whatsAppSession
    .findUnique({
      where: { id },
      select: { name: true, status: true, phoneNumber: true, profileName: true },
    })
    .catch(() => null)

  const name = session?.name ?? 'NANO GATEWAY'
  const status = session ? statusLabel(session.status) : 'Panel Manajemen Bot WhatsApp'
  const number = maskedNumber(session?.phoneNumber ?? null)
  const profileName = session?.profileName ?? null
  const connected = session?.status === 'CONNECTED'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#050505',
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        {/* Accent glow — two translucent discs, no gradient to depend on. */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -150,
            width: 560,
            height: 560,
            borderRadius: 560,
            backgroundColor: 'rgba(0,230,118,0.10)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -90,
            right: -60,
            width: 320,
            height: 320,
            borderRadius: 320,
            backgroundColor: 'rgba(0,230,118,0.10)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 14,
                backgroundColor: '#00E676',
                marginRight: 18,
              }}
            />
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: 6,
              }}
            >
              NANO GATEWAY
            </div>
          </div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.45)', letterSpacing: 2 }}>
            {session ? 'SESI BOT WHATSAPP' : 'PANEL MANAJEMEN BOT'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: name.length > 26 ? 60 : 78,
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.05,
            }}
          >
            {name}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 28 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: connected ? 'rgba(0,230,118,0.14)' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${connected ? 'rgba(0,230,118,0.42)' : 'rgba(255,255,255,0.16)'}`,
                borderRadius: 999,
                padding: '10px 24px',
                fontSize: 24,
                fontWeight: 600,
                color: connected ? '#00E676' : 'rgba(255,255,255,0.72)',
              }}
            >
              {status}
            </div>

            {number ? (
              <div style={{ marginLeft: 22, fontSize: 26, color: 'rgba(255,255,255,0.6)' }}>
                {number}
              </div>
            ) : null}

            {profileName && profileName !== name ? (
              <div style={{ marginLeft: 22, fontSize: 26, color: 'rgba(255,255,255,0.45)' }}>
                {profileName}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.5)' }}>
            {session ? 'Kelola bot ini dari panel' : 'Kelola bot WhatsApp dari satu panel'}
          </div>
          <div style={{ fontSize: 24, color: '#00E676' }}>{publicHost()}</div>
        </div>
      </div>
    ),
    size
  )
}
