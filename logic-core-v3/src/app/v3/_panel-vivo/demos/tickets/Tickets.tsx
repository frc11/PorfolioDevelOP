'use client'

import { ArrowLeft, Clock, Headphones, MessageSquarePlus, Users, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { ChatBubble } from '@/components/dashboard/ChatBubble'
import { adminHoverCls } from '@/lib/hover'

import type { PropsDeLaDemo } from '../../DemoDelPanel'
import { mostrarArriba } from '../../desplazar'
import { MarcoDelPanel } from '../../MarcoDelPanel'
import { usePasos, useReproduccion } from '../../reproduccion'
import { CICLO_DE_EJEMPLO, RITMO_DE_LOS_TICKETS, TICKETS_DE_EJEMPLO, type EstadoDelTicket, type MensajeDelTicket, type TicketDeEjemplo } from './datos'
import { FormularioDeTicket, type TicketNuevo } from './FormularioDeTicket'
import { CATEGORIAS, COLUMNAS, PRIORIDADES, TableroDeSoporte, TarjetaDeTicket, type TicketDelTablero } from './TableroDeSoporte'

/**
 * [NOCTURNO] B · FEATURE 3 — «Creá tickets para que cambiemos lo que necesites». El centro de soporte del panel
 * (`/dashboard/soporte`, la composición de su página: el encabezado con «Abrir Nuevo Ticket», las tres fichas con
 * `StatCard` y `PageHeader` IMPORTADOS, y el tablero COPIADO). Los tickets de ejemplo viven: el equipo toma uno y
 * resuelve otro. «Abrir Nuevo Ticket» abre el formulario de verdad (COPIA, con su validación) y el ticket nuevo aparece en
 * Abiertos sin mandar nada. Cada ticket se abre y muestra su charla con `ChatBubble` (IMPORTADO). La ficha del tiempo de
 * respuesta no lleva la cifra real de develOP (no va en la landing): dice el horario.
 */
const ETIQUETA_DEL_ESTADO: Readonly<Record<EstadoDelTicket, string>> = { OPEN: 'Abierto', IN_PROGRESS: 'En Progreso', RESOLVED: 'Resuelto' }

export default function Tickets({ irA }: PropsDeLaDemo): React.JSX.Element {
  const r = useReproduccion()
  const grande = r.modo === 'completa'
  const [ahora] = useState(() => Date.now())
  const { paso } = usePasos(CICLO_DE_EJEMPLO.length, RITMO_DE_LOS_TICKETS.pasoMs)
  const [creados, setCreados] = useState<readonly TicketDeEjemplo[]>([])
  const [abierto, setAbierto] = useState<string | null>(null)
  const [vista, setVista] = useState<EstadoDelTicket | null>(null)
  const [formulario, setFormulario] = useState(false)
  const boton = useRef<HTMLDivElement>(null)
  const raiz = useRef<HTMLDivElement>(null)
  useEffect(() => mostrarArriba(raiz.current, false), [abierto, vista])

  const hechos = CICLO_DE_EJEMPLO.slice(0, paso)
  const tickets: (TicketDeEjemplo & { readonly nuevo: boolean })[] = [...creados, ...TICKETS_DE_EJEMPLO].map((t) => {
    const cambio = hechos.find((h) => h.id === t.id)
    const recien = (cambio !== undefined && hechos[hechos.length - 1] === cambio) || creados[0]?.id === t.id
    return cambio === undefined ? { ...t, nuevo: recien } : { ...t, status: cambio.pasaA, mensajes: [...t.mensajes, { deDevelop: true, texto: cambio.respuesta, haceMin: 0 }], nuevo: recien }
  })
  const delTablero: TicketDelTablero[] = tickets.map((t) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, category: t.category, creado: new Date(ahora - t.haceMin * 60_000), mensajes: t.mensajes.length, ultimo: t.mensajes[t.mensajes.length - 1]?.texto ?? null, nuevo: t.nuevo }))
  const crear = (n: TicketNuevo): void => {
    setCreados((c) => [{ id: `tk-nuevo-${String(c.length + 1)}`, title: n.title, status: 'OPEN', priority: n.priority, category: n.category, haceMin: 0, mensajes: [{ deDevelop: false, texto: n.message, haceMin: 0 }] }, ...c])
    setFormulario(false)
    toast.success('Ticket creado (ejemplo): no se envió nada')
    boton.current?.querySelector('button')?.focus()
  }
  const elAbierto = tickets.find((t) => t.id === abierto)
  const abiertos = tickets.filter((t) => t.status !== 'RESOLVED').length

  return (
    <MarcoDelPanel item="soporte" irA={irA} conPausa encima={formulario ? <FormularioDeTicket alCrear={crear} alCerrar={() => { setFormulario(false); boton.current?.querySelector('button')?.focus() }} /> : null}>
      <div ref={raiz} className="flex w-full flex-col gap-4">
        <div className="flex shrink-0 flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <PageHeader eyebrow="Soporte" title="Centro de Soporte" description="Un canal directo para ordenar consultas, prioridades y próximos pasos con el equipo." icon={Headphones} className="pt-0 sm:pt-1" />
          <div ref={boton} className="shrink-0 sm:mt-3">
            {grande ? (
              <Button variant="primary" onClick={() => setFormulario(true)} icon={<MessageSquarePlus size={16} strokeWidth={1.5} />}>
                Abrir Nuevo Ticket
              </Button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black">
                <MessageSquarePlus size={16} strokeWidth={1.5} aria-hidden />
                Abrir Nuevo Ticket
              </span>
            )}
          </div>
        </div>
        <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Tickets abiertos" value={abiertos} icon={Headphones} accent="cyan" className={`${adminHoverCls} p-3.5`} />
          <StatCard label="Respuesta" value="Horario laboral" icon={Clock} accent="emerald" subtitle="De lunes a viernes" className={`${adminHoverCls} p-3.5`} />
          <StatCard label="Tu equipo de soporte" value="develOP" icon={Users} accent="zinc" subtitle="Mensajes, tickets o WhatsApp" className={`${adminHoverCls} p-3.5`} />
        </div>
        {elAbierto !== undefined ? (
          <DetalleDelTicket ticket={elAbierto} ahora={ahora} alVolver={() => setAbierto(null)} />
        ) : vista !== null ? (
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-100">{COLUMNAS.find((c) => c.key === vista)?.label} ({delTablero.filter((t) => t.status === vista).length})</h3>
              <button type="button" onClick={() => setVista(null)} aria-label="Cerrar la lista" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400">
                <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {delTablero.filter((t) => t.status === vista).map((t, idx) => <TarjetaDeTicket key={t.id} ticket={t} idx={idx} alAbrir={setAbierto} />)}
            </div>
          </Card>
        ) : (
          <TableroDeSoporte tickets={delTablero} alAbrir={grande ? setAbierto : undefined} alVerTodos={grande ? setVista : undefined} />
        )}
      </div>
    </MarcoDelPanel>
  )
}

/** El ticket abierto: su estado y su charla, con las burbujas del panel (`ChatBubble`, IMPORTADO). */
function DetalleDelTicket({ ticket, ahora, alVolver }: { readonly ticket: TicketDeEjemplo; readonly ahora: number; readonly alVolver: () => void }): React.JSX.Element {
  const p = PRIORIDADES[ticket.priority]
  const burbuja = (m: MensajeDelTicket, k: number): React.JSX.Element => <ChatBubble key={k} message={{ id: `${ticket.id}-${String(k)}`, content: m.texto, isAgency: m.deDevelop, authorLabel: m.deDevelop ? 'develOP' : 'Vos', createdAt: new Date(ahora - m.haceMin * 60_000) }} />
  return (
    <div className="space-y-4">
      <button type="button" onClick={alVolver} className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-cyan-400">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        Volver al soporte
      </button>
      <Card padding="lg" className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${p.cls}`}>{p.label}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">{CATEGORIAS[ticket.category]}</span>
          <span className="ml-auto rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">{ETIQUETA_DEL_ESTADO[ticket.status]}</span>
        </div>
        <h3 className="text-lg font-semibold text-zinc-100">{ticket.title}</h3>
      </Card>
      <div className="space-y-3">{ticket.mensajes.map(burbuja)}</div>
    </div>
  )
}
