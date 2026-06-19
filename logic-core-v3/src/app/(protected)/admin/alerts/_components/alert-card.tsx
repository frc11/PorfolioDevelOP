'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { AlertTriangle, CheckCircle, ExternalLink, Eye } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import type { AlertRow } from './alert-types'

interface AlertCardProps {
  alert: AlertRow
  pendingAction: string | null
  onAck: (id: string) => void
  onResolve: (id: string) => void
}

const HOVER_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

export function AlertCard({ alert, pendingAction, onAck, onResolve }: AlertCardProps) {
  const reduced = useReducedMotion()

  return (
    // Hover POR card (mismo visual que las stat cards: scale 1.015 + shadow + ring).
    // El scale va por whileHover (Framer) y no por CSS: la card es motion.div con
    // `layout`, y un `hover:scale` CSS sería pisado por el transform inline de Framer.
    // `relative z-0 hover:z-30` la sube sobre el gradiente de difuminado (z-10) y sobre
    // las columnas vecinas → no se recorta en ningún costado (las columnas no clippean).
    <motion.div
      layout
      whileHover={reduced ? undefined : { scale: 1.015 }}
      transition={{ duration: 0.2, ease: HOVER_EASE }}
      className={cn(
        'relative z-0 rounded-2xl border border-white/10 bg-white/[0.02] p-3',
        'transition-shadow duration-200 hover:z-30 hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15',
        'motion-reduce:transition-none motion-reduce:hover:shadow-none',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <SeverityBadge severity={alert.severity} />
        <span className="text-[10px] text-zinc-600 shrink-0">
          {new Date(alert.createdAt).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </span>
      </div>

      <p className="mb-1 line-clamp-2 text-sm text-zinc-200">{alert.title}</p>
      <p className="mb-3 line-clamp-2 text-xs text-zinc-500">{alert.description}</p>

      <div className="flex items-center justify-between gap-2">
        {/* Nav in-app (mismo patrón que chatbots/page.tsx: <Link><Button/>); el admin
            navega con <Link> + PageTransition, NO con router.push ni triggerTransition
            (eso es del sitio público). Reusa el Button del sistema, no lo modifica. */}
        <Link href={`/admin/chatbots/${alert.botConfig.id}?tab=overview`}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300"
          >
            Ver bot
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
          </Button>
        </Link>

        <div className="flex gap-1.5">
          {alert.status === 'PENDING' && (
            <Button
              type="button"
              onClick={() => onAck(alert.id)}
              variant="secondary"
              size="sm"
              loading={pendingAction === `${alert.id}:ack`}
              icon={<Eye className="h-3 w-3" strokeWidth={1.5} />}
            >
              Visto
            </Button>
          )}
          {(alert.status === 'PENDING' || alert.status === 'ACKNOWLEDGED') && (
            <Button
              type="button"
              onClick={() => onResolve(alert.id)}
              variant="secondary"
              size="sm"
              loading={pendingAction === `${alert.id}:resolve`}
              className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
              icon={<CheckCircle className="h-3 w-3" strokeWidth={1.5} />}
            >
              Resolver
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { label: string; color: string }> = {
    CRITICAL: { label: 'Crítica', color: 'text-red-300 bg-red-500/15 border-red-400/30' },
    HIGH: { label: 'Alta', color: 'text-orange-300 bg-orange-500/15 border-orange-400/30' },
    WARNING: { label: 'Warning', color: 'text-amber-300 bg-amber-500/15 border-amber-400/30' },
    INFO: { label: 'Info', color: 'text-blue-300 bg-blue-500/15 border-blue-400/30' },
  }
  const { label, color } = config[severity] ?? {
    label: severity,
    color: 'text-zinc-300 bg-zinc-500/15 border-zinc-400/20',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${color}`}
    >
      <AlertTriangle className="h-2.5 w-2.5" strokeWidth={1.5} />
      {label}
    </span>
  )
}
