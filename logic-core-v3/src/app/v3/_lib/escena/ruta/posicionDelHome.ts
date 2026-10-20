import { DIA_DEL_FINAL, NOCHE_DISPARADA } from '../nocheDisparada'

/**
 * [B12a.7] LA POSICIÓN DEL HOME (plan §3.5 y §5, D6: «la flecha devuelve el scroll, la noche y el paso del Portfolio») — al irse del home
 * se guarda dónde estaba y cómo estaba la escena; al volver con la flecha del navegador se devuelve debajo del velo (`VeloDeNavegacion`), sin
 * animación, y recién se destapa. El paso del Portfolio sale del scroll (`pasos.ts`), así que vuelve con él; la noche disparada (la de la
 * gota) y el día del final (el amanecer del pie) se guardan aparte: la gota y el final los recalculan por tiempo, y al volver tienen que
 * estar como estaban, no animarse otra vez. En `sessionStorage`, con try/catch: sin él, la flecha lleva arriba (como «Home»).
 */
export interface PosicionDelHome {
  readonly y: number
  readonly noche: number
  readonly diaDelFinal: boolean
}

const CLAVE = 'v3:posicion-del-home'

/** Lo de ahora: el scroll y los dos almacenes. */
export function posicionDeAhora(): PosicionDelHome {
  return { y: Math.round(window.scrollY), noche: NOCHE_DISPARADA.cantidad, diaDelFinal: DIA_DEL_FINAL.activo }
}

export function guardarLaPosicionDelHome(p: PosicionDelHome): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(p))
  } catch {
    // sin almacenamiento: la vuelta va arriba
  }
}

/** La guardada, si hay y está entera. */
export function posicionGuardadaDelHome(): PosicionDelHome | null {
  try {
    const crudo: unknown = JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null')
    if (typeof crudo !== 'object' || crudo === null) return null
    const { y, noche, diaDelFinal } = crudo as Record<string, unknown>
    return typeof y === 'number' && Number.isFinite(y) && typeof noche === 'number' && typeof diaDelFinal === 'boolean' ? { y, noche, diaDelFinal } : null
  } catch {
    return null
  }
}

/** Los almacenes como estaban (el scroll lo pone quien llama, con Lenis). */
export function devolverLosAlmacenes(p: PosicionDelHome): void {
  NOCHE_DISPARADA.cantidad = p.noche
  DIA_DEL_FINAL.activo = p.diaDelFinal
}

/**
 * La vuelta en curso: la prende el velo con la flecha hacia el home y la apaga al destapar. Mientras está prendida, el ancla de la URL
 * (`#trabajos`, que el viaje deja en el historial) no lleva el scroll a su sección: manda la posición devuelta.
 */
export const VUELTA_AL_HOME = { enCurso: false }
