'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  QrCode,
  RefreshCw,
  Smartphone,
  Timer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BotAccessNotice } from '@/components/billing/bot-access-notice'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusDot } from '@/components/ui/status-dot'
import { toast } from '@/components/ui/toast'
import { apiRequest, errorMessage } from '@/lib/api/client'
import { useCopy } from '@/hooks/use-copy'
import { useRealtimeEvent } from '@/components/providers/realtime-provider'
import { STATUS_LABELS, type SessionStatus } from '@/types/enums'
import { formatDuration } from '@/lib/utils/format'
import type { BotAccessNoticeData } from '@/lib/services/bot-access'

/**
 * Connect panel.
 *
 * Renders the QR payload the gateway received from WhatsApp — encoded into an
 * image server-side. The countdown is driven by the expiry the engine reported,
 * and the panel re-renders itself from realtime events, so scanning the code
 * transitions it to Connected without a refresh.
 */

interface QrState {
  qr: string
  image: string
  expiresAt: string
}

export function ConnectPanel({
  sessionId,
  status,
  statusMessage,
  initialQr,
  botNumber = null,
  notice = null,
}: {
  sessionId: string
  status: SessionStatus
  statusMessage: string | null
  initialQr: QrState | null
  /**
   * The number saved on the session (set on the Bot Number step). When present
   * the pairing tab uses it directly instead of asking the user to retype it.
   */
  botNumber?: string | null
  /**
   * Set when the account has no active plan. QR and pairing both start a link
   * attempt, and the server refuses those — so the tabs are replaced by the
   * reason instead of letting each press fail.
   */
  notice?: BotAccessNoticeData | null
}) {
  const [currentStatus, setCurrentStatus] = useState<SessionStatus>(status)
  const [message, setMessage] = useState(statusMessage)
  const [qr, setQr] = useState<QrState | null>(initialQr)
  const [loadingQr, setLoadingQr] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const [phoneNumber, setPhoneNumber] = useState(botNumber ?? '')
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [requestingCode, setRequestingCode] = useState(false)

  /**
   * Pairing code is the primary flow, so it is the tab we open on.
   *
   * This state also gates the automatic QR fetch below: requesting a QR
   * restarts the bot process in QR mode, which would tear down an active
   * pairing handshake. Only ask for a QR when the user is actually looking at
   * that tab.
   */
  const [tab, setTab] = useState<'pairing' | 'qr'>('pairing')

  const { copy, copied } = useCopy()

  /**
   * Encode a raw QR payload into an image via the server.
   *
   * Declared before the realtime subscription that uses it: `const` is not
   * hoisted, so ordering here is load-bearing, not stylistic.
   */
  const renderQr = useCallback(
    async (payload: string, expiresAt: string) => {
      try {
        const result = await apiRequest<{ image: string }>(
          `/api/sessions/${sessionId}/qr-image`,
          { method: 'POST', body: { payload } }
        )
        setQr({ qr: payload, image: result.image, expiresAt })
      } catch {
        // Non-fatal: the next refresh will try again.
      }
    },
    [sessionId]
  )

  // ── live status from the gateway ────────────────────────────────────────
  useRealtimeEvent('engine', (event) => {
    if (event.type !== 'engine' || event.sessionKey !== sessionId) return

    const engineEvent = event.event
    if (engineEvent.type === 'session.status') {
      setCurrentStatus(engineEvent.status)
      setMessage(engineEvent.statusMessage ?? null)
      setSecondsLeft(0)

      if (engineEvent.status === 'CONNECTED') {
        setQr(null)
        setPairingCode(null)
        toast.success('WhatsApp berhasil terhubung.')
      }
    }

    if (engineEvent.type === 'session.qr') {
      setCurrentStatus('QR_REQUIRED')
      // Re-render the new payload so the displayed code never goes stale.
      void renderQr(engineEvent.qr, engineEvent.expiresAt)
    }

    if (engineEvent.type === 'session.pairing') {
      setCurrentStatus('PAIRING_REQUIRED')
      setPairingCode(engineEvent.pairingCode)
    }
  })

  // ── countdown ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!qr) {
      setSecondsLeft(0)
      return
    }

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((new Date(qr.expiresAt).getTime() - Date.now()) / 1000)
      )
      setSecondsLeft(remaining)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [qr])

  const requestNewQr = useCallback(
    async (silent = false) => {
      setLoadingQr(true)
      try {
        const result = await apiRequest<QrState>(`/api/sessions/${sessionId}/actions`, {
          method: 'POST',
          body: { action: 'refresh-qr' },
        })
        setQr(result)
        setCurrentStatus('QR_REQUIRED')
        if (!silent) toast.success('Kode QR baru sudah dibuat. Silakan scan sekarang.')
      } catch (error) {
        toast.error(errorMessage(error))
      } finally {
        setLoadingQr(false)
      }
    },
    [sessionId]
  )

  // Fetch a QR automatically when the session needs one, the user is on the QR
  // tab, and nothing is displayed yet.
  useEffect(() => {
    if (tab !== 'qr') return
    // A locked account must not fire a link attempt it cannot have.
    if (notice) return

    const needsQr =
      currentStatus === 'QR_REQUIRED' ||
      currentStatus === 'CREATED' ||
      currentStatus === 'CONNECTING'

    if (needsQr && !qr && !loadingQr) void requestNewQr(true)
    // Deliberately not depending on `qr` identity to avoid a refresh loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatus, sessionId, tab, notice])

  async function requestPairing() {
    setRequestingCode(true)
    try {
      const result = await apiRequest<{ pairingCode: string; expiresAt: string }>(
        `/api/sessions/${sessionId}/actions`,
        {
          method: 'POST',
          // Omit the field when it was pre-filled from the session so the server
          // uses the stored value rather than a second copy of it.
          body: { action: 'pairing-code', ...(phoneNumber ? { phoneNumber } : {}) },
        }
      )
      setPairingCode(result.pairingCode)
      setCurrentStatus('PAIRING_REQUIRED')
      toast.success('Kode penautan berhasil dibuat.')
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setRequestingCode(false)
    }
  }

  // ── locked: nothing to scan until there is a plan ───────────────────────
  if (notice && currentStatus !== 'CONNECTED') {
    return (
      <Card>
        <CardContent className="pt-5">
          <BotAccessNotice data={notice} />
        </CardContent>
      </Card>
    )
  }

  // ── connected: nothing to scan ──────────────────────────────────────────
  if (currentStatus === 'CONNECTED') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span
            className="grid size-12 place-items-center rounded-[14px] border border-success/30 bg-success/10 text-success"
            aria-hidden
          >
            <CheckCircle2 className="size-6" />
          </span>
          <div>
            <h2 className="text-lead font-semibold">Sesi ini sudah terhubung</h2>
            <p className="mt-1 text-mid text-muted-foreground">
              Pesan dikirim langsung dari nomor yang tersambung.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Hubungkan bot</CardTitle>
            <CardDescription>
              Tautkan dengan nomor telepon memakai kode penautan, atau scan kode QR.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={currentStatus} />
            <span className="text-s font-medium">
              {STATUS_LABELS[currentStatus]}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {message ? (
          <p className="mb-4 rounded-[10px] border border-border bg-muted/30 px-3.5 py-2.5 text-s text-muted-foreground">
            {message}
          </p>
        ) : null}

        <Tabs value={tab} onValueChange={(value) => setTab(value as 'pairing' | 'qr')}>
          <TabsList>
            <TabsTrigger value="pairing">
              <Smartphone />
              Kode Pairing
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode />
              Kode QR
            </TabsTrigger>
          </TabsList>

          {/* ── QR ───────────────────────────────────────────────────── */}
          <TabsContent value="qr">
            <div className="flex flex-col items-center gap-4">
              <div className="relative rounded-[14px] border border-border bg-white p-3">
                {qr?.image ? (
                  <Image
                    src={qr.image}
                    alt="Kode QR penautan WhatsApp"
                    width={256}
                    height={256}
                    unoptimized
                    // The code expires in ~60s; caching it would show a dead QR.
                    className="size-[256px]"
                  />
                ) : (
                  <div className="grid size-[256px] place-items-center">
                    {loadingQr ? (
                      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
                    ) : (
                      <p className="px-6 text-center text-s text-muted-foreground">
                        Belum ada kode QR. Buat satu untuk memulai.
                      </p>
                    )}
                  </div>
                )}

                {/* Expiry overlay — the code must not be scanned after it dies. */}
                {qr && secondsLeft === 0 ? (
                  <div className="absolute inset-0 grid place-items-center rounded-[14px] bg-white/92 backdrop-blur-[2px]">
                    <div className="text-center">
                      <Timer className="mx-auto size-5 text-muted-foreground" aria-hidden />
                      <p className="mt-1.5 text-s font-medium text-slate-700">
                        Kode QR kedaluwarsa
                      </p>
                      <Button
                        size="sm"
                        className="mt-2.5"
                        onClick={() => requestNewQr()}
                        loading={loadingQr}
                      >
                        Muat ulang
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              {qr && secondsLeft > 0 ? (
                <p className="text-note text-muted-foreground">
                  Kedaluwarsa dalam{' '}
                  <span className="font-medium tabular-nums text-foreground">
                    {formatDuration(secondsLeft * 1000)}
                  </span>
                </p>
              ) : null}

              <ol className="w-full max-w-sm space-y-1.5 rounded-[10px] border border-border bg-muted/20 p-3.5 text-s text-muted-foreground">
                <li>1. Buka WhatsApp di ponsel Anda</li>
                <li>2. Ketuk Setelan → Perangkat Tertaut</li>
                <li>3. Ketuk Tautkan Perangkat, lalu scan kode ini</li>
              </ol>

              <Button
                variant="secondary"
                onClick={() => requestNewQr()}
                loading={loadingQr}
                className="w-full max-w-sm"
              >
                <RefreshCw className="size-4" />
                Muat ulang kode QR
              </Button>
            </div>
          </TabsContent>

          {/* ── pairing code ─────────────────────────────────────────── */}
          <TabsContent value="pairing">
            <div className="mx-auto max-w-sm space-y-4">
              {pairingCode ? (
                <>
                  <div className="rounded-[12px] border border-primary/25 bg-primary-soft p-4 text-center">
                    <p className="text-tiny uppercase tracking-wide text-primary">
                      Kode penautan Anda
                    </p>
                    <p className="mt-1.5 font-mono text-2xl font-semibold tracking-[0.18em] text-primary">
                      {pairingCode}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => copy(pairingCode)}
                    >
                      <Copy className="size-3.5" />
                      {copied ? 'Tersalin' : 'Salin kode'}
                    </Button>
                  </div>

                  <ol className="space-y-1.5 rounded-[10px] border border-border bg-muted/20 p-3.5 text-s text-muted-foreground">
                    <li>1. Buka WhatsApp di ponsel Anda</li>
                    <li>2. Setelan → Perangkat Tertaut → Tautkan Perangkat</li>
                    <li>3. Pilih &ldquo;Tautkan dengan nomor telepon&rdquo;</li>
                    <li>4. Masukkan kode di atas</li>
                  </ol>

                  <p className="text-tiny leading-relaxed text-muted-foreground">
                    Kode berlaku sekitar satu menit. Jika kedaluwarsa, minta kode baru.
                    Biarkan halaman ini terbuka — memulai alur QR akan membatalkan kode
                    yang sedang menunggu.
                  </p>

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setPairingCode(null)
                      setCurrentStatus('CONNECTING')
                    }}
                  >
                    Mulai ulang
                  </Button>
                </>
              ) : (
                <>
                  {botNumber ? (
                    <div className="rounded-[12px] border border-border bg-glass/40 px-3.5 py-3">
                      <p className="text-label font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Nomor bot
                      </p>
                      <p className="mt-1 font-mono text-lead font-semibold">
                        +{botNumber}
                      </p>
                      <p className="mt-1 text-tiny leading-relaxed text-muted-foreground">
                        Diambil dari nomor yang Anda simpan untuk sesi ini.{' '}
                        <Link
                          href={`/dashboard/sessions/${sessionId}/number`}
                          className="font-medium text-primary underline underline-offset-2"
                        >
                          Ubah nomor
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <Field
                      label="Nomor WhatsApp"
                      htmlFor="pairing-number"
                      hint="Sertakan kode negara, hanya angka. Contoh: 6281234567890"
                      required
                    >
                      <Input
                        id="pairing-number"
                        value={phoneNumber}
                        onChange={(event) =>
                          // Strip formatting as the user types; the API validates too.
                          setPhoneNumber(event.target.value.replace(/[^\d]/g, ''))
                        }
                        inputMode="numeric"
                        placeholder="6281234567890"
                        icon={<Smartphone />}
                      />
                    </Field>
                  )}

                  <Button
                    className="w-full"
                    onClick={requestPairing}
                    loading={requestingCode}
                    disabled={phoneNumber.length < 8}
                  >
                    <KeyRound className="size-4" />
                    Minta kode penautan
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
