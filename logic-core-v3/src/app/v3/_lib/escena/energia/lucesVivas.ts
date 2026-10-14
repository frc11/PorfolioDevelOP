import type * as THREE from 'three'

import { LUCES_VIVAS, LUCES_VIVAS_MAXIMO } from '../entorno/vivo'
import type { Brasas } from './brasas'

/** [PULIDO 26] X4 · cuántas brasas alumbran el cristal (siempre las mismas: una luz que salta de brasa en brasa titilaría en el bisel). */
const BRASAS_QUE_ALUMBRAN = 3

/**
 * [PULIDO 26] X4 · las luces que el cristal refleja de noche (`LUCES_VIVAS`): las de los arcos de este cuadro y unas brasas fijas,
 * repartidas en el arreglo, con su brillo dibujado (la vida incluida: al mudarse se apagan antes) y su energía. Sin reservar.
 */
export function juntarLasLucesVivas(arcos: readonly THREE.Vector4[], cuantosArcos: number, b: Brasas): void {
  const destino = LUCES_VIVAS.uLuces.value
  let n = 0
  for (let k = 0; k < cuantosArcos && n < LUCES_VIVAS_MAXIMO; k += 1) {
    destino[n].copy(arcos[k])
    n += 1
  }
  for (let j = 0; j < BRASAS_QUE_ALUMBRAN && n < LUCES_VIVAS_MAXIMO && b.n > 0; j += 1) {
    const i = Math.floor((b.n * j) / BRASAS_QUE_ALUMBRAN)
    destino[n].set(b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2], b.brillo[i] * (0.4 + 0.6 * b.energia[i]))
    n += 1
  }
  LUCES_VIVAS.uCuantas.value = n
}
