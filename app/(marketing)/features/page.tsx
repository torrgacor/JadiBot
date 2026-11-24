import type { Metadata } from 'next'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { getPlatformStats } from '@/lib/services/platform-stats'
import { PlatformStatsBand } from '@/components/marketing/platform-stats'

export const metadata: Metadata = {
  title: 'Fitur',
  description:
    'Koneksi WhatsApp, login kode pairing, perintah bot dari folder plugin Nano, dan data bot yang langsung dibaca.',
}

export const dynamic = 'force-dynamic'

/** Features. The same sections as the landing page, given their own URL. */
export default async function FeaturesPage() {
  const stats = await getPlatformStats()

  return (
    <>
      <PlatformStatsBand stats={stats} />
      <FeaturesSection />
      <HowItWorks />
    </>
  )
}
