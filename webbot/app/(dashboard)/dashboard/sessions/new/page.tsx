import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/guards'
import { getEntitlements } from '@/lib/services/entitlements'
import { botAccessNotice, getBotAccess } from '@/lib/services/bot-access'
import { BotAccessNotice } from '@/components/billing/bot-access-notice'
import { PageHeader } from '@/components/ui/page-header'
import { NewSessionForm } from '@/components/sessions/new-session-form'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Tambah Sesi WhatsApp' }
export const dynamic = 'force-dynamic'

export default async function NewSessionPage() {
  const auth = await requireAuth()

  const [entitlements, used, nanoConfigured, access] = await Promise.all([
    getEntitlements(auth.user),
    db.whatsAppSession.count({ where: { userId: auth.user.id } }),
    Promise.resolve(Boolean(process.env.NANO_ENGINE_DIR)),
    getBotAccess(auth.user.id),
  ])

  /*
    Creating a session is itself gated on the server, so the form is replaced
    rather than left to fail on submit. Claiming the trial from the notice
    refreshes this page, and the form appears the moment the account has a plan.
  */
  const accessNotice = botAccessNotice(access)

  const limit = entitlements.limits.whatsappSessions
  const unlimited = limit === -1
  const atLimit = !unlimited && used >= limit

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[
          { label: 'Beranda', href: '/dashboard' },
          { label: 'Sesi', href: '/dashboard/sessions' },
          { label: 'Tambah Sesi' },
        ]}
        title="Tambah Sesi WhatsApp"
        description="Buat koneksi baru, lalu tautkan dengan scan kode QR atau memasukkan kode pairing."
        actions={
          <Badge tone={atLimit ? 'danger' : 'neutral'}>
            {used} / {unlimited ? 'tanpa batas' : limit} sesi terpakai
          </Badge>
        }
      />

      {atLimit ? (
        <div className="rounded-[12px] border border-danger/30 bg-danger/10 p-4 text-mid text-danger">
          Anda sudah mencapai batas sesi untuk paket Anda ({limit}). Hapus sesi
          yang ada untuk menambah sesi baru.
        </div>
      ) : null}

      {accessNotice ? (
        <BotAccessNotice data={accessNotice} />
      ) : (
        <NewSessionForm nanoAvailable={nanoConfigured} />
      )}
    </div>
  )
}
