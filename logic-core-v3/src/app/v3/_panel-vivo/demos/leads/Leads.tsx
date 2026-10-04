'use client'

import type { ChatbotLeadStatus } from '@prisma/client'
import { Ban, Plus, Users, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { CLASS_META, CLASS_ORDER, groupByClassification, type LeadClass } from '@/modules/chatbot/components/dashboard/lead-pipeline/classes'
import { LeadPipelineColumn } from '@/modules/chatbot/components/dashboard/lead-pipeline/LeadPipelineColumn'
import type { LeadWithScore } from '@/modules/chatbot/components/dashboard/ClientLeadsTable'

import { mostrarArriba } from '../../desplazar'
import { MarcoDelPanel } from '../../MarcoDelPanel'
import { usePasos, useReproduccion } from '../../reproduccion'
import { EncabezadoDelChatbot } from '../chatbot/EncabezadoDelChatbot'
import { RITMO_DE_LOS_LEADS, leadsDeEjemplo } from './datos'
import { DetalleDelLead } from './DetalleDelLead'
import { TarjetaDeLead } from './TarjetaDeLead'

/**
 * [NOCTURNO] B · FEATURE 2 — «Recibí los leads ya calificados que consultaron tu página». El panel de leads
 * (`/dashboard/chatbot/leads`): las tres listas del sistema — Calientes, Tibios, Fríos (`CLASS_ORDER`, `CLASS_META` y
 * `groupByClassification` IMPORTADOS de `lead-pipeline/classes.ts`) — con la columna REAL (`LeadPipelineColumn`,
 * IMPORTADA). Los leads de ejemplo llegan en vivo, cada uno a su lista, con el estado del sistema: el chip «Nuevo» un
 * rato y el anillo del caliente sin contactar. Se abre un lead y se ve su detalle; las acciones de un toque cambian su
 * estado; los filtros (fecha y estado) y la vista de descartados andan. Copiados, con su motivo, `TarjetaDeLead.tsx` y
 * `DetalleDelLead.tsx`; la barra de filtros, de `ClientLeadsTable.tsx`. La vista general de una columna era un portal al
 * `body` (detrás de la ampliación): acá se abre adentro. Sin «Exportar» (descarga de la API).
 */
type Rango = 'all' | 'today' | '7d' | '30d'
const RANGOS: Readonly<Record<Rango, { readonly rotulo: string; readonly min: number }>> = {
  all: { rotulo: 'Cualquier fecha', min: Number.POSITIVE_INFINITY },
  today: { rotulo: 'Hoy', min: 24 * 60 },
  '7d': { rotulo: 'Últimos 7 días', min: 7 * 24 * 60 },
  '30d': { rotulo: 'Últimos 30 días', min: 30 * 24 * 60 },
}
const ESTADOS: Readonly<Record<ChatbotLeadStatus, { readonly rotulo: string; readonly acento: string }>> = {
  NEW: { rotulo: 'Sin contactar', acento: 'border-amber-500/30 bg-amber-500/15 text-amber-300' },
  CONTACTED: { rotulo: 'Contactado', acento: 'border-blue-500/30 bg-blue-500/15 text-blue-300' },
  IN_NEGOTIATION: { rotulo: 'En negociación', acento: 'border-cyan-500/30 bg-cyan-500/15 text-cyan-300' },
  WON: { rotulo: 'Cliente', acento: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' },
  LOST: { rotulo: 'Perdido', acento: 'border-zinc-500/30 bg-zinc-500/15 text-zinc-400' },
}
const TODOS = 'border-zinc-700 bg-zinc-800 text-zinc-100'
const INACTIVO = 'border-white/[0.06] bg-transparent text-zinc-500 hover:text-zinc-300'
const chip = (activo: boolean, acento = TODOS): string => `min-h-[44px] rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${activo ? acento : INACTIVO}`
/** Lo que dura «Nuevo», en pasos de llegada (el sistema: 6 s; un lead llega cada 2,6 s). */
const PASOS_DE_NUEVO = 2

export default function Leads(): React.JSX.Element {
  const r = useReproduccion()
  const [ahora] = useState(() => Date.now())
  const datos = useMemo(() => leadsDeEjemplo(ahora), [ahora])
  const { paso, avanzar } = usePasos(datos.llegan.length + PASOS_DE_NUEVO, RITMO_DE_LOS_LEADS.llegaMs)
  const llegaron = Math.min(paso, datos.llegan.length)
  const [estados, setEstados] = useState<Readonly<Record<string, ChatbotLeadStatus>>>({})
  const [filtro, setFiltro] = useState<{ estado: ChatbotLeadStatus | 'all'; rango: Rango; dq: boolean }>({ estado: 'all', rango: 'all', dq: false })
  const [abierto, setAbierto] = useState<string | null>(null)
  const [vistaDe, setVistaDe] = useState<LeadClass | null>(null)
  const tuberia = useRef<HTMLDivElement>(null)
  const raiz = useRef<HTMLDivElement>(null)
  // El detalle se abre desde arriba (como una página nueva); al volver, otra vez en las listas.
  useEffect(() => {
    if (abierto !== null) mostrarArriba(raiz.current, false)
    else mostrarArriba(tuberia.current, false)
  }, [abierto])

  const todos = [...datos.antes, ...datos.llegan.slice(0, llegaron), datos.descartado]
  const estadoDe = (l: LeadWithScore): ChatbotLeadStatus => estados[l.id] ?? l.status
  const cambiar = (id: string) => (s: ChatbotLeadStatus) => setEstados((e) => ({ ...e, [id]: s }))
  const esNuevo = (id: string): boolean => {
    const i = datos.llegan.findIndex((d) => d.lead.id === id)
    return i >= 0 && i < llegaron && paso - 1 - i < PASOS_DE_NUEVO
  }
  const visibles = todos
    .map((d) => d.lead)
    .filter((l) => (filtro.dq ? l.effectiveClassification === 'dq' : l.effectiveClassification !== 'dq'))
    .filter((l) => filtro.dq || filtro.estado === 'all' || estadoDe(l) === filtro.estado)
    .filter((l) => (ahora - l.capturedAt.getTime()) / 60_000 <= RANGOS[filtro.rango].min)
    .sort((a, b) => (b.effectiveScore ?? 0) - (a.effectiveScore ?? 0))
  const grupos = groupByClassification(visibles)
  const tarjeta = (l: LeadWithScore): ReactNode => <TarjetaDeLead key={l.id} lead={l} estado={estadoDe(l)} alCambiarEstado={cambiar(l.id)} alAbrir={setAbierto} nuevo={esNuevo(l.id)} isDq={l.effectiveClassification === 'dq'} />
  const elAbierto = todos.find((d) => d.lead.id === abierto)
  const botonSi = (activo: boolean, contenido: ReactNode, alTocar: () => void, clase: string): ReactNode => (
    <button type="button" aria-pressed={activo} onClick={alTocar} className={`${clase} cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400`}>
      {contenido}
    </button>
  )

  return (
    <MarcoDelPanel item="chatbot" conPausa>
      <div ref={raiz} className="flex flex-col gap-6">
        <EncabezadoDelChatbot activa="leads" />
        {elAbierto !== undefined ? (
          <DetalleDelLead de={elAbierto} estado={estadoDe(elAbierto.lead)} alCambiarEstado={cambiar(elAbierto.lead.id)} alVolver={() => setAbierto(null)} />
        ) : (
          <>
            <PageHeader eyebrow="Mi Chatbot" title={filtro.dq ? 'Contactos descartados' : 'Mis contactos'} description={filtro.dq ? 'Consultas que el bot identificó como no comerciales (postventa, empleo, spam o proveedores).' : 'Personas que charlaron con tu bot y dejaron sus datos'} icon={filtro.dq ? Ban : Users} />
            <div className="flex flex-wrap gap-2">
              {botonSi(!filtro.dq, 'Contactos a seguir', () => setFiltro((f) => ({ ...f, dq: false })), chip(!filtro.dq))}
              {botonSi(filtro.dq, <><Ban className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />Descartados (1)</>, () => setFiltro((f) => ({ ...f, dq: true, estado: 'all' })), chip(filtro.dq, 'border-zinc-500/40 bg-zinc-600/15 text-zinc-300'))}
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-4">
                <Campo rotulo="Fecha">{(Object.keys(RANGOS) as Rango[]).map((k) => <span key={k}>{botonSi(filtro.rango === k, RANGOS[k].rotulo, () => setFiltro((f) => ({ ...f, rango: k })), chip(filtro.rango === k))}</span>)}</Campo>
                {!filtro.dq && (
                  <Campo rotulo="Estado">
                    {botonSi(filtro.estado === 'all', 'Todos', () => setFiltro((f) => ({ ...f, estado: 'all' })), chip(filtro.estado === 'all'))}
                    {(Object.keys(ESTADOS) as ChatbotLeadStatus[]).map((k) => <span key={k}>{botonSi(filtro.estado === k, ESTADOS[k].rotulo, () => setFiltro((f) => ({ ...f, estado: k })), chip(filtro.estado === k, ESTADOS[k].acento))}</span>)}
                  </Campo>
                )}
              </div>
            </div>
            {!r.corre && llegaron < datos.llegan.length && (
              <button type="button" onClick={avanzar} className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400">
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                Que llegue un lead (ejemplo)
              </button>
            )}
            <div ref={tuberia}>
              {filtro.dq ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibles.map(tarjeta)}</div>
              ) : vistaDe !== null ? (
                <VistaDeLaLista clase={vistaDe} leads={grupos[vistaDe]} tarjeta={tarjeta} alCerrar={() => setVistaDe(null)} />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {CLASS_ORDER.map((c) => (
                    <LeadPipelineColumn key={c} leadClass={c} leads={grupos[c]} bodyMaxHeight={300} onOpenOverview={setVistaDe} renderCard={tarjeta} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MarcoDelPanel>
  )
}

function Campo({ rotulo, children }: { readonly rotulo: string; readonly children: ReactNode }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{rotulo}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

/** La vista general de una lista (la de `LeadColumnOverview.tsx`, que es un portal al `body`): adentro de la demo. */
function VistaDeLaLista({ clase, leads, tarjeta, alCerrar }: { readonly clase: LeadClass; readonly leads: readonly LeadWithScore[]; readonly tarjeta: (l: LeadWithScore) => ReactNode; readonly alCerrar: () => void }): React.JSX.Element {
  const meta = CLASS_META[clase]
  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-100">
          Contactos {meta.label} ({leads.length})
        </h3>
        <button type="button" onClick={alCerrar} aria-label="Cerrar la lista" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400">
          <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{leads.map((l) => tarjeta(l))}</div>
    </Card>
  )
}
