import { CAPA_DEL_VACIO, pxDelTunelEn } from '../geometria'
import { fraccionDelVacio, poseDelTunel } from '../tunel'

/**
 * LA ENTRADA A DEMOS — la sección crece adentro del vacío. **[PORTFOLIO · DEMOS]**
 *
 * ⚠️ **SIN LEY NUEVA.** La escala de la capa de demos ES la fracción del vacío:
 * la misma recta con clamp, sobre la misma tabla, con la misma cadena del CTA. El
 * vacío es un agujero centrado del tamaño `fraccion` del cuadro; la capa de demos
 * es el cuadro entero escalado por `fraccion` desde el centro. Las dos cajas
 * coinciden en cada cuadro, así que lo que se ve por el agujero es la sección de
 * demos entera, chica, y llega a 1 EXACTAMENTE cuando el vacío llena el cuadro.
 *
 * ⚠️ **SE CALCULA DESDE `mostrado`, NO DESDE EL SCROLL.** `CapaDelTunel` publica
 * en `mostrado` el progreso que su resorte muestra, y pinta el vacío con ese mismo
 * valor. La única diferencia con lo que pinta es el píxel del ESCENARIO, que lleva
 * su propio resorte; pero su capa topa en 1.420 de la regla y el vacío arranca
 * después de 2.290, así que en todo el tramo del vacío el escenario ya vale su
 * tope en los dos cálculos y la fracción es bit a bit la misma.
 */
export function escalaDeDemos(mostrado: number): number {
  const px = pxDelTunelEn(mostrado)
  return fraccionDelVacio(poseDelTunel(px), CAPA_DEL_VACIO, px)
}

/** La transformada de la capa: escala desde el centro, y cero no pinta ni recibe un clic. */
export function transformDeDemos(escala: number): string {
  return `scale(${escala.toFixed(5)})`
}
