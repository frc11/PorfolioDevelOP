'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  MessageSquare,
  Settings,
  Inbox,
  Headphones,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  exact: boolean
  badgeKey?: 'messages' | 'leads' | 'tickets'
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/clients', label: 'Clientes', icon: Users, exact: false },
  { href: '/admin/projects', label: 'Proyectos', icon: FolderKanban, exact: false },
  { href: '/admin/messages', label: 'Mensajes', icon: MessageSquare, exact: false, badgeKey: 'messages' },
  { href: '/admin/leads', label: 'Leads', icon: Inbox, exact: false, badgeKey: 'leads' },
  { href: '/admin/tickets', label: 'Tickets', icon: Headphones, exact: false, badgeKey: 'tickets' },
  { href: '/admin/settings', label: 'Configuración', icon: Settings, exact: false },
]

interface SidebarNavProps {
  unreadMessages?: number
  unreadLeads?: number
  openTickets?: number
}

export function SidebarNav({ unreadMessages = 0, unreadLeads = 0, openTickets = 0 }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className="relative z-10 flex h-full w-56 flex-shrink-0 flex-col"
      style={{
        borderRight: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(5,7,9,0.95)',
      }}
    >
      {/* Brand */}
      <div
        className="flex h-14 items-center px-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-base font-bold tracking-tight">
          <span className="text-white">devel</span>
          <span
            className="text-cyan-400"
            style={{ textShadow: '0 0 16px rgba(6,182,212,0.6)' }}
          >
            OP
          </span>
          <span className="ml-2 text-[10px] font-medium tracking-[0.15em] uppercase text-zinc-600">
            Admin
          </span>
        </span>
      </div>

      {/* Nav links */}
      <ul className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact, badgeKey }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          const badgeCount =
            badgeKey === 'messages' ? unreadMessages :
            badgeKey === 'leads' ? unreadLeads :
            badgeKey === 'tickets' ? openTickets : 0

          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  'flex items-center gap-3 rounded-lg py-2 text-sm transition-all duration-150',
                  isActive
                    ? 'font-medium text-cyan-400'
                    : 'text-zinc-500 hover:text-zinc-200',
                ].join(' ')}
                style={
                  isActive
                    ? {
                        paddingLeft: 'calc(0.75rem - 2px)',
                        paddingRight: '0.75rem',
                        borderLeft: '2px solid rgb(34,211,238)',
                        background: 'rgba(6,182,212,0.07)',
                        borderRadius: '0 8px 8px 0',
                      }
                    : {
                        paddingLeft: '0.75rem',
                        paddingRight: '0.75rem',
                      }
                }
              >
                <Icon size={15} className={isActive ? 'text-cyan-400' : ''} />
                <span className="flex-1">{label}</span>
                {badgeCount > 0 && (
                  <span className="flex min-w-[1.125rem] items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-semibold leading-[1.125rem] text-zinc-950">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Footer */}
      <div
        className="px-5 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-[10px] text-zinc-700">
          develOP © {new Date().getFullYear()}
        </span>
      </div>
    </nav>
  )
}
