'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderKanban, Zap, MessageSquare, TrendingUp, LifeBuoy, X, Settings, Star, Mail, ShoppingBag, CalendarDays, Bot, Gauge } from 'lucide-react'
import { motion } from 'motion/react'
import { BrandMark } from '@/components/brand/BrandMark'

const NAV_ITEMS = [
  { href: '/dashboard',              label: 'Inicio',         icon: Home, exact: true },
  { href: '/dashboard/project',      label: 'Mi proyecto',    icon: FolderKanban },
  { href: '/dashboard/resultados',   label: 'Resultados',     icon: TrendingUp },
  { href: '/dashboard/services',     label: 'Mis servicios',  icon: Zap },
  { href: '/dashboard/plan',         label: 'Mi plan',        icon: Gauge },
  { href: '/dashboard/chatbot',      label: 'Mi Chatbot',     icon: Bot, badge: 'hotLeads' },
  { href: '/dashboard/messages',     label: 'Mensajes',       icon: MessageSquare, badge: 'unreadMessages' },
  { href: '/dashboard/soporte',      label: 'Soporte',        icon: LifeBuoy },
  { href: '/dashboard/cuenta',       label: 'Mi cuenta',      icon: Settings },
] as const

interface SidebarNavProps {
  companyName: string
  unreadMessages?: number
  hotLeadsCount?: number
  activeModuleSlugs?: string[]
  showCloseButton?: boolean
  onClose?: () => void
}

export function SidebarNav({
  companyName,
  unreadMessages = 0,
  hotLeadsCount = 0,
  activeModuleSlugs = [],
  showCloseButton = false,
  onClose,
}: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="relative flex h-full w-60 flex-shrink-0 flex-col border-r border-white/5 bg-[#040506]">
      {/* Subtle Noise Texture on Sidebar */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* Brand — develOP */}
      <div className="relative z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-white/5 px-5">
        <BrandMark href="/dashboard" size="sm" />
        {showCloseButton && (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <ul className="relative z-10 flex flex-1 flex-col gap-1.5 p-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {NAV_ITEMS.map((item) => {
          const { href, label, icon: Icon } = item
          const isExact = 'exact' in item ? item.exact : false
          const isActive = isExact ? pathname === href : pathname.startsWith(href)
          const isMessages = 'badge' in item && item.badge === 'unreadMessages'
          const isHotLeads = 'badge' in item && item.badge === 'hotLeads'

          return (
            <li key={href} className="relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-md bg-cyan-500/10 shadow-[inset_2px_0_0_0_rgba(6,182,212,1)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                />
              )}
              <Link
                href={href}
                className={`group relative z-10 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? 'font-medium text-cyan-400'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={1.5}
                  className="relative z-10 shrink-0"
                />

                <span className="relative z-10 flex-1">{label}</span>

                {isMessages && unreadMessages > 0 && (
                  <span className="relative z-10 flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-bold text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
                {isHotLeads && hotLeadsCount > 0 && (
                  <span
                    className="relative z-10 inline-flex"
                    aria-label={`${hotLeadsCount} contacto${hotLeadsCount === 1 ? '' : 's'} caliente${hotLeadsCount === 1 ? '' : 's'} sin contactar`}
                  >
                    <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/40" />
                    <span className="relative flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                      {hotLeadsCount > 99 ? '99+' : hotLeadsCount}
                    </span>
                  </span>
                )}
              </Link>
            </li>
          )
        })}

        {/* Premium modules — identidad por servicio (cyan / violet / emerald / amber) */}
        {activeModuleSlugs.includes('motor-resenas') && (() => {
          const href = '/dashboard/modules/motor-resenas'
          const isActive = pathname.startsWith(href)
          return (
            <li className="relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-md bg-amber-500/10 shadow-[inset_2px_0_0_0_rgba(245,158,11,1)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                />
              )}
              <Link
                href={href}
                className={`group relative z-10 flex items-center gap-3 rounded-md py-2 pl-6 pr-3 text-sm transition-colors duration-200 ${
                  isActive ? 'font-medium text-amber-400' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <Star size={14} strokeWidth={1.5} className="relative z-10 shrink-0" />
                <span className="relative z-10 flex-1 text-xs">Motor de reseñas</span>
              </Link>
            </li>
          )
        })()}

        {activeModuleSlugs.includes('email-marketing') && (() => {
          const href = '/dashboard/modules/email-marketing'
          const isActive = pathname.startsWith(href)
          return (
            <li className="relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-md bg-cyan-500/10 shadow-[inset_2px_0_0_0_rgba(6,182,212,1)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                />
              )}
              <Link
                href={href}
                className={`group relative z-10 flex items-center gap-3 rounded-md py-2 pl-6 pr-3 text-sm transition-colors duration-200 ${
                  isActive ? 'font-medium text-cyan-400' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <Mail size={14} strokeWidth={1.5} className="relative z-10 shrink-0" />
                <span className="relative z-10 flex-1 text-xs">Email marketing</span>
              </Link>
            </li>
          )
        })()}

        {activeModuleSlugs.includes('tienda-conectada') && (() => {
          const href = '/dashboard/modules/tienda-conectada'
          const isActive = pathname.startsWith(href)
          return (
            <li className="relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-md bg-violet-500/10 shadow-[inset_2px_0_0_0_rgba(139,92,246,1)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                />
              )}
              <Link
                href={href}
                className={`group relative z-10 flex items-center gap-3 rounded-md py-2 pl-6 pr-3 text-sm transition-colors duration-200 ${
                  isActive ? 'font-medium text-violet-400' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <ShoppingBag size={14} strokeWidth={1.5} className="relative z-10 shrink-0" />
                <span className="relative z-10 flex-1 text-xs">Tienda online</span>
              </Link>
            </li>
          )
        })()}
        {activeModuleSlugs.includes('agenda-inteligente') && (() => {
          const href = '/dashboard/modules/agenda-inteligente'
          const isActive = pathname.startsWith(href)
          return (
            <li className="relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-md bg-emerald-500/10 shadow-[inset_2px_0_0_0_rgba(16,185,129,1)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                />
              )}
              <Link
                href={href}
                className={`group relative z-10 flex items-center gap-3 rounded-md py-2 pl-6 pr-3 text-sm transition-colors duration-200 ${
                  isActive ? 'font-medium text-emerald-400' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <CalendarDays size={14} strokeWidth={1.5} className="relative z-10 shrink-0" />
                <span className="relative z-10 flex-1 text-xs">Agenda inteligente</span>
              </Link>
            </li>
          )
        })()}
      </ul>
    </nav>
  )
}
