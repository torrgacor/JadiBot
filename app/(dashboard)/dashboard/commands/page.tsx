import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ScrollText } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guards'
import { getNanoOverview, getNanoPlugins } from '@/lib/services/nano-service'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { CommandSearch } from '@/components/nano/command-search'
import { formatNumber } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

export const metadata: Metadata = { title: 'Perintah' }
export const dynamic = 'force-dynamic'

/**
 * Command catalogue.
 *
 * This is the bot's real feature list. It comes from the engine's own plugin
 * loader (`scripts/katalog-plugin.mjs`), not from a text scan of the files, so
 * a command shows up here exactly when the bot answers to it — and it disappears
 * when the plugin is removed. Nothing on this page is maintained by hand.
 */
export default async function CommandsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; limit?: string }>
}) {
  await requireAuth()

  const { q, category, limit: limitParam } = await searchParams
  /* Anything other than the two known values counts as "no filter" rather than
     being echoed back into the page. */
  const limit = limitParam === 'free' || limitParam === 'limited' ? limitParam : undefined

  const [overview, catalogue] = await Promise.all([
    getNanoOverview(),
    getNanoPlugins({ q, category, limit }),
  ])

  const plugins = catalogue.filtered
  // Only plugins with a command or help entry are actually registered by Nano's
  // loader; the rest are helper modules shipped alongside them.
  const active = plugins.filter((plugin) => plugin.valid)
  const commandCount = active.reduce((sum, plugin) => sum + plugin.commands.length, 0)
  // A file that registers several categories is listed once per category, so
  // the plugin figure counts the distinct files behind what is shown.
  const activeFiles = new Set(active.map((plugin) => plugin.file)).size

  /*
    Category chips carry the search and limit filters over, and their numbers
    come from the same scope the click will show — so no figure on this page is
    left over from a different filter state.
  */
  const chipHref = (nextCategory?: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (limit) params.set('limit', limit)
    if (nextCategory) params.set('category', nextCategory)
    return params.size ? `/dashboard/commands?${params.toString()}` : '/dashboard/commands'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perintah"
        description={`Semua perintah yang bisa dijawab bot Nano Anda, dibaca dari pluginnya. ${formatNumber(
          overview.totalCommands
        )} perintah dalam ${formatNumber(overview.categories.length)} kategori, dari ${formatNumber(
          overview.activePlugins
        )} plugin — angka yang sama dengan menu bot.`}
      />

      {!overview.install.available ? (
        <div className="flex items-start gap-3 rounded-[12px] border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <div className="text-s">
            <p className="font-medium text-foreground">Bot Nano tidak ditemukan.</p>
            <p className="mt-0.5 text-muted-foreground">{overview.install.reason}</p>
          </div>
        </div>
      ) : null}

      <CommandSearch
        initialQuery={q ?? ''}
        category={category}
        limit={limit}
        categories={catalogue.scope.categories}
      />

      {/* ── category filter ──────────────────────────────────────────────── */}
      {catalogue.scope.categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Link
            href={chipHref()}
            className={cn(
              'rounded-[9px] border px-3 py-1.5 text-s transition-colors',
              !category
                ? 'border-primary/40 bg-primary-soft text-primary'
                : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-primary-soft'
            )}
          >
            Semua kategori
            <span className="ml-2 text-muted-foreground">
              {formatNumber(catalogue.scope.totalCommands)}
            </span>
          </Link>

          {catalogue.scope.categories.map((entry) => (
            <Link
              key={entry.name}
              href={chipHref(entry.name)}
              className={cn(
                'rounded-[9px] border px-3 py-1.5 text-s transition-colors',
                category === entry.name
                  ? 'border-primary/40 bg-primary-soft text-primary'
                  : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-primary-soft'
              )}
            >
              {entry.name}
              <span className="ml-2 text-muted-foreground">{entry.commands}</span>
            </Link>
          ))}
        </div>
      ) : null}

      <p className="text-s text-muted-foreground">
        Menampilkan <span className="font-medium text-foreground">{formatNumber(activeFiles)}</span>{' '}
        plugin aktif ·{' '}
        <span className="font-medium text-foreground">{formatNumber(commandCount)}</span> perintah
        {q ? (
          <>
            {' '}
            yang cocok dengan &ldquo;<span className="text-foreground">{q}</span>&rdquo;
          </>
        ) : null}
        {category ? <> · kategori {category}</> : null}
        {limit ? <> · {limit === 'free' ? 'hanya gratis' : 'hanya yang pakai limit'}</> : null}
      </p>

      {plugins.length === 0 ? (
        <Card>
          <EmptyState
            icon={ScrollText}
            title="Tidak ada perintah yang cocok"
            description="Coba kata kunci lain, atau kosongkan filter kategori dan status limit untuk melihat semua kemampuan bot."
          />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plugins.map((plugin) => (
            <Card key={plugin.id} className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-mid-lg font-medium" title={plugin.name}>
                    {plugin.name}
                  </p>
                  <p className="truncate font-mono text-xs2 text-muted-foreground" title={plugin.id}>
                    {plugin.id}
                  </p>
                </div>
                <Badge tone={plugin.valid ? 'primary' : 'neutral'} size="sm">
                  {plugin.category}
                </Badge>
              </div>

              {/* Commands — the actual trigger words the bot listens for. */}
              {plugin.commands.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {plugin.commands.slice(0, 12).map((command) => (
                    <code
                      key={command}
                      className="rounded-[7px] border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-xs2"
                    >
                      .{command}
                    </code>
                  ))}
                  {plugin.commands.length > 12 ? (
                    <span className="text-xs2 text-muted-foreground">
                      +{plugin.commands.length - 12} lagi
                    </span>
                  ) : null}
                </div>
              ) : null}

              {/*
                Names the bot answers to but does not advertise in its menu.
                Shown so nothing feels lost, kept out of every count on purpose.
              */}
              {plugin.aliases.length > 0 ? (
                <p className="mt-2 text-xs2 leading-relaxed text-muted-foreground">
                  Nama lain:{' '}
                  <span className="font-mono">
                    {plugin.aliases.slice(0, 6).map((alias) => `.${alias}`).join(' ')}
                  </span>
                  {plugin.aliases.length > 6 ? ` +${plugin.aliases.length - 6} lagi` : ''}
                </p>
              ) : null}

              {plugin.description ? (
                <p className="mt-3 line-clamp-3 text-s leading-relaxed text-muted-foreground">
                  {plugin.description}
                </p>
              ) : null}

              {/* Behaviour flags, as declared by the plugin itself. */}
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {plugin.groupOnly ? (
                  <Badge tone="info" size="sm">
                    hanya grup
                  </Badge>
                ) : null}
                {plugin.ownerOnly ? (
                  <Badge tone="warning" size="sm">
                    hanya owner
                  </Badge>
                ) : null}
                {plugin.privateOnly ? (
                  <Badge tone="neutral" size="sm">
                    hanya chat pribadi
                  </Badge>
                ) : null}
                {plugin.adminOnly ? (
                  <Badge tone="danger" size="sm">
                    hanya admin
                  </Badge>
                ) : null}
                {plugin.premium ? (
                  <Badge tone="primary" size="sm">
                    premium
                  </Badge>
                ) : null}
                {/** A premium command that never spends a limit is not "gratis" —
                 *  the premium badge above already says who may run it. */}
                {plugin.premium && plugin.unlimited ? null : (
                  <Badge tone={plugin.unlimited ? 'neutral' : 'warning'} size="sm">
                    {plugin.unlimited ? 'gratis' : 'pakai limit'}
                  </Badge>
                )}
                {plugin.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} tone="outline" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dari mana datanya</CardTitle>
          <CardDescription>
            Setiap perintah dibaca langsung dari plugin yang memilikinya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-s text-muted-foreground">
          <p>
            Tidak ada yang diatur di halaman ini. Menambah berkas plugin ke instalasi Nano akan
            memunculkan perintahnya di sini, dan menghapusnya akan menghilangkan perintah itu.
          </p>
          <p>
            Label <span className="font-medium text-foreground">pakai limit</span> berarti plugin
            mengikuti sistem batas harian per pengguna milik Nano — sama dengan tanda{' '}
            <span className="font-medium text-foreground">Ⓛ</span> di menu bot — sedangkan{' '}
            <span className="font-medium text-foreground">gratis</span> tidak memakai limit sama
            sekali. Batasnya ditegakkan bot dan bisa dilihat per pengguna di halaman Data Bot.
          </p>
          <p>
            &ldquo;Nama lain&rdquo; pada sebuah plugin adalah alias yang tetap dijawab bot, tapi
            tidak ditampilkan di menunya — jadi angka di halaman ini tidak ikut menghitungnya.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
