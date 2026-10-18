'use client'

import { useEffect, type RefObject } from 'react'

import { pedirElCorrimiento } from '../../../_chrome/barra/corrimiento'

import { escenarioDe } from './medida'

/**
 * [B1.2d] EL PORTFOLIO LE PIDE A LA BARRA QUE SE CORRA (§14, A1) cuando le toca en el orden (`barra`): con el eje del título (el medio de
 * la columna) y el borde del panel en su lugar (medido en el layout: el panel puede estar afuera, con su transformada). Lo vuelve a
 * medir con cada cambio de tamaño; sin el pedido (o al desmontar), la suelta.
 */
export function useBarraDelPortfolio(caja: RefObject<HTMLElement | null>, barra: boolean): void {
  useEffect(() => {
    if (!barra) {
      pedirElCorrimiento(null)
      return undefined
    }
    // Los elementos se buscan en cada medición: el escenario se vuelve a montar cuando la sección pasa a la rama con coreografía.
    const pedir = (): void => {
      const escenario = escenarioDe(caja.current)
      const columna = escenario?.querySelector<HTMLElement>('[data-pieza="columna-del-portfolio"]') ?? null
      const panel = escenario?.querySelector<HTMLElement>('[data-pieza="panel-del-portfolio"]') ?? null
      if (escenario === null || columna === null || panel === null) {
        pedirElCorrimiento(null)
        return
      }
      const c = columna.getBoundingClientRect()
      const e = escenario.getBoundingClientRect()
      pedirElCorrimiento({ eje: c.left + c.width / 2, borde: e.left + escenario.clientWidth - panel.offsetWidth })
    }
    pedir()
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('resize', pedir)
      pedirElCorrimiento(null)
    }
  }, [caja, barra])
}
