'use client'

import { useMemo, useState } from 'react'
import { FileCog, Save, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'
import type { NanoConfig, NanoConfigUpdateResult } from '@/lib/engine/nano'

/**
 * Editor for the script's own `config/settings.js`.
 *
 * This file is shared by every bot in the installation, so it is admin-only and
 * changes are written through the gateway, which verifies the rewritten module
 * parses before it replaces the original and keeps a timestamped backup. The bot
 * reads the file at startup, so the UI states plainly that a restart applies it.
 */

type FormState = {
  botName: string
  botAlias: string
  ownerName: string
  ownerNumbers: string
  defaultPrefix: string
  timezone: string
  footerText: string
  footerYear: string
  botVersion: string
  botMode: string
  pairingNumber: string
}

function initialState(config: NanoConfig | null): FormState {
  return {
    botName: config?.botName ?? '',
    botAlias: config?.botAlias ?? '',
    ownerName: config?.ownerName ?? '',
    ownerNumbers: (config?.ownerNumbers ?? []).join(', '),
    defaultPrefix: config?.defaultPrefix ?? '',
    timezone: config?.timezone ?? '',
    footerText: config?.footerText ?? '',
    footerYear: '',
    botVersion: config?.botVersion ?? '',
    botMode: config?.botMode ?? 'Public',
    pairingNumber: config?.pairingNumber ?? '',
  }
}

export function EngineConfigForm({
  config,
  canEdit,
}: {
  config: NanoConfig | null
  canEdit: boolean
}) {
  const [form, setForm] = useState<FormState>(() => initialState(config))
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<NanoConfigUpdateResult | null>(null)

  const dirty = useMemo(() => {
    const baseline = initialState(config)
    return (Object.keys(baseline) as Array<keyof FormState>).filter((key) => {
      if (key === 'ownerNumbers') {
        return form.ownerNumbers.replace(/\s/g, '') !== baseline.ownerNumbers.replace(/\s/g, '')
      }
      return form[key] !== baseline[key]
    })
  }, [config, form])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (dirty.length === 0) {
      toast.error('Belum ada perubahan untuk disimpan.')
      return
    }

    setPending(true)
    const toastId = toast.loading('Menyimpan konfigurasi…')
    try {
      const patch: Record<string, unknown> = {}
      for (const key of dirty) {
        if (key === 'ownerNumbers') {
          const numbers = form.ownerNumbers
            .split(/[,\s]+/)
            .map((entry) => entry.trim())
            .filter(Boolean)
          if (numbers.length > 0) patch.ownerNumbers = numbers
        } else if (form[key].trim() !== '') {
          patch[key] = form[key].trim()
        }
      }

      const response = await apiRequest<NanoConfigUpdateResult>('/api/bot/config', {
        method: 'POST',
        body: patch,
      })
      setResult(response)
      toast.success(
        `${response.updated.length} setting tersimpan. Restart bot untuk menerapkan.`,
        { id: toastId }
      )
    } catch (error) {
      toast.error(errorMessage(error), { id: toastId })
    } finally {
      setPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCog className="size-4 text-muted-foreground" aria-hidden />
              Konfigurasi bot
            </CardTitle>
            <CardDescription>
              Mengubah identitas dan nilai bawaan bot. Perubahan otomatis dicadangkan sebelum
              diterapkan.
            </CardDescription>
          </div>
          <Badge tone={canEdit ? 'warning' : 'neutral'} size="sm">
            {canEdit ? 'khusus admin · dipakai bersama' : 'hanya baca untuk peran Anda'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {config?.error ? (
          <p className="rounded-[10px] border border-danger/25 bg-danger/8 px-3 py-2 text-s text-muted-foreground">
            {config.error}
          </p>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama bot" htmlFor="botName" hint="Ditampilkan pada header menu bot.">
              <Input
                id="botName"
                value={form.botName}
                onChange={(event) => update('botName', event.target.value)}
                maxLength={80}
                disabled={!canEdit}
              />
            </Field>

            <Field label="Alias bot" htmlFor="botAlias" hint="Nama pendek yang dipakai pada perintah seperti .menu.">
              <Input
                id="botAlias"
                value={form.botAlias}
                onChange={(event) => update('botAlias', event.target.value)}
                maxLength={24}
                disabled={!canEdit}
              />
            </Field>

            <Field label="Nama owner" htmlFor="ownerName">
              <Input
                id="ownerName"
                value={form.ownerName}
                onChange={(event) => update('ownerName', event.target.value)}
                maxLength={80}
                disabled={!canEdit}
              />
            </Field>

            <Field
              label="Nomor owner"
              htmlFor="ownerNumbers"
              hint="Pisahkan dengan koma. Nomor ini mendapat akses perintah owner dari bot."
            >
              <Input
                id="ownerNumbers"
                value={form.ownerNumbers}
                onChange={(event) => update('ownerNumbers', event.target.value)}
                placeholder="6285892928715"
                className="font-mono"
                disabled={!canEdit}
              />
            </Field>

            <Field
              label="Prefix bawaan"
              htmlFor="defaultPrefix"
              hint="Dipakai semua perintah kecuali chat tersebut punya prefix sendiri."
            >
              <Input
                id="defaultPrefix"
                value={form.defaultPrefix}
                onChange={(event) => update('defaultPrefix', event.target.value)}
                maxLength={3}
                className="font-mono"
                disabled={!canEdit}
              />
            </Field>

            <Field label="Zona waktu" htmlFor="timezone" hint="Zona IANA, misalnya Asia/Jakarta.">
              <Input
                id="timezone"
                value={form.timezone}
                onChange={(event) => update('timezone', event.target.value)}
                maxLength={64}
                disabled={!canEdit}
              />
            </Field>

            <Field label="Teks footer" htmlFor="footerText" hint="Dicetak di bagian bawah menu bot.">
              <Input
                id="footerText"
                value={form.footerText}
                onChange={(event) => update('footerText', event.target.value)}
                maxLength={80}
                disabled={!canEdit}
              />
            </Field>

            <Field
              label="Tahun footer"
              htmlFor="footerYear"
              hint="Hanya bisa ditulis di sini: nilainya belum ditampilkan kembali oleh panel."
            >
              <Input
                id="footerYear"
                value={form.footerYear}
                onChange={(event) => update('footerYear', event.target.value)}
                placeholder="2026"
                maxLength={8}
                disabled={!canEdit}
              />
            </Field>

            <Field label="Versi bot" htmlFor="botVersion">
              <Input
                id="botVersion"
                value={form.botVersion}
                onChange={(event) => update('botVersion', event.target.value)}
                maxLength={16}
                className="font-mono"
                disabled={!canEdit}
              />
            </Field>

            <Field label="Mode tampilan" htmlFor="botMode">
              <Select
                value={form.botMode}
                onValueChange={(value) => update('botMode', value)}
                disabled={!canEdit}
              >
                <SelectTrigger id="botMode">
                  <SelectValue placeholder="Public" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Self">Self</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Nomor pairing"
              htmlFor="pairingNumber"
              hint="Dipakai saat menyambungkan dengan kode pairing, bukan scan QR."
            >
              <Input
                id="pairingNumber"
                value={form.pairingNumber}
                onChange={(event) => update('pairingNumber', event.target.value)}
                placeholder="6281234567890"
                className="font-mono"
                disabled={!canEdit}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" loading={pending} disabled={!canEdit || dirty.length === 0}>
              {!pending ? <Save /> : null}
              {dirty.length > 0 ? `Simpan ${dirty.length} perubahan` : 'Simpan'}
            </Button>
            {dirty.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setForm(initialState(config))}
                disabled={pending}
              >
                Batalkan
              </Button>
            ) : null}
            <span className="text-note text-muted-foreground">
              {dirty.length === 0
                ? 'Hanya kolom yang Anda ubah yang ditulis ulang.'
                : `Diubah: ${dirty.join(', ')}`}
            </span>
          </div>
        </form>

        {result ? (
          <div className="flex items-start gap-2.5 rounded-[10px] border border-warning/25 bg-warning/8 px-3.5 py-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <div className="min-w-0 text-s">
              <p className="font-medium">Restart bot untuk menerapkan</p>
              <p className="mt-0.5 text-muted-foreground">
                Tersimpan: {result.updated.join(', ')}. Proses yang sedang berjalan masih memakai
                nilai lama, jadi gunakan <span className="font-mono">Restart</span> di halaman bot.
              </p>
            </div>
          </div>
        ) : null}

        {!canEdit ? (
          <p className="text-s text-muted-foreground">
            Konfigurasi ini dipakai bersama semua bot, jadi hanya administrator yang boleh
            mengubahnya. Pengaturan per chat dan per grup di atas bisa Anda ubah sendiri.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
