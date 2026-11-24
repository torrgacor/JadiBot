/**
 * Application error types.
 *
 * Every user-facing failure is an `AppError` with a safe message and a machine
 * code. Stack traces are logged server-side and never sent to the client.
 */

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'QUOTA_EXCEEDED'
  | 'ENGINE_UNAVAILABLE'
  | 'ENGINE_ERROR'
  | 'SESSION_NOT_CONNECTED'
  | 'INTERNAL_ERROR'

export interface AppErrorInit {
  code: ErrorCode
  message: string
  status: number
  details?: unknown
  /** Set when the failure came from something outside our control. */
  cause?: unknown
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: unknown
  /** True for errors we expect during normal operation (4xx). */
  readonly expected: boolean

  constructor(init: AppErrorInit) {
    super(init.message)
    this.name = 'AppError'
    this.code = init.code
    this.status = init.status
    this.details = init.details
    this.expected = init.status < 500
    if (init.cause) this.cause = init.cause
  }
}

// ──────────────────────────────────────────────────────── constructors ───────

export const badRequest = (message = 'Permintaan tidak valid.') =>
  new AppError({ code: 'BAD_REQUEST', message, status: 400 })

export const unauthorized = (
  message = 'Anda perlu masuk terlebih dahulu.'
) => new AppError({ code: 'UNAUTHORIZED', message, status: 401 })

export const forbidden = (
  message = 'Anda tidak punya izin untuk melakukan tindakan ini.',
  /** Extra machine-readable context, e.g. which limit blocked the action. */
  details?: unknown
) => new AppError({ code: 'FORBIDDEN', message, status: 403, details })

export const notFound = (message = 'Data yang diminta tidak ditemukan.') =>
  new AppError({ code: 'NOT_FOUND', message, status: 404 })

export const conflict = (message = 'Data tersebut sudah ada.') =>
  new AppError({ code: 'CONFLICT', message, status: 409 })

export const rateLimited = (
  message = 'Terlalu banyak permintaan. Coba lagi nanti.',
  retryAfterSeconds?: number
) =>
  new AppError({
    code: 'RATE_LIMITED',
    message,
    status: 429,
    details: retryAfterSeconds ? { retryAfter: retryAfterSeconds } : undefined,
  })

export const quotaExceeded = (message: string, details?: unknown) =>
  new AppError({ code: 'QUOTA_EXCEEDED', message, status: 402, details })

/**
 * The WhatsApp gateway process is not reachable. This is distinct from a
 * WhatsApp-side failure: the user's session may be perfectly healthy, we just
 * cannot talk to the engine right now.
 */
export const engineUnavailable = (
  message = 'Tidak dapat terhubung ke layanan. Coba lagi sebentar lagi.'
) => new AppError({ code: 'ENGINE_UNAVAILABLE', message, status: 503 })

export const engineError = (message: string, details?: unknown) =>
  new AppError({ code: 'ENGINE_ERROR', message, status: 502, details })

export const sessionNotConnected = (
  message = 'Sesi WhatsApp terputus. Sambungkan ulang untuk melanjutkan.'
) => new AppError({ code: 'SESSION_NOT_CONNECTED', message, status: 409 })

export const internalError = (message = 'Terjadi kesalahan di sisi kami.') =>
  new AppError({ code: 'INTERNAL_ERROR', message, status: 500 })

export class ValidationError extends AppError {
  constructor(details: unknown, message = 'Periksa kembali kolom yang ditandai.') {
    super({ code: 'VALIDATION_ERROR', message, status: 422, details })
    this.name = 'ValidationError'
  }
}

// ─────────────────────────────────────────────────────────── response ────────

export interface ErrorPayload {
  code: ErrorCode
  message: string
  details?: unknown
  retryAfter?: number
}

/**
 * Convert any thrown value into a client-safe payload.
 *
 * Anything that is not an `AppError` is treated as an internal fault: we log
 * the real error and return a generic message so stack traces and internal
 * identifiers never reach the browser.
 */
export function toErrorPayload(error: unknown): {
  status: number
  payload: ErrorPayload
} {
  if (error instanceof AppError) {
    const retryAfter =
      error.details &&
      typeof error.details === 'object' &&
      'retryAfter' in error.details
        ? Number((error.details as { retryAfter?: number }).retryAfter)
        : undefined

    return {
      status: error.status,
      payload: {
        code: error.code,
        message: error.message,
        details: error.details,
        retryAfter,
      },
    }
  }

  // Unexpected: log full detail, expose nothing.
  console.error('[unhandled-error]', error)

  return {
    status: 500,
    payload: {
      code: 'INTERNAL_ERROR',
      message: 'Terjadi kesalahan di sisi kami. Silakan coba lagi.',
    },
  }
}

/** Guard for unique-constraint violations (Prisma P2002 / Mongo E11000). */
export function isUniqueConstraintError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  ) {
    const code = (error as { code?: string | number }).code
    return code === 'P2002' || code === 11000
  }
  return false
}
