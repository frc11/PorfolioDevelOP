'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'
import { VELO_DEL_CTA } from '../tunel'

import { ESCALA_DEL_FUNDIDO, MS_DEL_FUNDIDO, cajaFinal } from './apertura'
import { TEXTO_DE_DEMOS, type Demo } from './catalogo'
import { CromoDeLaVentana } from './CromoDeLaVentana'
import { useDialogo } from './dialogo'
import { MS_DEL_GENIE, type Caja } from './genie'
import { GenieDeDemo, type ControlDelGenie } from './GenieDeDemo'

/**
 * LA VENTANA DE UNA DEMO — sale de su libro con el Genie, se usa acá y vuelve.
 * **[DEMOS]**
 *
 * Un diálogo de verdad (`role="dialog"`, `aria-modal`, foco atrapado, Esc) en un
 * portal a la raíz de /v3, arriba del navbar. Una sola a la vez: la monta
 * `CapaDeDemos` con UNA demo en su estado, y al cerrar se desmonta entera.
 *
 * ── LA COREOGRAFÍA ────────────────────────────────────────────────────────
 *
 * La ventana VIVA no se mueve nunca: está en su caja final desde el primer cuadro,
 * escondida mientras el Genie (`GenieDeDemo`) hace el viaje con la portada
 * horizontal del template. Al abrir, la última pose del Genie es la ventana plana
 * con esa misma portada, así que el relevo no se ve; recién ahí se monta el
 * iframe, que se funde encima de la portada cuando carga. Al cerrar, la ventana se
 * congela en la portada, el Genie toma su lugar y se va al libro, que la recibe.
 *
 * ── ⚠️ LA RUEDA Y EL CLIC, CON UN IFRAME DE OTRO ORIGEN ──────────────────
 *
 * Una capa transparente no deja pasar la rueda a un documento de otro origen, así
 * que no hay capa: la rueda la recibe la demo directo, y el clic se detecta por el
 * FOCO que se va al iframe (el documento de afuera lo pierde). Ahí se abre el
 * template en otra pestaña y el foco vuelve al diálogo. El iframe va con
 * `tabIndex={-1}`: un foco que llega a él es siempre un clic, nunca el teclado.
 */

/** Los colores de la ventana: los de la ventana del CTA, que vive en la sala invertida. */
const SALA = { 'data-seccion': 'invertida' } as const

/** En qué fracción del Genie la pieza y la ventana se relevan en el libro. */
const RELEVO_EN_EL_LIBRO = 0.12

type Fase = 'abriendo' | 'abierta' | 'cerrando'

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
  const [libro] = useState<Caja>(() => cajaDe(pieza.querySelector('[data-parte="cara"]') ?? pieza))
  const [final] = useState<Caja>(() => cajaFinal(window.innerWidth, window.innerHeight))
  const [fase, setFase] = useState<Fase>('abriendo')
  const [cargada, setCargada] = useState(false)
  const dialogo = useRef<HTMLDivElement | null>(null)
  const velo = useRef<HTMLDivElement | null>(null)
  const ventana = useRef<HTMLDivElement | null>(null)
  const genie = useRef<HTMLDivElement | null>(null)
  const pintor = useRef<ControlDelGenie | null>(null)
  const marco = useRef<HTMLIFrameElement | null>(null)
  const primerControl = useRef<HTMLButtonElement | null>(null)
  const cancelar = useRef<() => void>(() => undefined)
  const cerrando = useRef(false)

  const cara = useCallback((): HTMLElement | null => pieza.querySelector<HTMLElement>('[data-parte="cara"]'), [pieza])

  /** Un cuadro del Genie: `m` es cuánto está minimizada (1 = adentro del libro). */
  const cuadroDelGenie = useCallback(
    (m: number): void => {
      pintor.current?.pintar(m)
      const afuera = 1 - m
      genie.current?.style.setProperty('opacity', Math.min(1, afuera / RELEVO_EN_EL_LIBRO).toFixed(3))
      cara()?.style.setProperty('visibility', afuera >= RELEVO_EN_EL_LIBRO ? 'hidden' : 'visible')
      velo.current?.style.setProperty('opacity', (VELO_DEL_CTA * afuera).toFixed(3))
    },
    [cara],
  )

  /** Movimiento reducido: sin Genie. La ventana en su lugar, un fundido y una escala corta. */
  const fundir = useCallback((hacia: 0 | 1, alTerminar: () => void): (() => void) => {
    ventana.current?.style.setProperty('visibility', 'visible')
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
  }, [])

  // LA APERTURA: el Genie de minimizar, recorrido al revés desde el libro.
  useLayoutEffect(() => {
    if (reducido) {
      cara()?.style.setProperty('visibility', 'hidden')
      genie.current?.style.setProperty('visibility', 'hidden')
      cancelar.current = fundir(1, () => setFase('abierta'))
    } else {
      cuadroDelGenie(1)
      // ⚠️ Arranca UN CUADRO DESPUÉS: el cuadro del clic es el que monta el diálogo
      // y las tiras, y contar el tiempo desde ahí era perder los primeros cuadros.
      const cuadro = requestAnimationFrame(() => {
        cancelar.current = correr(MS_DEL_GENIE, (t) => cuadroDelGenie(1 - t / MS_DEL_GENIE), () => {
          ventana.current?.style.setProperty('visibility', 'visible')
          genie.current?.style.setProperty('visibility', 'hidden')
          // Recién visible puede tomar el foco: durante el Genie la ventana está escondida.
          primerControl.current?.focus({ preventScroll: true })
          setFase('abierta')
        })
      })
      cancelar.current = () => cancelAnimationFrame(cuadro)
    }
    return () => {
      cancelar.current()
      cara()?.style.removeProperty('visibility')
    }
  }, [reducido, cara, cuadroDelGenie, fundir])

  // EL CIERRE: se congela en la portada, y el Genie la lleva al libro.
  const cerrar = useCallback((): void => {
    if (cerrando.current) return
    cerrando.current = true
    cancelar.current()
    setFase('cerrando')
    alEmpezarACerrar()
    const terminar = (): void => {
      cara()?.style.removeProperty('visibility')
      alCerrar()
      // Un cuadro después: con el diálogo todavía montado, su trampa de foco lo
      // devolvería adentro.
      requestAnimationFrame(() => pieza.focus({ preventScroll: true }))
    }
    if (reducido) {
      cancelar.current = fundir(0, terminar)
      return
    }
    ventana.current?.style.setProperty('visibility', 'hidden')
    genie.current?.style.setProperty('visibility', 'visible')
    cuadroDelGenie(0)
    cancelar.current = correr(MS_DEL_GENIE, (t) => cuadroDelGenie(t / MS_DEL_GENIE), terminar)
  }, [alCerrar, alEmpezarACerrar, cara, cuadroDelGenie, fundir, pieza, reducido])

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
  const abierta = fase === 'abierta'
  const viva = abierta && cargada
  const portada = { backgroundImage: `url(${demo.ventana})`, backgroundSize: 'cover', backgroundPosition: 'top center' }

  return createPortal(
    <div ref={dialogo} data-pieza="dialogo-de-demo" data-lenis-prevent="" className="fixed inset-0 z-[var(--z-overlay)]">
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
        className="bg-tinta text-fondo rounded-sutil fixed flex flex-col overflow-hidden"
        style={{ left: final.x, top: final.y, width: final.ancho, height: final.alto, visibility: 'hidden' }}
      >
        <CromoDeLaVentana demo={demo} alCerrar={cerrar} refDelPrimerControl={primerControl} />
        <div {...SALA} className="bg-fondo relative min-h-0 flex-1 overflow-hidden">
          <Esqueleto />
          {/* La portada horizontal: la misma imagen que curva el Genie. Mientras la
              demo carga se ve ésta, y la demo se funde encima. */}
          <div aria-hidden="true" data-pieza="portada-de-la-ventana" className="pointer-events-none absolute inset-0" style={portada} />
          {/* La demo se monta con la ventana ya abierta: no viaja en el Genie. */}
          {abierta ? (
            <iframe
              ref={marco}
              src={demo.url}
              title={`${demo.nombre} — demo en vivo`}
              tabIndex={-1}
              onLoad={() => setCargada(true)}
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 transition-opacity duration-500"
              style={{ opacity: viva ? 1 : 0 }}
            />
          ) : null}
        </div>
      </div>
      <div ref={genie}>
        <GenieDeDemo ref={pintor} demo={demo} ventana={final} destino={libro} />
      </div>
      {/* El cartel del navbar, AFUERA de la ventana: la paleta de la sala lo daría vuelta. */}
      {viva ? (
        <span
          aria-hidden="true"
          data-pieza="cartel-de-demos"
          className="text-cuerpo tracking-texto leading-texto font-semi fixed -translate-x-1/2 -translate-y-full"
          style={{ left: final.x + final.ancho / 2, top: `calc(${(final.y + final.alto).toFixed(1)}px - var(--spacing-6))` }}
        >
          {TEXTO_DE_DEMOS.cartelDeLaVisita}
        </span>
      ) : null}
    </div>,
    raiz,
  )
}

/** Debajo de la portada, por si no llegó: la forma de una página, en los tonos de la sala. */
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
