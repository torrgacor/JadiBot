'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'

/**
 * Ask Pakasir directly about one invoice.
 *
 * The webhook usually beats the customer back to this page, but it can be lost.
 * This is the escape hatch: a real status call, not a "refresh and hope".
 */

type SyncResponse = {
  payment: { status: string; amount: number; cycle: string; providerRef: string | null }
}

export function OrderStatusButton({
  invoice,
  className,
}: {
  invoice: string
  className?: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function check() {
    if (pending) return
    setPending(true)

    try {
      const result = await apiRequest<SyncResponse>(
        `/api/billing/orders/${encodeURIComponent(invoice)}/sync`,
        { method: 'POST' }
      )

      if (result.payment.status === 'SUCCESS') {
        toast.success('Pembayaran diterima — paket Anda sudah aktif.')
      } else if (result.payment.status === 'FAILED') {
        toast.error('Transaksi itu dibatalkan atau sudah kedaluwarsa.')
      } else {
        toast.info('Belum ada pembayaran yang masuk untuk tagihan ini.')
      }

      router.refresh()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      disabled={pending}
      onClick={() => void check()}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <RefreshCw className="size-3.5" />
      )}
      Cek status
    </Button>
  )
}
