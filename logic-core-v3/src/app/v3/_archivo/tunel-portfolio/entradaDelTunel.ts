import { CAPA_DEL_VACIO, pxDelTunelEn } from './geometria'
import { fraccionDelVacio, poseDelTunel } from './tunel'

/**
 * [B1] LA FRACCIÓN DEL VACÍO QUE EL TÚNEL DIBUJABA — `escalaDeDemos`, que vivía en `demos/entrada.ts` y se mudó con el túnel: es
 * la recta con clamp del vacío sobre la pose del túnel. Los tests de la llegada de Demos la siguen usando como su base (la llegada
 * es la misma recta hasta el título).
 */
export function escalaDeDemos(mostrado: number): number {
  const px = pxDelTunelEn(mostrado)
  return fraccionDelVacio(poseDelTunel(px), CAPA_DEL_VACIO, px)
}
