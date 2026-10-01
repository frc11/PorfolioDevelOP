/**
 * [INTERFAZ 2] T4 · EL INFINITO DEL RECORRIDO — lo puro del indicador (`InfinitoDelRecorrido.tsx`): la lemniscata y el
 * porcentaje. Lo prueba `s38-interfaz2` sin navegador.
 *
 * [Cierre de INTERFAZ 2] Las dos variantes (el logo que se dibuja y el reloj del día) y la navegación por secciones se
 * borraron: el menú ya navega. Queda un símbolo de infinito —no el logo— que se completa con el recorrido de la página.
 *
 * La curva es la LEMNISCATA DE BERNOULLI, `x = a·cos t / (1 + sen² t)`, `y = a·sen t·cos t / (1 + sen² t)`, recorrida
 * desde el cruce del centro (t = π/2): el lazo de la izquierda, otra vez el centro, el de la derecha y de vuelta al
 * centro (t = π/2 + 2π). Así el trazo arranca y termina en el mismo punto: al 100 % el infinito se cierra.
 */

/** La mitad del ancho de la curva, en unidades de su `viewBox`. */
export const SEMIEJE = 48
/** Las unidades de aire alrededor de la curva (el grueso del trazo y sus puntas redondeadas no se recortan). */
const AIRE = 4
/** Cuántos tramos rectos aproximan la curva (a 64 px de ancho, cada uno mide menos de un píxel y medio). */
export const TRAMOS = 160

/** El punto de la lemniscata en el parámetro `t`. */
export function puntoDeLaLemniscata(t: number, a: number = SEMIEJE): readonly [number, number] {
  const s = Math.sin(t)
  const c = Math.cos(t)
  const d = 1 + s * s
  return [(a * c) / d, (a * s * c) / d]
}

/** El trazo entero, desde el cruce del centro, por el lazo de la izquierda y después el de la derecha. */
export function trazoDeLaLemniscata(tramos: number = TRAMOS, a: number = SEMIEJE): string {
  const partes: string[] = []
  for (let k = 0; k <= tramos; k += 1) {
    const [x, y] = puntoDeLaLemniscata(Math.PI / 2 + (k / tramos) * 2 * Math.PI, a)
    partes.push(`${k === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return partes.join(' ')
}

export const TRAZO_DEL_INFINITO = trazoDeLaLemniscata()

/** El `viewBox` de la curva: el ancho de los dos lazos y el alto de su panza más ancha (a/(2√2)), con aire. */
export const CAJA_DEL_INFINITO = (() => {
  const alto = SEMIEJE / (2 * Math.SQRT2)
  return `${String(-SEMIEJE - AIRE)} ${(-alto - AIRE).toFixed(2)} ${String(2 * (SEMIEJE + AIRE))} ${(2 * (alto + AIRE)).toFixed(2)}`
})()

/** El avance de la página (0 → 1) como porcentaje entero, acotado: lo que dice el número de abajo. */
export function porcentajeDelRecorrido(p: number): number {
  return Math.round(Math.max(0, Math.min(1, p)) * 100)
}

/** Lo que se escribe abajo: el número y el signo, con un espacio fino que no se corta (la norma: «37 %»). */
export function textoDelPorcentaje(p: number): string {
  return `${String(porcentajeDelRecorrido(p))} %`
}
