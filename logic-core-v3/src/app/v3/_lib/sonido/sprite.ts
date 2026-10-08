/**
 * [RETOQUE 3D] LOS CORTES DEL SONIDO — generado por `scripts-retoque/sonidos.ts` (no se edita a mano).
 *
 *   · El sprite (`public/v3/sonido/sonidos.{webm,m4a}`): dónde empieza cada sonido y cuánto dura (ms). 12.6 s en total;
 *     56 KB en Opus y 59 KB en AAC. [CIERRE RETOQUE 3D] El ambiente no tiene
 *     archivo: es generativo (`ambienteGenerativo.ts`).
 */
export const CORTES_DEL_SPRITE = {
  'tic': [300, 100],
  'clic': [660, 140],
  'abre': [1060, 760],
  'cierra': [2080, 760],
  'pulso': [3100, 940],
  'encendido': [4300, 4500],
  'foto': [9060, 210],
  'pestillo': [9530, 120],
  'golpe': [9910, 2440],
} as const

export type Sonido = keyof typeof CORTES_DEL_SPRITE
