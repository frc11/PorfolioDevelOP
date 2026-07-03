'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { LayoutDashboard, UserPlus, type LucideIcon } from 'lucide-react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { useTransitionContext } from '@/context/TransitionContext'
import { ToolsRail } from './tools-rail'

type SetterNavProps = {
  /** Cierra el drawer mobile tras navegar (lo provee `SetterShell`). */
  onNavigate?: () => void
}

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

/**
 * Destinos REALES de la zona /setter (B0.2). Solo se listan rutas que existen:
 * hoy el setter tiene un único hub de trabajo, su cartera (`/setter`). El
 * detalle de lead (`/setter/leads/[leadId]`) NO es un destino de barra — se
 * llega clickeando una card y cuelga del mismo hub, por eso el activo se
 * resalta en todo el subárbol `/setter`. Es un array para que sprints
 * posteriores agreguen destinos sin reescribir la barra; NO se inventan rutas.
 */
const NAV_ITEMS: NavItem[] = [
  { href: '/setter', label: 'Cartera', icon: LayoutDashboard },
]

export function SetterNav({ onNavigate }: SetterNavProps) {
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const { triggerTransition } = useTransitionContext()

  // Navegación SOLO por triggerTransition (decisión cerrada · CLAUDE.md). El
  // drawer mobile se cierra siempre, incluso si ya estamos en el destino
  // (triggerTransition es no-op en misma ruta, pero el drawer igual debe cerrar).
  const handleNavigate = (href: string) => {
    triggerTransition(href)
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* Acción primaria persistente: cargar un prospecto propio. Vive fuera de
            NAV_ITEMS (que son hubs con activo por subárbol) porque es una acción,
            no un destino de barra. Clave del B6.3: visible en TODA la zona /setter
            —también con cartera activa—, no solo en el vacío; antes el único acceso
            a /setter/nuevo aparecía en el empty-state. Desde /setter/nuevo se llega
            además a la importación por lista. Navega por triggerTransition como el
            resto del rail (decisión cerrada · CLAUDE.md); cierra el drawer mobile. */}
        <button
          type="button"
          onClick={() => handleNavigate('/setter/nuevo')}
          className="group mb-3 flex w-full items-center gap-2 rounded-md bg-cyan-400/15 px-3 py-2.5 text-sm font-medium text-cyan-300 transition-colors duration-200 hover:bg-cyan-400/25 motion-reduce:transition-none"
        >
          <UserPlus
            className={[
              'h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none',
              reduced ? '' : 'group-hover:scale-105',
            ].join(' ')}
            strokeWidth={1.5}
          />
          <span>Cargar prospecto</span>
        </button>

        <nav aria-label="Navegación del setter" className="space-y-1">
          <div className="px-3 pb-1 pt-3">
            <p className="text-[11px] font-medium tracking-tight text-zinc-500">
              Trabajo
            </p>
          </div>

          {NAV_ITEMS.map((item) => {
            // Subárbol completo: la cartera queda activa también en el detalle
            // de lead, que es su drill-down. `startsWith` cubre `/setter/...`.
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            const Icon = item.icon

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavigate(item.href)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors duration-200 motion-reduce:transition-none',
                  isActive
                    ? 'text-cyan-400'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100',
                ].join(' ')}
              >
                {isActive && (
                  <motion.div
                    layoutId="setter-sidebar-active-pill"
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
              </button>
            )
          })}
        </nav>

        {/* Accesos a las herramientas externas del flujo (links externos, NO
            rutas → no usan triggerTransition). Persistente en toda la zona. */}
        <div className="mt-6 border-t border-white/[0.06] pt-4">
          <ToolsRail onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  )
}
