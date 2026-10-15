import * as THREE from 'three'

import { duracionDelCambioDelPie } from '../../formularios/volteo'

/**
 * [PULIDO 9] H2 · LA PLACA DEL FORMULARIO SE TRANSFORMA (en la tarjeta del resultado y de vuelta) — pura: la pose de las dos
 * placas en el tiempo. La saliente (la que estaba) se ve en la primera parte y la entrante (la armada con el DOM nuevo) en la
 * segunda; se cambian de canto, donde el cambio no se ve.
 *
 * [PULIDO 11] B1 · el volteo con las mismas curvas que el DOM (`formularios/volteo.ts`): la entrante tiene la caja de la saliente
 * (la tarjeta guarda el alto del formulario): comparten el eje y nada salta en el cambio. 180° en un movimiento sobre el eje
 * horizontal del medio (la saliente hasta 90°; la entrante, el mismo ángulo menos 180°, de −90° a 0). [PULIDO 13] · el columpio
 * se borró. El hundido se borró. Con movimiento reducido, un fundido (el disuelto de la llegada del pie): la saliente se va y
 * la entrante aparece, quietas. Las poses van en px de la pieza (origen arriba a la izquierda, y hacia arriba, la cara en z = 0 y el dorso en
 * −espesor).
 *
 * [PULIDO 22] T2 c · en el pie se hundía por su hueco y se disolvía (una mancha gris borrosa). [PULIDO 27] Y1 c · SE DERRITE: la placa
 * se queda en su lugar y se derrite en el piso (la deformación es del sombreador: `derretido.ts`, con `derrite` de 0 a 1 en la primera
 * mitad); en la segunda, la otra (la misma caja, en el mismo lugar) nace del mismo charco: `derrite` de 1 a 0. Se cambian en la mitad,
 * las dos derretidas enteras (el charco hundido en el piso). De vuelta al formulario, lo mismo. El DOM de abajo de 1025 y el panel de
 * Contacto siguen con el volteo (`formularios/volteo.ts`).
 */
export const DERRETIDO_DEL_CAMBIO = { mitad: 0.5 } as const
export function duracionDeLaTransformacion(quieto: boolean): number {
  return duracionDelCambioDelPie(quieto)
}

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

interface Medidas {
  readonly ancho: number
  readonly alto: number
}

/** La saliente: sus medidas y dónde está su esquina respecto de la de la entrante (px del documento, y hacia abajo). */
interface Desde extends Medidas {
  readonly dx: number
  readonly dy: number
}

/** Si la placa se ve, cuánto (el disuelto de la llegada: 1 entera) y [PULIDO 27] Y1 c · cuánto se derritió (0 sólida, 1 en el charco). */
export interface VistaDeLaTransformacion {
  readonly visible: boolean
  readonly aparece: number
  readonly derrite: number
}

/**
 * La pose en `t` (0 a 1) de la placa saliente (`entrante` falso: con sus medidas, `desde`) o de la entrante (con las suyas,
 * `caja`), escrita en `m`. Devuelve si se ve, cuánto y cuánto se derritió.
 */
export function poseDeLaTransformacion(quieto: boolean, t: number, entrante: boolean, caja: Medidas, desde: Desde, espesor: number, m: THREE.Matrix4): VistaDeLaTransformacion {
  // La saliente, en su lugar (va en el grupo de la entrante).
  if (entrante) m.identity()
  else m.makeTranslation(desde.dx, -desde.dy, 0)
  if (quieto) return { visible: entrante ? t > 0 : t < 1, aparece: entrante ? suave(t) : 1 - suave(t), derrite: 0 }
  const mitad = DERRETIDO_DEL_CAMBIO.mitad
  const u = Math.min(1, Math.max(0, t))
  const derrite = entrante ? 1 - Math.max(0, (u - mitad) / (1 - mitad)) : Math.min(1, u / mitad)
  return { visible: entrante ? t >= mitad : t < mitad, aparece: 1, derrite }
}
