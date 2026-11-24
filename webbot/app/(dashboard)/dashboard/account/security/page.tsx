import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/guards'
import { db } from '@/lib/db'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ActiveSessionsPanel,
  ChangePasswordPanel,
  TwoFactorPanel,
} from '@/components/account/security-panels'
import { formatDateTime } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Keamanan' }
export const dynamic = 'force-dynamic'

/**
 * Security.
 *
 * Password, two-factor authentication and device management. Recent security
 * events come from the audit log, so what is shown is what actually happened to
 * the account rather than a summary.
 */
export default async function SecurityPage() {
  const { user } = await requireAuth()

  const [account, events] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { twoFactorEnabled: true, lastLoginAt: true, lastLoginIp: true },
    }),
    db.activityLog.findMany({
      where: {
        userId: user.id,
        event: { in: ['auth.login', 'auth.logout', 'auth.failed', 'auth.password-changed', 'auth.2fa-enabled', 'auth.2fa-disabled', 'auth.session-revoked'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, event: true, title: true, detail: true, ip: true, createdAt: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Keamanan"
        description="Lindungi akun Anda dengan kata sandi kuat, verifikasi dua langkah, dan peninjauan perangkat."
      />

      <ChangePasswordPanel />

      <TwoFactorPanel enabled={account?.twoFactorEnabled ?? false} />

      <ActiveSessionsPanel />

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas keamanan terbaru</CardTitle>
          <CardDescription>
            Dari log audit — setiap kali masuk dan setiap perubahan keamanan tercatat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-s text-muted-foreground">
              Belum ada catatan untuk akun ini.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {events.map((event) => (
                <li key={event.id} className="flex flex-wrap items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-s font-medium">{event.title}</span>
                    {event.detail ? (
                      <span className="block truncate text-tiny text-muted-foreground">
                        {event.detail}
                      </span>
                    ) : null}
                  </span>
                  <span className="font-mono text-xs2 text-muted-foreground">
                    {event.ip ?? '—'}
                  </span>
                  <span className="w-full text-tiny text-muted-foreground sm:w-auto">
                    {formatDateTime(event.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {account?.lastLoginAt ? (
        <p className="text-note text-muted-foreground">
          Terakhir berhasil masuk {formatDateTime(account.lastLoginAt)}
          {account.lastLoginIp ? ` dari ${account.lastLoginIp}` : ''}.
        </p>
      ) : null}
    </div>
  )
}
