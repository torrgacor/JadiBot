import { AlertTriangle, CheckCircle2, Sparkles, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { timeAgo } from '@/lib/utils/format'
import { aiBackendView, getAiBackendStatuses, getAiJobHistory } from '@/lib/services/ai-backend-status'

/**
 * AI backend health.
 *
 * Reports the outcome of the engine's last job per backend (recorded by
 * lib/ai-foto.js after every .editfoto / .upscale run). Deliberately read-only
 * against the local record: probing the upstream to "check quota" would spend
 * the quota it is trying to report on. Renders nothing until the engine has
 * actually used a backend at least once.
 */

const ROW_TONE = {
  success: 'text-success bg-success/10 border-success/25',
  warning: 'text-warning bg-warning/10 border-warning/25',
  danger: 'text-danger bg-danger/10 border-danger/25',
} as const

const LABEL_TONE = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
} as const

const ROW_ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
} as const

/** Label hari singkat (Asia/Jakarta) — tengah hari UTC agar tak geser tanggal. */
function labelHari(date: string) {
  return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'short' }).format(
    new Date(date + 'T12:00:00Z')
  )
}

export async function AiBackendStatusPanel() {
  const [statuses, riwayat] = await Promise.all([getAiBackendStatuses(), getAiJobHistory(7)])

  const totalJob = riwayat.reduce((jumlah, hari) => jumlah + hari.total, 0)
  const totalGagal = riwayat.reduce((jumlah, hari) => jumlah + hari.fail, 0)
  const maks = Math.max(1, ...riwayat.map((hari) => hari.total))

  // Belum ada apa-apa untuk dilaporkan: kartu kosong tidak menambah informasi.
  if (!statuses.length && totalJob === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" aria-hidden />
          Status Backend AI
        </CardTitle>
        <CardDescription>
          Kesehatan backend edit foto yang dipakai perintah{' '}
          <span className="font-medium text-foreground">.editfoto</span> dan{' '}
          <span className="font-medium text-foreground">.upscale</span> — dibaca dari catatan job
          terakhir, bukan probe (probe justru menghabiskan kuota).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {statuses.map((status) => {
          const view = aiBackendView(status)
          const IconComponent = ROW_ICON[view.tone]

          const detail = view.ok
            ? `Job terakhir sukses ${timeAgo(view.checkedAt > 0 ? new Date(view.checkedAt) : null)}.`
            : [
                view.message || 'Galat tidak diketahui',
                view.consecutiveFailures > 0 ? `${view.consecutiveFailures}× berturut-turut` : '',
                view.lastSuccessAt != null
                  ? `terakhir sukses ${timeAgo(new Date(view.lastSuccessAt))}`
                  : 'belum pernah sukses',
              ]
                .filter(Boolean)
                .join(' · ')

          return (
            <div
              key={view.key}
              className="flex items-start gap-3 rounded-[10px] border border-border bg-muted/20 p-3"
            >
              <span
                className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-[7px] border', ROW_TONE[view.tone])}
                aria-hidden
              >
                <IconComponent className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-mid font-medium">{view.label}</span>
                  <span
                    className={cn('text-eyebrow font-medium uppercase tracking-wide', LABEL_TONE[view.tone])}
                  >
                    {view.statusLabel}
                  </span>
                </span>
                <span className="mt-0.5 block text-tiny leading-snug text-muted-foreground">
                  {detail}
                </span>
              </span>
            </div>
          )
        })}

        {/* ── riwayat job 7 hari: tinggi bar = jumlah job, merah = gagal ── */}
        <div className={cn(statuses.length > 0 && 'mt-4 border-t border-border pt-4')}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-mid font-medium">Riwayat Job AI · 7 hari</p>
            <p className="text-tiny text-muted-foreground">
              {totalJob} job · {totalJob - totalGagal} sukses · {totalGagal} gagal
            </p>
          </div>

          {totalJob === 0 ? (
            <p className="mt-2 text-tiny text-muted-foreground">
              Belum ada job AI tercatat dalam sepekan terakhir.
            </p>
          ) : (
            <>
              <div className="mt-3 flex items-end gap-1.5">
                {riwayat.map((hari) => {
                  const tinggiGagal =
                    hari.fail > 0 ? Math.max(4, Math.round((hari.fail / maks) * 56)) : 0
                  const tinggiSukses =
                    hari.ok > 0 ? Math.max(4, Math.round((hari.ok / maks) * 56)) : 0

                  return (
                    <div
                      key={hari.date}
                      className="flex min-w-0 flex-1 flex-col items-center gap-1"
                      title={`${hari.date}: ${hari.total} job (${hari.ok} sukses, ${hari.fail} gagal)`}
                    >
                      <div className="flex h-14 w-full flex-col justify-end">
                        {tinggiGagal > 0 ? (
                          <div
                            className="w-full rounded-t-[3px] bg-danger/70"
                            style={{ height: tinggiGagal + 'px' }}
                          />
                        ) : null}
                        {tinggiSukses > 0 ? (
                          <div
                            className={cn('w-full bg-success/60', tinggiGagal > 0 && 'rounded-b-[3px]')}
                            style={{ height: tinggiSukses + 'px' }}
                          />
                        ) : null}
                        {hari.total === 0 ? (
                          <div className="h-[3px] w-full rounded-[2px] bg-border" />
                        ) : null}
                      </div>
                      <span className="text-label text-muted-foreground">{labelHari(hari.date)}</span>
                    </div>
                  )
                })}
              </div>

              <p className="mt-2 flex items-center gap-3 text-eyebrow text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-[2px] bg-success/60" aria-hidden />
                  sukses
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-[2px] bg-danger/70" aria-hidden />
                  gagal
                </span>
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
