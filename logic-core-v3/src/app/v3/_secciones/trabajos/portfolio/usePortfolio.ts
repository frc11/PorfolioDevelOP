'use client'

import type Lenis from 'lenis'
import { useMotionValue, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'

import { PORTFOLIO_EN_LA_ESCENA } from '../../../_lib/escena/portfolioEnLaEscena'
import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'
import { useTituloListo } from '../../../_lib/titulos3d/registro'
import { LENTOS } from '../../../_lib/titulos3d/repeticiones'
import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'

import { ANCLAS_DEL_PORTFOLIO } from './anclas'
import { PRESENCIA_DEL_ENCABEZADO } from './EncabezadoDelPortfolio'
import { distanciaEnPasos, seMovioDeVerdad, vistaDelPaso } from './estado'
import { medirElHueco } from './hueco'
import { conDialogo, cortarElPanel, escenarioDe, medir, pegado, publicar } from './medida'
import { ORDEN } from './orden'
import {
  ANTES_DEL_PIN, PANTALLAS_POR_PASO, bordesDelPaso, centroDelPaso, mostradoDeDemos, pasoConHisteresis, pasoEn, pxDeLaSeccion, scrollDelPx,
  type AnchoDelPortfolio, type IndiceDePaso,
} from './pasos'
import type { DestinoDeLaRueda } from './rueda'
import { duracionDelSalto, saltarA } from './saltar'
import { anchoDe, anotarElSelector } from './tramoDelSelector'
import { useOrdenDeLaEscena } from './useOrdenDeLaEscena'
import { useRuedaDelPortfolio, type ControlDeLaRueda } from './useRuedaDelPortfolio'

/**
 * [B1] EL PORTFOLIO, VIVO — el scroll medido, el paso con histéresis, el reloj de Demos, la anotación a la escena y el salto a un
 * paso. Corre en las dos ramas (con y sin coreografía): el estado sale del scroll, no del progreso de P7.
 *
 * El scroll se mide contra el tope del panel (`[data-panel]`, que no es pegajoso ni lleva transformadas) en cada cuadro con
 * scroll; el paso se publica en React sólo cuando cambia. [B1.2b] El paso que se muestra espera al PIN (`pasoConElPin`: el panel se
 * anima en el escenario pegado, así entra en horizontal a cualquier velocidad) y el panel existe sólo pegado (`cortarElPanel`: así
 * también sale en horizontal). Un salto pone el paso de destino EN EL MISMO CUADRO y, mientras vuela, los bordes del camino no
 * disparan nada.
 *
 * [B1.2c] Lo que se muestra va en ORDEN (`orden.ts`): el panel y el encabezado se prenden y se apagan de a uno. El proyecto activo
 * manda: el hover, el clic y las teclas lo activan y el scroll se acomoda en silencio (`saltarAlPaso(i, true)`); la rueda avanza de a
 * un proyecto (`useRuedaDelPortfolio`) y, mientras tiene el control, el hover queda inerte (`inerteDesde`).
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
  /** [B1.2c] Lo que se muestra, en orden: la escena (el panel, la cámara y el oscurecido) y el encabezado («Portfolio» y su bajada). */
  readonly escena: boolean
  readonly encabezado: boolean
  /** [B1.2c] Cuánto se recorrió del paso de ahora (0…1): las barras de la tablet y del teléfono. */
  readonly avanceDelPaso: MotionValue<number>
  /** Lleva la página al centro de un paso del selector (0…3) y pone ese paso ya; `inmediato`, en silencio (sin viaje). */
  readonly saltarAlPaso: (i: number, inmediato?: boolean) => void
  /**
   * [B1.2c] Dónde estaba el puntero cuando la rueda tomó el control (el hover queda inerte hasta que se mueva), o `null`: con el
   * puntero de ahora, que la suelta si se movió de verdad.
   */
  readonly inerteDesde: (x: number, y: number) => { readonly x: number; readonly y: number } | null
}

/** [B1.2c] Lo que dura una rueda «reciente» (ms): la inercia de Lenis después del último evento de un golpe fuerte. */
export const RUEDA_RECIENTE_MS = 600

/** [B1.2b] La fracción del ancho que deja el panel en cada ancho (la escena centra el logo en su columna): su CSS. */
export const COLUMNA_DEL_ANCHO: Readonly<Record<AnchoDelPortfolio, number>> = { escritorio: 0.5, tablet: 0.4, movil: 0.4 }

export function usePortfolio(caja: RefObject<HTMLElement | null>): PortfolioVivo {
  const [paso, setPaso] = useState<IndiceDePaso>(ANTES_DEL_PIN)
  const reducido = usePrefiereMenosMovimiento()
  const mostrado = useMotionValue(0)
  const avance = useMotionValue(0)
  const [cerca, setCerca] = useState(false)
  const [enCuadro, setEnCuadro] = useState(false)
  const [visible, setVisible] = useState(true)
  const actual = useRef<IndiceDePaso>(ANTES_DEL_PIN)
  const enVuelo = useRef<{ readonly destino: number; readonly cancelar: () => void } | null>(null)
  const inerte = useRef<{ readonly x: number; readonly y: number } | null>(null)
  const ultimaRueda = useRef(Number.NEGATIVE_INFINITY)

  // [B1.2c] El orden: el encabezado va con el panel (primero llega la cámara, después el título; al irse, al revés).
  const fase = vistaDelPaso(paso).fase
  const caidaS = useTituloListo('portfolio') ? LENTOS.llegadaDePortfolioS : PRESENCIA_DEL_ENCABEZADO.s
  const orden = useOrdenDeLaEscena(fase === 'adentro', fase === 'adentro', caidaS, reducido)

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

  // Lo que la escena tiene que saber: la escena adentro (la pose del logo y el oscurecido, en su orden) y el movimiento reducido.
  useEffect(() => {
    PORTFOLIO_EN_LA_ESCENA.adentro = orden.escena
    PORTFOLIO_EN_LA_ESCENA.reducido = reducido
  }, [orden.escena, reducido])
  useEffect(
    () => () => {
      PORTFOLIO_EN_LA_ESCENA.adentro = false
      PORTFOLIO_EN_LA_ESCENA.hueco = null
    },
    [],
  )

  // La anotación a la escena (la REGLA DE ALTURAS), la columna que deja el panel en este ancho (lo dice el CSS, no el JS), y [B1.2c] el hueco del logo, medido en el escenario (cambia con el ancho y con las fuentes: el bloque se centra en el alto).
  useEffect(() => {
    const el = caja.current
    const panel = el?.closest('[data-panel]') ?? null
    if (el === null || panel === null) return undefined
    const medirLoDelAncho = (): void => {
      PORTFOLIO_EN_LA_ESCENA.columna = COLUMNA_DEL_ANCHO[anchoDe(el)]
      PORTFOLIO_EN_LA_ESCENA.hueco = medirElHueco(escenarioDe(el)) ?? PORTFOLIO_EN_LA_ESCENA.hueco
    }
    medirLoDelAncho()
    window.addEventListener('resize', medirLoDelAncho)
    const columna = escenarioDe(el)?.querySelector('[data-pieza="columna-del-portfolio"]') ?? null
    const tamano = new ResizeObserver(medirLoDelAncho)
    if (columna !== null) for (const hijo of [columna, ...columna.children]) tamano.observe(hijo)
    const soltar = anotarElSelector(el, panel, PANTALLAS_POR_PASO)
    return () => {
      window.removeEventListener('resize', medirLoDelAncho)
      tamano.disconnect()
      soltar()
    }
  }, [caja])

  // El scroll: el paso con histéresis (o el destino del salto en vuelo), el reloj de Demos y lo recorrido del paso.
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
      const { desde, hasta } = bordesDelPaso(actual.current, PANTALLAS_POR_PASO)
      avance.set(Number.isFinite(desde) && Number.isFinite(hasta) ? Math.min(1, Math.max(0, (m.px - desde) / (hasta - desde))) : 0)
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
  }, [caja, mostrado, avance])

  /** Lleva la página a un píxel de la regla en `ms` (0: en silencio) y pone ya el paso de destino. */
  const irAlPx = useCallback(
    (px: number, ms: number, scrollExtra = 0): void => {
      const m = medir(caja.current)
      if (m === null) return
      enVuelo.current?.cancelar()
      // El diagnóstico de la carga (`?diag=carga`) no cuenta como desfasado el paso de un salto en vuelo.
      caja.current?.setAttribute('data-en-vuelo', 'si')
      const vuelo = {
        destino: px,
        cancelar: saltarA(scrollDelPx(px, m.tope, m.alto) + scrollExtra, reducido ? 0 : ms, () => {
          if (enVuelo.current !== vuelo) return
          enVuelo.current = null
          caja.current?.removeAttribute('data-en-vuelo')
        }),
      }
      enVuelo.current = vuelo
      // El destino, ya: la tira cambia en este cuadro y la página la sigue.
      publicar(caja.current, actual, setPaso, pasoEn(px, PANTALLAS_POR_PASO))
    },
    [caja, reducido],
  )

  const saltarAlPaso = useCallback(
    (i: number, inmediato = false): void => irAlPx(centroDelPaso(i, PANTALLAS_POR_PASO), inmediato ? 0 : duracionDelSalto(distanciaEnPasos(actual.current, i))),
    [irAlPx],
  )

  // [B1.2c] La rueda: de a un proyecto; después de «la tuya», a Demos (el final del pin, como el viaje del menú: dos píxeles antes);
  // antes del primero, arriba (la sección asomando por abajo). Las salidas tardan lo del orden: el título cae y después el panel se va.
  const control = useRef<ControlDeLaRueda | null>(null)
  const ir = useCallback(
    (d: DestinoDeLaRueda): void => {
      const salida = (caidaS + ORDEN.panelS) * 1000
      if (d.tipo === 'paso') saltarAlPaso(d.indice)
      else if (d.tipo === 'demos') irAlPx(pxDeLaSeccion(PANTALLAS_POR_PASO), salida, -2)
      else irAlPx(0, salida)
    },
    [caidaS, irAlPx, saltarAlPaso],
  )
  useEffect(() => {
    control.current = {
      manda: () => {
        const v = vistaDelPaso(actual.current)
        return v.fase === 'adentro' && pegado(caja.current) && !conDialogo(caja.current) ? v.tira : null
      },
      ocupado: () => enVuelo.current !== null,
      ir,
      inerte,
      ultimaRueda,
    }
  }, [caja, ir])
  useRuedaDelPortfolio(control)
  const inerteDesde = useCallback((x: number, y: number): { readonly x: number; readonly y: number } | null => {
    if (inerte.current !== null && seMovioDeVerdad(inerte.current, x, y)) inerte.current = null
    return inerte.current
  }, [])

  // [B1.2c] La entrada del panel ATRAPA la inercia de la rueda: un golpe fuerte que viene de afuera dejó a Lenis yendo más allá del
  // proyecto en el que entra; el panel lo frena en el centro de ése (el primero que cruzó), y de ahí la rueda va de a uno.
  const faseAntes = useRef(fase)
  useEffect(() => {
    const antes = faseAntes.current
    faseAntes.current = fase
    const lenis = LENIS_DEL_SITIO.instancia
    const m = medir(caja.current)
    if (antes === 'adentro' || fase !== 'adentro' || lenis === null || m === null || enVuelo.current !== null || performance.now() - ultimaRueda.current > RUEDA_RECIENTE_MS) return
    const { desde, hasta } = bordesDelPaso(paso, PANTALLAS_POR_PASO)
    const destino = lenis.targetScroll
    if (destino > scrollDelPx(hasta, m.tope, m.alto) || destino < scrollDelPx(desde, m.tope, m.alto)) saltarAlPaso(vistaDelPaso(paso).tira)
  }, [caja, fase, paso, saltarAlPaso])

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

  return useMemo(
    () => ({ paso, reducido, cerca, aLaVista: enCuadro && visible, mostradoDeDemos: mostrado, escena: orden.escena, encabezado: orden.encabezado, avanceDelPaso: avance, saltarAlPaso, inerteDesde }),
    [paso, reducido, cerca, enCuadro, visible, mostrado, orden.escena, orden.encabezado, avance, saltarAlPaso, inerteDesde],
  )
}
