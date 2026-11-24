import { db, initDb } from '../lib/db'

/**
 * One-off cleanup for rows written before the UI was translated to Indonesian.
 *
 * The code now writes Indonesian titles and details, but rows created earlier
 * keep the English text they were stored with. This rewrites those known
 * strings in place so the activity log and notifications read consistently.
 *
 * It also removes the engine-config backup path that used to be recorded with
 * every config change — that was an internal filesystem location, and it showed
 * up verbatim in the user's own activity log.
 *
 *   npx tsx scripts/cleanup-legacy-text.ts
 *
 * Idempotent: it only matches exact known values, so re-running it is a no-op.
 */

/** Exact English activity titles → the Indonesian the code writes today. */
const ACTIVITY_TITLES: Record<string, string> = {
  'Signed in': 'Berhasil masuk',
  'Account created': 'Akun dibuat',
  'Email verified': 'Email terverifikasi',
  'Session created': 'Sesi dibuat',
  'Session deleted': 'Sesi dihapus',
  'Session disconnected': 'Sesi terputus',
  'Connection started': 'Koneksi dimulai',
  'Pairing code requested': 'Kode pairing diminta',
  'Group synced': 'Grup disinkronkan',
  'WhatsApp connected': 'WhatsApp terhubung',
  'WhatsApp disconnected': 'WhatsApp terputus',
  'WhatsApp unlinked': 'WhatsApp dilepas',
  'Message sent': 'Pesan terkirim',
  'Message failed': 'Pesan gagal',
  'Message received': 'Pesan diterima',
  'Profile updated': 'Profil diperbarui',
  'Bot setting changed': 'Pengaturan bot diubah',
  'Engine config updated': 'Konfigurasi bot diperbarui',
  'Support ticket opened': 'Tiket dukungan dibuka',
  'User suspended': 'Pengguna ditangguhkan',
  'User activated': 'Pengguna diaktifkan',
  'Two-factor authentication enabled': 'Autentikasi dua faktor diaktifkan',
  'Two-factor authentication disabled': 'Autentikasi dua faktor dinonaktifkan',
  'Backup code used to sign in': 'Kode cadangan dipakai untuk masuk',
  'Signed in with two-factor authentication': 'Masuk dengan autentikasi dua faktor',
}

/** Exact English activity details → Indonesian. */
const ACTIVITY_DETAILS: Record<string, string> = {
  'Unknown device': 'Perangkat tidak dikenal',
  'Disconnected manually': 'Diputuskan secara manual',
  'Disconnected by user.': 'Diputuskan oleh pengguna.',
  'This device was unlinked from WhatsApp. Pair it again to reconnect.':
    'Perangkat ini telah dilepas dari WhatsApp. Tautkan ulang untuk menyambung kembali.',
  'WhatsApp session disconnected. Reconnect the session to continue.':
    'Sesi WhatsApp terputus. Hubungkan ulang sesi untuk melanjutkan.',
}

/** Exact English notification titles → Indonesian. */
const NOTIFICATION_TITLES: Record<string, string> = {
  'Welcome to NANO GATEWAY': 'Selamat datang di NANO GATEWAY',
  'Two-factor authentication enabled': 'Autentikasi dua faktor diaktifkan',
  'Your account was suspended': 'Akun Anda ditangguhkan',
  'Your account was restored': 'Akun Anda dipulihkan',
  'A message failed to send': 'Ada pesan yang gagal terkirim',
  'WhatsApp connected': 'WhatsApp terhubung',
}

/** Exact English notification messages → Indonesian. */
const NOTIFICATION_MESSAGES: Record<string, string> = {
  'Verify your email address, then create your first WhatsApp session to get started.':
    'Verifikasi alamat email Anda, lalu buat sesi WhatsApp pertama untuk memulai.',
  'This device was unlinked from WhatsApp. Pair it again to reconnect.':
    'Perangkat ini telah dilepas dari WhatsApp. Tautkan ulang untuk menyambung kembali.',
  'WhatsApp session disconnected. Reconnect the session to continue.':
    'Sesi WhatsApp terputus. Hubungkan ulang sesi untuk melanjutkan.',
  'Disconnected by user.': 'Diputuskan oleh pengguna.',
  'Sign-ins now require a code from your authenticator app.':
    'Masuk sekarang memerlukan kode dari aplikasi authenticator Anda.',
  'An administrator suspended this account. Contact support for details.':
    'Administrator menangguhkan akun ini. Hubungi dukungan untuk detailnya.',
  'An administrator reactivated your account.': 'Administrator mengaktifkan kembali akun Anda.',
  'The engine reported an error.': 'Engine melaporkan sebuah kesalahan.',
}

/** Rewrites `<name> disconnected` style titles built from a session name. */
const DYNAMIC_NOTIFICATION_SUFFIXES: Array<[string, string]> = [[' disconnected', ' terputus']]

/** Rewrites `<email> registered` style details written after sign-up. */
const DYNAMIC_ACTIVITY_SUFFIXES: Array<[string, string]> = [[' registered', ' terdaftar']]

let changed = 0

async function main() {
  await initDb()
  for (const [from, to] of Object.entries(ACTIVITY_TITLES)) {
    const result = await db.activityLog.updateMany({ where: { title: from }, data: { title: to } })
    changed += result.count
  }

  for (const [from, to] of Object.entries(ACTIVITY_DETAILS)) {
    const result = await db.activityLog.updateMany({
      where: { detail: from },
      data: { detail: to },
    })
    changed += result.count
  }

  for (const [from, to] of Object.entries(NOTIFICATION_TITLES)) {
    const result = await db.notification.updateMany({ where: { title: from }, data: { title: to } })
    changed += result.count
  }

  for (const [from, to] of Object.entries(NOTIFICATION_MESSAGES)) {
    const result = await db.notification.updateMany({
      where: { message: from },
      data: { message: to },
    })
    changed += result.count
  }

  for (const [suffix, replacement] of DYNAMIC_NOTIFICATION_SUFFIXES) {
    const rows = await db.notification.findMany({
      where: { title: { endsWith: suffix } },
      select: { id: true, title: true },
    })
    for (const row of rows) {
      await db.notification.update({
        where: { id: row.id },
        data: { title: row.title.slice(0, -suffix.length) + replacement },
      })
      changed += 1
    }
  }

  for (const [suffix, replacement] of DYNAMIC_ACTIVITY_SUFFIXES) {
    const rows = await db.activityLog.findMany({
      where: { detail: { endsWith: suffix } },
      select: { id: true, detail: true },
    })
    for (const row of rows) {
      if (!row.detail) continue
      await db.activityLog.update({
        where: { id: row.id },
        data: { detail: row.detail.slice(0, -suffix.length) + replacement },
      })
      changed += 1
    }
  }

  // The config change used to record the backup file path alongside the keys.
  // Keep the keys, drop the internal location.
  const configRows = await db.activityLog.findMany({
    where: { detail: { contains: '· backup:' } },
    select: { id: true, detail: true },
  })
  for (const row of configRows) {
    if (!row.detail) continue
    const keys = row.detail
      .split('· backup:')[0]
      .replace(/^(Changed|Diubah):\s*/, '')
      .trim()
    await db.activityLog.update({
      where: { id: row.id },
      data: { detail: `Diubah: ${keys}` },
    })
    changed += 1
  }

  console.log(`Selesai. ${changed} baris diperbarui.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
