import * as React from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Table primitives.
 *
 * Tables are wrapped in a horizontally scrollable container so they can never
 * cause page-level overflow on small screens. Where a table is the primary
 * content of a page (messages, contacts, sessions), pages additionally render
 * `MobileCardList` below `md` — see components/ui/mobile-card-list.tsx.
 */

export function TableWrapper({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-[14px] border border-border bg-surface',
        className
      )}
      {...props}
    />
  )
}

export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn('w-full min-w-[640px] border-collapse text-sm', className)}
      {...props}
    />
  )
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('border-b border-border bg-muted/30', className)}
      {...props}
    />
  )
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-border', className)} {...props} />
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('transition-colors hover:bg-muted/25', className)}
      {...props}
    />
  )
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-4 py-2.5 text-left text-xs2 font-semibold uppercase tracking-wide text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 align-middle', className)} {...props} />
  )
}

export function TableEmpty({
  colSpan,
  children,
}: {
  colSpan: number
  children: React.ReactNode
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-14 text-center">
        {children}
      </TableCell>
    </TableRow>
  )
}
