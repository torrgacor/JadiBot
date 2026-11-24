/**
 * Next.js instrumentation hook.
 *
 * Runs once per server process, before the app handles traffic. It is used here
 * for two things: bringing previously-connected bots back up after a restart,
 * and starting the payment reconciliation sweep (so a paid invoice activates a
 * plan even when the Pakasir webhook never reaches this panel).
 *
 * Five things run from here: the session restore, the payment reconciliation
 * sweep, the trial watchdog, the bot-access watchdog, and the renewal reminder
 * sweep.
 *
 * Two guards matter:
 *   • `NEXT_RUNTIME === 'nodejs'` — the restore talks to the database and the
 *     engine over TCP, so it has no business running on the edge runtime.
 *   • `NEXT_PHASE !== 'phase-production-build'` — instrumentation is also
 *     evaluated while producing the build, and starting bot processes during a
 *     build would be both surprising and useless.
 *
 * The pass is detached behind a short delay and never throws: a failure to
 * restore must not stop the panel from serving. `NANO_RESTORE_SESSIONS=0`
 * disables it entirely.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  if (process.env.NANO_RESTORE_SESSIONS === '0') return

  // Refuse to serve production traffic with a known placeholder secret. These
  // are the exact defaults shipped in .env.example; every one of them passes a
  // "32+ chars" length check, so without this guard a new deployer who copies
  // the example and forgets to rotate it would run a public panel with public
  // credentials. Dev keeps working (the warning only hard-fails in prod).
  assertNoPlaceholderSecrets()

  // Let the HTTP server finish coming up (and give a co-located gateway a head
  // start) before touching the engine.
  const timer = setTimeout(() => {
    void (async () => {
      try {
        /*
          Close out trials that ran out while the panel was down *before*
          restoring anything, so an expired trial cannot have its bot brought
          back up during this very boot. Best-effort: a failure here is not a
          reason to skip the restore.
        */
        try {
          const { sweepExpiredTrials } = await import('@/lib/services/trial')
          const trialSweep = await sweepExpiredTrials()
          if (trialSweep.expired > 0 || trialSweep.stopped > 0) {
            console.info(
              `[trial] saat mulai: berakhir=${trialSweep.expired} sesi-dihentikan=${trialSweep.stopped}`
            )
          }
        } catch (error) {
          console.warn('[trial] gagal menutup trial yang jatuh tempo saat mulai:', error)
        }

        const { restoreSessions } = await import('@/lib/services/session-restore')
        const summary = await restoreSessions()

        if (summary.considered > 0) {
          console.info(
            `[restore] sesi diperiksa=${summary.considered} dipulihkan=${summary.restored} ` +
              `perlu-taut-ulang=${summary.needsAuth} gagal=${summary.failed}`
          )
        }
      } catch (error) {
        // The engine may be down. That is recoverable — the user can start the
        // bot by hand from the panel — so it is logged and swallowed.
        console.warn('[restore] gagal memulihkan sesi:', error)
      }
    })()
  }, 4_000)

  // Do not hold the event loop open on account of this timer.
  timer.unref?.()

  // Ensure MongoDB indexes exist before any other code touches the database.
  // Idempotent and fast; a failure to create indexes must not stop the panel.
  void (async () => {
    try {
      const { initDb, ensureIndexes } = await import('@/lib/db')
      await initDb()
      await ensureIndexes()
      console.info('[db] MongoDB terhubung, index tersinkron')
    } catch (error) {
      console.warn('[db] gagal menyiapkan MongoDB index:', error)
    }
  })()

  // Trial watchdog: expires the 1-day free trial, stops the bot that goes with
  // it, and re-checks that nothing from an expired trial is running.
  void (async () => {
    try {
      const { startTrialSweeper } = await import('@/lib/services/trial')
      startTrialSweeper()
    } catch (error) {
      console.warn('[trial] gagal memulai pengawas trial:', error)
    }
  })()

  // Access watchdog: a bot whose account has no active plan — no subscription,
  // the legacy Rp0 plan, an ended paid period — is stopped. The trial watchdog
  // above only knows about trials, so this is what makes "no plan" apply to a
  // socket that is already running.
  void (async () => {
    try {
      const { startBotAccessWatchdog } = await import('@/lib/services/bot-access')
      startBotAccessWatchdog()
    } catch (error) {
      console.warn('[akses] gagal memulai pengawas paket aktif:', error)
    }
  })()

  // Renewal watchdog: warns a paying customer before their period ends, so the
  // bot is not stopped without notice. It only notifies — the access watchdog
  // below is still the only thing that stops anything.
  void (async () => {
    try {
      const { startRenewalWatchdog } = await import('@/lib/services/renewal')
      startRenewalWatchdog()
    } catch (error) {
      console.warn('[perpanjangan] gagal memulai pengawas perpanjangan:', error)
    }
  })()

  // Payment reconciliation runs on its own interval from here on. Same rule as
  // the restore above: it is detached, it never throws, and it is switchable
  // off — a broken sweeper must not be able to stop the panel from serving.
  void (async () => {
    try {
      const { startPaymentReconciler } = await import('@/lib/services/payment-reconcile')
      startPaymentReconciler()
    } catch (error) {
      console.warn('[reconcile] gagal memulai penyelaras pembayaran:', error)
    }
  })()
}

/**
 * The placeholder secrets shipped in `.env.example`. If any of these exact
 * values reaches production, the deployment is not secure.
 */
const PLACEHOLDER_SECRETS = new Set([
  'change-me-dev-only-32-chars-minimum-secret-key',
  'change-me-dev-only-32-chars-minimum-encrypt-key',
  'change-me-gateway-internal-token',
])

const SECRET_ENV_VARS = [
  'AUTH_SECRET',
  'ENCRYPTION_KEY',
  'GATEWAY_TOKEN',
  'PAKASIR_API_KEY',
] as const

function assertNoPlaceholderSecrets(): void {
  const isProd = process.env.NODE_ENV === 'production'
  const offenders: string[] = []

  for (const key of SECRET_ENV_VARS) {
    const value = process.env[key]
    if (value && PLACEHOLDER_SECRETS.has(value)) {
      offenders.push(key)
    }
  }

  if (offenders.length === 0) return

  const message =
    `[secrets] ${offenders.join(', ')} masih memakai nilai placeholder .env.example. ` +
    `Putar (rotate) setiap secret sebelum menjalankan panel publik.`

  if (isProd) {
    // A public panel must not boot with public credentials.
    console.error(message)
    console.error('[secrets] Menolak memulai dalam production. Set nilai asli lalu restart.')
    process.exit(1)
  }

  // Dev: warn only, so a fresh laptop setup still works.
  console.warn(message)
}
