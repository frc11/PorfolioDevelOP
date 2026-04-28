'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, FolderKanban, Zap, MessageSquare, BarChart3, TrendingUp, LifeBuoy, X, Settings, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/dashboard',              label: 'Inicio',         icon: Home, exact: true },
  { href: '/dashboard/project',      label: 'Mi proyecto',    icon: FolderKanban },
  { href: '/dashboard/resultados',   label: 'Resultados',     icon: TrendingUp },
  { href: '/dashboard/services',     label: 'Mis servicios',  icon: Zap },
  { href: '/dashboard/messages',     label: 'Mensajes',       icon: MessageSquare, badge: 'unreadMessages' },
  { href: '/dashboard/soporte',      label: 'Soporte',        icon: LifeBuoy },
  { href: '/dashboard/cuenta',       label: 'Mi cuenta',      icon: Settings },
] as const

interface SidebarNavProps {
  companyName: string
  unreadMessages?: number
  unlockedFeatures?: string[] // Kept for compatibility if passed
  showCloseButton?: boolean
  onClose?: () => void
}

export function SidebarNav({
  companyName,
  unreadMessages = 0,
  unlockedFeatures = [],
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

      {/* Brand — develOP logo */}
      <div className="relative z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-white/5 px-5">
        <Image
          src="/logodevelOP.svg"
          alt="develOP"
          width={96}
          height={26}
          className="opacity-90"
          style={{ filter: 'brightness(0) invert(1)' }}
          priority
        />
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

          return (
            <li key={href} className="relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-cyan-500/10 rounded-lg shadow-[inset_2px_0_0_0_rgba(6,182,212,1),0_0_15px_rgba(6,182,212,0.15)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Link
                href={href}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 z-10 ${
                  isActive
                    ? 'font-bold text-cyan-400'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {/* Hover Background Gradient */}
                {!isActive && (
                  <motion.div 
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    initial={false}
                  />
                )}

                <motion.div
                  className="relative z-10"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Icon 
                    size={16} 
                    className={isActive ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'transition-colors duration-200'} 
                  />
                </motion.div>
                
                <span className="relative z-10 flex-1 tracking-wide">{label}</span>
                
                {isMessages && unreadMessages > 0 && (
                  <span className="relative z-10 flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-bold text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Footer branding */}
      <div className="relative z-10 border-t border-white/5 px-6 py-4 bg-gradient-to-t from-black/20 to-transparent">
        <span className="text-xs font-medium text-zinc-600">
          Powered by{' '}
          <span className="text-zinc-400 font-bold tracking-tight">devel<span className="text-cyan-500">OP</span></span>
        </span>
      </div>
    </nav>
  )
}
