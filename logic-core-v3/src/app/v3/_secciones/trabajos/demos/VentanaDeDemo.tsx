'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Cuerpo } from '../../../_componentes/tipografia/Textos'
import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'
import { VELO_DEL_CTA } from '../tunel'

import {
  ESCALA_DEL_FUNDIDO,
  MS_DE_LA_APERTURA,
  MS_DEL_FUNDIDO,
  cajaFinal,
  poseDeLaApertura,
  type Caja,
} from './apertura'
import { TEXTO_DE_DEMOS, type Demo } from './catalogo'
import { useDialogo } from './dialogo'

/**
 * LA VENTANA DE UNA DEMO — nace de su pieza, se usa acá y vuelve. **[DEMOS]**
 *
 * Un diálogo de verdad (`role="dialog"`, `aria-modal`, foco atrapado, Esc) que
 * vive en un portal a la raíz de /v3, arriba del navbar. Una sola a la vez: la
 * monta `CapaDeDemos` con UNA demo en su estado, y al cerrar se desmonta entera,
 * iframe incluido.
 *
 * ── ⚠️ LA RUEDA Y EL CLIC, CON UN IFRAME DE OTRO ORIGEN ──────────────────
 *
 * Los templates viven en `*.netlify.app`. El pedido proponía una capa
 * transparente que dejara pasar la rueda y tomara el clic: **la rueda no la
 * atraviesa**. Un evento que cae en una capa del documento de afuera no llega
 * nunca al documento de otro origen, y desde afuera no se lo puede scrollear. Una
 * capa así deja la demo muda o la deja sin clic; las dos cosas no se pueden.
 *
 * Lo que se hizo: **sin capa**. La rueda la recibe la demo directo —scroll real,
 * con su inercia— y el clic se detecta por el FOCO: al apretar adentro del iframe
 * el documento de afuera pierde el foco y `document.activeElement` pasa a ser el
 * iframe. Ahí se abre el template en una pestaña nueva y el foco vuelve al
 * diálogo, para que el próximo clic vuelva a notarse. La activación del usuario
 * sube del iframe a la página, así que el navegador no lo bloquea. El precio: el
 * clic también le llega a la demo, y si cae en un enlace suyo, la vista previa
 * navega adentro.
 *
 * ⚠️ El iframe va con `tabIndex={-1}`: Tab no entra a la demo, así que un foco
 * que llega al iframe es siempre un clic y nunca el teclado.
 */

/** Lo que tapa al iframe no puede tomar el puntero. En línea además de la clase: medido, la
 *  imagen de `next/image` con `fill` seguía ganando el `elementFromPoint` con sólo la clase. */
const SIN_PUNTERO = { pointerEvents: 'none' } as const

/** Los colores de la ventana: los de la ventana del CTA, que vive en la sala invertida. */
const SALA = { 'data-seccion': 'invertida' } as const

function cajaDe(el: Element): Caja {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, ancho: r.width, alto: r.height }
}

function correr(ms: number, alCuadro: (t: number) => void, alTerminar: () => void): () => void {
  let cuadro = 0
  let inicio = 0
  const paso = (ahora: number): void => {
    if (inicio === 0) inicio = ahora
    const t = Math.min(ms, ahora - inicio)
    alCuadro(t)
    if (t >= ms) {
      alTerminar()
      return
    }
    cuadro = requestAnimationFrame(paso)
  }
  cuadro = requestAnimationFrame(paso)
  return () => cancelAnimationFrame(cuadro)
}

export function VentanaDeDemo({
  demo,
  pieza,
  alEmpezarACerrar,
  alCerrar,
}: {
  readonly demo: Demo
  readonly pieza: HTMLAnchorElement
  readonly alEmpezarACerrar: () => void
  readonly alCerrar: () => void
}): React.JSX.Element | null {
  const reducido = usePrefiereMenosMovimiento()
  const [raiz] = useState<HTMLElement | null>(() => document.querySelector<HTMLElement>('[data-v3]'))
  const [origen] = useState<Caja>(() => cajaDe(pieza.querySelector('[data-parte="cara"]') ?? pieza))
  const [destino] = useState<Caja>(() => cajaFinal(window.innerWidth, window.innerHeight))
  const [asentada, setAsentada] = useState(false)
  const [cargada, setCargada] = useState(false)
  const [altoDeLaDemo, setAltoDeLaDemo] = useState(destino.alto)
  const dialogo = useRef<HTMLDivElement | null>(null)
  const velo = useRef<HTMLDivElement | null>(null)
  const ventana = useRef<HTMLDivElement | null>(null)
  const cromo = useRef<HTMLDivElement | null>(null)
  const portada = useRef<HTMLSpanElement | null>(null)
  const marco = useRef<HTMLIFrameElement | null>(null)
  const primerControl = useRef<HTMLButtonElement | null>(null)
  const desplazamiento = useRef<SVGFEDisplacementMapElement | null>(null)
  const cancelar = useRef<() => void>(() => undefined)
  const cerrando = useRef(false)

  /** Escribe una pose de la línea de tiempo: caja, filtro, portada y velo. */
  const pintar = useCallback(
    (ms: number): void => {
      const v = ventana.current
      if (v === null) return
      const pose = poseDeLaApertura(ms, origen, destino)
      v.style.setProperty('left', `${pose.caja.x.toFixed(2)}px`)
      v.style.setProperty('top', `${pose.caja.y.toFixed(2)}px`)
      v.style.setProperty('width', `${pose.caja.ancho.toFixed(2)}px`)
      v.style.setProperty('height', `${pose.caja.alto.toFixed(2)}px`)
      const liquido = pose.liquido > 0.05
      desplazamiento.current?.setAttribute('scale', pose.liquido.toFixed(2))
      v.style.setProperty('filter', liquido ? 'url(#demos-liquido)' : 'none')
      portada.current?.style.setProperty('opacity', pose.portada.toFixed(3))
      // El cromo aparece con el tiempo sólido, a medida que los bordes se asientan.
      cromo.current?.style.setProperty('opacity', ((1 - pose.portada) ** 2).toFixed(3))
      velo.current?.style.setProperty('opacity', (VELO_DEL_CTA * Math.min(1, ms / MS_DE_LA_APERTURA)).toFixed(3))
    },
    [origen, destino],
  )

  /** Movimiento reducido: la ventana ya en su lugar, un fundido y una escala corta. */
  const fundir = useCallback(
    (hacia: 0 | 1, alTerminar: () => void): (() => void) => {
      pintar(MS_DE_LA_APERTURA)
      return correr(
        MS_DEL_FUNDIDO,
        (t) => {
          const u = hacia === 1 ? t / MS_DEL_FUNDIDO : 1 - t / MS_DEL_FUNDIDO
          ventana.current?.style.setProperty('opacity', u.toFixed(3))
          ventana.current?.style.setProperty('transform', `scale(${(ESCALA_DEL_FUNDIDO + (1 - ESCALA_DEL_FUNDIDO) * u).toFixed(4)})`)
          velo.current?.style.setProperty('opacity', (VELO_DEL_CTA * u).toFixed(3))
        },
        alTerminar,
      )
    },
    [pintar],
  )

  // LA APERTURA. La pieza de origen se apaga: la ventana ES ella, desprendida.
  useLayoutEffect(() => {
    const cara = pieza.querySelector<HTMLElement>('[data-parte="cara"]')
    cara?.style.setProperty('visibility', 'hidden')
    if (cromo.current !== null) setAltoDeLaDemo(destino.alto - cromo.current.offsetHeight)
    if (reducido) {
      cancelar.current = fundir(1, () => setAsentada(true))
    } else {
      pintar(0)
      cancelar.current = correr(MS_DE_LA_APERTURA, pintar, () => setAsentada(true))
    }
    return () => {
      cancelar.current()
      cara?.style.removeProperty('visibility')
    }
  }, [pieza, destino, reducido, pintar, fundir])

  // EL CIERRE: la misma línea al revés, y al final el foco vuelve a su pieza.
  const cerrar = useCallback((): void => {
    if (cerrando.current) return
    cerrando.current = true
    cancelar.current()
    setAsentada(false)
    alEmpezarACerrar()
    const terminar = (): void => {
      pieza.querySelector<HTMLElement>('[data-parte="cara"]')?.style.removeProperty('visibility')
      alCerrar()
      // Un cuadro después: con el diálogo todavía montado, su trampa de foco lo
      // devolvería adentro.
      requestAnimationFrame(() => pieza.focus({ preventScroll: true }))
    }
    cancelar.current = reducido
      ? fundir(0, terminar)
      : correr(MS_DE_LA_APERTURA, (t) => pintar(MS_DE_LA_APERTURA - t), terminar)
  }, [alCerrar, alEmpezarACerrar, fundir, pieza, pintar, reducido])

  useDialogo(dialogo, cerrar)

  // EL CLIC ADENTRO DE LA DEMO: se nota por el foco (ver el docblock). Dos señales
  // del mismo hecho —la ventana pierde el foco, o lo pierde un control del
  // diálogo— porque la primera no llega si la ventana del sistema no lo tenía.
  useEffect(() => {
    const caja = dialogo.current
    let ultima = 0
    const alPerderElFoco = (): void => {
      window.setTimeout(() => {
        if (document.activeElement !== marco.current || cerrando.current) return
        const ahora = performance.now()
        if (ahora - ultima < 500) return
        ultima = ahora
        window.open(demo.url, '_blank', 'noopener,noreferrer')
        primerControl.current?.focus({ preventScroll: true })
      }, 0)
    }
    window.addEventListener('blur', alPerderElFoco)
    caja?.addEventListener('focusout', alPerderElFoco)
    return () => {
      window.removeEventListener('blur', alPerderElFoco)
      caja?.removeEventListener('focusout', alPerderElFoco)
    }
  }, [demo.url])

  if (raiz === null) return null
  const viva = asentada && cargada
  const direccion = demo.url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return createPortal(
    <div ref={dialogo} data-pieza="dialogo-de-demo" data-lenis-prevent="" className="fixed inset-0 z-[var(--z-overlay)]">
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id="demos-liquido" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={2} seed={4} result="ruido" />
          <feDisplacementMap ref={desplazamiento} in="SourceGraphic" in2="ruido" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {/* EL VELO DEL CTA, el mismo: `bg-fondo` de la sala invertida a `VELO_DEL_CTA`.
          Un clic afuera de la ventana cae acá y cierra. */}
      <div {...SALA} ref={velo} aria-hidden="true" className="bg-fondo absolute inset-0" style={{ opacity: 0 }} onClick={cerrar} />
      <div
        {...SALA}
        ref={ventana}
        role="dialog"
        aria-modal="true"
        aria-label={`${demo.nombre} — demo en vivo`}
        data-demo={demo.slug}
        className="bg-tinta text-fondo rounded-sutil fixed flex flex-col overflow-hidden will-change-transform"
        style={{ left: origen.x, top: origen.y, width: origen.ancho, height: origen.alto }}
      >
        {/* EL CROMO de la ventana del CTA: el semáforo y la barra con la URL real.
            El rojo cierra, y como casi nadie lo sabe, también hay una cruz. */}
        <div ref={cromo} className="flex shrink-0 items-center gap-2 px-5 py-4" style={{ opacity: 0 }}>
          <button ref={primerControl} type="button" aria-label={TEXTO_DE_DEMOS.cerrar} onClick={cerrar} className="bg-semaforo-rojo block size-3 rounded-full" />
          <span aria-hidden="true" className="bg-semaforo-amarillo block size-3 rounded-full" />
          <span aria-hidden="true" className="bg-semaforo-verde block size-3 rounded-full" />
          <a href={demo.url} target="_blank" rel="noopener noreferrer" className="border-fondo rounded-sutil ml-4 min-w-0 flex-1 truncate border px-3 py-1 text-center">
            <Cuerpo como="span" className="font-codigo">
              {direccion}
            </Cuerpo>
          </a>
          <button type="button" aria-label={TEXTO_DE_DEMOS.cerrar} onClick={cerrar} className="ml-4 flex size-8 items-center justify-center rounded-full">
            <X aria-hidden="true" strokeWidth={1.5} className="size-5" />
          </button>
        </div>
        <div {...SALA} className="bg-fondo relative min-h-0 flex-1 overflow-hidden">
          <Esqueleto />
          <iframe
            ref={marco}
            src={demo.url}
            title={`${demo.nombre} — demo en vivo`}
            tabIndex={-1}
            onLoad={() => setCargada(true)}
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute top-0 left-0 border-0 transition-opacity duration-300"
            style={{ width: destino.ancho, height: altoDeLaDemo, opacity: viva ? 1 : 0, visibility: viva ? 'visible' : 'hidden' }}
          />
          {/* La portada sólo existe mientras la ventana se mueve: asentada, se desmonta
              y no queda NADA encima de la demo, que así recibe la rueda y el clic. */}
          {asentada ? null : (
            <span ref={portada} aria-hidden="true" className="pointer-events-none absolute inset-0" style={SIN_PUNTERO}>
              <Image src={demo.portada} alt="" fill sizes="160px" className="object-cover object-top" style={SIN_PUNTERO} />
            </span>
          )}
        </div>
      </div>
      {/* El cartel del navbar, AFUERA de la ventana: la paleta de la sala lo daría vuelta. */}
      {viva ? (
        <span
          aria-hidden="true"
          data-pieza="cartel-de-demos"
          className="text-cuerpo tracking-texto leading-texto font-semi fixed -translate-x-1/2 -translate-y-full"
          style={{ left: destino.x + destino.ancho / 2, top: `calc(${(destino.y + destino.alto).toFixed(1)}px - var(--spacing-6))` }}
        >
          {TEXTO_DE_DEMOS.cartelDeLaVisita}
        </span>
      ) : null}
    </div>,
    raiz,
  )
}

/** Mientras carga: la forma de una página, en los tonos de la sala. Nunca un blanco. */
function Esqueleto(): React.JSX.Element {
  return (
    <div aria-hidden="true" data-pieza="esqueleto-de-demo" className="absolute inset-0 flex animate-pulse flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="bg-tinta opacity-tenue rounded-sutil h-4 w-1/5" />
        <div className="flex gap-4">
          <div className="bg-tinta opacity-tenue rounded-sutil h-3 w-12" />
          <div className="bg-tinta opacity-tenue rounded-sutil h-3 w-12" />
          <div className="bg-tinta opacity-tenue rounded-sutil h-3 w-12" />
        </div>
      </div>
      <div className="bg-tinta opacity-tenue rounded-sutil mt-12 h-12 w-3/5" />
      <div className="bg-tinta opacity-tenue rounded-sutil h-4 w-2/5" />
      <div className="bg-tinta opacity-tenue rounded-sutil min-h-0 flex-1" />
    </div>
  )
}
