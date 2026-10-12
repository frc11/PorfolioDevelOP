/**
 * [PULIDO 18] P2 · LA DIMENSIÓN ESPEJO, LO PURO (`docs/rediseno/DIMENSION-ESPEJO.md`: de dónde sale cada cosa). Cada efecto tiene una
 * AMPLITUD (0 a 1: crece, se sostiene y se cura: es una ilusión, nada queda roto) y, los de la pantalla, una ZONA (un centro en la
 * pantalla y un radio). El DISPARADOR decide cuándo y dónde:
 *   · ambiente: raro y lento (cada 18 a 30 s, uno), en un lugar libre del fondo (lejos del logo y de los textos);
 *   · scroll: atado al scroll al cruzar ciertos bordes de sección (la amplitud sigue al avance: crece y se cura con él; nunca en el
 *     túnel de Trabajos);
 *   · mantener: apretado sobre el fondo un rato (después del gesto del plasma), crece donde está el puntero; al soltar, se cura.
 * Puro (la prueba lo corre en Node): sin reservas por cuadro.
 */
export type Efecto = 'cristal' | 'pliegue' | 'caleidoscopio' | 'ecos' | 'espiral'
export type Disparo = 'ambiente' | 'scroll' | 'mantener'
export const EFECTOS_DEL_ESPEJO: readonly Efecto[] = ['cristal', 'pliegue', 'caleidoscopio', 'ecos', 'espiral']

export const ESPEJO = {
  /** El ciclo de cada efecto (s): crece, se sostiene y se cura. El pliegue, monumental: lento. */
  ciclo: { cristal: [0.6, 1.8, 1.6], pliegue: [3.2, 2.4, 3.6], caleidoscopio: [1.6, 2.4, 2], ecos: [0.25, 0.5, 1.2], espiral: [2, 2.2, 2.4] },
  /** El ambiente: cada cuánto (s, al azar entre los dos) y el primero (s después de montar). */
  ambiente: { cada: [18, 30], primero: 7 },
  /**
   * El scroll: los bordes de sección que lo disparan (la de arriba, la de abajo) y el ancho del tramo alrededor del borde (pantallas).
   * Servicios → Tu panel se sacó: los dos son papel opaco y ahí la escena está en pausa (en el banco del sitio no encendía nunca).
   */
  scroll: { bordes: [['quienes-somos', 'numeros'], ['tu-panel', 'por-que-develop']], ancho: 0.5 },
  /** Mantener: cuánto apretado antes de empezar (s: el plasma carga primero), en cuánto crece (s) y en cuánto se cura al soltar (s). */
  mantener: { espera: 0.7, crece: 1.6, cura: 1.2 },
  /** La zona en la pantalla: el radio (fracción del lado menor), lo que se aleja del centro del logo (en sus radios) y dónde puede ir (NDC). */
  zona: {
    radio: 0.27,
    lejosDelLogo: 1.3,
    lugares: [[-0.62, 0.42], [0.62, 0.42], [-0.66, -0.02], [0.66, -0.02], [0, 0.6], [-0.35, 0.62], [0.35, 0.62]],
  },
} as const

const suave = (x: number): number => x * x * (3 - 2 * x)

/** La amplitud de un ciclo a los `t` s de empezado (sube y baja suave; antes y después, 0). */
export function amplitudDelCiclo(t: number, ciclo: readonly number[]): number {
  const crece = ciclo[0]
  const sostiene = ciclo[1]
  const cura = ciclo[2]
  if (t <= 0 || t >= crece + sostiene + cura) return 0
  if (t < crece) return suave(t / crece)
  if (t < crece + sostiene) return 1
  return 1 - suave((t - crece - sostiene) / cura)
}

/** Cuánto dura un ciclo entero (s). */
export const duracionDelCiclo = (ciclo: readonly number[]): number => ciclo[0] + ciclo[1] + ciclo[2]

/** Lo que la escena le cuenta al disparador en cada cuadro (un solo objeto, reescrito). */
export interface EntradaDelDisparador {
  tiempo: number
  /** El puntero (NDC), si está apretado (y desde cuándo, s) y si empezó sobre un texto (no cuenta). */
  x: number
  y: number
  apretado: boolean
  apretadoDesde: number
  sobreTexto: boolean
  /** El scroll: la amplitud del tramo que se está cruzando (0 a 1) y su número (−1: ninguno). */
  scrollAmplitud: number
  scrollTramo: number
  /** El logo en la pantalla: su centro (NDC) y su radio (fracción del alto); las cajas de texto (NDC: x0, y0, x1, y1). */
  logoX: number
  logoY: number
  logoRadio: number
  readonly textos: Float32Array
  cuantosTextos: number
}

export function crearEntradaDelDisparador(): EntradaDelDisparador {
  return { tiempo: 0, x: 0, y: 0, apretado: false, apretadoDesde: 0, sobreTexto: false, scrollAmplitud: 0, scrollTramo: -1, logoX: 0, logoY: 0, logoRadio: 0.2, textos: new Float32Array(64), cuantosTextos: 0 }
}

export interface Disparador {
  readonly modo: Disparo
  readonly efecto: Efecto
  /** La amplitud de este cuadro y la zona (centro NDC, radio en fracción del alto). */
  amplitud: number
  zonaX: number
  zonaY: number
  zonaRadio: number
  /** El ciclo en curso: cuándo empezó (s; −∞: ninguno), cuándo toca el próximo, y el gesto: la amplitud al soltar y cuándo. */
  inicio: number
  siguiente: number
  alSoltar: number
  soltadoEn: number
  tramo: number
  /** Una zona fija (la pide el banco; NaN: se elige). */
  zonaFijaX: number
  zonaFijaY: number
  /** El azar (con semilla: el mismo recorrido en el banco). */
  semilla: number
}

export function crearDisparador(efecto: Efecto, modo: Disparo): Disparador {
  return { modo, efecto, amplitud: 0, zonaX: 0.62, zonaY: 0.42, zonaRadio: ESPEJO.zona.radio, inicio: Number.NEGATIVE_INFINITY, siguiente: ESPEJO.ambiente.primero, alSoltar: 0, soltadoEn: Number.NEGATIVE_INFINITY, tramo: -1, zonaFijaX: Number.NaN, zonaFijaY: Number.NaN, semilla: 0x9e3779b9 }
}

/** Un número al azar de 0 a 1 (xorshift sobre la semilla del disparador). */
function azar(d: Disparador): number {
  let s = d.semilla >>> 0
  s ^= s << 13
  s ^= s >>> 17
  s ^= s << 5
  d.semilla = s >>> 0
  return (d.semilla % 100000) / 100000
}

/** ¿Cae (x, y) adentro de una caja de texto (con un margen)? */
function sobreUnTexto(en: EntradaDelDisparador, x: number, y: number, margen: number): boolean {
  for (let k = 0; k < en.cuantosTextos; k += 1) {
    const o = k * 4
    if (x > en.textos[o] - margen && x < en.textos[o + 2] + margen && y > en.textos[o + 1] - margen && y < en.textos[o + 3] + margen) return true
  }
  return false
}

/** Elige la zona: entre los lugares posibles, uno lejos del logo y fuera de los textos (al azar entre los que quedan). */
export function elegirLaZona(d: Disparador, en: EntradaDelDisparador): void {
  if (Number.isFinite(d.zonaFijaX) && Number.isFinite(d.zonaFijaY)) {
    d.zonaX = d.zonaFijaX
    d.zonaY = d.zonaFijaY
    return
  }
  const L = ESPEJO.zona.lugares
  let elegido = -1
  let vistos = 0
  for (let k = 0; k < L.length; k += 1) {
    const lejos = Math.hypot(L[k][0] - en.logoX, (L[k][1] - en.logoY) * 0.6) / Math.max(0.05, en.logoRadio)
    if (lejos < ESPEJO.zona.lejosDelLogo + 1 || sobreUnTexto(en, L[k][0], L[k][1], 0.08)) continue
    vistos += 1
    if (azar(d) * vistos < 1) elegido = k
  }
  if (elegido < 0) elegido = Math.abs(en.logoX - L[0][0]) > Math.abs(en.logoX - L[1][0]) ? 0 : 1
  d.zonaX = L[elegido][0]
  d.zonaY = L[elegido][1]
}

/** Un ciclo ya (el banco): empieza ahora, en la zona pedida (o una elegida), sea cual sea el modo. */
export function dispararYa(d: Disparador, en: EntradaDelDisparador, x: number, y: number): void {
  d.zonaFijaX = x
  d.zonaFijaY = y
  d.inicio = en.tiempo
  elegirLaZona(d, en)
}

/** El paso del disparador: según el modo, la amplitud de este cuadro y la zona (un ciclo pedido por el banco va primero). */
export function pasoDelDisparador(d: Disparador, en: EntradaDelDisparador): void {
  const ciclo = ESPEJO.ciclo[d.efecto]
  const pedido = amplitudDelCiclo(en.tiempo - d.inicio, ciclo)
  if (d.modo !== 'ambiente' && pedido > 0) {
    d.amplitud = pedido
    return
  }
  if (d.modo === 'ambiente') {
    if (en.tiempo >= d.siguiente) {
      d.inicio = en.tiempo
      elegirLaZona(d, en)
      d.siguiente = en.tiempo + duracionDelCiclo(ciclo) + ESPEJO.ambiente.cada[0] + azar(d) * (ESPEJO.ambiente.cada[1] - ESPEJO.ambiente.cada[0])
    }
    d.amplitud = amplitudDelCiclo(en.tiempo - d.inicio, ciclo)
    return
  }
  if (d.modo === 'scroll') {
    if (en.scrollTramo !== d.tramo && en.scrollTramo >= 0) {
      d.tramo = en.scrollTramo
      elegirLaZona(d, en)
    }
    d.amplitud = en.scrollAmplitud
    return
  }
  // Mantener: después de la espera crece donde está el puntero; al soltar se cura desde donde quedó.
  const M = ESPEJO.mantener
  if (en.apretado && !en.sobreTexto) {
    d.amplitud = Math.min(1, Math.max(0, (en.tiempo - en.apretadoDesde - M.espera) / M.crece))
    d.alSoltar = d.amplitud
    d.soltadoEn = en.tiempo
    d.zonaX = en.x
    d.zonaY = en.y
    return
  }
  d.amplitud = d.alSoltar * Math.max(0, 1 - (en.tiempo - d.soltadoEn) / M.cura)
}
