'use client'

import { useRef } from 'react'
import type Lenis from 'lenis'

import type { ModoDelViaje } from './deslizamiento'
import { useDeslizamientoDelCta } from './useDeslizamientoDelCta'

/**
 * EL DESLIZAMIENTO SOLO, SIN MOTOR DE SCROLL DETRÁS.
 *
 * Nueve líneas y ninguna decisión: la compuerta la tomó
 * `CompuertaDelDeslizamiento` y el gesto entero vive en el hook. Esto existe
 * para darle al hook el mismo argumento que le da `ScrollSuaveDeV3` —una `ref`—
 * pero **vacía**, que es la forma en que el hook pregunta «¿hay Lenis?» sin que
 * nadie tenga que decírselo con un booleano nuevo.
 *
 * ⚠️ **La `ref` se queda en `null` para siempre, y eso NO es un cabo suelto:** es
 * el dato. `useDeslizamientoDelCta` lee `instancia.current` EN EL CLICK, nunca en
 * el montaje, y con `null` toma la rama de `viajeSinLenis`. Arriba del umbral la
 * misma `ref` llega llena y toma la de Lenis. Un solo camino de código, dos
 * motores, y la pregunta se contesta en el único momento en que la respuesta
 * importa.
 *
 * No renderiza nada: como el otro módulo perezoso de esta familia, todo lo que
 * hace vive en un efecto, así que montarlo o desmontarlo no puede mover una caja.
 */
export default function DeslizamientoSinScrollSuave({ modo = 'viaje' }: { readonly modo?: ModoDelViaje }): null {
  const instancia = useRef<Lenis | null>(null)
  useDeslizamientoDelCta(instancia, modo)
  return null
}
