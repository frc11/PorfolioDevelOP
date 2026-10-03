'use client'

import { MessageCircle, SkipForward } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useSeguir } from '../../desplazar'
import { MarcoDelPanel } from '../../MarcoDelPanel'
import { usePasos, useReproduccion } from '../../reproduccion'
import { CONVERSACIONES_ANTERIORES, CONVERSACION_EN_VIVO, PREGUNTAS_SUGERIDAS, RITMO_DEL_CHAT, type MensajeDeEjemplo } from './datos'
import { EncabezadoDelChatbot } from './EncabezadoDelChatbot'
import { TablaDeConversaciones, Transcript, type FilaDeConversacion } from './TablaDeConversaciones'

/**
 * [NOCTURNO] B · FEATURE 1 — «Revisá cada conversación de tu chatbot». La vista de conversaciones del panel
 * (`/dashboard/chatbot/conversations`) con el negocio de ejemplo: arriba, abierta, la conversación de ahora, que se
 * despliega sola mensaje a mensaje como en el sistema (el asistente «pensando» antes de cada respuesta) y termina
 * dejando un lead; abajo, las de antes, que se abren con su flecha. Y «Probalo»: el visitante elige una pregunta, la
 * escribe como si fuera un visitante del sitio y ve la respuesta de ejemplo llegar a su panel, como una conversación
 * nueva. Con movimiento reducido no se mueve sola: «Siguiente mensaje» la avanza.
 */
export default function Conversaciones(): React.JSX.Element {
  const r = useReproduccion()
  const [ahora] = useState(() => Date.now())
  const enVivo = CONVERSACION_EN_VIVO.mensajes
  const { paso, termino, avanzar } = usePasos(enVivo.length, RITMO_DEL_CHAT.mensajeMs)
  const [abierta, setAbierta] = useState<string | null>(CONVERSACION_EN_VIVO.id)
  const tuya = useConversacionDelVisitante(r.reducido)
  const raiz = useRef<HTMLDivElement>(null)
  const { seguir, reanudar } = useSeguir(raiz)

  const llegaron = enVivo.slice(0, paso)
  const sigueElAsistente = !termino && enVivo[paso].rol === 'ASSISTANT' && r.corre
  const filas: FilaDeConversacion[] = [
    ...(tuya.mensajes.length > 0 ? [{ id: 'tuya', ultima: new Date(ahora), mensajes: tuya.mensajes.length, tokens: [118 * tuya.mensajes.length, 141 * tuya.mensajes.length] as const, ruta: '/', lead: null }] : []),
    { id: CONVERSACION_EN_VIVO.id, ultima: new Date(ahora), mensajes: llegaron.length, tokens: CONVERSACION_EN_VIVO.tokens, ruta: CONVERSACION_EN_VIVO.ruta, lead: termino ? CONVERSACION_EN_VIVO.lead : null },
    ...CONVERSACIONES_ANTERIORES.map((c) => ({ id: c.id, ultima: new Date(ahora - c.haceMin * 60_000), mensajes: c.mensajes.length, tokens: c.tokens, ruta: c.ruta, lead: c.lead })),
  ]
  const transcript = (id: string): React.ReactNode => {
    if (id === 'tuya') return <Transcript mensajes={tuya.mensajes} escribiendo={tuya.escribiendo} vivo seguir suave={!r.reducido} />
    if (id === CONVERSACION_EN_VIVO.id) {
      return (
        <div className="flex flex-col gap-3">
          <Transcript mensajes={llegaron} escribiendo={sigueElAsistente} seguir={seguir && tuya.mensajes.length === 0} suave={!r.reducido} />
          {!termino && !r.corre && (
            <button type="button" onClick={avanzar} className="inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400">
              <SkipForward className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Siguiente mensaje
            </button>
          )}
        </div>
      )
    }
    const c = CONVERSACIONES_ANTERIORES.find((x) => x.id === id)
    return <Transcript mensajes={c === undefined ? [] : c.mensajes} escribiendo={false} />
  }
  const preguntar = (pregunta: string, respuesta: string): void => {
    tuya.preguntar(pregunta, respuesta)
    setAbierta('tuya')
    reanudar()
  }

  return (
    <MarcoDelPanel item="chatbot" conPausa>
      <div ref={raiz} className="flex flex-col gap-5">
        <EncabezadoDelChatbot activa="conversations" />
        <Probalo preguntar={preguntar} ocupado={tuya.escribiendo} />
        <TablaDeConversaciones filas={filas} abierta={abierta} alAlternar={(id) => setAbierta((a) => (a === id ? null : id))} transcript={transcript} />
      </div>
    </MarcoDelPanel>
  )
}

/** La caja de la demo (no es del panel: se ve distinta, punteada): las preguntas que el visitante le puede hacer al chatbot. */
function Probalo({ preguntar, ocupado }: { readonly preguntar?: (pregunta: string, respuesta: string) => void; readonly ocupado: boolean }): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/[0.04] px-4 py-3">
      <p className="flex items-center gap-2 text-xs text-zinc-300">
        <MessageCircle className="h-4 w-4 text-cyan-400" strokeWidth={1.5} aria-hidden="true" />
        Probalo como cliente (respuestas de ejemplo):
      </p>
      <div className="flex flex-wrap gap-2">
        {PREGUNTAS_SUGERIDAS.map((s) =>
          preguntar === undefined ? (
            <span key={s.pregunta} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300">
              {s.pregunta}
            </span>
          ) : (
            <button
              key={s.pregunta}
              type="button"
              disabled={ocupado}
              onClick={() => preguntar(s.pregunta, s.respuesta)}
              className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:border-cyan-400/40 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400 disabled:cursor-wait disabled:opacity-50"
            >
              {s.pregunta}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

/** La conversación del visitante: su pregunta llega enseguida y la respuesta, después del «pensando» (con movimiento reducido, ya). */
function useConversacionDelVisitante(reducido: boolean): { readonly mensajes: readonly MensajeDeEjemplo[]; readonly escribiendo: boolean; readonly preguntar: (pregunta: string, respuesta: string) => void } {
  const [mensajes, setMensajes] = useState<readonly MensajeDeEjemplo[]>([])
  const [escribiendo, setEscribiendo] = useState(false)
  const reloj = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(reloj.current), [])
  const preguntar = (pregunta: string, respuesta: string): void => {
    const conRespuesta: MensajeDeEjemplo = { rol: 'ASSISTANT', texto: respuesta }
    if (reducido) {
      setMensajes((m) => [...m, { rol: 'USER', texto: pregunta }, conRespuesta])
      return
    }
    setMensajes((m) => [...m, { rol: 'USER', texto: pregunta }])
    setEscribiendo(true)
    window.clearTimeout(reloj.current)
    reloj.current = window.setTimeout(() => {
      setEscribiendo(false)
      setMensajes((m) => [...m, conRespuesta])
    }, RITMO_DEL_CHAT.escribiendoMs)
  }
  return { mensajes, escribiendo, preguntar }
}
