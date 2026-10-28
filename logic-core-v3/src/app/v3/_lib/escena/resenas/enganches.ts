/**
 * [NOCTURNO B3] EL ENGANCHE DE B9 — el momento en que el título de las reseñas se vuelve el CTA (el cartel de canto, la mitad del giro:
 * `_secciones/por-que-develop/resenas/haciaElCta.ts`, `VUELTA_DEL_CTA`) es donde se agrieta el cristal del home. B9 (las grietas) todavía
 * no existe: esto es el punto de enganche, vacío. Lo llama el tramo de las reseñas al cruzar ese momento (`ida` bajando, `vuelta` subiendo);
 * B9 instala acá su disparador (`ENGANCHE_DE_LAS_GRIETAS.alVolverseElCta = …`) sin tocar las reseñas.
 * [L1] Las grietas del cristal se sacaron a propósito (el efecto se rediseña más adelante): el enganche queda vacío.
 */
export const ENGANCHE_DE_LAS_GRIETAS: { alVolverseElCta: (sentido: 'ida' | 'vuelta') => void; veces: number } = {
  alVolverseElCta: () => undefined,
  /** Cuántas veces se llamó (para el banco y la prueba). */
  veces: 0,
}

/** Avisa el cruce (lo llama el tramo de las reseñas). */
export function avisarLaVueltaDelCta(sentido: 'ida' | 'vuelta'): void {
  ENGANCHE_DE_LAS_GRIETAS.veces += 1
  ENGANCHE_DE_LAS_GRIETAS.alVolverseElCta(sentido)
}
