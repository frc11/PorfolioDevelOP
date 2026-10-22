'use client'

import type Lenis from 'lenis'
import { useMotionValue, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'

import { PORTFOLIO_EN_LA_ESCENA } from '../../../_lib/escena/portfolioEnLaEscena'
import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'
import { useTituloListo } from '../../../_lib/titulos3d/registro'
import { LENTOS } from '../../../_lib/titulos3d/repeticiones'
import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'

import { PRESENCIA_DEL_ENCABEZADO } from './EncabezadoDelPortfolio'
import { distanciaEnPasos, seMovioDeVerdad, vistaDelPaso } from './estado'
import { medirElHueco } from './hueco'
import { cortarElPanel, escenarioDe, medir, publicar, volarAlPx, vueloPisado, type Vuelo } from './medida'
import { pasoDelCarrusel, pxDeLaSalidaDelCarrusel } from './medioDelCarrusel'
import { ADENTRO, AFUERA, ORDEN } from './orden'
import {
  ANTES_DEL_PIN, PANTALLAS_POR_PASO, bordesDelPaso, centroDelPaso, mostradoDeDemos, mostradoDeLaCola, pasoConHisteresis, pasoEn, pxDeLaSalida,
  type AnchoDelPortfolio, type IndiceDePaso,
} from './pasos'
import { duracionDelSalto } from './saltar'
import { anchoDe, anotarElSelector, carruselDe } from './tramoDelSelector'
import { useAnclaDeLaCarga } from './useAnclaDeLaCarga'
import { useBarraDelPortfolio } from './useBarraDelPortfolio'
import { useMandosDelPortfolio } from './useMandosDelPortfolio'
import { useMedioDelCarrusel } from './useMedioDelCarrusel'
import { useOrdenDeLaEscena } from './useOrdenDeLaEscena'

export { RUEDA_RECIENTE_MS } from './useMandosDelPortfolio'

/**
 * [B1] EL PORTFOLIO, VIVO — el scroll medido, el paso con histéresis, el reloj de Demos, la anotación a la escena y el salto a un
 * paso. Corre en las dos ramas (con y sin coreografía): el estado sale del scroll, no del progreso de P7.
 *
 * El scroll se mide contra el tope del panel (`[data-panel]`, que no es pegajoso ni lleva transformadas) en cada cuadro con
 * scroll; el paso se publica en React sólo cuando cambia. [B1.2b] El paso que se muestra espera al PIN (`pasoConElPin`: el panel se
 * anima en el escenario pegado, así entra en horizontal a cualquier velocidad) y el panel existe sólo pegado (`cortarElPanel`: así
 * también sale en horizontal). Un salto pone el paso de destino EN EL MISMO CUADRO y, mientras vuela, los bordes del camino no
 * disparan nada. [B1.2d] Y si alguien le pisa el viaje, se suelta en esa misma lectura (`vueloPisado`): el paso vuelve a salir del
 * scroll y nunca queda clavado en el destino de un vuelo que no va a llegar (A8).
 *
 * [B1.2c] Lo que se muestra va en ORDEN (`orden.ts`; [B1.2d] cuatro piezas: la cámara, el título, la barra y el panel). El proyecto
 * activo manda: el hover, el clic y las teclas lo activan y el scroll se acomoda en silencio (`saltarAlPaso(i, true)`); la rueda avanza
 * de a un proyecto (`useMandosDelPortfolio`) y, mientras tiene el control, el hover queda inerte (`inerteDesde`).
 *
 * [B1.2e] Debajo de 1024 (lo decide el CSS, `--modo-del-portfolio: carrusel`) no hay selector: la sección es un flujo que se scrollea (el
 * título, el carrusel y «la tuya», `FlujoDelPortfolio`) y después la cola de siempre. Nada se pide al orden (ni la cámara, ni el título del
 * escenario, ni la barra, ni el panel: el flujo trae los suyos), la rueda no es del Portfolio y el paso es el del flujo
 * (`pasoDelCarrusel`). El reloj de Demos arranca donde termina el flujo y el tramo de la escena es el del flujo medido (`useMedioDelCarrusel`).
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
  /** [B1.2d] Lo que se muestra, en orden: la cámara (con el oscurecido), el encabezado, la barra corrida y el panel (con las tiras). */
  readonly camara: boolean
  readonly encabezado: boolean
  readonly barra: boolean
  readonly panel: boolean
  /** [B1.2d] Si lo que se muestra ya es lo pedido (ningún cambio del orden pendiente). */
  readonly ordenQuieto: boolean
  /** [B1.2c] Cuánto se recorrió del paso de ahora (0…1). */
  readonly avanceDelPaso: MotionValue<number>
  /** Lleva la página al centro de un paso del selector (0…3) y pone ese paso ya; `inmediato`, en silencio (sin viaje). */
  readonly saltarAlPaso: (i: number, inmediato?: boolean) => void
  /**
   * [B1.2c] Dónde estaba el puntero cuando la rueda tomó el control (el hover queda inerte hasta que se mueva), o `null`: con el
   * puntero de ahora, que la suelta si se movió de verdad.
   */
  readonly inerteDesde: (x: number, y: number) => { readonly x: number; readonly y: number } | null
  /** [B1.2d] A3 · si el último salto lo pidió la rueda, y si hay un vuelo en curso (leídos en el evento, no en el render). */
  readonly deLaRueda: () => boolean
  readonly enVuelo: () => boolean
  /** [B1.2e] El carrusel (debajo de 1024: lo decide el CSS, `--modo-del-portfolio`; la sección no mide el ancho). */
  readonly carrusel: boolean
  /** [B1.2e] Dónde arranca la cola ahora (px de la regla): la de los pasos, o con el carrusel donde termina su flujo (leído en el evento). */
  readonly salidaDeLaCola: () => number
}

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
  const [carrusel, setCarrusel] = useState(false)
  const actual = useRef<IndiceDePaso>(ANTES_DEL_PIN)
  const enVuelo = useRef<Vuelo | null>(null)
  const inerte = useRef<{ readonly x: number; readonly y: number } | null>(null)
  const ultimaRueda = useRef(Number.NEGATIVE_INFINITY)
  const deLaRueda = useRef(false)

  // [B1.2d] El orden: la cámara, el título, la barra y el panel (al irse, al revés). [B1.2e] Con el carrusel, nada: el flujo trae lo suyo.
  const fase = vistaDelPaso(paso).fase
  const adentro = fase === 'adentro'
  const tituloS = useTituloListo('portfolio') ? LENTOS.llegadaDePortfolioS : PRESENCIA_DEL_ENCABEZADO.s
  const pedidoDelOrden = adentro && !carrusel ? ADENTRO : AFUERA
  const orden = useOrdenDeLaEscena(pedidoDelOrden, tituloS, reducido)
  // [B1.2d] El orden llegó a lo pedido (el diagnóstico y el arnés miran el panel sólo así: no en el medio de una entrada o una salida).
  const ordenQuieto = orden.camara === pedidoDelOrden.camara && orden.encabezado === pedidoDelOrden.encabezado && orden.barra === pedidoDelOrden.barra && orden.panel === pedidoDelOrden.panel

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

  // Lo que la escena tiene que saber: la cámara del Portfolio (la pose del logo y el oscurecido, en su orden) y el movimiento reducido.
  useEffect(() => {
    PORTFOLIO_EN_LA_ESCENA.adentro = orden.camara
    PORTFOLIO_EN_LA_ESCENA.reducido = reducido
  }, [orden.camara, reducido])
  useEffect(
    () => () => {
      PORTFOLIO_EN_LA_ESCENA.adentro = false
      PORTFOLIO_EN_LA_ESCENA.hueco = null
    },
    [],
  )
  useBarraDelPortfolio(caja, orden.barra)
  // [F2] La entrada terminó: el panel adentro y su transición hecha. Recién ahí la rueda da pasos (antes, se traga: el Portfolio se ve entero).
  const entradaLista = useRef(false)
  useEffect(() => {
    entradaLista.current = false
    if (!orden.panel) return undefined
    const reloj = window.setTimeout(() => {
      entradaLista.current = true
    }, reducido ? 0 : ORDEN.panelS * 1000)
    return () => window.clearTimeout(reloj)
  }, [orden.panel, reducido])

  // [B1.2e] El medio del carrusel (el flujo, medido): cada medida vuelve a anotar el tramo y a leer el scroll.
  const anotacion = useRef<{ readonly reanotar: () => void } | null>(null)
  const releer = useRef<() => void>(() => undefined)
  const alMedirElFlujo = useCallback((): void => {
    anotacion.current?.reanotar()
    releer.current()
  }, [])
  const medio = useMedioDelCarrusel(caja, carrusel, alMedirElFlujo)

  // La anotación a la escena (la REGLA DE ALTURAS), la columna que deja el panel en este ancho y [B1.2e] si es el carrusel (lo dice el
  // CSS, no el JS), y [B1.2c] el hueco del logo, medido en el escenario (cambia con el ancho y con las fuentes: el bloque se centra).
  useEffect(() => {
    const el = caja.current
    const panel = el?.closest('[data-panel]') ?? null
    if (el === null || panel === null) return undefined
    const medirLoDelAncho = (): void => {
      PORTFOLIO_EN_LA_ESCENA.columna = COLUMNA_DEL_ANCHO[anchoDe(el)]
      PORTFOLIO_EN_LA_ESCENA.hueco = medirElHueco(escenarioDe(el)) ?? PORTFOLIO_EN_LA_ESCENA.hueco
    }
    const alCambiar = (): void => {
      medirLoDelAncho()
      setCarrusel(carruselDe(el))
    }
    medirLoDelAncho()
    window.addEventListener('resize', alCambiar)
    const columna = escenarioDe(el)?.querySelector('[data-pieza="columna-del-portfolio"]') ?? null
    const tamano = new ResizeObserver(alCambiar)
    tamano.observe(el)
    if (columna !== null) for (const hijo of [columna, ...columna.children]) tamano.observe(hijo)
    const anotada = anotarElSelector(el, panel, PANTALLAS_POR_PASO, () => medio.current)
    anotacion.current = anotada
    return () => {
      window.removeEventListener('resize', alCambiar)
      tamano.disconnect()
      anotada.soltar()
      anotacion.current = null
    }
  }, [caja, medio])

  // El scroll: el paso con histéresis (o el destino del salto en vuelo), el reloj de Demos y lo recorrido del paso. [B1.2e] Con el carrusel,
  // el paso del flujo y el reloj desde donde termina.
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
      const delFlujo = medio.current
      if (delFlujo !== null) {
        mostrado.set(mostradoDeLaCola(m.px, pxDeLaSalidaDelCarrusel(delFlujo)))
        publicar(caja.current, actual, setPaso, pasoDelCarrusel(m.px, delFlujo))
        avance.set(0)
        return
      }
      mostrado.set(mostradoDeDemos(m.px, PANTALLAS_POR_PASO))
      // [B1.2d] Un vuelo al que le pisaron el viaje (la rueda, el menú, un ancla) se suelta acá: el paso vuelve a ser el del scroll.
      const pisado = enVuelo.current
      if (pisado !== null && vueloPisado(pisado, lenis?.de ?? null)) pisado.cancelar()
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
    releer.current = pedir
    window.addEventListener('scroll', alMoverse, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      releer.current = () => undefined
      window.removeEventListener('scroll', alMoverse)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
      lenis?.soltar()
    }
  }, [caja, mostrado, avance, medio])
  // [B1.2d] Al desmontar, el vuelo que esté (no el de cuando corrió el efecto): ningún vencimiento ni marca colgados.
  useEffect(() => {
    const vuelo = enVuelo
    return () => vuelo.current?.cancelar()
  }, [])

  /** Lleva la página a un píxel de la regla en `ms` (0: en silencio) y pone ya el paso de destino. */
  const irAlPx = useCallback(
    (px: number, ms: number, scrollExtra = 0): void => volarAlPx({ caja, enVuelo, actual, setPaso }, px, reducido ? 0 : ms, scrollExtra),
    [caja, reducido],
  )
  const saltar = useCallback(
    (i: number, inmediato: boolean, rueda: boolean): void => {
      deLaRueda.current = rueda
      irAlPx(centroDelPaso(i, PANTALLAS_POR_PASO), inmediato ? 0 : duracionDelSalto(distanciaEnPasos(actual.current, i)))
    },
    [irAlPx],
  )
  const saltarAlPaso = useCallback((i: number, inmediato = false): void => saltar(i, inmediato, false), [saltar])

  useMandosDelPortfolio({ caja, actual, enVuelo, inerte, ultimaRueda, entradaLista, paso, carrusel, tituloS, irAlPx, saltar })
  const inerteDesde = useCallback((x: number, y: number): { readonly x: number; readonly y: number } | null => {
    if (inerte.current !== null && seMovioDeVerdad(inerte.current, x, y)) inerte.current = null
    return inerte.current
  }, [])
  const deLaRuedaAhora = useCallback(() => deLaRueda.current, [])
  const enVueloAhora = useCallback(() => enVuelo.current !== null, [])
  const salidaDeLaCola = useCallback((): number => {
    const delFlujo = medio.current
    return delFlujo === null ? pxDeLaSalida(PANTALLAS_POR_PASO) : pxDeLaSalidaDelCarrusel(delFlujo)
  }, [medio])

  useAnclaDeLaCarga(caja, carrusel)

  return useMemo(
    () => ({
      paso, reducido, cerca, aLaVista: enCuadro && visible, mostradoDeDemos: mostrado, camara: orden.camara, encabezado: orden.encabezado, barra: orden.barra,
      panel: orden.panel, ordenQuieto, avanceDelPaso: avance, saltarAlPaso, inerteDesde, deLaRueda: deLaRuedaAhora, enVuelo: enVueloAhora, carrusel, salidaDeLaCola,
    }),
    [paso, reducido, cerca, enCuadro, visible, mostrado, orden, ordenQuieto, avance, saltarAlPaso, inerteDesde, deLaRuedaAhora, enVueloAhora, carrusel, salidaDeLaCola],
  )
}
