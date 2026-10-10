import * as THREE from 'three'

import { VOLTEO, asientoDelColumpio, caidaDelColumpio, duracionDelVolteo, type VarianteDelVolteo } from '../../formularios/volteo'

/**
 * [PULIDO 9] H2 · LA PLACA DEL FORMULARIO SE TRANSFORMA (en la tarjeta del resultado y de vuelta) — pura: la pose de las dos
 * placas en el tiempo. La saliente (la que estaba) se ve en la primera parte y la entrante (la armada con el DOM nuevo) en la
 * segunda; se cambian de canto, donde el cambio no se ve.
 *
 * [PULIDO 11] B1 · las dos estrategias del volteo (`formularios/volteo.ts`, con las mismas curvas que el DOM). La entrante tiene la
 * caja de la saliente (la tarjeta guarda el alto del formulario): comparten el eje y nada salta en el cambio.
 *   · `centrado`: 180° en un movimiento sobre el eje horizontal del medio de las dos (la saliente hasta 90°; la entrante, el
 *     mismo ángulo menos 180°, de −90° a 0).
 *   · `columpio`: la bisagra en el borde de arriba, compartido. La saliente gira de 0 a 90° hacia el fondo de la sala (cae hacia
 *     arriba y atrás, acelerando); la entrante sale de −90° (de canto, hacia la cámara) y se asienta con el resorte.
 * El hundido se borró. Con movimiento reducido, un fundido (el disuelto de la llegada del pie): la saliente se va y la entrante
 * aparece, quietas. Las poses van en px de la pieza (origen arriba a la izquierda, y hacia arriba, la cara en z = 0 y el dorso en
 * −espesor).
 */
export function duracionDeLaTransformacion(variante: VarianteDelVolteo, quieto: boolean): number {
  return duracionDelVolteo(variante, quieto)
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

/** El ángulo del columpio en `t` (0 a 1 del tiempo entero): de la saliente (0 → π/2) o de la entrante (−π/2 → 0, con el rebote). */
export function anguloDelColumpio(t: number, entrante: boolean): number {
  const C = VOLTEO.columpio
  const total = C.cae + C.asienta
  const s = t * total
  if (!entrante) return (Math.PI / 2) * caidaDelColumpio(s / C.cae)
  // Al final, asentada del todo (el resorte llega a ~0,1°: se termina en su lugar exacto).
  return t >= 1 ? 0 : -(Math.PI / 2) * asientoDelColumpio(s - C.cae)
}

/**
 * La pose en `t` (0 a 1) de la placa saliente (`entrante` falso: con sus medidas, `desde`) o de la entrante (con las suyas,
 * `caja`), escrita en `m`. Devuelve si se ve y cuánto.
 */
export function poseDeLaTransformacion(variante: VarianteDelVolteo, quieto: boolean, t: number, entrante: boolean, caja: Medidas, desde: Desde, espesor: number, m: THREE.Matrix4): VistaDeLaTransformacion {
  // La saliente, en su lugar (va en el grupo de la entrante).
  if (entrante) m.identity()
  else m.makeTranslation(desde.dx, -desde.dy, 0)
  if (quieto) return { visible: entrante ? t > 0 : t < 1, aparece: entrante ? suave(t) : 1 - suave(t) }
  const c = entrante ? caja : desde
  if (variante === 'centrado') {
    // [PULIDO 10] J4 · 180° en UN movimiento: una sola curva para todo el giro (a los 90° no se frena).
    const giro = Math.PI * suave(t)
    PIVOTE.makeTranslation(c.ancho / 2, -c.alto / 2, -espesor / 2)
    m.multiply(PIVOTE).multiply(GIRO.makeRotationX(entrante ? giro - Math.PI : giro)).multiply(PIVOTE.invert())
    return { visible: entrante ? t >= 0.5 : t < 0.5, aparece: 1 }
  }
  // El columpio: la bisagra en el borde de arriba (y = 0), en la mitad del espesor. Se cambian de canto, al terminar la caída.
  const corte = VOLTEO.columpio.cae / (VOLTEO.columpio.cae + VOLTEO.columpio.asienta)
  PIVOTE.makeTranslation(0, 0, -espesor / 2)
  m.multiply(PIVOTE).multiply(GIRO.makeRotationX(anguloDelColumpio(t, entrante))).multiply(PIVOTE.invert())
  return { visible: entrante ? t >= corte : t < corte, aparece: 1 }
}
