import * as THREE from 'three'

import { duracionDelVolteo } from '../../formularios/volteo'

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
 * [PULIDO 22] T2 c · EN EL PIE, SE HUNDE: en vez del volteo, la placa se hunde por su hueco (hacia atrás de su cara: en el piso,
 * acostada) `espesores` espesores y se disuelve al llegar al fondo; la otra sale del mismo hueco (la misma caja, en el mismo lugar).
 * Se cambian en el fondo, a la mitad del tiempo. De vuelta al formulario, lo mismo. El DOM de abajo de 1025 y el panel de Contacto
 * siguen con el volteo (`formularios/volteo.ts`).
 */
export const HUNDIMIENTO_DEL_PIE = { espesores: 4, fundido: 0.14 } as const
export function duracionDeLaTransformacion(quieto: boolean): number {
  return duracionDelVolteo(quieto)
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

/** Si la placa se ve y cuánto (el disuelto de la llegada: 1 entera). */
export interface VistaDeLaTransformacion {
  readonly visible: boolean
  readonly aparece: number
}

const BAJA = new THREE.Matrix4()

/**
 * La pose en `t` (0 a 1) de la placa saliente (`entrante` falso: con sus medidas, `desde`) o de la entrante (con las suyas,
 * `caja`), escrita en `m`. Devuelve si se ve y cuánto.
 */
export function poseDeLaTransformacion(quieto: boolean, t: number, entrante: boolean, caja: Medidas, desde: Desde, espesor: number, m: THREE.Matrix4): VistaDeLaTransformacion {
  // La saliente, en su lugar (va en el grupo de la entrante).
  if (entrante) m.identity()
  else m.makeTranslation(desde.dx, -desde.dy, 0)
  if (quieto) return { visible: entrante ? t > 0 : t < 1, aparece: entrante ? suave(t) : 1 - suave(t) }
  const H = HUNDIMIENTO_DEL_PIE
  const hondo = espesor * H.espesores
  m.multiply(BAJA.makeTranslation(0, 0, entrante ? -hondo * (1 - suave((t - 0.5) * 2)) : -hondo * suave(t * 2)))
  const aparece = entrante ? suave((t - 0.5) / H.fundido) : 1 - suave((t - 0.5 + H.fundido) / H.fundido)
  return { visible: entrante ? t >= 0.5 : t < 0.5, aparece }
}
