/**
 * [CIERRE RETOQUE 3D] D1 · LO QUE EL MOUSE LE SUMA A LA CÁMARA, para el DOM — el giro (azimut, grados) y la inclinación
 * (grados: la altura que suma, contra la distancia) del paralaje del mouse (`modulacionDeLaPose.ts`). Lo publica
 * `OrbitRig` en cada cuadro y lo leen los bloques de CSS 3D (los valores de Por qué develOP, las piezas del pie): giran al
 * revés de la cámara, así quedan fijos en el mundo y se les ve la perspectiva y los costados, como a los títulos de la
 * escena. Sin `three`: el DOM lo importa sin arrastrar la escena. Con movimiento reducido el mouse no suma nada: cero.
 */
export interface MiradaDeLaCamara {
  readonly giro: number
  readonly inclinacion: number
}

const mirada = { giro: 0, inclinacion: 0 }
const oyentes = new Set<(m: MiradaDeLaCamara) => void>()

/** Lo escribe `OrbitRig` (sólo si cambió más de una milésima de grado: con el mouse quieto no se llama a nadie). */
export function publicarLaMirada(giro: number, inclinacion: number): void {
  if (Math.abs(giro - mirada.giro) < 1e-3 && Math.abs(inclinacion - mirada.inclinacion) < 1e-3) return
  mirada.giro = giro
  mirada.inclinacion = inclinacion
  oyentes.forEach((f) => f(mirada))
}

export function suscribirALaMirada(f: (m: MiradaDeLaCamara) => void): () => void {
  oyentes.add(f)
  f(mirada)
  return () => {
    oyentes.delete(f)
  }
}

/**
 * La pieza fija en el mundo vista por la cámara de ahora: la cámara se corre a la derecha (el giro sube) y se ve más su
 * costado derecho; sube y se ve más su cara de arriba. El orden: primero la inclinación, como la órbita.
 */
export function giroDeLaPieza(m: MiradaDeLaCamara): string {
  return `rotateX(${m.inclinacion.toFixed(3)}deg) rotateY(${(-m.giro).toFixed(3)}deg)`
}
