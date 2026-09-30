import * as THREE from 'three'

import type { MoireHandle } from '../MoireScreen'
import { DESAJUSTE_VIVO } from '../moire/parche'
import { MOIRE_FAR_RADIUS, MOIRE_NEAR_RADIUS } from '../probeMoire'

/**
 * [ESCENA 7] LA TRAMA DE ESTE CUADRO, COMPARTIDA — lo que `TRAMA_GLSL` (`cielo.ts`) lee: las dos texturas
 * con su transformación de hoy y dónde está cada capa. La escribe quien la necesita (el cielo, T3; el
 * amanecer, T11) antes de dibujar; es el mismo objeto para todos los materiales.
 */
export const TRAMA_EN_VIVO = {
  uTramaGruesa: { value: null as THREE.Texture | null },
  uTramaFina: { value: null as THREE.Texture | null },
  uMatGruesa: { value: new THREE.Matrix3() },
  uMatFina: { value: new THREE.Matrix3() },
  uRepeticionB: DESAJUSTE_VIVO.uRepeticionB,
  uCorrimientoB: DESAJUSTE_VIVO.uCorrimientoB,
  uMezclaB: DESAJUSTE_VIVO.uMezclaDelDesajuste,
  uBandaGruesa: { value: new THREE.Vector4(0, 1, 1, 1) },
  uBandaFina: { value: new THREE.Vector4(0, 1, 1, 1) },
  uRadiosDeLaTrama: { value: new THREE.Vector2(MOIRE_NEAR_RADIUS, MOIRE_FAR_RADIUS) },
  uHayTrama: { value: 0 },
  /** [CALIDAD 1] B7 · la sombra de la trama en el piso, prefiltrada (1); con banco se apaga (0) para el A/B del titileo. */
  uTramaFiltrada: { value: 1 },
}

/** Lee la trama de este cuadro: sus dos texturas, con la transformación que tienen ahora, y dónde está cada capa. */
export function leerLaTrama(moire: MoireHandle | null): void {
  const u = TRAMA_EN_VIVO
  if (moire === null) {
    u.uHayTrama.value = 0
    return
  }
  moire.drift.updateMatrix()
  moire.fina.updateMatrix()
  u.uTramaGruesa.value = moire.drift
  u.uTramaFina.value = moire.fina
  u.uMatGruesa.value.copy(moire.drift.matrix)
  u.uMatFina.value.copy(moire.fina.matrix)
  u.uBandaGruesa.value.set(...moire.bandas.gruesa)
  u.uBandaFina.value.set(...moire.bandas.fina)
  u.uHayTrama.value = 1
}
