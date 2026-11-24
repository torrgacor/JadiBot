/**
 * Browser API client.
 *
 * Two jobs:
 *  1. Attach the CSRF header on mutating requests (the token lives in a
 *     readable cookie by design — see lib/security/csrf.ts).
 *  2. Normalise the server's error envelope into a thrown `ApiError` with a
 *     flat list of field errors, so forms can highlight inputs directly.
 */

// Imported from the dependency-free constants module: this file runs in the
// browser, and lib/security/csrf.ts uses node:crypto.
import { CSRF_COOKIE, CSRF_HEADER } from '@/lib/security/constants'

export interface ApiErrorBody {
  code: string
  message: string
  details?: unknown
  retryAfter?: number
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: unknown
  readonly retryAfter?: number

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.details = body.details
    this.retryAfter = body.retryAfter
  }

  /**
   * Flatten validation details into `{ field: message }` for form rendering.
   * Zod's flattened shape is `{ field: string[] }`; anything else is ignored.
   */
  get fieldErrors(): Record<string, string> {
    const details = this.details
    if (!details || typeof details !== 'object') return {}

    const out: Record<string, string> = {}
    for (const [key, value] of Object.entries(details as Record<string, unknown>)) {
      if (Array.isArray(value) && typeof value[0] === 'string') {
        out[key] = value[0]
      } else if (typeof value === 'string') {
        out[key] = value
      }
    }
    return out
  }
}

function readCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CSRF_COOKIE}=`))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = { accept: 'application/json' }

  if (options.body !== undefined) headers['content-type'] = 'application/json'

  // CSRF only matters for state-changing verbs, and only when a session exists.
  if (method !== 'GET') {
    const token = readCsrfToken()
    if (token) headers[CSRF_HEADER] = token
  }

  let response: Response
  try {
    response = await fetch(path, {
      method,
      headers,
      signal: options.signal,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, {
      code: 'NETWORK_ERROR',
      message: 'Tidak dapat menghubungi server. Periksa koneksi Anda dan coba lagi.',
    })
  }

  // 204 has no body.
  if (response.status === 204) return undefined as T

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new ApiError(response.status, {
      code: 'BAD_RESPONSE',
      message: `Server mengirim respons yang tidak bisa dibaca (HTTP ${response.status}).`,
    })
  }

  const envelope = payload as
    | { success: true; data: T }
    | { success: false; error: ApiErrorBody }

  if (!response.ok || envelope.success === false) {
    const error =
      'error' in envelope && envelope.error
        ? envelope.error
        : { code: 'UNKNOWN', message: `Permintaan gagal (HTTP ${response.status}).` }
    throw new ApiError(response.status, error)
  }

  return envelope.data
}

/** Extract a human message from any thrown value. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan. Silakan coba lagi.'
}
