'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PlayCircle } from 'lucide-react'
import { anclarFoco } from '../_actions/foco.actions'

/**
 * P21 — "Trabajar" de una fila de la cola: ancla el lead como foco y abre su
 * detalle. Es EXACTAMENTE el mecanismo de "Ir a trabajarlo" (`FocoSurface`) y de
 * "Abrir" (`AbrirFocoButton`): mismo `anclarFoco`, misma navegación. La cola no
 * es una segunda vía de acceso con reglas propias — es la misma puerta,
 * mostrada para más de un lead.
 *
 * Se separa de `AbrirFocoButton` por la forma, no por la lógica: aquel es un
 * link de texto al pie de un aviso; éste es el control principal de una fila de
 * trabajo y tiene que leerse como tal.
 */
export function TrabajarLeadButton({ leadId, nombre }: { leadId: string; nombre: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const trabajar = () => {
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
      onClick={trabajar}
      disabled={isPending}
      aria-label={`Trabajar ${nombre}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-100 outline-none transition-colors hover:bg-cyan-500/20 focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:opacity-50"
    >
      <PlayCircle size={13} strokeWidth={1.5} aria-hidden />
      Trabajar
    </button>
  )
}
