import { getPlatformStats } from '@/lib/services/platform-stats'
import { getPublicPlans } from '@/lib/services/plans'
import { getTrialAvailability } from '@/lib/services/trial'
import { Hero } from '@/components/marketing/hero'
import { PlatformStatsBand } from '@/components/marketing/platform-stats'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { PricingSection } from '@/components/marketing/pricing-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { getAuthContext } from '@/lib/auth/session'

/**
 * Landing page.
 * * Statistics and pricing are read from the database — this page shows the real
 * state of the deployment rather than hard-coded marketing figures. Rendered
 * per-request because both of those change.
 *
 * The trial card needs to know whether *this* visitor still has their one free
 * trial, so the availability check is read-only: a marketing page view must not
 * be what expires an account.
 */
export const dynamic = 'force-dynamic'
export default async function LandingPage() {
  const auth = await getAuthContext()

  const [stats, plans, trial] = await Promise.all([
    getPlatformStats(),
    getPublicPlans(),
    getTrialAvailability(auth?.user.id ?? null),
  ])

  return (
    <>
      <Hero />
      <PlatformStatsBand stats={stats} />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection plans={plans} isAuthenticated={Boolean(auth)} trial={trial} />
      <FaqSection />
    </>
  )
}
