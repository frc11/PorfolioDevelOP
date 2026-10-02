import type { Ambiente } from './ambienteGenerativo'
import { SONIDOS, VOLUMEN_DEL_AMBIENTE, VOLUMEN_GENERAL } from './catalogo'
import type { Sonido } from './sprite'

/**
 * [3D Y SONIDO] T2 · LO QUE SE RECUERDA — si el sonido está prendido (apagado por defecto), los volúmenes que se movieron
 * en la página de prueba y [RETOQUE 3D] lo elegido en `localStorage` con try/catch: sin almacenamiento (privado,
 * bloqueado), lo que dura la página. [CIERRE RETOQUE 3D] Se elige sólo el ambiente (S2, uno de tres generativos; los clics
 * ya no tienen candidatos, S1); su clave es nueva: lo elegido entre los bucles de antes no vale para estos.
 */
const CLAVE = 'develop-v3-sonido'
const CLAVE_DE_LOS_VOLUMENES = 'develop-v3-sonido-volumenes'
const CLAVE_DE_LOS_ELEGIDOS = 'develop-v3-sonido-ambiente'

export type Volumenes = Record<Sonido | 'general' | 'ambiente', number>

export interface Elegidos {
  readonly ambiente: Ambiente
}

export const ELEGIDOS_DE_FABRICA: Elegidos = { ambiente: 'a' }

let enLaPagina: boolean | null = null
const oyentes = new Set<() => void>()

export function leerPrendido(): boolean {
  if (enLaPagina !== null) return enLaPagina
  try {
    return window.localStorage.getItem(CLAVE) === 'si'
  } catch {
    return false
  }
}

export function guardarPrendido(prendido: boolean): void {
  enLaPagina = prendido
  try {
    window.localStorage.setItem(CLAVE, prendido ? 'si' : 'no')
  } catch {
    // Sin almacenamiento: queda `enLaPagina`.
  }
  for (const f of oyentes) f()
}

export function suscribirAlPrendido(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}

export function leerVolumenes(): Volumenes {
  const base = { general: VOLUMEN_GENERAL, ambiente: VOLUMEN_DEL_AMBIENTE } as Volumenes
  for (const s of Object.keys(SONIDOS) as Sonido[]) base[s] = SONIDOS[s].volumen
  try {
    const guardado: unknown = JSON.parse(window.localStorage.getItem(CLAVE_DE_LOS_VOLUMENES) ?? '{}')
    if (typeof guardado === 'object' && guardado !== null) {
      for (const [k, v] of Object.entries(guardado)) if (k in base && typeof v === 'number' && v >= 0 && v <= 1) base[k as keyof Volumenes] = v
    }
  } catch {
    // Vacío o ilegible: los del catálogo.
  }
  return base
}

export function guardarVolumenes(v: Volumenes | null): void {
  try {
    if (v === null) window.localStorage.removeItem(CLAVE_DE_LOS_VOLUMENES)
    else window.localStorage.setItem(CLAVE_DE_LOS_VOLUMENES, JSON.stringify(v))
  } catch {
    // Sin almacenamiento: los valores duran lo que dura la página.
  }
}

const esAmbiente = (v: unknown): v is Ambiente => v === 'a' || v === 'b' || v === 'c'

let elegidosEnLaPagina: Elegidos | null = null

export function leerElegidos(): Elegidos {
  if (elegidosEnLaPagina !== null) return elegidosEnLaPagina
  try {
    const g: unknown = JSON.parse(window.localStorage.getItem(CLAVE_DE_LOS_ELEGIDOS) ?? '{}')
    if (typeof g !== 'object' || g === null) return ELEGIDOS_DE_FABRICA
    const { ambiente } = g as Record<string, unknown>
    return { ambiente: esAmbiente(ambiente) ? ambiente : ELEGIDOS_DE_FABRICA.ambiente }
  } catch {
    return ELEGIDOS_DE_FABRICA
  }
}

export function guardarElegidos(e: Elegidos | null): void {
  elegidosEnLaPagina = e
  try {
    if (e === null) window.localStorage.removeItem(CLAVE_DE_LOS_ELEGIDOS)
    else window.localStorage.setItem(CLAVE_DE_LOS_ELEGIDOS, JSON.stringify(e))
  } catch {
    // Sin almacenamiento: la elección dura lo que dura la página.
  }
}
