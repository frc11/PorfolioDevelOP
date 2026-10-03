'use client'

import { Book, ChevronRight, Clock, HelpCircle, Inbox, Zap } from 'lucide-react'
import { motion } from 'motion/react'

import { EmptyStateMuted } from '@/components/ui/EmptyStateMuted'
import { adminHoverCls } from '@/lib/hover'
import { cn } from '@/lib/utils'

import type { CategoriaDelTicket, EstadoDelTicket, PrioridadDelTicket } from './datos'

/**
 * [NOCTURNO] B · EL TABLERO DE SOPORTE — COPIA de `components/dashboard/SoporteBoard.tsx` (las tres columnas Abiertos ·
 * En curso · Resueltos con su tono, las tarjetas con prioridad, categoría, código, título, último mensaje y tiempo, el
 * «Ver más», y los recursos de autogestión), con `EmptyStateMuted` IMPORTADO. Lo que cambia, y por qué: cada tarjeta
 * era un `<Link>` a `/dashboard/soporte/:id` (acá abre el ticket adentro de la demo); la vista general de una columna
 * era un `Modal` portaleado al `body`, detrás de la ampliación (acá se abre adentro); y los recursos, que en el panel
 * son botones sin destino, van como texto.
 */
export interface TicketDelTablero {
  readonly id: string
  readonly title: string
  readonly status: EstadoDelTicket
  readonly priority: PrioridadDelTicket
  readonly category: CategoriaDelTicket
  readonly creado: Date
  readonly mensajes: number
  readonly ultimo: string | null
  /** Recién creado o recién cambiado: el chip «Nuevo». */
  readonly nuevo?: boolean
}

export const PRIORIDADES: Readonly<Record<PrioridadDelTicket, { readonly label: string; readonly cls: string; readonly pulse?: boolean }>> = {
  LOW: { label: 'Baja', cls: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
  MEDIUM: { label: 'Media', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  HIGH: { label: 'Alta', cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  URGENT: { label: 'Urgente', cls: 'text-red-400 bg-red-500/10 border-red-500/20', pulse: true },
}

export const CATEGORIAS: Readonly<Record<CategoriaDelTicket, string>> = { TECHNICAL: 'Técnico', BILLING: 'Facturación', FEATURE_REQUEST: 'Requerimiento', OTHER: 'Otro' }

export const COLUMNAS: readonly { readonly key: EstadoDelTicket; readonly label: string; readonly tone: string; readonly emptyTitle: string; readonly emptyDescription: string }[] = [
  { key: 'OPEN', label: 'Abiertos', tone: 'from-cyan-400/20 to-cyan-400/5', emptyTitle: 'Sin tickets abiertos', emptyDescription: 'Cuando abras un ticket nuevo va a aparecer acá.' },
  { key: 'IN_PROGRESS', label: 'En curso', tone: 'from-amber-400/20 to-amber-400/5', emptyTitle: 'Nada en curso', emptyDescription: 'Los tickets que el equipo esté atendiendo se ven acá.' },
  { key: 'RESOLVED', label: 'Resueltos', tone: 'from-emerald-400/20 to-emerald-400/5', emptyTitle: 'Sin resueltos todavía', emptyDescription: 'El historial de tickets cerrados va a aparecer acá.' },
]

const MAX_VISIBLE = 2
const COLUMN_BODY_MAX_H = 220
const COLUMN_BODY_FADE = 'linear-gradient(to bottom, #000 calc(100% - 48px), transparent)'

/** «hace …», como lo escribe el tablero real. */
export function haceTanto(fecha: Date): string {
  const secs = Math.floor((Date.now() - fecha.getTime()) / 1000)
  if (secs < 60) return 'hace un momento'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `hace ${String(mins)}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${String(hrs)}h`
  return `hace ${String(Math.floor(hrs / 24))}d`
}

/** El código del ticket (el real muestra los últimos seis caracteres de su id). */
export function codigoDe(id: string): string {
  let h = 7
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h.toString(36).toUpperCase().padStart(6, '0').slice(-6)
}

export function TarjetaDeTicket({ ticket, idx, alAbrir }: { readonly ticket: TicketDelTablero; readonly idx: number; readonly alAbrir?: (id: string) => void }): React.JSX.Element {
  const p = PRIORIDADES[ticket.priority]
  const clase = 'group block w-full rounded-[22px] border border-white/10 bg-white/5 p-3.5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-all hover:scale-[1.02] hover:border-cyan-400/20 hover:bg-white/[0.07] motion-reduce:hover:scale-100'
  const cuerpo = (
    <>
      <span className="flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${p.cls}`}>
          {p.pulse === true && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
          {p.label}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">{CATEGORIAS[ticket.category]}</span>
        {ticket.nuevo === true && <span className="rounded-full border border-cyan-400/40 bg-cyan-400/15 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-300">Nuevo</span>}
        <span className="ml-auto font-mono text-[10px] text-zinc-600">#{codigoDe(ticket.id)}</span>
      </span>
      <span className="mt-2 line-clamp-2 block text-sm font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-white">{ticket.title}</span>
      {ticket.ultimo && <span className="mt-1.5 line-clamp-1 block text-xs leading-relaxed text-zinc-400">{ticket.ultimo}</span>}
      <span className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5 text-[10px] font-medium text-zinc-500">
        <Clock size={9} strokeWidth={1.5} aria-hidden />
        <span>{haceTanto(ticket.creado)}</span>
        <span aria-hidden>·</span>
        <span>
          {ticket.mensajes} {ticket.mensajes === 1 ? 'msg' : 'msgs'}
        </span>
        <ChevronRight size={12} strokeWidth={1.5} aria-hidden className="ml-auto transition-colors group-hover:text-cyan-400" />
      </span>
    </>
  )
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.03, 0.15) }}>
      {alAbrir ? (
        <button type="button" onClick={() => alAbrir(ticket.id)} className={`${clase} cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400`}>
          {cuerpo}
        </button>
      ) : (
        <span className={clase}>{cuerpo}</span>
      )}
    </motion.div>
  )
}

export function TableroDeSoporte({ tickets, alAbrir, alVerTodos }: { readonly tickets: readonly TicketDelTablero[]; readonly alAbrir?: (id: string) => void; readonly alVerTodos?: (estado: EstadoDelTicket) => void }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNAS.map((c) => {
          const deLaColumna = tickets.filter((t) => t.status === c.key)
          const desborda = deLaColumna.length >= MAX_VISIBLE
          const cabeza = (
            <span className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-[0.22em] text-white/55">Soporte</span>
                <span className="mt-1 block truncate text-sm font-semibold text-white">{c.label}</span>
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-medium text-white/85">{deLaColumna.length}</span>
            </span>
          )
          const claseDeLaCabeza = cn('block w-full shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br px-4 py-2.5 text-left transition-[filter] hover:brightness-110', c.tone)
          return (
            <section key={c.key} aria-label={`Tickets ${c.label}`} className="flex min-w-0 flex-col rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
              {alVerTodos ? (
                <button type="button" onClick={() => alVerTodos(c.key)} aria-label={`Ver todos los tickets de ${c.label} (${String(deLaColumna.length)})`} className={`${claseDeLaCabeza} cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400`}>
                  {cabeza}
                </button>
              ) : (
                <span className={claseDeLaCabeza}>{cabeza}</span>
              )}
              <div className="mt-3 space-y-2.5 overflow-hidden px-2 py-1" style={{ maxHeight: COLUMN_BODY_MAX_H, ...(desborda ? { maskImage: COLUMN_BODY_FADE, WebkitMaskImage: COLUMN_BODY_FADE } : null) }}>
                {deLaColumna.length > 0 ? deLaColumna.slice(0, MAX_VISIBLE).map((t, idx) => <TarjetaDeTicket key={t.id} ticket={t} idx={idx} alAbrir={alAbrir} />) : <EmptyStateMuted icon={Inbox} title={c.emptyTitle} description={c.emptyDescription} className="py-10" />}
              </div>
              {desborda && alVerTodos ? (
                <button type="button" onClick={() => alVerTodos(c.key)} className="mt-1 w-full cursor-pointer rounded-xl px-3 py-1.5 text-center text-[11px] font-medium text-cyan-300/80 transition-colors hover:bg-cyan-400/10 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-cyan-400">
                  Ver más ({deLaColumna.length}) →
                </button>
              ) : null}
            </section>
          )
        })}
      </div>
      <div>
        <h4 className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Recursos de Autogestión</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Guía del Usuario', Icon: Book, color: 'text-blue-400', desc: 'Aprendé a gestionar tu negocio.' },
            { label: 'Preguntas Frecuentes', Icon: HelpCircle, color: 'text-amber-400', desc: 'Respuestas rápidas a dudas comunes.' },
            { label: 'Tips de Optimización', Icon: Zap, color: 'text-emerald-400', desc: 'Mejorá tu conversión hoy.' },
          ].map((item) => (
            <div key={item.label} className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left shadow-lg ${adminHoverCls}`}>
              <div className={`shrink-0 rounded-xl border border-white/5 bg-black/20 p-2.5 ${item.color}`}>
                <item.Icon size={18} strokeWidth={1.5} aria-hidden />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-zinc-200">{item.label}</span>
                <p className="mt-0.5 truncate text-[10px] leading-relaxed text-zinc-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
