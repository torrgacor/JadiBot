'use client'

import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useCopy } from '@/hooks/use-copy'

/**
 * Copyable code block.
 *
 * The copy button is the only interactive element and it performs a real
 * clipboard write (with an execCommand fallback) — no decorative affordances.
 */
export function CodeBlock({
  code,
  language,
  className,
  label,
}: {
  code: string
  language?: string
  className?: string
  label?: string
}) {
  const { copy, copied } = useCopy()

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[12px] border border-border bg-[#0b0d10]',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2">
        <span className="font-mono text-xs2 uppercase tracking-wide text-white/40">
          {label ?? language ?? 'code'}
        </span>
        <button
          type="button"
          onClick={() => void copy(code)}
          className="inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-xs2 font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={copied ? 'Tersalin ke clipboard' : 'Salin kode ke clipboard'}
        >
          {copied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>

      <pre className="overflow-x-auto p-3.5 text-s leading-relaxed">
        <code className="font-mono text-white/85">{code}</code>
      </pre>
    </div>
  )
}
