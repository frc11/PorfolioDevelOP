'use client'

import { useEffect, useRef, type RefObject } from 'react'

import { avanceClavado, avanceDelCruce } from './avance'

export type LecturaDelAvance =
  | { readonly modo: 'clavado' }
  | { readonly modo: 'cruce'; readonly desde?: number; readonly hasta?: number }

/**
 * [M3] EL AVANCE DE UN MOMENTO, EN VIVO — lee el scroll una vez por cuadro (rAF) y se lo pasa a `alAvanzar`, que escribe estilos
 * directo en el DOM (ningún estado de React por cuadro). Escucha el `scroll` sólo con el elemento cerca de la pantalla
 * (`IntersectionObserver`, media pantalla de margen): lejos, nada corre. `activo` en falso (movimiento reducido) no escucha nada;
 * el momento se pinta entero por su cuenta. `alAvanzar` se lee de una ref: cambiarlo no reinstala los escuchas.
 */
export function useAvanceDelRecorrido(
  ref: RefObject<HTMLElement | null>,
  alAvanzar: (avance: number) => void,
  lectura: LecturaDelAvance,
  activo: boolean,
): void {
  const pintar = useRef(alAvanzar)
  useEffect(() => {
    pintar.current = alAvanzar
  }, [alAvanzar])
  const desde = lectura.modo === 'cruce' ? lectura.desde : undefined
  const hasta = lectura.modo === 'cruce' ? lectura.hasta : undefined
  const modo = lectura.modo

  useEffect(() => {
    const el = ref.current
    if (el === null || !activo) return undefined
    let pedido = 0
    const medir = (): void => {
      pedido = 0
      const caja = el.getBoundingClientRect()
      const alto = window.innerHeight
      pintar.current(modo === 'clavado' ? avanceClavado(caja.top, caja.height, alto) : avanceDelCruce(caja.top, alto, desde, hasta))
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(medir)
    }
    const cerca = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting === true) window.addEventListener('scroll', pedir, { passive: true })
        else window.removeEventListener('scroll', pedir)
        pedir()
      },
      { rootMargin: '50% 0px' },
    )
    cerca.observe(el)
    window.addEventListener('resize', pedir)
    medir()
    return () => {
      cerca.disconnect()
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
    }
  }, [ref, activo, modo, desde, hasta])
}
