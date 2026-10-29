'use client'

import { animate, useMotionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

import { viajeEnCurso } from '../../../_lib/escena/viaje'
import { SERVICIOS } from '../../_contrato/acento'
import { DISTRIBUCION } from './datos'
import { traslacionDelPanel } from './PanelDeServicio'
import { ajustarElTexto, ajustarElTitulo } from './ajuste'
import { conElDefectoDeLosGatillos } from '../../../_componentes/gatillos/defectos'
import { G_DEL_CAMBIO_SIN_MEDIR, TIEMPOS, avanceDelPanel, avanceDelRenglon, avanceDelSubrayado, capaDelEnjambre, desdeDelTexto, retomarHacia } from './tiempos'

/**
 * [B4] LA COREOGRAFÍA DEL ESCENARIO — UN valor (`posicion`, de 0 a 3) y todo lo demás colgando de él, sin re-renderizar: cuando la
 * máquina de gatillos cambia de estado, `posicion` corre por tiempo hasta el nuevo (una transición, `DURACION_DE_LA_TRANSICION_MS`) y
 * cada cuadro mueve los paneles, los renglones y la capa del lienzo (`tiempos.ts`). Al subir, el mismo camino al revés.
 *
 * [C2-50] Además, al medir, ajusta las letras de cada panel (`ajuste.ts`: el texto de techo a pie, el título a su columna) ANTES de
 * agrupar los renglones, y vuelve a medir cuando llega una letra (`clave`, y los `loadingdone` del documento); y en cada cuadro
 * escribe el subrayado del título (`avanceDelSubrayado`).
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
  const vistaAntes = useRef(vista)
  useEffect(() => {
    const antes = vistaAntes.current
    vistaAntes.current = vista
    if (primera.current) {
      primera.current = false
      posicion.jump(vista)
      return undefined
    }
    // [L3] Desde donde está: un gesto en medio de la transición la retoma (ver `retomarHacia`).
    const { salta, ms } = retomarHacia(posicion.get(), antes, vista, conElDefectoDeLosGatillos('con-salto'))
    if (reducido || salta || viajeEnCurso() !== null) {
      posicion.jump(vista)
      return undefined
    }
    const control = animate(posicion, vista, { duration: ms / 1000, ease: 'linear' })
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
  readonly subrayados: readonly (readonly HTMLElement[])[]
}

/**
 * Las palabras de un panel, agrupadas en renglones por su tope en el layout (las transformadas no cuentan). [L3] Las de un párrafo
 * oculto (el teléfono muestra dos) no cuentan: sin caja, caerían en un renglón de mentira.
 */
function renglonesDe(panel: HTMLElement): { readonly palabras: readonly Palabra[]; readonly cuantos: number } {
  const els = [...panel.querySelectorAll<HTMLElement>('[data-palabra]')].filter((el) => el.getClientRects().length > 0)
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
    piezas.subrayados[i]?.forEach((s, k) => (s.style.scale = `${avanceDelSubrayado(g, inicio, k).toFixed(4)} 1`))
  })
  const capa = capaDelEnjambre(p, cambio.g)
  if (lienzo === null || lienzo.getAttribute('data-capa') === capa) return
  lienzo.setAttribute('data-capa', capa)
  lienzo.style.zIndex = String(CAPA_DEL_LIENZO[capa])
}

export function useCoreografiaDelEscenario(escenario: RefObject<HTMLElement | null>, lienzo: RefObject<HTMLElement | null>, posicion: MotionValue<number>, cambio: RefObject<CambioDeCapa>, clave = ''): void {
  const piezas = useRef<Piezas>({ paneles: [], palabras: [], renglones: [], subrayados: [] })
  useLayoutEffect(() => {
    const el = escenario.current
    if (el === null) return undefined
    const medir = (): void => {
      const paneles = [...el.querySelectorAll<HTMLElement>('[data-pieza="panel-de-servicio"]')]
      for (const panel of paneles) {
        const titulo = panel.querySelector<HTMLElement>('[data-parte="titulo-del-servicio"]')
        const texto = panel.querySelector<HTMLElement>('[data-pieza="texto-del-servicio"]')
        if (titulo !== null) ajustarElTitulo(titulo)
        if (texto !== null) ajustarElTexto(texto)
      }
      const grupos = paneles.map(renglonesDe)
      const subrayados = paneles.map((p) => [...p.querySelectorAll<HTMLElement>('[data-parte="subrayado-del-servicio"]')])
      piezas.current = { paneles, palabras: grupos.map((g) => g.palabras), renglones: grupos.map((g) => g.cuantos), subrayados }
      aplicarLaPosicion(posicion.get(), piezas.current, lienzo.current, cambio.current)
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    void document.fonts.ready.then(medir)
    document.fonts.addEventListener('loadingdone', medir)
    return () => {
      observador.disconnect()
      document.fonts.removeEventListener('loadingdone', medir)
    }
  }, [escenario, lienzo, posicion, cambio, clave])
  useMotionValueEvent(posicion, 'change', (p) => aplicarLaPosicion(p, piezas.current, lienzo.current, cambio.current))
}
