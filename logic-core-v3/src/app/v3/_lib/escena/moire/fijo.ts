import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../probeMoire'

/**
 * [B8] EL MOIRÉ QUIETO — puro: las cuatro variantes de `?moire=` y lo único que todavía se mueve (la rendija del mouse).
 *
 * **Lo que mareaba** (CIERRE-HOME-V3, B8): el moiré se movía con la cámara y se aceleraba con el scroll. Tenía dos causas:
 * - **el paralaje:** las dos capas en radios distintos (la fina en 38, la gruesa en 44) se desalinean con cada pose de la
 *   cámara, y el batido corre de 6 a 12 veces más rápido que la pared (`probeMoire.ts`);
 * - **el moiré vivo de ESCENA 5** (M1a a M4): la gruesa bajaba sola, el scroll la aceleraba (M2), el pulso corría la fina
 *   (M3) y el desajuste cambiaba con el progreso (M4). Se borró, con la deriva que el rig le escribía a la gruesa.
 *
 * **Ahora ninguna variante lee la cámara, el scroll ni el reloj:**
 * - `0`: sin trama (ni las capas ni su zócalo; lo que la leía —las estrellas, la fugaz, los haces y la luz del amanecer—
 *   deja de verla: `estrellas/trama.ts`).
 * - `1`: una rendija, la gruesa (la retícula del hero), en la pared y quieta.
 * - `2` (el defecto): las dos, quietas y en la MISMA superficie (la fina pasa a la pared). Coplanares, el batido queda
 *   pintado en la pared y no depende de desde dónde se lo mira. Sin paralaje queda sólo el batido de la textura, `desajuste`
 *   bandas por vuelta: con el de siempre (2) entrarían 0,4 a 0,5 bandas a lo ancho del cuadro; con 6, 1,2 a 1,6 (hoy, 1 a 2; `s78-b8`).
 * - `mouse`: la de `1`, corrida por el puntero (`MOUSE_DEL_MOIRE`): suave y con tope chico.
 */
export const VARIANTES_DEL_MOIRE = ['0', '1', '2', 'mouse'] as const

export type VarianteDelMoire = (typeof VARIANTES_DEL_MOIRE)[number]

/** El defecto: el moiré de siempre (las dos rendijas), sin nada que lo mueva. */
export const MOIRE_POR_DEFECTO: VarianteDelMoire = '2'

/** La variante de un valor de `?moire=` (o del pedido del banco); cualquier otro, el defecto. */
export function varianteDelMoire(valor: string | null | undefined): VarianteDelMoire {
  return VARIANTES_DEL_MOIRE.find((v) => v === valor) ?? MOIRE_POR_DEFECTO
}

/** Una capa: si se dibuja y en qué radio (su banda y su paso vertical salen del radio en `MoireScreen`). */
export interface CapaDelMoire {
  readonly dibuja: boolean
  readonly radio: number
}

export interface DisposicionDelMoire {
  readonly gruesa: CapaDelMoire
  readonly fina: CapaDelMoire
  /** El desajuste de la fina cuando la variante lo fija (las coplanares); si no, el del store (el de siempre, 2). */
  readonly desajuste: number | null
  /** La capa que sigue al mouse, o ninguna. */
  readonly sigueAlMouse: 'gruesa' | 'fina' | null
}

/** `2`: el desajuste de las dos coplanares (bandas por vuelta; entero: las dos tramas cierran alrededor del cilindro). */
export const DESAJUSTE_COPLANAR = 6

const EN_LA_PARED: CapaDelMoire = { dibuja: true, radio: MOIRE_FAR_RADIUS }
const SIN_LA_FINA: CapaDelMoire = { dibuja: false, radio: MOIRE_NEAR_RADIUS }

const DISPOSICIONES: Readonly<Record<VarianteDelMoire, DisposicionDelMoire>> = {
  '0': { gruesa: { dibuja: false, radio: MOIRE_FAR_RADIUS }, fina: SIN_LA_FINA, desajuste: null, sigueAlMouse: null },
  '1': { gruesa: EN_LA_PARED, fina: SIN_LA_FINA, desajuste: null, sigueAlMouse: null },
  '2': { gruesa: EN_LA_PARED, fina: EN_LA_PARED, desajuste: DESAJUSTE_COPLANAR, sigueAlMouse: null },
  mouse: { gruesa: EN_LA_PARED, fina: SIN_LA_FINA, desajuste: null, sigueAlMouse: 'gruesa' },
}

/** Qué capas dibuja una variante, dónde y cuál sigue al mouse (siempre el mismo objeto por variante). */
export function disposicionDelMoire(v: VarianteDelMoire): DisposicionDelMoire {
  return DISPOSICIONES[v]
}

/**
 * `mouse`: cuánto se corre la rendija con el puntero en un borde de la ventana, en grados de vuelta vistos desde el eje, a lo
 * ancho y a lo alto (la celda es cuadrada: un grado es la misma fracción de celda en las dos direcciones). 1° es 0,14 de
 * celda gruesa: de 14 a 19 px a 1440×900 en todo el recorrido (medido en `s78-b8`). Lo suaviza el amortiguador del puntero de la
 * cámara (`MOUSE_TAU`, 0,45 s), en `MoireDelMouse.tsx`.
 */
export const MOUSE_DEL_MOIRE = { topeGrados: 1 } as const

const enRango = (x: number): number => Math.min(1, Math.max(-1, x))

/**
 * El corrimiento de la textura de una capa de `celdas` por vuelta para un puntero (de −1 a 1, ya suavizado), escrito en
 * `destino` (sin reservas): hacia donde va el puntero, con tope. Desde adentro del cilindro la vuelta crece hacia la izquierda
 * de la pantalla y la textura corrida en `+x` se ve corrida a la derecha; en `+y`, hacia abajo.
 */
export function corrimientoPorElMouse(destino: { x: number; y: number }, puntero: { readonly x: number; readonly y: number }, celdas: number): void {
  const tope = (MOUSE_DEL_MOIRE.topeGrados / 360) * celdas
  destino.x = tope * enRango(puntero.x)
  destino.y = -tope * enRango(puntero.y)
}
