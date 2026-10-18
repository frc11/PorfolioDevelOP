'use client'

import { useLayoutEffect, useRef, type RefObject } from 'react'

import { CORRIMIENTO, izquierdaCorrida, tiemposDelCorrimiento, useCorrimientoPedido, type Bordes } from './corrimiento'

/** Las propiedades que el corrimiento escribe en línea (en reposo la píldora vuelve a las de `barra.css`: centrada). */
const EN_LINEA = ['left', 'width', 'transform'] as const

const bordesDe = (el: HTMLElement, origen: number): Bordes => {
  const b = el.getBoundingClientRect()
  return { l: b.left - origen, r: b.right - origen }
}

/** La caja de la píldora en reposo (la de `barra.css`), sin lo que tenga en línea: se saca y se repone en el mismo cuadro. */
function enReposo(el: HTMLElement, origen: number): Bordes {
  const antes = EN_LINEA.map((p) => el.style.getPropertyValue(p))
  for (const p of EN_LINEA) el.style.removeProperty(p)
  const b = bordesDe(el, origen)
  EN_LINEA.forEach((p, i) => {
    if (antes[i] !== '') el.style.setProperty(p, antes[i])
  })
  return b
}

const cuadro = (b: Bordes): Keyframe => ({ left: `${String(b.l)}px`, width: `${String(b.r - b.l)}px` })

/**
 * [B1.2d] LA PÍLDORA SE CORRE (`corrimiento.ts`, §14, A1). Con un pedido del Portfolio (y desde 1024, en modo barra) la píldora va a
 * su lugar en la columna en dos tiempos; sin pedido vuelve, en el espejo. Cualquier cambio a mitad de camino sale de donde está
 * (la caja con la animación de ese momento). Un cambio de tamaño la pone en su lugar sin animar. Con movimiento reducido, de una.
 * Los ítems siguen siendo enlaces durante todo el movimiento.
 */
export function useCorrimientoDeLaPastilla(pastilla: RefObject<HTMLElement | null>): void {
  const pedido = useCorrimientoPedido()
  const animaciones = useRef<Animation[]>([])

  useLayoutEffect(() => {
    const el = pastilla.current
    const cabecera = el?.parentElement ?? null
    if (el === null || cabecera === null) return undefined

    const ir = (animado: boolean): void => {
      const origen = cabecera.getBoundingClientRect().left
      const ahora = bordesDe(el, origen)
      for (const a of animaciones.current) a.cancel()
      animaciones.current = []
      const reposo = enReposo(el, origen)
      const sonido = document.querySelector('[data-pieza="control-del-sonido"], [data-pieza="sonido-de-la-esquina"]')?.getBoundingClientRect().right ?? 0
      const corre = pedido !== null && window.matchMedia(CORRIMIENTO.consulta).matches && cabecera.getAttribute('data-modo') !== 'menu'
      const ancho = reposo.r - reposo.l
      const l = corre ? izquierdaCorrida(pedido, ancho, sonido - origen) : reposo.l
      const hasta: Bordes = { l, r: l + ancho }
      const dejar = (b: Bordes): void => {
        if (!corre) {
          for (const p of EN_LINEA) el.style.removeProperty(p)
          return
        }
        el.style.setProperty('transform', 'none')
        el.style.setProperty('left', `${String(b.l)}px`)
        el.style.setProperty('width', `${String(b.r - b.l)}px`)
      }
      const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!animado || reducido || (Math.abs(ahora.l - hasta.l) < 0.5 && Math.abs(ahora.r - hasta.r) < 0.5)) {
        dejar(hasta)
        return
      }
      // Desde donde está, en línea (sin el centrado de la hoja), y los dos tiempos con la curva de la casa.
      el.style.setProperty('transform', 'none')
      el.style.setProperty('left', `${String(ahora.l)}px`)
      el.style.setProperty('width', `${String(ahora.r - ahora.l)}px`)
      const [medio, fin] = tiemposDelCorrimiento(ahora, hasta)
      const curva = getComputedStyle(document.documentElement).getPropertyValue('--ease-principal').trim() || 'ease'
      // El segundo sin relleno hacia atrás: durante su demora manda el primero (si no, la composición lo taparía con su cuadro inicial).
      const uno = el.animate([cuadro(ahora), cuadro(medio)], { duration: CORRIMIENTO.tiempoMs, easing: curva, fill: 'forwards' })
      const dos = el.animate([cuadro(medio), cuadro(fin)], { duration: CORRIMIENTO.tiempoMs, delay: CORRIMIENTO.tiempoMs, easing: curva, fill: 'forwards' })
      animaciones.current = [uno, dos]
      dos.onfinish = () => {
        if (animaciones.current[1] !== dos) return
        dejar(fin)
        uno.cancel()
        dos.cancel()
        animaciones.current = []
      }
    }

    ir(true)
    const alCambiarElTamano = (): void => ir(false)
    window.addEventListener('resize', alCambiarElTamano)
    return () => window.removeEventListener('resize', alCambiarElTamano)
  }, [pastilla, pedido])

  // Al desmontar, ninguna animación colgada.
  useLayoutEffect(
    () => () => {
      for (const a of animaciones.current) a.cancel()
      animaciones.current = []
    },
    [],
  )
}
