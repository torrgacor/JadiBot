import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { KeyRound, QrCode, Smartphone } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guards'
import { getSession } from '@/lib/services/session-service'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-dot'
import { BotNumberForm } from '@/components/sessions/bot-number-form'
import { DEFAULT_COUNTRY_CODE, splitInternational } from '@/lib/utils/country-codes'
import type { SessionStatus } from '@/types/enums'

export const metadata: Metadata = { title: 'Nomor Bot' }
export const dynamic = 'force-dynamic'

/**
 * Bot Number.
 *
 * Step one of linking a bot: name it and say which number it runs on. The value
 * saved here lives on the session row and is what the pairing request uses, so
 * this page is the difference between "type the number every time you retry"
 * and "set it once".
 */
export default async function BotNumberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const auth = await requireAuth()
  const { id } = await params

  const session = await getSession(auth.user.id, id).catch(() => null)
  if (!session) notFound()

  const status = session.status as SessionStatus

  // A number WhatsApp reported is authoritative once linked; before that the
  // stored value is simply what the user entered.
  const linkedNumber = session.phoneNumber ?? null
  const split = linkedNumber
    ? splitInternational(linkedNumber)
    : { country: DEFAULT_COUNTRY_CODE, local: '' }

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[
          { label: 'Beranda', href: '/dashboard' },
          { label: 'Sesi', href: '/dashboard/sessions' },
          { label: session.name, href: `/dashboard/sessions/${session.id}` },
          { label: 'Nomor Bot' },
        ]}
        title="Nomor Bot"
        description="Nama dan nomor WhatsApp yang dipakai sesi ini. Dipakai saat meminta kode penautan."
        actions={<StatusPill status={status} />}
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <BotNumberForm
          sessionId={session.id}
          initial={{ name: session.name, country: split.country, local: split.local }}
          connectedNumber={status === 'CONNECTED' ? linkedNumber : null}
        />

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Alur penautan</CardTitle>
              <CardDescription>Empat langkah, semuanya nyata.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                <Step
                  index={1}
                  icon={Smartphone}
                  title="Isi nama dan nomor"
                  body="Nomor digabung dari kode negara dan nomor lokal, lalu disimpan bersama sesi."
                />
                <Step
                  index={2}
                  icon={KeyRound}
                  title="Minta kode penautan"
                  body="Panel meminta kode langsung ke WhatsApp lewat proses bot yang sudah ada."
                />
                <Step
                  index={3}
                  icon={QrCode}
                  title="Masukkan kode di ponsel"
                  body="WhatsApp → Setelan → Perangkat Tertaut → Tautkan dengan nomor telepon."
                />
                <Step
                  index={4}
                  icon={Smartphone}
                  title="Bot berjalan"
                  body="Setelah perangkat terautentikasi, bot memuat konfigurasi dan perintahnya sendiri."
                />
              </ol>

              <div className="mt-4 border-t border-border pt-4">
                <Button asChild size="sm" className="w-full">
                  <Link href={`/dashboard/sessions/${session.id}`}>
                    Buka halaman penautan
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-s leading-relaxed text-muted-foreground">
              <p>
                Nomor tidak bisa divalidasi lebih dulu di panel ini — yang
                menentukan nomor benar atau tidak adalah WhatsApp saat
                handshake berjalan.
              </p>
              <p>
                Kalau sesi sudah tertaut, nomor yang tampil berasal dari yang
                dilaporkan WhatsApp, bukan dari yang Anda ketik.
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral" size="sm">
                  ID sesi
                </Badge>
                <span className="font-mono text-tiny">{session.id}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Step({
  index,
  icon: Icon,
  title,
  body,
}: {
  index: number
  icon: typeof Smartphone
  title: string
  body: string
}) {
  return (
    <li className="flex gap-3">
      <span
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[9px] border border-border bg-glass/60 text-xs2 font-semibold text-primary"
        aria-hidden
      >
        {index}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-mid font-medium">
          <Icon className="size-3.5 text-muted-foreground" aria-hidden />
          {title}
        </span>
        <span className="mt-0.5 block text-note leading-relaxed text-muted-foreground">
          {body}
        </span>
      </span>
    </li>
  )
}
