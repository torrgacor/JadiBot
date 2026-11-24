'use client'

import { useState } from 'react'
import { MessageSquareText, RotateCcw, Save, ShieldAlert, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field } from '@/components/ui/label'
import { Input, Textarea } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useBotSetting } from '@/components/bot/use-bot-setting'
import type { NanoGroupSettings } from '@/lib/engine/nano'

/**
 * Per-group settings read straight from the bot database.
 *
 * A row is shown for every chat the bot has stored something for — welcome text,
 * antilink state or a custom prefix. Group *metadata* (names, member counts) is
 * not shown because Nano has no module that exports it; the chat id is what the
 * bot itself works with.
 */
export function GroupSettingsList({
  groups,
  defaultPrefix,
}: {
  groups: NanoGroupSettings[]
  defaultPrefix: string | null
}) {
  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-2">
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div
              className="grid size-12 place-items-center rounded-[14px] border border-border bg-muted/40 text-muted-foreground"
              aria-hidden
            >
              <Users className="size-5" />
            </div>
            <p className="text-sm font-semibold">Belum ada pengaturan grup tersimpan</p>
            <p className="max-w-md text-mid leading-relaxed text-muted-foreground">
              Bot membuat satu baris saat pertama kali sesuatu diatur untuk sebuah grup — pesan
              welcome, antilink, atau prefix khusus. Baris tersebut muncul di sini otomatis.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {groups.map((group) => (
        <GroupCard key={group.chatId} group={group} defaultPrefix={defaultPrefix} />
      ))}
    </div>
  )
}

function GroupCard({
  group,
  defaultPrefix,
}: {
  group: NanoGroupSettings
  defaultPrefix: string | null
}) {
  const { apply, pending } = useBotSetting()
  const [prefix, setPrefix] = useState(group.prefix ?? '')
  const [editing, setEditing] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState(group.welcomeMessage ?? '')
  const [leftMessage, setLeftMessage] = useState(group.welcomeLeftMessage ?? '')
  const [showWelcomeText, setShowWelcomeText] = useState(false)
  const busy = pending !== null

  const shortId = group.chatId.replace(/@.*$/, '')
  const prefixDirty = (group.prefix ?? '') !== prefix

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate font-mono text-mid">{shortId}</CardTitle>
            <CardDescription className="truncate font-mono text-tiny">
              {group.chatId}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={group.welcome ? 'primary' : 'neutral'} size="sm">
              welcome {group.welcome ? 'aktif' : 'mati'}
            </Badge>
            <Badge tone={group.antilinkGroup ? 'primary' : 'neutral'} size="sm">
              antilink {group.antilinkGroup ? 'aktif' : 'mati'}
            </Badge>
            <Badge tone={group.antilinkChannel ? 'primary' : 'neutral'} size="sm">
              tautan channel {group.antilinkChannel ? 'aktif' : 'mati'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── welcome ─────────────────────────────────────────────────────── */}
        <div className="space-y-2 rounded-[10px] border border-border bg-muted/20 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-mid font-medium">
              <MessageSquareText className="size-3.5 text-muted-foreground" aria-hidden />
              Welcome / goodbye
            </span>
            <span className="flex items-center gap-1.5">
              <Button
                variant={group.welcome ? 'danger' : 'success'}
                size="sm"
                loading={pending === 'group-welcome' && !editing}
                disabled={busy}
                onClick={() =>
                  void apply(
                    { op: 'group-welcome', chatId: group.chatId, enabled: !group.welcome },
                    group.welcome ? 'Menonaktifkan welcome…' : 'Mengaktifkan welcome…'
                  )
                }
              >
                {group.welcome ? 'Matikan' : 'Aktifkan'}
              </Button>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => setEditing(true)}>
                Ubah teks
              </Button>
            </span>
          </div>

          <p className="line-clamp-2 text-note leading-relaxed text-muted-foreground">
            {group.welcomeMessage
              ? group.welcomeMessage
              : group.welcome
                ? 'Memakai teks welcome bawaan bot.'
                : 'Belum ada teks welcome untuk grup ini.'}
          </p>
        </div>

        {/* ── antilink ────────────────────────────────────────────────────── */}
        <div className="space-y-2 rounded-[10px] border border-border bg-muted/20 p-3.5">
          <span className="flex items-center gap-2 text-mid font-medium">
            <ShieldAlert className="size-3.5 text-muted-foreground" aria-hidden />
            Antilink
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={group.antilinkGroup ? 'secondary' : 'outline'}
              size="sm"
              disabled={busy}
              onClick={() =>
                void apply(
                  {
                    op: 'group-antilink',
                    chatId: group.chatId,
                    groupEnabled: !group.antilinkGroup,
                    channelEnabled: group.antilinkChannel,
                  },
                  'Menyimpan antilink…'
                )
              }
            >
              Tautan grup: {group.antilinkGroup ? 'AKTIF' : 'MATI'}
            </Button>
            <Button
              variant={group.antilinkChannel ? 'secondary' : 'outline'}
              size="sm"
              disabled={busy}
              onClick={() =>
                void apply(
                  {
                    op: 'group-antilink',
                    chatId: group.chatId,
                    groupEnabled: group.antilinkGroup,
                    channelEnabled: !group.antilinkChannel,
                  },
                  'Menyimpan antilink…'
                )
              }
            >
              Tautan channel: {group.antilinkChannel ? 'AKTIF' : 'MATI'}
            </Button>
          </div>
        </div>

        {/* ── prefix ──────────────────────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Field
            label="Prefix perintah untuk chat ini"
            htmlFor={`prefix-${shortId}`}
            hint={`Prefix bawaan: ${defaultPrefix ?? '.'}`}
          >
            <Input
              id={`prefix-${shortId}`}
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
              placeholder={defaultPrefix ?? '.'}
              maxLength={3}
              className="font-mono"
            />
          </Field>
          <Button
            variant="secondary"
            loading={pending === 'chat-prefix'}
            disabled={busy || !prefixDirty || prefix.trim().length === 0}
            onClick={() =>
              void apply(
                { op: 'chat-prefix', chatId: group.chatId, prefix: prefix.trim() },
                'Menyimpan prefix…'
              )
            }
          >
            {pending !== 'chat-prefix' ? <Save /> : null}
            Simpan
          </Button>
          <Button
            variant="ghost"
            disabled={busy || group.prefix === null}
            onClick={() => {
              setPrefix('')
              void apply(
                { op: 'chat-prefix', chatId: group.chatId, prefix: null },
                'Mengembalikan prefix…'
              )
            }}
          >
            <RotateCcw />
            Kembalikan
          </Button>
        </div>
      </CardContent>

      {/* ── welcome text dialog ───────────────────────────────────────────── */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Teks welcome untuk {shortId}</DialogTitle>
            <DialogDescription>
              Placeholder seperti <span className="font-mono">{'{name}'}</span> akan diisi oleh
              bot. Maksimal 1500 karakter, sesuai batas yang diterapkan script.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Field label="Pesan welcome" htmlFor="welcomeMessage" hint="{name} · {group} · {mention} · {total}">
              <Textarea
                id="welcomeMessage"
                value={welcomeMessage}
                onChange={(event) => setWelcomeMessage(event.target.value)}
                maxLength={1500}
                rows={5}
                placeholder="👋 Selamat datang {name} di {group}!"
              />
            </Field>

            <Field label="Pesan goodbye" htmlFor="leftMessage" hint="Ditampilkan saat ada anggota keluar dari grup.">
              <Textarea
                id="leftMessage"
                value={leftMessage}
                onChange={(event) => setLeftMessage(event.target.value)}
                maxLength={1500}
                rows={3}
                placeholder="👋 {name} keluar dari grup."
              />
            </Field>

            <p className="text-note text-muted-foreground">
              Welcome saat ini {group.welcome ? 'aktif' : 'nonaktif'} untuk grup ini.{' '}
              <button
                type="button"
                className="text-primary underline-offset-2 hover:underline"
                onClick={() => setShowWelcomeText((value) => !value)}
              >
                {showWelcomeText ? 'Sembunyikan' : 'Lihat'} teks yang tersimpan di bot
              </button>
            </p>
            {showWelcomeText ? (
              <pre className="max-h-40 overflow-auto rounded-[10px] border border-border bg-muted/30 p-3 font-mono text-tiny whitespace-pre-wrap">
                {group.welcomeMessage ?? '(teks bawaan)'}
                {'\n---\n'}
                {group.welcomeLeftMessage ?? '(teks bawaan)'}
              </pre>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              loading={pending === 'group-welcome' && editing}
              onClick={async () => {
                const ok = await apply(
                  {
                    op: 'group-welcome',
                    chatId: group.chatId,
                    enabled: group.welcome,
                    message: welcomeMessage.trim() === '' ? null : welcomeMessage.trim(),
                    leftMessage: leftMessage.trim() === '' ? null : leftMessage.trim(),
                  },
                  'Menyimpan welcome text…'
                )
                if (ok) setEditing(false)
              }}
            >
              Simpan teks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
