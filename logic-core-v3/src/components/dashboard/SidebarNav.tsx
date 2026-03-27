'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, FolderOpen, Zap, MessageSquare, User, BarChart2, TrendingUp, Archive, Headphones, CreditCard, Mail, Users, Lock, MessageCircle, Calendar, Share2, Search, ShoppingCart, Target, Star, X, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  exact: boolean
}

interface VipNavItem extends NavItem {
  featureId: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
  { href: '/dashboard/project', label: 'Mi proyecto', icon: FolderOpen, exact: false },
  { href: '/dashboard/vault', label: 'Bóveda', icon: Archive, exact: false },
  { href: '/dashboard/services', label: 'Mis servicios', icon: Zap, exact: false },
  { href: '/dashboard/messages', label: 'Mensajes', icon: MessageSquare, exact: false },
  { href: '/dashboard/soporte', label: 'Soporte', icon: Headphones, exact: false },
  { href: '/dashboard/facturacion', label: 'Facturación', icon: CreditCard, exact: false },
  { href: '/dashboard/analytics', label: 'Analíticas', icon: BarChart2, exact: false },
  { href: '/dashboard/seo', label: 'SEO', icon: TrendingUp, exact: false },
  { href: '/dashboard/automations', label: 'Automatizaciones', icon: Zap, exact: false },
  { href: '/dashboard/profile', label: 'Mi perfil', icon: User, exact: false },
]

const VIP_ITEMS: VipNavItem[] = [
  { href: '/dashboard/email-automation', label: 'Email Automation', icon: Mail, exact: false, featureId: 'email-automation' },
  { href: '/dashboard/client-portal', label: 'Portal de Clientes', icon: Users, exact: false, featureId: 'client-portal' },
  { href: '/dashboard/whatsapp', label: 'WhatsApp Autopilot', icon: MessageCircle, exact: false, featureId: 'whatsapp-autopilot' },
  { href: '/dashboard/agenda', label: 'Agenda Inteligente', icon: Calendar, exact: false, featureId: 'agenda-inteligente' },
  { href: '/dashboard/social', label: 'Social Media Hub', icon: Share2, exact: false, featureId: 'social-media-hub' },
  { href: '/dashboard/seo-avanzado', label: 'SEO Avanzado', icon: Search, exact: false, featureId: 'seo-avanzado' },
  { href: '/dashboard/ecommerce', label: 'E-commerce', icon: ShoppingCart, exact: false, featureId: 'ecommerce' },
  { href: '/dashboard/pixel', label: 'Recuperación de Ventas', icon: Target, exact: false, featureId: 'pixel-retargeting' },
  { href: '/dashboard/resenias', label: 'Motor de Reseñas', icon: Star, exact: false, featureId: 'motor-resenias' },
  { href: '/dashboard/crm', label: 'Mini-CRM', icon: Users, exact: false, featureId: 'mini-crm' },
  { href: '/dashboard/email-nurturing', label: 'Email Nurturing', icon: Mail, exact: false, featureId: 'email-nurturing' },
]

interface SidebarNavProps {
  companyName: string
  unreadMessages?: number
  unlockedFeatures?: string[]
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
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          const isMessages = href === '/dashboard/messages'

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

        {/* VIP Section separator */}
        <li className="pt-4 pb-2 px-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-600 flex-shrink-0">
              Módulos Premium
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </li>

        {VIP_ITEMS.map(({ href, label, icon: Icon, exact, featureId }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          const isUnlocked = unlockedFeatures.includes(featureId)

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
                    : isUnlocked
                    ? 'text-zinc-400 hover:text-zinc-100'
                    : 'text-zinc-600 hover:text-zinc-400'
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
                  whileHover={isUnlocked ? { x: 2 } : {}}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Icon size={16} className={
                    isActive 
                      ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' 
                      : isUnlocked 
                      ? 'transition-colors duration-200'
                      : 'opacity-50'
                  } />
                </motion.div>

                <span className={`relative z-10 flex-1 tracking-wide ${!isUnlocked ? 'opacity-60' : ''}`}>{label}</span>
                {!isUnlocked && (
                  <span className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    <Lock size={8} className="text-zinc-500" />
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
