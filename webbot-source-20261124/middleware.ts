import { NextResponse, type NextRequest } from 'next/server'

/**
 * Security headers, applied to every response.
 *
 * Deliberately does no authentication and touches no database: middleware runs
 * on the Edge runtime, where our session store (Prisma + `node:crypto`) is not
 * available. Authorization stays in the route handlers and server components,
 * which is where it can actually be enforced — a middleware redirect is a
 * convenience, never a security boundary.
 *
 * ── Content-Security-Policy ─────────────────────────────────────────────────
 * Nonce-based rather than `unsafe-inline`, so an injected `<script>` is refused
 * by the browser even if something upstream fails to escape output. Next reads
 * the nonce from the Content-Security-Policy header we set *on the request* and
 * tags its own scripts with it; the root layout reads `x-nonce` and forwards it
 * to `next-themes`, which writes an inline bootstrap script of its own.
 *
 * `'strict-dynamic'` is included so the trust chain is "the nonce-tagged loader
 * and whatever it loads", which is what Next's chunk loading needs. Browsers
 * without `strict-dynamic` fall back to `'self'`, which the chunks satisfy.
 *
 * `style-src` keeps `'unsafe-inline'`: styles are not a script execution vector,
 * and both Tailwind's runtime injection and `next/font` need inline styles.
 * That is a considered trade, not an oversight.
 *
 * ── HTTPS-only directives ───────────────────────────────────────────────────
 * HSTS and `upgrade-insecure-requests` are sent only when the request arrived
 * over TLS (detected from the proxy headers). Sending the upgrade directive on a
 * plain-HTTP origin would break the page, since this app also answers on its own
 * loopback port for local administration.
 */

function buildCsp(nonce: string, https: boolean): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.whatsapp.net https://pps.whatsapp.net",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob: data:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]

  if (https) directives.push('upgrade-insecure-requests')

  return directives.join('; ')
}

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, '')

  const forwardedProto = request.headers.get('x-forwarded-proto')
  const https =
    forwardedProto === 'https' ||
    Boolean(request.headers.get('cf-connecting-ip')) ||
    request.nextUrl.protocol === 'https:'

  const csp = buildCsp(nonce, https)

  // The nonce reaches the RSC tree through a request header; the CSP itself is
  // set on the request too, which is how Next discovers the nonce to attach.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('content-security-policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  )

  if (https) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
}

export const config = {
  // Written out as a literal on purpose: Next parses this export statically at
  // build time and rejects anything it cannot read, so a shared constant here
  // would fail the build (`Invalid segment configuration export detected`).
  //
  // Everything except the immutable build output and crawler files: those carry
  // no user data and re-running middleware for each chunk is wasted work.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
