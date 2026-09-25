'use client'

/**
 * QUIÉN ABRE EL CONTACTO — un estado chico del chrome y la delegación de clics. **[CONTACTO]**
 *
 * Ningún componente de las secciones importa esto: cualquier `a[href="#contacto"]` o
 * cualquier `[data-abre-contacto]` (con su `data-precarga`, que es el id de un servicio) abre
 * el formulario. Así los CTA compartidos no cambian: siguen siendo un enlace o un botón.
 */

import { useEffect, useSyncExternalStore } from 'react'

import { PRECARGA_POR_SERVICIO, type Interes } from './contenido'

/** Desde dónde entra la hoja: arriba con la barra de escritorio, abajo con el menú móvil. */
export type ModoDelChrome = 'barra' | 'menu'

export interface EstadoDelContacto {
  readonly abierto: boolean
  readonly precarga: readonly Interes[]
  readonly modo: ModoDelChrome
  /** Para devolverle el foco al cerrar. */
  readonly origen: HTMLElement | null
}

let estado: EstadoDelContacto = { abierto: false, precarga: [], modo: 'barra', origen: null }
const oyentes = new Set<() => void>()
const avisar = (): void => oyentes.forEach((f) => f())

export function abrirContacto(precarga: readonly Interes[] = [], origen: HTMLElement | null = null): void {
  estado = { ...estado, abierto: true, precarga, origen }
  avisar()
}

/** Cierra. El foco vuelve a quien lo abrió cuando termina la salida (`devolverElFoco`): antes, la trampa del diálogo lo retendría. */
export function cerrarContacto(): void {
  estado = { ...estado, abierto: false }
  avisar()
}

/** Le devuelve el foco al disparador. Lo llama el formulario al terminar su animación de salida. */
export function devolverElFoco(): void {
  // Un cuadro después: la salida termina ANTES de desmontar la hoja, y su trampa de foco retendría el foco adentro.
  const { origen } = estado
  requestAnimationFrame(() => origen?.focus({ preventScroll: true }))
}

export function fijarModoDelChrome(modo: ModoDelChrome): void {
  if (estado.modo === modo) return
  estado = { ...estado, modo }
  avisar()
}

function suscribir(f: () => void): () => void {
  oyentes.add(f)
  return () => oyentes.delete(f)
}
const leer = (): EstadoDelContacto => estado

export function useContacto(): EstadoDelContacto {
  return useSyncExternalStore(suscribir, leer, leer)
}

/** El selector de lo que abre el contacto. */
export const SELECTOR_DE_APERTURA = 'a[href="#contacto"], [data-abre-contacto]'

/** La precarga que pide el disparador: `data-precarga` es el id de un servicio. */
export function precargaDe(disparador: Element): readonly Interes[] {
  const servicio = disparador.getAttribute('data-precarga')
  return servicio === null ? [] : (PRECARGA_POR_SERVICIO[servicio] ?? [])
}

/** Intercepta los clics de apertura en todo el documento. Se monta una vez, en el chrome. */
export function useAperturaDelContacto(): void {
  useEffect(() => {
    const alTocar = (e: MouseEvent): void => {
      const objetivo = e.target instanceof Element ? e.target.closest(SELECTOR_DE_APERTURA) : null
      if (objetivo === null) return
      e.preventDefault()
      const foco = objetivo instanceof HTMLElement && objetivo.matches('a, button') ? objetivo : objetivo.querySelector<HTMLElement>('a, button')
      abrirContacto(precargaDe(objetivo), foco)
    }
    document.addEventListener('click', alTocar)
    return () => document.removeEventListener('click', alTocar)
  }, [])
}
