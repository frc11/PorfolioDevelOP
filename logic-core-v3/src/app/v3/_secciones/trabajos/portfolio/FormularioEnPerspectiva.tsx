'use client'

import { useRef, useSyncExternalStore, type ReactNode } from 'react'

import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'

/**
 * [B1.2d B] B7 · EL FORMULARIO DE «LA TUYA» EN 3D — una prueba detrás de `?form=3d` (lo más probable es que no quede: sin la bandera,
 * plano). Perspectiva de CSS sobre los campos REALES (se escribe, se enfoca y se tabula igual: la transformada no cambia el DOM).
 *
 *   · en reposo, inclinado con la profundidad a la vista desde la izquierda: `rotateY` de −8° a −12° (`?form=3d` −10°; `?form=3d-8`,
 *     `?form=3d-12`, … calibrable);
 *   · con el mouse adentro, la perspectiva lo sigue (±6° como mucho, con el suavizado de una transición corta) y vuelve al reposo al
 *     salir;
 *   · con movimiento reducido, plano.
 */
export const FORMULARIO_EN_3D = { reposoGrados: -10, minimoGrados: -12, maximoGrados: -8, sigueGrados: 6, perspectivaPx: 900, suavizadoMs: 300 } as const

/** El giro en reposo que pide la URL (`?form=3d` o `?form=3d-<grados>`), acotado; `null`: sin la bandera. */
export function giroDeLaBandera(busqueda: string): number | null {
  const valor = new URLSearchParams(busqueda).get('form')
  if (valor === null) return null
  const m = /^3d(?:-(\d+(?:\.\d+)?))?$/.exec(valor)
  if (m === null) return null
  const grados = m[1] === undefined ? FORMULARIO_EN_3D.reposoGrados : -Number(m[1])
  return Math.min(FORMULARIO_EN_3D.maximoGrados, Math.max(FORMULARIO_EN_3D.minimoGrados, grados))
}

/** El giro que sigue al mouse: la fracción del puntero adentro de la caja (0…1 en cada eje) a ±`sigueGrados`. */
export function giroDelPuntero(fx: number, fy: number): { readonly y: number; readonly x: number } {
  const acotar = (f: number): number => Math.min(1, Math.max(0, f))
  return { y: (acotar(fx) - 0.5) * 2 * FORMULARIO_EN_3D.sigueGrados, x: (0.5 - acotar(fy)) * 2 * FORMULARIO_EN_3D.sigueGrados }
}

const sinSuscribir = (): (() => void) => () => undefined

export function FormularioEnPerspectiva({ children }: { readonly children: ReactNode }): React.JSX.Element {
  // La URL se lee en el cliente; en el servidor (y en la hidratación), plano.
  const giro = useSyncExternalStore(sinSuscribir, () => giroDeLaBandera(window.location.search), () => null)
  const reducido = usePrefiereMenosMovimiento()
  const caja = useRef<HTMLDivElement | null>(null)
  const plano = useRef<HTMLDivElement | null>(null)
  if (giro === null || reducido) return <>{children}</>
  const reposo = `rotateY(${String(giro)}deg)`
  const alMover = (e: React.PointerEvent<HTMLDivElement>): void => {
    const c = caja.current?.getBoundingClientRect()
    if (c === undefined || c.width === 0 || c.height === 0 || plano.current === null) return
    const g = giroDelPuntero((e.clientX - c.left) / c.width, (e.clientY - c.top) / c.height)
    plano.current.style.transform = `rotateY(${g.y.toFixed(2)}deg) rotateX(${g.x.toFixed(2)}deg)`
  }
  const alSalir = (): void => {
    if (plano.current !== null) plano.current.style.transform = reposo
  }
  return (
    <div ref={caja} data-forma="3d" style={{ perspective: `${String(FORMULARIO_EN_3D.perspectivaPx)}px` }} onPointerMove={alMover} onPointerLeave={alSalir}>
      <div ref={plano} style={{ transform: reposo, transformOrigin: 'left center', transition: `transform ${String(FORMULARIO_EN_3D.suavizadoMs)}ms var(--ease-salida)`, willChange: 'transform' }}>
        {children}
      </div>
    </div>
  )
}
