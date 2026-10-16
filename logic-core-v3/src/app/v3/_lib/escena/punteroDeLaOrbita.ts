import { PROGRESO_DEL_PIE } from '../pie3d/registro'
import { MOUSE_TAU } from './choreographyPhysics'
import { INCLINACION_DEL_TELEFONO } from './giroscopio'
import { perseguirAlPuntero, type PunteroAmortiguado } from './modulacionDeLaPose'
import { TRAMOS_DEL_PIE } from './pie3d/coreografia'

/**
 * [CIERRE A] A1 · EL PUNTERO DE LA ÓRBITA, SIN LOS CONTROLES FIJOS. Al pasar el mouse por la barra (o por Contacto y Login, el sonido, el
 * menú, cualquier control fijo) la escena rotaba: la órbita del mouse lo seguía también ahí. Ahora la órbita IGNORA el puntero sobre esos
 * controles: se queda con el último valor válido (fuera de ellos) y vuelve a seguirlo al salir. Vale en todo el recorrido (`OrbitRig`,
 * por `perseguirElPunteroDeLaOrbita`) y en el final del pie (`FinalDelPie`, su propia órbita). Lo demás que mira el puntero (el polvo, el piso, la
 * energía) sigue con el de r3f.
 */
export const CONTROLES_FIJOS = '[data-pieza="barra"], [data-pieza="sonido-de-la-esquina"], [data-pieza="control-del-sonido"], [data-pieza="menu-movil"], [data-pieza="vidrio"], [data-control-fijo]'

/** El último puntero válido (de −1 a 1, como el de r3f), si ya hubo uno, y si el oyente está puesto. */
export const PUNTERO_DE_LA_ORBITA = { x: 0, y: 0, hay: false, escuchando: false }

/** ¿El evento cae sobre un control fijo? */
export function sobreUnControlFijo(objetivo: EventTarget | null): boolean {
  return typeof Element !== 'undefined' && objetivo instanceof Element && objetivo.closest(CONTROLES_FIJOS) !== null
}

/** Un movimiento del puntero (px de la ventana): fuera de los controles, el nuevo valor; sobre uno, nada (queda el último). Puro. */
export function moverElPunteroDeLaOrbita(p: typeof PUNTERO_DE_LA_ORBITA, x: number, y: number, ancho: number, alto: number, sobreUnControl: boolean): void {
  if (sobreUnControl) return
  p.x = (x / Math.max(1, ancho)) * 2 - 1
  p.y = 1 - (y / Math.max(1, alto)) * 2
  p.hay = true
}

/**
 * El puntero para la órbita en este cuadro: el último fuera de los controles fijos; sin ninguno todavía, `x` e `y` (el de r3f). El oyente
 * se pone la primera vez (de la ventana, en captura: lo ve antes que nadie) y queda puesto.
 */
export function punteroDeLaOrbita(x: number, y: number): { readonly x: number; readonly y: number } {
  const p = PUNTERO_DE_LA_ORBITA
  if (!p.escuchando && typeof window !== 'undefined') {
    p.escuchando = true
    window.addEventListener('pointermove', (e) => moverElPunteroDeLaOrbita(p, e.clientX, e.clientY, window.innerWidth, window.innerHeight, sobreUnControlFijo(e.target)), { capture: true, passive: true })
  }
  if (p.hay) return p
  RESPALDO.x = x
  RESPALDO.y = y
  return RESPALDO
}
const RESPALDO = { x: 0, y: 0 }

/**
 * [CIERRE A] A2 · EN EL PIE (DE PIE), ESTABLE: el paralaje del mouse del recorrido al 40 % (`escala`) y `amortigua` veces más lento. Entra
 * con el pie, de 0 a entero mientras asoma hasta que llega su primera pieza (su progreso, `PROGRESO_DEL_PIE`): sin salto. Acostado, la
 * órbita del final (`final/orbitaDelMouse.ts`).
 */
export const ORBITA_EN_EL_PIE = { escala: 0.4, amortigua: 2 } as const

/** Cuánto está la cámara en el pie (0 a 1, suave). */
export function enElPie(): number {
  const t = Math.min(1, Math.max(0, (PROGRESO_DEL_PIE.valor?.get() ?? 0) / TRAMOS_DEL_PIE[0].desde))
  return t * t * (3 - 2 * t)
}

/** La magnitud del paralaje del mouse en este cuadro: entera fuera del pie, `escala` en él. */
export const escalaDeLaOrbita = (): number => 1 - (1 - ORBITA_EN_EL_PIE.escala) * enElPie()

/** La persecución de la órbita del recorrido: el giroscopio (inclinado) o el puntero sin los controles fijos; en el pie, más amortiguada. */
export function perseguirElPunteroDeLaOrbita(estado: PunteroAmortiguado, inclinado: boolean, puntero: { readonly x: number; readonly y: number }, delta: number): void {
  const p = inclinado ? INCLINACION_DEL_TELEFONO : punteroDeLaOrbita(puntero.x, puntero.y)
  perseguirAlPuntero(estado, p.x, p.y, delta, MOUSE_TAU * (1 + (ORBITA_EN_EL_PIE.amortigua - 1) * enElPie()))
}
