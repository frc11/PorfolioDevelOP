import { OctagonAlert } from 'lucide-react'
import { Callout } from '@/components/ui'
import type { Rechazo } from '@/lib/leados/contracts'
import { formatFechaHora } from '@/lib/leados/flow'

/** Los campos de UN rechazo, en el orden en que se leen: qué pasa, dónde, y qué hacer. */
function CamposDelRechazo({ rechazo }: { rechazo: Rechazo }) {
  return (
    <div className="space-y-1.5 text-zinc-300">
      <p>
        <span className="font-semibold text-rose-200">Qué:</span> {rechazo.motivo}
      </p>
      {rechazo.donde && (
        <p>
          <span className="font-semibold text-rose-200">Dónde:</span> {rechazo.donde}
        </p>
      )}
      {/* Campo viejo (pre-B5): el formulario del admin ya no lo captura, pero
          los rechazos que lo tienen guardado dicen ahí la mitad del pedido. */}
      {rechazo.detalle && (
        <p className="whitespace-pre-wrap">
          <span className="font-semibold text-rose-200">Detalle:</span> {rechazo.detalle}
        </p>
      )}
      {rechazo.arreglo && (
        <p className="whitespace-pre-wrap">
          <span className="font-semibold text-rose-200">Arreglo:</span> {rechazo.arreglo}
        </p>
      )}
    </div>
  )
}

/**
 * Último rechazo completo como guía de retrabajo dentro del paso.
 *
 * F2 — Acompaña TODO el retrabajo (aterrizaje, construcción, borrador y chequeo
 * final), no solo el aterrizaje: el setter corrige en esas pantallas y ahí tiene
 * que poder leer qué le pidieron sin salir. Fuente ÚNICA de la nota — una sola
 * copia del bloque, no un Callout por pantalla.
 *
 * `previos` son las vueltas anteriores: contexto secundario, plegado y ANUNCIADO
 * con su cuenta (lo que importa —el último pedido— nunca se pliega). Vacío = no
 * se renderiza nada, y con eso `mr` deja de prometer un historial invisible.
 */
export function GuiaRetrabajo({
  rechazo,
  previos = [],
}: {
  rechazo: Rechazo
  previos?: readonly Rechazo[]
}) {
  return (
    <Callout
      tone="danger"
      accent
      icon={OctagonAlert}
      title="Guía de retrabajo — lo que Franco pidió corregir"
    >
      <CamposDelRechazo rechazo={rechazo} />
      {previos.length > 0 && (
        <details className="group mt-2 border-t border-rose-400/15 pt-2">
          <summary className="cursor-pointer text-[11px] font-medium text-rose-200/80 transition-colors hover:text-rose-100">
            Lo que te pidió en las vueltas anteriores ({previos.length})
          </summary>
          <div className="mt-2 space-y-2.5">
            {previos.map((previo) => (
              <div key={previo.fecha} className="border-l border-rose-400/20 pl-2.5">
                <p className="text-[11px] text-zinc-500">{formatFechaHora(previo.fecha)}</p>
                <div className="mt-1">
                  <CamposDelRechazo rechazo={previo} />
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </Callout>
  )
}
