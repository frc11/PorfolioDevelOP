import { FLOOR_Y } from '../probeScene'
import { MOIRE_NEAR_RADIUS, MOIRE_NEAR_TOP } from '../probeMoire'

/**
 * [PULIDO 19] Q3 · EL CRISTAL, LO PURO (`docs/rediseno/DIMENSION-ESPEJO.md`, «El cristal de fondo»). Una capa de vidrio FACETADO siempre
 * presente, solidaria a la cúpula del moiré (un cilindro apenas adentro de la trama cercana), que refracta lo de atrás (el cielo, la
 * trama con su fábrica de logos y el piso lejano). Las constantes y la amplitud: dónde se ve (en todo el recorrido salvo el túnel de
 * Trabajos y Tu panel, que son papel opaco) y cómo se va con el final del pie (la cámara que sube). Puro (Node).
 */
export const CRISTAL = {
  /** El cilindro del vidrio (u): su radio (adentro de la trama cercana) y entre qué alturas. */
  radio: MOIRE_NEAR_RADIUS - 0.6,
  abajo: FLOOR_Y - 0.5,
  arriba: MOIRE_NEAR_TOP,
  /**
   * Las facetas: el lado medio de una celda (u sobre el cilindro; alrededor entran las que entran justas: sin costura), cuánto se
   * inclina cada una (rad), el ancho del bisel (u) y cuánto gira la normal en el bisel (rad).
   */
  faceta: { lado: 5.2, inclinacion: 0.09, bisel: 0.32, biselGiro: 0.4 },
  /** El vidrio: el índice, la profundidad del fondo detrás (u: a eso se lee la transmisión), el Fresnel de frente (F0) y la dispersión con el prisma. */
  vidrio: { indice: 1.5, fondo: 9, f0: 0.04, dispersion: 0.012 },
  /** La luz: el brillo especular (día, noche), su dureza, el reflejo tenue del entorno (día, noche) y la talla de día (cuánto oscurece el bisel). */
  luz: { especular: [0.15, 1.3], dureza: 56, reflejo: [0.07, 0.2], talla: 0.07 },
  /** Las facetas se reacomodan muy lento: la deriva de las semillas (periodo s, fracción de la celda) y crecen y se achican en alto (periodo s, fracción). */
  deriva: { periodoS: 95, cuanto: 0.32, crecePeriodoS: 170, crece: 0.14 },
  /** Dónde se apaga (las secciones de papel opaco y el túnel) y el fundido alrededor (pantallas); y cuánto baja sobre un texto. */
  donde: { apagadas: ['trabajos', 'tu-panel'], fundido: 0.35, sobreTexto: 0.75 },
  /** El tope del corrimiento de la refracción (px de CSS): nunca un salto. */
  topePx: 56,
} as const

/** Cuántas facetas entran alrededor del cilindro (justas: sin costura) y el lado alrededor (u) que resulta. */
export function facetasAlrededor(radio = CRISTAL.radio, lado = CRISTAL.faceta.lado): { readonly cuantas: number; readonly lado: number } {
  const cuantas = Math.max(8, Math.round((2 * Math.PI * radio) / lado))
  return { cuantas, lado: (2 * Math.PI * radio) / cuantas }
}

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * (3 - 2 * u)
}

/**
 * La amplitud por dónde está la página (0 a 1): 0 con el medio de la pantalla adentro de una sección apagada, 1 a más de `fundido`
 * pantallas de todas, el fundido entre medio. `bandas`: por sección apagada, su arriba y su abajo (px del documento); `centro`: el medio
 * de la pantalla (px del documento); `alto`: la pantalla (px).
 */
export function amplitudPorDonde(centro: number, alto: number, bandas: ArrayLike<number>, cuantas: number): number {
  let a = 1
  const fundido = CRISTAL.donde.fundido * Math.max(1, alto)
  for (let k = 0; k < cuantas; k += 1) {
    const arriba = bandas[k * 2]
    const abajo = bandas[k * 2 + 1]
    if (!Number.isFinite(arriba) || !Number.isFinite(abajo)) continue
    const fuera = centro < arriba ? arriba - centro : centro > abajo ? centro - abajo : 0
    a = Math.min(a, suave(fuera / fundido))
  }
  return a
}

/** La amplitud del cuadro: por dónde está la página y por el final del pie (se va con la cámara que sube, `camara` 0 a 1). */
export function amplitudDelCristal(porDonde: number, camara: number): number {
  return porDonde * (1 - suave(camara))
}
