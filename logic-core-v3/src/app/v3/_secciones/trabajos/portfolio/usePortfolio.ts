'use client'

import type Lenis from 'lenis'
import { useMotionValue, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

import { PORTFOLIO_EN_LA_ESCENA } from '../../../_lib/escena/portfolioEnLaEscena'
import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'
import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'

import { ANCLAS_DEL_PORTFOLIO } from './anclas'
import { distanciaEnPasos, pasoConElPin, vistaDelPaso } from './estado'
import {
  ANTES_DEL_PIN, PANTALLAS_POR_PASO, centroDelPaso, mostradoDeDemos, pasoConHisteresis, pasoEn, pxDelScroll, scrollDelPx, type AnchoDelPortfolio,
  type IndiceDePaso,
} from './pasos'
import { saltarA } from './saltar'
import { anchoDe, anotarElSelector } from './tramoDelSelector'

/**
 * [B1] EL PORTFOLIO, VIVO — el scroll medido, el paso con histéresis, el reloj de Demos, la anotación a la escena y el salto a un
 * paso. Corre en las dos ramas (con y sin coreografía): el estado sale del scroll, no del progreso de P7.
 *
 * El scroll se mide contra el tope del panel (`[data-panel]`, que no es pegajoso ni lleva transformadas) en cada cuadro con
 * scroll; el paso se publica en React sólo cuando cambia. [B1.2b] El paso que se muestra espera al PIN (`pasoConElPin`: el panel se
 * anima en el escenario pegado, así entra en horizontal a cualquier velocidad) y el panel existe sólo pegado (`cortarElPanel`: así
 * también sale en horizontal). Un salto pone el paso de destino EN EL MISMO
 * CUADRO (el hover cambia la tira sin esperar al scroll) y, mientras vuela, los bordes del camino no disparan nada.
 */
export interface PortfolioVivo {
  readonly paso: IndiceDePaso
  readonly reducido: boolean
  /** La sección está a una pantalla o menos (desde ahí se piden los pósters, las marcas y el video activo; después, se quedan). */
  readonly cerca: boolean
  /** La sección está en el cuadro y la pestaña a la vista (si no, el video se pausa). */
  readonly aLaVista: boolean
  /** El `mostrado` de hoy para Demos (`pasos.ts`: la cola corrida). */
  readonly mostradoDeDemos: MotionValue<number>
  /** Lleva la página al centro de un paso del selector (0…3) y pone ese paso ya. */
  readonly saltarAlPaso: (i: number) => void
}

/** [B1.2b] La fracción del ancho que deja el panel en cada ancho (la escena centra el logo en su mitad de abajo): su CSS. */
export const COLUMNA_DEL_ANCHO: Readonly<Record<AnchoDelPortfolio, number>> = { escritorio: 0.5, tablet: 0.4, movil: 0.4 }

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

/** ¿El escenario está pegado (su tope en el del cuadro)? Sin escenario, sí (no hay nada que esperar). */
function pegado(caja: HTMLElement | null): boolean {
  const escenario = caja?.querySelector<HTMLElement>('[data-pieza="escenario-del-portfolio"]') ?? null
  return escenario === null || Math.abs(escenario.getBoundingClientRect().top) <= 1
}

/** Publica un paso (si cambió), con el pin: el panel no entra hasta que el escenario está pegado. */
function publicar(caja: HTMLElement | null, actual: { current: IndiceDePaso }, setPaso: (p: IndiceDePaso) => void, siguiente: IndiceDePaso): void {
  const mostrable = pasoConElPin(siguiente, pegado(caja))
  if (mostrable === actual.current) return
  actual.current = mostrable
  setPaso(mostrable)
}

/**
 * [B1.2b] EL PANEL EXISTE SÓLO EN EL ESCENARIO PEGADO. Un scroll que cruza la cola (o la aproximación) más rápido que la transición
 * del panel despegaba el escenario con el panel a mitad de camino y se lo llevaba en vertical (el banco: 1858 px con la rueda).
 * Despegado, el panel queda afuera y sin transición; pegado, manda su clase otra vez. Imperativo y en el MISMO cuadro en que se
 * mueve el scroll (se llama sincrónico desde el `scroll` nativo y desde el de Lenis): con un estado de React quedaba un cuadro de
 * atraso (el banco: 38 px).
 */
function cortarElPanel(caja: HTMLElement | null, antes: { current: boolean | null }): void {
  const ahora = pegado(caja)
  if (ahora === antes.current) return
  antes.current = ahora
  const panel = caja?.querySelector<HTMLElement>('[data-pieza="panel-del-portfolio"]') ?? null
  if (panel === null) return
  if (ahora) {
    panel.style.removeProperty('transition')
    panel.style.removeProperty('translate')
  } else {
    panel.style.setProperty('transition', 'none')
    panel.style.setProperty('translate', '100% 0')
  }
}

export function usePortfolio(caja: RefObject<HTMLElement | null>): PortfolioVivo {
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

  // Lo que la escena tiene que saber: el panel adentro (la pose del logo y el oscurecido) y el movimiento reducido.
  useEffect(() => {
    PORTFOLIO_EN_LA_ESCENA.adentro = vistaDelPaso(paso).fase === 'adentro'
    PORTFOLIO_EN_LA_ESCENA.reducido = reducido
  }, [paso, reducido])
  useEffect(
    () => () => {
      PORTFOLIO_EN_LA_ESCENA.adentro = false
    },
    [],
  )

  // La anotación a la escena (la REGLA DE ALTURAS) y la columna que deja el panel en este ancho (lo dice el CSS, no el JS).
  useEffect(() => {
    const el = caja.current
    const panel = el?.closest('[data-panel]') ?? null
    if (el === null || panel === null) return undefined
    const columna = (): void => {
      PORTFOLIO_EN_LA_ESCENA.columna = COLUMNA_DEL_ANCHO[anchoDe(el)]
    }
    columna()
    window.addEventListener('resize', columna)
    const soltar = anotarElSelector(el, panel, PANTALLAS_POR_PASO)
    return () => {
      window.removeEventListener('resize', columna)
      soltar()
    }
  }, [caja])

  // El scroll: el paso con histéresis (o el destino del salto en vuelo) y el reloj de Demos.
  useLayoutEffect(() => {
    let pedido = 0
    // El corte del panel, sincrónico con lo que mueve el scroll: el `scroll` nativo (antes de los cuadros) y el de Lenis (en su
    // cuadro, apenas mueve la página; se suscribe a la instancia que haya: abajo de 1025 no hay).
    const pegadoAntes: { current: boolean | null } = { current: null }
    const cortar = (): void => cortarElPanel(caja.current, pegadoAntes)
    let lenis: { readonly de: Lenis; readonly soltar: () => void } | null = null
    const conLenis = (): void => {
      const de = LENIS_DEL_SITIO.instancia
      if (de === (lenis?.de ?? null)) return
      lenis?.soltar()
      lenis = de === null ? null : { de, soltar: de.on('scroll', cortar) }
    }
    const leer = (): void => {
      pedido = 0
      conLenis()
      cortar()
      const m = medir(caja.current)
      if (m === null) return
      mostrado.set(mostradoDeDemos(m.px, PANTALLAS_POR_PASO))
      const vuelo = enVuelo.current
      publicar(caja.current, actual, setPaso, vuelo !== null ? pasoEn(vuelo.destino, PANTALLAS_POR_PASO) : pasoConHisteresis(actual.current, m.px, PANTALLAS_POR_PASO))
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(leer)
    }
    const alMoverse = (): void => {
      cortar()
      pedir()
    }
    pedir()
    window.addEventListener('scroll', alMoverse, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('scroll', alMoverse)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
      lenis?.soltar()
    }
  }, [caja, mostrado])

  const saltarAlPaso = useCallback(
    (i: number): void => {
      const m = medir(caja.current)
      if (m === null) return
      const centro = centroDelPaso(i, PANTALLAS_POR_PASO)
      const desde = actual.current
      enVuelo.current?.cancelar()
      // El diagnóstico de la carga (`?diag=carga`) no cuenta como desfasado el paso de un salto en vuelo.
      caja.current?.setAttribute('data-en-vuelo', 'si')
      const vuelo = {
        destino: centro,
        cancelar: saltarA(scrollDelPx(centro, m.tope, m.alto), distanciaEnPasos(desde, i), reducido, () => {
          if (enVuelo.current !== vuelo) return
          enVuelo.current = null
          caja.current?.removeAttribute('data-en-vuelo')
        }),
      }
      enVuelo.current = vuelo
      // [B1.2b] El destino, ya: la tira cambia en este cuadro y la página la sigue.
      publicar(caja.current, actual, setPaso, pasoEn(centro, PANTALLAS_POR_PASO))
    },
    [caja, reducido],
  )

  // El ancla al cargar (`#portfolio-el-garage`, …): el navegador ya saltó al elemento; el Portfolio lo lleva al píxel del paso.
  useEffect(() => {
    const ancla = ANCLAS_DEL_PORTFOLIO.find((a) => `#${a.id}` === window.location.hash)
    const m = ancla === undefined ? null : medir(caja.current)
    if (ancla === undefined || m === null) return undefined
    const y = Math.round(scrollDelPx(centroDelPaso(ancla.paso, PANTALLAS_POR_PASO), m.tope, m.alto))
    const el = caja.current
    // El ancla con la que cargó, para el diagnóstico de la carga, hasta que el visitante mueva la página por su cuenta. [B1.2b] Un clic
    // también (el menú lleva a otra sección: el arnés lo contaba como un ancla desfasada).
    el?.setAttribute('data-ancla-de-la-carga', ancla.id)
    const soltar = (): void => el?.removeAttribute('data-ancla-de-la-carga')
    const gestos = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    for (const g of gestos) window.addEventListener(g, soltar, { once: true, passive: true })
    const reloj = window.setTimeout(() => window.scrollTo({ top: y, behavior: 'instant' }), 0)
    return () => {
      window.clearTimeout(reloj)
      for (const g of gestos) window.removeEventListener(g, soltar)
    }
  }, [caja])

  return { paso, reducido, cerca, aLaVista: enCuadro && visible, mostradoDeDemos: mostrado, saltarAlPaso }
}
