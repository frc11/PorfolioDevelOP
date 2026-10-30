/**
 * [C2-70e] LA CÁMARA ACOMPAÑA EL GUARDADO DEL ARO — con el gatillo, mientras las reseñas bajan por el anillo del piso
 * (`_secciones/por-que-develop/resenas/haciaElCta.ts`), la cámara se queda en la pose de las reseñas (B, la de los valores: el aro entero
 * en el cuadro) y baja la mirada hacia el hueco a medida que bajan; cuando ya no queda ninguna placa vuelve a la pose del scroll y recién
 * ahí pasa al CTA (C). Es un desvío sobre el OBJETIVO del rig (la pose del recorrido, que la inercia persigue: la vuelta es suave), con su
 * peso: 0 antes y después del guardado, así que fuera de él nada cambia y el progreso no se toca (sin deriva).
 *
 * El peso y la bajada los escribe la sección (`useTramoDeLasResenas`, con `pesoDeLaCamara`); el rig lo aplica (`OrbitRig.tsx`). Sin three.
 */
export const CAMARA_DEL_GUARDADO = { peso: 0, bajada: 0 }

/** Cuánto baja la mirada con el peso y la bajada enteros (en `frameY`: el logo sube un poco y el hueco entra al cuadro). */
export const MIRA_AL_HUECO = 0.2

/** Los canales de la pose que el desvío toca (el ángulo no: B y C miran de frente). */
export interface PoseDelGuardado {
  height: number
  distance: number
  frameX: number
  frameY: number
}

/**
 * [L5] LA POSE DEL GUARDADO: desde arriba, en diagonal hacia abajo («como mirando desde arriba hacia abajo en diagonal», 70 de la revisión 3),
 * con el aro entero y el piso a la vista: se ve el piso abrirse, las reseñas bajar y el piso cerrarse. Era B (el contrapicado de los
 * valores) con la mirada baja. De frente (el ángulo no cambia) y lejos del techo del domo.
 */
export const POSE_DEL_GUARDADO = { height: 9, distance: 19, frameX: 0, frameY: 0.25 } as const
const G = POSE_DEL_GUARDADO
const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))

/** El desvío, puro: `pose` (la del recorrido) va hacia la del guardado con `peso` y mira al hueco con la `bajada` (los dos de 0 a 1). Con peso 0 no la toca. */
export function desvioDelGuardado(pose: PoseDelGuardado, peso: number, bajada: number): void {
  const w = acotar01(peso)
  if (w <= 0) return
  pose.height += (G.height - pose.height) * w
  pose.distance += (G.distance - pose.distance) * w
  pose.frameX += (G.frameX - pose.frameX) * w
  pose.frameY += (G.frameY - pose.frameY) * w + MIRA_AL_HUECO * w * acotar01(bajada)
}

/** Lo que el rig llama sobre su objetivo en cada cuadro (de la coreografía). */
export const acompanarElGuardado = (pose: PoseDelGuardado): void => desvioDelGuardado(pose, CAMARA_DEL_GUARDADO.peso, CAMARA_DEL_GUARDADO.bajada)
