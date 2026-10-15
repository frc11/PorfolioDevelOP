import { INCLINACION_DEL_TELEFONO } from './giroscopio'
import { perseguirAlPuntero, type PunteroAmortiguado } from './modulacionDeLaPose'

/**
 * [CIERRE A] A1 · EL PUNTERO DE LA ÓRBITA, SIN LOS CONTROLES FIJOS. Al pasar el mouse por la barra (o por Contacto y Login, el sonido, el
 * menú, cualquier control fijo) la escena rotaba: la órbita del mouse lo seguía también ahí. Ahora la órbita IGNORA el puntero sobre esos
 * controles: se queda con el último valor válido (fuera de ellos) y vuelve a seguirlo al salir. Vale en todo el recorrido (`OrbitRig`,
 * por `perseguirElPunteroDeLaOrbita`) y en el final del pie (`FinalDelPie`, su propia órbita). Lo demás que mira el puntero (el polvo, el piso, la
 * energía) sigue con el de r3f.
 */
export const CONTROLES_FIJOS = '[data-pieza="barra"], [data-pieza="sonido-de-la-esquina"], [data-pieza="control-del-sonido"], [data-pieza="menu-movil"], [data-pieza="vidrio"], [data-pieza="esquina-del-recorrido"], [data-control-fijo]'

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

/** La persecución de la órbita del recorrido: el giroscopio (inclinado) o el puntero sin los controles fijos, con el amortiguado de siempre. */
export function perseguirElPunteroDeLaOrbita(estado: PunteroAmortiguado, inclinado: boolean, puntero: { readonly x: number; readonly y: number }, delta: number): void {
  const p = inclinado ? INCLINACION_DEL_TELEFONO : punteroDeLaOrbita(puntero.x, puntero.y)
  perseguirAlPuntero(estado, p.x, p.y, delta)
}
