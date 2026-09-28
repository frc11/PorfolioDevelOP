import { REGION, type Region } from './regiones'

/**
 * [ESCENA 5] LA FORMACIÓN — pura: dónde se para cada copia fallada y de qué piezas está hecha. Sin
 * three, para que el invariante la corra sin navegador.
 *
 * **Dónde.** Afuera de la trama, en todo el perímetro: la cúpula es un cilindro de rendijas, su piso
 * es un escenario (`radioDelEscenario`, apenas afuera de la capa gruesa en 44) y la formación está
 * alrededor, en un piso `desnivel` más abajo. Se ve a través de la trama: la cámara orbita adentro,
 * así que la formación la rodea entera.
 *
 * **Cómo.** Como un ejército: bloques rectangulares tangentes al anillo, con un pasillo entre bloque
 * y bloque; adentro de cada bloque, filas intercaladas (la fila impar lleva una copia menos, corrida
 * media posición) y todas mirando al centro del bloque, o sea al escenario. Nada al azar en la
 * formación: la imperfección está en las piezas. Del tamaño casi del logo (`escala`): no son
 * miniaturas, y las de adelante tapan a las de atrás.
 *
 * **Falladas, no deformadas.** Cada copia es un modelo que salió mal de fábrica, hecho de piezas
 * rígidas: cada pieza es la malla del logo recortada a una región (`regiones.ts`) y puesta con su
 * propia transformación. NINGUNA sale sana: `esPerfecta` lo dice y el invariante lo exige.
 */

export interface Caja {
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
  readonly z0: number
  readonly z1: number
}

export type Vec3 = readonly [number, number, number]

export const FALLAS = [
  'soloC',
  'soloP',
  'sinPalo',
  'paloSolo',
  'partidoSeparado',
  'partidoDesalineado',
  'espejado',
  'dadoVuelta',
  'malMontado',
  'espesor',
  'masChica',
  'color',
  // Las de acá abajo son nuestras, dentro de la misma lógica.
  'paloCorrido',
  'cGirada',
  'paloCaido',
  'pInvertida',
  'torcidaEnLaBase',
] as const

export type Falla = (typeof FALLAS)[number]

/** Una pieza rígida, en el espacio de la copia (pie en y = 0, centrada en x y z, mirando a +z). */
export interface Pieza {
  readonly region: Region
  /** La x del corte, para las piezas de izquierda y derecha. */
  readonly corte: number
  /** Giro (x, y, z, en ese orden) alrededor de `pivote`. */
  readonly giro: Vec3
  readonly pivote: Vec3
  readonly escala: Vec3
  /** Dónde queda, sumado después del giro. */
  readonly desplazamiento: Vec3
  /** Albedo gris, 0–1. */
  readonly tono: number
}

export interface Copia {
  readonly x: number
  readonly z: number
  /** Hacia dónde mira (giro alrededor de y): el +z de la copia apunta al centro de su bloque. */
  readonly mira: number
  readonly bloque: number
  readonly fila: number
  readonly falla: Falla
  readonly piezas: readonly Pieza[]
  /** Cuánto más tendría que girar para mirar al logo (F-mirada), y en qué orden. */
  readonly anguloAlCentro: number
  readonly retardo: number
}

export const FORMACION = {
  /** El tamaño de cada copia contra el logo. */
  escala: 0.9,
  /** El borde del escenario: nuestro piso termina acá, apenas afuera de la capa gruesa (44). */
  radioDelEscenario: 45,
  /** Cuánto más abajo que el nuestro está el piso de la formación. */
  desnivel: 1.6,
  /** A qué distancia del centro va la primera fila (el centro de su bloque). */
  radioDeLaPrimeraFila: 48,
  /** Cuántos bloques dan la vuelta, y cuántas columnas y filas lleva cada uno. */
  bloques: 7,
  bloque: { columnas: 5, filas: 4 },
  /**
   * El paso adentro de un bloque, en anchos y en altos de copia. De costado nunca se tocan (más de un
   * ancho); de fondo van apretadas, y la fila intercalada asoma entre dos de adelante.
   */
  paso: { lateral: 1.08, entreFilas: 0.72 },
  /** Hasta dónde llega el piso de abajo: de ahí sube el ciclorama. */
  radioDelPisoDeAbajo: 64,
  /** En el teléfono, con `movil=menos`: las dos primeras filas de cada bloque. */
  movil: { filas: 2 },
  /** El tono de una copia sin falla de color, y los de las que nacieron mal. */
  tono: { base: 0.5, blanco: 0.93, grisClaro: 0.76 },
} as const

/** El ancho y el alto de la «cp» entera en el espacio de la copia (6,86 × 5,0). */
export interface MedidasDeLaCopia {
  readonly ancho: number
  readonly alto: number
  readonly caja: (region: Region, corte: number) => Caja
}

const QUIETA: Vec3 = [0, 0, 0]
const ENTERA: Vec3 = [1, 1, 1]

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

/** ¿Es una copia sana? Una sola pieza, entera, sin giro, sin corrimiento, a escala y del tono de siempre. */
export function esPerfecta(copia: Copia): boolean {
  if (copia.piezas.length !== 1) return false
  const p = copia.piezas[0]
  const nulo = (v: Vec3, base: number): boolean => v.every((c) => Math.abs(c - base) < 1e-6)
  return p.region === REGION.todo && nulo(p.giro, 0) && nulo(p.desplazamiento, 0) && nulo(p.escala, 1) && Math.abs(p.tono - FORMACION.tono.base) < 1e-6
}

function pieza(parcial: Partial<Pieza> & Pick<Pieza, 'region'>): Pieza {
  return { corte: 0, giro: QUIETA, pivote: QUIETA, escala: ENTERA, desplazamiento: QUIETA, tono: FORMACION.tono.base, ...parcial }
}

/** El centro de la caja de una región: el pivote natural para girar esa pieza. */
function centroDe(c: Caja): Vec3 {
  return [(c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2, 0]
}

/** Las piezas de una falla. `r` da la variación de cada una, siempre dentro de su lógica. */
export function piezasDe(falla: Falla, r: () => number, m: MedidasDeLaCopia): Pieza[] {
  const signo = r() < 0.5 ? -1 : 1
  const cortePartido = (r() - 0.5) * 0.5 * m.ancho
  switch (falla) {
    case 'soloC':
      return [pieza({ region: REGION.c })]
    case 'soloP':
      return [pieza({ region: REGION.p })]
    case 'sinPalo':
      return [pieza({ region: REGION.infinito })]
    case 'paloSolo':
      return [pieza({ region: REGION.palo })]
    case 'partidoSeparado': {
      const hueco = (0.08 + 0.1 * r()) * m.ancho
      return [
        pieza({ region: REGION.izquierda, corte: cortePartido, desplazamiento: [-hueco / 2, 0, 0] }),
        pieza({ region: REGION.derecha, corte: cortePartido, desplazamiento: [hueco / 2, 0, 0] }),
      ]
    }
    case 'partidoDesalineado':
      return [
        pieza({ region: REGION.izquierda, corte: cortePartido }),
        pieza({
          region: REGION.derecha,
          corte: cortePartido,
          desplazamiento: [0, signo * (0.06 + 0.08 * r()) * m.alto, (r() - 0.5) * 0.9],
          giro: [0, 0, signo * (0.05 + 0.1 * r())],
          pivote: [cortePartido, m.alto / 2, 0],
        }),
      ]
    case 'espejado':
      return [pieza({ region: REGION.todo, escala: [-1, 1, 1] })]
    case 'dadoVuelta':
      return [pieza({ region: REGION.todo, giro: [0, 0, Math.PI], pivote: [0, m.alto / 2, 0] })]
    case 'malMontado':
      return [pieza({ region: REGION.todo, giro: [0, signo * (0.3 + 0.4 * r()), 0] })]
    case 'espesor':
      return [pieza({ region: REGION.todo, escala: [1, 1, r() < 0.5 ? 0.18 + 0.1 * r() : 2.4 + 1.2 * r()] })]
    case 'masChica': {
      const e = 0.6 + 0.15 * r()
      return [pieza({ region: REGION.todo, escala: [e, e, e] })]
    }
    case 'color':
      return [pieza({ region: REGION.todo, tono: r() < 0.5 ? FORMACION.tono.blanco : FORMACION.tono.grisClaro })]
    case 'paloCorrido':
      return [pieza({ region: REGION.infinito }), pieza({ region: REGION.palo, desplazamiento: [signo * (0.07 + 0.06 * r()) * m.ancho, 0, 0] })]
    case 'cGirada': {
      const c = m.caja(REGION.c, 0)
      return [pieza({ region: REGION.c, giro: [0, 0, signo * (r() < 0.5 ? Math.PI / 2 : Math.PI)], pivote: centroDe(c) }), pieza({ region: REGION.p })]
    }
    case 'paloCaido': {
      const palo = m.caja(REGION.palo, 0)
      // El palo se soltó y quedó acostado en el piso, al costado.
      return [
        pieza({ region: REGION.infinito }),
        pieza({ region: REGION.palo, giro: [0, 0, signo * Math.PI / 2], pivote: centroDe(palo), desplazamiento: [signo * 0.35 * m.ancho, 0, 0.4] }),
      ]
    }
    case 'pInvertida': {
      const p = m.caja(REGION.p, 0)
      return [pieza({ region: REGION.c }), pieza({ region: REGION.p, giro: [0, 0, Math.PI], pivote: centroDe(p) })]
    }
    case 'torcidaEnLaBase':
      return [pieza({ region: REGION.todo, giro: [0, 0, signo * (0.18 + 0.2 * r())] })]
  }
}

/**
 * Las fallas que dejan una pieza sin apoyo (la «c» sola, el palo que se cae, el partido en dos) la
 * apoyan en el piso; las que siguen armadas quedan a su altura, sostenidas por el palo.
 */
export const APOYAR_EN_EL_PISO: ReadonlySet<Falla> = new Set<Falla>([
  'soloC',
  'soloP',
  'sinPalo',
  'paloSolo',
  'partidoSeparado',
  'dadoVuelta',
  'torcidaEnLaBase',
  'paloCaido',
  'pInvertida',
  'cGirada',
])

interface Lugar {
  readonly x: number
  readonly z: number
  readonly mira: number
  readonly bloque: number
  readonly fila: number
}

/**
 * El ángulo del centro de cada bloque. Corrido medio bloque: detrás del pie (la cámara a 40, en el
 * azimut 0) cae un pasillo y no un bloque, y detrás del logo en el hero (azimut 180) cae un bloque.
 */
export function anguloDelBloque(bloque: number): number {
  return ((bloque + 0.5) / FORMACION.bloques) * Math.PI * 2
}

/** Los lugares de la formación: bloques tangentes al anillo, de filas intercaladas, con pasillos. */
export function lugares(anchoDeCopia: number, altoDeCopia: number, movil: boolean): Lugar[] {
  const f = FORMACION
  const lateral = f.paso.lateral * anchoDeCopia * f.escala
  const entreFilas = f.paso.entreFilas * altoDeCopia * f.escala
  const filas = movil ? f.movil.filas : f.bloque.filas
  const salida: Lugar[] = []
  for (let bloque = 0; bloque < f.bloques; bloque += 1) {
    const angulo = anguloDelBloque(bloque)
    // Hacia afuera (radial) y de costado (tangente), en el centro del bloque.
    const [ux, uz] = [Math.sin(angulo), Math.cos(angulo)]
    const [tx, tz] = [Math.cos(angulo), -Math.sin(angulo)]
    for (let fila = 0; fila < filas; fila += 1) {
      // La fila impar lleva una copia menos: queda corrida media posición, entre dos de adelante.
      const columnas = f.bloque.columnas - (fila % 2)
      const hondo = f.radioDeLaPrimeraFila + fila * entreFilas
      for (let col = 0; col < columnas; col += 1) {
        const costado = (col - (columnas - 1) / 2) * lateral
        // El +z de la copia apunta al escenario: mira hacia −u.
        salida.push({ x: ux * hondo + tx * costado, z: uz * hondo + tz * costado, mira: angulo + Math.PI, bloque, fila })
      }
    }
  }
  return salida
}

/** El ángulo en (−π, π]. */
function envolver(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a))
}

/**
 * La formación entera. Cada copia saca UNA falla de la lista, en orden barajado para que ningún
 * bloque se lea como un muestrario: la variación está en qué falla le tocó, no en dónde está.
 */
export function formar(m: MedidasDeLaCopia, opciones: { readonly semilla?: number; readonly movil?: boolean } = {}): Copia[] {
  const r = azar(opciones.semilla ?? 0x0cf0a11a)
  const f = FORMACION
  const ultima = f.radioDeLaPrimeraFila + (f.bloque.filas - 1) * f.paso.entreFilas * m.alto * f.escala
  return lugares(m.ancho, m.alto, opciones.movil === true).map((lugar) => {
    const falla = FALLAS[Math.floor(r() * FALLAS.length)]
    const radio = Math.hypot(lugar.x, lugar.z)
    return {
      ...lugar,
      falla,
      piezas: piezasDe(falla, r, m),
      // Mirar al logo: el +z hacia el centro exacto, no hacia el centro del bloque.
      anguloAlCentro: envolver(Math.atan2(-lugar.x, -lugar.z) - lugar.mira),
      // Giran de adelante para atrás: la onda de miradas sale del escenario.
      retardo: ((radio - f.radioDeLaPrimeraFila) / Math.max(1e-6, ultima + 4 - f.radioDeLaPrimeraFila)) * 0.6,
    }
  })
}
