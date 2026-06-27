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
import { useReducedMotion } from '@/lib/use-reduced-motion'

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

/** Módulos premium: se renderizan como items NORMALES de la sección "Servicios"
 *  (mismo markup que el resto, vía el render de NavItem). Lo único propio por módulo
 *  es el ícono y el label; tamaño, color, highlight cyan activo, hover e indentación
 *  (cero) se heredan. Orden fijo. */
const PREMIUM_MODULES: { slug: string; item: NavItem }[] = [
  { slug: 'motor-resenas', item: { href: '/dashboard/modules/motor-resenas', label: 'Motor de reseñas', icon: Star } },
  { slug: 'email-marketing', item: { href: '/dashboard/modules/email-marketing', label: 'Email marketing', icon: Mail } },
  { slug: 'tienda-conectada', item: { href: '/dashboard/modules/tienda-conectada', label: 'Tienda online', icon: ShoppingBag } },
  { slug: 'agenda-inteligente', item: { href: '/dashboard/modules/agenda-inteligente', label: 'Agenda inteligente', icon: CalendarDays } },
]

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
  const reduced = useReducedMotion()
  // Módulos premium activos, como items de "Servicios" (orden fijo de PREMIUM_MODULES).
  const premiumItems: NavItem[] = PREMIUM_MODULES.filter(({ slug }) =>
    activeModuleSlugs.includes(slug)
  ).map(({ item }) => item)

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

              {[...section.items, ...(section.label === 'Servicios' ? premiumItems : [])].map((item) => {
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
                      className={`group relative z-10 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 motion-reduce:transition-none ${
                        isActive
                          ? 'text-cyan-400'
                          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                      }`}
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.5}
                        className={`relative z-10 shrink-0 transition-transform motion-reduce:transition-none ${
                          reduced ? '' : 'group-hover:scale-105'
                        }`}
                      />
                      <span className="relative z-10 flex-1 font-medium">{label}</span>

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
        </div>
      </div>
    </nav>
  )
}
