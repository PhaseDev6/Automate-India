'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, ChevronRight, Leaf, Moon, X } from 'lucide-react'

const breadcrumbs: Record<string, string> = {
  '/': 'Overview',
  '/map': 'Live Map',
  '/vehicles': 'Vehicles',
  '/routes': 'Routes & zones',
  '/reports': 'Reports',
}

export function Topbar() {
  const pathname = usePathname()
  const activeNav = breadcrumbs[pathname] || 'Overview'
  const [isDark, setIsDark] = useState(true)
  const [notifications, setNotifications] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleTheme() {
    setIsDark((current) => {
      const newDark = !current
      document.documentElement.classList.toggle('light', !newDark)
      document.documentElement.classList.toggle('dark', newDark)
      return newDark
    })
  }

  return (
    <header className="topbar">
      <div className="mobile-brand"><div className="brand-mark"><Leaf size={16} /></div><span>UrbanSweep<span className="brand-dot">.</span></span></div>
      <div className="breadcrumb"><span>Operations</span><ChevronRight size={14} /><strong>{activeNav}</strong></div>
      <div className="top-actions">
        <button className="icon-button" aria-label="Toggle theme" onClick={toggleTheme}><Moon size={17} /></button>
        <div className="notification-wrap">
          <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotifications(!notifications)}>
            <Bell size={17} /><span className="notification-dot" />
          </button>
          {notifications && (
            <div className="popover notification-popover">
              <div className="popover-heading"><strong>Notifications</strong><button onClick={() => setNotifications(false)}><X size={14} /></button></div>
              <p><span className="mini-dot" />TRK-027 needs attention</p>
              <p><span className="mini-dot green" />Route North Loop completed</p>
            </div>
          )}
        </div>
        <div className="top-avatar">RS</div>
      </div>
    </header>
  )
}
