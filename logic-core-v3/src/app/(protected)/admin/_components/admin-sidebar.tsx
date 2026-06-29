'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import {
  Building2,
  ClipboardCheck,
  Flame,
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { BrandMark } from '@/components/brand/BrandMark'

type BadgeKey = 'pendingAlerts' | 'revisionPendientes'
type HotKey = 'revisionCalientes'

type AdminSidebarProps = {
  userName: string
  userRole: string
  pendingAlerts?: number
  /** B-beta: demos esperando veredicto (badge de "Revisión demos"). */
  revisionPendientes?: number
  /** B-beta: cuántas de esas son calientes (flama ámbar sobre el badge). */
  revisionCalientes?: number
  onNavigate?: () => void
}

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  badgeKey?: BadgeKey
  /** Marca "hay calientes": flama ámbar sobre el badge numérico de revisión. */
  hotKey?: HotKey
}

type NavSection = {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Operaciones',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/chatbots', label: 'Chatbots', icon: Bot },
      { href: '/admin/leads', label: 'Leads', icon: Users },
      {
        href: '/admin/leados',
        label: 'Revisión demos',
        icon: ClipboardCheck,
        badgeKey: 'revisionPendientes',
        hotKey: 'revisionCalientes',
      },
      { href: '/admin/projects', label: 'Proyectos', icon: FolderKanban },
      { href: '/admin/team', label: 'Equipo', icon: UserCog },
    ],
  },
  {
    label: 'Clientes',
    items: [
      { href: '/admin/clients', label: 'Clientes', icon: Building2 },
      { href: '/admin/tickets', label: 'Tickets', icon: LifeBuoy },
      { href: '/admin/messages', label: 'Mensajes', icon: MessageCircle },
    ],
  },
  {
    label: 'Inteligencia',
    items: [
      { href: '/admin/chatbot/activity', label: 'Actividad global', icon: Bot },
      { href: '/admin/chatbot/health', label: 'Health score', icon: BookOpen },
      { href: '/admin/alerts', label: 'Alertas', icon: AlertTriangle, badgeKey: 'pendingAlerts' },
    ],
  },
  {
    label: 'Configuraci\u00f3n',
    items: [
      { href: '/admin/settings', label: 'Configuraci\u00f3n', icon: Settings },
      { href: '/admin/audit-log', label: 'Audit log', icon: History },
    ],
  },
]

export function AdminSidebar({
  userName,
  userRole,
  pendingAlerts = 0,
  revisionPendientes = 0,
  revisionCalientes = 0,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const badges: Record<BadgeKey, number> = { pendingAlerts, revisionPendientes }
  const hots: Record<HotKey, number> = { revisionCalientes }

  return (
    <div className="flex h-full w-[240px] flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-5">
        <BrandMark href="/admin" tagline="Admin" onClick={onNavigate} />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1">
              <div className="px-3 pb-1 pt-3">
                <p className="text-[11px] font-medium tracking-tight text-zinc-500">
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
                const hotValue = item.hotKey ? hots[item.hotKey] : 0
                const isRevision = item.badgeKey === 'revisionPendientes'

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={[
                      'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 motion-reduce:transition-none',
                      isActive
                        ? 'text-cyan-400'
                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100',
                    ].join(' ')}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-md bg-cyan-500/10 shadow-[inset_2px_0_0_0_rgba(6,182,212,1)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                      />
                    )}
                    <Icon
                      className={[
                        'relative h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none',
                        reduced ? '' : 'group-hover:scale-105',
                      ].join(' ')}
                      strokeWidth={1.5}
                    />
                    <span className="relative font-medium">{item.label}</span>
                    {badgeValue > 0 && (
                      <span
                        className={cn(
                          'relative ml-auto inline-flex min-w-[20px] items-center justify-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium',
                          !isRevision
                            ? 'border-red-400/30 bg-red-500/20 text-red-300'
                            : hotValue > 0
                              ? 'border-amber-400/40 bg-amber-500/20 text-amber-200'
                              : 'border-cyan-400/30 bg-cyan-500/15 text-cyan-200',
                        )}
                        aria-label={
                          isRevision
                            ? `${badgeValue} ${badgeValue === 1 ? 'demo' : 'demos'} en revisión${
                                hotValue > 0
                                  ? `, ${hotValue} ${hotValue === 1 ? 'caliente' : 'calientes'}`
                                  : ''
                              }`
                            : `${badgeValue} pendientes`
                        }
                      >
                        {isRevision && hotValue > 0 && (
                          <Flame className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden />
                        )}
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
        <div className="rounded-md border border-white/10 bg-black/20 px-4 py-3">
          <p className="truncate text-sm font-medium text-zinc-100">{userName}</p>
          <p className="mt-1 text-[11px] tracking-tight text-zinc-500">{userRole}</p>
        </div>
      </div>
    </div>
  )
}
