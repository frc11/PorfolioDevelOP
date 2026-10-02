/**
 * [3D Y SONIDO] T2 · LOS CORTES DEL SPRITE — generado por `scripts-3d-sonido/t2-sonidos.ts` (no se edita a mano): dónde
 * empieza cada sonido en `public/v3/sonido/sonidos.{webm,m4a}` y cuánto dura (ms), y si es un bucle. 30.9 s en total;
 * 124 KB en Opus y 151 KB en AAC.
 */
export const CORTES_DEL_SPRITE = {
  tic: [300, 100],
  clic: [660, 140],
  abre: [1060, 760],
  cierra: [2080, 760],
  pulso: [3100, 940],
  encendido: [4300, 4500],
  amanecer: [9060, 5240],
  tunel: [14560, 1440],
  foto: [16260, 210],
  dia: [17130, 6000, true],
  noche: [24230, 6000, true],
} as const

export type Sonido = keyof typeof CORTES_DEL_SPRITE
