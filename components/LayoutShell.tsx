'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/login') {
    return <main className="app-shell" style={{ display: 'block' }}>{children}</main>
  }

  return (
    <main className="app-shell">
      <Sidebar />
      <section className="content-area">
        <Topbar />
        <div className="page-content">
          {children}
        </div>
      </section>
    </main>
  )
}
