'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/toast'
import { apiRequest, ApiError, errorMessage } from '@/lib/api/client'

const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: 'Masalah teknis',
  WHATSAPP_SESSION: 'Sesi WhatsApp / bot',
  BILLING: 'Pembayaran',
  API: 'API',
  OTHER: 'Lainnya',
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Rendah — kerjakan kapan sempat',
  NORMAL: 'Normal',
  HIGH: 'Tinggi — menghambat pekerjaan saya',
  URGENT: 'Mendesak — bot mati',
}

/**
 * Ticket form.
 *
 * Submits to the real endpoint and, on success, tells the user the reference
 * they can quote. The reference is generated server-side, so it cannot be
 * chosen by the client.
 */
export function TicketForm({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter()
  const [form, setForm] = useState({
    subject: '',
    category: 'TECHNICAL',
    priority: 'NORMAL',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const result = await apiRequest<{ reference: string }>('/api/support/tickets', {
        method: 'POST',
        body: form,
      })
      toast.success(`Tiket ${result.reference} dibuat. Kami akan membalas di halaman ini.`)
      setForm({ subject: '', category: 'TECHNICAL', priority: 'NORMAL', message: '' })
      onCreated?.()
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors)
      toast.error(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Ticket className="size-4 text-primary" aria-hidden />
          <CardTitle>Buat tiket</CardTitle>
        </div>
        <CardDescription>
          Jelaskan apa yang terjadi dan apa yang Anda harapkan. Sertakan nama bot bila
          masalahnya hanya pada sesi tertentu.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Subjek" htmlFor="ticket-subject" error={errors.subject} required>
            <Input
              id="ticket-subject"
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              placeholder="Bot terputus setelah pairing"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori" htmlFor="ticket-category">
              <Select
                value={form.category}
                onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="ticket-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Prioritas" htmlFor="ticket-priority">
              <Select
                value={form.priority}
                onValueChange={(value) => setForm((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger id="ticket-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Pesan" htmlFor="ticket-message" error={errors.message} required>
            {/* 16px on phones so iOS does not zoom the page when this is focused. */}
            <textarea
              id="ticket-message"
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              rows={5}
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:outline-2 focus-visible:outline-ring sm:py-2 sm:text-mid"
              placeholder="Apa yang terjadi, apa yang Anda harapkan, dan pesan error yang muncul."
            />
          </Field>

          <Button type="submit" loading={loading}>
            <Send className="size-4" />
            Kirim tiket
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
