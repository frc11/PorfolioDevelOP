'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  MessageSquare,
  Settings,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  exact: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/clients', label: 'Clientes', icon: Users, exact: false },
  { href: '/admin/projects', label: 'Proyectos', icon: FolderKanban, exact: false },
  { href: '/admin/messages', label: 'Mensajes', icon: MessageSquare, exact: false },
  { href: '/admin/settings', label: 'Configuración', icon: Settings, exact: false },
]

interface SidebarNavProps {
  unreadMessages?: number
}

export function SidebarNav({ unreadMessages = 0 }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex h-full w-56 flex-shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-zinc-800 px-4">
        <span className="text-sm font-semibold tracking-widest text-zinc-100 uppercase">
          DevelOP <span className="text-cyan-400">Admin</span>
        </span>
      </div>

      {/* Nav links */}
      <ul className="flex flex-col gap-0.5 p-2 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          const isMessages = href === '/admin/messages'

          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
                ].join(' ')}
              >
                <Icon size={15} />
                <span className="flex-1">{label}</span>
                {isMessages && unreadMessages > 0 && (
                  <span className="flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-semibold leading-none text-zinc-950">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
