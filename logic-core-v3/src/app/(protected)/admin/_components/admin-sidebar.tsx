'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import {
  Building2,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
  MessageCircle,
  Settings,
  History,
  UserCog,
  Users,
  Bot,
  BookOpen,
  AlertTriangle,
  Palette,
} from 'lucide-react'
import { useReducedMotion } from '@/lib/use-reduced-motion'

type AdminSidebarProps = {
  userName: string
  userRole: string
  pendingAlerts?: number
  onNavigate?: () => void
}

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  badgeKey?: 'pendingAlerts'
}

type NavSection = {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'OPERACIONES',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/leads', label: 'Leads', icon: Users },
      { href: '/admin/projects', label: 'Proyectos', icon: FolderKanban },
      { href: '/admin/team', label: 'Equipo', icon: UserCog },
    ],
  },
  {
    label: 'CLIENTES',
    items: [
      { href: '/admin/clients', label: 'Clientes', icon: Building2 },
      { href: '/admin/tickets', label: 'Tickets', icon: LifeBuoy },
      { href: '/admin/messages', label: 'Mensajes', icon: MessageCircle },
    ],
  },
  {
    label: 'INTELIGENCIA',
    items: [
      { href: '/admin/chatbot/activity', label: 'Global Activity', icon: Bot },
      { href: '/admin/chatbot/health', label: 'Health Score', icon: BookOpen },
      { href: '/admin/alerts', label: 'Alerts', icon: AlertTriangle, badgeKey: 'pendingAlerts' },
    ],
  },
  {
    label: 'CONFIG',
    items: [
      { href: '/admin/settings', label: 'Configuraci\u00f3n', icon: Settings },
      { href: '/admin/audit-log', label: 'Audit log', icon: History },
      { href: '/admin/_design', label: 'Design System', icon: Palette },
    ],
  },
]

export function AdminSidebar({
  userName,
  userRole,
  pendingAlerts = 0,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const badges = { pendingAlerts }

  return (
    <div className="flex h-full w-[240px] flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/admin" className="group block">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={reduced ? undefined : { rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-sm font-semibold tracking-[0.16em] text-cyan-200 shadow-[0_0_28px_rgba(6,182,212,0.18)]"
            >
              dO
            </motion.div>
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
                  item.href === '/admin'
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)

                const Icon = item.icon
                const badgeValue = item.badgeKey ? badges[item.badgeKey] : 0

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={[
                      'group relative flex items-center gap-3 rounded-r-2xl border-l-2 px-4 py-3 text-sm transition-colors duration-200 motion-reduce:transition-none',
                      isActive
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-100'
                        : 'border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute left-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300 transition-opacity motion-reduce:transition-none',
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                      ].join(' ')}
                    />
                    <Icon
                      className={[
                        'h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none',
                        reduced ? '' : 'group-hover:scale-110',
                      ].join(' ')}
                      strokeWidth={1.5}
                    />
                    <span>{item.label}</span>
                    {badgeValue > 0 && (
                      <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full border border-red-400/30 bg-red-500/20 px-1.5 py-0.5 text-[10px] font-medium text-red-300">
                        {badgeValue > 99 ? '99+' : badgeValue}
                      </span>
                    )}
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
    </div>
  )
}
