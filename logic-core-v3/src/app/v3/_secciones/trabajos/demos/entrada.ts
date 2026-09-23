import { CAPA_DEL_VACIO, pxDelTunelEn } from '../geometria'
import { fraccionDelVacio, poseDelTunel } from '../tunel'

/**
 * LA ENTRADA A DEMOS — el vacío crece solo y después LLEGAN las cosas. **[DEMOS]**
 *
 * ── El reloj: la fracción del vacío, no el tiempo ─────────────────────────
 *
 * `escalaDeDemos` es la fracción del vacío —la misma recta con clamp, sobre la
 * misma tabla— y es el ÚNICO reloj de la llegada: todo lo de abajo es una función
 * pura de ella. Scrolleando para arriba se deshace exacto y al revés, y el
 * sobrepaso elástico de los libros no es un resorte con tiempo propio sino la
 * FORMA de su curva sobre su tramo.
 *
 * ⚠️ **SE CALCULA DESDE `mostrado`, NO DESDE EL SCROLL.** `CapaDelTunel` publica en
 * `mostrado` el progreso que su resorte muestra y pinta el vacío con ese valor. La
 * única diferencia es el píxel del ESCENARIO, que lleva su propio resorte; pero su
 * capa topa en 1.420 de la regla y el vacío arranca después de 2.290, así que en
 * todo el tramo del vacío la fracción es bit a bit la misma.
 *
 * ── La coreografía (el pedido la propuso; se construyó tal cual) ─────────
 *
 *   0 – 60 %   sólo crece el vacío: por el agujero se ve la escena, nada más.
 *   60 – 72 %  el título sube renglón por renglón desde su línea base (P1, el
 *              gesto de la casa).
 *   68 – 80 %  el párrafo, con el gesto del cuerpo de la casa (P2).
 *   72 – 100 % los libros, de izquierda a derecha y uno detrás del otro: entran
 *              desde abajo con un sobrepaso elástico al asentarse y un leve giro
 *              que se acomoda. El último se asienta EXACTAMENTE en el 100 %, que
 *              es cuando el vacío llena el cuadro.
 *
 * Ya no hay recuadro que escala: la capa está en su lugar desde el principio y lo
 * que la muestra es el agujero. Lo rígido era eso.
 */
export function escalaDeDemos(mostrado: number): number {
  const px = pxDelTunelEn(mostrado)
  return fraccionDelVacio(poseDelTunel(px), CAPA_DEL_VACIO, px)
}

export interface Tramo {
  readonly desde: number
  readonly hasta: number
}

export const LLEGADA = {
  titulo: { desde: 0.6, hasta: 0.72 },
  parrafo: { desde: 0.68, hasta: 0.8 },
  libros: { desde: 0.72, hasta: 1 },
} as const

/** Cuánto del recorrido del vacío dura la llegada de UN libro. Se pisan: el siguiente sale antes. */
export const TRAMO_DE_UN_LIBRO = 0.14

/** Qué tan abajo empieza un libro, en su propio alto, y cuánto giro trae. */
export const LIBRO_QUE_LLEGA = { abajo: 110, giro: -9 } as const

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))

/** Cuánto va de un tramo en la fracción `u` del vacío. */
export function enElTramo(u: number, tramo: Tramo): number {
  return acotar01((u - tramo.desde) / (tramo.hasta - tramo.desde))
}

/** El tramo del libro `i` de `n`: el primero sale en 72 % y el último termina en 100 % exacto. */
export function tramoDelLibro(i: number, n: number): Tramo {
  const paso = n > 1 ? (LLEGADA.libros.hasta - LLEGADA.libros.desde - TRAMO_DE_UN_LIBRO) / (n - 1) : 0
  const desde = LLEGADA.libros.desde + i * paso
  return { desde, hasta: i === n - 1 ? LLEGADA.libros.hasta : desde + TRAMO_DE_UN_LIBRO }
}

/** easeOutBack: pasa de 1 y vuelve. El sobrepaso es la forma de la curva, no un rebote con reloj. */
export function conSobrepaso(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  const u = acotar01(t) - 1
  return 1 + c3 * u * u * u + c1 * u * u
}

/** La pose de un libro a `t` de su tramo. En 1, en su lugar y sin transformada. */
export function poseDelLibro(t: number): { readonly transform: string; readonly opacidad: number } {
  const u = acotar01(t)
  if (u >= 1) return { transform: 'none', opacidad: 1 }
  const y = (1 - conSobrepaso(u)) * LIBRO_QUE_LLEGA.abajo
  const giro = LIBRO_QUE_LLEGA.giro * (1 - u) ** 3
  return { transform: `translateY(${y.toFixed(3)}%) rotate(${giro.toFixed(3)}deg)`, opacidad: acotar01(u / 0.2) }
}
