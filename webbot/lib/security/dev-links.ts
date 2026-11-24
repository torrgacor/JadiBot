/**
 * Development-only conveniences for authentication flows.
 *
 * Without an SMTP transport there is no way to deliver a password-reset mail, so
 * the original implementation handed the reset link straight back in the API
 * response. That is fine on a laptop and catastrophic on a public panel: anyone
 * who knows an email address can POST to the reset endpoint and receive a token
 * that resets that account's password — including an administrator's.
 *
 * So the behaviour is now behind one explicit switch, and the switch is OFF by
 * default. Secure by default, available when it is genuinely wanted:
 *
 *   • `DEV_AUTH_LINKS=1` restores the old behaviour: the reset link is returned
 *     in the response and mail bodies are printed to the server log.
 *   • Anything else (unset, `0`, `false`) keeps links and tokens out of API
 *     responses and out of logs.
 *
 * This is read on every call rather than cached so an operator can flip it in
 * `.env` and restart, with no hidden state to remember.
 */

function truthy(value: string | undefined): boolean {
  const raw = (value ?? '').trim().toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on'
}

/** True when a mail transport is configured, so real mail can be delivered. */
export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)
}

/**
 * True when development links are explicitly enabled.
 *
 * Callers must also check `smtpConfigured()`: with a working mail server the
 * link is delivered by email and never has a reason to travel through JSON.
 */
export function devAuthLinksEnabled(): boolean {
  return truthy(process.env.DEV_AUTH_LINKS)
}

/**
 * True when a secret-bearing auth link may legitimately be surfaced.
 *
 * Hard rule: in production this is ALWAYS false, regardless of `DEV_AUTH_LINKS`.
 * The flag only has meaning outside production. This is defence in depth — even
 * if `.env` is mis-deployed with `DEV_AUTH_LINKS=1` on a public panel, the
 * reset/verification token can never leak through the API response.
 */
export function authLinksExposed(): boolean {
  if (process.env.NODE_ENV === 'production') return false
  return devAuthLinksEnabled() && !smtpConfigured()
}
