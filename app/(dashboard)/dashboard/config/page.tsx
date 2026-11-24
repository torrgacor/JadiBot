import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Info, SlidersHorizontal } from 'lucide-react'
import { isAdmin, requireAuth } from '@/lib/auth/guards'
import { Button } from '@/components/ui/button'
import { getNanoOverview } from '@/lib/services/nano-service'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatNumber } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Konfigurasi Bot' }
export const dynamic = 'force-dynamic'

/**
 * Bot configuration.
 *
 * Reference view of the values in the Nano installation's `config/settings.js`.
 *
 * That file is shared by every bot on the platform, so changing it is an
 * administrative action: this page shows exactly what the installer is running
 * with, and links administrators to the editor on Bot Settings (which writes
 * through the gateway with a backup and a parse check).
 */
export default async function ConfigPage() {
  const { user } = await requireAuth()
  const overview = await getNanoOverview()
  const config = overview.config
  const canEdit = isAdmin(user)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Konfigurasi"
        description="Nilai yang sedang dipakai bot Anda, dibaca langsung dari instalasi Nano."
      />

      {overview.configError ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <div className="text-s">
            <p className="font-medium text-foreground">Gagal membaca konfigurasi bot.</p>
            <p className="mt-0.5 text-muted-foreground">{overview.configError}</p>
          </div>
        </div>
      ) : null}

      {!config ? (
        <Card>
          <EmptyState
            icon={SlidersHorizontal}
            title="Konfigurasi tidak tersedia"
            description="Instalasi bot tidak bisa dibaca saat ini. Coba muat ulang halaman."
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Identitas bot</CardTitle>
              <CardDescription>Bagaimana bot memperkenalkan diri di chat.</CardDescription>
            </CardHeader>
            <CardContent>
              <DefinitionList
                entries={[
                  ['Nama bot', config.botName],
                  ['Alias', config.botAlias],
                  ['Versi', config.botVersion, true],
                  ['Mode', config.botMode],
                  ['Nama owner', config.ownerName],
                  ['Teks footer', config.footerText],
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perilaku</CardTitle>
              <CardDescription>Nilai bawaan yang berlaku di semua chat.</CardDescription>
            </CardHeader>
            <CardContent>
              <DefinitionList
                entries={[
                  ['Prefix bawaan', config.defaultPrefix, true],
                  ['Zona waktu', config.timezone],
                  ['Nomor pairing', config.pairingNumber, true],
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner</CardTitle>
              <CardDescription>
                Nomor dengan hak akses owner, sesuai yang tercatat di konfigurasi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {config.ownerNumbers.length === 0 ? (
                <p className="text-s text-muted-foreground">
                  Tidak ada nomor owner yang tercatat di konfigurasi.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {config.ownerNumbers.map((number) => (
                    <code
                      key={number}
                      className="rounded-[7px] border border-border bg-muted/50 px-2 py-1 font-mono text-tiny"
                    >
                      {number}
                    </code>
                  ))}
                </div>
              )}

              <p className="mt-3 text-note leading-relaxed text-muted-foreground">
                Bot juga menyimpan owner tambahan di datanya sendiri. Daftarnya ada di halaman{' '}
                <span className="font-medium text-foreground">Data Bot</span>, karena ditambahkan
                saat bot berjalan lewat perintah bawaannya.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tautan</CardTitle>
              <CardDescription>Tautan kontak dan komunitas yang ditampilkan bot.</CardDescription>
            </CardHeader>
            <CardContent>
              {!config.links || Object.keys(config.links).length === 0 ? (
                <p className="text-s text-muted-foreground">
                  Tidak ada tautan yang dikonfigurasi.
                </p>
              ) : (
                <dl className="space-y-2 text-mid">
                  {Object.entries(config.links).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="min-w-0 truncate text-right">
                        {/^https?:\/\//.test(value) ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {value}
                          </a>
                        ) : (
                          <span className="font-mono text-note">{value}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </CardContent>
          </Card>

          {/* ── where to change things ─────────────────────────────────── */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Mengubah nilai ini di mana</CardTitle>
                  <CardDescription>
                    Halaman ini hanya untuk melihat. Nilai-nilai ini berlaku untuk semua bot,
                    jadi mengubahnya termasuk tindakan administratif.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral" size="sm">
                    <Info className="size-3" />
                    hanya baca
                  </Badge>
                  {canEdit ? (
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/dashboard/bot/settings">
                        <SlidersHorizontal className="size-3.5" />
                        Ubah di Pengaturan Bot
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Fact label="Plugin ditemukan" value={formatNumber(overview.totalPlugins)} />
                <Fact label="Plugin aktif" value={formatNumber(overview.activePlugins)} />
                <Fact label="Perintah" value={formatNumber(overview.totalCommands)} />
              </div>

              <p className="text-s leading-relaxed text-muted-foreground">
                Perubahan nilai di atas berlaku untuk semua sesi setelah bot dijalankan ulang.
                Nilai yang berbeda per akun — prefix, status premium, aturan grup — tersimpan
                terpisah dan diatur dari{' '}
                <Link href="/dashboard/bot/settings" className="text-primary underline-offset-4 hover:underline">Pengaturan Bot</Link>, atau dilihat di
                Data Bot.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function DefinitionList({
  entries,
}: {
  entries: Array<[label: string, value: string | null, mono?: boolean]>
}) {
  return (
    <dl className="space-y-2.5 text-mid">
      {entries.map(([label, value, mono]) => (
        <div key={label} className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">{label}</dt>
          <dd
            className={['min-w-0 truncate text-right', mono ? 'font-mono text-note' : ''].join(' ')}
            title={value ?? 'belum diatur'}
          >
            {value ?? <span className="text-muted-foreground">belum diatur</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-xs2 uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lead font-semibold">{value}</p>
    </div>
  )
}
