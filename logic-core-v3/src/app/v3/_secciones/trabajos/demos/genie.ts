/**
 * EL GENIE DE macOS — la geometría, pura. **[DEMOS]**
 *
 * La ventana se parte en tiras horizontales; cada tira es un cuadrilátero cuyos
 * cuatro vértices salen de dos funciones de la FILA de contenido `v` (0 arriba, 1
 * abajo) y del progreso de minimizar `m` (0 plana, 1 adentro del destino):
 *
 *   · **el embudo** (`c`, de 0 a 0,55 de `m`): la fila que lidera —la de abajo si
 *     el destino está debajo del centro— se tira hacia el ancho y el lado del
 *     destino, y la deformación SUBE por la ventana: el perfil es un `smoothstep`
 *     que arranca pegado al borde líder y se abre hasta cubrir el alto entero. Por
 *     eso un borde se vuelve una curva en S y el otro casi no se mueve: el que
 *     queda del lado del destino recorre poco. **El lado que se curva no se fija:
 *     sale de dónde está el destino.**
 *   · **el deslizamiento** (`s`, de 0,25 a 1 de `m`, solapado): cada fila viaja a
 *     su fila del destino, las líderes primero. Las de atrás todavía no salieron,
 *     así que las filas se COMPRIMEN más cuanto más cerca están del destino; al
 *     final baja y se angosta también el borde de arriba, y queda una franja.
 *
 * Abrir es la misma función recorrida al revés, con el destino en el libro.
 *
 * ⚠️ **CADA TIRA ES UN CUADRILÁTERO, NO UN RECTÁNGULO.** Un rectángulo por fila
 * dibuja los bordes curvos como una escalera; una transformada proyectiva
 * (`matrix3d`, la de Heckbert para un cuadrado sobre un cuadrilátero) une los
 * vértices de fila a fila con segmentos, y con 60 tiras la curva es continua.
 */

export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface Punto {
  readonly x: number
  readonly y: number
}

export type Lider = 'abajo' | 'arriba'

/** Las tiras del Genie. 60 sobre 720 px de ventana: una cada 12 px. */
export const TIRAS_DEL_GENIE = 60
/** Cuánto dura, de punta a punta. El pedido: 500–600 ms. */
export const MS_DEL_GENIE = 560
/** Las dos fases, solapadas: el embudo se forma primero y la ventana se desliza después. */
export const FASES_DEL_GENIE = { embudo: { desde: 0, hasta: 0.55 }, deslizamiento: { desde: 0.25, hasta: 1 } } as const
/** Cuánto de su camino vertical hace la fila líder mientras se forma el embudo: el cuello apunta al destino. */
const TIRON_VERTICAL_DEL_EMBUDO = 0.3
/** Qué tan escalonado es el deslizamiento: con 1, la fila líder llega a mitad de tiempo y la última al final. */
const ESCALONADO = 1

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))
const mezclar = (a: number, b: number, t: number): number => a + (b - a) * t
export const suave = (t: number): number => {
  const u = acotar01(t)
  return u * u * (3 - 2 * u)
}
const entre = (desde: number, hasta: number, x: number): number => suave((x - desde) / (hasta - desde))

/** Qué borde lidera: el del lado vertical del destino respecto del centro de la ventana. */
export function liderDelGenie(ventana: Caja, destino: Caja): Lider {
  return destino.y + destino.alto / 2 >= ventana.y + ventana.alto / 2 ? 'abajo' : 'arriba'
}

export interface FilaDelGenie {
  readonly y: number
  readonly izquierda: number
  readonly derecha: number
}

/** La fila `v` del contenido en el progreso `m` de minimizar. */
export function filaDelGenie(v: number, m: number, ventana: Caja, destino: Caja, lider: Lider): FilaDelGenie {
  const w = lider === 'abajo' ? v : 1 - v
  const c = entre(FASES_DEL_GENIE.embudo.desde, FASES_DEL_GENIE.embudo.hasta, m)
  const s = entre(FASES_DEL_GENIE.deslizamiento.desde, FASES_DEL_GENIE.deslizamiento.hasta, m)
  // El embudo: el perfil arranca pegado al borde líder y sube hasta cubrir el alto.
  const embudo = c * (c <= 0 ? 0 : entre(1 - c, 1, w))
  // El deslizamiento: las filas líderes salen primero.
  const viaje = suave(s * (1 + ESCALONADO) - ESCALONADO * (1 - w))
  const angosta = Math.max(embudo, viaje)
  const baja = Math.max(embudo * TIRON_VERTICAL_DEL_EMBUDO, viaje)
  return {
    y: mezclar(ventana.y + v * ventana.alto, destino.y + v * destino.alto, baja),
    izquierda: mezclar(ventana.x, destino.x, angosta),
    derecha: mezclar(ventana.x + ventana.ancho, destino.x + destino.ancho, angosta),
  }
}

/** Las cuatro esquinas de la tira `i`: arriba-izq, arriba-der, abajo-der, abajo-izq. */
export function esquinasDeLaTira(
  i: number,
  tiras: number,
  m: number,
  ventana: Caja,
  destino: Caja,
  lider: Lider,
  solape: number,
): readonly [Punto, Punto, Punto, Punto] {
  const arriba = filaDelGenie(i / tiras, m, ventana, destino, lider)
  const abajo = filaDelGenie(Math.min(1, (i + 1) / tiras + solape), m, ventana, destino, lider)
  return [
    { x: arriba.izquierda, y: arriba.y },
    { x: arriba.derecha, y: arriba.y },
    { x: abajo.derecha, y: abajo.y },
    { x: abajo.izquierda, y: abajo.y },
  ]
}

/**
 * La transformada proyectiva que lleva el rectángulo `ancho × alto` (con origen
 * arriba a la izquierda) sobre el cuadrilátero, como `matrix3d` de CSS.
 * Heckbert, «Fundamentals of Texture Mapping»: cuadrado unitario → cuadrilátero.
 */
export function matrizDeLaTira(esquinas: readonly [Punto, Punto, Punto, Punto], ancho: number, alto: number): string {
  const [p0, p1, p2, p3] = esquinas
  const sx = p0.x - p1.x + p2.x - p3.x
  const sy = p0.y - p1.y + p2.y - p3.y
  let a: number
  let b: number
  let d: number
  let e: number
  let g = 0
  let h = 0
  if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) {
    a = p1.x - p0.x
    b = p2.x - p1.x
    d = p1.y - p0.y
    e = p2.y - p1.y
  } else {
    const dx1 = p1.x - p2.x
    const dx2 = p3.x - p2.x
    const dy1 = p1.y - p2.y
    const dy2 = p3.y - p2.y
    const den = dx1 * dy2 - dx2 * dy1
    g = (sx * dy2 - dx2 * sy) / den
    h = (dx1 * sy - sx * dy1) / den
    a = p1.x - p0.x + g * p1.x
    b = p3.x - p0.x + h * p3.x
    d = p1.y - p0.y + g * p1.y
    e = p3.y - p0.y + h * p3.y
  }
  const n = (x: number): string => (Number.isFinite(x) ? Number(x.toPrecision(10)).toString() : '0')
  // Del cuadrado unitario al rectángulo de la tira: se divide cada columna por su lado.
  return `matrix3d(${n(a / ancho)},${n(d / ancho)},0,${n(g / ancho)},${n(b / alto)},${n(e / alto)},0,${n(h / alto)},0,0,1,0,${n(p0.x)},${n(p0.y)},0,1)`
}

/** Aplica la transformada proyectiva a un punto: para el invariante. */
export function proyectar(esquinas: readonly [Punto, Punto, Punto, Punto], ancho: number, alto: number, x: number, y: number): Punto {
  const m = matrizDeLaTira(esquinas, ancho, alto).slice('matrix3d('.length, -1).split(',').map(Number)
  const X = m[0] * x + m[4] * y + m[12]
  const Y = m[1] * x + m[5] * y + m[13]
  const W = m[3] * x + m[7] * y + m[15]
  return { x: X / W, y: Y / W }
}
