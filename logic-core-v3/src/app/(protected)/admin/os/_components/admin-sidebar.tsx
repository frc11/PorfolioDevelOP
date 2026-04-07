'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
  MessageCircle,
  Settings,
  UserCog,
  Users,
} from 'lucide-react'

type AdminSidebarProps = {
  userName: string
  userRole: string
}

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

type NavSection = {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'OPERACIONES',
    items: [
      { href: '/admin/os', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/os/leads', label: 'Leads', icon: Users },
      { href: '/admin/os/projects', label: 'Proyectos', icon: FolderKanban },
      { href: '/admin/os/team', label: 'Equipo', icon: UserCog },
    ],
  },
  {
    label: 'CLIENTES',
    items: [
      { href: '/admin/os/clients', label: 'Clientes', icon: Building2 },
      { href: '/admin/os/tickets', label: 'Tickets', icon: LifeBuoy },
      { href: '/admin/os/messages', label: 'Mensajes', icon: MessageCircle },
    ],
  },
  {
    label: 'CONFIG',
    items: [{ href: '/admin/os/settings', label: 'Configuraci\u00f3n', icon: Settings }],
  },
]

export function AdminSidebar({ userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-[90] flex w-[240px] flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/admin/os" className="group block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-sm font-semibold tracking-[0.16em] text-cyan-200 shadow-[0_0_28px_rgba(6,182,212,0.18)]">
              dO
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-white">develOP</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Agency OS</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1.5">
              <div className="border-t border-white/5 px-4 pt-3">
                <p className="text-[9px] uppercase tracking-widest text-zinc-700">
                  {section.label}
                </p>
              </div>

              {section.items.map((item) => {
                const isActive =
                  item.href === '/admin/os'
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)

                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'flex items-center gap-3 rounded-r-2xl border-l-2 px-4 py-3 text-sm transition-all duration-200',
                      isActive
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-100'
                        : 'border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="truncate text-sm font-medium text-zinc-100">{userName}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">{userRole}</p>
        </div>
      </div>
    </aside>
  )
}
