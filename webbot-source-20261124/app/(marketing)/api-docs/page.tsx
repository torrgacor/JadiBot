import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, KeyRound } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CodeBlock } from '@/components/ui/code-block'

export const metadata: Metadata = {
  title: 'Referensi API',
  description: 'REST API publik NANO GATEWAY.',
}

/**
 * API reference.
 *
 * The public, API-key-authenticated surface is not active yet. The page states
 * that plainly instead of documenting endpoints that would 404.
 */

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Referensi API</h1>
        <p className="mt-3 text-body leading-relaxed text-muted-foreground">
          REST API untuk mengendalikan bot Anda dari kode sendiri.
        </p>
      </header>

      <div className="mb-8 rounded-[12px] border border-warning/30 bg-warning/8 px-4 py-3.5">
        <p className="flex items-center gap-2 text-mid font-medium text-foreground">
          <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />
          API publiknya belum aktif.
        </p>
        <p className="mt-1.5 text-s leading-relaxed text-muted-foreground">
          Belum ada endpoint yang bisa dipanggil saat ini. Sementara ini, gunakan{' '}
          <Link href="/dashboard" className="text-primary underline-offset-4 hover:underline">
            panel
          </Link>
          .
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-primary" aria-hidden />
              <CardTitle>Autentikasi (rancangan)</CardTitle>
            </div>
            <CardDescription>Memakai kunci API, bukan cookie sesi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-mid leading-relaxed text-muted-foreground">
              Kunci hanya akan ditampilkan sekali saat dibuat, disimpan dalam bentuk hash, dan
              dikirim sebagai bearer token. Kunci terikat pada satu akun dan bisa dicabut.
            </p>
            <CodeBlock
              label="contoh rencana pemakaian"
              code={`curl https://wagetway.danznanooffc.my.id/api/v1/sessions \\
  -H "Authorization: Bearer ng_live_..."`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
