'use client'

import { useState } from 'react'
import { Ban, Crown, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SwitchField } from '@/components/ui/switch'
import { EmptyState } from '@/components/ui/empty-state'
import { useBotSetting } from '@/components/bot/use-bot-setting'
import type { NanoAccessMode } from '@/lib/engine/nano'
import { formatDateTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

/**
 * Runtime settings that live in the bot's own database.
 *
 * These are the same rows the script's `.onlygc`, `.anticall` and `.addowner`
 * commands write, so anything changed here is enforced by the bot on its next
 * message — no restart, and no parallel copy of the setting to drift out of
 * sync.
 */

const ACCESS_MODES: Array<{
  value: NanoAccessMode
  label: string
  description: string
}> = [
  {
    value: 'normal',
    label: 'Normal',
    description: 'Bot menjawab di grup maupun di chat pribadi.',
  },
  {
    value: 'onlygc',
    label: 'Hanya grup',
    description: 'Chat pribadi diabaikan (mode “onlygc” milik Nano).',
  },
  {
    value: 'onlypc',
    label: 'Hanya pribadi',
    description: 'Pesan grup diabaikan (mode “onlypc” milik Nano).',
  },
]

export function RuntimeSettings({
  accessMode,
  anticall,
  owners,
  initialized,
}: {
  accessMode: NanoAccessMode
  anticall: boolean
  owners: Array<{ number: string; name: string | null; addedAt: number; addedBy: string | null }>
  /** False when the bot has never created its database. */
  initialized: boolean
}) {
  const { apply, pending } = useBotSetting()
  const [ownerNumber, setOwnerNumber] = useState('')
  const [ownerName, setOwnerName] = useState('')

  async function addOwner() {
    const ok = await apply(
      { op: 'add-owner', number: ownerNumber, name: ownerName.trim() || null },
      'Menambahkan owner…'
    )
    if (ok) {
      setOwnerNumber('')
      setOwnerName('')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── access mode ──────────────────────────────────────────────────── */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Bot menjawab kepada siapa</CardTitle>
          <CardDescription>
            Pengaturan yang sama dengan perintah <span className="font-mono">.onlygc</span> di
            bot Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {ACCESS_MODES.map((mode) => {
              const active = accessMode === mode.value
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() =>
                    void apply({ op: 'access-mode', mode: mode.value }, 'Mengubah mode bot…')
                  }
                  disabled={pending !== null}
                  aria-pressed={active}
                  className={cn(
                    'rounded-[12px] border p-3.5 text-left transition-all duration-200',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60',
                    active
                      ? 'border-primary/45 bg-primary-soft shadow-[0_0_0_1px_var(--primary)]'
                      : 'border-border bg-muted/20 hover:border-border-strong hover:bg-muted/40'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'grid size-7 place-items-center rounded-[8px] border border-border bg-surface',
                        active ? 'text-primary' : 'text-muted-foreground'
                      )}
                      aria-hidden
                    >
                      <ShieldCheck className="size-3.5" />
                    </span>
                    <span className="text-mid font-medium">{mode.label}</span>
                    {active ? (
                      <Badge tone="primary" size="sm" className="ml-auto">
                        aktif
                      </Badge>
                    ) : null}
                  </span>
                  <span className="mt-2 block text-note leading-relaxed text-muted-foreground">
                    {mode.description}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── anticall ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Anticall</CardTitle>
              <CardDescription>
                Menolak panggilan masuk agar tidak berdering di ponsel yang tersambung.
              </CardDescription>
            </div>
            <span
              className="grid size-8 place-items-center rounded-[9px] border border-border bg-muted/50 text-muted-foreground"
              aria-hidden
            >
              <Ban className="size-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SwitchField
            label="Tolak panggilan masuk"
            description="Berlaku untuk semua chat."
            checked={anticall}
            disabled={pending !== null}
            onCheckedChange={(checked) =>
              void apply({ op: 'anticall', enabled: checked }, 'Menyimpan anticall…')
            }
          />
          <p className="text-note text-muted-foreground">
            {anticall
              ? 'Panggilan masuk sedang ditolak oleh bot.'
              : 'Panggilan berdering normal di ponsel yang tersambung.'}
            {!initialized
              ? ' Data bot belum dibuat, jadi nilai ini disimpan dan dipakai bot saat pertama dijalankan.'
              : ''}
          </p>
        </CardContent>
      </Card>

      {/* ── owners ───────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Owner tambahan</CardTitle>
              <CardDescription>
                Nomor tambahan di luar daftar owner bawaan.
              </CardDescription>
            </div>
            <span
              className="grid size-8 place-items-center rounded-[9px] border border-border bg-muted/50 text-muted-foreground"
              aria-hidden
            >
              <Crown className="size-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {owners.length === 0 ? (
            <EmptyState
              icon={Crown}
              compact
              title="Belum ada owner tambahan"
              description="Owner bawaan tetap berlaku. Tambahkan di sini untuk memberi akses perintah owner tanpa mengubah konfigurasi."
            />
          ) : (
            <ul className="space-y-2">
              {owners.map((owner) => (
                <li
                  key={owner.number}
                  className="flex items-center gap-3 rounded-[10px] border border-border bg-muted/20 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-s">{owner.number}</p>
                    <p className="truncate text-tiny text-muted-foreground">
                      {owner.name ? `${owner.name} · ` : ''}
                      ditambahkan {formatDateTime(new Date(owner.addedAt))}
                      {owner.addedBy ? ` oleh ${owner.addedBy}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Hapus owner ${owner.number}`}
                    disabled={pending !== null}
                    onClick={() => void apply({ op: 'remove-owner', number: owner.number }, 'Menghapus owner…')}
                  >
                    <Trash2 className="text-danger" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Nomor" htmlFor="ownerNumber" hint="Format internasional, misalnya 6281234567890.">
              <Input
                id="ownerNumber"
                value={ownerNumber}
                onChange={(event) => setOwnerNumber(event.target.value)}
                placeholder="6281234567890"
                inputMode="tel"
              />
            </Field>
            <Field label="Nama" htmlFor="ownerName">
              <Input
                id="ownerName"
                value={ownerName}
                onChange={(event) => setOwnerName(event.target.value)}
                placeholder="Opsional"
              />
            </Field>
            <Button
              variant="secondary"
              loading={pending === 'add-owner'}
              disabled={pending !== null || ownerNumber.trim().length < 8}
              onClick={() => void addOwner()}
            >
              {pending !== 'add-owner' ? <Plus /> : null}
              Tambah
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
