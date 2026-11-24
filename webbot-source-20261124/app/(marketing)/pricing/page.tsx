import type { Metadata } from 'next'
import { getAuthContext } from '@/lib/auth/session'
import { getPublicPlans } from '@/lib/services/plans'
import { getTrialAvailability } from '@/lib/services/trial'
import { PricingSection } from '@/components/marketing/pricing-section'
import { FaqSection } from '@/components/marketing/faq-section'

export const metadata: Metadata = {
  title: 'Harga',
  description: 'Paket dan batas pemakaian NANO GATEWAY, dibaca langsung dari instalasi ini.',
}

export const dynamic = 'force-dynamic'

/**
 * Pricing.
 *
 * Plans come from the `plan` table, so the prices and limits shown here are the
 * ones the platform actually enforces — not a marketing copy that can drift.
 * The free-trial card additionally reflects whether the signed-in visitor has
 * already spent theirs.
 */
export default async function PricingPage() {
  const auth = await getAuthContext()
  const [plans, trial] = await Promise.all([
    getPublicPlans(),
    getTrialAvailability(auth?.user.id ?? null),
  ])

  return (
    <>
      <PricingSection plans={plans} isAuthenticated={Boolean(auth)} trial={trial} />
      <FaqSection />
    </>
  )
}
