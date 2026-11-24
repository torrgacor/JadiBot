import { ChevronDown } from 'lucide-react'

/**
 * FAQ.
 *
 * Uses native <details>/<summary> so it is keyboard-accessible, works without
 * JavaScript, and is findable by the browser's in-page search — all of which a
 * div-based accordion loses.
 */

const FAQS = [
  {
    q: 'Ini panel sungguhan atau hanya tampilan contoh?',
    a: 'Sungguhan. Nomor ditautkan ke WhatsApp lewat protokol multi-perangkat, jadi kode QR maupun kode pairing yang Anda lihat diterbitkan langsung oleh WhatsApp. Tidak ada koneksi simulasi dan tidak ada angka contoh di panel.',
  },
  {
    q: 'Apa bedanya login QR dan kode pairing?',
    a: 'Keduanya menautkan perangkat. Login QR memakai kamera ponsel untuk memindai kode. Kode pairing adalah kode 8 karakter yang Anda ketikkan di WhatsApp pada menu Perangkat Tertaut → Tautkan dengan nomor telepon — praktis dipakai dari komputer atau saat kamera tidak tersedia.',
  },
  {
    q: 'Apakah bot Nano saya yang benar-benar berjalan?',
    a: 'Ya. Panel menjalankan bot Nano Anda sendiri, membaca kode QR dan kode pairing aslinya, serta mengirim pesan lewat bot itu. Perintah, plugin, pengguna, dan pengaturan grup semuanya berasal dari Nano.',
  },
  {
    q: 'Apakah pengaturan di panel langsung berpengaruh ke bot?',
    a: 'Ya. Pengaturan yang Anda ubah langsung dipakai bot saat menangani pesan berikutnya, sehingga perilaku bot dan tampilan panel tidak bisa berbeda. Perubahan konfigurasi juga otomatis dicadangkan sebelum diterapkan.',
  },
  {
    q: 'Apa yang terjadi pada data saya saat sesi dihapus?',
    a: 'Menghapus sesi akan menghapus kredensial tersimpan dan seluruh datanya secara permanen. Logout juga melepas perangkat di sisi WhatsApp, sehingga nomor itu tidak lagi tercatat tertaut.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <span className="text-xs2 font-semibold uppercase tracking-[0.14em] text-primary">
            FAQ
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Pertanyaan yang sering muncul
          </h2>
          <p className="mt-3 text-lead leading-relaxed text-muted-foreground">
            Masih ada yang mengganjal? Buat tiket dari panel Anda, akan dibalas oleh
            tim kami.
          </p>
        </div>

        <div className="divide-y divide-border rounded-[14px] border border-border bg-surface">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-body font-medium transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="px-5 pb-4 text-mid leading-relaxed text-muted-foreground">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
