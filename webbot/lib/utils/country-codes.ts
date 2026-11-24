/**
 * Country dial codes.
 *
 * A curated list rather than the full ITU table: these are the countries this
 * panel realistically serves, and a 250-entry dropdown is worse to use than a
 * short one. The dial code is only a convenience for composing the
 * international number the engine needs — WhatsApp itself does the real
 * validation when the handshake runs.
 */

export interface CountryCode {
  /** ISO 3166-1 alpha-2, used as the select value. */
  code: string
  name: string
  /** Dial code without the leading plus. */
  dial: string
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'ID', name: 'Indonesia', dial: '62' },
  { code: 'MY', name: 'Malaysia', dial: '60' },
  { code: 'SG', name: 'Singapura', dial: '65' },
  { code: 'TH', name: 'Thailand', dial: '66' },
  { code: 'VN', name: 'Vietnam', dial: '84' },
  { code: 'PH', name: 'Filipina', dial: '63' },
  { code: 'IN', name: 'India', dial: '91' },
  { code: 'PK', name: 'Pakistan', dial: '92' },
  { code: 'BD', name: 'Bangladesh', dial: '880' },
  { code: 'SA', name: 'Arab Saudi', dial: '966' },
  { code: 'AE', name: 'Uni Emirat Arab', dial: '971' },
  { code: 'TR', name: 'Turki', dial: '90' },
  { code: 'EG', name: 'Mesir', dial: '20' },
  { code: 'NG', name: 'Nigeria', dial: '234' },
  { code: 'ZA', name: 'Afrika Selatan', dial: '27' },
  { code: 'US', name: 'Amerika Serikat', dial: '1' },
  { code: 'GB', name: 'Inggris', dial: '44' },
  { code: 'DE', name: 'Jerman', dial: '49' },
  { code: 'FR', name: 'Prancis', dial: '33' },
  { code: 'NL', name: 'Belanda', dial: '31' },
  { code: 'ES', name: 'Spanyol', dial: '34' },
  { code: 'IT', name: 'Italia', dial: '39' },
  { code: 'BR', name: 'Brasil', dial: '55' },
  { code: 'MX', name: 'Meksiko', dial: '52' },
  { code: 'AU', name: 'Australia', dial: '61' },
  { code: 'JP', name: 'Jepang', dial: '81' },
  { code: 'KR', name: 'Korea Selatan', dial: '82' },
  { code: 'CN', name: 'Tiongkok', dial: '86' },
  { code: 'HK', name: 'Hong Kong', dial: '852' },
  { code: 'TW', name: 'Taiwan', dial: '886' },
]

export const DEFAULT_COUNTRY_CODE = 'ID'

export function findCountry(code: string): CountryCode {
  return (
    COUNTRY_CODES.find((entry) => entry.code === code) ??
    COUNTRY_CODES.find((entry) => entry.code === DEFAULT_COUNTRY_CODE)!
  )
}

/** Strip everything that is not a dialing digit from a local part. */
export function normalizeLocalPart(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Compose the full international number (no `+`).
 *
 * A leading zero is the national trunk prefix — it is dropped, not kept, so
 * `0812…` with Indonesia (+62) becomes `62812…` rather than `620812…`.
 */
export function composeInternational(dial: string, local: string): string {
  const digits = normalizeLocalPart(local)
  const withoutTrunk = digits.replace(/^0+/, '')
  return `${normalizeLocalPart(dial)}${withoutTrunk}`
}

/**
 * Split a stored international number back into a dial code and a local part so
 * the form can be edited without losing the user's original grouping.
 *
 * Matches against the longest known dial code first, otherwise `+1` would win
 * over `+852` for a Hong Kong number.
 */
export function splitInternational(value: string): { country: string; local: string } {
  const digits = normalizeLocalPart(value)

  const candidates = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length)
  for (const entry of candidates) {
    if (digits.startsWith(entry.dial)) {
      return { country: entry.code, local: digits.slice(entry.dial.length) }
    }
  }

  return { country: DEFAULT_COUNTRY_CODE, local: digits }
}

/** Minimum digits a plausible international number carries after the dial code. */
export const MIN_LOCAL_DIGITS = 6
