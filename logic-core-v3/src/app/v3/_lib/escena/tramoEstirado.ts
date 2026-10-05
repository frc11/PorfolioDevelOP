import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../navegacion'

/**
 * [AJUSTES FINALES] B1 · UN TRAMO DE SCROLL QUE LA TABLA NO DECLARA — y cómo la escena lo descuenta (REGLA DE ALTURAS).
 *
 * El mapeo de la escena es PROPORCIONAL a la extensión de las secciones (`pantallaDeScroll`, `anclaje.ts`): si una
 * sección mide más de lo que declara `secciones.ts`, TODO lo que viene después llega tarde (así se corrieron Portfolio y
 * «Seis razones»). [CIERRE] 1C: desde 1024 el túnel de Trabajos se estira por un factor `k` (1,8 en el producto desde
 * [EL ENCASTRE] 1A) y la sección crece lo que el túnel se estiró (`_secciones/trabajos/estiramiento.ts`); la tabla
 * declara el alto sin estirar (abajo de 1024 el `k` es otro). Así que el que estira se anota acá, y la
 * escena mide el scroll COMO SI NO ESTUVIERA ESTIRADO: antes del tramo, igual; adentro, a 1/k (la sala avanza al ritmo
 * de la tabla, que es el del túnel); después, sin lo que se agregó. Afuera del túnel el progreso es bit a bit el de
 * siempre: Portfolio, la frase, el amanecer y la noche no se mueven (s49 1C lo afirma sobre el mapeo).
 *
 * El tramo se cuenta como lo cuenta el túnel (`trabajos/ritmo.ts`): en px de la regla —contra 900 de alto— desde que
 * arranca el progreso del panel, que es un alto de ventana antes de su tope (el ancla del bloque P7).
 */
export interface TramoEstirado {
  /** El panel estirado (`data-panel`): de su tope sale dónde está el tramo en el documento. */
  readonly panel: Element
  /** Cuánto se estira (mayor que 1). */
  readonly k: number
  /** Dónde arranca el tramo y cuánto dura SIN estirar, en px de la regla desde el arranque del progreso del panel. */
  readonly arranque: number
  readonly largo: number
}

/** El tramo estirado de esta carga, o ninguno (el producto). */
export const TRAMO_ESTIRADO: { valor: TramoEstirado | null } = { valor: null }

/** Un punto `y` del documento sin el estiramiento: antes del tramo, igual; adentro, a 1/k; después, sin lo agregado. */
export function sinElEstiramiento(y: number, desde: number, largoEstirado: number, k: number): number {
  if (!(k > 1) || y <= desde) return y
  if (y <= desde + largoEstirado) return desde + (y - desde) / k
  return y - largoEstirado * (1 - 1 / k)
}

/**
 * Lo que la escena mide, sin el estiramiento anotado: el scroll `y` y el pie de las secciones (`abajo`). `lectura` es el
 * `scrollY` de la misma lectura en que el llamador midió (el tope del panel se lee con él, como `medirLasSeccionesEn`).
 * Sin tramo anotado devuelve lo mismo que recibió. Escribe en `destino` (la escena lo llama en cada cuadro).
 */
export function medidaSinElEstiramiento(y: number, abajo: number, lectura: number, ventana: number, destino: { y: number; abajo: number }): { y: number; abajo: number } {
  const t = TRAMO_ESTIRADO.valor
  destino.y = y
  destino.abajo = abajo
  if (t === null || !t.panel.isConnected || !(ventana > 0)) return destino
  const escala = ventana / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
  const desde = t.panel.getBoundingClientRect().top + lectura - ventana + t.arranque * escala
  const largo = t.k * t.largo * escala
  destino.y = sinElEstiramiento(y, desde, largo, t.k)
  destino.abajo = sinElEstiramiento(abajo, desde, largo, t.k)
  return destino
}
