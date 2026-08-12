'use client'

import { useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

/** Lo que dura cada escena en pantalla antes de pasar a la siguiente. */
const INTERVALO_MS = 5200

interface EscenaCycle {
  /** Se cuelga de la lámina para observar si está en viewport. */
  ref: React.RefObject<HTMLDivElement | null>
  indice: number
  /** Selección manual. Corta el avance automático para siempre. */
  seleccionar: (indice: number) => void
}

/**
 * El reloj de la secuencia. Es la única pieza con motion vivo del sitio (D10) y
 * por eso el contrato es explícito:
 *
 * 1. **Fuera del viewport el loop se cancela, no se esconde.** El `setInterval`
 *    ni siquiera se crea si la sección no está intersectando: el efecto
 *    depende de `activo`, así que React corre su cleanup —`clearInterval`— al
 *    salir de pantalla. No queda ningún temporizador vivo ni ningún callback
 *    programado. Tampoco hay `requestAnimationFrame` en toda la sección: el
 *    cambio de escena es un cross-fade CSS que solo dispara cuando el índice
 *    cambia, y el índice solo cambia con la sección en pantalla.
 *
 * 2. **Con `prefers-reduced-motion` no hay ciclo.** No es un ciclo más lento ni
 *    una transición de 1ms: el intervalo no se crea. Lo que se VE en ese modo
 *    —las tres escenas a la vez, en su estado final— no lo decide este hook
 *    sino CSS, con la variante `motion-reduce:` en la sección. Es a propósito:
 *    ramificar el marcado con este booleano daba error de hidratación #418,
 *    porque en el servidor devuelve `false` y en el cliente `true`.
 *
 * 3. **La selección manual gana.** Quien toca un paso del riel deja de recibir
 *    avances automáticos: nada le mueve la escena abajo de la vista mientras
 *    lee. Es un camino de salida del loop, no solo una comodidad.
 */
export function useEscenaCycle(total: number): EscenaCycle {
  const ref = useRef<HTMLDivElement | null>(null)
  const [indice, setIndice] = useState(0)
  const [enViewport, setEnViewport] = useState(false)
  const [tomoControl, setTomoControl] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    const observer = new IntersectionObserver(
      (entradas) => {
        // `entradas[0]` puede faltar con `noUncheckedIndexedAccess`; el guard
        // evita el acceso ciego en vez de afirmarlo con `!`.
        const entrada = entradas[0]
        if (entrada) setEnViewport(entrada.isIntersecting)
      },
      // Un cuarto de la lámina alcanza para considerarla "mirada", y el margen
      // negativo evita que arranque cuando apenas asoma por el borde.
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(elemento)
    return () => observer.disconnect()
  }, [])

  const activo = enViewport && !tomoControl && !reducedMotion

  useEffect(() => {
    if (!activo) return

    const id = setInterval(() => {
      setIndice((actual) => (actual + 1) % total)
    }, INTERVALO_MS)

    return () => clearInterval(id)
  }, [activo, total])

  const seleccionar = useCallback((siguiente: number) => {
    setTomoControl(true)
    setIndice(siguiente)
  }, [])

  return { ref, indice, seleccionar }
}
