'use client'

import { useEffect, type RefObject } from 'react'

import { suscribirALaMirada, type MiradaDeLaCamara } from '../../_lib/escena/miradaDeLaCamara'
import { AL_CENTRO, ladoEn, poseDeLaPieza, type Lado } from './piezaSolida'

/**
 * [RONDA 2] F5 · LA POSE DE UNA PIEZA DEL PIE — escribe en `pose` la base que le toca por su lugar en el pie (las de la
 * izquierda muestran su costado derecho, las de abajo su canto de arriba) y el paralaje del mouse exagerado
 * (`piezaSolida.ts`). El lugar se mide contra el `<footer>` (no contra el cuadro: el pie puede no estar a la vista), al
 * montarse, al cambiar el ancho y al terminar cada scroll (la llegada del pie corre las piezas). Sin estado de React.
 */
export function usePoseDeLaPieza(raiz: RefObject<HTMLElement | null>, pose: RefObject<HTMLElement | null>, activo: boolean): void {
  useEffect(() => {
    const el = raiz.current
    const p = pose.current
    if (!activo || el === null || p === null) return undefined
    let lado: Lado = AL_CENTRO
    let mirada: MiradaDeLaCamara = { giro: 0, inclinacion: 0 }
    const escribir = (): void => {
      p.style.transform = poseDeLaPieza(lado, mirada)
    }
    const medir = (): void => {
      const marco = el.closest('[data-pieza="pie"]')
      lado = ladoEn(el.getBoundingClientRect(), marco === null ? new DOMRect(0, 0, window.innerWidth, window.innerHeight) : marco.getBoundingClientRect())
      escribir()
    }
    medir()
    window.addEventListener('resize', medir)
    window.addEventListener('scrollend', medir)
    const desuscribir = suscribirALaMirada((m) => {
      mirada = m
      escribir()
    })
    return () => {
      desuscribir()
      window.removeEventListener('resize', medir)
      window.removeEventListener('scrollend', medir)
      // Si deja de valer (el ancho cruzó el umbral), la pieza vuelve a quedar de frente.
      p.style.transform = ''
    }
  }, [raiz, pose, activo])
}
