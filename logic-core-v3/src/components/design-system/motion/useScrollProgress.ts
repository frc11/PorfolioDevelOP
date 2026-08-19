'use client'

import { useScroll, type MotionValue, type UseScrollOptions } from 'motion/react'
import type { RefObject } from 'react'

export interface UseScrollProgressOptions {
  /**
   * Ventana de disparo, en el formato `offset` de `useScroll` de
   * `motion/react` (p. ej. `['start end', 'end start']`). Default: el
   * elemento completo atravesando el viewport — progreso `0` cuando su
   * borde superior toca el borde inferior del viewport (recién entra desde
   * abajo), progreso `1` cuando su borde inferior toca el borde superior
   * del viewport (recién termina de salir por arriba).
   */
  offset?: UseScrollOptions['offset']
}

/**
 * Progreso normalizado (0→1) de `target` respecto del viewport — la base
 * para atar transformaciones al GESTO de scroll en vez de al tiempo (S2-motion,
 * Bloque 3, primitiva 2). La consume directamente la expansión de ancho del
 * hero y cualquier objeto (2D o 3D) que reaccione al progreso; `Parallax`
 * (en este mismo módulo) también se apoya en ella.
 *
 * Devuelve el `MotionValue<number>` crudo, no un `number` leído por
 * `useState`: pasarlo a `useTransform`, o escribirlo directo al DOM / a un
 * objeto de Three.js con `.on('change', ...)`, no dispara re-render de React
 * en cada frame de scroll — la regla dura del sprint. Si algún consumidor
 * necesita el valor como número plano dentro de JSX, esa conversión (y su
 * costo de re-render) es una decisión suya, no de este hook.
 *
 * El listener de scroll es el interno de `motion/react` (pasivo) — este
 * hook no agrega uno propio.
 *
 * `prefers-reduced-motion` NO se resuelve acá: este hook devuelve una
 * medición, no un efecto visible por sí solo. El consumidor que convierte el
 * progreso en un desplazamiento visible (como `Parallax`) es quien tiene la
 * responsabilidad de respetarlo — igual que un sensor no necesita un modo
 * "movimiento reducido", el actuador que lo consume sí.
 *
 * @param target Ref del elemento cuyo progreso se mide. Puede empezar en
 * `null` (todavía no montado) — `useScroll` lo tolera.
 * @param options Ver `UseScrollProgressOptions`.
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null>,
  options?: UseScrollProgressOptions,
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target,
    offset: options?.offset ?? ['start end', 'end start'],
  })

  // motion 12.42 marca este valor como "acelerable" cuando el offset mapea a
  // un rango nombrado de ViewTimeline (el default de arriba mapea a "cover").
  // Con eso puesto, cualquier consumidor que lo derive con `useTransform` y lo
  // alimente a `style` en las keys `opacity`/`clipPath`/`filter`/`transform`
  // es promovido en silencio a una animación WAAPI nativa con ViewTimeline —
  // que trackea al sujeto contra su SCROLL CONTAINER ancestro más cercano, no
  // contra la ventana: un `overflow: hidden`/`auto` en cualquier ancestro la
  // congela sin error, solo en navegadores con ViewTimeline. Además bifurca
  // la física (compositor vs JS) entre consumidores del mismo MotionValue.
  // Se neutraliza acá para que TODOS los consumidores corran por el mismo
  // camino JS determinista (S3-hero, Bloque 0 — diagnóstico con evidencia).
  // Tiene que ser una mutación EN RENDER, no en un efecto: `useScroll`
  // re-asigna `accelerate` en cada render, y `useTransform` hereda el config
  // en el momento en que se llama (también en render) — un efecto llegaría
  // después del primer binding del consumidor, con la animación nativa ya
  // creada. Es simétrico a cómo el propio upstream lo asigna.
  // eslint-disable-next-line react-hooks/immutability
  scrollYProgress.accelerate = undefined

  return scrollYProgress
}
