import type { Metadata } from 'next'
import { FaqSection } from '@/components/marketing/faq-section'
import { getPlatformStats } from '@/lib/services/platform-stats'
import { PlatformStatsBand } from '@/components/marketing/platform-stats'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Pertanyaan umum tentang menautkan nomor, paket, bot, dan penanganan data.',
}

export const dynamic = 'force-dynamic'

export default async function FaqPage() {
  const stats = await getPlatformStats()

  return (
    <>
      <PlatformStatsBand stats={stats} />
      <FaqSection />
    </>
  )
}
