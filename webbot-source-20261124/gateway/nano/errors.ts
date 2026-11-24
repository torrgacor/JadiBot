/**
 * Errors raised by the panel's Nano write paths.
 *
 * They carry a message written for the person using the dashboard (Indonesian,
 * actionable), so the gateway can return 400 with the text intact instead of a
 * generic engine failure. Everything else stays a 5xx.
 */
export class NanoSettingsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NanoSettingsError'
  }
}
