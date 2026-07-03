import { OctagonAlert } from 'lucide-react'
import { Callout } from '@/components/ui'
import type { Rechazo } from '@/lib/leados/contracts'

/** Último rechazo completo como guía de retrabajo dentro del paso. */
export function GuiaRetrabajo({ rechazo }: { rechazo: Rechazo }) {
  return (
    <Callout
      tone="danger"
      accent
      icon={OctagonAlert}
      title="Guía de retrabajo — lo que Franco pidió corregir"
    >
      <div className="space-y-1.5 text-zinc-300">
        <p>
          <span className="font-semibold text-rose-200">Qué:</span> {rechazo.motivo}
        </p>
        {rechazo.donde && (
          <p>
            <span className="font-semibold text-rose-200">Dónde:</span> {rechazo.donde}
          </p>
        )}
        {rechazo.arreglo && (
          <p className="whitespace-pre-wrap">
            <span className="font-semibold text-rose-200">Arreglo:</span> {rechazo.arreglo}
          </p>
        )}
      </div>
    </Callout>
  )
}
