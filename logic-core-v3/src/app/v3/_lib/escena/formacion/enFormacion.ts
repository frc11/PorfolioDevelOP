/**
 * [ESCENA 7] LA FORMACIÓN, «LA FÁBRICA GIGANTE» — pura: dónde se para cada copia. Sin three, para que el
 * invariante la corra sin navegador.
 *
 * **Dónde.** Afuera de la trama, en todo el perímetro: la cúpula es un cilindro de rendijas, su piso es
 * un escenario (`radioDelEscenario`, apenas afuera de la capa gruesa en 44) y la formación está
 * alrededor, en un piso `desnivel` más abajo. Se ve a través de la trama: la cámara orbita adentro, así
 * que la formación la rodea entera.
 *
 * **Cómo.** Todas iguales al original y negras como él: sin fallas (ESCENA 6 las probó; se borraron).
 * Filas concéntricas sin pasillos, completas en los 360°, todas mirando al centro, con la fila de atrás
 * corrida media columna. El piso es PLANO: la profundidad sale de la perspectiva, como en la foto de
 * referencia — las filas convergen al horizonte y el cielo queda arriba (la pendiente de ESCENA 6 subía
 * las filas de atrás y le comía el cielo a la noche).
 *
 * **Muchas más filas.** Hasta `hasta`: las de adelante se leen, las de atrás se pierden en la niebla
 * de la formación (`materiales.ts`). Para que la densidad sea la misma lejos que cerca, cada fila lleva
 * las copias que le entran al paso; pero una fila con otra cantidad que la de adelante ya no queda
 * corrida media columna en todo el círculo. Por eso las columnas cambian por BANDAS: adentro de una
 * banda todas las filas tienen las mismas columnas (intercaladas de verdad) y la banda termina cuando el
 * paso creció `crece`; la siguiente arranca con el paso de nuevo.
 */

export const FORMACION = {
  /** El tamaño de cada copia contra el logo. */
  escala: 0.9,
  /** El borde del escenario: nuestro piso termina acá, apenas afuera de la capa gruesa (44). */
  radioDelEscenario: 45,
  /** Cuánto más abajo que el nuestro está el piso de la formación (plano). */
  desnivel: 1.6,
  /** A qué distancia del centro va la primera fila. */
  radioDeLaPrimeraFila: 48,
  /** El paso entre copias a lo largo de una fila, al arrancar cada banda (u). ESCENA 6: 6,85. */
  paso: 7.4,
  /** Cuánto puede crecer el paso adentro de una banda antes de sumar columnas. */
  crece: 1.25,
  /** El paso entre filas (u). ESCENA 6: 3,24. */
  entreFilas: 3.6,
  /** Hasta dónde llegan las filas (el radio de la última). */
  hasta: 258,
  /** Las filas con canto (la malla entera); las de atrás van con su silueta (`copia.ts`). */
  filasConCanto: 1,
  /** Hasta dónde llega el piso de abajo, y dónde está el cielo (más allá de todo). */
  radioDelPisoDeAbajo: 300,
  radioDelCielo: 330,
  /**
   * Los triángulos de una copia: con canto (la malla horneada, medida en el banco) y la silueta, que es
   * un cuadrado con la forma en una textura. El presupuesto de la formación es de ~50.000.
   */
  triangulos: { conCanto: 256, silueta: 2 },
  presupuesto: 50000,
} as const

export interface Copia {
  readonly x: number
  readonly z: number
  /** Hacia dónde mira (giro alrededor de y): el +z de la copia apunta al centro. */
  readonly mira: number
  readonly fila: number
  readonly columna: number
  /** Las columnas de su fila (las de su banda). */
  readonly columnas: number
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

/** El radio de cada fila. */
export function radioDeLaFila(fila: number): number {
  return FORMACION.radioDeLaPrimeraFila + fila * FORMACION.entreFilas
}

/** Cuántas filas hay. */
export function cuantasFilas(): number {
  return Math.floor((FORMACION.hasta - FORMACION.radioDeLaPrimeraFila) / FORMACION.entreFilas + 1e-9) + 1
}

/** Una banda: desde qué fila, cuántas y con cuántas columnas. */
export interface Banda {
  readonly desde: number
  readonly filas: number
  readonly columnas: number
}

/** Las bandas: una nueva cada vez que el paso de la fila pasa `crece` veces el de arranque. */
export function bandas(): Banda[] {
  const f = FORMACION
  const salida: Banda[] = []
  const total = cuantasFilas()
  let desde = 0
  while (desde < total) {
    const columnas = Math.round((2 * Math.PI * radioDeLaFila(desde)) / f.paso)
    let filas = 1
    while (desde + filas < total && (2 * Math.PI * radioDeLaFila(desde + filas)) / columnas <= f.paso * f.crece) filas += 1
    salida.push({ desde, filas, columnas })
    desde += filas
  }
  return salida
}

/** El ángulo de una copia: una vuelta entera, pareja; adentro de la banda, la fila impar va corrida media columna. */
export function anguloDe(columna: number, filaEnLaBanda: number, columnas: number): number {
  return ((columna + (filaEnLaBanda % 2) * 0.5) / columnas) * Math.PI * 2
}

/** La formación entera, de adelante hacia atrás (así el dibujo descarta temprano lo que queda tapado). */
export function formar(): Copia[] {
  const salida: Copia[] = []
  for (const banda of bandas()) {
    for (let k = 0; k < banda.filas; k += 1) {
      const fila = banda.desde + k
      const radio = radioDeLaFila(fila)
      for (let columna = 0; columna < banda.columnas; columna += 1) {
        const angulo = anguloDe(columna, k, banda.columnas)
        // El +z de la copia apunta al centro: mira hacia −(sen, cos).
        salida.push({ x: Math.sin(angulo) * radio, z: Math.cos(angulo) * radio, mira: angulo + Math.PI, fila, columna, columnas: banda.columnas })
      }
    }
  }
  return salida
}

/** Los triángulos que dibuja la formación entera (lo mismo que cuenta `armado.ts`). */
export function triangulosDeLaFormacion(copias: readonly Copia[] = formar()): number {
  const conCanto = copias.filter((c) => c.fila < FORMACION.filasConCanto).length
  return conCanto * FORMACION.triangulos.conCanto + (copias.length - conCanto) * FORMACION.triangulos.silueta
}
