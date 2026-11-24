import { NextResponse } from 'next/server'
import { z } from 'zod'
import { toErrorPayload, ValidationError } from '@/lib/errors'

/** Shared JSON envelopes so every endpoint responds identically. */

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiSuccess<T> {
  success: true
  data: T
  pagination?: Pagination
}

export interface ApiFailure {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
    retryAfter?: number
  }
}

export function ok<T>(data: T, init?: { status?: number; pagination?: Pagination }) {
  const body: ApiSuccess<T> = { success: true, data }
  if (init?.pagination) body.pagination = init.pagination
  return NextResponse.json(body, { status: init?.status ?? 200 })
}

export function created<T>(data: T) {
  return ok(data, { status: 201 })
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return ok(items, {
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
}

/** Convert a thrown value into the failure envelope with the right status. */
export function fail(error: unknown) {
  const { status, payload } = toErrorPayload(error)
  const body: ApiFailure = { success: false, error: payload }
  const headers: Record<string, string> = {}
  if (payload.retryAfter) headers['Retry-After'] = String(payload.retryAfter)
  return NextResponse.json(body, { status, headers })
}

/**
 * Parse and validate a request body.
 *
 * Throws `ValidationError` with flattened field errors so the UI can highlight
 * the offending inputs instead of showing a generic failure.
 */
export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    throw new ValidationError({ _form: ['Isi permintaan harus berupa JSON yang valid.'] })
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    throw new ValidationError(z.flattenError(result.error).fieldErrors)
  }
  return result.data
}

/** Same as `parseBody` but for querystring params. */
export function parseQuery<T extends z.ZodTypeAny>(request: Request, schema: T): z.infer<T> {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams.entries())
  const result = schema.safeParse(params)
  if (!result.success) {
    throw new ValidationError(z.flattenError(result.error).fieldErrors)
  }
  return result.data
}
