'use client'

import { useLayoutEffect, type RefObject } from 'react'

import { conElDefectoDeDemos } from './defectos'

/**
 * [C2-41e] DEMOS, EL ESPEJO DEL PORTFOLIO — desde 1024 el título y la bajada de Demos van a la MISMA altura que los del Portfolio.
 *
 * El Portfolio centra en el alto un bloque (su título, su bajada y el hueco del logo: `EscenarioDelPortfolio`), así que dónde cae su
 * título depende de cuántos renglones tiene su bajada, de la letra cargada y del cuadro. Demos tiene otra bajada (otros renglones): un
 * bloque centrado igual no caería a la misma altura. Así que la columna de Demos arranca donde arranca el título del Portfolio: se mide
 * en el escenario pegado, SIN transformadas (sumando `offsetTop` hasta él, como el hueco del logo: `portfolio/hueco.ts`), y se escribe
 * en la capa (`--demos-tope-del-titulo`, que lee `demos.css`). Como los dos títulos tienen la misma medida y la misma separación hasta
 * su bajada, las bajadas también caen juntas (|Δy| ≤ 2 px: `scripts-carga/demos-escritorio.ts`, `MODO=espejo`).
 *
 * Se vuelve a medir cuando el encabezado del Portfolio o el escenario cambian de tamaño (la letra que llega, otro cuadro): un
 * `ResizeObserver`, sin nada por cuadro. El título 3D de Demos se coloca una vez por llegada, y Demos llega mucho después.
 */
export const VARIABLE_DEL_TOPE = '--demos-tope-del-titulo'

/** Dónde empieza `el` en `escenario` (px, sin transformadas), o `null` si no es su descendiente o no tiene caja. */
export function topeEnElEscenario(el: HTMLElement, escenario: HTMLElement): number | null {
  let y = 0
  let e: HTMLElement | null = el
  while (e !== null && e !== escenario) {
    y += e.offsetTop
    e = e.offsetParent instanceof HTMLElement ? e.offsetParent : null
  }
  if (e !== escenario || !(el.offsetHeight > 0)) return null
  return y
}

/**
 * [L2] EL ABANICO ENTRA EN EL ALTO (Valentino, 41: «no entran en pantalla… hacelo más chico que entre bien tanto en altura como ancho»). Con
 * el tope ya escrito, se mide dónde empieza el abanico y cuánto alto le queda hasta el pie del cuadro (menos `MARGEN_DE_ABAJO_PX`), y se
 * escribe el ancho de placa que cabe ahí (`--libro-ancho-por-el-alto`: la placa es 2:3 y su perspectiva la agranda `CRECIMIENTO_DE_LA_PERSPECTIVA`).
 * `demos.css` toma el menor entre ése y el del ancho, nunca menos que el piso. Si ni el piso entra, la columna sube lo que falta (Valentino
 * lo permitió «solo si es necesario»), sin pasar `TOPE_MINIMO_PX` (debajo de la barra).
 */
export const VARIABLE_DEL_ANCHO_POR_EL_ALTO = '--libro-ancho-por-el-alto'
export const MARGEN_DE_ABAJO_PX = 40
export const CRECIMIENTO_DE_LA_PERSPECTIVA = 1.06
export const PISO_DE_LA_PLACA_PX = 164
export const TOPE_MINIMO_PX = 96

/** El ancho de placa que entra en `libre` px de alto con el aire de arriba del estante (`relleno`). */
export const anchoPorElAlto = (libre: number, relleno: number): number => (libre - relleno) / (1.5 * CRECIMIENTO_DE_LA_PERSPECTIVA)

/** Cuánto tiene que subir la columna para que entre el piso (px; 0 si entra). */
export const loQueFaltaParaElPiso = (libre: number, relleno: number): number => Math.max(0, PISO_DE_LA_PLACA_PX * 1.5 * CRECIMIENTO_DE_LA_PERSPECTIVA + relleno - libre)

/** La columna de Demos arranca a la altura del título del Portfolio (sólo con el escenario pegado de escritorio). */
export function useEspejoDelPortfolio(capa: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const el = capa.current
    const escenario = el?.closest<HTMLElement>('[data-pieza="escenario-del-portfolio"]') ?? null
    const encabezado = escenario?.querySelector<HTMLElement>('[data-pieza="encabezado-del-portfolio"]') ?? null
    if (el === null || escenario === null || encabezado === null || conElDefectoDeDemos('sin-espejo')) return undefined
    const abanico = el.querySelector<HTMLElement>('[data-parte="abanico"]')
    const columna = el.querySelector<HTMLElement>('[data-parte="columna-de-demos"]')
    let ultimo = ''
    const escribir = (variable: string, valor: string): void => {
      if (valor === '') el.style.removeProperty(variable)
      else el.style.setProperty(variable, valor)
    }
    const medir = (): void => {
      const tope = topeEnElEscenario(encabezado, escenario)
      // [L2] El alto que le queda al abanico con el tope del espejo (medido con el tope que tiene puesto ahora, corrido al nuevo), y si no
      // entra el piso, lo que sube la columna.
      const puesto = columna === null ? Number.NaN : parseFloat(getComputedStyle(columna).paddingTop)
      const medido = abanico === null || tope === null || !Number.isFinite(puesto) ? null : topeEnElEscenario(abanico, escenario)
      const desde = medido === null || tope === null ? null : medido - puesto + tope
      const estante = abanico?.querySelector<HTMLElement>('[data-pieza="estante"]') ?? null
      const relleno = estante === null ? 0 : parseFloat(getComputedStyle(estante).paddingBlockStart) || 0
      const libre = desde === null ? null : escenario.offsetHeight - desde - MARGEN_DE_ABAJO_PX
      const sube = libre === null || tope === null ? 0 : Math.min(loQueFaltaParaElPiso(libre, relleno), Math.max(0, tope - TOPE_MINIMO_PX))
      const valor = tope === null ? '' : `${(tope - sube).toFixed(1)}px`
      const ancho = libre === null || conElDefectoDeDemos('sin-alto') ? '' : `${anchoPorElAlto(libre + sube, relleno).toFixed(1)}px`
      if (`${valor}|${ancho}` === ultimo) return
      ultimo = `${valor}|${ancho}`
      if (valor === '') el.style.removeProperty(VARIABLE_DEL_TOPE)
      else el.style.setProperty(VARIABLE_DEL_TOPE, valor)
      escribir(VARIABLE_DEL_ANCHO_POR_EL_ALTO, ancho)
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(encabezado)
    observador.observe(escenario)
    if (columna !== null) observador.observe(columna)
    return () => {
      observador.disconnect()
      el.style.removeProperty(VARIABLE_DEL_TOPE)
      el.style.removeProperty(VARIABLE_DEL_ANCHO_POR_EL_ALTO)
    }
  }, [capa])
}
