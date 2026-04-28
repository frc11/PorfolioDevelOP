'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, CreditCard, ShieldCheck } from 'lucide-react'

const TABS = [
  { href: '/dashboard/cuenta/perfil',     label: 'Perfil',      icon: User },
  { href: '/dashboard/cuenta/facturacion',label: 'Facturación', icon: CreditCard },
  { href: '/dashboard/cuenta/boveda',     label: 'Bóveda',      icon: ShieldCheck },
] as const

export function CuentaTabs() {
  const pathname = usePathname()

  return (
    <div className="border-b border-white/10">
      <nav className="flex gap-1">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (pathname === '/dashboard/cuenta' && href === '/dashboard/cuenta/perfil')

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={15} />
              {label}
              {isActive && (
                <motion.div
                  layoutId="cuenta-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
