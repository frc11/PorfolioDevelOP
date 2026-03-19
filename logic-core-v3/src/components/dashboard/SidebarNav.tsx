'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderOpen, Zap, MessageSquare, User } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  exact: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
  { href: '/dashboard/project', label: 'Mi proyecto', icon: FolderOpen, exact: false },
  { href: '/dashboard/services', label: 'Mis servicios', icon: Zap, exact: false },
  { href: '/dashboard/messages', label: 'Mensajes', icon: MessageSquare, exact: false },
  { href: '/dashboard/profile', label: 'Mi perfil', icon: User, exact: false },
]

interface SidebarNavProps {
  companyName: string
  unreadMessages?: number
}

export function SidebarNav({ companyName, unreadMessages = 0 }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex h-full w-56 flex-shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Brand */}
      <div className="flex h-14 flex-col justify-center border-b border-zinc-800 px-4">
        <span className="text-xs text-zinc-500 uppercase tracking-widest">Portal cliente</span>
        <span className="truncate text-sm font-semibold text-zinc-100">{companyName}</span>
      </div>

      {/* Nav links */}
      <ul className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          const isMessages = href === '/dashboard/messages'

          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-cyan-500/10 font-medium text-cyan-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
                ].join(' ')}
              >
                <Icon size={15} />
                <span className="flex-1">{label}</span>
                {isMessages && unreadMessages > 0 && (
                  <span className="flex min-w-[1.125rem] items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-semibold leading-[1.125rem] text-zinc-950">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Footer branding */}
      <div className="border-t border-zinc-800 px-4 py-3">
        <span className="text-xs text-zinc-600">
          Powered by{' '}
          <span className="text-zinc-500">DevelOP</span>
        </span>
      </div>
    </nav>
  )
}
