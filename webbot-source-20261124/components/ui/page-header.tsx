import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface Crumb {
  label: string
  href?: string
}

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
  className,
}: {
  title: string
  description?: string
  crumbs?: Crumb[]
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex flex-col gap-4', className)}>
      {crumbs?.length ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {crumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <ChevronRight className="size-3 text-muted-foreground/50" aria-hidden />
                ) : null}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="rounded transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground/80">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-mid leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  )
}
