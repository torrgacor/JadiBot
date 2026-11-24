import type { Metadata } from 'next'
import { MessageSquare, Ticket } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guards'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { TicketForm } from '@/components/support/ticket-form'
import { formatDateTime, timeAgo } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Dukungan' }
export const dynamic = 'force-dynamic'

const STATUS_TONE: Record<string, 'neutral' | 'primary' | 'success' | 'warning'> = {
  OPEN: 'primary',
  PENDING: 'warning',
  ANSWERED: 'success',
  CLOSED: 'neutral',
}

const PRIORITY_TONE: Record<string, 'neutral' | 'warning' | 'danger'> = {
  LOW: 'neutral',
  NORMAL: 'neutral',
  HIGH: 'warning',
  URGENT: 'danger',
}

/** Support. Lists the caller's own tickets and lets them open a new one. */
export default async function SupportTicketPage() {
  const { user } = await requireAuth()

  const tickets = await db.ticket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 25,
    select: {
      id: true,
      reference: true,
      subject: true,
      category: true,
      priority: true,
      status: true,
      createdAt: true,
      lastReplyAt: true,
      _count: { select: { messages: true } },
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dukungan"
        description="Buat tiket dan pantau balasannya. Tiket hanya bisa dilihat oleh Anda dan staf."
      />

      <TicketForm />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Tiket Anda</CardTitle>
          <CardDescription>
            {tickets.length === 0 ? 'Belum ada tiket.' : `${tickets.length} tiket`}
          </CardDescription>
        </CardHeader>

        {tickets.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={Ticket}
              compact
              title="Belum ada tiket"
              description="Jika ada masalah, buat tiket di atas dan sertakan nama bot serta teks error-nya."
            />
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-tiny text-muted-foreground">
                      {ticket.reference}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-mid font-medium">
                      {ticket.subject}
                    </span>
                    <Badge tone={STATUS_TONE[ticket.status] ?? 'neutral'} size="sm">
                      {ticket.status.toLowerCase()}
                    </Badge>
                    <Badge tone={PRIORITY_TONE[ticket.priority] ?? 'neutral'} size="sm">
                      {ticket.priority.toLowerCase()}
                    </Badge>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-tiny text-muted-foreground">
                    <span>{ticket.category.toLowerCase().replace('_', ' ')}</span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="size-3" aria-hidden />
                      {ticket._count?.messages ?? 0} pesan
                    </span>
                    <span>dibuat {formatDateTime(ticket.createdAt)}</span>
                    {ticket.lastReplyAt ? (
                      <span>balasan terakhir {timeAgo(ticket.lastReplyAt)}</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            <p className="border-t border-border px-5 py-3 text-note text-muted-foreground">
              Fitur membalas tiket dan kotak masuk staf belum dibuat — tiket baru tetap
              tersimpan dan terlihat di sini, dan halaman ini akan mendapat tampilan percakapan
              saat fitur itu tersedia.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
