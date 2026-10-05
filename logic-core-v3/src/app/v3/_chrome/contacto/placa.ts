'use client'

import { useMotionValue, type MotionValue } from 'motion/react'
import { useEffect, useSyncExternalStore } from 'react'

import { entornoDeLaEscena, type Pruebas } from '../../_lib/escena/entorno'
import { FOCO_DE_LA_ESCENA_PX } from '../../_secciones/trabajos/tunel'

/**
 * [AJUSTES FINALES] B2 · EL CONTACTO COMO TRANSICIÓN — dos pruebas, apagadas en el producto, sólo en escritorio (la hoja
 * de la barra) y con movimiento: `?pruebas=contactofondo=blur` y `?pruebas=contactofondo=blanco`.
 *
 *   1. El FONDO cambia primero, progresivo y rápido (`MS_DEL_FONDO`): con `blur`, el sitio se desenfoca hasta
 *      `DESENFOQUE_DEL_FONDO_PX` mientras se oscurece (el velo de siempre, pero animando el desenfoque desde cero); con
 *      `blanco`, se funde al papel.
 *   2. Después LLEGA el formulario como una PLACA sólida desde el fondo, con el efecto del túnel: `translateZ` desde
 *      `PROFUNDIDAD_DE_LA_PLACA_PX` (dos focos: nace a un tercio de su tamaño) con la perspectiva en el foco de la cámara
 *      de la sala (`FOCO_DE_LA_ESCENA_PX`, el mismo con que huye el cartel de Portfolio), y con el paralaje de cámara: gira
 *      apenas hacia el puntero (`GIRO_DEL_PARALAJE_GRADOS`). Es la hoja de siempre —los campos del DOM, la trampa de foco,
 *      Esc y la cruz que cierran con la animación inversa (la salida de `AnimatePresence`), el envío—: lo que cambia es
 *      cómo entra y cómo se ve (un canto de tinta debajo: una placa, no una hoja). Abajo de 1024 y con movimiento reducido,
 *      el panel deslizante de hoy.
 *
 * Lo que NO es: la placa de WebGL del pie (`escena/pie3d`). Ésa vive en el lienzo de la escena, detrás de la página; el
 * contacto va encima de todo y una segunda escena para una placa no entró en este sprint. Queda anotado en el LEEME.
 */
export const MS_DEL_FONDO = 500
export const MS_DE_LA_PLACA = 900
export const PERSPECTIVA_DE_LA_PLACA = FOCO_DE_LA_ESCENA_PX
export const PROFUNDIDAD_DE_LA_PLACA_PX = 2 * FOCO_DE_LA_ESCENA_PX
/** La llegada: rápida al salir del fondo, frenando al asentarse (como `expo.out`). */
export const CURVA_DE_LA_PLACA = [0.16, 1, 0.3, 1] as const
export const DESENFOQUE_DEL_FONDO_PX = 24
export const GIRO_DEL_PARALAJE_GRADOS = 3

const sinCambios = (): (() => void) => () => undefined

/** La prueba de esta carga: apagada en el servidor y al hidratar; la pedida, después. */
export function useFondoDeLaPrueba(): Pruebas['contactofondo'] {
  return useSyncExternalStore(sinCambios, () => entornoDeLaEscena().pruebas.contactofondo, () => 'no')
}

/** El paralaje de cámara: la placa gira apenas hacia el puntero (±`GIRO_DEL_PARALAJE_GRADOS`), y vuelve al centro al irse. */
export function useParalaje(activo: boolean): { readonly rotateX: MotionValue<number>; readonly rotateY: MotionValue<number> } {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  useEffect(() => {
    if (!activo) return undefined
    const mover = (e: PointerEvent): void => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      rotateY.set(x * 2 * GIRO_DEL_PARALAJE_GRADOS)
      rotateX.set(-y * 2 * GIRO_DEL_PARALAJE_GRADOS)
    }
    window.addEventListener('pointermove', mover, { passive: true })
    return () => {
      window.removeEventListener('pointermove', mover)
      rotateX.set(0)
      rotateY.set(0)
    }
  }, [activo, rotateX, rotateY])
  return { rotateX, rotateY }
}
