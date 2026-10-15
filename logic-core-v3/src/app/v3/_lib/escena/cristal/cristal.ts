/**
 * [PULIDO 20] R2 · EL CRISTAL, LO PURO (`docs/rediseno/DIMENSION-ESPEJO.md`). [PULIDO 23] U1 · las  * esquirlas sueltas (con rendijas, de
 * espaldas, y desvanecidas cerca de los textos y del logo) se borraron: ahora es UN MURO continuo, un vitral roto (`muro.ts`), que refracta
 * SÓLO EL FONDO (`fondo.ts`) y lo tapa sólo lo que de verdad está delante (la profundidad): sin máscaras. Puro (Node): las constantes y el
 * final.
 */
export const CRISTAL = {
  /**
   * [PULIDO 23] U1 · el muro (`muro.ts`): su radio (u: adentro de la trama cercana, en 38, y de la fábrica, en 45; afuera de todo lo de la
   * escena), su alto desde el piso (u: hasta arriba de la trama lejana), la grilla desordenada de las semillas del Voronoi (columnas en
   * el perímetro, filas en el alto, cuánto se corren: partes de la celda), la inclinación de cada celda (grados, como mucho) y la semilla.
   */
  // [PULIDO 24] V1 · más inclinadas y con su hondura (de cuánto más cerca o más lejos se lee el fondo, en veces de `vidrio.fondo`).
  muro: { radio: 37, alto: 44, columnas: 34, filas: 6, desorden: 0.85, inclinacionGrados: 9, hondura: [0.45, 1.6], semilla: 20 },
  /** El vidrio: el índice, a qué distancia detrás se lee el fondo (u), el F0 de Schlick y la dispersión del prisma ([PULIDO 26] X4 · sólo en el bisel). */
  vidrio: { indice: 1.5, fondo: 14, f0: 0.04, dispersion: 0.02 },
  /**
   * [PULIDO 26] X4 · el cuerpo: el grosor (u: la luz entra por la cara de la celda y sale por la del cilindro, así el corrimiento crece
   * con el ángulo), el bisel (su ancho, u, y cuánto se curva la cara en el filo, grados) y la absorción (por u de vidrio: rojo, verde,
   * azul, un frío muy leve; en el bisel, `enElBisel` veces más denso).
   */
  cuerpo: { grosor: 1.8, bisel: 0.4, biselGrados: 12, absorcion: [0.022, 0.011, 0.006], enElBisel: 1.2 },
  /**
   * [PULIDO 26] X4 · algunas celdas esmeriladas: qué parte, cuánto (desde, hasta) y el radio del desenfoque (téxeles del fondo). [PULIDO 27] C1 ·
   * NITIDEZ PAREJA: el 35 % esmerilado dejaba unas celdas mucho más borrosas que otras; ahora todas casi nítidas, con una variación mínima
   * (de 0 a medio téxel).
   */
  esmerilado: { parte: 1, cuanto: [0, 0.15], texeles: 3.5 },
  /** [PULIDO 26] X4 · de noche el bisel atrapa las luces: el haz (cuánto y su radio, u) y las de la energía (cuánto y su dureza). */
  noche: { haz: 0.35, radioDelHaz: 2.4, luces: 1, dureza: 300 },
  /**
   * La luz: el brillo especular (día, noche) y su dureza; el reflejo del entorno (día, noche; [PULIDO 26] X4 · más marcado) y el lóbulo
   * de la luz de la sala en él; el filo (cuánto se aclara el canto de noche y se oscurece de día) y la tinta del cuerpo de día.
   */
  luz: { especular: [0.9, 1.6], dureza: 60, reflejo: [0.3, 0.38], lobulo: 0.08, filo: [0.65, 0.8], tinta: 0.06 },
  /**
   * [PULIDO 27] C2 · EL BRILLO DE NOCHE: con la luz de la sala por la cara de cada celda (inclinada a su modo), unas se ponían muy blancas y
   * otras no. `?cristal-brillo=medio` (por defecto): todas con el promedio: el brillo con la normal del cilindro (sin la inclinación de la
   * celda) y el lóbulo de todas juntas (más ancho y más bajo: la inclinación de ±9° sumada al lóbulo de 60); `no`: ninguna brilla de
   * noche; `celdas`: el de antes (para comparar). De día, el de siempre.
   */
  brilloDeNoche: { dureza: 40, escala: 0.67, modos: ['celdas', 'medio', 'no'], porDefecto: 'medio' },
  /** [PULIDO 24] V1 · sin línea de quiebre: con `?vitral-filo=si`, un filo oscuro muy fino y tenue (cuánto oscurece, su ancho en px). */
  filo: { oscurece: 0.22, anchoPx: 0.8 },
  /** Aparece en (s). [PULIDO 23] U1 · quieto: sin giro ni respiración (sin temblor). */
  movimiento: { aparecenS: 2.5 },
  /**
   * El fondo que refractan, a esta fracción del búfer de dibujo. [PULIDO 24] V1 · con margen (`sobra`: el campo, tantas veces más ancho
   * y más alto): la refracción de los costados de la pantalla mira afuera del cuadro y ahí hay fondo (antes se desvanecía).
   */
  fondo: { escala: 0.6, sobra: 1.3 },
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
 * La amplitud del cuadro: se va con la cámara que sube en el final del pie (`camara` 0 a 1). [PULIDO 27] C3 · SIEMPRE A LA VISTA: antes
 * también se apagaba con el medio de la pantalla cerca del túnel de Trabajos y de Tu panel (un fundido de 0,35 pantallas): en un viaje del
 * navbar, con la página tapada por el velo y la escena a la vista, el cristal desaparecía al pasar por ahí (medido: a 0 desde ~4500 px yendo
 * a Trabajos y en todo Tu panel). Ahora no depende de dónde está la página: en toda sección y en cualquier viaje.
 */
export function amplitudDelCristal(camara: number): number {
  return 1 - suave(camara)
}

/** [PULIDO 27] C2 · el modo del brillo de noche de la consulta (`?cristal-brillo=`): su lugar en `brilloDeNoche.modos`; si no, el por defecto. */
export function modoDelBrilloDeNoche(valor: string | null): number {
  const M = CRISTAL.brilloDeNoche
  const k = (M.modos as readonly string[]).indexOf(valor ?? '')
  return k >= 0 ? k : M.modos.indexOf(M.porDefecto)
}
