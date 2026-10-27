import { CONSULTA_ESCENARIO } from '../compuerta'
import { apagarElGiroscopio, defectoDelMovimiento, estadoDelGiroscopio, pidePermiso, prenderElGiroscopio, suscribirAlGiroscopio } from './giroscopio'

/**
 * [C2-81] EL MOVIMIENTO DEL TELÉFONO — así como se recomienda el sonido, se puede prender el giroscopio: inclinar el teléfono mueve la
 * cámara como el mouse y maneja el moiré (`giroscopio.ts`). Esta es la base (el resto del sitio se adapta en un sprint futuro).
 *
 *   · **Dónde:** teléfono y tablet: táctil, abajo de 1024 (el chrome del teléfono) y con la API del sensor (`llevaMovimiento`). En escritorio
 *     no hay botón y la frase del preloader queda la de siempre.
 *   · **Apagado por defecto** (como el sonido: se recomienda prenderlo), también con movimiento reducido; se prende a mano con su botón
 *     (`_chrome/movimiento/`) o tocando la frase del preloader, dentro del gesto (iOS pide el permiso ahí).
 *   · **Dura la sesión** (`sessionStorage`, con try/catch): si se prendió, al recargar vuelve prendido (en Android en el acto; en iOS, con
 *     el primer toque, que es el gesto que el permiso necesita). Negado o sin sensor, queda apagado y se guarda apagado.
 */
export const CLAVE_DEL_MOVIMIENTO = 'develop-v3-movimiento'

/** Táctil: el puntero principal es un dedo. */
export const CONSULTA_TACTIL = '(pointer: coarse)'

export type MovimientoGuardado = 'si' | 'no' | null

export interface AparatoDelMovimiento {
  readonly tactil: boolean
  /** Desde 1024 (`CONSULTA_ESCENARIO`): el chrome de escritorio. */
  readonly escritorio: boolean
  readonly conSensor: boolean
}

/** Puro: ¿este aparato lleva el movimiento? Táctil, abajo de 1024 y con la API del sensor. */
export const llevaMovimiento = (a: AparatoDelMovimiento): boolean => a.tactil && !a.escritorio && a.conSensor

export function hayMovimiento(): boolean {
  if (typeof window === 'undefined' || defectoDelMovimiento() === 'sin-movimiento') return false
  return llevaMovimiento({ tactil: window.matchMedia(CONSULTA_TACTIL).matches, escritorio: window.matchMedia(CONSULTA_ESCENARIO).matches, conSensor: 'DeviceOrientationEvent' in window })
}

/** Puro: si arranca prendido. Sólo si se prendió en esta sesión: apagado por defecto, con movimiento reducido también. */
export const arrancaPrendido = (guardado: MovimientoGuardado): boolean => guardado === 'si'

export function movimientoGuardado(): MovimientoGuardado {
  try {
    const v = window.sessionStorage.getItem(CLAVE_DEL_MOVIMIENTO)
    return v === 'si' || v === 'no' ? v : null
  } catch {
    return null
  }
}

export function guardarElMovimiento(prendido: boolean): void {
  try {
    window.sessionStorage.setItem(CLAVE_DEL_MOVIMIENTO, prendido ? 'si' : 'no')
  } catch {
    // Sin almacenamiento: dura lo que la página.
  }
}

/** Negado o sin sensor después de pedirlo: queda guardado apagado (no se vuelve a pedir al recargar). */
function recordarSiNoSePudo(): void {
  const quitar = suscribirAlGiroscopio(() => {
    const e = estadoDelGiroscopio()
    if (e === 'negado' || e === 'sin-sensor') guardarElMovimiento(false)
    if (e !== 'pidiendo' && e !== 'prendido') quitar()
  })
}

/** Prende el movimiento DESDE un gesto (el botón o la frase del preloader): lo guarda y pide el permiso si hace falta. */
export function activarElMovimiento(): void {
  const e = estadoDelGiroscopio()
  if (e === 'negado' || e === 'sin-sensor') return
  guardarElMovimiento(true)
  prenderElGiroscopio()
  recordarSiNoSePudo()
}

export function desactivarElMovimiento(): void {
  guardarElMovimiento(false)
  apagarElGiroscopio()
}

/**
 * Al cargar (la esquina del movimiento, una vez): si estaba prendido en esta sesión, lo vuelve a prender; donde hay que pedir permiso, con
 * el primer toque. Devuelve cómo dejar de esperar ese toque.
 */
export function retomarElMovimiento(): () => void {
  const nada = (): void => undefined
  if (!hayMovimiento()) return nada
  if (!arrancaPrendido(movimientoGuardado()) && defectoDelMovimiento() !== 'prendido-por-defecto') return nada
  if (!pidePermiso()) {
    prenderElGiroscopio()
    recordarSiNoSePudo()
    return nada
  }
  function quitar(): void {
    window.removeEventListener('touchend', alTocar, true)
    window.removeEventListener('click', alTocar, true)
  }
  function alTocar(): void {
    quitar()
    prenderElGiroscopio()
    recordarSiNoSePudo()
  }
  window.addEventListener('touchend', alTocar, true)
  window.addEventListener('click', alTocar, true)
  return quitar
}
