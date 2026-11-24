import { badRequest } from '@/lib/errors'

/**
 * Outbound URL guard (SSRF).
 *
 * The bot fetches media from a URL we hand it, and that URL can come from a
 * user (an automation action, a send form). The bot runs on our own host, so
 * "fetch this URL" is a request made from inside our network — which is exactly
 * what server-side request forgery is for: pointing the fetcher at `127.0.0.1`,
 * at an internal service, or at a cloud metadata endpoint and reading the answer
 * back out of the resulting message.
 *
 * Media that a WhatsApp send needs is, by definition, reachable from the public
 * internet, so a strict rule costs nothing real:
 *
 *   • scheme must be http or https
 *   • host must not be a loopback / private / link-local / unique-local literal
 *   • host must not be a well-known metadata or internal-only name
 *
 * Honest limits, stated rather than implied: this checks the URL, not the DNS
 * answer. A hostname that resolves to a private address (`evil.example.com` →
 * 127.0.0.1) is not caught here, and neither is a redirect that lands on an
 * internal address. Catching those needs resolution-time validation or an egress
 * proxy, which is a deliberate non-goal for this deployment; the guard removes
 * the whole "just type the internal IP" class of attack, which is the one that
 * matters without a second network hop.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata',
  'metadata.google.internal',
  'instance-data',
])

/** IPv4 in any of the private, loopback, link-local or reserved ranges. */
function isBlockedIPv4(host: string): boolean {
  const parts = host.split('.')
  if (parts.length !== 4) return false
  const octets = parts.map((part) => Number(part))
  if (octets.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) return false

  const [a, b] = octets
  if (a === 0) return true // "this network"
  if (a === 10) return true // private
  if (a === 127) return true // loopback
  if (a === 169 && b === 254) return true // link-local + cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true // private
  if (a === 192 && b === 168) return true // private
  if (a === 100 && b >= 64 && b <= 127) return true // carrier-grade NAT
  if (a === 192 && b === 0) return true // IETF protocol assignments
  if (a >= 224) return true // multicast + reserved + broadcast
  return false
}

/** IPv6 loopback, unique-local, link-local, and IPv4-mapped forms. */
function isBlockedIPv6(host: string): boolean {
  const value = host.replace(/^\[|\]$/g, '').toLowerCase()

  if (value === '::' || value === '::1') return true
  if (value.startsWith('fe80:')) return true // link-local
  if (value.startsWith('fc') || value.startsWith('fd')) return true // unique local
  if (value.startsWith('ff')) return true // multicast

  // ::ffff:127.0.0.1 and friends — unwrap and re-check as IPv4.
  const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isBlockedIPv4(mapped[1])

  return false
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim()

  if (BLOCKED_HOSTNAMES.has(host)) return true
  if (host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    return true
  }
  // A bare numeric host is either IPv4 or an obscure integer-encoded address;
  // both are refused, since a real media host has a name.
  if (isBlockedIPv4(host)) return true
  if (host.includes(':')) return isBlockedIPv6(host)
  if (/^\d+$/.test(host)) return true

  return false
}

/**
 * Validate a user-supplied URL that something outside this process will fetch.
 * Throws a `BAD_REQUEST` with a message safe to show the user.
 */
export function assertPublicHttpUrl(value: string, label = 'URL media'): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw badRequest(`${label} tidak valid. Sertakan http:// atau https://.`)
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw badRequest(`${label} hanya boleh memakai http atau https.`)
  }

  if (isBlockedHost(url.hostname)) {
    throw badRequest(
      `${label} menunjuk ke alamat internal atau lokal. Gunakan tautan publik yang bisa diakses dari internet.`
    )
  }

  return url.toString()
}

/** Is this URL safe to hand to something that will fetch it? */
export function isPublicHttpUrl(value: string): boolean {
  try {
    assertPublicHttpUrl(value)
    return true
  } catch {
    return false
  }
}
