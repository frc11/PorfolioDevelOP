'use client'

import { useEffect, type RefObject } from 'react'

import { pedirElCorrimiento, publicarElPanel, type PedidoDeCorrimiento } from '../../../_chrome/barra/corrimiento'

import { escenarioDe } from './medida'

/**
 * El eje del título (el medio de la columna) y el borde del panel en su lugar (medido en el layout: el panel puede estar afuera, con su
 * transformada), o `null` si el escenario no está.
 */
export function geometriaDelPanel(escenario: HTMLElement | null): PedidoDeCorrimiento | null {
  const columna = escenario?.querySelector<HTMLElement>('[data-pieza="columna-del-portfolio"]') ?? null
  const panel = escenario?.querySelector<HTMLElement>('[data-pieza="panel-del-portfolio"]') ?? null
  if (escenario === null || columna === null || panel === null) return null
  const c = columna.getBoundingClientRect()
  const e = escenario.getBoundingClientRect()
  return { eje: c.left + c.width / 2, borde: e.left + escenario.clientWidth - panel.offsetWidth }
}

/**
 * [B1.2d] EL PORTFOLIO LE PIDE A LA BARRA QUE SE CORRA (§14, A1) cuando le toca en el orden (`barra`), con la geometría del panel. Lo
 * vuelve a medir con cada cambio de tamaño; sin el pedido (o al desmontar), la suelta. [A2.1] La geometría se publica SIEMPRE (no sólo
 * con la barra): el despeje del medio (`despejeDelMedio`) es del ancho, y el medio no salta cuando la píldora vuelve.
 */
export function useBarraDelPortfolio(caja: RefObject<HTMLElement | null>, barra: boolean): void {
  useEffect(() => {
    // Los elementos se buscan en cada medición: el escenario se vuelve a montar cuando la sección pasa a la rama con coreografía.
    const pedir = (): void => {
      const geometria = geometriaDelPanel(escenarioDe(caja.current))
      if (geometria !== null) publicarElPanel(geometria)
      pedirElCorrimiento(barra ? geometria : null)
    }
    pedir()
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('resize', pedir)
      pedirElCorrimiento(null)
    }
  }, [caja, barra])
  useEffect(() => () => publicarElPanel(null), [])
}
