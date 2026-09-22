'use client'

import { animate, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import { useEffect } from 'react'

import { CURVA_DEL_DISPARO, DURACION_DEL_DISPARO } from './geometria'

/**
 * EL DISPARO — cruzar una frontera lanza una rotación que corre SOLA.
 *
 * ── Por qué salió de `RodilloDeEstados` ───────────────────────────────────
 *
 * Vivía adentro del rodillo, y estaba bien mientras el rodillo era el único que
 * rotaba. Ahora la torta gira con el mismo cambio de estado y el CTA cambia su
 * etiqueta con el mismo cambio de estado, y la instrucción es explícita: **la
 * rotación de la torta usa el mismo disparo del rodillo, no un timing propio.**
 *
 * Tres consumidores leyendo tres relojes se desincronizan en cuanto alguien
 * toque una duración; leyendo el MISMO `MotionValue`, no pueden. Así que el
 * disparo se extrae acá y el panel se lo reparte a los tres.
 *
 * ── ⚠️ Lo que este archivo tiene que seguir garantizando ──────────────────
 *
 * Que el estado sea un `MotionValue` y **nunca** estado de React. Un `useState`
 * acá arriba re-renderizaría la columna derecha en cada rotación, y con eso
 * volvería la clase de falla que la tira vino a cerrar: contenido que cambia de
 * posición sin haber viajado. `s6-servicios` §14 lo afirma leyendo el fuente.
 *
 * ── No encola: va al más nuevo desde donde esté ───────────────────────────
 *
 * `animate()` sobre el MISMO valor interrumpe lo que estuviera corriendo y
 * arranca del valor ACTUAL. Cruzar dos fronteras de un saque no reproduce dos
 * rotaciones: va al estado más nuevo desde donde quedó. Y hacia arriba es la
 * misma animación con el objetivo más bajo.
 */

/** En qué estado toca estar, según cuántas fronteras quedaron atrás. */
export function estadoSegun(progreso: number, fronteras: readonly number[]): number {
  let n = 0
  for (const frontera of fronteras) {
    if (progreso > frontera) n += 1
  }
  return n
}

/**
 * El estado, disparado. Devuelve un `MotionValue` continuo que se POSA en los
 * enteros: entre uno y otro corre la animación, no el scroll.
 */
export function useEstadoDisparado(
  progreso: MotionValue<number>,
  fronteras: readonly number[],
): MotionValue<number> {
  const objetivo = useTransform(progreso, (p) => estadoSegun(p, fronteras))
  const posicion = useMotionValue(0)

  useMotionValueEvent(objetivo, 'change', (destino) => {
    animate(posicion, destino, { duration: DURACION_DEL_DISPARO, ease: [...CURVA_DEL_DISPARO] })
  })

  // Al montar, se posa donde el scroll ya esté: entrar por un ancla o recargar a
  // mitad del pin no puede dejar a los tres consumidores en el estado 0.
  useEffect(() => {
    posicion.set(objetivo.get())
  }, [posicion, objetivo])

  return posicion
}
