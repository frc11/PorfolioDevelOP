'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { marcarNovedadesVistasAction } from '../_actions/novedades.actions'

/**
 * Botón "marcar como vistas": confirma con toast y refresca para que el panel y
 * el badge del topbar se vacíen. Vive aparte del panel (server) porque necesita
 * estado/transición — la lógica de qué se marca es del server action (aislado).
 */
export function MarcarVistoButton({ className }: { className?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const marcar = () => {
    startTransition(async () => {
      const result = await marcarNovedadesVistasAction()
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Novedades al día.')
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={marcar}
      disabled={isPending}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] disabled:opacity-50',
        className,
      )}
    >
      <Check size={13} strokeWidth={1.5} aria-hidden />
      Marcar como vistas
    </button>
  )
}
