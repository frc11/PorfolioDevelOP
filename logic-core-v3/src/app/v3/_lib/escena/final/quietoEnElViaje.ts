import { segundosDelViaje, viajeEnCurso } from '../viaje'
import { orbitaDelFinal, quedaDelQuieto, type FaseDelFinal } from './recorridoDelFinal'

/**
 * [PULIDO 28] AA3 · EL QUIETO Y LA ÓRBITA DEL MOUSE EN UN VIAJE DEL MENÚ. Con el pie quieto la cámara del final gira sin fin (el quieto) y
 * el mouse la orbita; al tocar el navbar las dos cosas volvían con el rebobinado comprimido del viaje, hasta el golpe: un giro acumulado
 * de hasta media vuelta se deshacía en un tercio de segundo con la cámara todavía arriba (mirando el piso), y toda la escena giraba de
 * golpe (medido en el sitio: el alabeo de la vista de −140° a 0 en 0,37 s; con el click enseguida, sin quieto, nada). Ahora, en un viaje,
 * vuelven a lo largo del viaje entero: arriba casi no se mueven y abajo son un corrimiento del azimut que se suma a la órbita del viaje.
 * En el rebobinado por un gesto, como siempre (hasta el golpe: el logo se levanta de frente, `s64` K4).
 */

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

/** Cuánto queda (1 a 0) a los `segundos` de un viaje de `dura` s: a lo largo del viaje entero, arranca y llega quieto. */
export function quedaEnElViaje(segundos: number, dura: number): number {
  return dura <= 0 ? 0 : 1 - suave(segundos / dura)
}

/** El del viaje en curso (sin viaje, nada). */
const quedaDelViaje = (): number => quedaEnElViaje(segundosDelViaje(), (viajeEnCurso()?.duracionMs ?? 0) / 1000)

/** Cuánto queda del quieto (el giro y el alejamiento) al rebobinar: en un viaje, por el viaje entero; si no, hasta el golpe. */
export function quedaDelQuietoAhora(fase: FaseDelFinal, fin: number, desde: number): number {
  return fase === 'viaje' ? quedaDelViaje() : quedaDelQuieto(fin, desde)
}

/** Cuánto queda de la órbita del mouse: en un viaje, por el viaje entero; si no, la de siempre (hasta el golpe). */
export function orbitaDelFinalAhora(fase: FaseDelFinal, fin: number): number {
  return fase === 'viaje' ? quedaDelViaje() : orbitaDelFinal(fin)
}
