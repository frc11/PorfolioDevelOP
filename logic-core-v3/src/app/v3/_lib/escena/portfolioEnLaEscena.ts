/**
 * [B1] EL PORTFOLIO EN LA ESCENA — lo que la sección le dice a la escena mientras el panel está adentro, y lo que la escena hace
 * con eso: la pose del logo y el oscurecido (plan §5.4 y §5.7, ajuste B). Un objeto mutable, como `NOCHE_DISPARADA`: la escena no
 * importa nada de las secciones; la sección escribe y el lazo de r3f lee en cada cuadro.
 *
 * ── La pose: un desplazamiento sobre la del scroll, nunca un cambio del progreso (la regla de B5) ──
 *
 * El rig muestrea la pose del scroll y, ANTES de la inercia, la mezcla con la pose del Portfolio con un peso que persigue al
 * objetivo por tiempo (`PERSECUCION_DEL_PESO_S`): 0 afuera, 1 con el panel adentro. El progreso no se toca: el anclaje, el arco y
 * los invariantes que descansan en él no se enteran. El mouse sigue encima, como en todo el recorrido.
 *
 * ── El oscurecido: un multiplicador al final del cuadro (ajuste B) ──
 *
 * La exposición del render (`toneMappingExposure`) no llega a todas las capas: las estrellas, los haces, el cielo, el filo, el
 * plano de la luz y la tarjeta van con `toneMapped: false`, y el plasma hace su propio tono. Así que el oscurecido es un cuadro a
 * pantalla completa que multiplica el color por `1 − dim · peso`, dibujado último (`OscurecidoDelPortfolio`), y el «?» de «la tuya»
 * se dibuja después, sin oscurecer (`SignoDeLaTuya`).
 */

import type { MutableChoreoPose } from './choreographyTypes'

export type PoseDelPortfolio = Pick<MutableChoreoPose, 'angleDeg' | 'height' | 'distance' | 'frameX' | 'frameY'>
export type VarianteDeLaCamara = 'a' | 'b' | 'c'

/**
 * Las poses del logo con el panel adentro: abajo y del lado del texto, a ~25 % del ancho. Calibradas con el arnés puro de la caja
 * del logo (`s10-logo-lectura`: `conPose` + `cajaDelLogo`, sin navegador), en coordenadas del cuadro de −1 a 1:
 *
 *   a (producto)  x −0,79…−0,30 · y −0,80…−0,21 a 1440 × 900; x −0,79…−0,20 a 1024 × 768
 *   b             x −0,77…−0,27 · y −0,76…−0,24 (el azimut de Trabajos: la entrada más corta)
 *   c             x −0,82…−0,39 · y −0,80…−0,31 (el logo más chico)
 *
 * Con el cuadro vertical (la tablet parada, 820 × 1180) la apaisada lo mete debajo del panel (que ocupa el 60 % de la derecha): ahí va
 * `POSE_VERTICAL` (x −0,84…−0,30 · y −0,70…−0,44). La escena elige por el aspecto de su lienzo, que es suyo.
 */
export const POSES_DEL_PORTFOLIO: Readonly<Record<VarianteDeLaCamara, PoseDelPortfolio>> = {
  a: { angleDeg: 210, height: 8.5, distance: 24, frameX: -0.9, frameY: -0.9 },
  b: { angleDeg: 195, height: 5.5, distance: 28, frameX: -0.8, frameY: -0.9 },
  c: { angleDeg: 200, height: 6, distance: 32, frameX: -0.9, frameY: -0.9 },
}
export const POSE_VERTICAL: PoseDelPortfolio = { angleDeg: 195, height: 5.5, distance: 56, frameX: -0.9, frameY: -0.8 }

/** La pose para un aspecto del lienzo: la de la variante si es apaisado, la vertical si no. */
export const poseParaElAspecto = (variante: VarianteDeLaCamara, aspecto: number): PoseDelPortfolio => (aspecto >= 1 ? POSES_DEL_PORTFOLIO[variante] : POSE_VERTICAL)

/** Lo que escribe la sección. `adentro` con el panel en el cuadro; `lado` espeja el encuadre; `dim` es la bandera (0…0,8). */
export const PORTFOLIO_EN_LA_ESCENA: {
  adentro: boolean
  dim: number
  lado: 'der' | 'izq'
  camara: VarianteDeLaCamara
  reducido: boolean
  /** El peso mostrado (0…1): lo escribe el rig, lo lee el oscurecido. */
  peso: number
} = { adentro: false, dim: 0, lado: 'der', camara: 'a', reducido: false, peso: 0 }

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

/** La pose mezclada: la del scroll hacia la del Portfolio con el peso (suavizado). `izq` espeja el encuadre horizontal. */
export function mezclarLaPose(objetivo: MutableChoreoPose, pose: PoseDelPortfolio, peso: number, lado: 'der' | 'izq'): void {
  if (!(peso > 0)) return
  const w = suave(Math.min(1, peso))
  objetivo.angleDeg += deltaAngular(objetivo.angleDeg, pose.angleDeg) * w
  objetivo.height += (pose.height - objetivo.height) * w
  objetivo.distance += (pose.distance - objetivo.distance) * w
  objetivo.frameX += ((lado === 'izq' ? -pose.frameX : pose.frameX) - objetivo.frameX) * w
  objetivo.frameY += (pose.frameY - objetivo.frameY) * w
}

/** El cuadro del rig: avanza el peso hacia lo que pide la sección y mezcla la pose (la del aspecto del lienzo). Devuelve el peso. */
export function mezclarConElPortfolio(objetivo: MutableChoreoPose, dt: number, aspecto: number): number {
  const p = PORTFOLIO_EN_LA_ESCENA
  p.peso = avanzarElPeso(p.peso, p.adentro ? 1 : 0, dt, p.reducido)
  mezclarLaPose(objetivo, poseParaElAspecto(p.camara, aspecto), p.peso, p.lado)
  return p.peso
}

/** El multiplicador del color con el panel adentro: 1 − dim · peso. */
export const multiplicadorDelOscurecido = (dim: number, peso: number): number => 1 - Math.min(1, Math.max(0, dim)) * Math.min(1, Math.max(0, peso))
