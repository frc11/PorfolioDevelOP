'use client'

import { animate, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect } from 'react'

import { CURVAS } from '../_lib/motion/curvas'
import { REPETICIONES } from '../_lib/titulos3d/repeticiones'

/**
 * [NAVBAR] RETOQUE 3 · LA LLEGADA DEL TÍTULO, AISLADA — el viaje del menú a Portfolio o a Por qué develOP lleva directo
 * al nudo (el título ya en su lugar de lectura) con la duración de todos los viajes, y RECIÉN AHÍ el título hace su
 * animación de llegada: sólo el texto, sin mover la cámara ni la página.
 *
 * La llegada de esos títulos es la de siempre (`CanalDeUnaPieza` con su progreso: la máscara de «Portfolio», la frase de
 * Por qué develOP), que con el scroll corre por el scroll. Acá el título recibe OTRO progreso: el del scroll, salvo
 * mientras se repite la llegada, que corre por tiempo de 0 a 1. El viaje la pide al terminar (`repetirLaLlegadaDelTitulo`,
 * en `useDeslizamientoDelCta`) con el velo todavía puesto: el título vuelve a 0 sin que se vea, la página reaparece, y
 * después del fundido el título llega. En el nudo el progreso del scroll ya vale 1, así que al terminar no salta. Con el
 * scroll de por medio gana el menor de los dos (una rueda a mitad de la llegada no adelanta el título).
 *
 * Sin coreografía (movimiento reducido, la rama quieta) no hay progreso y no hay repetición: el título vuelve con el
 * fundido de todo lo demás.
 *
 * [RONDA 2] F2 · se puede interrumpir y siempre converge: un pedido nuevo la reinicia, el desmontaje la corta y vuelve al
 * scroll (nunca queda un progreso a medias), y mientras corre la escena no asienta (`REPETICIONES`).
 */
export const MS_DE_LA_LLEGADA_DEL_TITULO = 900

const oyentes = new Map<string, Set<(demoraMs: number) => void>>()

/** Pide la llegada del título de la sección `id`, después de `demoraMs`. Devuelve si alguien la va a hacer. */
export function repetirLaLlegadaDelTitulo(id: string, demoraMs: number): boolean {
  const de = oyentes.get(id)
  if (de === undefined || de.size === 0) return false
  de.forEach((f) => f(demoraMs))
  return true
}

/** El progreso del título: el del scroll, o el de la llegada repetida mientras corre. */
export function useLlegadaDelTitulo(id: string, progreso: MotionValue<number>): MotionValue<number> {
  const repeticion = useMotionValue(-1)
  const combinado = useTransform([progreso, repeticion], ([p, r]: number[]) => (r < 0 ? p : Math.min(p, r)))
  useEffect(() => {
    let control: ReturnType<typeof animate> | null = null
    let reloj: number | undefined
    let activa = false
    const empezar = (): void => {
      if (!activa) REPETICIONES.activas += 1
      activa = true
    }
    const terminar = (): void => {
      if (activa) REPETICIONES.activas = Math.max(0, REPETICIONES.activas - 1)
      activa = false
    }
    const alPedido = (demoraMs: number): void => {
      control?.stop()
      window.clearTimeout(reloj)
      repeticion.set(0)
      empezar()
      reloj = window.setTimeout(() => {
        control = animate(repeticion, 1, { duration: MS_DE_LA_LLEGADA_DEL_TITULO / 1000, ease: CURVAS.principal })
        void control.then(() => {
          repeticion.set(-1)
          terminar()
        })
      }, demoraMs)
    }
    const de = oyentes.get(id) ?? new Set()
    de.add(alPedido)
    oyentes.set(id, de)
    return () => {
      de.delete(alPedido)
      control?.stop()
      window.clearTimeout(reloj)
      // Cortada a mitad: vuelve al scroll (nunca un progreso a medias).
      repeticion.set(-1)
      terminar()
    }
  }, [id, repeticion])
  return combinado
}
