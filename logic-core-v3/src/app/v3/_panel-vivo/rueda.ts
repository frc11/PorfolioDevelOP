'use client'

import { useEffect, useRef, type RefObject } from 'react'

/**
 * [PASADA FINAL] B1 · LA RUEDA, ADENTRO SÓLO CUANDO HAY RECORRIDO — una caja con scroll propio adentro de una demo (el
 * contenido del panel, el detalle de un módulo) no puede secuestrar la rueda de la página. Lenis (el scroll suave de la
 * página) deja pasar la rueda sobre lo que lleva `data-lenis-prevent`; acá ese atributo se decide EN CADA RUEDA, antes
 * de que Lenis la vea (en la fase de captura de la propia caja): si la caja puede moverse hacia donde va la rueda, el
 * atributo está y la caja scrollea sola; si llegó a su borde (o no tiene recorrido), el atributo no está y la rueda es
 * de la página, que sigue suave. Pasiva: no frena nada.
 */
export function useRuedaAdentro<T extends HTMLElement>(): RefObject<T | null> {
  const caja = useRef<T | null>(null)
  useEffect(() => {
    const el = caja.current
    if (el === null) return undefined
    const decidir = (e: WheelEvent): void => {
      const puede = e.deltaY > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : e.deltaY < 0 ? el.scrollTop > 0 : false
      if (puede) el.setAttribute('data-lenis-prevent', '')
      else el.removeAttribute('data-lenis-prevent')
    }
    el.addEventListener('wheel', decidir, { capture: true, passive: true })
    return () => {
      el.removeEventListener('wheel', decidir, true)
      el.removeAttribute('data-lenis-prevent')
    }
  }, [])
  return caja
}
