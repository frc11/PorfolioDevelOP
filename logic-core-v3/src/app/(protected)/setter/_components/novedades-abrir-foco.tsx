'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { anclarFoco } from '../_actions/foco.actions'

/**
 * A-06 — "Abrir" desde una novedad ANCLA el lead como foco y abre su detalle,
 * exactamente como "Ir a trabajarlo" (`FocoSurface#irATrabajar`): el MISMO
 * mecanismo del foco, no una segunda cola. Al volver al home, ese lead ES el foco
 * (si sigue accionable; si no, `seleccionarFoco` ignora el sticky sin romper
 * nada). No transiciona stages ni inventa prioridad — solo ancla el sticky
 * (`foco.actions`) y navega. Vive aparte del panel (server) porque necesita
 * transición/router del cliente.
 */
export function AbrirFocoButton({ leadId, className }: { leadId: string; className?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const abrir = () => {
    startTransition(async () => {
      const result = await anclarFoco(leadId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.push(`/setter/leads/${leadId}`)
    })
  }

  return (
    <button
      type="button"
      onClick={abrir}
      disabled={isPending}
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 outline-none transition-colors hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-50',
        className,
      )}
    >
      Abrir
      <ArrowRight size={11} strokeWidth={1.5} aria-hidden />
    </button>
  )
}
