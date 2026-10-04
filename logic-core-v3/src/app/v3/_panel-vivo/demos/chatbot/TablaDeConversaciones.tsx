'use client'

import { Bot, ChevronDown, User as UserIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Fragment, useEffect, useRef, type ReactNode } from 'react'

import { intentLabel } from '@/modules/chatbot/lead-intent-labels'

import { mostrarAlFondo } from '../../desplazar'
import type { MensajeDeEjemplo } from './datos'

/**
 * [NOCTURNO] B · LA TABLA DE CONVERSACIONES — COPIA de `modules/chatbot/components/dashboards/ConversationsTable.tsx`
 * (la tabla, sus filas que se abren con la flecha y `TranscriptDetail`), con las clases de allá. Lo que cambia, y por qué:
 *   · sin la columna «Costo» (dólares: en Tu panel no hay precios, ni de ejemplo);
 *   · el transcript recibe los mensajes que ya llegaron (la demo los despliega de a uno) y el «pensando» del asistente
 *     (los tres puntos del widget público, `modules/chatbot/components/chat/ChatWindow.tsx`);
 *   · la intención del lead, con su nombre de dueño (`intentLabel`, IMPORTADO de `modules/chatbot/lead-intent-labels.ts`);
 *   · sin el estado vacío (traía un `<Link>` a `/dashboard`): la demo siempre tiene conversaciones;
 *   · en el teléfono (abajo de `sm`) sin las columnas de tokens y de ruta: con las seis, el transcript (que va adentro de
 *     la tabla) quedaba más ancho que la pantalla y cortaba las burbujas.
 */
export interface FilaDeConversacion {
  readonly id: string
  readonly ultima: Date
  readonly mensajes: number
  readonly tokens: readonly [number, number]
  readonly ruta: string
  readonly lead: { readonly nombre: string; readonly intencion: string } | null
}

function formatDate(d: Date): string {
  return d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

export function TablaDeConversaciones({ filas, abierta, alAlternar, transcript }: { readonly filas: readonly FilaDeConversacion[]; readonly abierta: string | null; readonly alAlternar?: (id: string) => void; readonly transcript: (id: string) => ReactNode }): React.JSX.Element {
  const total = filas.length
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-[11px] uppercase tracking-wider text-zinc-500">
              <th className="w-8 py-3 pr-2" aria-hidden="true" />
              <th className="py-3 pr-4">Última actividad</th>
              <th className="py-3 pr-4">Mensajes</th>
              <th className="hidden py-3 pr-4 sm:table-cell">Tokens (in / out)</th>
              <th className="hidden py-3 pr-4 sm:table-cell">Ruta</th>
              <th className="py-3 pr-4">Lead</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((c) => {
              const isOpen = abierta === c.id
              return (
                <Fragment key={c.id}>
                  <tr className={`border-b border-zinc-900 hover:bg-zinc-900/30 ${alAlternar === undefined ? '' : 'cursor-pointer'}`} onClick={alAlternar === undefined ? undefined : () => alAlternar(c.id)}>
                    <td className="py-3 pr-2">
                      {alAlternar === undefined ? (
                        <span className="flex h-6 w-6 items-center justify-center text-zinc-500">
                          <ChevronDown className={`h-4 w-4 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} aria-hidden="true" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={isOpen ? 'Ocultar transcript' : 'Ver transcript'}
                          onClick={(e) => {
                            e.stopPropagation()
                            alAlternar(c.id)
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/40"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                        </button>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">{formatDate(c.ultima)}</td>
                    <td className="py-3 pr-4 text-zinc-400">{c.mensajes}</td>
                    <td className="hidden py-3 pr-4 font-mono text-xs text-zinc-400 sm:table-cell">
                      {c.tokens[0]} / {c.tokens[1]}
                    </td>
                    <td className="hidden py-3 pr-4 text-xs text-zinc-500 sm:table-cell">{c.ruta}</td>
                    <td className="py-3 pr-4">
                      {c.lead ? (
                        <span className="text-xs text-emerald-400">
                          ✓ {c.lead.nombre} ({intentLabel(c.lead.intencion)})
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-zinc-900 bg-zinc-950/40">
                      <td colSpan={6} className="px-3 py-4">
                        {transcript(c.id)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-right text-[11px] text-zinc-500">{`${String(total)} ${total === 1 ? 'conversación' : 'conversaciones'} en total.`}</p>
    </div>
  )
}

/** El transcript (COPIA de `TranscriptDetail`): los mensajes que llegaron y, si el asistente está escribiendo, sus puntos. */
export function Transcript({ mensajes, escribiendo, vivo = false, seguir = false, suave = true }: { readonly mensajes: readonly MensajeDeEjemplo[]; readonly escribiendo: boolean; readonly vivo?: boolean; readonly seguir?: boolean; readonly suave?: boolean }): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  // [NOCTURNO] B · lo último a la vista: el transcript baja solo y, si la demo sigue lo que llega, también el panel.
  useEffect(() => {
    const el = caja.current
    if (el === null || !seguir) return
    el.scrollTop = el.scrollHeight
    mostrarAlFondo(el, suave)
  }, [mensajes.length, escribiendo, seguir, suave])
  return (
    <div ref={caja} className="max-h-[260px] space-y-3 overflow-y-auto overscroll-contain pr-1" aria-live={vivo ? 'polite' : undefined}>
      {mensajes.map((m, k) => {
        const isUser = m.rol === 'USER'
        return (
          <motion.div key={`${String(k)}-${m.texto}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                <Bot className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${isUser ? 'bg-cyan-500/15 text-cyan-100' : 'bg-zinc-800/60 text-zinc-200'}`}>
              <span className="sr-only">{isUser ? 'Visitante: ' : 'Chatbot: '}</span>
              <p className="whitespace-pre-wrap break-words leading-relaxed">{m.texto}</p>
            </div>
            {isUser && (
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                <UserIcon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              </div>
            )}
          </motion.div>
        )
      })}
      {escribiendo && <Pensando />}
    </div>
  )
}

/** Los tres puntos del widget público (COPIA del marcado de `ChatWindow.tsx`, sin su avatar con lienzo). */
function Pensando(): React.JSX.Element {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-1 py-1">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
        <Bot className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-[3px]">
        <div className="flex items-center gap-[5px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-[5px] w-[5px] rounded-full"
              style={{ background: `rgba(6,182,212,${(0.5 + i * 0.15).toFixed(2)})`, boxShadow: '0 0 4px rgba(6,182,212,0.4)' }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
            />
          ))}
        </div>
        <span className="font-mono text-[10px] tracking-[0.1em] text-cyan-400/55">pensando</span>
      </div>
    </motion.div>
  )
}
