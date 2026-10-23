'use client'

import { animate, useMotionValue, type AnimationPlaybackControls, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'

import { ASOMA, anchoDeLaTarjeta, destinoEnLaVuelta, posicionDelArrastre, type FormaDeLaTarjeta } from './asoma'

/** Lo que el carrusel le pide al modo `asoma`: dónde están las tarjetas y cómo las mueve el dedo. */
export interface DesliceQueAsoma {
  /** La tarjeta que se ve, continua (`asoma.ts`): la colocan las ranuras. */
  readonly posicion: MotionValue<number>
  /** El ancho de la tarjeta (px; 0 sin medir). */
  readonly ancho: MotionValue<number>
  /** Al apoyar el dedo: frena el asiento y toma de base la posición de ahora. */
  readonly empezar: () => void
  /** El dedo de costado, `dx` px desde donde se apoyó: las tarjetas lo siguen. */
  readonly arrastrar: (dx: number) => void
  /** Asienta la tarjeta de ahora (un arrastre que no la cambió, o un dedo cancelado). */
  readonly colocar: () => void
}

/**
 * [C2-41t] EL MODO `asoma` DEL CARRUSEL, EN EL CLIENTE — la posición de las tarjetas (un valor de Motion: sin renders por cuadro), el ancho
 * medido de la tarjeta y el dedo. Cada cambio de tarjeta (el reloj, las flechas, el deslice, un salto) asienta la posición en la nueva con
 * el resorte de la UI, desde donde esté (también a mitad de un arrastre); con movimiento reducido, de una. Sin `forma` no hace nada.
 */
export function useAsoma(forma: FormaDeLaTarjeta | null, vista: RefObject<HTMLElement | null>, indice: number, cantidad: number, reducido: boolean): DesliceQueAsoma {
  const posicion = useMotionValue(indice)
  const ancho = useMotionValue(0)
  const base = useRef(indice)
  const asiento = useRef<AnimationPlaybackControls | null>(null)
  const activo = forma !== null
  const ahora = useRef({ activo, indice, cantidad, reducido })
  useEffect(() => {
    ahora.current = { activo, indice, cantidad, reducido }
  }, [activo, indice, cantidad, reducido])

  const colocar = useCallback((): void => {
    const { activo: si, indice: i, cantidad: n, reducido: quieto } = ahora.current
    if (!si) return
    asiento.current?.stop()
    const destino = destinoEnLaVuelta(posicion.get(), i, n)
    if (quieto) posicion.set(destino)
    else asiento.current = animate(posicion, destino, ASOMA.resorte)
  }, [posicion])

  useEffect(() => {
    if (activo) colocar()
  }, [activo, indice, colocar])
  useEffect(() => () => asiento.current?.stop(), [])

  // El ancho de la tarjeta sale de la caja de la vista (su contenido: sin el margen a sangre) y se vuelve a medir con ella.
  const proporcion = forma?.proporcion ?? 0
  const fraccion = forma?.fraccion ?? 0
  useEffect(() => {
    const el = vista.current
    if (!activo || el === null) return undefined
    const observador = new ResizeObserver(([e]) => {
      if (e !== undefined) ancho.set(anchoDeLaTarjeta(e.contentRect.width, e.contentRect.height, { proporcion, fraccion }))
    })
    observador.observe(el)
    return () => observador.disconnect()
  }, [activo, vista, ancho, proporcion, fraccion])

  const empezar = useCallback((): void => {
    if (!ahora.current.activo) return
    asiento.current?.stop()
    base.current = posicion.get()
  }, [posicion])
  const arrastrar = useCallback(
    (dx: number): void => {
      if (!ahora.current.activo) return
      const w = ancho.get()
      posicion.set(posicionDelArrastre(base.current, dx, w > 0 ? w + ASOMA.separacionPx : 0))
    },
    [posicion, ancho],
  )
  return useMemo(() => ({ posicion, ancho, empezar, arrastrar, colocar }), [posicion, ancho, empezar, arrastrar, colocar])
}
