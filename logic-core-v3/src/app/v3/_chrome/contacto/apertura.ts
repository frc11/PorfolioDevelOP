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
  /**
   * [PULIDO 1] P17-B · d · el punto del clic (px de la ventana) cuando la placa sale de ahí: sólo desde el CTA del portal
   * (`data-cta-desde-el-punto`, la prueba `?cta=d`). Sin él (todos los demás), la placa nace en el centro, como siempre.
   */
  readonly punto: { readonly x: number; readonly y: number } | null
}

let estado: EstadoDelContacto = { abierto: false, precarga: [], modo: 'barra', origen: null, punto: null }
const oyentes = new Set<() => void>()
const avisar = (): void => oyentes.forEach((f) => f())

/**
 * [EL ENCASTRE] · CON EL MENÚ DEL TELÉFONO ABIERTO, PRIMERO SE CIERRA EL MENÚ. Su trampa de foco retenía el foco y la hoja
 * quedaba detrás sin poder recibirlo (pasaba con un disparador de la página; su propio «Contacto» ya esperaba). Mientras
 * está abierto, el menú se anota acá: un pedido del contacto lo cierra y se cumple cuando el menú soltó su trampa.
 */
let menuAbierto: ((despues: () => void) => void) | null = null

/** El menú del teléfono anota cómo cerrarse mientras está abierto (`null` al cerrarse). */
export function anotarElMenuAbierto(cerrarYDespues: ((despues: () => void) => void) | null): void {
  menuAbierto = cerrarYDespues
}

/** [PULIDO 1] P17-B · d · el punto del próximo pedido: lo anota la delegación justo antes de abrir y se consume al abrir. */
let puntoDelPedido: EstadoDelContacto['punto'] = null

export function abrirContacto(precarga: readonly Interes[] = [], origen: HTMLElement | null = null): void {
  if (menuAbierto !== null) {
    const cerrarElMenu = menuAbierto
    menuAbierto = null
    cerrarElMenu(() => abrirContacto(precarga, origen))
    return
  }
  estado = { ...estado, abierto: true, precarga, origen, punto: puntoDelPedido }
  puntoDelPedido = null
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

/**
 * El selector de lo que abre el contacto. [RETOQUE 3D] 3I: los `a[href="#contacto"]` son enlaces de verdad al formulario
 * del pie (el viaje los lleva); quedan los disparadores que no son enlaces (los CTA de Servicios), que viajan ahí también.
 * [CIERRE RETOQUE 3D] N1: con `data-abre-contacto="panel"` (el Contacto de la esquina de la barra) abre el panel de
 * contacto de SPRINT CONTACTO, la hoja que baja; el del menú del teléfono es un botón que lo abre al cerrarse el menú.
 */
export const SELECTOR_DE_APERTURA = '[data-abre-contacto]'
export const ABRE_EL_PANEL = 'panel'

/**
 * [RETOQUE 3D] 3I · TODO APUNTA A CONTACTO: al formulario del pie. Si hay un enlace del viaje a `#contacto` (la barra o
 * el menú del teléfono) se lo aprieta: el viaje hace el resto, con su velo y su foco al llegar. Sin viaje (movimiento
 * reducido), un salto y el foco.
 */
export function viajarAlContacto(selectorDeLosViajes: string): void {
  const enlace = document.querySelector<HTMLAnchorElement>(`:is(${selectorDeLosViajes})[href="#contacto"]`)
  if (enlace !== null) {
    enlace.click()
    return
  }
  const formulario = document.getElementById('contacto')
  formulario?.scrollIntoView()
  formulario?.focus({ preventScroll: true })
}

/** [PULIDO 1] P17-B · d · el punto del clic; con el teclado (sin puntero: `detail` 0), el centro del disparador. */
export function puntoDelClic(e: MouseEvent, disparador: Element): { readonly x: number; readonly y: number } {
  if (e.detail > 0) return { x: e.clientX, y: e.clientY }
  const r = disparador.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/** La precarga que pide el disparador: `data-precarga` es el id de un servicio. */
export function precargaDe(disparador: Element): readonly Interes[] {
  const servicio = disparador.getAttribute('data-precarga')
  return servicio === null ? [] : (PRECARGA_POR_SERVICIO[servicio] ?? [])
}

/**
 * Intercepta los clics de apertura en todo el documento. Se monta una vez, en el chrome. [RETOQUE 3D] 3I: viajan al pie.
 * [CIERRE RETOQUE 3D] N1: los del panel lo abren. En la captura: antes que el viaje, que deja pasar lo ya atendido.
 */
export function useAperturaDelContacto(selectorDeLosViajes: string): void {
  useEffect(() => {
    const alTocar = (e: MouseEvent): void => {
      const objetivo = e.target instanceof Element ? e.target.closest(SELECTOR_DE_APERTURA) : null
      if (objetivo === null) return
      e.preventDefault()
      // [PULIDO 1] P17-B · d · desde el CTA del portal, la placa sale del punto del clic (se consume al abrir el panel).
      puntoDelPedido = objetivo.getAttribute('data-abre-contacto') === ABRE_EL_PANEL && objetivo.closest('[data-cta-desde-el-punto]') !== null ? puntoDelClic(e, objetivo) : null
      if (objetivo.getAttribute('data-abre-contacto') === ABRE_EL_PANEL) abrirContacto(precargaDe(objetivo), objetivo instanceof HTMLElement ? objetivo : null)
      else viajarAlContacto(selectorDeLosViajes)
    }
    document.addEventListener('click', alTocar, { capture: true })
    return () => document.removeEventListener('click', alTocar, { capture: true })
  }, [selectorDeLosViajes])
}
