'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type * as React from 'react'

/**
 * Theme provider.
 *
 * `attribute="class"` matches the `.dark` selector in globals.css. Default is
 * dark; `enableSystem` supports the third "System" mode. `disableTransitionOnChange`
 * prevents every element animating at once during a theme switch, which looks
 * broken on large pages.
 *
 * `nonce` is threaded through from the root layout: this library writes an
 * inline script to apply the stored theme before first paint, and the site's
 * Content-Security-Policy only allows inline scripts that carry the request's
 * nonce. Without it the theme would be applied late (a flash of the wrong theme)
 * or not at all.
 */
export function ThemeProvider({
  children,
  nonce,
}: {
  children: React.ReactNode
  nonce?: string
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="nano-theme"
      nonce={nonce}
    >
      {children}
    </NextThemesProvider>
  )
}
