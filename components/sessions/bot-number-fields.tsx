'use client'

import { Smartphone } from 'lucide-react'
import { Field, Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  COUNTRY_CODES,
  MIN_LOCAL_DIGITS,
  composeInternational,
  findCountry,
} from '@/lib/utils/country-codes'
import { cn } from '@/lib/utils/cn'

/**
 * Bot identity fields.
 *
 * Shared by the "Add bot" step and the "Bot Number" page so the two can never
 * disagree about how a number is composed. The country code plus the local part
 * are composed here and the preview shows exactly the string that will be stored
 * on the session row and handed to the engine — no hidden formatting.
 */

export interface BotNumberValue {
  name: string
  /** ISO code of the selected country. */
  country: string
  /** The part after the dial code, as typed. */
  local: string
}

export function BotNumberFields({
  value,
  onChange,
  errors,
  idPrefix = 'bot',
  nameHint,
  disabled,
}: {
  value: BotNumberValue
  onChange: (next: BotNumberValue) => void
  errors?: Record<string, string>
  idPrefix?: string
  nameHint?: string
  disabled?: boolean
}) {
  const country = findCountry(value.country)
  const composed = composeInternational(country.dial, value.local)
  const localDigits = value.local.replace(/\D/g, '').replace(/^0+/, '')

  const numberValid = localDigits.length >= MIN_LOCAL_DIGITS
  const numberError =
    errors?.phoneNumber ??
    (value.local.length > 0 && !numberValid
      ? `Nomor terlalu pendek. Minimal ${MIN_LOCAL_DIGITS} angka setelah kode negara.`
      : null)

  return (
    <div className="space-y-4">
      <Field
        label="Nama bot"
        htmlFor={`${idPrefix}-name`}
        error={errors?.name}
        hint={nameHint ?? 'Nama yang tampil di panel, misalnya “Nano Bot”.'}
        required
      >
        <Input
          id={`${idPrefix}-name`}
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          placeholder="Nano Bot"
          maxLength={60}
          disabled={disabled}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-country`} required>
            Kode negara
          </Label>
          <Select
            value={value.country}
            onValueChange={(next) => onChange({ ...value, country: next })}
            disabled={disabled}
          >
            <SelectTrigger id={`${idPrefix}-country`} aria-label="Kode negara">
              <SelectValue placeholder="Pilih negara" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((entry) => (
                <SelectItem key={entry.code} value={entry.code}>
                  <span className="inline-flex items-center gap-2">
                    <span className="text-muted-foreground">+{entry.dial}</span>
                    <span>{entry.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Field
          label="Nomor bot"
          htmlFor={`${idPrefix}-number`}
          error={numberError}
          hint="Tanpa kode negara dan tanpa angka 0 di depan."
          required
        >
          <Input
            id={`${idPrefix}-number`}
            value={value.local}
            onChange={(event) =>
              // Keep digits only as the user types; the full number is composed
              // from the selected dial code on every render.
              onChange({ ...value, local: event.target.value.replace(/[^\d]/g, '') })
            }
            inputMode="numeric"
            autoComplete="off"
            placeholder="81234567890"
            icon={<Smartphone />}
            disabled={disabled}
          />
        </Field>
      </div>

      <div
        className={cn(
          'rounded-[12px] border px-3.5 py-2.5',
          numberValid
            ? 'border-primary/25 bg-primary-soft'
            : 'border-border bg-glass/40'
        )}
      >
        <p className="text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Nomor yang akan didaftarkan
        </p>
        <p
          className={cn(
            'mt-1 font-mono text-lead font-semibold tracking-tight',
            numberValid ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {numberValid ? `+${composed}` : 'lengkapi nomor di atas'}
        </p>
        <p className="mt-1 text-tiny leading-relaxed text-muted-foreground">
          Nomor ini disimpan bersama sesi dan dipakai saat meminta kode penautan
          dari WhatsApp.
        </p>
      </div>
    </div>
  )
}
