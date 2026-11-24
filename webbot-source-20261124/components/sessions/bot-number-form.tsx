'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BotNumberFields, type BotNumberValue } from '@/components/sessions/bot-number-fields'
import { toast } from '@/components/ui/toast'
import { apiRequest, ApiError, errorMessage } from '@/lib/api/client'
import { MIN_LOCAL_DIGITS, composeInternational, findCountry } from '@/lib/utils/country-codes'

/**
 * Bot number settings.
 *
 * Writes the name and the composed international number onto the session row —
 * the same row the pairing request reads from — so saving here is what makes the
 * later "request linking code" work without retyping anything.
 */
export function BotNumberForm({
  sessionId,
  initial,
  connectedNumber,
}: {
  sessionId: string
  initial: BotNumberValue
  /** The number WhatsApp actually reported, when the session is linked. */
  connectedNumber: string | null
}) {
  const router = useRouter()

  const [value, setValue] = useState<BotNumberValue>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<'save' | 'save-and-link' | null>(null)

  const country = findCountry(value.country)
  const composed = composeInternational(country.dial, value.local)
  const localDigits = value.local.replace(/\D/g, '').replace(/^0+/, '')
  const valid = value.name.trim().length >= 2 && localDigits.length >= MIN_LOCAL_DIGITS

  async function submit(mode: 'save' | 'save-and-link') {
    if (!valid) return
    setSaving(mode)
    setError(null)
    setErrors({})

    try {
      await apiRequest(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        body: {
          name: value.name.trim(),
          phoneNumber: `+${composed}`,
        },
      })

      if (mode === 'save-and-link') {
        toast.success('Nomor disimpan. Membuka halaman penautan…')
        router.push(`/dashboard/sessions/${sessionId}`)
      } else {
        toast.success('Nomor bot disimpan.')
        router.refresh()
      }
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors)
      setError(errorMessage(err))
    } finally {
      setSaving(null)
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        void submit('save')
      }}
    >
      {error ? (
        <div
          role="alert"
          className="rounded-[12px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-mid text-danger"
        >
          {error}
        </div>
      ) : null}

      {connectedNumber && connectedNumber !== composed ? (
        <div className="rounded-[12px] border border-warning/30 bg-warning/10 px-3.5 py-2.5 text-s leading-relaxed text-warning">
          Sesi ini sudah tertaut ke <span className="font-mono">{connectedNumber}</span>.
          Mengubah nomor di sini tidak melepaskan perangkat — lepas dulu sesi dari
          WhatsApp jika Anda benar-benar ingin menggantinya.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Nomor bot</CardTitle>
          <CardDescription>
            Tentukan nama dan nomor WhatsApp yang dipakai bot ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BotNumberFields
            value={value}
            onChange={setValue}
            errors={errors}
            idPrefix="bot-number"
            nameHint="Nama yang tampil di panel dan di daftar bot Anda."
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" loading={saving === 'save'} disabled={!valid || saving !== null}>
          {saving !== 'save' ? <Save className="size-4" /> : null}
          Simpan nomor
        </Button>
        <Button
          type="button"
          variant="secondary"
          loading={saving === 'save-and-link'}
          disabled={!valid || saving !== null}
          onClick={() => void submit('save-and-link')}
        >
          {saving !== 'save-and-link' ? <KeyRound className="size-4" /> : null}
          Simpan &amp; minta kode penautan
        </Button>
      </div>
    </form>
  )
}
