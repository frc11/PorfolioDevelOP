import { ArrowUpNarrowWide, Flame, ListChecks } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { ColaDelDia, ItemCola } from '@/lib/leados/cola'
import { FocoSurface } from './foco-surface'
import { TrabajarLeadButton } from './trabajar-lead-button'

/**
 * LeadOS P21 — LA COLA DE HOY: el trabajo del día como LISTA, arriba de todo.
 *
 * Hasta este sprint el panel entregaba un lead a la vez y nada más: el grupo
 * `trabajar` de la partición no se renderizaba en ninguna parte, así que con 49
 * leads accionables el setter veía uno. Los otros 48 estaban en la cartera, que
 * es la lista de los 84 y no distingue trabajo de espera. La consecuencia no era
 * estética: "Franco aprobó tu demo — enviá el link" vivía en un bloque pasivo,
 * mil trescientos píxeles de avisos, mientras el foco apuntaba a otro negocio.
 *
 * EL FOCO ES EL PRIMER ÍTEM, no un bloque aparte. Se dibuja con la MISMA
 * `FocoSurface` de siempre (mismo card, mismos atajos, mismo anclaje) porque es
 * el mismo lead con la misma acción, sólo que destacado: la cola no lo duplica,
 * lo encabeza. Los que siguen son filas compactas — negocio, qué hacer, y el
 * control que lleva a hacerlo.
 *
 * Lo que no entra NO se esconde: el pie dice cuántos quedan y por dónde se
 * llega. Mostrar 49 filas devolvería una segunda cartera, y una lista que no
 * discrimina no orienta.
 */
type ColaDelDiaProps = {
  cola: ColaDelDia
  /** El siguiente accionable — lo consume "Saltar" del foco (sin cambios). */
  proximo: ItemCola['lead'] | null
  stickyActivo: boolean
}

function FilaCola({ item }: { item: ItemCola }) {
  const { lead } = item
  const meta = [lead.industry, lead.zone].filter(Boolean).join(' · ')

  return (
    <li
      data-slot="item-cola"
      className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.12]"
    >
      {/* Mismo acento que la cartera: cyan = hacé esto ahora. Acá TODO es
          accionable (la cola es el grupo `trabajar`), así que el riel confirma
          la promesa del bloque en vez de distinguir dentro de él. */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-cyan-400/60" />

      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 pl-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-zinc-100">{lead.businessName}</p>
            {lead.caliente && (
              <Badge tone="amber" variant="soft" icon={<Flame size={10} strokeWidth={1.5} />}>
                Caliente
              </Badge>
            )}
          </div>

          {/* Qué hacer. Es la MISMA línea que lee el foco y que lee la cartera
              (`proximaAccion`) — un solo texto, decidido en `flow.ts`. */}
          <p className="mt-1 text-xs font-medium text-cyan-200/90">{lead.proximaAccion}</p>

          {(item.motivo || meta) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              {item.motivo && (
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
                  <ArrowUpNarrowWide
                    size={11}
                    strokeWidth={1.5}
                    aria-hidden
                    className="shrink-0 text-zinc-600"
                  />
                  {item.motivo}
                </span>
              )}
              {meta && <span className="text-[11px] text-zinc-600">{meta}</span>}
            </div>
          )}
        </div>

        {/* Lleva a hacerlo: ancla el foco y abre el lead — el MISMO mecanismo
            que "Ir a trabajarlo", no un atajo que arme una cola paralela. */}
        <TrabajarLeadButton leadId={lead.id} nombre={lead.businessName} />
      </div>
    </li>
  )
}

export function ColaDelDia({ cola, proximo, stickyActivo }: ColaDelDiaProps) {
  const primero = cola.items[0]
  if (!primero) return null

  const siguen = cola.items.slice(1)

  return (
    <section aria-label="Tu cola de hoy" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <ListChecks size={16} strokeWidth={1.5} className="text-cyan-400" aria-hidden />
        <h2 className="text-sm font-semibold text-zinc-200">Tu cola de hoy</h2>
        {/* El único número del bloque: cuántos hay para trabajar. Antes vivía
            dentro del card del foco ("1 de 49 para trabajar"), donde decía dos
            cosas y una era la posición de un cursor que el setter no mueve. */}
        <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-cyan-300">
          {cola.total} para trabajar
        </span>
      </div>

      {/* El primero de la cola, destacado: mismo lead, misma acción, más grande. */}
      <FocoSurface foco={primero.lead} proximo={proximo} stickyActivo={stickyActivo} />

      {siguen.length > 0 && (
        <ol className="space-y-2">
          {siguen.map((item) => (
            <FilaCola key={item.lead.id} item={item} />
          ))}
        </ol>
      )}

      {/* Lo que no entra se NOMBRA y se dice dónde está. No lleva enlace a
          propósito: la cartera es un plegable de ESTA misma página, no una ruta
          — un link que no llega a ningún lado es peor que una frase que ubica. */}
      {cola.ocultos > 0 && (
        <p className="px-1 text-xs text-zinc-600">
          {cola.ocultos === 1
            ? 'Queda 1 más para trabajar, en tu cartera.'
            : `Quedan ${cola.ocultos} más para trabajar, en tu cartera.`}
        </p>
      )}
    </section>
  )
}
