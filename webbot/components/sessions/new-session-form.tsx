'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Field } from '@/components/ui/label'
import { Input, Textarea } from '@/components/ui/input'
import { SwitchField } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'
import {
  BotNumberFields,
  type BotNumberValue,
} from '@/components/sessions/bot-number-fields'
import { apiRequest, ApiError, errorMessage } from '@/lib/api/client'
import { MIN_LOCAL_DIGITS, composeInternational, findCountry } from '@/lib/utils/country-codes'

/**
 * Create-bot form.
 *
 * Two things happen here, in the order the operator thinks about them: name the
 * bot and say which number it runs on, then decide how it behaves. The number is
 * composed from a country code and sent with the request, so it lands on the
 * session row — it is not a front-end-only value.
 *
 * The engine driver is an internal detail: the platform runs the Nano bot, with
 * the built-in engine used only as a fallback when Nano is not configured, so the
 * form picks the driver instead of asking the user to choose.
 */

interface CreatedSession {
  id: string
}

export function NewSessionForm({ nanoAvailable }: { nanoAvailable: boolean }) {
  const router = useRouter()

  const [botNumber, setBotNumber] = useState<BotNumberValue>({
    name: '',
    country: 'ID',
    local: '',
  })
  const [description, setDescription] = useState('')
  const [driver] = useState<'local-baileys' | 'nano-process'>(
    nanoAvailable ? 'nano-process' : 'local-baileys'
  )
  const [defaultDelayMs, setDefaultDelayMs] = useState(1200)

  const [autoReconnect, setAutoReconnect] = useState(true)
  const [alwaysOnline, setAlwaysOnline] = useState(false)
  const [readReceipts, setReadReceipts] = useState(true)
  const [typingSimulation, setTypingSimulation] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const country = findCountry(botNumber.country)
  const composed = composeInternational(country.dial, botNumber.local)
  const localDigits = botNumber.local.replace(/\D/g, '').replace(/^0+/, '')
  const valid = botNumber.name.trim().length >= 2 && localDigits.length >= MIN_LOCAL_DIGITS

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!valid) return

    setLoading(true)
    setError(null)
    setErrors({})

    try {
      const session = await apiRequest<CreatedSession>('/api/sessions', {
        method: 'POST',
        body: {
          name: botNumber.name.trim(),
          description: description.trim() || undefined,
          phoneNumber: `+${composed}`,
          driver,
          defaultDelayMs,
          autoReconnect,
          alwaysOnline,
          readReceipts,
          typingSimulation,
          connect: true,
        },
      })

      toast.success(
        `Bot dibuat untuk +${composed}. Minta kode penautan untuk menautkannya.`
      )
      router.push(`/dashboard/sessions/${session.id}`)
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors)
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-[12px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-mid text-danger"
        >
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Bot &amp; nomor</CardTitle>
          <CardDescription>
            Nama bot dan nomor WhatsApp yang akan dipakai. Tersimpan pada sesi ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BotNumberFields
            value={botNumber}
            onChange={setBotNumber}
            errors={errors}
            idPrefix="new-bot"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catatan</CardTitle>
          <CardDescription>Opsional, hanya untuk Anda sendiri.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="Deskripsi" htmlFor="description" error={errors.description}>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Catatan opsional tentang untuk apa nomor ini dipakai."
              maxLength={300}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perilaku</CardTitle>
          <CardDescription>
            Diterapkan bot pada setiap pesan keluar dari sesi ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SwitchField
            label="Sambung ulang otomatis"
            description="Menyambungkan kembali secara otomatis jika koneksi terputus, dan memulihkan sesi ini saat layanan dijalankan ulang."
            checked={autoReconnect}
            onCheckedChange={setAutoReconnect}
          />
          <SwitchField
            label="Selalu online"
            description="Menjaga akun tetap berstatus online. Sebagian orang memilih mematikannya demi privasi."
            checked={alwaysOnline}
            onCheckedChange={setAlwaysOnline}
          />
          <SwitchField
            label="Kirim tanda dibaca"
            description="Menandai pesan masuk sebagai sudah dibaca saat otomatisasi membalas."
            checked={readReceipts}
            onCheckedChange={setReadReceipts}
          />
          <SwitchField
            label="Simulasi sedang mengetik"
            description="Menampilkan indikator mengetik sebentar sebelum mengirim. Membuat pesan otomatis terasa lebih natural."
            checked={typingSimulation}
            onCheckedChange={setTypingSimulation}
          />

          <Field
            label="Jeda kirim bawaan (ms)"
            htmlFor="defaultDelayMs"
            hint="Jeda antar pesan dalam antrean. Nilai lebih besar lebih aman untuk nomor Anda."
          >
            <Input
              id="defaultDelayMs"
              type="number"
              min={0}
              max={60000}
              value={defaultDelayMs}
              onChange={(event) => setDefaultDelayMs(Number(event.target.value))}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={loading} disabled={!valid}>
          Buat bot &amp; lanjut penautan
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  )
}
