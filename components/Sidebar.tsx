'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Leaf,
  Map,
  MoreHorizontal,
  Settings,
  Truck,
  UserRound,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Live Map', href: '/map', icon: Map },
  { label: 'Vehicles', href: '/vehicles', icon: Truck },
  { label: 'Routes & zones', href: '/routes', icon: Leaf },
  { label: 'Reports', href: '/reports', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Leaf size={18} strokeWidth={2.5} /></div><span>UrbanSweep<span className="brand-dot">.</span></span></div>
      <div className="workspace-switcher"><div className="workspace-avatar">MC</div><div><span className="eyebrow">Workspace</span><strong>Metro City</strong></div><ChevronDown size={15} /></div>
      <nav className="nav-list" aria-label="Primary navigation">
        <span className="nav-label">Operations</span>
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link href={href} key={label} className={`nav-item ${pathname === href ? 'nav-item-active' : ''}`}>
            <Icon size={17} />
            <span>{label}</span>
            {label === 'Vehicles' && <span className="nav-count">24</span>}
          </Link>
        ))}
        <span className="nav-label nav-label-spaced">Workspace</span>
        <button className="nav-item"><UserRound size={17} /><span>Team</span></button>
        <button className="nav-item"><Settings size={17} /><span>Settings</span></button>
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={17} /><div><strong>Need a hand?</strong><span>Open help center</span></div><ChevronRight size={15} /></div><div className="user-card"><div className="user-avatar">RS</div><div><strong>Rohan Sharma</strong><span>Administrator</span></div><MoreHorizontal size={17} /></div></div>
    </aside>
  )
}
