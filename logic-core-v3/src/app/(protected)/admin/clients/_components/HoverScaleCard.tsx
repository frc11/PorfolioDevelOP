'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Wrapper de hover LOCAL al worktree de clientes.
 *
 * Replica 1:1 el patrón de hover de `ActivityLog` (módulo chatbot):
 *   - scale 1.015 con easing estándar [0.25, 0.46, 0.45, 0.94] y 200ms
 *   - ring + shadow sutiles vía Tailwind (`hover:ring-1 hover:ring-white/15`)
 *   - gateado por reduced-motion (el scale no dispara; la shadow se anula)
 *
 * NO importa ni edita `ActivityLog` ni `StatCard`. La unificación a un componente
 * compartido queda para post-merge — por ahora cada hover del worktree usa este
 * wrapper para quedar idéntico.
 *
 * El `rounded-2xl` por defecto se puede pisar pasando otro radio en `className`
 * (resuelto por tailwind-merge) para que el ring matchee el radio de la card interna.
 */

const HOVER_EASE = [0.25, 0.46, 0.45, 0.94] as const

const HOVER_DECORATION =
  'hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:hover:shadow-none'

interface HoverScaleCardProps {
  children: ReactNode
  className?: string
}

export function HoverScaleCard({ children, className }: HoverScaleCardProps) {
  const reduce = Boolean(useReducedMotion())

  return (
    <motion.div
      whileHover={
        reduce
          ? undefined
          : { scale: 1.015, transition: { duration: 0.2, ease: HOVER_EASE } }
      }
      className={cn('rounded-2xl', HOVER_DECORATION, className)}
    >
      {children}
    </motion.div>
  )
}

/**
 * Variante "color-only" (pedido 3): sin transform, sólo color/border vía Tailwind.
 * Para hovers densos donde un scale sería excesivo (filas de datos, ítems compactos).
 * Es una clase pura — no necesita gate JS porque `transition-colors` es inocuo bajo
 * reduced-motion. Componer con la card existente.
 */
export const hoverTint =
  'transition-colors hover:border-white/20 hover:bg-white/[0.05]'
