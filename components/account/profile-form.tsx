'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'
import { apiRequest, ApiError, errorMessage } from '@/lib/api/client'

export interface ProfileValues {
  name: string
  username: string
  phone: string
  timezone: string
  notifyEmail: boolean
  notifyPush: boolean
}

/**
 * Profile form.
 *
 * Only the fields the API actually accepts are editable — email is shown
 * read-only because changing it is a verification flow, not a text field.
 */
export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update<K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      await apiRequest('/api/account/profile', {
        method: 'PATCH',
        body: {
          name: form.name,
          username: form.username,
          phone: form.phone,
          timezone: form.timezone,
          notifyEmail: form.notifyEmail,
          notifyPush: form.notifyPush,
        },
      })

      setSaved(true)
      toast.success('Profil diperbarui.')
      // The topbar renders the name from the server, so refresh it.
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors)
      toast.error(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detail Anda</CardTitle>
          <CardDescription>Bagaimana akun Anda tampil di seluruh panel.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama" htmlFor="name" error={errors.name} required>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              autoComplete="name"
            />
          </Field>

          <Field label="Nama pengguna" htmlFor="username" error={errors.username} required>
            <Input
              id="username"
              value={form.username}
              onChange={(event) => update('username', event.target.value)}
              autoComplete="username"
            />
          </Field>

          <Field
            label="Telepon"
            htmlFor="phone"
            error={errors.phone}
            hint="Opsional. Hanya dipakai untuk pemulihan akun."
          >
            <Input
              id="phone"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              placeholder="+6281234567890"
              autoComplete="tel"
            />
          </Field>

          <Field
            label="Zona waktu"
            htmlFor="timezone"
            error={errors.timezone}
            hint="Memengaruhi cara waktu dan jadwal ditampilkan."
          >
            <Input
              id="timezone"
              value={form.timezone}
              onChange={(event) => update('timezone', event.target.value)}
              placeholder="Asia/Jakarta"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifikasi</CardTitle>
          <CardDescription>Tentang apa dan di mana kami memberi tahu Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            id="notify-email"
            label="Notifikasi email"
            description="Sesi terputus, pesan gagal, dan peringatan keamanan."
            checked={form.notifyEmail}
            onChange={(value) => update('notifyEmail', value)}
          />
          <ToggleRow
            id="notify-push"
            label="Notifikasi dalam panel"
            description="Menampilkan pemberitahuan di pusat notifikasi pada bilah atas."
            checked={form.notifyPush}
            onChange={(value) => update('notifyPush', value)}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving}>
          <Save className="size-4" />
          Simpan perubahan
        </Button>
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-s text-success">
            <Check className="size-3.5" />
            Tersimpan
          </span>
        ) : null}
      </div>
    </form>
  )
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-mid font-medium">
          {label}
        </label>
        <p className="mt-0.5 text-note text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
