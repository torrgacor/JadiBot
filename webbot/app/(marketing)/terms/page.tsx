import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Ketentuan Layanan',
  description: 'Aturan penggunaan NANO GATEWAY.',
}

/**
 * Terms of use.
 *
 * States the rules the software actually enforces or expects, in plain language
 * and without internal implementation details.
 */
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ketentuan Layanan</h1>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          Aturan penggunaan NANO GATEWAY.
        </p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Akun Anda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-mid leading-relaxed text-muted-foreground">
            <p>
              Anda bertanggung jawab menjaga kerahasiaan kredensial Anda dan atas semua yang
              dilakukan lewat akun Anda. Membagikan akun berarti memberi orang lain akses penuh
              ke semua bot di dalamnya.
            </p>
            <p>
              Akses dapat ditangguhkan bila panel ini dipakai untuk mengirim pesan massal tanpa
              izin, mengganggu orang lain, atau melanggar hukum.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>Bagian yang berdampak nyata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-mid leading-relaxed text-muted-foreground">
            <p>
              Menautkan nomor akan membuat perangkat tertaut pada akun WhatsApp tersebut.
              WhatsApp bisa membatasi atau memblokir nomor yang dianggap bermasalah. Pengiriman
              otomatis mengandung risiko itu, dan risikonya menjadi tanggung jawab Anda.
            </p>
            <p>
              Perangkat lunak ini sengaja tidak menyediakan alat untuk menembus batas kirim
              WhatsApp maupun menghindari deteksi spam-nya. Jangan gunakan untuk mengirim pesan
              yang tidak diminta.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perangkat lunak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-mid leading-relaxed text-muted-foreground">
            <p>
              Disediakan apa adanya, tanpa jaminan. Ia bergantung pada bot Nano dan pada server
              WhatsApp, yang keduanya di luar kendali kami, sehingga fitur bisa berubah bila
              keduanya berubah.
            </p>
            <p>
              Kemampuan yang tidak tersedia akan ditandai dengan jelas, bukan dikira-kira.
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-s text-muted-foreground">
        Lihat juga <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">Kebijakan Privasi</Link>.
      </p>
    </div>
  )
}
