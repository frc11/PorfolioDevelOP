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
  /** Cuánto se estira (mayor que 1; [B1] menor que 1 si comprime). */
  readonly k: number
  /** Dónde arranca el tramo y cuánto dura SIN estirar, en px de la regla desde el arranque del progreso del panel. */
  readonly arranque: number
  readonly largo: number
  /**
   * [INT] La parte del tramo (de 0 a 0,5, en cada punta) en la que la velocidad de la escena va de la de afuera a la de adentro en
   * rampa, en vez de saltar en el borde. Sin ella (o 0), el `k` parejo de siempre. Afuera del tramo no cambia nada: recorre lo mismo.
   */
  readonly rampa?: number
}

/** El tramo estirado de esta carga, o ninguno (el producto). */
export const TRAMO_ESTIRADO: { valor: TramoEstirado | null } = { valor: null }

/**
 * Un punto `y` del documento sin el estiramiento: antes del tramo, igual; adentro, a 1/k; después, sin lo agregado.
 * [B1] También comprime (`k < 1`: el selector del Portfolio con el paso de 0,6 mide en el teléfono menos de lo que la escena veía):
 * la misma cuenta, con lo «agregado» negativo. Con `k = 1` (o un `k` que no es un número positivo) no toca nada.
 */
export function sinElEstiramiento(y: number, desde: number, largoEstirado: number, k: number, rampa = 0): number {
  if (!(k > 0) || k === 1 || y <= desde) return y
  if (y > desde + largoEstirado) return y - largoEstirado * (1 - 1 / k)
  const t = y - desde
  const recorre = largoEstirado / k
  // La rampa nunca más larga que la mitad de lo que recorre: así la velocidad del medio es siempre positiva (un tramo que estira mucho
  // tendría que frenar más de lo que recorre) y no se vuelve al escalón.
  const r = Math.min(Math.min(Math.max(rampa, 0), 0.5) * largoEstirado, recorre / 2)
  if (!(r > 0)) return desde + t / k
  // [INT] La velocidad en trapecio: de 1 a `v` en `r`, pareja, y de vuelta a 1 en los últimos `r`; recorre lo mismo que el `k` parejo.
  const v = (recorre - r) / (largoEstirado - r)
  const enRampa = (s: number): number => s + ((v - 1) * s * s) / (2 * r)
  if (t <= r) return desde + enRampa(t)
  if (t <= largoEstirado - r) return desde + enRampa(r) + v * (t - r)
  return desde + recorre - enRampa(largoEstirado - t)
}

/**
 * [NOCTURNO 2026-10-22] Los tramos de las OTRAS secciones que cambian de alto (el Panel, Servicios, las reseñas, Demos…). Cada
 * una anota el suyo con `anotarTramo` y lo suelta con lo que devuelve (al desmontarse, o para volver a anotarlo en un `resize`).
 * El del Portfolio sigue en `TRAMO_ESTIRADO`. Los tramos no se pisan entre sí: cada uno es su sección.
 */
const TRAMOS_ANOTADOS: TramoEstirado[] = []

/** Anota un tramo más; devuelve cómo soltarlo. */
export function anotarTramo(tramo: TramoEstirado): () => void {
  TRAMOS_ANOTADOS.push(tramo)
  return () => {
    const i = TRAMOS_ANOTADOS.indexOf(tramo)
    if (i >= 0) TRAMOS_ANOTADOS.splice(i, 1)
  }
}

// Los tramos de esta lectura, en el documento: se reusan en cada cuadro (sin basura).
const DESDE: number[] = []
const LARGO: number[] = []
const K: number[] = []
const RAMPA: number[] = []

function juntar(t: TramoEstirado, n: number, lectura: number, ventana: number, escala: number): number {
  if (!t.panel.isConnected) return n
  DESDE[n] = t.panel.getBoundingClientRect().top + lectura - ventana + t.arranque * escala
  LARGO[n] = t.k * t.largo * escala
  K[n] = t.k
  RAMPA[n] = t.rampa ?? 0
  return n + 1
}

/**
 * Lo que la escena mide, sin el estiramiento anotado: el scroll `y` y el pie de las secciones (`abajo`). `lectura` es el
 * `scrollY` de la misma lectura en que el llamador midió (el tope del panel se lee con él, como `medirLasSeccionesEn`).
 * Sin tramo anotado devuelve lo mismo que recibió. Escribe en `destino` (la escena lo llama en cada cuadro).
 * [NOCTURNO] Con varios tramos, se descuentan de abajo hacia arriba: cada uno, en coordenadas del documento, sólo corre lo
 * que tiene debajo, así que el de más abajo se descuenta primero y los de arriba ven su propio `desde` intacto.
 */
export function medidaSinElEstiramiento(y: number, abajo: number, lectura: number, ventana: number, destino: { y: number; abajo: number }): { y: number; abajo: number } {
  destino.y = y
  destino.abajo = abajo
  if (!(ventana > 0)) return destino
  const escala = ventana / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
  let n = 0
  if (TRAMO_ESTIRADO.valor !== null) n = juntar(TRAMO_ESTIRADO.valor, n, lectura, ventana, escala)
  for (let i = 0; i < TRAMOS_ANOTADOS.length; i++) n = juntar(TRAMOS_ANOTADOS[i], n, lectura, ventana, escala)
  for (let hechos = 0; hechos < n; hechos++) {
    // El de más abajo que falta (n es chico: a lo sumo uno por sección).
    let j = -1
    for (let i = 0; i < n; i++) if (K[i] === K[i] && (j < 0 || DESDE[i] > DESDE[j])) j = i
    if (j < 0) break
    destino.y = sinElEstiramiento(destino.y, DESDE[j], LARGO[j], K[j], RAMPA[j])
    destino.abajo = sinElEstiramiento(destino.abajo, DESDE[j], LARGO[j], K[j], RAMPA[j])
    K[j] = Number.NaN
  }
  return destino
}
