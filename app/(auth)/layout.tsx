import type { ReactNode } from 'react'

/** Auth route group. Individual pages supply their own AuthShell framing. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-background">{children}</div>
}
