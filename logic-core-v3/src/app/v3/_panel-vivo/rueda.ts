'use client'

import { createContext, useContext, useEffect, useRef, type RefObject } from 'react'

/**
 * [B6] EL CANDADO DEL MÓDULO — si el scroll de adentro de la demo está habilitado. Lo da el módulo de Tu panel
 * (`_secciones/tu-panel/Tarjeta.tsx`): bloqueado hasta un clic (o un toque) adentro, y otra vez al salir. El defecto es
 * libre: una demo montada fuera de un módulo con candado se comporta como antes.
 */
export const RuedaDelModulo = createContext<boolean>(true)

/** ¿El scroll de adentro está habilitado? */
export function useRuedaLibre(): boolean {
  return useContext(RuedaDelModulo)
}

/**
 * [PASADA FINAL] B1 · LA RUEDA, ADENTRO SÓLO CUANDO HAY RECORRIDO — una caja con scroll propio adentro de una demo (el
 * contenido del panel, el detalle de un módulo) no puede secuestrar la rueda de la página. Lenis (el scroll suave de la
 * página) deja pasar la rueda sobre lo que lleva `data-lenis-prevent`; acá ese atributo se decide EN CADA RUEDA, antes
 * de que Lenis la vea (en la fase de captura de la propia caja): si la caja puede moverse hacia donde va la rueda, el
 * atributo está y la caja scrollea sola; si llegó a su borde (o no tiene recorrido), el atributo no está y la rueda es
 * de la página, que sigue suave. Pasiva: no frena nada. [B6] Con el candado puesto, el atributo nunca está: la rueda es
 * de la página aunque la caja tenga recorrido.
 */
export function useRuedaAdentro<T extends HTMLElement>(): RefObject<T | null> {
  const caja = useRef<T | null>(null)
  const libre = useRuedaLibre()
  const libreAhora = useRef(libre)
  useEffect(() => {
    libreAhora.current = libre
    if (!libre) caja.current?.removeAttribute('data-lenis-prevent')
  }, [libre])
  useEffect(() => {
    const el = caja.current
    if (el === null) return undefined
    const decidir = (e: WheelEvent): void => {
      if (!libreAhora.current) {
        el.removeAttribute('data-lenis-prevent')
        return
      }
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
