import {
  Bell,
  Bot,
  CircleHelp,
  CreditCard,
  Database,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Plus,
  ScrollText,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
  UserCog,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '@/types/enums'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Short trailing note, e.g. a count. Rendered by the sidebar. */
  badge?: string
  /** Restrict visibility to these roles. */
  roles?: UserRole[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

/**
 * Navigation.
 *
 * The product is a control panel for the Nano bot: the bot links a number, and
 * every capability below it comes from Nano's own plugins and database. The
 * sidebar therefore mirrors the bot's structure rather than a generic WhatsApp
 * API console.
 *
 * The sidebar, the mobile drawer and the command palette are all generated from
 * this config, so they cannot disagree about what exists. Every entry here
 * resolves to a built page — a link that 404s is worse than no link.
 *
 * "Bantuan" points at the public help page rather than a dashboard route: the
 * steps it lists stay useful even when the user is not signed in.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: '',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Bot Saya',
    items: [
      { label: 'Ringkasan Bot', href: '/dashboard/bot', icon: Bot },
      { label: 'Pengaturan Bot', href: '/dashboard/bot/settings', icon: Settings2 },
      { label: 'Perintah', href: '/dashboard/commands', icon: ScrollText },
      { label: 'Log Bot', href: '/dashboard/bot/logs', icon: Terminal },
      { label: 'Data Bot', href: '/dashboard/data', icon: Database },
      { label: 'Konfigurasi Bot', href: '/dashboard/config', icon: SlidersHorizontal },
    ],
  },
  {
    title: 'WhatsApp',
    items: [
      { label: 'Sesi', href: '/dashboard/sessions', icon: Layers },
      { label: 'Tambah Sesi', href: '/dashboard/sessions/new', icon: Plus },
    ],
  },
  {
    title: 'Akun',
    items: [
      { label: 'Langganan', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Profil', href: '/dashboard/account/profile', icon: UserCog },
      { label: 'Keamanan', href: '/dashboard/account/security', icon: ShieldCheck },
      { label: 'Notifikasi', href: '/dashboard/account/notifications', icon: Bell },
      { label: 'Dukungan', href: '/dashboard/support/ticket', icon: LifeBuoy },
      { label: 'Bantuan', href: '/help', icon: CircleHelp },
    ],
  },
  {
    title: 'Administrasi',
    items: [
      {
        label: 'Panel Admin',
        href: '/dashboard/admin',
        icon: ShieldCheck,
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
    ],
  },
]

/** Filter the tree for a role, dropping sections that become empty. */
export function navSectionsForRole(role: UserRole): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((section) => section.items.length > 0)
}

/**
 * Sections that are designed but not built yet.
 *
 * Kept as data rather than as links so the sidebar never sends anyone to a 404.
 * The bot overview page renders these as an explicit roadmap.
 */
export const PLANNED_SECTIONS: Array<{ title: string; items: string[] }> = [
  {
    title: 'Pesan',
    items: ['Kirim Pesan', 'Riwayat Pesan', 'Kirim Massal'],
  },
  {
    title: 'Kontak',
    items: ['Kontak', 'Label', 'Impor / Ekspor'],
  },
  {
    title: 'Otomatisasi',
    items: ['Pembuat aturan', 'Kata kunci', 'Penjadwal'],
  },
  {
    title: 'API',
    items: ['Kunci API', 'Publik /api/v1', 'Log API'],
  },
  {
    title: 'Analitik',
    items: ['Ringkasan', 'Pesan', 'Sesi', 'Pemakaian API'],
  },
  {
    title: 'Administrasi',
    items: ['Manajemen pengguna', 'Paket', 'Pembayaran', 'Sistem', 'Log'],
  },
]
