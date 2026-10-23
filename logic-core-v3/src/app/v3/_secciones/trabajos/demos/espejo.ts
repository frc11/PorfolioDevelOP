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

/** La columna de Demos arranca a la altura del título del Portfolio (sólo con el escenario pegado de escritorio). */
export function useEspejoDelPortfolio(capa: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const el = capa.current
    const escenario = el?.closest<HTMLElement>('[data-pieza="escenario-del-portfolio"]') ?? null
    const encabezado = escenario?.querySelector<HTMLElement>('[data-pieza="encabezado-del-portfolio"]') ?? null
    if (el === null || escenario === null || encabezado === null || conElDefectoDeDemos('sin-espejo')) return undefined
    let ultimo = ''
    const medir = (): void => {
      const tope = topeEnElEscenario(encabezado, escenario)
      const valor = tope === null ? '' : `${tope.toFixed(1)}px`
      if (valor === ultimo) return
      ultimo = valor
      if (valor === '') el.style.removeProperty(VARIABLE_DEL_TOPE)
      else el.style.setProperty(VARIABLE_DEL_TOPE, valor)
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(encabezado)
    observador.observe(escenario)
    return () => {
      observador.disconnect()
      el.style.removeProperty(VARIABLE_DEL_TOPE)
    }
  }, [capa])
}
