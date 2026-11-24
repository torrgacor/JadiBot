import { gatewayConfig, logger, sessionDir } from './config'
import { forwardEvent } from './events'
import { LocalBaileysDriver } from './drivers/local-baileys'
import { NanoProcessDriver } from './drivers/nano-process'
import type { NanoLogBatch } from '../lib/engine/nano'
import { EngineCapabilityError } from '../lib/engine/types'
import type {
  CreateSessionInput,
  EngineDriver,
  EngineEvent,
  EngineGroup,
  EngineSessionState,
  PairingCodeInput,
  SendMessageInput,
  SendMessageResult,
} from '../lib/engine/types'

/**
 * Session manager.
 *
 * Owns both drivers and routes each operation to the driver that session was
 * created with. The driver is stored per session (mirroring
 * `WhatsAppSession.driver` in the database) because a user can legitimately run
 * one session on `local-baileys` for messaging and another on `nano-process`
 * for the bot's plugin features.
 */
export class SessionManager {
  /** key → driver name, so we can route without hitting the database. */
  private routes = new Map<string, EngineDriver>()

  private readonly local: LocalBaileysDriver
  private readonly nano: NanoProcessDriver

  private readonly emit = (event: EngineEvent) => {
    forwardEvent(event)
  }

  constructor() {
    this.local = new LocalBaileysDriver(this.emit)
    this.nano = new NanoProcessDriver(this.emit)
  }

  private driverFor(key: string, explicit?: EngineDriver) {
    const driver = explicit ?? this.routes.get(key) ?? gatewayConfig.driver
    return driver === 'nano-process' ? this.nano : this.local
  }

  async createSession(input: CreateSessionInput): Promise<EngineSessionState> {
    // Always provide an absolute auth-state dir so drivers cannot disagree.
    const normalised: CreateSessionInput = {
      ...input,
      authStateDir: input.authStateDir || sessionDir(input.key),
    }

    this.routes.set(normalised.key, normalised.driver)
    const state = await this.driverFor(normalised.key, normalised.driver).createSession(
      normalised
    )

    logger.info({ key: normalised.key, driver: normalised.driver }, 'session created')
    return state
  }

  connect(key: string) {
    return this.driverFor(key).connect(key)
  }

  disconnect(key: string) {
    return this.driverFor(key).disconnect(key)
  }

  logout(key: string) {
    return this.driverFor(key).logout(key)
  }

  restart(key: string) {
    return this.driverFor(key).restart(key)
  }

  async removeSession(key: string): Promise<void> {
    await this.driverFor(key).removeSession(key)
    this.routes.delete(key)
    logger.info({ key }, 'session removed')
  }

  refreshQr(key: string) {
    return this.driverFor(key).refreshQr(key)
  }

  requestPairingCode(input: PairingCodeInput) {
    return this.driverFor(input.sessionKey).requestPairingCode(input)
  }

  sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    return this.driverFor(input.sessionKey).sendMessage(input)
  }

  getQueueDepth(key: string) {
    return this.driverFor(key).getQueueDepth(key)
  }

  /**
   * Group metadata. Only the local-baileys driver implements this; the Nano
   * driver throws `EngineCapabilityError`, which the HTTP layer maps to a 501.
   */
  listGroups(key: string): Promise<EngineGroup[]> {
    const driver = this.driverFor(key)
    if (!(driver instanceof LocalBaileysDriver)) {
      return this.nano.listGroups(key)
    }
    return driver.listGroups(key)
  }

  /**
   * Log tail for one session. Only the Nano driver runs a child process, so it
   * is the only driver with output to show; anything else reports the capability
   * as unavailable.
   */
  async getLogs(key: string, sinceSeq = 0): Promise<NanoLogBatch> {
    const driver = this.driverFor(key)
    if (!(driver instanceof NanoProcessDriver)) {
      throw new EngineCapabilityError(
        'engine log stream',
        'Sesi ini tidak menjalankan proses bot, jadi tidak ada keluaran yang bisa ditampilkan.'
      )
    }
    return driver.getLogs(key, sinceSeq)
  }

  getState(key: string): EngineSessionState | null {
    // Probe both drivers so a state lookup works without knowing the route.
    // Both drivers keep state in memory, so these reads are synchronous.
    return this.local.getState(key) ?? this.nano.getStateSync(key)
  }

  listStates(): EngineSessionState[] {
    return [...this.local.listStates(), ...this.nano.listStatesSync()]
  }

  health() {
    return {
      driver: gatewayConfig.driver,
      activeSessions: this.local.size() + this.nano.size(),
      byDriver: {
        'local-baileys': this.local.size(),
        'nano-process': this.nano.size(),
      },
      nanoEngineDir: gatewayConfig.nanoEngineDir,
    }
  }

  /** Stop every driver's live connections so the process can exit. */
  shutdown(): void {
    this.local.shutdown()
    this.nano.shutdown()
  }
}
