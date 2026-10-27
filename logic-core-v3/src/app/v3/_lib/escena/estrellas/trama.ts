import * as THREE from 'three'

import type { MoireHandle } from '../MoireScreen'
import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../probeMoire'

/**
 * [ESCENA 7] LA TRAMA DE ESTE CUADRO, COMPARTIDA — lo que `TRAMA_GLSL` (`cielo.ts`) lee: la textura con su
 * transformación de hoy y dónde está la capa. La escribe quien la necesita (el cielo, T3; el amanecer, T11)
 * antes de dibujar; es el mismo objeto para todos los materiales.
 *
 * [B8] Y qué capas se dibujan (`uCapasDeLaTrama`): una capa que no se dibuja no tapa nada. [C2-31m] Queda una sola
 * capa, la gruesa en la pared (`moire/fijo.ts`): la fina ya no existe, así que su lugar en el shader compartido queda
 * siempre apagado (`uCapasDeLaTrama.x` en 0; la cuenta de las dos capas sigue en `TRAMA_GLSL`). Los uniforms de M4 (el
 * desajuste que cambiaba con el progreso) se borraron.
 */
export const TRAMA_EN_VIVO = {
  uTramaGruesa: { value: null as THREE.Texture | null },
  uTramaFina: { value: null as THREE.Texture | null },
  uMatGruesa: { value: new THREE.Matrix3() },
  uMatFina: { value: new THREE.Matrix3() },
  uBandaGruesa: { value: new THREE.Vector4(0, 1, 1, 1) },
  uBandaFina: { value: new THREE.Vector4(0, 1, 1, 1) },
  uRadiosDeLaTrama: { value: new THREE.Vector2(MOIRE_NEAR_RADIUS, MOIRE_FAR_RADIUS) },
  /** [B8] Qué capas se dibujan (fina, gruesa): 1 sí, 0 no. [C2-31m] La fina, nunca. */
  uCapasDeLaTrama: { value: new THREE.Vector2(0, 1) },
  uHayTrama: { value: 0 },
  /** [CALIDAD 1] B7 · la sombra de la trama en el piso, prefiltrada (1); con banco se apaga (0) para el A/B del titileo. */
  uTramaFiltrada: { value: 1 },
}

/** Lee la trama de este cuadro: su textura, con la transformación que tiene ahora, y dónde está la capa. */
export function leerLaTrama(moire: MoireHandle | null): void {
  const u = TRAMA_EN_VIVO
  // [B8] Sin la capa dibujada (`fondo=cristal`), nada tapa.
  if (moire === null || !moire.dibuja) {
    u.uHayTrama.value = 0
    return
  }
  moire.gruesa.updateMatrix()
  u.uTramaGruesa.value = moire.gruesa
  u.uMatGruesa.value.copy(moire.gruesa.matrix)
  u.uBandaGruesa.value.set(...moire.banda)
  u.uRadiosDeLaTrama.value.set(MOIRE_NEAR_RADIUS, moire.radio)
  u.uCapasDeLaTrama.value.set(0, 1)
  u.uHayTrama.value = 1
}
