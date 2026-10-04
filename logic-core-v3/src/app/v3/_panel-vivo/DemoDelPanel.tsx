'use client'

import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'

import { CONSULTA_ESCENARIO } from '../_lib/compuerta'
import { useAnchoMinimo } from '../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'
import { NOMBRE_DE_LA_DEMO, type IdDeDemo } from './catalogo'
import { informarVisibilidad, laQueCorre, montarEnTurno, suscribirAlEscenario } from './escenario'
import { ReproduccionDeLaDemo, usePestanaVisible, type Reproduccion } from './reproduccion'

/**
 * [NOCTURNO] B · LA DEMO DEL PANEL, EN LA PÁGINA — liviana: lo pesado (los componentes del dashboard, los datos de
 * ejemplo, el marco) llega en un `import()` por demo, recién cuando su tarjeta se acerca a la pantalla.
 *
 * [RETOQUE PANEL] T1 · EN SU LUGAR: la demo se usa ahí mismo, en su tarjeta (la miniatura y la ampliación se fueron).
 *   · Escritorio: se dibuja a la pantalla de panel que necesita (`pantalla`, px) y se escala a la caja de la tarjeta, que
 *     tiene su misma proporción ([PASADA FINAL] B1: el panel entero a escala reducida, sin scroll adentro casi nunca).
 *   · Abajo de 1024: el ancho de la columna y su alto, sin escala: el diseño del propio panel en el teléfono.
 *   · Se mueve sola sólo a la vista y con la pestaña visible, con su «Pausar» (WCAG 2.2.2); con movimiento reducido, a mano.
 *     [PASADA FINAL] B3: y sólo LA MÁS VISIBLE de las que están en cuadro (`escenario.ts`); las demás, congeladas (sus
 *     pasos no avanzan y sus animaciones de CSS quedan pausadas).
 *   · Debajo queda la captura (`respaldo`): el HTML del servidor, lo que se ve sin JS y mientras la demo llega. B3: el
 *     montaje se escalona (una demo por turno) cuando varias se acercan juntas.
 *   · Teclado: arranca con «Saltar la demo», que lleva a la tarjeta siguiente (o a lo que sigue a la galería).
 */
type Demo = LazyExoticComponent<ComponentType>

const DEMOS: Readonly<Record<IdDeDemo, Demo>> = {
  conversaciones: lazy(() => import('./demos/chatbot/Conversaciones')),
  leads: lazy(() => import('./demos/leads/Leads')),
  tickets: lazy(() => import('./demos/tickets/Tickets')),
  mensajes: lazy(() => import('./demos/mensajes/Mensajes')),
  servicios: lazy(() => import('./demos/servicios/Servicios')),
  proyecto: lazy(() => import('./demos/proyecto/Proyecto')),
  resultados: lazy(() => import('./demos/resultados/Resultados')),
  informacion: lazy(() => import('./demos/chatbot/LoQueSabe')),
}

/** La pantalla de panel a la que se dibuja una demo en escritorio (px). */
export interface PantallaDeLaDemo {
  readonly ancho: number
  readonly alto: number
}

/** Desde qué ancho de pantalla de panel (px) la demo lleva la barra lateral: más angosta, se cierra (como el panel real abajo de `lg`). */
export const ANCHO_CON_BARRA = 860

/** Cuánto antes de entrar al cuadro se descarga y se monta: el paso de la captura a la demo no se ve. */
const ANTES_DE_ENTRAR = '0px 0px 50% 0px'

/** Con qué fracciones de sí misma en el cuadro avisa la demo (para que corra la más visible). */
const FRACCIONES = [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1]

/** Lo que se puede enfocar (para saltar la demo con el teclado). */
const FOCALIZABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Las animaciones de CSS de la demo (los latidos, los giros), pausadas cuando no corre. */
const CONGELADA = '[&_*]:[animation-play-state:paused]'

export function DemoEnSuLugar({ demo, pantalla, respaldo }: { readonly demo: IdDeDemo; readonly pantalla: PantallaDeLaDemo; readonly respaldo: ReactNode }): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const [montada, setMontada] = useState(false)
  const [escala, setEscala] = useState(0)
  const [pausada, setPausada] = useState(false)
  const reducido = usePrefiereMenosMovimiento()
  const pestana = usePestanaVisible()
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const laMasVisible = useSyncExternalStore(suscribirAlEscenario, () => laQueCorre() === demo, () => false)
  useEffect(() => {
    const el = caja.current
    if (el === null) return undefined
    let cancelarElTurno = (): void => undefined
    const cerca = new IntersectionObserver(
      (c) => {
        if (!c.some((e) => e.isIntersecting)) return
        cerca.disconnect()
        cancelarElTurno = montarEnTurno(() => setMontada(true))
      },
      { rootMargin: ANTES_DE_ENTRAR },
    )
    const vista = new IntersectionObserver((c) => informarVisibilidad(demo, c[c.length - 1]?.isIntersecting === true ? (c[c.length - 1]?.intersectionRatio ?? 0) : 0), { threshold: FRACCIONES })
    const medida = new ResizeObserver(() => setEscala(el.clientWidth / pantalla.ancho))
    cerca.observe(el)
    vista.observe(el)
    medida.observe(el)
    return () => {
      cancelarElTurno()
      cerca.disconnect()
      vista.disconnect()
      medida.disconnect()
      informarVisibilidad(demo, 0)
    }
  }, [demo, pantalla.ancho])
  const Demo = DEMOS[demo]
  const corre = laMasVisible && pestana && !pausada && !reducido
  const reproduccion: Reproduccion = { corre, reducido, pausada, alternarPausa: () => setPausada((p) => !p), conBarra: pantalla.ancho >= ANCHO_CON_BARRA }
  const escalada = escritorio && escala > 0
  return (
    <div ref={caja} className="absolute inset-0 overflow-hidden">
      {respaldo}
      {montada && (
        <div
          role="region"
          aria-label={`Demo de ${NOMBRE_DE_LA_DEMO[demo]}, con datos de ejemplo`}
          data-pieza="demo-del-panel"
          data-corre={corre ? '' : undefined}
          className={`${escalada ? 'absolute top-0 left-0 origin-top-left' : 'absolute inset-0'}${corre ? '' : ` ${CONGELADA}`}`}
          style={escalada ? { width: pantalla.ancho, height: pantalla.alto, transform: `scale(${escala.toFixed(4)})` } : undefined}
        >
          <button type="button" data-parte="saltar-la-demo" onClick={(e) => saltarLaDemo(e.currentTarget)} className="sr-only z-30 rounded-full bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus-visible:outline-2 focus-visible:outline-cyan-400">
            Saltar la demo
          </button>
          <ReproduccionDeLaDemo.Provider value={reproduccion}>
            <Suspense fallback={null}>
              <Demo />
            </Suspense>
          </ReproduccionDeLaDemo.Provider>
        </div>
      )}
    </div>
  )
}

/**
 * Con el teclado, la demo entera es un salto: a la tarjeta siguiente (que se enfoca, se pone a la vista y monta su demo)
 * o, después de la última, a lo primero enfocable que sigue a la galería.
 */
function saltarLaDemo(boton: HTMLElement): void {
  const tarjeta = boton.closest('li')
  const siguiente = tarjeta?.nextElementSibling
  if (siguiente instanceof HTMLElement) {
    siguiente.focus()
    return
  }
  const lista = tarjeta?.parentElement
  if (lista === null || lista === undefined) return
  const despues = [...document.querySelectorAll<HTMLElement>(FOCALIZABLES)].find((el) => (lista.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 && !lista.contains(el))
  despues?.focus()
}
