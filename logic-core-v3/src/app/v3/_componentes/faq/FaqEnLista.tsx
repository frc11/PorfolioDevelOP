'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { useTonoDebajo } from '../../_chrome/menu/useTonoDebajo'
import { tomarLosGestos } from '../../_lib/gestosDelScroll'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { ATRIBUTO_DEL_FAQ } from '../../_lib/pie3d/faqDelPie'
import { Envoltorio } from '../layout/Envoltorio'
import { Cuerpo } from '../tipografia/Textos'
import { Titular } from '../tipografia/Titular'
import { alternarLaRespuesta, preguntaConLaTecla, tonoDeLaLista } from './acordeonDelFaq'
import { IDS_DEL_FAQ, TEXTOS_DEL_FAQ, type PreguntaFrecuente } from './preguntas'

/**
 * [B10] EL FAQ EN LISTA — en el teléfono y la tablet (abajo de 1024) y con menos movimiento: después del pie, sin el bloque de WhatsApp
 * (ya está el del pie, justo arriba).
 *
 * [C2 · 71t] Sin fondo liso: UN panel del vidrio líquido del sitio (`[data-material="vidrio"]`, `vidrio.css`: el desenfoque de la escena
 * de atrás, el filo de luz y el reflejo de arriba; el mismo material que el formulario del pie) con el título y un ACORDEÓN: cada pregunta
 * es un botón (`aria-expanded`, `aria-controls`) que abre su respuesta debajo, una abierta a la vez (`acordeonDelFaq.ts`), con el mismo
 * despliegue que el acordeón de Servicios del menú; con menos movimiento, sin animación. Las respuestas cerradas siguen en el DOM
 * (`inert`: fuera del teclado y del lector) y todas en los datos estructurados (`FaqDelPie`). El tono del vidrio, el del pie.
 *
 * `colgada` (el home): cuelga después del pie FUERA del layout (`absolute`, debajo de la sección): suma desborde para scrollear, no alto
 * al documento, así el final del pie sigue siendo el fondo del layout (`cuadroDelFinal.ts` mide `offsetHeight`: el encastre corre al
 * fondo del pie, como siempre) y la escena (las secciones) no se corre. Mientras se ve, los gestos de scroll son de la página: el final no
 * los retiene para rebobinar el encastre que la lista tapa.
 */
export function FaqEnLista({ preguntas, colgada }: { readonly preguntas: readonly PreguntaFrecuente[]; readonly colgada: boolean }): React.JSX.Element {
  const raiz = useRef<HTMLDivElement | null>(null)
  const sonda = useRef<HTMLSpanElement | null>(null)
  const botones = useRef<(HTMLButtonElement | null)[]>([])
  const [abierta, setAbierta] = useState<number | null>(null)
  const [cerca, setCerca] = useState(false)
  const [enLaSalaInvertida, setEnLaSalaInvertida] = useState(false)
  const reducido = useMovimientoReducido()
  useEffect(() => {
    const el = raiz.current
    if (!colgada || el === null) return undefined
    // A la vista (con unos px adentro: con el pie justo al fondo la lista recién toca el borde, y ahí el gesto sigue siendo del final).
    let aLaVista = false
    const vigia = new IntersectionObserver(([e]) => {
      aLaVista = e?.isIntersecting ?? false
    }, { rootMargin: '0px 0px -8px 0px' })
    vigia.observe(el)
    const soltar = tomarLosGestos(() => (aLaVista ? 'suelta' : 'sigue'))
    return () => {
      vigia.disconnect()
      soltar()
    }
  }, [colgada])
  // El tono se lee sólo cerca de la vista (media pantalla antes: la lista entra ya con el suyo).
  useEffect(() => {
    const el = raiz.current
    if (el === null) return undefined
    const vigia = new IntersectionObserver(([e]) => {
      const visible = e?.isIntersecting ?? false
      setCerca(visible)
      if (visible) setEnLaSalaInvertida((el.parentElement?.closest('[data-seccion="invertida"]') ?? null) !== null)
    }, { rootMargin: '50% 0px 50% 0px' })
    vigia.observe(el)
    return () => vigia.disconnect()
  }, [])
  const debajo = useTonoDebajo(sonda, cerca)
  const oscuro = tonoDeLaLista(debajo, enLaSalaInvertida) === 'oscuro'
  const alApretar = (e: React.KeyboardEvent<HTMLButtonElement>, i: number): void => {
    const destino = preguntaConLaTecla(e.key, i, preguntas.length)
    if (destino === null) return
    e.preventDefault()
    botones.current[destino]?.focus()
  }
  return (
    <div ref={raiz} {...{ [ATRIBUTO_DEL_FAQ]: 'lista' }} className={cn('text-tinta', colgada ? 'absolute inset-x-0 top-full' : 'relative')}>
      {/* La sonda del tono: una franja justo arriba de la lista, adentro de lo que la lista continúa (el pie). */}
      <span ref={sonda} aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-full h-[var(--spacing-2)]" />
      <Envoltorio claseDeContenido="py-[var(--spacing-12)]">
        <div
          data-material="vidrio"
          data-seccion={oscuro ? 'invertida' : undefined}
          className="mx-auto flex w-full max-w-[calc(var(--spacing-20)*9)] flex-col gap-[var(--spacing-2)] p-[var(--spacing-4)] tablet:p-[var(--spacing-6)]"
        >
          <Titular nivel="titulo-m" como="h2" id={IDS_DEL_FAQ.titulo} className="text-balance">
            {TEXTOS_DEL_FAQ.titulo}
          </Titular>
          <ul role="list" className="flex flex-col">
            {preguntas.map((p, i) => (
              <FilaDelFaq
                key={p.pregunta}
                pregunta={p}
                indice={i}
                abierta={abierta === i}
                reducido={reducido}
                alTocar={() => setAbierta((a) => alternarLaRespuesta(a, i))}
                alApretar={(e) => alApretar(e, i)}
                boton={(el) => {
                  botones.current[i] = el
                }}
              />
            ))}
          </ul>
        </div>
      </Envoltorio>
    </div>
  )
}

/** El despliegue (el del acordeón de Servicios del menú): la fila crece de cero a su alto y la respuesta aparece; sin él, de golpe. */
const DESPLIEGUE = 'duration-[var(--duracion-media)] ease-[var(--ease-principal)] motion-reduce:transition-none'

export interface PropsDeLaFila {
  readonly pregunta: PreguntaFrecuente
  readonly indice: number
  readonly abierta: boolean
  readonly reducido: boolean
  readonly alTocar: () => void
  readonly alApretar: (e: React.KeyboardEvent<HTMLButtonElement>) => void
  readonly boton: (el: HTMLButtonElement | null) => void
}

/** Una pregunta del acordeón: el botón (en su `h3`) y, debajo, su respuesta, siempre en el DOM; cerrada, sin alto e `inert`. */
export function FilaDelFaq({ pregunta, indice, abierta, reducido, alTocar, alApretar, boton }: PropsDeLaFila): React.JSX.Element {
  return (
    <li className="border-t border-current/15 first:border-t-0">
      <Titular nivel="titulo-s" como="h3" peso="medio">
        <button
          type="button"
          ref={boton}
          id={IDS_DEL_FAQ.pregunta(indice)}
          aria-expanded={abierta}
          aria-controls={IDS_DEL_FAQ.respuesta(indice)}
          onClick={alTocar}
          onKeyDown={alApretar}
          className="flex w-full items-center justify-between gap-[var(--spacing-4)] py-[var(--spacing-4)] text-left"
        >
          <span>{pregunta.pregunta}</span>
          <ChevronDown aria-hidden="true" strokeWidth={1.5} className={cn('size-[var(--spacing-5)] shrink-0', !reducido && `transition-transform ${DESPLIEGUE}`, abierta && 'rotate-180')} />
        </button>
      </Titular>
      <div
        id={IDS_DEL_FAQ.respuesta(indice)}
        data-abierta={abierta ? 'si' : 'no'}
        inert={!abierta}
        className={cn('grid', !reducido && `transition-[grid-template-rows] ${DESPLIEGUE}`, abierta ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
      >
        <div className="min-h-0 overflow-hidden">
          <Cuerpo className={cn('pb-[var(--spacing-4)]', !reducido && `transition-opacity ${DESPLIEGUE}`, abierta ? 'opacity-100' : 'opacity-0')}>{pregunta.respuesta}</Cuerpo>
        </div>
      </div>
    </li>
  )
}
