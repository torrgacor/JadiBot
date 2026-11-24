import Link from 'next/link'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TrialClaimButton } from '@/components/billing/trial-claim-button'
import { cn } from '@/lib/utils/cn'
import type { BotAccessNoticeData } from '@/lib/services/bot-access'

/**
 * "You cannot run a bot right now" — the sentence behind every disabled button.
 *
 * Rendered next to whatever would have started, restarted or linked the bot, so
 * a locked account is told why instead of collecting 403s from the API. The text
 * comes from the server decision (`botAccessNotice`), never from the UI, and the
 * actions offered match what the server would actually accept: the trial button
 * only appears while the trial can still be claimed.
 *
 * No `'use client'` on purpose: server pages render it directly, and the client
 * components that host controls import the same component, which share the one
 * wording.
 */
export function BotAccessNotice({
  data,
  /** Off when the host already sits under a panel that offers the same actions. */
  showActions = true,
  className,
}: {
  data: BotAccessNoticeData | null
  showActions?: boolean
  className?: string
}) {
  if (!data) return null

  return (
    <div
      className={cn(
        'rounded-[14px] border border-warning/35 bg-warning/8 p-3.5',
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-warning/12 text-warning"
          aria-hidden
        >
          <LockKeyhole className="size-4" />
        </span>

        <div className="min-w-0">
          <p className="text-mid font-semibold text-warning">{data.title}</p>
          <p className="mt-0.5 text-note leading-relaxed text-muted-foreground">
            {data.message}
          </p>
        </div>
      </div>

      {showActions ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-[42px]">
          {data.trialAvailable ? <TrialClaimButton size="sm" /> : null}
          <Button asChild size="sm" variant={data.trialAvailable ? 'secondary' : 'primary'}>
            <Link href="/dashboard/billing">
              Lihat paket berbayar
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
