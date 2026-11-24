import type { ReactNode } from 'react'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { getAuthContext } from '@/lib/auth/session'

/**
 * Marketing layout.
 *
 * Resolves the session server-side so the navbar renders the correct CTAs on
 * first paint — no authenticated flash of "Login" for signed-in users.
 */
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext()

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav isAuthenticated={Boolean(auth)} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
