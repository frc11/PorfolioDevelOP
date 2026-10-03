'use client'

import { lazy, Suspense, useEffect, useState, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { CONSULTA_ESCENARIO } from '../_lib/compuerta'
import { useAnchoMinimo } from '../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'
import { NOMBRE_DE_LA_DEMO, type IdDeDemo } from './catalogo'
import { ReproduccionDeLaDemo, marcarLaDemoGrande, useDemoGrandeAbierta, usePestanaVisible, type Reproduccion } from './reproduccion'

/**
 * [NOCTURNO] B · LA DEMO DEL PANEL, EN LA PÁGINA — liviana: lo pesado (los componentes del dashboard, los datos de
 * ejemplo, el marco) llega en un `import()` por demo, recién cuando su tarjeta entra en pantalla (o se abre la grande).
 *
 *   · `MiniaturaDeLaDemo` va en el marco de la tarjeta, encima de la captura (que queda debajo: es el HTML del servidor, el
 *     respaldo sin JS y lo que se ve mientras la demo llega). Es la demo entera, dibujada a un tamaño de pantalla de panel
 *     y escalada al marco; inerte y fuera del árbol de lectura (la tarjeta sigue siendo UN botón que abre la grande). Se
 *     monta en un portal: así sus botones no quedan anidados en el botón de la tarjeta para React.
 *   · `DemoCompleta` va en la ampliación: la misma demo, a tamaño real y usable (teclado, foco, lector).
 */
export interface PropsDeLaDemo {
  /** En la grande: ir a otra demo (la barra lateral del panel). */
  readonly irA?: (demo: IdDeDemo) => void
}

type Demo = LazyExoticComponent<ComponentType<PropsDeLaDemo>>

/** Las demos que ya existen; las demás features siguen con su captura. */
const DEMOS: Partial<Record<IdDeDemo, Demo>> = {
  conversaciones: lazy(() => import('./demos/chatbot/Conversaciones')),
  leads: lazy(() => import('./demos/leads/Leads')),
  informacion: lazy(() => import('./demos/chatbot/LoQueSabe')),
}

export function hayDemo(demo: IdDeDemo): boolean {
  return DEMOS[demo] !== undefined
}

/** El tamaño de pantalla al que se dibuja la miniatura (px): un panel de escritorio, o uno angosto abajo de 1024. */
export const PANTALLA_DE_LA_MINIATURA = { escritorio: { ancho: 1120, alto: 700 }, angosto: { ancho: 640, alto: 400 } } as const

export function MiniaturaDeLaDemo({ demo }: { readonly demo: IdDeDemo }): React.JSX.Element | null {
  const [caja, setCaja] = useState<HTMLSpanElement | null>(null)
  const [vista, setVista] = useState({ aLaVista: false, entrada: 0 })
  const [escala, setEscala] = useState(0)
  const reducido = usePrefiereMenosMovimiento()
  const grande = useDemoGrandeAbierta()
  const pestana = usePestanaVisible()
  const pantalla = useAnchoMinimo(CONSULTA_ESCENARIO) ? PANTALLA_DE_LA_MINIATURA.escritorio : PANTALLA_DE_LA_MINIATURA.angosto
  const Demo = DEMOS[demo]
  useEffect(() => {
    if (caja === null || Demo === undefined) return undefined
    const vigia = new IntersectionObserver((entradas) => {
      const ahora = entradas.some((e) => e.isIntersecting)
      setVista((v) => (v.aLaVista === ahora ? v : { aLaVista: ahora, entrada: ahora ? v.entrada + 1 : v.entrada }))
    })
    const medida = new ResizeObserver(() => setEscala(caja.clientWidth / pantalla.ancho))
    vigia.observe(caja)
    medida.observe(caja)
    return () => {
      vigia.disconnect()
      medida.disconnect()
    }
  }, [caja, Demo, pantalla.ancho])
  if (Demo === undefined) return null
  const reproduccion: Reproduccion = { modo: 'miniatura', corre: vista.aLaVista && pestana && !grande && !reducido, reducido, entrada: vista.entrada, pausada: false, alternarPausa: () => undefined }
  return (
    <span ref={setCaja} aria-hidden="true" inert data-pieza="miniatura-de-la-demo" className="absolute inset-0 block overflow-hidden">
      {caja !== null &&
        vista.entrada > 0 &&
        escala > 0 &&
        createPortal(
          <span className="absolute top-0 left-0 block origin-top-left" style={{ width: pantalla.ancho, height: pantalla.alto, transform: `scale(${escala.toFixed(4)})` }}>
            <ReproduccionDeLaDemo.Provider value={reproduccion}>
              <Suspense fallback={null}>
                <Demo />
              </Suspense>
            </ReproduccionDeLaDemo.Provider>
          </span>,
          caja,
        )}
    </span>
  )
}

/** La demo grande, usable, en la ampliación. Mientras llega (o si la feature no tiene demo), el `respaldo`: la captura. */
export function DemoCompleta({ demo, irA, respaldo }: { readonly demo: IdDeDemo; readonly irA?: (demo: IdDeDemo) => void; readonly respaldo: ReactNode }): ReactNode {
  const reducido = usePrefiereMenosMovimiento()
  const pestana = usePestanaVisible()
  const [pausada, setPausada] = useState(false)
  useEffect(() => {
    marcarLaDemoGrande(true)
    return () => marcarLaDemoGrande(false)
  }, [])
  const Demo = DEMOS[demo]
  if (Demo === undefined) return respaldo
  const reproduccion: Reproduccion = { modo: 'completa', corre: pestana && !pausada && !reducido, reducido, entrada: 1, pausada, alternarPausa: () => setPausada((p) => !p) }
  return (
    <div role="region" aria-label={`Demo de ${NOMBRE_DE_LA_DEMO[demo]}, con datos de ejemplo`} data-pieza="demo-del-panel" className="h-full w-full">
      <ReproduccionDeLaDemo.Provider value={reproduccion}>
        <Suspense fallback={respaldo}>
          <Demo irA={irA} />
        </Suspense>
      </ReproduccionDeLaDemo.Provider>
    </div>
  )
}
