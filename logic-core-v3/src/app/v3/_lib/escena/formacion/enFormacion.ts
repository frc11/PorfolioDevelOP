import { FLOOR_RADIUS } from '../probeScene'
import { REGION, type Region } from './regiones'

/**
 * [ESCENA 4] LA FORMACIÓN — pura: dónde se para cada copia fallada y de qué piezas está hecha. Sin
 * three, para que el invariante la corra sin navegador.
 *
 * **La formación.** Como un ejército: bloques de filas intercaladas (cada fila corrida media posición
 * respecto de la anterior), con un pasillo entre bloques, y todas mirando hacia el mismo lado (+z, el
 * lado del hero). Nada al azar en la formación: la imperfección está en las piezas.
 *
 * **El claro.** Ninguna copia entra en el círculo de `radioDelClaro`, y ese radio no es de gusto: es
 * más grande que la distancia más larga de la cámara en las poses cercanas (20), así que ninguna copia
 * queda nunca entre la cámara y el logo, ni pegada a la lente. La única pose que sale del claro es el
 * pie (a 40), y desde ahí la formación queda por debajo de la línea hacia el logo.
 *
 * **Un nivel más abajo.** La formación está en un piso más bajo que el nuestro:
 * - **L1** · el nuestro sobre una plataforma apenas elevada: el borde del claro es un escalón;
 * - **L2** · sin plataforma: el piso cae en rampa desde el borde del claro y la formación, más abajo,
 *   es más chica.
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
  readonly falla: Falla
  readonly piezas: readonly Pieza[]
  /** Hacia dónde tendría que girar para mirar al logo (F-mirada), y en qué orden. */
  readonly anguloAlCentro: number
  readonly retardo: number
}

export type Lectura = 'L1' | 'L2'
export type Densidad = 'menos' | 'base' | 'mas'

export const FORMACION = {
  radioDelClaro: 21.5,
  /** Hasta dónde llega: adentro de la losa (34), antes de que el piso suba en el ciclorama. */
  radioExterior: FLOOR_RADIUS - 1,
  L1: { desnivel: 0.4, rampa: 0, escala: 0.28 },
  L2: { desnivel: 1.3, rampa: 3.2, escala: 0.22 },
  /**
   * El paso dentro de un bloque, en anchos y en altos de copia. De costado nunca se tocan (más de un
   * ancho); de fondo van apretadas, como un ejército, y la fila intercalada asoma entre dos de adelante.
   */
  paso: { lateral: 1.08, entreFilas: 0.72 },
  bloque: { columnas: 6, filas: 4, pasilloLateral: 1.1, pasilloEntreFilas: 1.6 },
  /** Cuánto se estira el paso para ralear o apretar. */
  densidad: { menos: 1.35, base: 1, mas: 0.84 },
  /** En el teléfono: un bloque de cada dos, y las dos primeras filas de cada uno. */
  movil: { saltoDeBloques: 2, filas: 2 },
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

/** La altura del piso de la formación bajo el nuestro. */
export function desnivelDe(lectura: Lectura): number {
  return FORMACION[lectura].desnivel
}

/** Desde qué radio arranca el piso de abajo: en L2 hay una rampa entre los dos pisos. */
export function radioDelPisoDeAbajo(lectura: Lectura): number {
  return FORMACION.radioDelClaro + FORMACION[lectura].rampa
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
}

/** Los lugares de la formación: bloques de filas intercaladas, con pasillos, recortados al anillo. */
export function lugares(lectura: Lectura, densidad: Densidad, anchoDeCopia: number, altoDeCopia: number, movil: boolean): Lugar[] {
  const f = FORMACION
  const escala = f[lectura].escala
  const estira = f.densidad[densidad]
  const lateral = f.paso.lateral * anchoDeCopia * escala * estira
  const entreFilas = f.paso.entreFilas * altoDeCopia * escala * estira
  const b = f.bloque
  const anchoDelBloque = b.columnas * lateral + b.pasilloLateral * anchoDeCopia * escala * estira
  const hondoDelBloque = b.filas * entreFilas + b.pasilloEntreFilas * altoDeCopia * escala * estira
  const desde = radioDelPisoDeAbajo(lectura) + (anchoDeCopia * escala) / 2 + 0.3
  const hasta = f.radioExterior
  const medioAncho = (anchoDeCopia * escala) / 2
  const salida: Lugar[] = []
  const cuantos = Math.ceil(hasta / Math.min(anchoDelBloque, hondoDelBloque)) + 1
  for (let bz = -cuantos; bz <= cuantos; bz += 1) {
    for (let bx = -cuantos; bx <= cuantos; bx += 1) {
      if (movil && (bx + bz) % f.movil.saltoDeBloques !== 0) continue
      for (let fila = 0; fila < (movil ? f.movil.filas : b.filas); fila += 1) {
        // Cada fila, corrida media posición respecto de la anterior.
        const corrida = fila % 2 === 1 ? lateral / 2 : 0
        for (let col = 0; col < b.columnas; col += 1) {
          const x = bx * anchoDelBloque + col * lateral + corrida
          const z = bz * hondoDelBloque + fila * entreFilas
          // La copia entera dentro del anillo: ni un borde adentro del claro, ni afuera del piso.
          const cerca = Math.hypot(Math.abs(x) - Math.min(Math.abs(x), medioAncho), z)
          const lejos = Math.hypot(Math.abs(x) + medioAncho, z)
          if (cerca < desde || lejos > hasta) continue
          salida.push({ x, z })
        }
      }
    }
  }
  return salida
}

/**
 * La formación entera. Cada copia saca UNA falla de la lista, en orden barajado para que ningún
 * bloque se lea como un muestrario: la variación está en qué falla le tocó, no en dónde está.
 */
export function formar(
  lectura: Lectura,
  densidad: Densidad,
  m: MedidasDeLaCopia,
  opciones: { readonly semilla?: number; readonly movil?: boolean } = {},
): Copia[] {
  const r = azar(opciones.semilla ?? 0x0cf0a11a)
  const radioMaximo = FORMACION.radioExterior
  return lugares(lectura, densidad, m.ancho, m.alto, opciones.movil === true).map(({ x, z }) => {
    const falla = FALLAS[Math.floor(r() * FALLAS.length)]
    const radio = Math.hypot(x, z)
    return {
      x,
      z,
      falla,
      piezas: piezasDe(falla, r, m),
      anguloAlCentro: Math.atan2(-x, -z),
      // Giran de adentro para afuera: la onda de miradas sale del logo.
      retardo: ((radio - FORMACION.radioDelClaro) / (radioMaximo - FORMACION.radioDelClaro)) * 0.6,
    }
  })
}
