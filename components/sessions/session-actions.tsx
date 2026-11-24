'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LogOut,
  MoreHorizontal,
  Plug,
  PlugZap,
  RefreshCw,
  RotateCw,
  Trash2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'
import type { SessionStatus } from '@/types/enums'

/**
 * Session action menu.
 *
 * Every item performs a real operation against the engine. Destructive actions
 * (unlink, delete) require explicit confirmation because they cannot be undone
 * — unlinking forces a full re-pair on the phone.
 */

type Action = 'connect' | 'disconnect' | 'restart' | 'logout' | 'sync-groups'

export function SessionActions({
  sessionId,
  sessionName,
  status,
  compact = false,
  locked = false,
  lockedMessage,
}: {
  sessionId: string
  sessionName: string
  status: SessionStatus
  compact?: boolean
  /**
   * True when the account has no active plan. Connecting and restarting are
   * disabled — the server refuses them — while disconnecting, unlinking and
   * deleting stay enabled: cleaning up must never be blocked by a paywall.
   */
  locked?: boolean
  lockedMessage?: string
}) {
  const router = useRouter()

  const [pending, setPending] = useState<Action | 'delete' | null>(null)
  const [confirm, setConfirm] = useState<'logout' | 'delete' | null>(null)

  const isConnected = status === 'CONNECTED'
  const canConnect = !isConnected && status !== 'QR_REQUIRED' && status !== 'CONNECTING'

  async function runAction(action: Action) {
    setPending(action)
    try {
      await apiRequest(`/api/sessions/${sessionId}/actions`, {
        method: 'POST',
        body: { action },
      })

      const messages: Record<Action, string> = {
        connect: 'Koneksi dimulai. Scan kode QR atau pakai kode pairing.',
        disconnect: 'Sesi terputus.',
        restart: 'Sesi sedang dimulai ulang.',
        logout: 'Sesi berhasil dilepas dari WhatsApp.',
        'sync-groups': 'Grup berhasil disinkronkan.',
      }
      toast.success(messages[action])

      router.refresh()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPending(null)
    }
  }

  async function confirmAndRun(action: 'logout' | 'delete') {
    setPending(action)
    try {
      if (action === 'logout') {
        await apiRequest(`/api/sessions/${sessionId}/actions`, {
          method: 'POST',
          body: { action: 'logout' },
        })
        toast.success('Sesi berhasil dilepas dari WhatsApp.')
        router.refresh()
      } else {
        await apiRequest(`/api/sessions/${sessionId}`, { method: 'DELETE' })
        toast.success('Sesi dihapus.')
        router.push('/dashboard/sessions')
        router.refresh()
      }
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPending(null)
      setConfirm(null)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={compact ? 'ghost' : 'secondary'}
            size={compact ? 'icon-sm' : 'md'}
            aria-label={`Aksi untuk ${sessionName}`}
          >
            <MoreHorizontal className="size-4" />
            {!compact ? <span>Aksi</span> : null}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Siklus hidup sesi</DropdownMenuLabel>

          {isConnected ? (
            <DropdownMenuItem
              onClick={() => runAction('disconnect')}
              disabled={pending !== null}
            >
              <Plug />
              Putuskan
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => runAction('connect')}
              disabled={pending !== null || !canConnect || locked}
              title={locked ? lockedMessage : undefined}
            >
              <PlugZap />
              {status === 'QR_REQUIRED' ? 'Menunggu scan…' : 'Hubungkan'}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => runAction('restart')}
            disabled={pending !== null || locked}
            title={locked ? lockedMessage : undefined}
          >
            <RotateCw />
            Restart sesi
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => runAction('sync-groups')}
            disabled={pending !== null || !isConnected}
          >
            <Users />
            Sinkronkan grup
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a href={`/dashboard/sessions/${sessionId}`}>
              <RefreshCw />
              Buka detail
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            destructive
            onClick={() => setConfirm('logout')}
            disabled={pending !== null}
          >
            <LogOut />
            Lepas dari WhatsApp
          </DropdownMenuItem>

          <DropdownMenuItem
            destructive
            onClick={() => setConfirm('delete')}
            disabled={pending !== null}
          >
            <Trash2 />
            Hapus sesi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── confirm unlink ────────────────────────────────────────────── */}
      <Dialog open={confirm === 'logout'} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lepas “{sessionName}” dari WhatsApp?</DialogTitle>
            <DialogDescription>
              Tindakan ini menghapus perangkat dari akun WhatsApp Anda dan menghapus kredensial
              yang tersimpan. Untuk menyambung kembali Anda perlu scan kode QR baru atau
              membuat kode pairing baru.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              loading={pending === 'logout'}
              onClick={() => confirmAndRun('logout')}
            >
              Lepas perangkat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── confirm delete ────────────────────────────────────────────── */}
      <Dialog open={confirm === 'delete'} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus “{sessionName}”?</DialogTitle>
            <DialogDescription>
              Sesi ini, kredensial tersimpannya, dan riwayat pesannya akan dihapus permanen.
              Tindakan ini tidak bisa dibatalkan. Jika perangkatnya masih tertaut di ponsel,
              hapus juga dari sana.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              loading={pending === 'delete'}
              onClick={() => confirmAndRun('delete')}
            >
              Hapus permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
