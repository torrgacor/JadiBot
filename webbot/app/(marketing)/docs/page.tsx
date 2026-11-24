import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Bot, KeyRound, ScrollText, Smartphone, Workflow } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/ui/code-block'

export const metadata: Metadata = {
  title: 'Panduan',
  description: 'Cara menautkan bot Nano Anda dan mengelolanya dari panel.',
}

/**
 * Public documentation.
 *
 * Describes the real product: link a number with a pairing code, then the Nano
 * bot answers its own commands. The full command reference lives behind the
 * dashboard because it is generated from the plugins on your own installation.
 */
export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header id="quickstart" className="mb-10 scroll-mt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-tiny text-muted-foreground">
          <BookOpen className="size-3" aria-hidden />
          Panduan
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Menjalankan bot Anda
        </h1>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          NANO GATEWAY adalah panel pengendali untuk bot WhatsApp Nano. Semua yang bisa
          dilakukan bot — perintah, plugin, pengguna, dan pengaturan grup — dibaca dari
          instalasi Nano Anda, jadi panel selalu menampilkan apa yang benar-benar akan
          dijawab oleh bot.
        </p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Buat bot Anda</CardTitle>
            <CardDescription>Satu bot per akun, dengan kredensialnya sendiri.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-mid leading-relaxed text-muted-foreground">
            <p>
              Dari halaman{' '}
              <Link href="/dashboard/bot" className="text-primary underline-offset-4 hover:underline">
                Bot Saya
              </Link>
              , buat sebuah sesi. Setiap bot menyimpan kredensial WhatsApp dan datanya sendiri, jadi
              tidak ada data yang bercampur dengan bot milik orang lain meskipun Nano yang dipakai
              sama.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Tautkan WhatsApp dengan kode pairing</CardTitle>
            <CardDescription>Tanpa perlu scan QR.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-2 text-mid leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">1.</span> Masukkan nomor
                telepon yang akan dipakai bot, lengkap dengan kode negaranya.
              </li>
              <li>
                <span className="font-medium text-foreground">2.</span> Di ponsel tersebut,
                buka WhatsApp →{' '}
                <span className="font-medium text-foreground">Perangkat Tertaut</span> →{' '}
                <span className="font-medium text-foreground">Tautkan Perangkat</span>.
              </li>
              <li>
                <span className="font-medium text-foreground">3.</span> Pilih{' '}
                <span className="font-medium text-foreground">Tautkan dengan nomor telepon</span>{' '}
                lalu ketikkan kode yang tampil di panel.
              </li>
            </ol>
            <p className="text-s text-muted-foreground">
              Kode hanya bisa dipakai sekali dan kedaluwarsa sekitar satu menit. Jika
              kedaluwarsa, minta kode baru — memulai alur QR akan membatalkan kode yang
              sedang menunggu.
            </p>
            <CodeBlock
              label="kode pairing"
              code={`ABCD-EFGH   ← diketik di WhatsApp, bukan di sini`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="size-4 text-primary" aria-hidden />
              <CardTitle>Mengelola bot</CardTitle>
            </div>
            <CardDescription>Apa isi tiap bagian panel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Section
              icon={Bot}
              title="Ringkasan bot"
              body="Status penautan, koneksi aktif, identitas bot yang dibaca dari konfigurasinya, dan ringkasan semua yang diketahui bot."
            />
            <Section
              icon={ScrollText}
              title="Perintah"
              body="Semua perintah yang dijawab bot, dikelompokkan seperti Nano mengelompokkannya. Bisa dicari, dan dibuat dari berkas plugin sehingga tidak mungkin basi."
            />
            <Section
              icon={Workflow}
              title="Konfigurasi"
              body="Nilai yang dipakai bot — nama, prefix, zona waktu, owner. Hanya bisa dibaca, karena filenya dipakai bersama semua bot di instalasi ini."
            />
            <Section
              icon={KeyRound}
              title="Data bot"
              body="Pengguna yang pernah mengobrol dengan bot, prefix khusus per chat, pengaturan grup, dan jadwal grup yang menunggu."
            />
          </CardContent>
        </Card>

        <Card id="acceptable-use" className="scroll-mt-24">
          <CardHeader>
            <CardTitle>Penggunaan yang wajar</CardTitle>
            <CardDescription>Hal yang tidak akan dibantu oleh panel ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-mid leading-relaxed text-muted-foreground">
            <p>
              Kirim pesan hanya kepada orang yang memang menunggu pesan Anda. Panel ini tidak
              menyediakan alat untuk menembus batas WhatsApp maupun untuk menghindari deteksi
              spam-nya.
            </p>
            <p>
              WhatsApp bisa membatasi nomor yang dianggap bermasalah. Risiko itu menjadi
              tanggung jawab akun yang menjalankan bot, dan tidak ada fitur di panel ini yang
              bisa menghapusnya.
            </p>
          </CardContent>
        </Card>

        <Card id="engine" className="scroll-mt-24">
          <CardHeader>
            <CardTitle>Perintah itu berasal dari mana</CardTitle>
            <CardDescription>Tidak ada yang diatur di panel ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-mid leading-relaxed text-muted-foreground">
            <p>
              Perintah berasal dari bot Nano Anda. Menambah plugin akan memunculkan perintahnya
              di panel, dan menghapusnya akan menghilangkan perintah itu. Bot memuat ulang daftar
              pluginnya dengan sendirinya.
            </p>
            <p>
              Pengaturan yang berbeda per akun — batas harian pengguna, status premium, pesan
              welcome sebuah grup — tersimpan di masing-masing bot dan diubah lewat perintah bot
              itu sendiri.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/register">Buat akun</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/dashboard/commands">Lihat perintah</Link>
        </Button>
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Bot
  title: string
  body: string
}) {
  return (
    <div className="flex gap-3">
      <span
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[8px] border border-border bg-muted/40 text-primary"
        aria-hidden
      >
        <Icon className="size-3.5" />
      </span>
      <div>
        <p className="text-mid font-medium">{title}</p>
        <p className="mt-0.5 text-s leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}
