import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // The edge compiler for `instrumentation.ts` rejects `node:` schemes.
    // `require('crypto')` etc. are compiled away by the
    // `NEXT_RUNTIME !== 'nodejs'` guard, but the dynamic import inside the
    // function still reaches webpack — we hand it an empty stub so the
    // bundle emits without throwing.
    //
    // `mongodb` is in `serverExternalPackages` but Next still compiles it
    // for the edge bundle, so its Node built-in requires hit webpack.
    // Stubbings them here is safe: the edge path never reaches a Mongo
    // query because `instrumentation.ts` early-returns on non-nodejs
    // runtimes, and the Node runtime externalises `mongodb` at request time.
    const nodeBuiltins = new Set([
      'crypto', 'path', 'tls', 'net', 'stream',
      'fs', 'fs/promises', 'http', 'https', 'http2',
      'assert', 'timers', 'timers/promises', 'url', 'util',
      'zlib', 'dns', 'os', 'readline', 'worker_threads',
      'events', 'child_process', 'module', 'async_hooks',
      'perf_hooks', 'trace_events', 'v8', 'inspector',
      'querystring', 'string_decoder',
    ])
    const resolve: Record<string, unknown> = {
      ...config.resolve,
      fallback: { ...((config.resolve?.fallback as Record<string, unknown>) ?? {}) },
      alias: {
        ...((config.resolve?.alias as Record<string, unknown>) ?? {}),
        // Stub the optional native deps the mongo driver tries to load.
        socks: false,
        'mongodb-client-encryption': false,
        '@mongodb-js/zstd': false,
        '@aws-sdk/credential-providers': false,
        'gcp-metadata': false,
        snappy: false,
        kerberos: false,
      },
    }
    for (const name of nodeBuiltins) {
      ;(resolve.fallback as Record<string, unknown>)[name] = false
    }
    config.resolve = resolve
    return config
  },
  // Resolve "multiple lockfiles" warning — app source lives in /root/webbot,
  // not in /root where a sibling package-lock.json also gets scanned.
  outputFileTracingRoot: '/root/webbot',

  // Keep the WhatsApp engine, DB driver and native modules out of the
  // webpack/turbopack server bundle. The gateway process owns them; the web
  // app only talks HTTP to it.
  serverExternalPackages: ['mongodb', '@whiskeysockets/baileys', 'pino'],

  experimental: {
    // Server Actions body size limit (media uploads for messages).
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.whatsapp.net' },
      { protocol: 'https', hostname: 'pps.whatsapp.net' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy, …) are
  // set by `middleware.ts`, which overwrites the response headers on every
  // request and is the single source of truth. There is deliberately no
  // `headers()` here: a second copy in the config would be silently ignored
  // (middleware wins) and would mislead anyone editing it into thinking they
  // changed production behaviour. Keep header changes in middleware.ts.
}

export default nextConfig
