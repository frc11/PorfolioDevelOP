'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  FolderKanban,
  Zap,
  MessageSquare,
  TrendingUp,
  LifeBuoy,
  Settings,
  Star,
  Mail,
  ShoppingBag,
  CalendarDays,
  Bot,
  Gauge,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'motion/react'
import { BrandMark } from '@/components/brand/BrandMark'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
  badge?: 'unreadMessages' | 'hotLeads'
}

type NavSection = {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'General',
    items: [
      { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
      { href: '/dashboard/project', label: 'Mi proyecto', icon: FolderKanban },
      { href: '/dashboard/resultados', label: 'Resultados', icon: TrendingUp },
    ],
  },
  {
    label: 'Servicios',
    items: [
      { href: '/dashboard/services', label: 'Mis servicios', icon: Zap },
      { href: '/dashboard/chatbot', label: 'Mi Chatbot', icon: Bot, badge: 'hotLeads' },
    ],
  },
  {
    label: 'Comunicación',
    items: [
      { href: '/dashboard/messages', label: 'Mensajes', icon: MessageSquare, badge: 'unreadMessages' },
      { href: '/dashboard/soporte', label: 'Soporte', icon: LifeBuoy },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { href: '/dashboard/plan', label: 'Mi plan', icon: Gauge },
      { href: '/dashboard/cuenta', label: 'Mi cuenta', icon: Settings },
    ],
  },
]

const PREMIUM_SLUGS = ['motor-resenas', 'email-marketing', 'tienda-conectada', 'agenda-inteligente']

interface SidebarNavProps {
  companyName: string
  unreadMessages?: number
  hotLeadsCount?: number
  activeModuleSlugs?: string[]
  /** Cierra el drawer mobile al navegar (mismo patrón que el admin). */
  onNavigate?: () => void
}

export function SidebarNav({
  unreadMessages = 0,
  hotLeadsCount = 0,
  activeModuleSlugs = [],
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname()
  const hasPremium = activeModuleSlugs.some((slug) => PREMIUM_SLUGS.includes(slug))

  return (
    <nav className="flex h-full w-[240px] flex-shrink-0 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
      {/* Brand — develOP */}
      <div className="flex flex-shrink-0 items-center border-b border-white/10 px-5 py-5">
        <BrandMark href="/dashboard" tagline="Portal" onClick={onNavigate} />
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1">
              <div className="px-3 pb-1 pt-3">
                <p className="text-[11px] font-medium tracking-tight text-zinc-500">
                  {section.label}
                </p>
              </div>

              {section.items.map((item) => {
                const { href, label, icon: Icon } = item
                const isActive = item.exact ? pathname === href : pathname.startsWith(href)
                const isMessages = item.badge === 'unreadMessages'
                const isHotLeads = item.badge === 'hotLeads'

                return (
                  <div key={href} className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-md bg-cyan-500/10 shadow-[inset_2px_0_0_0_rgba(6,182,212,1)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                      />
                    )}
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`group relative z-10 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ${
                        isActive
                          ? 'font-medium text-cyan-400'
                          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.5} className="relative z-10 shrink-0" />
                      <span className="relative z-10 flex-1">{label}</span>

                      {isMessages && unreadMessages > 0 && (
                        <span className="relative z-10 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-bold text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                          {unreadMessages > 99 ? '99+' : unreadMessages}
                        </span>
                      )}
                      {isHotLeads && hotLeadsCount > 0 && (
                        <span
                          className="relative z-10 inline-flex"
                          aria-label={`${hotLeadsCount} contacto${hotLeadsCount === 1 ? '' : 's'} caliente${hotLeadsCount === 1 ? '' : 's'} sin contactar`}
                        >
                          <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/40" />
                          <span className="relative flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                            {hotLeadsCount > 99 ? '99+' : hotLeadsCount}
                          </span>
                        </span>
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Premium modules — identidad por servicio (cyan / violet / emerald / amber).
              Markup, colores, pill e indentación sin cambios; sólo el wrapper pasó a
              <div> y se agregó el cierre de drawer en mobile (onNavigate). */}
          {hasPremium && (
            <div className="space-y-1">
              {activeModuleSlugs.includes('motor-resenas') && (() => {
                const href = '/dashboard/modules/motor-resenas'
                const isActive = pathname.startsWith(href)
                return (
                  <div className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-md bg-amber-500/10 shadow-[inset_2px_0_0_0_rgba(245,158,11,1)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                      />
                    )}
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`group relative z-10 flex items-center gap-3 rounded-md py-2 pl-6 pr-3 text-sm transition-colors duration-200 ${
                        isActive ? 'font-medium text-amber-400' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                      }`}
                    >
                      <Star size={14} strokeWidth={1.5} className="relative z-10 shrink-0" />
                      <span className="relative z-10 flex-1 text-xs">Motor de reseñas</span>
                    </Link>
                  </div>
                )
              })()}

              {activeModuleSlugs.includes('email-marketing') && (() => {
                const href = '/dashboard/modules/email-marketing'
                const isActive = pathname.startsWith(href)
                return (
                  <div className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-md bg-cyan-500/10 shadow-[inset_2px_0_0_0_rgba(6,182,212,1)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                      />
                    )}
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`group relative z-10 flex items-center gap-3 rounded-md py-2 pl-6 pr-3 text-sm transition-colors duration-200 ${
                        isActive ? 'font-medium text-cyan-400' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                      }`}
                    >
                      <Mail size={14} strokeWidth={1.5} className="relative z-10 shrink-0" />
                      <span className="relative z-10 flex-1 text-xs">Email marketing</span>
                    </Link>
                  </div>
                )
              })()}

              {activeModuleSlugs.includes('tienda-conectada') && (() => {
                const href = '/dashboard/modules/tienda-conectada'
                const isActive = pathname.startsWith(href)
                return (
                  <div className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-md bg-violet-500/10 shadow-[inset_2px_0_0_0_rgba(139,92,246,1)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                      />
                    )}
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`group relative z-10 flex items-center gap-3 rounded-md py-2 pl-6 pr-3 text-sm transition-colors duration-200 ${
                        isActive ? 'font-medium text-violet-400' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                      }`}
                    >
                      <ShoppingBag size={14} strokeWidth={1.5} className="relative z-10 shrink-0" />
                      <span className="relative z-10 flex-1 text-xs">Tienda online</span>
                    </Link>
                  </div>
                )
              })()}

              {activeModuleSlugs.includes('agenda-inteligente') && (() => {
                const href = '/dashboard/modules/agenda-inteligente'
                const isActive = pathname.startsWith(href)
                return (
                  <div className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 rounded-md bg-emerald-500/10 shadow-[inset_2px_0_0_0_rgba(16,185,129,1)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                      />
                    )}
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`group relative z-10 flex items-center gap-3 rounded-md py-2 pl-6 pr-3 text-sm transition-colors duration-200 ${
                        isActive ? 'font-medium text-emerald-400' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                      }`}
                    >
                      <CalendarDays size={14} strokeWidth={1.5} className="relative z-10 shrink-0" />
                      <span className="relative z-10 flex-1 text-xs">Agenda inteligente</span>
                    </Link>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
