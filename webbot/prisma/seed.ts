import { randomBytes } from 'node:crypto'
import { db, initDb } from '../lib/db'
import { hashPassword } from '../lib/security/password'

/**
 * Database seed.
 *
 * Intentionally narrow: it creates **product configuration** (the plan
 * catalogue) and one administrator account. It does NOT invent messages,
 * sessions, contacts or statistics — a fresh install should show a genuinely
 * empty dashboard, not a wall of fabricated data.
 *
 *   npm run db:seed
 *
 * Safe to re-run: everything is an upsert keyed on a natural unique field.
 */

/** Quotas use -1 for unlimited, matching lib/services/entitlements.ts. */
const PLANS = [
  {
    slug: 'free',
    name: 'Free',
    description: 'Untuk mencoba panel ini dengan satu nomor.',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'IDR',
    maxWhatsappSessions: 1,
    maxMessagesPerDay: 100,
    maxApiRequestsDay: 1000,
    maxContacts: 100,
    maxAutomationRules: 2,
    maxTeamMembers: 1,
    isTrial: false,
    // Kept for accounts created before the catalogue changed, and still handed
    // to every new registration — just not advertised on the storefront.
    isPublic: false,
    sortOrder: 0,
    features: [
      '1 sesi WhatsApp',
      '100 pesan / hari',
      '1.000 permintaan API / hari',
      'Login kode pairing & QR',
      'Pengelolaan bot Nano lengkap',
      'Log dan data bot',
      'Dukungan komunitas',
    ],
  },
  {
    slug: 'trial',
    name: 'Free Trial',
    description: 'Coba semua fitur dasar gratis selama 3 hari.',
    // Time-boxed, not sold: the storefront renders it as its own card and the
    // checkout refuses a plan whose price is zero.
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'IDR',
    // Quotas match Starter — the point of the trial is to show the real thing,
    // and only the *duration* is limited to 3 days.
    maxWhatsappSessions: 1,
    maxMessagesPerDay: 500,
    maxApiRequestsDay: 5_000,
    maxContacts: 500,
    maxAutomationRules: 5,
    maxTeamMembers: 1,
    isTrial: true,
    isPublic: true,
    sortOrder: 0,
    features: [
      '1 Nomor Bot',
      'Connect WhatsApp',
      'QR Code',
      'Pairing Code',
      'Dashboard Bot',
      'Bot Settings',
      'Command Bot',
      'Basic Features',
      'Group Features',
      'Bot Logs',
    ],
  },
  {
    slug: 'starter',
    name: 'Starter',
    description: 'Untuk mulai memakai bot setiap hari.',
    // Prices are minor units — formatCurrency() divides by 100, so 500000 is
    // Rp5.000 in the panel and in the storefront.
    priceMonthly: 500_000,
    priceYearly: 5_000_000,
    currency: 'IDR',
    maxWhatsappSessions: 1,
    maxMessagesPerDay: 500,
    maxApiRequestsDay: 5_000,
    maxContacts: 500,
    maxAutomationRules: 5,
    maxTeamMembers: 1,
    isTrial: false,
    isPublic: true,
    sortOrder: 1,
    features: [
      '1 Nomor Bot',
      'Fitur Bot Basic',
      'Dashboard',
      'QR / Pairing Code',
      'Bot Management',
    ],
  },
  {
    slug: 'pro',
    name: 'Pro',
    description: 'Untuk bot yang sudah aktif dipakai.',
    priceMonthly: 1_000_000,
    priceYearly: 10_000_000,
    currency: 'IDR',
    maxWhatsappSessions: 1,
    maxMessagesPerDay: 1_000,
    maxApiRequestsDay: 20_000,
    maxContacts: 1_000,
    maxAutomationRules: 10,
    maxTeamMembers: 1,
    isTrial: false,
    isPublic: true,
    sortOrder: 2,
    features: [
      '1 Nomor Bot',
      'Semua fitur Basic',
      'Fitur Bot lebih lengkap',
      'Group Features',
      'Auto Reply',
      'Bot Settings',
    ],
  },
  {
    slug: 'popular',
    name: 'Popular',
    description: 'Fitur bot lebih lengkap untuk grup dan balasan otomatis.',
    priceMonthly: 1_500_000,
    priceYearly: 15_000_000,
    currency: 'IDR',
    maxWhatsappSessions: 1,
    maxMessagesPerDay: 2_000,
    maxApiRequestsDay: 50_000,
    maxContacts: 2_500,
    maxAutomationRules: 25,
    maxTeamMembers: 2,
    isTrial: false,
    isPublic: true,
    sortOrder: 3,
    features: [
      '1 Nomor Bot',
      'Semua fitur sebelumnya',
      'Downloader',
      'Sticker / Brat',
      'Advanced Features',
      'Priority Support',
    ],
  },
  {
    slug: 'premium',
    name: 'Premium',
    description: 'Untuk otomatisasi dan volume yang lebih besar.',
    priceMonthly: 2_000_000,
    priceYearly: 20_000_000,
    currency: 'IDR',
    maxWhatsappSessions: 1,
    maxMessagesPerDay: 5_000,
    maxApiRequestsDay: 200_000,
    maxContacts: 10_000,
    maxAutomationRules: -1,
    maxTeamMembers: 5,
    isTrial: false,
    isPublic: true,
    sortOrder: 4,
    features: [
      '1 Nomor Bot',
      'Semua fitur Pro',
      'Advanced Bot Features',
      'Automation',
      'Priority Support',
    ],
  },
  {
    slug: 'ultimate',
    name: 'Ultimate',
    description: 'Semua fitur, tanpa batas pesan dan permintaan API.',
    priceMonthly: 2_500_000,
    priceYearly: 25_000_000,
    currency: 'IDR',
    maxWhatsappSessions: 1,
    maxMessagesPerDay: -1,
    maxApiRequestsDay: -1,
    maxContacts: -1,
    maxAutomationRules: -1,
    maxTeamMembers: 25,
    isTrial: false,
    isPublic: true,
    sortOrder: 5,
    features: [
      '1 Nomor Bot',
      'Semua fitur',
      'Full Bot Features',
      'Advanced Settings',
      'Priority Support',
      'Premium Features',
    ],
  },
]

/** Slugs the storefront sells. Anything outside this list is retired below. */
const CATALOGUE_SLUGS = PLANS.map((plan) => plan.slug)

/**
 * Readable, high-entropy password for a seeded administrator.
 *
 * Grouped so it can be typed from a screen and drawn from an unambiguous
 * alphabet so `0/O` and `1/l` cannot be misread. Only used when production is
 * seeded without an explicit `ADMIN_PASSWORD`.
 */
function generateAdminPassword(groups = 5, size = 5): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const out: string[] = []
  for (let group = 0; group < groups; group += 1) {
    let chunk = ''
    for (const byte of randomBytes(size)) {
      chunk += alphabet[byte % alphabet.length]
    }
    out.push(chunk)
  }
  return out.join('-')
}

/**
 * Retired plans that may still have live subscribers, and where those go.
 *
 * A subscription must never point at a plan that is no longer offered: the
 * customer would keep an unlisted price, and `getEntitlements()` would read
 * limits nobody can see. Rows are moved rather than deleted, so no history is
 * lost and no foreign key is ever broken.
 */
const RETIRED_PLAN_FALLBACK: Record<string, string> = {
  business: 'ultimate',
}

async function main() {
  await initDb()
  console.log('▸ Seeding plan catalogue…')

  for (const plan of PLANS) {
    const { features, ...rest } = plan
    await db.plan.upsert({
      where: { slug: plan.slug },
      update: { ...rest, features: JSON.stringify(features) },
      create: { ...rest, features: JSON.stringify(features) },
    })
  }

  // ── move subscribers off retired plans, then hide those plans ──────────
  for (const [retiredSlug, fallbackSlug] of Object.entries(RETIRED_PLAN_FALLBACK)) {
    const retired = await db.plan.findUnique({ where: { slug: retiredSlug } })
    if (!retired) continue

    const fallback = await db.plan.findUnique({ where: { slug: fallbackSlug } })
    if (!fallback || fallback.id === retired.id) continue

    const moved = await db.subscription.updateMany({
      where: { planId: retired.id },
      data: { planId: fallback.id },
    })
    if (moved.count > 0) {
      console.log(`  → moved ${moved.count} langganan: ${retired.slug} → ${fallback.slug}`)
    }
  }

  const retired = await db.plan.updateMany({
    where: { slug: { notIn: CATALOGUE_SLUGS } },
    data: { isPublic: false },
  })
  if (retired.count > 0) {
    console.log(`  ✓ ${retired.count} paket lama disembunyikan dari halaman harga`)
  }

  console.log(`  ✓ ${PLANS.length} paket di katalog`)

  // ── initial administrator ──────────────────────────────────────────────
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@nanogateway.local').toLowerCase()
  const adminUsername = process.env.ADMIN_USERNAME ?? 'admin'

  /*
    The published default password is a convenience for a laptop and a liability
    on a public URL: it is written in the source, so anyone who reads the
    repository knows the administrator's password before the first real user
    signs up. In production a missing `ADMIN_PASSWORD` therefore generates a
    strong one instead of falling back to the default. It is printed exactly
    once, below, and never stored anywhere in clear text.
  */
  const adminPasswordGenerated =
    !process.env.ADMIN_PASSWORD && process.env.NODE_ENV === 'production'
  const adminPassword =
    process.env.ADMIN_PASSWORD ??
    (adminPasswordGenerated ? generateAdminPassword() : 'NanoAdmin2026!')

  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } })

  if (existingAdmin) {
    console.log(`▸ Admin account already exists: ${adminEmail}`)
  } else {
    console.log('▸ Creating initial administrator…')

    const admin = await db.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        name: 'Platform Administrator',
        passwordHash: await hashPassword(adminPassword),
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      },
    })

    // Give the admin the top plan so every feature is reachable immediately.
    const topPlan = await db.plan.findUnique({ where: { slug: 'ultimate' } })
    if (topPlan) {
      const now = new Date()
      await db.subscription.create({
        data: {
          userId: admin.id,
          planId: topPlan.id,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          // usage counters + their reset window (schema default, made explicit)
          usageResetAt: now,
          messagesUsedToday: 0,
          apiRequestsUsedDay: 0,
        },
      })
    }

    console.log('')
    console.log('  ┌──────────────────────────────────────────────┐')
    console.log('  │  ADMINISTRATOR CREDENTIALS                   │')
    console.log('  ├──────────────────────────────────────────────┤')
    console.log(`  │  email:    ${adminEmail.padEnd(33)}│`)
    console.log(`  │  password: ${adminPassword.padEnd(33)}│`)
    console.log('  └──────────────────────────────────────────────┘')
    console.log(
      adminPasswordGenerated
        ? '  This password was generated and is shown once. Store it in a password manager now;\n  rotate it any time with `npx tsx scripts/rotate-admin-password.ts`.'
        : '  Change this password after the first sign-in:\n  `npx tsx scripts/rotate-admin-password.ts`'
    )
    console.log('')
  }

  console.log('✓ Seed complete.')
}

main()
  .catch((error) => {
    console.error('✗ Seed failed:', error)
    process.exit(1)
  })
