import { entornoDeLaEscena } from '../entorno'
import { CAIDA_AL_HUECO } from './caidaAlHueco'

/**
 * [CIERRE A-bis] A10 · EL REBOTE AL CAER (`?rebote=si`; apagado en el producto). Al tocar el piso en el golpe, cada pieza del pie (las de
 * las columnas, el formulario) da unos saltos chicos y amortiguados antes de incrustarse: el primero de `alto` (u) y cada uno con
 * `restitucion` de la velocidad del anterior, con la gravedad de la escena en el reloj del final (la misma física que la caída). Cada pieza
 * con su alto (± `variacion`, por su lugar en el pie): sus saltos duran distinto y se desfasan. El contacto sigue en el golpe (el sonido,
 * la onda, el logo) y los huecos no cambian: la columna se incrusta cuando terminan (`lugaresEnElPiso`). Puro (Node). El alto, chico en
 * la pantalla: la cámara del final acompaña el vuelco y ve las piezas de frente, así que un salto va hacia ella (1 u, ~2 % de su tamaño).
 */
export const REBOTE_DEL_PIE = { alto: 1, restitucion: 0.45, saltos: 3, variacion: 0.3 } as const

let pedido: boolean | null = null

/** Si la URL lo pide (se lee una vez por carga). */
export function conRebote(): boolean {
  return (pedido ??= entornoDeLaEscena().pruebas.rebote === 'si')
}

/** El alto del primer salto de la pieza `i` (u): el de todas, corrido por su lugar (con la razón áurea: las vecinas, distintas). */
export function altoDelRebote(i: number): number {
  return REBOTE_DEL_PIE.alto * (1 + REBOTE_DEL_PIE.variacion * (2 * ((i * 0.618034) % 1) - 1))
}

/** Lo que dura el rebote más largo (s del reloj; sin el rebote, 0). */
export function duracionDelRebote(activo: boolean = conRebote()): number {
  if (!activo) return 0
  const g = CAIDA_AL_HUECO.gravedad
  const v = Math.sqrt(2 * g * REBOTE_DEL_PIE.alto * (1 + REBOTE_DEL_PIE.variacion))
  let t = 0
  for (let k = 0; k < REBOTE_DEL_PIE.saltos; k += 1) t += (2 * v * REBOTE_DEL_PIE.restitucion ** k) / g
  return t
}

/** Lo que sube la pieza `i` (u) a los `u` s del reloj desde el golpe: sus saltos (sin el rebote, o antes del golpe, 0). */
export function reboteDeLaPieza(i: number, u: number, activo: boolean = conRebote()): number {
  if (!activo || u <= 0) return 0
  const g = CAIDA_AL_HUECO.gravedad
  let v = Math.sqrt(2 * g * altoDelRebote(i))
  let t = u
  for (let k = 0; k < REBOTE_DEL_PIE.saltos; k += 1) {
    const dura = (2 * v) / g
    if (t < dura) return v * t - (g * t * t) / 2
    t -= dura
    v *= REBOTE_DEL_PIE.restitucion
  }
  return 0
}
