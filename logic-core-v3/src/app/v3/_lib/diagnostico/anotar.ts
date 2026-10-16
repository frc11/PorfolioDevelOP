/**
 * [CIERRE A-ter] A13 · EL DIAGNÓSTICO DE LA CARGA, del lado del producto (`?diag=carga`) — lo que cada pieza anota para el arnés de
 * estrés (`scripts-carga/`): cuándo imprime un texto (en volumen o en textura) y con qué fuente, los bloques animados con su rango, el
 * Lenis, los armados de los títulos y del pie, el túnel. Sin la bandera cada anotación sale en su primera línea y no guarda nada; con ella,
 * `publicar.ts` (que se descarga sólo entonces) arma `window.__v3diag` con el estado, los eventos y las fallas (`fallas.ts`).
 */

import { fuenteCargadaPara, fuenteDe } from '../fuentes'

let pedido: boolean | null = null

/** ¿La URL pide el diagnóstico? Se lee una vez por carga; la primera vez que dice que sí, publica `window.__v3diag`. */
export function conDiagnostico(): boolean {
  if (pedido !== null) return pedido
  if (typeof window === 'undefined') return false
  pedido = new URLSearchParams(window.location.search).get('diag') === 'carga'
  if (pedido) void import('./publicar').then((m) => m.publicarElDiagnostico())
  return pedido
}

export interface EventoDeLaCarga {
  /** ms desde el arranque de la página. */
  readonly t: number
  readonly que: string
  readonly id: string
  readonly dato: string
}
export const EVENTOS: EventoDeLaCarga[] = []
const TOPE_DE_EVENTOS = 600

export function anotar(que: string, id = '', dato = ''): void {
  if (!conDiagnostico()) return
  EVENTOS.push({ t: Math.round(performance.now()), que, id, dato })
  if (EVENTOS.length > TOPE_DE_EVENTOS) EVENTOS.splice(0, EVENTOS.length - TOPE_DE_EVENTOS)
}

export { fuenteCargadaPara, fuenteDe }

export interface Impresion {
  readonly version: number
  readonly t: number
  readonly fuente: string
  readonly fuenteCargada: boolean
  readonly conectado: boolean
  readonly elemento: HTMLElement
  /** La x de cada letra en el DOM al imprimirse (em), si la pieza la usa (los títulos de volumen). */
  readonly letras: readonly number[] | null
}
export const IMPRESIONES = new Map<string, Impresion>()

/** Un texto impreso (armado en volumen o en textura) desde lo que medía su DOM: cuándo, con qué fuente y en qué versión. */
export function anotarLaImpresion(id: string, elemento: HTMLElement, letras: readonly number[] | null = null): void {
  if (!conDiagnostico()) return
  const i: Impresion = { version: (IMPRESIONES.get(id)?.version ?? 0) + 1, t: Math.round(performance.now()), fuente: fuenteDe(elemento), fuenteCargada: fuenteCargadaPara(elemento), conectado: elemento.isConnected, elemento, letras }
  IMPRESIONES.set(id, i)
  anotar('impreso', id, `${i.fuenteCargada ? 'fuente' : 'RESPALDO'} v${String(i.version)}${i.conectado ? '' : ' DESCONECTADO'}`)
}

/** Las piezas del pie recién armadas (las que no se habían visto: un rearme por una caja que cambió las vuelve a imprimir). */
const PIEZAS_VISTAS = new WeakSet<object>()
export function anotarLasPiezas(armadas: readonly { readonly pieza: { readonly id: string; readonly elemento: HTMLElement } }[]): void {
  if (!conDiagnostico()) return
  for (const a of armadas) {
    if (PIEZAS_VISTAS.has(a)) continue
    PIEZAS_VISTAS.add(a)
    anotarLaImpresion(`pie:${a.pieza.id}`, a.pieza.elemento)
  }
}

/** Un texto impreso que se soltó (su DOM vuelve a la vista). */
export function anotarElSuelto(id: string): void {
  if (!conDiagnostico() || !IMPRESIONES.delete(id)) return
  anotar('suelto', id)
}

/** Lo que el diagnóstico lee de cada pieza viva (tipos mínimos: sin three ni React). */
export interface LenisVisto {
  readonly scroll: number
  readonly animatedScroll: number
  readonly targetScroll: number
  readonly isScrolling: boolean | string
  readonly isStopped: boolean
}
export interface ArmadoVisto {
  readonly titulo: { readonly id: string }
  readonly malla: { readonly visible: boolean }
  readonly colocado: boolean
  readonly mostrado: { readonly llegada: number; readonly salida: number }
}
export interface BloqueVisto {
  readonly elemento: () => HTMLElement | null
  readonly rango: () => { readonly inicio: number; readonly fin: number } | null
  readonly anclas: unknown
}
export interface TunelVisto {
  readonly panel: HTMLElement
  readonly corriendo: () => boolean
  readonly mostrado: () => number
  readonly pedido: () => number
}
export const VISTOS: { lenis: LenisVisto | null; titulos: readonly ArmadoVisto[] | null; tunel: TunelVisto | null; readonly bloques: Set<BloqueVisto> } = { lenis: null, titulos: null, tunel: null, bloques: new Set() }

export function anotarElLenis(l: LenisVisto | null): void {
  if (conDiagnostico()) VISTOS.lenis = l
}
export function anotarLosTitulos(armados: readonly ArmadoVisto[]): void {
  if (conDiagnostico()) VISTOS.titulos = armados
}
export function anotarElTunel(t: TunelVisto | null): void {
  if (conDiagnostico()) VISTOS.tunel = t
}
/** Un bloque animado (su elemento medido, su rango y sus anclas); devuelve cómo soltarlo. */
export function anotarElBloque(b: BloqueVisto): () => void {
  if (!conDiagnostico()) return () => undefined
  VISTOS.bloques.add(b)
  return () => {
    VISTOS.bloques.delete(b)
  }
}
