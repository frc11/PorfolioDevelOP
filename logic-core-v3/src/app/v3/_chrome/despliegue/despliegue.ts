import { ESCALA_DEL_FUNDIDO, MS_DEL_FUNDIDO } from '../../_secciones/trabajos/demos/apertura'
import { MS_DEL_GENIE, correrPorTiempo, liderDelGenie, type Caja } from '../../_secciones/trabajos/demos/genie'
import { caminoDeLaSilueta, radioDeLaSilueta, siluetaDelGenie } from '../menu/silueta'

/**
 * [B7] EL DESPLIEGUE — una hoja de pantalla completa que sale de un botón como sale una demo de su libro, y vuelve a él.
 *
 * NO es un efecto nuevo: es el de las demos, importado y no copiado.
 *   · **el tiempo y la curva** son los del Genie de las demos (`demos/genie.ts`): `MS_DEL_GENIE` de punta a punta, contado con el
 *     mismo reloj (`correrPorTiempo`, un cuadro después del que monta), y la forma de cada fila sale de `filaDelGenie` (el embudo
 *     y el deslizamiento, con sus dos fases solapadas y su `smoothstep`). La pantalla entera es la ventana y el botón, el libro;
 *   · **la forma** es la silueta del menú del teléfono (`menu/silueta.ts`): el contorno de las filas del Genie con las esquinas
 *     redondeadas, que va del rectángulo de la pantalla al radio del botón. Una sola capa recortada por `clip-path: path()`, sin
 *     tiras: la hoja es un color liso (lo que las tiras llevaban era la foto de la demo);
 *   · **lo de adentro** viaja recortado por la misma forma y aparece con el avance (`1 − m`, lineal en el tiempo, como el velo de
 *     las demos acompaña al Genie): «al mismo tiempo» que el fondo tapa, y una vez desplegado está todo;
 *   · **con movimiento reducido, o sin un botón a la vista** (la entrada directa por la URL, el teléfono sin la barra), el fundido
 *     de las demos: `MS_DEL_FUNDIDO` con la escala corta de `ESCALA_DEL_FUNDIDO`.
 *
 * Puro y sin DOM: lo prueba `s79-ingreso`. El gancho que lo pinta es `useDespliegue.ts`. Lo usa el login (`_chrome/ingreso/`); la
 * prueba del panel (C1) se va a desplegar igual.
 */

export { correrPorTiempo }
export type { Caja }

/** Los tiempos del despliegue: LOS de las demos (no una copia de sus números). */
export const DESPLIEGUE = {
  /** El Genie entero, de punta a punta. */
  ms: MS_DEL_GENIE,
  /** El fundido de movimiento reducido. */
  fundidoMs: MS_DEL_FUNDIDO,
  /** La escala de la que parte lo de adentro en el fundido. */
  escalaDelFundido: ESCALA_DEL_FUNDIDO,
} as const

/** La pantalla entera, que es la «ventana» del Genie. */
export const cajaDeLaPantalla = (ancho: number, alto: number): Caja => ({ x: 0, y: 0, ancho, alto })

/** Lo que devuelve `getBoundingClientRect`, sin pedir un elemento (para probarlo sin DOM). */
export interface Rectangulo {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/**
 * La caja del botón del que sale, si está a la vista: con tamaño y adentro de la pantalla. Si no (la barra escondida en el
 * teléfono, un botón fuera de cuadro), `null`: no hay de dónde salir y va el fundido.
 */
export function cajaDelOrigen(r: Rectangulo | null, ancho: number, alto: number): Caja | null {
  if (r === null || !(r.width > 0) || !(r.height > 0)) return null
  if (r.left + r.width <= 0 || r.top + r.height <= 0 || r.left >= ancho || r.top >= alto) return null
  return { x: r.left, y: r.top, ancho: r.width, alto: r.height }
}

/**
 * La forma en el progreso `m` (0 = desplegada en la pantalla entera, 1 = adentro del botón), como camino SVG en coordenadas de la
 * pantalla: el contorno del Genie de las demos, con las esquinas del rectángulo (0) al radio del botón (la mitad de su lado corto:
 * una píldora es su propia forma al final).
 */
export function formaDelDespliegue(m: number, pantalla: Caja, origen: Caja): string {
  const silueta = siluetaDelGenie(m, pantalla, origen, liderDelGenie(pantalla, origen))
  return caminoDeLaSilueta(silueta, radioDeLaSilueta(m, 0, Math.min(origen.ancho, origen.alto) / 2))
}

/** Cuánto se ve lo de adentro en el progreso `m`: con el avance del Genie, como el velo de las demos. */
export const opacidadDelContenido = (m: number): number => Math.min(1, Math.max(0, 1 - m))

/** El fundido de movimiento reducido en `u` (0 = cerrado, 1 = abierto): la opacidad y la escala de lo de adentro. */
export const escalaDelFundido = (u: number): number => DESPLIEGUE.escalaDelFundido + (1 - DESPLIEGUE.escalaDelFundido) * Math.min(1, Math.max(0, u))

/** Cuánto dura un tramo de `desde` a `hasta` (en progreso), si se interrumpe a mitad de camino: lo que falta, no el entero. */
export const msDelTramo = (desde: number, hasta: number, conGenie: boolean): number => (conGenie ? DESPLIEGUE.ms : DESPLIEGUE.fundidoMs) * Math.abs(hasta - desde)
