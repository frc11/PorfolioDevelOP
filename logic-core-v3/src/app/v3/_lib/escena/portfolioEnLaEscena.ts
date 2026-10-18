/**
 * [B1] EL PORTFOLIO EN LA ESCENA — lo que la sección le dice a la escena mientras el panel está adentro, y lo que la escena hace
 * con eso: la pose del logo y el oscurecido (plan §5.4 y §5.7; [B1.2b] §12). Un objeto mutable, como `NOCHE_DISPARADA`: la escena
 * no importa nada de las secciones; la sección escribe y el lazo de r3f lee en cada cuadro. Puro (sin three): lo importa la
 * sección, que va en el chunk inicial.
 *
 * ── La pose: un desplazamiento sobre la del scroll, nunca un cambio del progreso (la regla de B5) ──
 *
 * El rig muestrea la pose del scroll y, ANTES de la inercia, la mezcla con la pose del Portfolio (`poseDelPortfolio.ts`, una sola:
 * [B1.2c] de frente al plano del logo, con el logo en su hueco) con un peso que persigue al objetivo por tiempo (`PERSECUCION_DEL_PESO_S`):
 * 0 afuera, 1 con el panel adentro. El progreso no se toca. El mouse sigue encima, como en todo el recorrido.
 *
 * ── El oscurecido: un multiplicador al final del cuadro (ajuste B) ──
 *
 * La exposición del render (`toneMappingExposure`) no llega a todas las capas: las estrellas, los haces, el cielo, el filo, el
 * plano de la luz y la tarjeta van con `toneMapped: false`, y el plasma hace su propio tono. Así que el oscurecido es un cuadro a
 * pantalla completa que multiplica el color por `1 − DIM_DEL_PORTFOLIO · peso`, dibujado último (`OscurecidoDelPortfolio`).
 */

import type { MutableChoreoPose } from './choreographyTypes'

export type PoseDelPortfolio = Pick<MutableChoreoPose, 'angleDeg' | 'height' | 'distance' | 'frameX' | 'frameY'>

/** [B1.2b] Cuánto se oscurece la escena con el panel adentro: una constante (la bandera de B1.2 salió). */
export const DIM_DEL_PORTFOLIO = 0.35

/**
 * [B1.2c] EL HUECO DEL LOGO, en coordenadas del cuadro (−1…1, y hacia arriba): su centro y sus medidas (2 = el cuadro entero). Lo
 * guarda el DOM debajo del título y la bajada (`[data-pieza="hueco-del-logo"]`, la columna que deja el panel): el título y el logo se
 * leen como un bloque, en el mismo eje. La sección lo mide en el escenario y la pose encaja el logo adentro.
 */
export interface HuecoDelLogo {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

/** Sin medir (antes de montar, o en los tests): el medio de la mitad de abajo de la columna, el 70 % de su ancho y el 60 % de su alto. */
export const huecoDeLaColumna = (columna: number): HuecoDelLogo => ({ x: columna - 1, y: -0.5, ancho: 1.4 * columna, alto: 0.6 })

/** Lo que escribe la sección. `adentro` con el panel en el cuadro; `columna`, la fracción del ancho que deja el panel (su CSS). */
export const PORTFOLIO_EN_LA_ESCENA: {
  adentro: boolean
  reducido: boolean
  /** 0,5 desde 1024 (el panel ocupa la mitad); 0,4 abajo (el panel, el 60 %). */
  columna: number
  /** [B1.2c] El hueco medido en el DOM; `null` sin medir (vale el de la columna). */
  hueco: HuecoDelLogo | null
  /** El peso mostrado (0…1): lo escribe el rig, lo lee el oscurecido. */
  peso: number
} = { adentro: false, reducido: false, columna: 0.5, hueco: null, peso: 0 }

/** [B1.2c] El hueco que vale: el medido o, sin medir, el de la columna. */
export const huecoQueVale = (): HuecoDelLogo => PORTFOLIO_EN_LA_ESCENA.hueco ?? huecoDeLaColumna(PORTFOLIO_EN_LA_ESCENA.columna)

/** Cuánto tarda el peso en ir de una punta a la otra (s): la cámara y el oscurecido entran con el panel. */
export const PERSECUCION_DEL_PESO_S = 0.7

/** Un paso del peso hacia su objetivo, a velocidad constante (lo alcanza exacto). Con movimiento reducido, de una. */
export function avanzarElPeso(peso: number, objetivo: number, dt: number, reducido: boolean): number {
  if (reducido) return objetivo
  const tope = Math.max(0, dt) / PERSECUCION_DEL_PESO_S
  const falta = objetivo - peso
  return Math.abs(falta) <= tope ? objetivo : peso + Math.sign(falta) * tope
}

const suave = (t: number): number => t * t * (3 - 2 * t)

/** El ángulo más corto de `a` a `b`, en grados. */
const deltaAngular = (a: number, b: number): number => ((((b - a) % 360) + 540) % 360) - 180

/** La pose mezclada: la del scroll hacia la del Portfolio con el peso (suavizado). */
export function mezclarLaPose(objetivo: MutableChoreoPose, pose: PoseDelPortfolio, peso: number): void {
  if (!(peso > 0)) return
  const w = suave(Math.min(1, peso))
  objetivo.angleDeg += deltaAngular(objetivo.angleDeg, pose.angleDeg) * w
  objetivo.height += (pose.height - objetivo.height) * w
  objetivo.distance += (pose.distance - objetivo.distance) * w
  objetivo.frameX += (pose.frameX - objetivo.frameX) * w
  objetivo.frameY += (pose.frameY - objetivo.frameY) * w
}

/** El multiplicador del color con el panel adentro: 1 − dim · peso. */
export const multiplicadorDelOscurecido = (dim: number, peso: number): number => 1 - Math.min(1, Math.max(0, dim)) * Math.min(1, Math.max(0, peso))
