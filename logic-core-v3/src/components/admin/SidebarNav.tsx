'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FolderKanban,
  Headphones,
  LayoutDashboard,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  exact: boolean
  badgeKey?: 'messages' | 'leads' | 'tickets'
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/clients', label: 'Clientes', icon: Users, exact: false },
  { href: '/admin/projects', label: 'Proyectos', icon: FolderKanban, exact: false },
  { href: '/admin/messages', label: 'Mensajes', icon: MessageSquare, exact: false, badgeKey: 'messages' },
  { href: '/admin/leads', label: 'Leads', icon: TrendingUp, exact: false, badgeKey: 'leads' },
  { href: '/admin/tickets', label: 'Tickets', icon: Headphones, exact: false, badgeKey: 'tickets' },
  { href: '/admin/settings', label: 'Configuración', icon: Settings, exact: false },
]

interface SidebarNavProps {
  unreadMessages?: number
  unreadLeads?: number
  openTickets?: number
}

export function SidebarNav({
  unreadMessages = 0,
  unreadLeads = 0,
  openTickets = 0,
}: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className="relative z-10 flex h-full w-[88px] flex-shrink-0 flex-col sm:w-72"
      style={{
        borderRight: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, rgba(5,7,9,0.97), rgba(8,10,12,0.92))',
      }}
    >
      <div className="px-5 pb-5 pt-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-start gap-4">
          <div
            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[20px]"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
              boxShadow: '0 0 24px rgba(6,182,212,0.15)',
            }}
          >
            <Image
              src="/logodevelOP.png"
              alt="develOP"
              fill
              sizes="56px"
              className="object-contain p-2"
              priority
            />
          </div>

          <div className="hidden min-w-0 pt-1 sm:block">
            <div className="flex flex-col items-start gap-2">
              <span className="truncate text-xl font-semibold tracking-[0.08em] text-white">develOP</span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.26em] uppercase"
                style={{
                  background: 'rgba(6,182,212,0.12)',
                  border: '1px solid rgba(6,182,212,0.24)',
                  color: 'rgb(103,232,249)',
                }}
              >
                ADMIN
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-zinc-500">
              Control room multi-tenant para clientes, soporte y operación.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden px-5 pt-4 sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Navegacion</p>
      </div>

      <ul className="flex flex-1 flex-col gap-1 px-2 py-4 sm:px-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact, badgeKey }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          const badgeCount =
            badgeKey === 'messages'
              ? unreadMessages
              : badgeKey === 'leads'
                ? unreadLeads
                : badgeKey === 'tickets'
                  ? openTickets
                  : 0

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-r-2xl border-l-2 px-3 py-3 text-sm transition-all duration-150 sm:px-4',
                  isActive
                    ? 'border-cyan-400 bg-cyan-400/10 font-medium text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
                    : 'border-transparent text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200'
                )}
              >
                <Icon size={16} className={isActive ? 'text-cyan-300' : ''} />
                <span className="hidden flex-1 sm:block">{label}</span>
                {badgeCount > 0 && (
                  <span className="absolute right-2 top-2 flex min-w-[1.125rem] items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-semibold leading-[1.125rem] text-zinc-950 sm:static">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mx-2 mb-4 hidden rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-4 sm:mx-4 sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Sistema</p>
        <p className="mt-2 text-sm text-zinc-300">Version 1.0.0</p>
        <p className="mt-1 text-xs text-zinc-500">Powered by develOP</p>
      </div>
    </nav>
  )
}
