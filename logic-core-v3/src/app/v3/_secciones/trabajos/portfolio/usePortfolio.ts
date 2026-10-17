'use client'

import { useMotionValue, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'

import { ANCLAS_DEL_PORTFOLIO } from './anclas'
import { BANDERAS_POR_DEFECTO, banderasDe, type BanderasDelPortfolio } from './banderas'
import { distanciaEnPasos } from './estado'
import {
  ANTES_DEL_PIN, centroDelPaso, mostradoDeDemos, pasoConHisteresis, pasoEn, pxDelScroll, scrollDelPx, type IndiceDePaso,
} from './pasos'
import { saltarA } from './saltar'
import { anotarElSelector } from './tramoDelSelector'

/**
 * [B1] EL PORTFOLIO, VIVO — el scroll medido, el paso con histéresis, las banderas, el reloj de Demos, la anotación a la escena y
 * el salto a un paso. Corre en las dos ramas (con y sin coreografía): el estado sale del scroll, no del progreso de P7.
 *
 * El scroll se mide contra el tope del panel (`[data-panel]`, que no es pegajoso ni lleva transformadas) en cada cuadro con
 * scroll; el paso se publica en React sólo cuando cambia. Mientras un salto vuela el estado va derecho a su destino: los bordes del
 * camino no disparan nada (un solo `tic` por salto, B1.2).
 */
export interface PortfolioVivo {
  readonly paso: IndiceDePaso
  readonly banderas: BanderasDelPortfolio
  readonly reducido: boolean
  /** El `mostrado` de hoy para Demos (`pasos.ts`: la cola corrida). */
  readonly mostradoDeDemos: MotionValue<number>
  /** Lleva la página al centro de un paso del selector (0…6). */
  readonly saltarAlPaso: (i: number) => void
}

interface Medida {
  readonly px: number
  readonly tope: number
  readonly alto: number
}

/** Dónde está la página en la regla de la sección: el tope del panel en el documento y la ventana de ahora. */
function medir(caja: HTMLElement | null): Medida | null {
  const panel = caja?.closest<HTMLElement>('[data-panel]') ?? null
  const alto = window.innerHeight
  if (panel === null || !(alto > 0)) return null
  const tope = panel.getBoundingClientRect().top + window.scrollY
  return { px: pxDelScroll(window.scrollY, tope, alto), tope, alto }
}

/** Las banderas son de la URL de la carga: no cambian sin navegar, así que no hay a qué suscribirse. */
const sinSuscripcion = (): (() => void) => () => undefined
const consultaDelCliente = (): string => window.location.search
const consultaDelServidor = (): string => ''

export function usePortfolio(caja: RefObject<HTMLElement | null>): PortfolioVivo {
  // En el servidor (y al hidratar) las de siempre; en el cliente, las de la URL.
  const consulta = useSyncExternalStore(sinSuscripcion, consultaDelCliente, consultaDelServidor)
  const banderas = useMemo(() => (consulta === '' ? BANDERAS_POR_DEFECTO : banderasDe(consulta)), [consulta])
  const [paso, setPaso] = useState<IndiceDePaso>(ANTES_DEL_PIN)
  const reducido = usePrefiereMenosMovimiento()
  const mostrado = useMotionValue(0)
  const actual = useRef<IndiceDePaso>(ANTES_DEL_PIN)
  const enVuelo = useRef<{ readonly destino: number; readonly cancelar: () => void } | null>(null)

  // La anotación a la escena (la REGLA DE ALTURAS), con el paso de la bandera.
  useEffect(() => {
    const el = caja.current
    const panel = el?.closest('[data-panel]') ?? null
    if (el === null || panel === null) return undefined
    return anotarElSelector(el, panel, banderas.paso)
  }, [caja, banderas.paso])

  // El scroll: el paso con histéresis (o el destino del salto en vuelo) y el reloj de Demos.
  useLayoutEffect(() => {
    let pedido = 0
    const leer = (): void => {
      pedido = 0
      const m = medir(caja.current)
      if (m === null) return
      mostrado.set(mostradoDeDemos(m.px, banderas.paso))
      const vuelo = enVuelo.current
      const siguiente = vuelo !== null ? pasoEn(vuelo.destino, banderas.paso) : pasoConHisteresis(actual.current, m.px, banderas.paso)
      if (siguiente !== actual.current) {
        actual.current = siguiente
        setPaso(siguiente)
      }
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(leer)
    }
    pedir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
    }
  }, [banderas.paso, caja, mostrado])

  const saltarAlPaso = useCallback(
    (i: number): void => {
      const m = medir(caja.current)
      if (m === null) return
      const centro = centroDelPaso(i, banderas.paso)
      enVuelo.current?.cancelar()
      const vuelo = {
        destino: centro,
        cancelar: saltarA(scrollDelPx(centro, m.tope, m.alto), distanciaEnPasos(actual.current, i), reducido, () => {
          if (enVuelo.current === vuelo) enVuelo.current = null
        }),
      }
      enVuelo.current = vuelo
    },
    [banderas.paso, caja, reducido],
  )

  // El ancla al cargar (`#portfolio-el-garage`, …): el navegador ya saltó al elemento; el Portfolio lo lleva al píxel del paso.
  useEffect(() => {
    const ancla = ANCLAS_DEL_PORTFOLIO.find((a) => `#${a.id}` === window.location.hash)
    const m = ancla === undefined ? null : medir(caja.current)
    if (ancla === undefined || m === null) return undefined
    const y = Math.round(scrollDelPx(centroDelPaso(ancla.paso, banderas.paso), m.tope, m.alto))
    const reloj = window.setTimeout(() => window.scrollTo({ top: y, behavior: 'instant' }), 0)
    return () => window.clearTimeout(reloj)
  }, [banderas.paso, caja])

  return { paso, banderas, reducido, mostradoDeDemos: mostrado, saltarAlPaso }
}
