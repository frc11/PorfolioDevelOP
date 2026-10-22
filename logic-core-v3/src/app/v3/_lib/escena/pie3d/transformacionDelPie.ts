import * as THREE from 'three'

import { HUNDIMIENTO_DEL_PIE, duracionDelCambioDelPie, pisoDelHundimiento } from '../../formularios/volteo'

// [B10] La curva del hundimiento vive sin three (`formularios/volteo.ts`): la usa también el FAQ del pie, en el DOM.
export { HUNDIMIENTO_DEL_PIE, pisoDelHundimiento }

/**
 * [PULIDO 9] H2 · LA PLACA DEL FORMULARIO SE TRANSFORMA (en la tarjeta del resultado y de vuelta) — pura: la pose de las dos
 * placas en el tiempo. La saliente (la que estaba) se ve en la primera parte y la entrante (la armada con el DOM nuevo) en la
 * segunda; se cambian donde el cambio no se ve.
 *
 * [PULIDO 11] B1 · el volteo con las mismas curvas que el DOM (`formularios/volteo.ts`): la entrante tiene la caja de la saliente
 * (la tarjeta guarda el alto del formulario): comparten el eje y nada salta en el cambio. [PULIDO 13] · el columpio se borró. Con
 * movimiento reducido, un fundido (el disuelto de la llegada del pie): la saliente se va y la entrante aparece, quietas. Las poses van en
 * px de la pieza (origen arriba a la izquierda, y hacia arriba, la cara en z = 0 y el dorso en −espesor).
 *
 * [PULIDO 22] T2 c · en el pie se hundía por su hueco y se disolvía en el fondo (una mancha gris borrosa). [PULIDO 27] Y1 c · se derretía
 * en el piso y lo nuevo nacía del charco.
 * [PULIDO 28] AA2 · EL HUNDIMIENTO, NÍTIDO (el derretido se descartó): la placa baja por su hueco `espesores` espesores sobre la PLATAFORMA
 * del pozo (su fondo la acompaña: `huecosDeLaCaida.ts`), entera y sin disolverse (`baja`: la parte del tiempo bajando); el piso se CIERRA
 * sobre ella con sus bloques (la silueta se achica, como antes de un viaje) y a cubierto se cambian, a la mitad del tiempo; el piso se abre
 * y la plataforma sube con la otra hasta su lugar exacto. Las paredes, las de los bloques del borde y el pozo (`pozos.ts`). Sin tramado ni
 * geometría fantasma. El DOM de abajo de 1025 y el panel de Contacto siguen con el volteo (`formularios/volteo.ts`).
 */
export function duracionDeLaTransformacion(quieto: boolean): number {
  return duracionDelCambioDelPie(quieto)
}

/** [PULIDO 28] AA2 · la plataforma de la placa del formulario en este cuadro: lo que bajó (px de la pieza) y cuánto se cerró el piso (0 a 1). */
export const PLATAFORMA_EN_VIVO = { hundido: 0, cerrado: 0 }

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
  // Hacia atrás de su cara: acostada, hacia abajo por su hueco.
  m.multiply(BAJA.makeTranslation(0, 0, -espesor * HUNDIMIENTO_DEL_PIE.espesores * pisoDelHundimiento(t).baja))
  return { visible: entrante ? t >= 0.5 : t < 0.5, aparece: 1 }
}

/** [PULIDO 28] AA2 · un cuadro de la transformación en el piso: la plataforma de la placa del formulario (sin transformación, en cero). */
export function hundimientoDelPiso(quieto: boolean, t: number, espesor: number): void {
  const p = quieto || t >= 1 ? { baja: 0, cerrado: 0 } : pisoDelHundimiento(t)
  PLATAFORMA_EN_VIVO.hundido = espesor * HUNDIMIENTO_DEL_PIE.espesores * p.baja
  PLATAFORMA_EN_VIVO.cerrado = p.cerrado
}
