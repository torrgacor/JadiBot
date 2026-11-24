import type { Metadata } from 'next'
import { Activity, Bot, Database, Server } from 'lucide-react'
import { pingDatabase } from '@/lib/db'
import { pingGateway } from '@/lib/engine/client'
import { getNanoOverview } from '@/lib/services/nano-service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/utils/format'

export const metadata: Metadata = {
  title: 'Status',
  description: 'Status operasional langsung dari instalasi NANO GATEWAY ini.',
}

export const dynamic = 'force-dynamic'

/**
 * Status.
 *
 * Every row is probed while the page renders — the database is actually
 * queried, the gateway actually pinged, the Nano installation actually read.
 * A status page that can show "operational" for a service that is down is
 * worse than no status page.
 */
export default async function StatusPage() {
  const [databaseOk, gateway, nano] = await Promise.all([
    pingDatabase().catch(() => false),
    pingGateway(),
    getNanoOverview().catch(() => null),
  ])

  const engineOk = Boolean(nano?.install.available)
  const bridgeOk = Boolean(nano?.install.patched)
  const commandsOk = (nano?.totalCommands ?? 0) > 0

  const allOk = databaseOk && gateway.online && engineOk && bridgeOk

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Status</h1>
          <Badge tone={allOk ? 'success' : 'warning'} size="md">
            {allOk ? 'semua sistem normal' : 'ada gangguan'}
          </Badge>
        </div>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          Diperiksa langsung saat halaman ini dibuka. Tidak ada nilai tersimpan dan tidak ada
          klaim uptime historis — instalasi ini tidak mencatat keduanya.
        </p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Komponen</CardTitle>
            <CardDescription>Diperiksa pada setiap permintaan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row
              icon={Database}
              label="Penyimpanan data"
              ok={databaseOk}
              detail={databaseOk ? 'pemeriksaan berhasil' : 'pemeriksaan gagal'}
            />
            <Row
              icon={Server}
              label="Layanan WhatsApp"
              ok={gateway.online}
              detail={
                gateway.online
                  ? `${gateway.activeSessions ?? 0} koneksi aktif · ${gateway.latencyMs}ms`
                  : 'tidak dapat dihubungi — sesi belum bisa dikendalikan saat ini'
              }
            />
            <Row
              icon={Bot}
              label="Bot Nano"
              ok={engineOk}
              detail={
                engineOk
                  ? `${nano?.install.name} ${nano?.install.version}`
                  : 'instalasi tidak siap'
              }
            />
            <Row
              icon={Activity}
              label="Integrasi bot"
              ok={bridgeOk}
              detail={
                bridgeOk
                  ? 'aktif — bot bisa menautkan dan mengirim pesan'
                  : 'belum aktif'
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kemampuan bot</CardTitle>
            <CardDescription>Dibaca dari instalasi Nano.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Fact
              label="Perintah"
              value={commandsOk ? formatNumber(nano?.totalCommands ?? 0) : 'tidak ada'}
            />
            <Fact label="Plugin aktif" value={formatNumber(nano?.activePlugins ?? 0)} />
            <Fact label="Berkas plugin" value={formatNumber(nano?.totalPlugins ?? 0)} />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  ok,
  detail,
}: {
  icon: typeof Database
  label: string
  ok: boolean
  detail: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-[9px] border border-border bg-muted/40 text-muted-foreground"
        aria-hidden
      >
        <Icon className="size-3.5" />
      </span>
      <span className="w-40 shrink-0 text-mid font-medium">{label}</span>
      <Badge tone={ok ? 'success' : 'danger'} size="sm">
        {ok ? 'normal' : 'mati'}
      </Badge>
      <span className="min-w-0 flex-1 text-note text-muted-foreground">{detail}</span>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-xs2 uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lead font-semibold tabular-nums">{value}</p>
    </div>
  )
}
