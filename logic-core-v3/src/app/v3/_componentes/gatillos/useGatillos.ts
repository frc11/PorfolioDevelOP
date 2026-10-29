'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

import { hayBanco } from '../../_lib/escena/entorno'

import { conElDefectoDeLosGatillos } from './defectos'
import { sentidoDeLaTecla } from '../../_lib/gestosDelScroll'
import { LENIS_DEL_SITIO } from '../../_lib/lenisDelSitio'

import {
  ANTES_DEL_ANCLA, HISTERESIS_DEL_GATILLO_PX, SIN_OBJETIVO, aterrizajeDelPasoEnElTramo, baseDelObjetivo, decidirLaRueda, decidirLaTecla, destinoDelGesto, faseDe, pasoConHisteresisEnElTramo,
  salidaLibre, seguirElObjetivo, vistaDelPasoEnElTramo, type ObjetivoNativo, type ReglaDeGatillos,
} from './maquina'
import { GESTO_QUIETO, pxDeLaRueda } from './rueda'
import { SALTO, duracionDelSalto } from './salto'
import { volar, vueloAjeno, vueloDelGatilloPisado, type VueloDelGatillo } from './vuelo'

/**
 * [B4] LA MÁQUINA DE GATILLOS, EN LA PÁGINA — la de Portfolio (B1.2c, F1, F2, A8) para cualquier sección anclada: la usa Servicios.
 * La pista es el bloque alto que contiene al escenario pegado; su tope en el cuadro es el ancla y su alto menos una ventana, el
 * recorrido, repartido en `cantidad` pasos iguales.
 *
 *   · **Un gesto, un paso** (la rueda: `gestoDeLaRueda`, la del Portfolio; una tecla apretada, no su repetición; con `tactil`, un
 *     deslizamiento del dedo). De a uno, sin saltear: el gesto vuela al centro del paso de al lado (`volar`, con dueño y con fin).
 *   · **La transición se ve entera** (F1): mientras dura (`duracionMs`) o mientras vuela un salto, los gestos se tragan y la ráfaga
 *     que sobra se descarta; recién quieta la rueda (160 ms) cuenta un gesto nuevo.
 *   · **La entrada atrapa** (F2): la rueda que lleva la página adentro desde afuera aterriza en el primero del sentido. El dedo y la
 *     inercia nativa (sin Lenis) entran por el scroll: si el scroll entra con un gesto reciente, se acomoda al primero del sentido.
 *   · **Afuera, la página es de la página**: antes y después del tramo nada se toma. La barra de desplazamiento y las anclas mueven el
 *     scroll y el paso lo sigue con histéresis (no se pueden retener).
 *   · Con un diálogo abierto (el contacto, el menú) o adentro de un `data-lenis-prevent`, nada.
 *   · [C2-50] Sin Lenis (abajo de 1025), la rueda nativa: el destino de cada evento es lo ya pedido (`seguirElObjetivo`), no el scroll
 *     que llega tarde; y un vuelo que termina lejos de su destino (el scroll nativo de antes lo pisó) se asienta en él.
 *
 * [NOCTURNO B5] La usa también la PARADA DE DEMOS (un solo paso entre el Portfolio y Servicios, `trabajos/demos/parada.ts`): con su
 * transición propia (`ocupada`: la llegada de Demos), su salida de arriba (a «la tuya») y su nombre en el banco. Y ninguna sección lanza
 * un vuelo encima del de otra (`vueloAjeno`): la rueda se traga y el que vuela llega.
 */

export interface OpcionesDeLosGatillos {
  readonly pista: RefObject<HTMLElement | null>
  readonly cantidad: number
  /** Si la máquina toma los gestos. Apagada, el paso sigue al scroll y nada se toma. */
  readonly activa: boolean
  /** Si también toma el dedo (el teléfono en `?servicios-movil=gatillo`). */
  readonly tactil: boolean
  readonly reducido: boolean
  /** Lo que dura la transición de un paso al de al lado (ms). */
  readonly duracionMs: number
  /**
   * [NOCTURNO B5] La transición PROPIA de la sección, si no es un reloj fijo: mientras devuelva `true`, todo se traga como en F1 (la
   * parada de Demos: su llegada, que persigue al scroll con su velocidad tope). Se lee en cada evento.
   */
  readonly ocupada?: () => boolean
  /**
   * [NOCTURNO B5] Adónde lleva la salida de arriba (el scroll, px de la página), si no es una pantalla antes de la pista: la parada de
   * Demos sube a «la tuya» del Portfolio. `null`: la de siempre. Se lee en el gesto.
   */
  readonly salidaDeArriba?: () => number | null
  /** [NOCTURNO B5] Con nombre, el banco la publica en `__gatillosDelBancoDe[nombre]` (sin nombre, `__gatillosDelBanco`: Servicios). */
  readonly nombre?: string
  /**
   * [C2-51] La salida de abajo sin gatillo (Servicios: del último servicio al recomendador): bajar desde el último es scroll normal
   * (la rueda, las teclas y el dedo), y el último aterriza al pie de su tramo. Ver `ReglaDeGatillos.salidaDeAbajoLibre`.
   */
  readonly salidaDeAbajoLibre?: boolean
  /** [L2] La entrada y la salida de arriba sin gatillo (Servicios en el teléfono: el cruce con Demos). Ver `ReglaDeGatillos.salidaDeArribaLibre`. */
  readonly salidaDeArribaLibre?: boolean
}

export interface GatillosVivos {
  /** −1 antes del ancla, 0…cantidad−1 adentro, `cantidad` después. */
  readonly paso: number
  /** Lo que se muestra (0…cantidad−1). */
  readonly vista: number
  /** Lleva la página a un paso (el foco que entra en un panel que no se ve: el teclado tiene que ver lo que enfoca). */
  readonly ir: (paso: number) => void
}

/** Un gesto que pasó hace menos que esto (ms) es el que trae el scroll (la inercia de un golpe fuerte o del dedo). */
export const GESTO_RECIENTE_MS = 600
/** Lo que tiene que correr el dedo para ser un gesto (px). */
export const DEDO_PX = 24

type EventoDeLenis = WheelEvent & { lenisStopPropagation?: boolean }

const enUnCampo = (t: EventTarget | null): boolean => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
const conDialogo = (): boolean => document.querySelector('[data-v3]')?.hasAttribute('data-contacto-abierto') === true || getComputedStyle(document.documentElement).overflowY === 'hidden'
const enUnDialogo = (e: Event): boolean => e.composedPath().some((n) => n instanceof HTMLElement && n.hasAttribute('data-lenis-prevent'))

/** Ni Lenis (que lee `lenisStopPropagation`) ni el navegador (`preventDefault`) corren la página con este evento. */
function tragar(e: WheelEvent): void {
  const paraLenis: EventoDeLenis = e
  paraLenis.lenisStopPropagation = true
  if (e.cancelable) e.preventDefault()
}

export function useGatillos(o: OpcionesDeLosGatillos): GatillosVivos {
  const { pista, cantidad, activa, tactil, reducido, duracionMs, ocupada, salidaDeArriba, nombre, salidaDeAbajoLibre = false, salidaDeArribaLibre = false } = o
  const [paso, setPaso] = useState(ANTES_DEL_ANCLA)
  const actual = useRef(ANTES_DEL_ANCLA)
  const regla = useRef<ReglaDeGatillos>({ cantidad, pasoPx: 1 })
  const inicio = useRef(0)
  const enVuelo = useRef<VueloDelGatillo | null>(null)
  const ocupadoHasta = useRef(0)
  const ultimoGesto = useRef(Number.NEGATIVE_INFINITY)
  const objetivo = useRef<ObjetivoNativo>(SIN_OBJETIVO)
  const ajustes = useRef({ activa, tactil, reducido, duracionMs, ocupada, salidaDeArriba })
  const irAlPaso = useRef<(i: number) => void>(() => undefined)
  useEffect(() => {
    ajustes.current = { activa, tactil, reducido, duracionMs, ocupada, salidaDeArriba }
  }, [activa, tactil, reducido, duracionMs, ocupada, salidaDeArriba])

  useLayoutEffect(() => {
    let pedido = 0
    const elVuelo = enVuelo
    // [C2-51] El defecto del banco (`con-gatillo-al-final`): la salida de abajo de B4, con su vuelo.
    const libre = salidaDeAbajoLibre && !conElDefectoDeLosGatillos('con-gatillo-al-final')
    // [L2] El defecto del banco (`con-gatillo-arriba`): la entrada y la salida de arriba de antes.
    const arriba = salidaDeArribaLibre && !conElDefectoDeLosGatillos('con-gatillo-arriba')
    const medir = (): boolean => {
      const el = pista.current
      const alto = window.innerHeight
      if (el === null || !(alto > 0)) return false
      inicio.current = el.getBoundingClientRect().top + window.scrollY
      regla.current = { cantidad, pasoPx: Math.max(1, (el.offsetHeight - alto) / cantidad), salidaDeArribaLibre: arriba, salidaDeAbajoLibre: libre }
      return true
    }
    const publicar = (siguiente: number): void => {
      const antes = actual.current
      if (siguiente === antes) return
      if (vistaDelPasoEnElTramo(siguiente, cantidad) !== vistaDelPasoEnElTramo(antes, cantidad))
        ocupadoHasta.current = performance.now() + (ajustes.current.reducido ? 0 : ajustes.current.duracionMs)
      actual.current = siguiente
      pista.current?.setAttribute('data-paso', String(siguiente))
      setPaso(siguiente)
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(leer)
    }
    // El defecto del banco (`sin-objetivo-nativo`): sin la cuenta de lo pedido ni el asiento al llegar (el bug de 390).
    const sinObjetivo = conElDefectoDeLosGatillos('sin-objetivo-nativo')
    const irA = (y: number, ms: number, destino: number): void => {
      pista.current?.setAttribute('data-en-vuelo', 'si')
      objetivo.current = SIN_OBJETIVO
      volar(enVuelo, y, ajustes.current.reducido ? 0 : ms, () => {
        pista.current?.removeAttribute('data-en-vuelo')
        if (LENIS_DEL_SITIO.instancia !== null || sinObjetivo) return pedir()
        // Sin Lenis: si el scroll nativo de antes lo corrió, se asienta en su destino (un cuadro después: otro vuelo manda).
        requestAnimationFrame(() => {
          if (enVuelo.current === null && Math.abs(window.scrollY - Math.round(y)) > HISTERESIS_DEL_GATILLO_PX) window.scrollTo({ top: Math.round(y), behavior: 'instant' })
          pedir()
        })
      })
      publicar(destino)
    }
    const alPaso = (i: number, ms: number): void => {
      if (medir()) irA(inicio.current + aterrizajeDelPasoEnElTramo(i, regla.current), ms, i)
    }
    const porGesto = (sentido: 1 | -1): void => {
      if (!medir()) return
      const d = destinoDelGesto(vistaDelPasoEnElTramo(actual.current, cantidad), sentido, cantidad)
      const r = regla.current
      if (d.tipo === 'paso') alPaso(d.indice, duracionDelSalto(1))
      else if (d.tipo === 'despues') irA(inicio.current + r.cantidad * r.pasoPx + window.innerHeight, SALTO.topeMs, cantidad)
      // [NOCTURNO B5] La de arriba, adonde diga la sección (Demos: «la tuya»); si no, una pantalla antes de la pista.
      else irA(ajustes.current.salidaDeArriba?.() ?? inicio.current - window.innerHeight, SALTO.topeMs, ANTES_DEL_ANCLA)
    }
    // El defecto del banco (`sin-candado`): ni la transición ni el vuelo tragan los gestos que llegan en el medio.
    const sinCandado = conElDefectoDeLosGatillos('sin-candado')
    // [NOCTURNO B5] Y la transición propia de la sección (`ocupada`: la llegada de Demos), mientras corra.
    const ocupado = (): boolean => !sinCandado && (enVuelo.current !== null || performance.now() < ocupadoHasta.current || ajustes.current.ocupada?.() === true)
    irAlPaso.current = (i) => {
      const destino = Math.min(cantidad - 1, Math.max(0, i))
      if (ajustes.current.activa && destino !== actual.current) alPaso(destino, duracionDelSalto(Math.abs(destino - vistaDelPasoEnElTramo(actual.current, cantidad))))
    }
    function leer(): void {
      pedido = 0
      if (!medir()) return
      const vuelo = enVuelo.current
      if (vuelo !== null && vueloDelGatilloPisado(vuelo, LENIS_DEL_SITIO.instancia)) vuelo.cancelar()
      if (enVuelo.current !== null) return
      const antes = actual.current
      const siguiente = pasoConHisteresisEnElTramo(antes, window.scrollY - inicio.current, regla.current)
      // F2 con el dedo o la inercia nativa: el scroll que entra traído por un gesto reciente se acomoda al primero del sentido.
      const entra = faseDe(antes, cantidad) !== 'adentro' && faseDe(siguiente, cantidad) === 'adentro'
      const primero = antes < 0 ? 0 : cantidad - 1
      if (ajustes.current.activa && entra && siguiente !== primero && performance.now() - ultimoGesto.current < GESTO_RECIENTE_MS) alPaso(primero, duracionDelSalto(1))
      else publicar(siguiente)
    }

    let gesto = GESTO_QUIETO
    const alGirar = (e: WheelEvent): void => {
      if (!ajustes.current.activa || e.ctrlKey || e.deltaY === 0 || enUnDialogo(e) || conDialogo()) return
      const ahora = performance.now()
      ultimoGesto.current = ahora
      if (!medir()) return
      const px = pxDeLaRueda(e.deltaY, e.deltaMode)
      const lenis = LENIS_DEL_SITIO.instancia
      const base = lenis !== null ? lenis.targetScroll : sinObjetivo ? window.scrollY : baseDelObjetivo(objetivo.current, window.scrollY, ahora)
      const hacia = base + px * (lenis !== null ? lenis.options.wheelMultiplier : 1) - inicio.current
      // [NOCTURNO B5] El vuelo de otra sección cuenta como uno propio: se traga, sin lanzar otro encima (`vueloAjeno`).
      const vuela = (enVuelo.current !== null || vueloAjeno(lenis, enVuelo.current)) && !sinCandado
      const { decision, gesto: siguiente } = decidirLaRueda({ paso: actual.current, enVuelo: vuela, ocupado: ocupado(), gesto, px, ahora, hacia }, regla.current)
      gesto = siguiente
      if (decision.tipo === 'pagina') {
        if (lenis === null) objetivo.current = seguirElObjetivo(objetivo.current, window.scrollY, px, ahora, document.documentElement.scrollHeight - window.innerHeight)
        return
      }
      objetivo.current = SIN_OBJETIVO
      tragar(e)
      if (decision.tipo === 'entrada') alPaso(decision.paso, duracionDelSalto(1))
      else if (decision.tipo === 'paso' && decision.sentido !== null) porGesto(decision.sentido)
    }
    const alApretar = (e: KeyboardEvent): void => {
      if (!ajustes.current.activa || e.defaultPrevented || e.key === 'Home' || e.key === 'End') return
      const sentido = sentidoDeLaTecla(e.key, e.shiftKey, e.altKey || e.ctrlKey || e.metaKey, enUnCampo(e.target))
      if (sentido === null || conDialogo()) return
      const decision = decidirLaTecla(actual.current, cantidad, enVuelo.current !== null, ocupado(), e.repeat, salidaLibre(actual.current, sentido, regla.current))
      if (decision === 'pagina') return
      e.preventDefault()
      ultimoGesto.current = performance.now()
      if (decision === 'paso') porGesto(sentido)
    }
    const dedo = { y: 0, disparado: false, desdeArriba: false }
    const alTocar = (e: TouchEvent): void => {
      dedo.y = e.touches[0]?.clientY ?? 0
      dedo.disparado = false
      dedo.desdeArriba = faseDe(actual.current, cantidad) === 'antes'
      ultimoGesto.current = performance.now()
    }
    const alArrastrar = (e: TouchEvent): void => {
      const y = e.touches[0]?.clientY
      if (!ajustes.current.activa || !ajustes.current.tactil || y === undefined || conDialogo()) return
      ultimoGesto.current = performance.now()
      if (enVuelo.current === null && faseDe(actual.current, cantidad) !== 'adentro') return
      const dy = y - dedo.y
      // [L2] La salida de arriba libre: el dedo que sube la página desde la entrada (contado desde que tocó, como la de abajo) es de la página.
      // Y el que la trajo desde arriba no da el paso de al lado (ése es del gesto siguiente); si el navegador ya no deja frenar ese scroll, sigue
      // con el scroll y los servicios pasan por la histéresis, sin vuelo.
      if (dy > 0 && enVuelo.current === null && !ocupado() && salidaLibre(actual.current, -1, regla.current)) return
      if (dedo.desdeArriba && regla.current.salidaDeArribaLibre === true) dedo.disparado = true
      // [C2-51] La salida libre: el dedo que baja la página desde el último es de la página (ni se traga ni dispara).
      if (dy <= 0 && enVuelo.current === null && !ocupado() && salidaLibre(actual.current, 1, regla.current)) return
      if (e.cancelable) e.preventDefault()
      if (dedo.disparado || Math.abs(dy) < DEDO_PX) return
      dedo.disparado = true
      if (!ocupado()) porGesto(dy < 0 ? 1 : -1)
    }

    pedir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    window.addEventListener('wheel', alGirar, { passive: false, capture: true })
    window.addEventListener('keydown', alApretar, { capture: true })
    window.addEventListener('touchstart', alTocar, { passive: true, capture: true })
    window.addEventListener('touchmove', alArrastrar, { passive: false, capture: true })
    const ventana = window as Window & { __gatillosDelBanco?: unknown; __gatillosDelBancoDe?: Record<string, unknown> }
    const delBanco = { paso: () => actual.current, enVuelo: () => enVuelo.current !== null, ocupado, regla: () => ({ ...regla.current, inicio: inicio.current }) }
    if (hayBanco()) {
      if (nombre === undefined) ventana.__gatillosDelBanco = delBanco
      else ventana.__gatillosDelBancoDe = { ...ventana.__gatillosDelBancoDe, [nombre]: delBanco }
    }
    return () => {
      if (pedido !== 0) cancelAnimationFrame(pedido)
      elVuelo.current?.cancelar()
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      window.removeEventListener('wheel', alGirar, { capture: true })
      window.removeEventListener('keydown', alApretar, { capture: true })
      window.removeEventListener('touchstart', alTocar, { capture: true })
      window.removeEventListener('touchmove', alArrastrar, { capture: true })
      if (hayBanco() && nombre === undefined) delete ventana.__gatillosDelBanco
      else if (hayBanco() && nombre !== undefined) delete ventana.__gatillosDelBancoDe?.[nombre]
    }
  }, [pista, cantidad, nombre, salidaDeAbajoLibre, salidaDeArribaLibre])

  const ir = useCallback((i: number) => irAlPaso.current(i), [])
  return { paso, vista: vistaDelPasoEnElTramo(paso, cantidad), ir }
}
