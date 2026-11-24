/**
 * Password strength scoring.
 *
 * Kept separate from lib/security/password.ts because that module imports
 * `node:crypto` for hashing, and a client component must not pull Node builtins
 * into the browser bundle. This file is pure and safe to import anywhere.
 *
 * Deliberately simple and explainable — no dictionary, no network call.
 */

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  suggestions: string[]
}

export function passwordStrength(password: string): PasswordStrength {
  const suggestions: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else if (password.length > 0) suggestions.push('Gunakan minimal 8 karakter')

  if (password.length >= 12) score++
  else if (password.length >= 8) suggestions.push('12 karakter atau lebih akan lebih kuat')

  const classes = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  if (classes >= 3) score++
  else if (password.length > 0) suggestions.push('Campur huruf besar, huruf kecil, dan angka')

  if (classes === 4) score++
  else if (password.length > 0) suggestions.push('Tambahkan simbol agar lebih kuat')

  const capped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4
  const labels = ['Sangat lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat']

  return { score: capped, label: labels[capped], suggestions }
}
