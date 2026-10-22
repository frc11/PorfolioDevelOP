'use client'

import { animate, useMotionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

import { viajeEnCurso } from '../../../_lib/escena/viaje'
import { SERVICIOS } from '../../_contrato/acento'
import { DISTRIBUCION } from './datos'
import { traslacionDelPanel } from './PanelDeServicio'
import { DURACION_DE_LA_TRANSICION_MS, G_DEL_CAMBIO_SIN_MEDIR, TIEMPOS, avanceDelPanel, avanceDelRenglon, capaDelEnjambre, desdeDelTexto } from './tiempos'

/**
 * [B4] LA COREOGRAFÍA DEL ESCENARIO — UN valor (`posicion`, de 0 a 3) y todo lo demás colgando de él, sin re-renderizar: cuando la
 * máquina de gatillos cambia de estado, `posicion` corre por tiempo hasta el nuevo (una transición, `DURACION_DE_LA_TRANSICION_MS`) y
 * cada cuadro mueve los paneles, los renglones y la capa del lienzo (`tiempos.ts`). Al subir, el mismo camino al revés.
 *
 * Un salto de más de un estado (la barra de desplazamiento, un ancla), un viaje del menú o el movimiento reducido: de golpe.
 */

/** El cambio de capa de la transición de la entrada a web: en qué `g` y desde cuándo entra el panel (lo calcula el enjambre). */
export interface CambioDeCapa {
  readonly g: number
  readonly inicioDelPanel: number
}

export const SIN_CAMBIO: CambioDeCapa = { g: G_DEL_CAMBIO_SIN_MEDIR, inicioDelPanel: TIEMPOS.panel.inicio }

export function usePosicionDelEscenario(vista: number, reducido: boolean): MotionValue<number> {
  const posicion = useMotionValue(vista)
  const primera = useRef(true)
  useEffect(() => {
    if (primera.current) {
      primera.current = false
      posicion.jump(vista)
      return undefined
    }
    const desde = posicion.get()
    if (reducido || Math.abs(vista - desde) > 1.001 || viajeEnCurso() !== null) {
      posicion.jump(vista)
      return undefined
    }
    const control = animate(posicion, vista, { duration: (Math.abs(vista - desde) * DURACION_DE_LA_TRANSICION_MS) / 1000, ease: 'linear' })
    return () => control.stop()
  }, [vista, reducido, posicion])
  return posicion
}

interface Palabra {
  readonly el: HTMLElement
  readonly renglon: number
}

interface Piezas {
  readonly paneles: readonly HTMLElement[]
  readonly palabras: readonly (readonly Palabra[])[]
  readonly renglones: readonly number[]
}

/** Las palabras de un panel, agrupadas en renglones por su tope en el layout (las transformadas no cuentan). */
function renglonesDe(panel: HTMLElement): { readonly palabras: readonly Palabra[]; readonly cuantos: number } {
  const els = [...panel.querySelectorAll<HTMLElement>('[data-palabra]')]
  const topes: number[] = []
  const palabras = els.map((el) => {
    const tope = el.parentElement?.offsetTop ?? el.offsetTop
    let renglon = topes.findIndex((t) => Math.abs(t - tope) < 4)
    if (renglon < 0) renglon = topes.push(tope) - 1
    return { el, renglon }
  })
  return { palabras, cuantos: topes.length }
}

/** El `z-index` del lienzo en cada capa: debajo de la entrada (`z-10`) o encima de los paneles (`z-20`). */
export const CAPA_DEL_LIENZO = { detras: 0, delante: 30 } as const

export function aplicarLaPosicion(p: number, piezas: Piezas, lienzo: HTMLElement | null, cambio: CambioDeCapa): void {
  SERVICIOS.forEach((s, i) => {
    const panel = piezas.paneles[i]
    if (panel === undefined) return
    const g = Math.min(1, Math.max(0, p - i))
    const inicio = i === 0 ? cambio.inicioDelPanel : TIEMPOS.panel.inicio
    panel.style.translate = traslacionDelPanel(DISTRIBUCION[s.id].entrada, avanceDelPanel(g, inicio))
    const n = piezas.renglones[i] ?? 1
    const desde = desdeDelTexto(inicio)
    for (const { el, renglon } of piezas.palabras[i] ?? []) el.style.translate = `0 ${((1 - avanceDelRenglon(g, renglon, n, desde)) * 120).toFixed(2)}%`
  })
  const capa = capaDelEnjambre(p, cambio.g)
  if (lienzo === null || lienzo.getAttribute('data-capa') === capa) return
  lienzo.setAttribute('data-capa', capa)
  lienzo.style.zIndex = String(CAPA_DEL_LIENZO[capa])
}

export function useCoreografiaDelEscenario(escenario: RefObject<HTMLElement | null>, lienzo: RefObject<HTMLElement | null>, posicion: MotionValue<number>, cambio: RefObject<CambioDeCapa>): void {
  const piezas = useRef<Piezas>({ paneles: [], palabras: [], renglones: [] })
  useLayoutEffect(() => {
    const el = escenario.current
    if (el === null) return undefined
    const medir = (): void => {
      const paneles = [...el.querySelectorAll<HTMLElement>('[data-pieza="panel-de-servicio"]')]
      const grupos = paneles.map(renglonesDe)
      piezas.current = { paneles, palabras: grupos.map((g) => g.palabras), renglones: grupos.map((g) => g.cuantos) }
      aplicarLaPosicion(posicion.get(), piezas.current, lienzo.current, cambio.current)
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    void document.fonts.ready.then(medir)
    return () => observador.disconnect()
  }, [escenario, lienzo, posicion, cambio])
  useMotionValueEvent(posicion, 'change', (p) => aplicarLaPosicion(p, piezas.current, lienzo.current, cambio.current))
}
