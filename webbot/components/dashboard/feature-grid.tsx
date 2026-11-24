import Link from 'next/link'
import {
  ArrowUpRight,
  Bot,
  BookOpen,
  Clapperboard,
  Crown,
  Dices,
  Download,
  Eye,
  FileText,
  Film,
  Flame,
  Gamepad2,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  Music,
  Newspaper,
  Puzzle,
  ScrollText,
  Search,
  Smartphone,
  Sparkles,
  Sticker,
  Swords,
  Users,
  Wand2,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils/format'

/**
 * Feature grid.
 *
 * One card per plugin category, taken straight from the bot's own plugin loader —
 * so adding a plugin folder makes a card appear here without this app changing,
 * and the counts are never hand-written. The command figure is the same one the
 * bot's menu prints, because both count the commands the bot advertises (aliases
 * stay searchable on the commands page without inflating this). No ON/OFF switch
 * is shown because the catalogue has no such flag; a toggle that did not write
 * anything to the bot would be a lie. The cards link to the real command list.
 */

/**
 * Labels and blurbs per category.
 *
 * Keys are the bot's own category names — which are named after what a feature
 * DOES, never after the service behind it. A category the bot adds later still
 * gets a card (generic icon and text); it just will not read as nicely until it
 * is listed here.
 */
const CATEGORY_META: Record<string, { icon: LucideIcon; label: string; description: string }> = {
  main: {
    icon: LayoutGrid,
    label: 'Utama',
    description: 'Perintah inti yang selalu tersedia.',
  },
  owner: {
    icon: Crown,
    label: 'Owner',
    description: 'Perintah khusus untuk pemilik bot.',
  },
  group: {
    icon: Users,
    label: 'Grup',
    description: 'Pengaturan dan moderasi grup.',
  },
  download: {
    icon: Download,
    label: 'Unduh',
    description: 'Mengunduh media dari sebuah tautan.',
  },
  search: {
    icon: Search,
    label: 'Pencarian',
    description: 'Mencari lagu, produk, dan info dari sebuah kata kunci.',
  },
  stalker: {
    icon: Eye,
    label: 'Stalker',
    description: 'Melihat data publik dari sebuah username.',
  },
  tools: {
    icon: Wrench,
    label: 'Alat',
    description: 'Utilitas harian seperti pengingat, unggah berkas, dan AFK.',
  },
  sticker: {
    icon: Sticker,
    label: 'Stiker',
    description: 'Membuat dan mengubah stiker.',
  },
  image: {
    icon: ImageIcon,
    label: 'Gambar',
    description: 'Mengompres, mengubah, dan memberi efek pada gambar.',
  },
  pdf: {
    icon: FileText,
    label: 'PDF',
    description: 'Mengolah dan mengubah dokumen PDF.',
  },
  music: {
    icon: Music,
    label: 'Musik',
    description: 'Mencari lagu, lirik, dan info musisi.',
  },
  film: {
    icon: Film,
    label: 'Film',
    description: 'Mencari film, jadwal tayang, dan siaran TV.',
  },
  dracin: {
    icon: Clapperboard,
    label: 'Drama',
    description: 'Drama pendek dan serial Asia.',
  },
  anime: {
    icon: Sparkles,
    label: 'Anime',
    description: 'Info, jadwal rilis, dan bacaan anime serta manga.',
  },
  news: {
    icon: Newspaper,
    label: 'Berita',
    description: 'Berita terkini dari beberapa portal.',
  },
  ai: {
    icon: Bot,
    label: 'AI',
    description: 'Menjawab pertanyaan dan mengolah teks.',
  },
  'ai-image': {
    icon: Wand2,
    label: 'AI Gambar',
    description: 'Membuat dan mengubah gambar dari perintah teks.',
  },
  random: {
    icon: Dices,
    label: 'Hiburan',
    description: 'Meme, kata-kata, dan selingan ringan.',
  },
  rpg: {
    icon: Swords,
    label: 'RPG',
    description: 'Petualangan, level, dan ekonomi di dalam bot.',
  },
  game: {
    icon: Gamepad2,
    label: 'Game',
    description: 'Permainan dan tantangan untuk grup.',
  },
  freefire: {
    icon: Flame,
    label: 'Free Fire',
    description: 'Cek akun, stok, dan info seputar Free Fire.',
  },
  aplikasi: {
    icon: Smartphone,
    label: 'Aplikasi',
    description: 'Mencari dan mengunduh aplikasi Android.',
  },
  agama: {
    icon: BookOpen,
    label: 'Agama',
    description: 'Jadwal ibadah dan bacaan keagamaan.',
  },
  primbon: {
    icon: ScrollText,
    label: 'Primbon',
    description: 'Ramalan, arti nama, dan hitungan tradisional.',
  },
  info: {
    icon: Info,
    label: 'Info',
    description: 'Cuaca, kalender, dan data publik harian.',
  },
}

function metaFor(name: string) {
  const key = name.trim().toLowerCase()
  return (
    CATEGORY_META[key] ?? {
      icon: Puzzle,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      description: 'Kumpulan perintah dari plugin bot.',
    }
  )
}

export function FeatureGrid({
  categories,
  totalCommands,
  activePlugins,
}: {
  categories: Array<{ name: string; count: number; commands: number }>
  totalCommands: number
  activePlugins: number
}) {
  if (categories.length === 0) return null

  return (
    <section className="space-y-3" aria-labelledby="feature-grid-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="feature-grid-title" className="text-lead font-semibold tracking-tight">
            Kemampuan Bot
          </h2>
          <p className="mt-0.5 text-s text-muted-foreground">
            {formatNumber(totalCommands)} perintah dalam {formatNumber(categories.length)}{' '}
            kategori — angka yang sama dengan menu bot, dibaca dari{' '}
            {formatNumber(activePlugins)} plugin Nano Anda.
          </p>
        </div>
        <Link
          href="/dashboard/commands"
          className="inline-flex items-center gap-1.5 text-s font-medium text-primary transition-opacity hover:opacity-80"
        >
          Lihat semua perintah
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((entry) => {
          const meta = metaFor(entry.name)
          const Icon = meta.icon

          return (
            <Link
              key={entry.name}
              href={`/dashboard/commands?category=${encodeURIComponent(entry.name)}`}
              className="group"
            >
              <Card className="card-hover flex h-full flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-[11px] border border-border bg-glass/60 text-primary transition-colors group-hover:border-primary/30"
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </span>

                  <ArrowUpRight
                    className="size-4 text-muted-foreground/50 transition-colors group-hover:text-primary"
                    aria-hidden
                  />
                </div>

                <h3 className="mt-3 text-body font-semibold">{meta.label}</h3>
                <p className="mt-1 text-note leading-relaxed text-muted-foreground">
                  {meta.description}
                </p>

                <div className="mt-auto flex items-center gap-3 pt-3 text-tiny text-muted-foreground">
                  <span>
                    <span className="font-display font-bold text-foreground tabular">
                      {formatNumber(entry.commands)}
                    </span>{' '}
                    perintah
                  </span>
                  <span className="text-muted-foreground/40" aria-hidden>
                    ·
                  </span>
                  <span>{formatNumber(entry.count)} plugin</span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
