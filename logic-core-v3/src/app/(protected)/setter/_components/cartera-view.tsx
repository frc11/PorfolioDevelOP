'use client'

import { useMemo, useState } from 'react'
import { Briefcase, ChevronRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  agruparCartera,
  filtrarYOrdenarCartera,
  VISTA_ABIERTA,
  type EstadoFiltro,
  type GrupoCartera,
  type HomeLead,
  type OrdenCartera,
  type VistaCartera,
} from '@/lib/leados/flow'
import { CarteraToolbar } from './cartera-toolbar'
import { LeadCard } from './home-sections'

/**
 * LeadOS 2.1a — La cartera completa, SECUNDARIA al foco y colapsada por defecto.
 *
 * ── P22: para qué sirve la cartera ahora ─────────────────────────────────────
 * P21 le sacó a la cartera el trabajo del día: la cola del panel muestra lo
 * accionable, arriba de todo. Lo que quedó acá —medido: 84 tarjetas, 49 para
 * trabajar y 35 que no— es TODO LO DEMÁS, y era una lista plana donde un lead
 * que hay que trabajar hoy pesaba lo mismo que uno archivado hace tres semanas.
 *
 * Buscar ya existía y ya era barato (dos acciones: abrir y tipear), así que lo
 * que faltaba no era ENCONTRAR: era ORIENTARSE. La cartera ahora se dibuja
 * AGRUPADA por la misma vista con la que ya se la filtraba (`vistaDeLead`), con
 * el grupo del setter —«Para trabajar»— abierto y los demás plegados con su
 * conteo: el reparto de los 84 se lee de un vistazo sin recorrer la lista.
 *
 * Y cuando el setter BUSCA, los grupos se van: al escribir un nombre la lista
 * vuelve a ser plana. Agrupar tres resultados no orienta, estorba.
 *
 * 2.3 — pulido de la subordinación: el toggle tiene estados de hover/foco
 * diseñados y el cuerpo abierto cuelga de un riel neutro a la izquierda (eco
 * gris del acento cyan del foco) para leerse como la red secundaria.
 */
export function CarteraView({ leads }: { leads: HomeLead[] }) {
  const [abierto, setAbierto] = useState(false)
  const [query, setQuery] = useState('')
  const [estado, setEstado] = useState<EstadoFiltro>('todos')
  const [orden, setOrden] = useState<OrdenCartera>('urgencia')
  /**
   * Qué grupos abrió o cerró el setter A MANO. Sólo guarda las excepciones: sin
   * tocar nada, `VISTA_ABIERTA` está abierto y el resto plegado. Guardar el
   * estado de los ocho obligaría a re-sincronizarlo cada vez que un lead cambia
   * de grupo; guardar sólo lo que él decidió, no.
   */
  const [abiertos, setAbiertos] = useState<Partial<Record<VistaCartera, boolean>>>({})

  const buscando = query.trim() !== ''
  const isFiltering = buscando || estado !== 'todos' || orden !== 'urgencia'

  const lista = useMemo(
    () => filtrarYOrdenarCartera(leads, query, estado, orden),
    [leads, query, estado, orden],
  )
  // Los grupos salen de la lista YA filtrada y ordenada: el orden elegido sigue
  // valiendo dentro de cada uno. Buscando no se agrupa (ver el encabezado).
  const grupos = useMemo(
    () => (buscando ? [] : agruparCartera(lista)),
    [lista, buscando],
  )

  const limpiar = () => {
    setQuery('')
    setEstado('todos')
    setOrden('urgencia')
  }

  const alternar = (vista: VistaCartera, estaAbierto: boolean) =>
    setAbiertos((actual) => ({ ...actual, [vista]: !estaAbierto }))

  return (
    <section aria-label="Tu cartera completa" className="space-y-3">
      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        aria-expanded={abierto}
        className="group flex w-full items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 text-xs font-medium text-zinc-400 outline-none transition-colors hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40"
      >
        <Briefcase size={14} strokeWidth={1.5} aria-hidden className="text-zinc-500 transition-colors group-hover:text-zinc-300" />
        Ver toda la cartera
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] tabular-nums text-zinc-400 transition-colors group-hover:border-white/15 group-hover:text-zinc-300">
          {leads.length}
        </span>
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          aria-hidden
          className={cn(
            'ml-auto text-zinc-600 transition-[transform,color] group-hover:text-zinc-400',
            abierto && 'rotate-90',
          )}
        />
      </button>

      {/* Cuerpo subordinado: el riel neutro a la izquierda lo "cuelga" del toggle
          (eco del acento del foco, pero gris) — señal de que es la red secundaria,
          no protagonista. */}
      {abierto && (
        <div className="space-y-4 border-l border-white/[0.08] pl-4">
          <CarteraToolbar
            query={query}
            estado={estado}
            orden={orden}
            isFiltering={isFiltering}
            resultados={lista.length}
            onQuery={setQuery}
            onEstado={setEstado}
            onOrden={setOrden}
            onLimpiar={limpiar}
          />

          {lista.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/[0.06] px-4 py-10 text-center">
              <SearchX size={20} strokeWidth={1.5} className="text-zinc-600" />
              <p className="text-sm text-zinc-400">Ningún lead coincide con eso.</p>
              <p className="text-xs text-zinc-600">Probá con otro texto o limpiá los filtros.</p>
            </div>
          ) : buscando ? (
            /* Buscando: lista plana. El setter ya sabe qué busca — agrupar el
               puñado que queda sería cromo entre él y el resultado. */
            <ListaTarjetas leads={lista} etiqueta="Resultados de tu búsqueda" />
          ) : (
            <div className="space-y-2.5">
              {grupos.map((grupo) => (
                <GrupoPlegable
                  key={grupo.vista}
                  grupo={grupo}
                  /* Abierto por defecto si es el grupo del setter, O si es el
                     ÚNICO — que es lo que pasa cuando filtró por un estado.
                     Sin esa segunda condición, filtrar «En seguimiento» dejaba
                     al setter mirando un encabezado plegado que dice 14 y cero
                     tarjetas: pidió ese grupo explícitamente, esconderlo detrás
                     de un click más es contestarle con otra pregunta. */
                  abierto={
                    abiertos[grupo.vista] ??
                    (grupo.vista === VISTA_ABIERTA || grupos.length === 1)
                  }
                  onAlternar={alternar}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function ListaTarjetas({ leads, etiqueta }: { leads: HomeLead[]; etiqueta: string }) {
  return (
    <section aria-label={etiqueta} className="grid items-start gap-3 sm:grid-cols-2">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </section>
  )
}

/**
 * Un grupo de la cartera: encabezado con su nombre y su conteo, y las tarjetas
 * sólo si está abierto. El conteo va SIEMPRE —abierto o plegado— porque es la
 * mitad del valor de agrupar: saber que hay 14 en seguimiento sin abrirlos.
 *
 * Plegado NO renderiza las tarjetas (no las esconde con CSS): con 84 leads, ocho
 * grids montados y ocultos costarían el mismo DOM que la lista plana que este
 * sprint viene a reemplazar.
 */
function GrupoPlegable({
  grupo,
  abierto,
  onAlternar,
}: {
  grupo: GrupoCartera
  abierto: boolean
  onAlternar: (vista: VistaCartera, abierto: boolean) => void
}) {
  return (
    <div data-slot="grupo-cartera">
      <button
        type="button"
        onClick={() => onAlternar(grupo.vista, abierto)}
        aria-expanded={abierto}
        className="group flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left outline-none transition-colors hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-cyan-400/40"
      >
        <ChevronRight
          size={13}
          strokeWidth={1.5}
          aria-hidden
          className={cn(
            'shrink-0 text-zinc-600 transition-transform group-hover:text-zinc-400',
            abierto && 'rotate-90',
          )}
        />
        <span className="text-xs font-semibold text-zinc-300">{grupo.label}</span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-400">
          {grupo.leads.length}
        </span>
      </button>

      {abierto && (
        <div className="mt-2 pl-1">
          <ListaTarjetas leads={grupo.leads} etiqueta={grupo.label} />
        </div>
      )}
    </div>
  )
}
