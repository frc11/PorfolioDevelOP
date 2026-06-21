'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  CalendarCheck2,
  CalendarClock,
  Clock3,
  Eye,
  ListTodo,
  Pin,
  SearchX,
} from 'lucide-react'
import { StatCard } from '@/components/ui'
import {
  filtrarYOrdenarCartera,
  particionarCartera,
  type EstadoFiltro,
  type HomeLead,
  type OrdenCartera,
} from '@/lib/leados/flow'
import {
  ArchiveSection,
  CollapsibleSection,
  GroupSection,
  LeadCard,
} from './home-sections'
import { CarteraToolbar } from './cartera-toolbar'
import { ContinuarCta } from './continuar-cta'
import { ShortcutsHelp, type Atajo } from './shortcuts-help'
import { useKeyboardShortcuts, type ShortcutMap } from './use-keyboard-shortcuts'

const ATAJOS_CARTERA: Atajo[] = [
  { accion: 'Moverte entre leads', teclas: ['j', 'k'] },
  { accion: 'Abrir el lead enfocado', teclas: ['Enter'] },
  { accion: 'Recorrer "Para trabajar"', teclas: ['r'] },
  { accion: 'Esta ayuda', teclas: ['?'] },
]

/**
 * Mueve el FOCO entre las cards de lead (anclas `[data-lead-card]`) con j/k. Es
 * foco DOM real — accesible, y `Enter` abre el lead enfocado de forma nativa (es
 * un `<Link>`). Salta las palancas pin/snooze/nota (no llevan el data-attr), que
 * es justo lo molesto de recorrer la cartera con Tab a secas. Ignora cards
 * ocultas (secciones colapsadas / fuera del filtro activo).
 */
function moverFocoCard(delta: 1 | -1): void {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>('[data-lead-card]'),
  ).filter((el) => el.offsetParent !== null)
  if (cards.length === 0) return

  const activo = document.activeElement
  const actual = cards.findIndex((card) => card === activo || card.contains(activo))
  const proximo =
    actual === -1 ? 0 : Math.min(cards.length - 1, Math.max(0, actual + delta))

  cards[proximo]?.focus()
  cards[proximo]?.scrollIntoView({ block: 'nearest' })
}

/** Conteos estables del marcador — por la clasificación cruda, ajenos al pin/snooze. */
type Marcador = {
  trabajar: number
  seguimiento: number
  revision: number
  agendadas: number
  demosAprobadas: number
}

function calcularMarcador(leads: HomeLead[]): Marcador {
  const marcador: Marcador = {
    trabajar: 0,
    seguimiento: 0,
    revision: 0,
    agendadas: 0,
    demosAprobadas: 0,
  }
  for (const lead of leads) {
    if (lead.grupo === 'trabajar') marcador.trabajar += 1
    else if (lead.grupo === 'seguimiento') marcador.seguimiento += 1
    else if (lead.grupo === 'revision') marcador.revision += 1
    else if (lead.grupo === 'agendadas') marcador.agendadas += 1
    if (lead.stage === 'APROBADA') marcador.demosAprobadas += 1
  }
  return marcador
}

/**
 * Cartera del setter con las palancas de organización encima. La vista por
 * defecto son las colas (el orden recomendado, B6); en cuanto el setter busca,
 * filtra o elige otro orden, pasa a una lista plana a su gusto. El marcador "de
 * un vistazo" se queda fijo: refleja la cartera entera, no el filtro activo.
 */
export function CarteraView({ leads }: { leads: HomeLead[] }) {
  const [query, setQuery] = useState('')
  const [estado, setEstado] = useState<EstadoFiltro>('todos')
  const [orden, setOrden] = useState<OrdenCartera>('colas')

  const isFiltering = query.trim() !== '' || estado !== 'todos' || orden !== 'colas'

  const marcador = useMemo(() => calcularMarcador(leads), [leads])
  const particion = useMemo(() => particionarCartera(leads), [leads])

  // Atajos de teclado del operador de volumen (j/k mover, Enter abrir, r recorrer).
  // `r` dispara EXACTAMENTE el mismo `<Link>` que el botón "Recorrer" por click.
  const recorrerTrabajarRef = useRef<HTMLAnchorElement>(null)
  // Punto de re-entrada: el tope del carril "trabajar" (ya ordenado por urgencia).
  // Un solo origen para el carril "Continuá donde dejaste", el atajo `r` y el
  // ancla oculta de abajo — todos apuntan al MISMO lead.
  const continuar = particion.grupos.trabajar[0]
  const trabajarFirstId = continuar?.id
  const bindings = useMemo<ShortcutMap>(
    () => ({
      j: () => moverFocoCard(1),
      k: () => moverFocoCard(-1),
      r: () => recorrerTrabajarRef.current?.click(),
    }),
    [],
  )
  useKeyboardShortcuts(bindings)
  const lista = useMemo(
    () =>
      isFiltering
        ? filtrarYOrdenarCartera(leads, query, estado, orden === 'colas' ? 'urgencia' : orden)
        : [],
    [isFiltering, leads, query, estado, orden],
  )

  const limpiar = () => {
    setQuery('')
    setEstado('todos')
    setOrden('colas')
  }

  return (
    <div className="space-y-8">
      {/* Re-entrada: lleva directo a lo más urgente que hay para trabajar. Arriba
          de todo para que el setter que vuelve no tenga que reconstruir su día. */}
      {continuar && <ContinuarCta lead={continuar} />}

      {/* Marcador de solo lectura — resumen de un vistazo, no navega ni filtra. */}
      <section aria-label="Resumen de tu cartera, de solo lectura" className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
          De un vistazo
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Para trabajar" value={marcador.trabajar} accent="cyan" icon={ListTodo} />
          <StatCard label="En seguimiento" value={marcador.seguimiento} accent="zinc" icon={Clock3} />
          <StatCard label="Esperando revisión" value={marcador.revision} accent="violet" icon={Eye} />
          <StatCard label="Agendadas" value={marcador.agendadas} accent="amber" icon={CalendarCheck2} />
          <div className="relative flex">
            <span
              aria-hidden
              className="absolute inset-y-2 -left-1.5 hidden w-px bg-white/10 lg:block"
            />
            <StatCard
              className="w-full"
              label="Demos aprobadas"
              value={marcador.demosAprobadas}
              subtitle="tu marcador"
              accent="emerald"
              icon={CalendarCheck2}
            />
          </div>
        </div>
      </section>

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

      {isFiltering ? (
        lista.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/[0.06] px-4 py-10 text-center">
            <SearchX size={20} strokeWidth={1.5} className="text-zinc-600" />
            <p className="text-sm text-zinc-400">Ningún lead coincide con eso.</p>
            <p className="text-xs text-zinc-600">Probá con otro texto o limpiá los filtros.</p>
          </div>
        ) : (
          <section aria-label="Resultados" className="grid items-start gap-3 sm:grid-cols-2">
            {lista.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </section>
        )
      ) : (
        <>
          {particion.fijados.length > 0 && (
            <GroupSection
              icon={Pin}
              titulo="Fijados por vos"
              descripcion="Los que decidiste tener arriba — tu prioridad, no la del sistema."
              vacio=""
              leads={particion.fijados}
              destacado
              cola="fijados"
            />
          )}

          <GroupSection
            icon={ListTodo}
            titulo="Para trabajar ahora"
            descripcion="Primero los que respondieron, después los calientes, después el resto."
            vacio="Nada para trabajar ahora mismo. Si esperás leads nuevos, avisale a Franco."
            leads={particion.grupos.trabajar}
            destacado
            cola="trabajar"
          />

          <GroupSection
            icon={Eye}
            titulo="Esperando revisión"
            descripcion="Demos enviadas a revisión de Franco — no requieren acción tuya."
            vacio="Nada esperando revisión."
            leads={particion.grupos.revision}
          />

          <GroupSection
            icon={Clock3}
            titulo="En seguimiento"
            descripcion="Evaluados sin respuesta del negocio todavía, y postergados."
            vacio="Nadie en seguimiento."
            leads={particion.grupos.seguimiento}
          />

          <GroupSection
            icon={CalendarCheck2}
            titulo="Agendadas"
            descripcion="Reuniones agendadas — las cierra Franco."
            vacio="Sin reuniones agendadas todavía. Ya van a caer."
            leads={particion.grupos.agendadas}
          />

          <CollapsibleSection
            icon={CalendarClock}
            titulo="Pausados por vos"
            leads={particion.pausados}
          />

          <ArchiveSection leads={particion.grupos.archivo} />
        </>
      )}

      {/* Ancla oculta para el atajo `r` — el botón "Recorrer" visible vive en la
          cabecera de la cola; este es el mismo destino, disparable por teclado. */}
      {trabajarFirstId && (
        <Link
          ref={recorrerTrabajarRef}
          href={`/setter/leads/${trabajarFirstId}?cola=trabajar`}
          hidden
          aria-hidden
          tabIndex={-1}
        />
      )}

      <ShortcutsHelp atajos={ATAJOS_CARTERA} />
    </div>
  )
}
