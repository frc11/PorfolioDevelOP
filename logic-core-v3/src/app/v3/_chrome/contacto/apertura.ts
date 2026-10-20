'use client'

/**
 * QUIÉN ABRE EL CONTACTO — un estado chico del chrome y la delegación de clics. **[CONTACTO]**
 *
 * Ningún componente de las secciones importa esto: cualquier `a[href="#contacto"]` o
 * cualquier `[data-abre-contacto]` (con su `data-precarga`, que es el id de un servicio) abre
 * el formulario. Así los CTA compartidos no cambian: siguen siendo un enlace o un botón.
 */

import { useEffect, useSyncExternalStore } from 'react'

import { SELECTOR_DE_FOCALIZABLES } from '../../_secciones/trabajos/demos/dialogo'

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

export function abrirContacto(precarga: readonly Interes[] = [], origen: HTMLElement | null = null): void {
  if (menuAbierto !== null) {
    const cerrarElMenu = menuAbierto
    menuAbierto = null
    cerrarElMenu(() => abrirContacto(precarga, origen))
    return
  }
  estado = { ...estado, abierto: true, precarga, origen }
  avisar()
}

/** Cierra. El foco vuelve a quien lo abrió cuando termina la salida (`devolverElFoco`): antes, la trampa del diálogo lo retendría. */
export function cerrarContacto(): void {
  estado = { ...estado, abierto: false }
  avisar()
}

/**
 * [P-H10] A quién vuelve el foco: al que abrió, si lo puede recibir; si es un envoltorio (los CTA de Servicios ponen el atributo en
 * un `div`), al primer control de adentro. Un origen que ya no está en el documento, a nadie.
 */
export function focoDelOrigen(origen: HTMLElement | null): HTMLElement | null {
  if (origen === null || origen.isConnected === false) return null
  if (typeof origen.matches !== 'function' || origen.matches(SELECTOR_DE_FOCALIZABLES)) return origen
  return origen.querySelector<HTMLElement>(SELECTOR_DE_FOCALIZABLES) ?? origen
}

/** [P-H10] El control real del clic: el que se tocó adentro del disparador (con el teclado, el que tenía el foco), o el disparador. */
export function origenDelClic(tocado: EventTarget | null, disparador: Element): HTMLElement | null {
  const control = tocado instanceof Element ? tocado.closest<HTMLElement>(SELECTOR_DE_FOCALIZABLES) : null
  if (control !== null && disparador.contains(control)) return control
  return disparador instanceof HTMLElement ? disparador : null
}

/** [P-H26] La hoja del contacto: mientras esté en el documento, su trampa de foco devuelve adentro cualquier foco que se escape. */
export const HOJA_DEL_CONTACTO = '[data-pieza="contacto"]'
/** [P-H26] Los cuadros que se espera, como mucho, a que la hoja se desmonte (llega 3 a 4 ms después de la salida: sobra). */
export const CUADROS_DE_ESPERA_DEL_FOCO = 30
/** [P-H26] La devolución de antes, un solo cuadro después de la salida: sólo para el control positivo de la sonda (`?devolucion=un-cuadro`). */
const conUnCuadro = (): boolean => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('devolucion') === 'un-cuadro'

/**
 * [P-H26] Si el que abrió ya no está o no recibe el foco: el primer disparador del contacto a la vista (el «Contacto» de la barra antes
 * que los CTA), y si no hay ninguno, nadie.
 */
export function destinoDeRespaldo(documento: Pick<Document, 'querySelectorAll'>): HTMLElement | null {
  const disparadores = [...documento.querySelectorAll<HTMLElement>(`[data-abre-contacto="${ABRE_EL_PANEL}"]`), ...documento.querySelectorAll<HTMLElement>(SELECTOR_DE_APERTURA)]
  for (const d of disparadores) {
    const control = focoDelOrigen(d)
    if (control !== null && control.getClientRects().length > 0) return control
  }
  return null
}

/**
 * Le devuelve el foco al disparador. Lo llama el formulario al terminar su animación de salida.
 *
 * [P-H26] Recién con la hoja DESMONTADA. `onExitComplete` corre antes del desmontaje: con un solo cuadro de espera, si el cuadro caía
 * en esos ~4 ms el foco iba al botón, la trampa del diálogo lo devolvía a la hoja y la hoja, al irse, lo dejaba en `body` (30 de 108
 * cierres, `docs/servicios/SPRINT-R1.md` §5.1). Ahora se espera cuadro a cuadro a que la hoja no esté; si el contacto se reabre
 * mientras, no se hace nada. Y si el foco no quedó en el que abrió (ya no está, o no lo recibe), va al respaldo.
 */
export function devolverElFoco(): void {
  if (conUnCuadro()) {
    const destino = focoDelOrigen(estado.origen)
    requestAnimationFrame(() => destino?.focus({ preventScroll: true }))
    return
  }
  let cuadros = 0
  const devolver = (): void => {
    if (estado.abierto) return
    if (typeof document !== 'undefined' && document.querySelector(HOJA_DEL_CONTACTO) !== null && cuadros < CUADROS_DE_ESPERA_DEL_FOCO) {
      cuadros += 1
      requestAnimationFrame(devolver)
      return
    }
    const destino = focoDelOrigen(estado.origen)
    destino?.focus({ preventScroll: true })
    if (typeof document === 'undefined' || (destino !== null && document.activeElement === destino)) return
    destinoDeRespaldo(document)?.focus({ preventScroll: true })
  }
  requestAnimationFrame(devolver)
}

/** [PULIDO 12] 1 · si la barra ya midió el modo (hasta entonces el de arranque, `barra`, no dice nada del ancho). */
let modoMedido = false

export function fijarModoDelChrome(modo: ModoDelChrome): void {
  const primero = !modoMedido
  modoMedido = true
  if (estado.modo === modo) {
    if (primero) avisar()
    return
  }
  estado = { ...estado, modo }
  avisar()
}

function suscribir(f: () => void): () => void {
  oyentes.add(f)
  return () => oyentes.delete(f)
}
const leer = (): EstadoDelContacto => estado
const conLaBarra = (): boolean => modoMedido && estado.modo === 'barra'

/** [PULIDO 12] 1 · la barra a la vista (no el menú del teléfono), ya medida. En el servidor, no: abajo de 1024 lo común es el menú. */
export function useLaBarraSeVe(): boolean {
  return useSyncExternalStore(suscribir, conLaBarra, () => false)
}

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
      if (objetivo.getAttribute('data-abre-contacto') === ABRE_EL_PANEL) abrirContacto(precargaDe(objetivo), origenDelClic(e.target, objetivo))
      else viajarAlContacto(selectorDeLosViajes)
    }
    document.addEventListener('click', alTocar, { capture: true })
    return () => document.removeEventListener('click', alTocar, { capture: true })
  }, [selectorDeLosViajes])
}
