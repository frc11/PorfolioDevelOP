/**
 * EL FOTOGRAMA — de un progreso a las propiedades de CSS de UNA pieza.
 *
 * Es el centro del sistema, y es una función pura. Toma el progreso global de un
 * patrón y devuelve lo que hay que escribirle a la pieza número `i`. Encadena, en
 * este orden, las cuatro piezas del vocabulario:
 *
 *     progreso global
 *       → `progresoDeHijo`  (cronograma: dónde cae esta pieza en el escalonado)
 *       → tramo activo      (solo cuando el patrón es una línea de tiempo)
 *       → curva             (la función exacta de GSAP, no un cubic-bezier)
 *       → `traducir`        (las claves declaradas → CSS real)
 *
 * Que sea pura es lo que permite comprobarla sin navegador: se le pide el
 * fotograma en 0, en 0,5 y en 1 y se afirma el string exacto.
 *
 * ── El orden importa y no es intercambiable ────────────────────────────────
 *
 * La curva se aplica al progreso LOCAL de la pieza, nunca al global. Aplicarla
 * al global —que es el error natural cuando uno viene de pensar en un tween
 * único— daría un conjunto que arranca lento y termina lento COMO CONJUNTO, con
 * las piezas repartidas linealmente adentro. Es al revés: el conjunto avanza
 * parejo con el scroll y cada pieza llega curvada. Ésa es la razón por la que el
 * envoltorio de un tween con escalonado dice `ease: none` en GSAP y no miente
 * del todo: el envoltorio ES lineal. Lo que miente es leerlo como si describiera
 * la animación.
 */

import { progresoDeHijo, type Cronograma } from './cronograma'
import { CURVAS, type NombreDeCurva } from './curvas'
import type { Conmutacion, Fotograma, Tramo } from './patrones'
import {
  conmutar,
  interpolar,
  traducir,
  type ClaveNumerica,
  type PropiedadesReales,
  type ValoresDeclarados,
} from './traduccion'

/** Todo lo que hace falta para saber qué le toca a una pieza. */
export interface EspecificacionDePieza {
  readonly claves: readonly Fotograma[]
  readonly tramos?: readonly Tramo[]
  readonly pointerEvents?: Conmutacion
  readonly curva: NombreDeCurva
  readonly cronograma: Cronograma
}

/** Aplica un juego de claves a un progreso ya curvado. */
function aplicarClaves(
  claves: readonly Fotograma[],
  t: number,
  destino: Partial<Record<ClaveNumerica, number>>,
): void {
  for (const k of claves) destino[k.clave] = interpolar(k.desde, k.hasta, t)
}

/**
 * El tramo activo de una línea de tiempo, y el progreso dentro de él.
 *
 * Antes del primer tramo devuelve el primero en 0; después del último, el último
 * en 1. Así la pieza siempre tiene un estado definido y el recorrido es
 * exactamente reversible en los dos bordes.
 */
export function tramoActivo(
  tramos: readonly Tramo[],
  local: number,
): { tramo: Tramo; t: number } {
  const primero = tramos[0]
  if (local <= primero.desde) return { tramo: primero, t: 0 }

  for (const tramo of tramos) {
    if (local >= tramo.desde && local < tramo.hasta) {
      const ancho = tramo.hasta - tramo.desde
      return { tramo, t: ancho > 0 ? (local - tramo.desde) / ancho : 1 }
    }
  }

  return { tramo: tramos[tramos.length - 1], t: 1 }
}

/** Las claves declaradas de una pieza en un progreso global dado. */
export function valoresDePieza(
  spec: EspecificacionDePieza,
  indice: number,
  progresoGlobal: number,
): ValoresDeclarados {
  const local = progresoDeHijo(progresoGlobal, indice, spec.cronograma)
  const valores: Partial<Record<ClaveNumerica, number>> & {
    pointerEvents?: 'auto' | 'none'
  } = {}

  if (spec.tramos !== undefined && spec.tramos.length > 0) {
    const { tramo, t } = tramoActivo(spec.tramos, local)
    aplicarClaves(tramo.claves, CURVAS[tramo.curva](t), valores)
    if (tramo.pointerEvents !== undefined) {
      valores.pointerEvents = conmutar(t, tramo.pointerEvents.inicial, tramo.pointerEvents.final)
    }
    return valores
  }

  aplicarClaves(spec.claves, CURVAS[spec.curva](local), valores)
  if (spec.pointerEvents !== undefined) {
    valores.pointerEvents = conmutar(local, spec.pointerEvents.inicial, spec.pointerEvents.final)
  }
  return valores
}

/** Las propiedades de CSS de una pieza en un progreso global dado. */
export function propiedadesDePieza(
  spec: EspecificacionDePieza,
  indice: number,
  progresoGlobal: number,
): PropiedadesReales {
  return traducir(valoresDePieza(spec, indice, progresoGlobal))
}

/** Qué propiedades escribe este patrón. Se decide una vez, no por cuadro:
 *  con un `MotionValue` no se puede omitir una clave de `style` a mitad de una
 *  animación, así que la decisión tiene que ser estática. */
export interface PropiedadesQueEscribe {
  readonly transform: boolean
  readonly opacity: boolean
  readonly visibility: boolean
  readonly pointerEvents: boolean
}

const CLAVES_DE_TRANSFORM: ReadonlySet<ClaveNumerica> = new Set<ClaveNumerica>([
  'xPercent',
  'yPercent',
  'x',
  'y',
  'translateZ',
  'scale',
  'rotationX',
  'rotationY',
  'rotationZ',
])

export function propiedadesQueEscribe(spec: EspecificacionDePieza): PropiedadesQueEscribe {
  const todas: Fotograma[] = [...spec.claves]
  for (const tramo of spec.tramos ?? []) todas.push(...tramo.claves)

  const hayPointerEvents =
    spec.pointerEvents !== undefined ||
    (spec.tramos ?? []).some((t) => t.pointerEvents !== undefined)

  return {
    // Una clave que va de su neutro a su neutro —el `scale` 1→1 de P1— no
    // escribe nada: `traducir` no la emite. Se descarta acá también para no
    // declarar una propiedad que nunca va a tener valor.
    transform: todas.some((k) => CLAVES_DE_TRANSFORM.has(k.clave) && k.desde !== k.hasta),
    opacity: todas.some((k) => k.clave === 'opacity' || k.clave === 'autoAlpha'),
    visibility: todas.some((k) => k.clave === 'autoAlpha'),
    pointerEvents: hayPointerEvents,
  }
}
