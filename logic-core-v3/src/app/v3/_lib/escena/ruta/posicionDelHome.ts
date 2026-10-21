import { DIA_DEL_FINAL, NOCHE_DISPARADA } from '../nocheDisparada'

/**
 * [B12a.7] LA POSICIÓN DEL HOME (plan §3.5 y §5, D6: «la flecha devuelve el scroll, la noche y el paso del Portfolio») — al irse del home
 * se guarda dónde estaba y cómo estaba la escena; al volver con la flecha del navegador se devuelve debajo del velo (`VeloDeNavegacion`), sin
 * animación, y recién se destapa. El paso del Portfolio sale del scroll (`pasos.ts`), así que vuelve con él; la noche disparada (la de la
 * gota) y el día del final (el amanecer del pie) se guardan aparte: la gota y el final los recalculan por tiempo, y al volver tienen que
 * estar como estaban, no animarse otra vez. En `sessionStorage`, con try/catch: sin él, la flecha lleva arriba (como «Home»).
 *
 * [B12a.8] UNA POR ENTRADA DEL HISTORIAL: con dos entradas del home en el historial (home → página → home → página), volver dos veces daba
 * en la primera la posición de la segunda (había una sola). Ahora se guarda por la clave de la entrada (`claveDeLaEntrada`: la de la
 * Navigation API, que es la misma mientras la entrada exista y no cambia al reemplazarla) y la vuelta lee la de la entrada a la que se
 * vuelve. Sin la Navigation API, una sola, como antes. Se guardan las últimas `ENTRADAS_GUARDADAS`.
 */
export interface PosicionDelHome {
  readonly y: number
  readonly noche: number
  readonly diaDelFinal: boolean
}

const CLAVE = 'v3:posicion-del-home'
/** [B12a.8] Cuántas entradas del home se recuerdan (las más viejas se van). */
export const ENTRADAS_GUARDADAS = 24
/** [B12a.8] La clave de la posición sin Navigation API: una sola, la de siempre. */
export const SIN_ENTRADA = '-'

type ConNavegacion = { readonly navigation?: { readonly currentEntry?: { readonly key: string } | null } }

/** [B12a.8] La clave de la entrada del historial de ahora (la Navigation API), o `SIN_ENTRADA`. El control del arnés (`'una-sola'`): la de B12a.7. */
export function claveDeLaEntrada(): string {
  if (typeof window === 'undefined' || (window as Window & { __defectosDelVelo?: unknown }).__defectosDelVelo === 'una-sola') return SIN_ENTRADA
  return (window as Window & ConNavegacion).navigation?.currentEntry?.key ?? SIN_ENTRADA
}

/** Lo de ahora: el scroll y los dos almacenes. */
export function posicionDeAhora(): PosicionDelHome {
  return { y: Math.round(window.scrollY), noche: NOCHE_DISPARADA.cantidad, diaDelFinal: DIA_DEL_FINAL.activo }
}

const valida = (crudo: unknown): PosicionDelHome | null => {
  if (typeof crudo !== 'object' || crudo === null) return null
  const { y, noche, diaDelFinal } = crudo as Record<string, unknown>
  return typeof y === 'number' && Number.isFinite(y) && typeof noche === 'number' && typeof diaDelFinal === 'boolean' ? { y, noche, diaDelFinal } : null
}

/** Las guardadas, de la más vieja a la más nueva: `[clave, posición]`. */
function guardadas(): [string, PosicionDelHome][] {
  try {
    const crudo: unknown = JSON.parse(sessionStorage.getItem(CLAVE) ?? '[]')
    if (!Array.isArray(crudo)) return []
    return crudo.flatMap((e: unknown) => {
      if (!Array.isArray(e) || typeof e[0] !== 'string') return []
      const p = valida(e[1])
      return p === null ? [] : [[e[0], p] as [string, PosicionDelHome]]
    })
  } catch {
    return []
  }
}

/** Guarda la posición de una entrada (la de ahora, por defecto). */
export function guardarLaPosicionDelHome(p: PosicionDelHome, clave: string = claveDeLaEntrada()): void {
  const resto = guardadas().filter(([c]) => c !== clave)
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify([...resto, [clave, p]].slice(-ENTRADAS_GUARDADAS)))
  } catch {
    // sin almacenamiento: la vuelta va arriba
  }
}

/** La guardada de una entrada (la de ahora, por defecto), si hay y está entera. */
export function posicionGuardadaDelHome(clave: string = claveDeLaEntrada()): PosicionDelHome | null {
  return guardadas().find(([c]) => c === clave)?.[1] ?? null
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
