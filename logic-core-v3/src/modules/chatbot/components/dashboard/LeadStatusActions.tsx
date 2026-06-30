'use client'

// P1.B — Acciones de UN TAP sobre un lead, en lenguaje de dueño ("Lo contacté",
// "Vendido", "No avanzó"). Componente ÚNICO compartido por la lista
// (BusinessLeadCard) y el detalle (LeadDetail) — no duplicar la lógica de tap.
//
// Fricción cero para el dueño no técnico: un tap aplica el cambio con feedback
// optimista (el botón refleja el estado al instante) y un "Deshacer" inmediato
// en el toast por si se equivocó de botón. El primer contacto se sella en el
// server action (ver lead-status-rules.ts) y deshacer NO lo borra.

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PhoneCall, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { updateLeadStatus } from '@/modules/chatbot/server/admin/updateLeadStatus'
import { OWNER_ACTION_STATUS, type OwnerLeadAction } from '@/modules/chatbot/lead-status-rules'
import type { ChatbotLeadStatus } from '@prisma/client'

interface LeadStatusActionsProps {
  leadId: string
  /** Estado actual del lead (controlado por el padre para sincronizar el badge). */
  status: ChatbotLeadStatus
  /** El padre actualiza su propio estado optimista (badge, Select) al cambiar. */
  onStatusChange?: (next: ChatbotLeadStatus) => void
  size?: 'sm' | 'md'
  className?: string
}

interface ActionMeta {
  action: OwnerLeadAction
  label: string
  /** Confirmación del toast tras aplicar. */
  done: string
  icon: LucideIcon
  /** Clases del botón cuando ESTE es el estado actual del lead. */
  activeClass: string
}

// "No avanzó" (LOST) va en gris neutro, NO en rojo: no es un error ni algo malo,
// es un desenlace normal del seguimiento. Rojo se reserva para problemas.
const ACTIONS: ActionMeta[] = [
  {
    action: 'contacted',
    label: 'Lo contacté',
    done: 'Lo marcaste como contactado',
    icon: PhoneCall,
    activeClass: 'border-sky-400/40 bg-sky-400/15 text-sky-200 hover:bg-sky-400/20',
  },
  {
    action: 'sold',
    label: 'Vendido',
    done: 'Lo marcaste como vendido',
    icon: CheckCircle2,
    activeClass: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/20',
  },
  {
    action: 'no_progress',
    label: 'No avanzó',
    done: 'Lo marcaste como que no avanzó',
    icon: XCircle,
    activeClass: 'border-zinc-500/40 bg-zinc-500/20 text-zinc-200 hover:bg-zinc-500/25',
  },
]

export function LeadStatusActions({
  leadId,
  status,
  onStatusChange,
  size = 'sm',
  className,
}: LeadStatusActionsProps) {
  const [current, setCurrent] = useState<ChatbotLeadStatus>(status)
  const [pendingAction, setPendingAction] = useState<OwnerLeadAction | null>(null)
  const [isPending, startTransition] = useTransition()

  function applyStatus(
    next: ChatbotLeadStatus,
    action: OwnerLeadAction | null,
    opts: { isUndo: boolean; done?: string },
  ) {
    const previous = current
    if (next === previous) return

    // Optimista: el botón/badge reflejan el cambio antes de que vuelva el server.
    setCurrent(next)
    onStatusChange?.(next)
    setPendingAction(action)

    startTransition(async () => {
      const res = await updateLeadStatus({ leadId, status: next })
      setPendingAction(null)

      if (!res.ok) {
        // Revertir el optimismo si el server rechazó (sesión, ownership, etc.).
        setCurrent(previous)
        onStatusChange?.(previous)
        toast.error(res.error ?? 'No se pudo guardar el cambio')
        return
      }

      if (opts.isUndo) {
        toast.success('Lo dejamos como estaba')
        return
      }

      toast.success(opts.done ?? 'Listo', {
        action: {
          label: 'Deshacer',
          onClick: () => applyStatus(previous, null, { isUndo: true }),
        },
      })
    })
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {ACTIONS.map(({ action, label, done, icon: Icon, activeClass }) => {
        const targetStatus = OWNER_ACTION_STATUS[action]
        const isActive = current === targetStatus
        const isThisPending = isPending && pendingAction === action
        return (
          <Button
            key={action}
            type="button"
            variant="secondary"
            size={size}
            loading={isThisPending}
            disabled={isPending}
            aria-pressed={isActive}
            icon={<Icon className="h-4 w-4" strokeWidth={1.5} />}
            onClick={(e) => {
              // En la lista la card es un Link-overlay: no navegar al tocar acción.
              e.stopPropagation()
              applyStatus(targetStatus, action, { isUndo: false, done })
            }}
            className={cn('min-h-[44px]', isActive && activeClass)}
          >
            {label}
          </Button>
        )
      })}
    </div>
  )
}
