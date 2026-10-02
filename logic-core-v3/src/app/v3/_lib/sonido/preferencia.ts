import { SONIDOS, VOLUMEN_GENERAL } from './catalogo'
import type { Sonido } from './sprite'

/**
 * [3D Y SONIDO] T2 · LO QUE SE RECUERDA — si el sonido está prendido y, desde la página de prueba, el volumen de cada uno.
 * En `localStorage`, siempre con try/catch: en una ventana privada, con los datos bloqueados o en una vista previa la
 * lectura puede tirar o volver vacía, y entonces vale lo de siempre (apagado, los volúmenes del catálogo).
 */
const CLAVE = 'develop-v3-sonido'
const CLAVE_DE_LOS_VOLUMENES = 'develop-v3-sonido-volumenes'

export type Volumenes = Record<Sonido | 'general', number>

/** Lo prendido en esta página (sin almacenamiento, la elección dura lo que dura la página) y quién se entera. */
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

/** Los del catálogo, con lo que se haya guardado encima (un número entre 0 y 1; lo demás se ignora). */
export function leerVolumenes(): Volumenes {
  const base = { general: VOLUMEN_GENERAL } as Volumenes
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
