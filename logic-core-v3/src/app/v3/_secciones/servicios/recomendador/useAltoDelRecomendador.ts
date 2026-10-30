'use client'

import { useLayoutEffect, useRef, type RefObject } from 'react'

/**
 * [L8a] EL ALTO DEL RECOMENDADOR NO SALTA (desde 1024) — la caja tiene el alto de su primer paso y no baja de ahí; si un estado necesita más
 * (el resultado, el contacto) crece con una transición de alto, y el encabezado (a la izquierda, centrado contra la caja) queda donde la
 * primera medida lo puso: nunca se vuelve a centrar. Se escribe en variables de la raíz (`--alto-del-recomendador`, `--tope-del-encabezado`,
 * `--tope-de-la-caja`), que sólo leen las clases de escritorio; sin escribir en React, para no re-renderizar con cada medida.
 */
export const DEMORA_DE_LA_BAJADA_MS = 450

const ALTO = '--alto-del-recomendador'
const TOPE_DEL_ENCABEZADO = '--tope-del-encabezado'
const TOPE_DE_LA_CAJA = '--tope-de-la-caja'

/** El alto que tiene que tener la caja: nunca menos que la base; sube ya y baja después de `DEMORA_DE_LA_BAJADA_MS`. Pura. */
export function altoDeLaCaja(base: number, contenido: number): number {
  return Math.max(base, contenido)
}

export function useAltoDelRecomendador(raiz: RefObject<HTMLElement | null>, caja: RefObject<HTMLElement | null>, interior: RefObject<HTMLElement | null>, encabezado: RefObject<HTMLElement | null>, primerPaso: boolean): void {
  const enElPrimero = useRef(primerPaso)
  useLayoutEffect(() => {
    enElPrimero.current = primerPaso
  }, [primerPaso])
  useLayoutEffect(() => {
    const [r, c, i, e] = [raiz.current, caja.current, interior.current, encabezado.current]
    if (r === null || c === null || i === null || e === null) return undefined
    let base = 0
    let actual = 0
    let espera: number | undefined
    const poner = (px: number): void => {
      actual = px
      r.style.setProperty(ALTO, `${String(px)}px`)
    }
    const alrededor = (): number => {
      const estilo = getComputedStyle(c)
      return Number.parseFloat(estilo.paddingTop) + Number.parseFloat(estilo.paddingBottom) + Number.parseFloat(estilo.borderTopWidth) + Number.parseFloat(estilo.borderBottomWidth)
    }
    const colocarElEncabezado = (): void => {
      // Centrados uno contra el otro en la primera medida, y quietos: el más bajo baja la mitad de la diferencia.
      const [alto, cabecera] = [base, e.offsetHeight]
      r.style.setProperty(TOPE_DEL_ENCABEZADO, `${String(Math.max(0, (alto - cabecera) / 2))}px`)
      r.style.setProperty(TOPE_DE_LA_CAJA, `${String(Math.max(0, (cabecera - alto) / 2))}px`)
    }
    const medir = (): void => {
      const contenido = i.offsetHeight
      // Sin contenido (el hueco entre el que se va y el que llega): se queda como está.
      if (!(contenido > 0)) return
      const total = contenido + alrededor()
      // Sólo el primer paso ya montado (con el resultado o el paso anterior saliendo, no se toma la base).
      if (enElPrimero.current && i.querySelector('[data-etapa="0"]') !== null) {
        window.clearTimeout(espera)
        base = total
        poner(total)
        colocarElEncabezado()
        return
      }
      const objetivo = altoDeLaCaja(base, total)
      window.clearTimeout(espera)
      if (objetivo >= actual) poner(objetivo)
      else espera = window.setTimeout(() => poner(altoDeLaCaja(base, i.offsetHeight + alrededor())), DEMORA_DE_LA_BAJADA_MS)
    }
    const vigia = new ResizeObserver(medir)
    vigia.observe(i)
    vigia.observe(e)
    medir()
    return () => {
      vigia.disconnect()
      window.clearTimeout(espera)
      for (const v of [ALTO, TOPE_DEL_ENCABEZADO, TOPE_DE_LA_CAJA]) r.style.removeProperty(v)
    }
  }, [raiz, caja, interior, encabezado])
}
