'use client'

import { MessageSquareText } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { ChatBubble } from '@/components/dashboard/ChatBubble'
import { getMessageForContext } from '@/lib/data/message-context'

import type { PropsDeLaDemo } from '../../DemoDelPanel'
import { MarcoDelPanel } from '../../MarcoDelPanel'
import { usePasos, useReproduccion } from '../../reproduccion'
import { ComposerDelChat } from './ComposerDelChat'
import { HISTORIA_DEL_CHAT, LLEGAN_AL_CHAT, RESPUESTAS_DEL_EQUIPO, RITMO_DEL_CHAT_CON_DEVELOP, type MensajeDelChat } from './datos'

/**
 * [NOCTURNO] B · FEATURE 4 — «Chateá con nosotros directo, por lo que sea». Mensajes del panel (`/dashboard/messages`):
 * COPIA de `components/dashboard/MessageThread.tsx` y de `ClientChatThread.tsx` (el encabezado, el contador, el hilo y
 * las respuestas rápidas; allá envía con la server action `sendClientMessageAction` y el hilo hace `scrollIntoView`, que
 * movería la página de atrás: acá baja adentro de su caja), con `ChatBubble` IMPORTADO (las burbujas y su llegada) y
 * `getMessageForContext` IMPORTADO (el texto de cada respuesta rápida). El equipo contesta solo; el visitante escribe (o
 * elige una respuesta rápida), «envía» y le llega la respuesta del equipo, de ejemplo. Sin la cifra del tiempo de
 * respuesta real (no va en la landing).
 */
const QUICK_REPLIES = [
  { label: 'Solicitar actualización del proyecto', context: 'proyecto' },
  { label: 'Reportar un problema', context: 'bug' },
  { label: 'Tengo una idea / nueva función', context: 'mejora' },
] as const

export default function Mensajes({ irA }: PropsDeLaDemo): React.JSX.Element {
  const r = useReproduccion()
  const grande = r.modo === 'completa'
  const [ahora] = useState(() => Date.now())
  const { paso } = usePasos(LLEGAN_AL_CHAT.length, RITMO_DEL_CHAT_CON_DEVELOP.llegaMs)
  const [propios, setPropios] = useState<readonly MensajeDelChat[]>([])
  const [valor, setValor] = useState('')
  const [contexto, setContexto] = useState<string>('libre')
  const [enviando, setEnviando] = useState(false)
  const hilo = useRef<HTMLDivElement>(null)
  const relojes = useRef<number[]>([])
  useEffect(() => () => relojes.current.forEach((t) => window.clearTimeout(t)), [])

  const mensajes = [...HISTORIA_DEL_CHAT, ...LLEGAN_AL_CHAT.slice(0, paso), ...propios]
  useEffect(() => {
    const el = hilo.current
    if (el !== null) el.scrollTop = el.scrollHeight
  }, [mensajes.length])

  const enviar = (texto: string): void => {
    const respuesta = RESPUESTAS_DEL_EQUIPO[contexto] ?? RESPUESTAS_DEL_EQUIPO.libre
    setEnviando(true)
    const despues = (ms: number, f: () => void): void => {
      relojes.current.push(window.setTimeout(f, r.reducido ? 0 : ms))
    }
    despues(RITMO_DEL_CHAT_CON_DEVELOP.enviandoMs, () => {
      setPropios((p) => [...p, { deDevelop: false, texto, haceMin: 0 }])
      setValor('')
      setContexto('libre')
      setEnviando(false)
      despues(RITMO_DEL_CHAT_CON_DEVELOP.respondeMs, () => setPropios((p) => [...p, { deDevelop: true, texto: respuesta, haceMin: 0 }]))
    })
  }

  return (
    <MarcoDelPanel item="mensajes" irA={irA} conPausa>
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="shrink-0 rounded-[24px] border border-white/10 bg-white/5 px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                <MessageSquareText className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Conversación activa</p>
                <p className="text-base font-semibold tracking-tight text-white">develOP — Soporte</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Respondemos en horario laboral</div>
          </div>
        </div>
        <section aria-label="Conversación con el equipo (ejemplo)" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
          <div className="shrink-0 border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <MessageSquareText className="h-4 w-4 text-cyan-300" strokeWidth={1.5} aria-hidden />
              <span>{mensajes.length} mensajes en la conversación</span>
            </div>
          </div>
          <div ref={hilo} aria-live={grande ? 'polite' : undefined} className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden overscroll-contain px-5 py-5">
            {mensajes.map((m, k) => (
              <ChatBubble key={k} message={{ id: String(k), content: m.texto, isAgency: m.deDevelop, authorLabel: m.deDevelop ? 'DevelOP' : 'Tu negocio', createdAt: new Date(ahora - m.haceMin * 60_000) }} />
            ))}
          </div>
        </section>
        <ComposerDelChat
          value={valor}
          onValueChange={setValor}
          alEnviar={enviar}
          isPending={enviando}
          interactivo={grande}
          aboveForm={
            <div className="mb-3 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((qr) =>
                grande ? (
                  <motion.button
                    key={qr.label}
                    type="button"
                    onClick={() => {
                      setValor(getMessageForContext(qr.context))
                      setContexto(qr.context)
                    }}
                    whileHover={r.reducido ? undefined : { scale: 1.04, y: -1 }}
                    whileTap={r.reducido ? undefined : { scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:border-cyan-500/25 hover:bg-cyan-500/10 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-400"
                  >
                    {qr.label}
                  </motion.button>
                ) : (
                  <span key={qr.label} className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {qr.label}
                  </span>
                ),
              )}
            </div>
          }
        />
      </div>
    </MarcoDelPanel>
  )
}
