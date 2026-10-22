import * as THREE from 'three'

import type { MoireHandle } from '../MoireScreen'
import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../probeMoire'

/**
 * [ESCENA 7] LA TRAMA DE ESTE CUADRO, COMPARTIDA — lo que `TRAMA_GLSL` (`cielo.ts`) lee: las dos texturas
 * con su transformación de hoy y dónde está cada capa. La escribe quien la necesita (el cielo, T3; el
 * amanecer, T11) antes de dibujar; es el mismo objeto para todos los materiales.
 *
 * [B8] Y qué capas se dibujan y en qué radio (`moire/fijo.ts`): una capa que no se dibuja no tapa nada, y la fina
 * coplanar (`?moire=2`) tapa desde la pared. Los uniforms de M4 (el desajuste que cambiaba con el progreso) se borraron.
 */
export const TRAMA_EN_VIVO = {
  uTramaGruesa: { value: null as THREE.Texture | null },
  uTramaFina: { value: null as THREE.Texture | null },
  uMatGruesa: { value: new THREE.Matrix3() },
  uMatFina: { value: new THREE.Matrix3() },
  uBandaGruesa: { value: new THREE.Vector4(0, 1, 1, 1) },
  uBandaFina: { value: new THREE.Vector4(0, 1, 1, 1) },
  uRadiosDeLaTrama: { value: new THREE.Vector2(MOIRE_NEAR_RADIUS, MOIRE_FAR_RADIUS) },
  /** [B8] Qué capas se dibujan (fina, gruesa): 1 sí, 0 no. */
  uCapasDeLaTrama: { value: new THREE.Vector2(1, 1) },
  uHayTrama: { value: 0 },
  /** [CALIDAD 1] B7 · la sombra de la trama en el piso, prefiltrada (1); con banco se apaga (0) para el A/B del titileo. */
  uTramaFiltrada: { value: 1 },
}

/** Lee la trama de este cuadro: sus dos texturas, con la transformación que tienen ahora, y dónde está cada capa. */
export function leerLaTrama(moire: MoireHandle | null): void {
  const u = TRAMA_EN_VIVO
  // [B8] Sin capas dibujadas (`?moire=0`, `fondo=cristal`), nada tapa.
  if (moire === null || (!moire.capas.gruesa && !moire.capas.fina)) {
    u.uHayTrama.value = 0
    return
  }
  moire.gruesa.updateMatrix()
  moire.fina.updateMatrix()
  u.uTramaGruesa.value = moire.gruesa
  u.uTramaFina.value = moire.fina
  u.uMatGruesa.value.copy(moire.gruesa.matrix)
  u.uMatFina.value.copy(moire.fina.matrix)
  u.uBandaGruesa.value.set(...moire.bandas.gruesa)
  u.uBandaFina.value.set(...moire.bandas.fina)
  u.uRadiosDeLaTrama.value.set(moire.radios.fina, moire.radios.gruesa)
  u.uCapasDeLaTrama.value.set(moire.capas.fina ? 1 : 0, moire.capas.gruesa ? 1 : 0)
  u.uHayTrama.value = 1
}
