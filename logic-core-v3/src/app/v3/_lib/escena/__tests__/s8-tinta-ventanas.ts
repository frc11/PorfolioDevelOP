/**
 * EL BARRIDO DE LAS VENTANAS — la peor lectura de cada transparente, con la
 * tinta que lleva.
 *
 * Sale de `s8-tinta.invariant.ts` en B8, por la regla de las 300 líneas y por
 * tema. Hasta B8 alcanzaba con mirar los cuatro bordes de cada ventana, porque
 * el contraste era monótono de punta a punta; con el atardecer adentro de la
 * ventana de Números y de la entrada de Trabajos, el mínimo cae en el MEDIO,
 * así que se barre la ventana entera en pasos de un sesentaicuatroavo.
 *
 * Y hay DOS tintas. Las secciones `papel-transparente` llevan `--color-tinta`
 * oscura, y su peor caso es el píxel más OSCURO del cuadro; las
 * `oscuro-transparente` (Trabajos y el Cierre) llevan la tinta invertida, y su
 * peor caso es el píxel más CLARO. Cuál lleva cada una se lee de la tabla de
 * superficies, no se escribe acá.
 */

import { razonDeContraste } from '../../__tests__/afirmar'
import { COLOR } from '../../__tests__/s10-acceso-color'
import { SECCIONES } from '../../secciones'
import { SUPERFICIES, TINTA_HEX } from '../../superficies'
import type { TramoDeSeccion } from '../recorrido'
import { grisHex, muestrearCuadro, percentil, vistaEn } from './cuadro'

type Escena = Parameters<typeof muestrearCuadro>[2]

/** El paso del barrido: 1/64 de progreso, más fino que un octavo de pantalla. */
export const PASO_DEL_BARRIDO = 1 / 64

/** Si la sección lleva la tinta invertida (banda oscura), leído de la tabla. */
export function esInvertida(id: string): boolean {
  const s = SECCIONES.find((x) => x.id === id)
  if (s === undefined) throw new Error(`la tabla del home no tiene a "${id}"`)
  return SUPERFICIES[s.superficie].invertida
}

/** La tinta de la sección contra SU peor píxel: el más oscuro para la tinta oscura, el más claro para la invertida. */
export function contrasteDeLaSeccion(id: string, progreso: number, escena: Escena): number {
  const h = muestrearCuadro(progreso, vistaEn(progreso), escena, 160, 90)
  return esInvertida(id)
    ? razonDeContraste(COLOR.tintaInvertida, grisHex(percentil(h.sinLogo, 1)))
    : razonDeContraste(TINTA_HEX, grisHex(percentil(h.sinLogo, 0)))
}

export interface PeorLectura {
  readonly peor: number
  /** El progreso en el que cae el peor caso. */
  readonly en: number
  readonly muestras: number
}

/** El peor contraste de la sección en toda la ventana en que se ve, barrida entera. */
export function peorDeLaVentana(f: TramoDeSeccion, escena: Escena): PeorLectura {
  let peor = Number.POSITIVE_INFINITY
  let en = f.seVeDesde
  let muestras = 0
  const leer = (p: number): void => {
    const c = contrasteDeLaSeccion(f.id, p, escena)
    muestras += 1
    if (c < peor) {
      peor = c
      en = p
    }
  }
  for (let p = f.seVeDesde; p < f.seVeHasta; p += PASO_DEL_BARRIDO) leer(p)
  leer(f.seVeHasta)
  return { peor, en, muestras }
}

/**
 * Dónde una función de contraste cruza un umbral dentro de [desde, hasta], por
 * bisección, en cualquiera de los dos sentidos: se mira qué extremo está
 * arriba y se bisecta hacia el cruce. Supone UN cruce en el tramo — por eso
 * recibe el tramo y no adivina sobre [0, 1], donde desde B8 hay dos.
 */
export function cruceEn(contraste: (p: number) => number, umbral: number, desde: number, hasta: number): number {
  const sube = contraste(desde) < contraste(hasta)
  let lo = desde
  let hi = hasta
  for (let i = 0; i < 16; i += 1) {
    const m = (lo + hi) / 2
    if ((contraste(m) >= umbral) !== sube) lo = m
    else hi = m
  }
  return (lo + hi) / 2
}
