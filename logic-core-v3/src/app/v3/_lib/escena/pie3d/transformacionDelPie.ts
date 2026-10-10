import * as THREE from 'three'

import type { VarianteDeGracias } from '../../formularios/gracias'

/**
 * [PULIDO 9] H2 · LA PLACA DEL FORMULARIO SE TRANSFORMA EN LA TARJETA DE GRACIAS (y de vuelta, con «Enviar otro mensaje») —
 * pura: la pose de las dos placas en el tiempo. La saliente (la que estaba) se ve en la primera parte y la entrante (la
 * armada con el DOM nuevo) en la segunda; se cambian donde el cambio no se ve.
 *
 *   · `volteo` (el de siempre, o `?gracias=volteo`): la placa gira sobre X, como las placas del CTA; a los 90° (de canto)
 *     sigue el giro la entrante: el mensaje está en su cara de atrás.
 *   · `hundido` (`?gracias=hundido`): el relieve se hunde en la cara (los pozos, la tecla y el espesor se aplanan), la placa
 *     plana se ajusta al tamaño nuevo y el mensaje sale en relieve desde la superficie (la placa recupera su espesor).
 *
 * Con movimiento reducido, un fundido (el disuelto de la llegada del pie): la saliente se va y la entrante aparece, quietas.
 * Las poses van en px de la pieza (origen arriba a la izquierda, y hacia arriba, la cara en z = 0 y el dorso en −espesor).
 */
export const TRANSFORMACION_DEL_PIE = {
  volteo: { s: 0.9 },
  /** Hasta dónde se aplana la saliente y hasta dónde se ajusta el tamaño (fracción del tiempo); lo plano que queda. */
  hundido: { s: 1.2, aplana: 0.4, ajusta: 0.65, plano: 0.03 },
  fundido: { s: 0.4 },
} as const

export function duracionDeLaTransformacion(variante: VarianteDeGracias, quieto: boolean): number {
  return quieto ? TRANSFORMACION_DEL_PIE.fundido.s : TRANSFORMACION_DEL_PIE[variante].s
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

const PIVOTE = new THREE.Matrix4()
const GIRO = new THREE.Matrix4()

/**
 * La pose en `t` (0 a 1) de la placa saliente (`entrante` falso: con sus medidas, `desde`) o de la entrante (con las suyas,
 * `caja`), escrita en `m`. Devuelve si se ve y cuánto.
 */
export function poseDeLaTransformacion(variante: VarianteDeGracias, quieto: boolean, t: number, entrante: boolean, caja: Medidas, desde: Desde, espesor: number, m: THREE.Matrix4): VistaDeLaTransformacion {
  // La saliente, en su lugar (va en el grupo de la entrante).
  if (entrante) m.identity()
  else m.makeTranslation(desde.dx, -desde.dy, 0)
  if (quieto) return { visible: entrante ? t > 0 : t < 1, aparece: entrante ? suave(t) : 1 - suave(t) }
  if (variante === 'volteo') {
    // [PULIDO 10] J4 · 180° en UN movimiento: una sola curva para todo el giro (antes, una por mitad: a los 90° la velocidad
    // llegaba a cero y el giro se veía pararse «a cargar algo»). La saliente muestra el ángulo hasta 90°; la entrante, el mismo
    // menos 180° (de −90° a 0), alrededor del centro de cada placa: misma velocidad en el cambio.
    const giro = Math.PI * suave(t)
    const angulo = entrante ? giro - Math.PI : giro
    const c = entrante ? caja : desde
    PIVOTE.makeTranslation(c.ancho / 2, -c.alto / 2, -espesor / 2)
    m.multiply(PIVOTE).multiply(GIRO.makeRotationX(angulo)).multiply(PIVOTE.invert())
    return { visible: entrante ? t >= 0.5 : t < 0.5, aparece: 1 }
  }
  const H = TRANSFORMACION_DEL_PIE.hundido
  if (!entrante) {
    // Se aplana contra su cara: la tecla y los pozos se hunden, y el espesor con ellos.
    m.multiply(GIRO.makeScale(1, 1, 1 - (1 - H.plano) * suave(t / H.aplana)))
    return { visible: t < H.aplana, aparece: 1 }
  }
  // Plana, del lugar y el tamaño de la saliente a los suyos, y después recupera el espesor: el mensaje sale en relieve.
  const u = suave((t - H.aplana) / (H.ajusta - H.aplana))
  const w = suave((t - H.ajusta) / (1 - H.ajusta))
  m.makeTranslation((1 - u) * desde.dx, -(1 - u) * desde.dy, 0)
  m.multiply(GIRO.makeScale(THREE.MathUtils.lerp(desde.ancho / caja.ancho, 1, u), THREE.MathUtils.lerp(desde.alto / caja.alto, 1, u), THREE.MathUtils.lerp(H.plano, 1, w)))
  return { visible: t >= H.aplana, aparece: 1 }
}
