import { REGION, type Region } from './regiones'

/**
 * [ESCENA 6] LA FORMACIÓN — pura: dónde se para cada copia fallada y qué le falta. Sin three, para
 * que el invariante la corra sin navegador.
 *
 * **Dónde.** Afuera de la trama, en todo el perímetro: la cúpula es un cilindro de rendijas, su piso
 * es un escenario (`radioDelEscenario`, apenas afuera de la capa gruesa en 44) y la formación está
 * alrededor, en un piso `desnivel` más abajo. Se ve a través de la trama: la cámara orbita adentro,
 * así que la formación la rodea entera.
 *
 * **Cómo (ESCENA 6).** Como los robots de la referencia: una formación CONTINUA, sin bloques ni
 * pasillos, completa en los 360°. Todas las filas tienen las mismas columnas (`columnas`), así que
 * cada columna es un radio del círculo y todas las copias miran al centro, al original. La fila
 * impar va corrida media columna: la copia de atrás asoma entre dos de adelante. La profundidad se
 * lee por repetición y superposición, y las filas de atrás se pierden en la niebla.
 *
 * **Falladas en la pieza, no en la pose.** Misma escala, misma orientación y mismo paso para todas: lo
 * único que cambia es la pieza. A una le falta una parte (sólo la «c», sólo la «p», sin el palo, el
 * palo solo, partida), otra nació de otro tono (entera o una parte). Las fallas que cambiaban la
 * silueta (girada, más chica, dada vuelta, espejada, corrida) rompían la uniformidad y se sacaron.
 * NINGUNA sale sana: `esPerfecta` lo dice y el invariante lo exige. La variante `sinFallasVisibles`
 * deja todas enteras y del tono de siempre salvo un corrimiento de tono que no se ve.
 */

export interface Caja {
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
  readonly z0: number
  readonly z1: number
}

export const FALLAS = [
  // Le falta una parte.
  'soloC',
  'soloP',
  'sinPalo',
  'paloSolo',
  'partida',
  // Nació de otro tono: entera, o una parte.
  'blanca',
  'grisClara',
  'paloBlanco',
  'cBlanca',
] as const

export type Falla = (typeof FALLAS)[number] | 'tonoApenas'

/** Lo que dibuja una copia: una región de la malla del logo, con su tono y, si hay, una parte de otro tono. */
export interface Pieza {
  readonly region: Region
  /** La x del corte, para las piezas de izquierda y derecha. */
  readonly corte: number
  /** Albedo gris, 0–1. */
  readonly tono: number
  /** La parte de otro tono (o `null`) y su tono. */
  readonly otra: { readonly region: Region; readonly tono: number } | null
}

export interface Copia {
  readonly x: number
  readonly z: number
  /** Hacia dónde mira (giro alrededor de y): el +z de la copia apunta al centro. */
  readonly mira: number
  readonly columna: number
  readonly fila: number
  readonly falla: Falla
  readonly pieza: Pieza
}

export const FORMACION = {
  /** El tamaño de cada copia contra el logo. */
  escala: 0.9,
  /** El borde del escenario: nuestro piso termina acá, apenas afuera de la capa gruesa (44). */
  radioDelEscenario: 45,
  /** Cuánto más abajo que el nuestro está el piso de la formación, en el borde del escenario. */
  desnivel: 1.6,
  /** Cuánto sube ese piso por cada unidad hacia afuera: un cuarto de paso de fila por fila. */
  pendiente: 0.077,
  /** A qué distancia del centro va la primera fila. */
  radioDeLaPrimeraFila: 48,
  /** Las columnas (iguales en todas las filas: cada columna es un radio) y las filas. */
  columnas: 44,
  filas: 7,
  /** El paso entre filas, en altos de copia. La fila de atrás asoma por encima y entre dos de adelante. */
  entreFilas: 0.72,
  /** Las filas con canto (la malla entera); las de atrás van sólo con la tapa de adelante (`copia.ts`). */
  filasConCanto: 1,
  /** Hasta dónde llega el piso de abajo: de ahí sube el ciclorama. */
  radioDelPisoDeAbajo: 72,
  /** El tono de una copia sin falla de color, y los de las que nacieron mal. */
  tono: { base: 0.5, blanco: 0.93, grisClaro: 0.76 },
  /** Variante sin fallas visibles: cuánto se corre el tono, como mucho (no se ve bajo la neblina). */
  tonoApenas: 0.012,
  /**
   * Los triángulos de una copia, medidos en el banco sobre la malla horneada (`copia.ts`, 2 puntos por
   * curva): con canto, y sólo la tapa de adelante. El presupuesto de la formación es de ~50.000.
   */
  triangulos: { conCanto: 256, tapa: 84 },
  presupuesto: 50000,
} as const

/** Los triángulos que dibuja la formación entera (lo mismo que cuenta `armado.ts`). */
export function triangulosDeLaFormacion(): number {
  const f = FORMACION
  return f.columnas * (f.filasConCanto * f.triangulos.conCanto + (f.filas - f.filasConCanto) * f.triangulos.tapa)
}

/** El ancho y el alto de la «cp» entera en el espacio de la copia (6,86 × 5,0). */
export interface MedidasDeLaCopia {
  readonly ancho: number
  readonly alto: number
  readonly caja: (region: Region, corte: number) => Caja
}

/** mulberry32: el mismo número para la misma semilla, en cualquier máquina. */
export function azar(semilla: number): () => number {
  let s = semilla >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** ¿Es una copia sana? Entera, sin parte de otro tono y del tono de siempre. */
export function esPerfecta(copia: Copia): boolean {
  const p = copia.pieza
  return p.region === REGION.todo && p.otra === null && Math.abs(p.tono - FORMACION.tono.base) < 1e-6
}

function pieza(parcial: Partial<Pieza>): Pieza {
  return { region: REGION.todo, corte: 0, tono: FORMACION.tono.base, otra: null, ...parcial }
}

/** La pieza de una falla. `r` da la variación de cada una, siempre dentro de su lógica. */
export function piezaDe(falla: Falla, r: () => number, m: MedidasDeLaCopia): Pieza {
  const t = FORMACION.tono
  switch (falla) {
    case 'soloC':
      return pieza({ region: REGION.c })
    case 'soloP':
      return pieza({ region: REGION.p })
    case 'sinPalo':
      return pieza({ region: REGION.infinito })
    case 'paloSolo':
      return pieza({ region: REGION.palo })
    case 'partida': {
      // Le falta un costado: el corte cae entre el 30 % y el 70 % del ancho.
      const corte = (r() - 0.5) * 0.4 * m.ancho
      return pieza({ region: r() < 0.5 ? REGION.izquierda : REGION.derecha, corte })
    }
    case 'blanca':
      return pieza({ tono: t.blanco })
    case 'grisClara':
      return pieza({ tono: t.grisClaro })
    case 'paloBlanco':
      return pieza({ otra: { region: REGION.palo, tono: t.blanco } })
    case 'cBlanca':
      return pieza({ otra: { region: REGION.c, tono: t.blanco } })
    case 'tonoApenas':
      return pieza({ tono: t.base + (r() < 0.5 ? -1 : 1) * FORMACION.tonoApenas * (0.4 + 0.6 * r()) })
  }
}

/** El ángulo de cada columna: una vuelta entera, pareja. La fila impar va corrida media columna. */
export function anguloDe(columna: number, fila: number): number {
  return ((columna + (fila % 2) * 0.5) / FORMACION.columnas) * Math.PI * 2
}

/** El radio de cada fila. */
export function radioDeLaFila(fila: number, altoDeCopia: number): number {
  return FORMACION.radioDeLaPrimeraFila + fila * FORMACION.entreFilas * altoDeCopia * FORMACION.escala
}

/**
 * La formación entera. Cada copia saca UNA falla de la lista, al azar pero con semilla: la variación
 * está en qué le falta a cada una, no en dónde está ni en cómo está parada.
 */
export function formar(m: MedidasDeLaCopia, opciones: { readonly semilla?: number; readonly sinFallasVisibles?: boolean } = {}): Copia[] {
  const r = azar(opciones.semilla ?? 0x0cf0a11a)
  const f = FORMACION
  const salida: Copia[] = []
  for (let fila = 0; fila < f.filas; fila += 1) {
    const radio = radioDeLaFila(fila, m.alto)
    for (let columna = 0; columna < f.columnas; columna += 1) {
      const angulo = anguloDe(columna, fila)
      const falla: Falla = opciones.sinFallasVisibles === true ? 'tonoApenas' : FALLAS[Math.floor(r() * FALLAS.length)]
      // El +z de la copia apunta al centro: mira hacia −(sen, cos).
      salida.push({ x: Math.sin(angulo) * radio, z: Math.cos(angulo) * radio, mira: angulo + Math.PI, columna, fila, falla, pieza: piezaDe(falla, r, m) })
    }
  }
  return salida
}
