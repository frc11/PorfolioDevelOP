/**
 * LA FÍSICA DEL CARRUSEL DE DEMOS — pura, sin DOM. **[MÓVIL-TRABAJOS]**
 *
 * Abajo de 1024 las demos no van en el estante: van en una cinta que corre sola y
 * se puede lanzar con el dedo. Cada renglón tiene una velocidad de reposo con su
 * signo; al arrastrar la cinta sigue al dedo 1:1; al soltar toma la velocidad del
 * gesto y esa velocidad RELAJA hacia la de reposo. Lanzada a favor corre más y se
 * frena de a poco hasta su ritmo; lanzada en contra se frena, se detiene y vuelve a
 * su sentido. Todo lo que decide vive acá para que el invariante lo recorra.
 */

export const FISICA_DEL_CARRUSEL = {
  /** px/s de la cinta en reposo. A mano. */
  velocidadDeReposo: 34,
  /** s: cuánto tarda la velocidad en recorrer el 63 % del camino hacia la de reposo. A mano. */
  constanteDeRelajacion: 0.85,
  /** px/s: el tope de un lanzamiento, para que un tirón no la haga desaparecer. */
  tope: 2400,
  /** ms de muestras con los que se mide la velocidad del gesto al soltar. */
  ventanaDelGestoMs: 80,
  /** px antes de decidir si el gesto es horizontal (del carrusel) o vertical (de la página). */
  umbralDeIntencionPx: 8,
  /** Un toque: menos que esto en px y en ms. Todo lo demás es arrastre y no abre nada. */
  toque: { px: 6, ms: 250 },
} as const

/** La velocidad después de `dt` segundos, relajando hacia `reposo`. Exacta: no depende de los cuadros. */
export function relajar(velocidad: number, reposo: number, dtS: number, constante: number = FISICA_DEL_CARRUSEL.constanteDeRelajacion): number {
  return reposo + (velocidad - reposo) * Math.exp(-Math.max(0, dtS) / constante)
}

/** La posición de la pista con la lista duplicada: siempre en [−largo, 0), así el bucle no tiene costura. */
export function envolver(x: number, largo: number): number {
  if (!(largo > 0)) return 0
  const r = x % largo
  return r >= 0 ? r - largo : r
}

export interface Muestra {
  readonly t: number
  readonly x: number
}

/** La velocidad del gesto al soltar: las muestras de los últimos ~80 ms, con tope. */
export function velocidadDelGesto(muestras: readonly Muestra[], ahora: number): number {
  const { ventanaDelGestoMs, tope } = FISICA_DEL_CARRUSEL
  const recientes = muestras.filter((m) => m.t >= ahora - ventanaDelGestoMs)
  if (recientes.length < 2) return 0
  const primera = recientes[0]
  const ultima = recientes[recientes.length - 1]
  const dt = ultima.t - primera.t
  if (!(dt > 0)) return 0
  const v = ((ultima.x - primera.x) / dt) * 1000
  return Math.max(-tope, Math.min(tope, v))
}

/** Hacia dónde va el gesto, o `null` mientras no pasó el umbral. */
export function intencionDelGesto(dx: number, dy: number): 'horizontal' | 'vertical' | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < FISICA_DEL_CARRUSEL.umbralDeIntencionPx) return null
  return Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
}

/** Si lo que pasó entre apoyar y levantar fue un toque. */
export function esUnToque(distanciaPx: number, duracionMs: number): boolean {
  return distanciaPx < FISICA_DEL_CARRUSEL.toque.px && duracionMs < FISICA_DEL_CARRUSEL.toque.ms
}

/** Un cuadro de la cinta suelta: la velocidad relaja y la posición avanza con ella. */
export function avanzarLaCinta(
  estado: { readonly x: number; readonly v: number },
  reposo: number,
  dtS: number,
  largo: number,
): { readonly x: number; readonly v: number } {
  const v = relajar(estado.v, reposo, dtS)
  // La posición integra la velocidad EXACTA del tramo, no la del final: sin eso un
  // lanzamiento avanzaría distinto a 30 que a 120 cuadros por segundo.
  const c = FISICA_DEL_CARRUSEL.constanteDeRelajacion
  const recorrido = reposo * dtS + (estado.v - reposo) * c * (1 - Math.exp(-Math.max(0, dtS) / c))
  return { x: envolver(estado.x + recorrido, largo), v }
}

/**
 * ⚠️ **UNA SOLA FILA PARA LOS DOS RENGLONES — MÓVIL 2.** La posición y la velocidad
 * son de la fila, no de cada renglón: el de arriba las lee con signo `+1` (corre a la
 * derecha) y el de abajo con `−1` (a la izquierda). Arrastrar o lanzar cualquiera de
 * los dos mueve la fila, así que se mueven los dos, como una sola cinta que dobla.
 */
export type SentidoDelRenglon = 1 | -1

export interface EstadoDeLaFila {
  readonly x: number
  readonly v: number
}

/** Dónde se ve un renglón: la posición de la fila con su signo, envuelta en su largo. */
export function posicionDelRenglon(fila: EstadoDeLaFila, sentido: SentidoDelRenglon, largo: number): number {
  return envolver(sentido * fila.x, largo)
}

/** La velocidad con la que se VE un renglón. */
export function velocidadDelRenglon(fila: EstadoDeLaFila, sentido: SentidoDelRenglon): number {
  return sentido * fila.v
}

/** Un dedo sobre un renglón arrastra la fila 1:1, con el signo de ese renglón, desde donde estaba al apoyar. */
export function arrastrarLaFila(xAlApoyar: number, sentido: SentidoDelRenglon, dx: number): EstadoDeLaFila {
  return { x: xAlApoyar + sentido * dx, v: 0 }
}

/** Soltar un renglón lanza la fila con la velocidad del dedo, en el signo de ese renglón. */
export function lanzarLaFila(fila: EstadoDeLaFila, sentido: SentidoDelRenglon, velocidadDelDedo: number): EstadoDeLaFila {
  return { x: fila.x, v: sentido * velocidadDelDedo }
}
