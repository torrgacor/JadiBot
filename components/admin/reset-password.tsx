'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, KeyRound, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'

/**
 * Reset a user's password from the admin panel.
 *
 * Two ways out: let the server generate a strong password (the default, so a
 * weak value can never be chosen), or type one that is validated against the
 * same rules as sign-up. The generated value is shown exactly once — the server
 * only keeps its hash — with a copy button and a warning to hand it over now.
 */
export function AdminResetPassword({
  userId,
  email,
}: {
  userId: string
  email: string
}) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'generate' | 'set'>('generate')
  const [password, setPassword] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [result, setResult] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function reset() {
    setMode('generate')
    setPassword('')
    setFieldError(null)
    setResult(null)
    setCopied(false)
  }

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  async function submit() {
    setBusy(true)
    setFieldError(null)

    try {
      const data = await apiRequest<{ password?: string }>(
        `/api/admin/users/${userId}/password`,
        {
          method: 'POST',
          body: mode === 'generate' ? { mode } : { mode, password },
        }
      )

      toast.success('Kata sandi diatur ulang. Semua sesi pengguna dikeluarkan.')
      router.refresh()

      if (data.password) {
        setResult(data.password)
      } else {
        onOpenChange(false)
      }
    } catch (error) {
      // A validation failure on the password field is shown inline; anything
      // else is a toast.
      setFieldError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function copy() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      toast.success('Kata sandi disalin.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Gagal menyalin. Salin manual dari kotak di atas.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <KeyRound className="size-3.5" />
          Reset sandi
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atur ulang kata sandi</DialogTitle>
          <DialogDescription>
            Untuk <span className="font-medium text-foreground">{email}</span>. Semua
            sesi pengguna akan dikeluarkan dan kata sandi lama tidak berlaku lagi.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3 px-5 pb-1">
            <div className="rounded-[12px] border border-success/30 bg-success/10 p-3.5">
              <p className="text-note text-muted-foreground">
                Kata sandi baru — hanya ditampilkan sekali ini:
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 select-all break-all rounded-[8px] border border-border bg-surface px-2.5 py-2 font-mono text-body tracking-wide">
                  {result}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  onClick={copy}
                  aria-label="Salin kata sandi"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
            </div>
            <p className="text-tiny text-muted-foreground">
              Serahkan kata sandi ini ke pemilik akun sekarang. Setelah dialog ditutup,
              nilainya tidak bisa dilihat lagi — hanya hash-nya yang tersimpan.
            </p>
          </div>
        ) : (
          <div className="space-y-4 px-5 pb-1">
            <div className="flex gap-2">
              <ModeButton
                active={mode === 'generate'}
                onClick={() => setMode('generate')}
                icon={<RefreshCw className="size-3.5" />}
              >
                Buat otomatis
              </ModeButton>
              <ModeButton
                active={mode === 'set'}
                onClick={() => setMode('set')}
                icon={<KeyRound className="size-3.5" />}
              >
                Ketik sendiri
              </ModeButton>
            </div>

            {mode === 'generate' ? (
              <p className="text-s leading-relaxed text-muted-foreground">
                Server akan membuat kata sandi acak yang memenuhi aturan keamanan
                (huruf besar, huruf kecil, dan angka) lalu menampilkannya satu kali.
              </p>
            ) : (
              <Field
                label="Kata sandi baru"
                htmlFor="admin-new-password"
                error={fieldError}
                hint="Minimal 8 karakter, harus memuat huruf besar, huruf kecil, dan angka."
                required
              >
                <Input
                  id="admin-new-password"
                  type="text"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  icon={<KeyRound />}
                />
              </Field>
            )}

            {mode === 'generate' && fieldError ? (
              <p className="text-xs text-danger" role="alert">
                {fieldError}
              </p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button type="button" onClick={() => onOpenChange(false)}>
              Selesai
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={busy}
              >
                Batal
              </Button>
              <Button type="button" onClick={submit} loading={busy}>
                Atur ulang
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ModeButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'inline-flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border px-3 py-2 text-s transition-colors ' +
        (active
          ? 'border-primary/40 bg-primary-soft text-primary'
          : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-primary-soft')
      }
    >
      {icon}
      {children}
    </button>
  )
}
