'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'

/**
 * Suspend / reactivate a user.
 *
 * Suspending revokes their sessions server-side, so this button has a real and
 * immediate effect rather than just flipping a label.
 */
export function AdminUserActions({
  userId,
  status,
}: {
  userId: string
  status: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const suspending = status === 'ACTIVE'

  async function run() {
    if (suspending && !window.confirm('Tangguhkan pengguna ini dan keluarkan dari semua perangkat?')) return

    setBusy(true)
    try {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: { action: suspending ? 'suspend' : 'activate' },
      })
      toast.success(suspending ? 'Pengguna ditangguhkan.' : 'Pengguna diaktifkan.')
      router.refresh()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      variant={suspending ? 'danger' : 'secondary'}
      size="sm"
      onClick={run}
      loading={busy}
    >
      {suspending ? (
        <>
          <Ban className="size-3.5" />
          Tangguhkan
        </>
      ) : (
        <>
          <UserCheck className="size-3.5" />
          Aktifkan
        </>
      )}
    </Button>
  )
}
