'use client'

import { useMotionValue, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

import { PORTFOLIO_EN_LA_ESCENA } from '../../../_lib/escena/portfolioEnLaEscena'
import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'

import { ANCLAS_DEL_PORTFOLIO } from './anclas'
import { BANDERAS_POR_DEFECTO, banderasDe, type BanderasDelPortfolio } from './banderas'
import { distanciaEnPasos, vistaDelPaso } from './estado'
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
  /** La sección está a una pantalla o menos (desde ahí se piden los pósters y el video activo; después, se quedan). */
  readonly cerca: boolean
  /** La sección está en el cuadro y la pestaña a la vista (si no, el video se pausa). */
  readonly aLaVista: boolean
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
  const [cerca, setCerca] = useState(false)
  const [enCuadro, setEnCuadro] = useState(false)
  const [visible, setVisible] = useState(true)
  const actual = useRef<IndiceDePaso>(ANTES_DEL_PIN)
  const enVuelo = useRef<{ readonly destino: number; readonly cancelar: () => void } | null>(null)

  // Cerca (una pantalla de margen; una vez cerca, queda) y en el cuadro, y la pestaña a la vista.
  useEffect(() => {
    const panel = caja.current?.closest('[data-panel]') ?? null
    if (panel === null) return undefined
    const cercania = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting === true) setCerca(true)
    }, { rootMargin: '100% 0px' })
    const cuadro = new IntersectionObserver(([e]) => setEnCuadro(e?.isIntersecting === true))
    const alCambiar = (): void => setVisible(document.visibilityState === 'visible')
    cercania.observe(panel)
    cuadro.observe(panel)
    document.addEventListener('visibilitychange', alCambiar)
    return () => {
      cercania.disconnect()
      cuadro.disconnect()
      document.removeEventListener('visibilitychange', alCambiar)
    }
  }, [caja])

  // Lo que la escena tiene que saber: el panel adentro (la pose del logo y el oscurecido), el lado, la cámara y el oscurecido pedidos.
  useEffect(() => {
    const e = PORTFOLIO_EN_LA_ESCENA
    e.adentro = vistaDelPaso(paso).fase === 'adentro'
    e.dim = banderas.dim
    e.lado = banderas.lado
    e.camara = banderas.camara
    e.reducido = reducido
  }, [paso, banderas, reducido])
  useEffect(
    () => () => {
      PORTFOLIO_EN_LA_ESCENA.adentro = false
    },
    [],
  )

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
      // El diagnóstico de la carga (`?diag=carga`) no cuenta como desfasado el paso de un salto en vuelo.
      caja.current?.setAttribute('data-en-vuelo', 'si')
      const vuelo = {
        destino: centro,
        cancelar: saltarA(scrollDelPx(centro, m.tope, m.alto), distanciaEnPasos(actual.current, i), reducido, () => {
          if (enVuelo.current !== vuelo) return
          enVuelo.current = null
          caja.current?.removeAttribute('data-en-vuelo')
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
    const el = caja.current
    // El ancla con la que cargó, para el diagnóstico de la carga, hasta que el visitante mueva la página por su cuenta.
    el?.setAttribute('data-ancla-de-la-carga', ancla.id)
    const soltar = (): void => el?.removeAttribute('data-ancla-de-la-carga')
    const gestos = ['wheel', 'touchstart', 'keydown'] as const
    for (const g of gestos) window.addEventListener(g, soltar, { once: true, passive: true })
    const reloj = window.setTimeout(() => window.scrollTo({ top: y, behavior: 'instant' }), 0)
    return () => {
      window.clearTimeout(reloj)
      for (const g of gestos) window.removeEventListener(g, soltar)
    }
  }, [banderas.paso, caja])

  return { paso, banderas, reducido, cerca, aLaVista: enCuadro && visible, mostradoDeDemos: mostrado, saltarAlPaso }
}
