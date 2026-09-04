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
 *
 * P23 — `anclar` es false cuando la ORDEN del aviso ya caducó. Abrir sigue
 * abriendo (el setter quiere ver el negocio del que le hablan), pero un aviso
 * viejo no puede reordenar el día: anclar el foco desde una orden que ya no
 * corre era la novedad pisando al foco, y con un lead fuera de «trabajar» el
 * anclaje se ignora en silencio (`seleccionarFoco`) — el setter tocaba «Abrir»,
 * volvía al panel y el foco apuntaba a otra cosa, sin explicación.
 */
export function AbrirFocoButton({
  leadId,
  className,
  anclar = true,
}: {
  leadId: string
  className?: string
  anclar?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const abrir = () => {
    startTransition(async () => {
      if (anclar) {
        const result = await anclarFoco(leadId)
        if (!result.success) {
          toast.error(result.error)
          return
        }
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
