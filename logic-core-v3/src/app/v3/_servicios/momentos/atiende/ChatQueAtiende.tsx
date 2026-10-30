'use client'

import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { intentLabel } from '@/modules/chatbot/lead-intent-labels'

import { useMovimientoReducido } from '../../../_lib/motion/reducido'
import { CONVERSACION_EN_VIVO, NOMBRE_DEL_ASISTENTE, PREGUNTAS_SUGERIDAS, RITMO_DEL_CHAT, type MensajeDeEjemplo } from '../../../_panel-vivo/demos/chatbot/datos'
import { ReproduccionDeLaDemo, usePasos, usePestanaVisible } from '../../../_panel-vivo/reproduccion'
import { AVISO_DEL_EJEMPLO, ROTULO_DE_PROBALO } from './datos'

/**
 * [M3] EL CHAT QUE ATIENDE — el prototipo 5 rechazado («se ve desde el panel, quiero que se vea desde un chat directamente») rehecho
 * como lo que se vende: la ventana de chat del lado del cliente, en el verde de la página (`--color-acento`, el de la raíz del cuerpo),
 * sin el panel y sin su cian.
 *
 * Es el comportamiento del chat de verdad, no un video: la conversación del negocio de ejemplo (la del panel vivo, una sola fuente) llega
 * mensaje a mensaje con el «escribiendo…» del asistente antes de cada respuesta, al ritmo del panel (`usePasos`, que espera si la página
 * se mueve), sólo a la vista y con la pestaña visible, y vuelve a empezar. Y se puede probar: las preguntas sugeridas se mandan como
 * cliente y la respuesta llega después del «escribiendo…». El chat sigue al último mensaje moviendo SU caja (`scrollTop`), nunca la página.
 * Con movimiento reducido, la conversación entera, quieta. Sin encabezados: el `h1` de la página es el único.
 */
export function ChatQueAtiende(): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const caja = useRef<HTMLDivElement>(null)
  const aLaVista = useInView(caja, { amount: 0.4 })
  const pestana = usePestanaVisible()
  const [tuyos, setTuyos] = useState<readonly MensajeDeEjemplo[]>([])
  const conTuyos = tuyos.length > 0
  return (
    <ReproduccionDeLaDemo.Provider value={{ corre: aLaVista && pestana && !reducido && !conTuyos, reducido, conBarra: false, bucle: true }}>
      <div ref={caja}>
        <Ventana tuyos={tuyos} setTuyos={setTuyos} reducido={reducido} />
      </div>
    </ReproduccionDeLaDemo.Provider>
  )
}

function Ventana({
  tuyos,
  setTuyos,
  reducido,
}: {
  readonly tuyos: readonly MensajeDeEjemplo[]
  readonly setTuyos: (f: (m: readonly MensajeDeEjemplo[]) => readonly MensajeDeEjemplo[]) => void
  readonly reducido: boolean
}): React.JSX.Element {
  const guion = CONVERSACION_EN_VIVO.mensajes
  const { paso, termino } = usePasos(guion.length, RITMO_DEL_CHAT.mensajeMs)
  const [respondiendo, setRespondiendo] = useState(false)
  const reloj = useRef<number | undefined>(undefined)
  const lista = useRef<HTMLDivElement>(null)
  useEffect(() => () => window.clearTimeout(reloj.current), [])

  // Con movimiento reducido o cuando el visitante ya preguntó, el guion se ve entero (y el bucle se detiene).
  const llegaron = reducido || tuyos.length > 0 ? guion : guion.slice(0, paso)
  const escribe = respondiendo || (!reducido && tuyos.length === 0 && !termino && guion[paso].rol === 'ASSISTANT')
  const lead = llegaron.length === guion.length ? CONVERSACION_EN_VIVO.lead : null

  useEffect(() => {
    const el = lista.current
    if (el !== null) el.scrollTo({ top: el.scrollHeight, behavior: reducido ? 'auto' : 'smooth' })
  }, [llegaron.length, tuyos.length, escribe, reducido])

  const preguntar = (pregunta: string, respuesta: string): void => {
    window.clearTimeout(reloj.current)
    if (reducido) {
      setTuyos((m) => [...m, { rol: 'USER', texto: pregunta }, { rol: 'ASSISTANT', texto: respuesta }])
      return
    }
    setTuyos((m) => [...m, { rol: 'USER', texto: pregunta }])
    setRespondiendo(true)
    reloj.current = window.setTimeout(() => {
      setRespondiendo(false)
      setTuyos((m) => [...m, { rol: 'ASSISTANT', texto: respuesta }])
    }, RITMO_DEL_CHAT.escribiendoMs)
  }

  return (
    <div data-chat-que-atiende="" className="flex flex-col overflow-hidden rounded-fuerte border border-tinta/15 bg-fondo shadow-xl shadow-tinta/10">
      <div className="flex items-center gap-3 bg-acento px-4 py-3 text-fondo">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-fondo/15 font-display text-cuerpo font-fuerte">T</span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-cuerpo font-medium">{NOMBRE_DEL_ASISTENTE}</span>
          <span className="flex items-center gap-1.5 font-codigo text-micro tracking-wide uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-fondo" />
            {escribe ? 'escribiendo…' : 'en línea'}
          </span>
        </span>
        <span className="ml-auto hidden shrink-0 font-codigo text-micro tracking-wide uppercase tablet:inline">{AVISO_DEL_EJEMPLO}</span>
      </div>
      <div ref={lista} role="log" aria-live={tuyos.length > 0 ? 'polite' : 'off'} aria-label={`Conversación con ${NOMBRE_DEL_ASISTENTE}`} className="flex h-88 flex-col gap-2.5 overflow-y-auto overscroll-contain bg-superficie-1 px-4 py-4 escritorio:h-104">
        {[...llegaron, ...tuyos].map((m, i) => (
          <Burbuja key={i} mensaje={m} />
        ))}
        {escribe ? <Escribiendo /> : null}
        {lead === null || tuyos.length > 0 ? null : (
          <p className="mt-1 self-center rounded-full border border-acento/40 px-3 py-1 font-codigo text-micro tracking-wide text-acento uppercase">
            {lead.nombre} · {intentLabel(lead.intencion)}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 border-t border-tinta/10 px-4 py-3">
        <p className="font-codigo text-micro tracking-wide text-tinta-media uppercase">
          {ROTULO_DE_PROBALO}
          <span className="tablet:hidden"> · {AVISO_DEL_EJEMPLO}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {PREGUNTAS_SUGERIDAS.map((s) => (
            <button
              key={s.pregunta}
              type="button"
              disabled={respondiendo}
              onClick={() => preguntar(s.pregunta, s.respuesta)}
              className="cursor-pointer rounded-full border border-acento/40 px-3 py-1.5 text-caption text-tinta transition-colors duration-[var(--duracion-rapida)] hover:border-acento hover:bg-acento hover:text-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento disabled:cursor-wait disabled:opacity-50"
            >
              {s.pregunta}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Burbuja({ mensaje }: { readonly mensaje: MensajeDeEjemplo }): React.JSX.Element {
  const delCliente = mensaje.rol === 'USER'
  return (
    <p style={{ maxWidth: '85%' }} className={`rounded-medio px-3.5 py-2 text-cuerpo leading-texto ${delCliente ? 'self-end rounded-br-sutil bg-acento text-fondo' : 'self-start rounded-bl-sutil border border-tinta/10 bg-fondo text-tinta'}`}>
      <span className="sr-only">{delCliente ? 'Cliente: ' : 'Asistente: '}</span>
      {mensaje.texto}
    </p>
  )
}

function Escribiendo(): React.JSX.Element {
  return (
    <span role="status" aria-label="El asistente está escribiendo" className="flex gap-1 self-start rounded-medio border border-tinta/10 bg-fondo px-3.5 py-3">
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-tinta-media motion-reduce:animate-none" style={{ animationDelay: `${String(i * 160)}ms` }} />
      ))}
    </span>
  )
}
