/**
 * [RETOQUE 3D] LOS CORTES DEL SONIDO — generado por `scripts-retoque/sonidos.ts` (no se edita a mano).
 *
 *   · El sprite (`public/v3/sonido/sonidos.{webm,m4a}`): dónde empieza cada sonido y cuánto dura (ms). 13.5 s en total;
 *     59 KB en Opus y 61 KB en AAC.
 *   · Los ambientes, uno por archivo (`public/v3/sonido/ambiente-{a,b,c}.{webm,m4a}`, en estéreo): dónde empieza el bucle
 *     adentro de su colchón y cuánto dura (ms). a: 264 KB en Opus, 200 en AAC; b: 212 KB en Opus, 201 en AAC; c: 239 KB en Opus, 200 en AAC.
 */
export const CORTES_DEL_SPRITE = {
  'tic': [300, 100],
  'clic': [660, 140],
  'abre': [1060, 760],
  'cierra': [2080, 760],
  'pulso': [3100, 940],
  'encendido': [4300, 4500],
  'foto': [9060, 210],
  'barra-a': [9530, 130],
  'barra-b': [9920, 150],
  'barra-c': [10330, 200],
  'barra-d': [10790, 120],
  'cta-a': [11170, 320],
  'cta-b': [11750, 260],
  'cta-c': [12270, 380],
  'cta-d': [12910, 340],
} as const

export type Sonido = keyof typeof CORTES_DEL_SPRITE

export const CORTES_DEL_AMBIENTE = {
  a: [400, 24000],
  b: [400, 24000],
  c: [400, 24000],
} as const

export type Ambiente = keyof typeof CORTES_DEL_AMBIENTE
