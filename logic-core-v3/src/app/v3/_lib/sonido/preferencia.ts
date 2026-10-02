import { SONIDOS, VOLUMEN_DEL_AMBIENTE, VOLUMEN_GENERAL } from './catalogo'
import type { Sonido } from './sprite'

/**
 * [3D Y SONIDO] T2 · LO QUE SE RECUERDA — si el sonido está prendido (apagado por defecto), los volúmenes que se movieron
 * en la página de prueba y [RETOQUE 3D] lo elegido en `localStorage` con try/catch: sin almacenamiento (privado,
 * bloqueado), lo que dura la página. [RONDA 2] F6 · ya no se elige nada (queda un solo ambiente, Bruma); la clave de los
 * volúmenes es nueva, así el ambiente arranca en su 0,5 de fábrica aunque se hubiera movido el de antes.
 */
const CLAVE = 'develop-v3-sonido'
const CLAVE_DE_LOS_VOLUMENES = 'develop-v3-sonido-volumenes-2'

export type Volumenes = Record<Sonido | 'general' | 'ambiente', number>

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
