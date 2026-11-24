import { db } from '@/lib/db'
import { parseJson, stringifyJson } from '@/lib/utils/json'
import type { JobType } from '@/types/enums'

/**
 * Job queue.
 *
 * Backed by the `Job` table so it works with zero infrastructure (no Redis on
 * this host). Claiming uses a conditional UPDATE so two concurrent workers can
 * never take the same row — the update only matches while the row is still
 * PENDING, and `count === 1` is the proof of ownership.
 *
 * ── UPGRADE PATH ────────────────────────────────────────────────────────────
 * `enqueue()` and `claim()` are the only two functions a worker depends on.
 * Swapping in Redis/BullMQ means reimplementing those against the same
 * signatures; no call site changes.
 */

/** A job that fails repeatedly stops being retried. */
export const DEFAULT_MAX_ATTEMPTS = 3

/** Exponential backoff, capped so a job is never parked for hours. */
export function backoffMs(attempt: number): number {
  const base = 5_000 * 2 ** Math.max(0, attempt - 1)
  const capped = Math.min(base, 10 * 60_000)
  // Jitter spreads retries so a batch failure does not stampede.
  return capped + Math.floor(Math.random() * 2_000)
}

export interface EnqueueOptions {
  type: JobType
  payload?: unknown
  userId?: string | null
  /** ISO date or Date. Defaults to now. */
  runAt?: Date
  priority?: number
  maxAttempts?: number
}

export async function enqueue(options: EnqueueOptions) {
  return db.job.create({
    data: {
      type: options.type,
      payload: stringifyJson(options.payload ?? {}),
      userId: options.userId ?? null,
      runAt: options.runAt ?? new Date(),
      priority: options.priority ?? 0,
      maxAttempts: options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    },
  })
}

export interface ClaimedJob {
  id: string
  type: JobType
  payload: unknown
  userId: string | null
  attempts: number
  maxAttempts: number
}

/**
 * Atomically claim the next runnable job.
 *
 * Ordered by priority then age so high-priority work (an interactive send)
 * overtakes bulk campaign batches.
 */
export async function claim(workerId: string): Promise<ClaimedJob | null> {
  const now = new Date()

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = await db.job.findFirst({
      where: {
        status: 'PENDING',
        runAt: { lte: now },
      },
      orderBy: [{ priority: 'desc' }, { runAt: 'asc' }],
      select: { id: true },
    })

    if (!candidate) return null

    // Conditional update = the lock. Whoever wins gets count === 1.
    const claimed = await db.job.updateMany({
      where: { id: candidate.id, status: 'PENDING' },
      data: {
        status: 'RUNNING',
        lockedAt: new Date(),
        lockedBy: workerId,
        attempts: { increment: 1 },
      },
    })

    if (claimed.count === 1) {
      const job = await db.job.findUnique({
        where: { id: candidate.id },
        select: {
          id: true,
          type: true,
          payload: true,
          userId: true,
          attempts: true,
          maxAttempts: true,
        },
      })

      if (!job) continue

      return {
        id: job.id,
        type: job.type as JobType,
        payload: parseJson<unknown>(job.payload, {}),
        userId: job.userId ?? null,
        attempts: job.attempts,
        maxAttempts: job.maxAttempts,
      }
    }

    // Lost the race — try the next candidate.
  }

  return null
}

export async function markDone(jobId: string, result?: unknown) {
  await db.job.update({
    where: { id: jobId },
    data: {
      status: 'DONE',
      result: result === undefined ? null : stringifyJson(result),
      finishedAt: new Date(),
      lockedAt: null,
      lockedBy: null,
    },
  })
}

/**
 * Record a failed attempt.
 *
 * Re-schedules with backoff while attempts remain, otherwise parks the job as
 * DEAD so it is visible in the admin panel instead of disappearing.
 */
export async function markFailed(jobId: string, error: string) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    select: { attempts: true, maxAttempts: true },
  })
  if (!job) return

  const exhausted = job.attempts >= job.maxAttempts

  await db.job.update({
    where: { id: jobId },
    data: {
      status: exhausted ? 'DEAD' : 'PENDING',
      lastError: error.slice(0, 2000),
      runAt: exhausted ? undefined : new Date(Date.now() + backoffMs(job.attempts)),
      lockedAt: null,
      lockedBy: null,
      ...(exhausted ? { finishedAt: new Date() } : {}),
    },
  })
}

/**
 * Recover jobs abandoned by a crashed worker.
 *
 * A RUNNING job whose lock is older than the timeout is assumed dead — without
 * this, a process kill during a send would leave the job stuck forever.
 */
export async function recoverStuckJobs(timeoutMs = 5 * 60_000): Promise<number> {
  const cutoff = new Date(Date.now() - timeoutMs)
  const result = await db.job.updateMany({
    where: { status: 'RUNNING', lockedAt: { lt: cutoff } },
    data: {
      status: 'PENDING',
      lockedAt: null,
      lockedBy: null,
      lastError: 'Worker kehabisan waktu; pekerjaan dikembalikan ke antrean.',
    },
  })
  return result.count
}

export interface QueueStats {
  pending: number
  running: number
  done: number
  failed: number
  dead: number
}

export async function queueStats(): Promise<QueueStats> {
  const [pending, running, done, dead] = await Promise.all([
    db.job.count({ where: { status: 'PENDING' } }),
    db.job.count({ where: { status: 'RUNNING' } }),
    db.job.count({ where: { status: 'DONE' } }),
    db.job.count({ where: { status: 'DEAD' } }),
  ])

  return { pending, running, done, failed: 0, dead }
}
