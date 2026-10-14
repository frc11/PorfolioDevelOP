/**
 * [PULIDO 20] R2 · EL CRISTAL, LO PURO (`docs/rediseno/DIMENSION-ESPEJO.md`). [PULIDO 23] U1 · las esquirlas sueltas (con rendijas, de
 * espaldas, y desvanecidas cerca de los textos y del logo) se borraron: ahora es UN MURO continuo, un vitral roto (`muro.ts`), que refracta
 * SÓLO EL FONDO (`fondo.ts`) y lo tapa sólo lo que de verdad está delante (la profundidad): sin máscaras. Puro (Node): las constantes,
 * dónde se apaga la página y el final.
 */
export const CRISTAL = {
  /**
   * [PULIDO 23] U1 · el muro (`muro.ts`): su radio (u: adentro de la trama cercana, en 38, y de la fábrica, en 45; afuera de todo lo de la
   * escena), su alto desde el piso (u: hasta arriba de la trama lejana), la grilla desordenada de las semillas del Voronoi (columnas en
   * el perímetro, filas en el alto, cuánto se corren: partes de la celda), la inclinación de cada celda (grados, como mucho) y la semilla.
   */
  muro: { radio: 37, alto: 44, columnas: 34, filas: 6, desorden: 0.85, inclinacionGrados: 5, semilla: 20 },
  /** El vidrio: el índice, a qué distancia detrás se lee el fondo (u), el F0 de Schlick y la dispersión del prisma (en los cantos, el doble). */
  vidrio: { indice: 1.5, fondo: 14, f0: 0.04, dispersion: 0.03 },
  /**
   * La luz: el brillo especular (día, noche) y su dureza; el reflejo del entorno (día, noche); el filo (cuánto se aclara el canto de
   * noche y se oscurece de día: la reflexión total en el borde) y la tinta del cuerpo de día.
   */
  luz: { especular: [0.9, 1.6], dureza: 60, reflejo: [0.15, 0.22], filo: [0.65, 0.8], tinta: 0.06 },
  /** [PULIDO 23] U1 · la línea de quiebre en cada borde: su brillo (día, noche), su medio ancho (px) y hasta dónde llega el prisma del canto (px). */
  quiebre: { brillo: [0.5, 1.1], anchoPx: 1.2, prismaPx: 9 },
  /** Aparece en (s). [PULIDO 23] U1 · quieto: sin giro ni respiración (sin temblor). */
  movimiento: { aparecenS: 2.5 },
  /** Dónde se apaga la página (las secciones de papel opaco y el túnel) y el fundido alrededor (pantallas). */
  donde: { apagadas: ['trabajos', 'tu-panel'], fundido: 0.35 },
  /** El fondo que refractan, a esta fracción del búfer de dibujo. */
  fondo: { escala: 0.5 },
  /** Antes que todo lo transparente que no es fondo (las partículas en 0, la energía en −10, el espejo en −14): nunca las tapa. */
  orden: -17,
} as const

/** Un azar con semilla (mulberry32): siempre las mismas esquirlas. */
export function azarDelCristal(semilla: number): () => number {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * (3 - 2 * u)
}

/**
 * La amplitud por dónde está la página (0 a 1): 0 con el medio de la pantalla adentro de una sección apagada, 1 a más de `fundido`
 * pantallas de todas, el fundido entre medio. `bandas`: por sección apagada, su arriba y su abajo (px del documento); `centro`: el medio
 * de la pantalla (px del documento); `alto`: la pantalla (px).
 */
export function amplitudPorDonde(centro: number, alto: number, bandas: ArrayLike<number>, cuantas: number): number {
  let a = 1
  const fundido = CRISTAL.donde.fundido * Math.max(1, alto)
  for (let k = 0; k < cuantas; k += 1) {
    const arriba = bandas[k * 2]
    const abajo = bandas[k * 2 + 1]
    if (!Number.isFinite(arriba) || !Number.isFinite(abajo)) continue
    const fuera = centro < arriba ? arriba - centro : centro > abajo ? centro - abajo : 0
    a = Math.min(a, suave(fuera / fundido))
  }
  return a
}

/** La amplitud del cuadro: por dónde está la página y por el final del pie (se va con la cámara que sube, `camara` 0 a 1). */
export function amplitudDelCristal(porDonde: number, camara: number): number {
  return porDonde * (1 - suave(camara))
}
