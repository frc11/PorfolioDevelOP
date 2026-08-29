/**
 * LOS OCHO NIVELES TIPOGRÁFICOS — la tabla, sin React.
 *
 * Vive aparte de los componentes por la misma razón que `compuerta.ts`: los
 * instrumentos la importan y la afirman sin montar nada. Un nivel que sólo
 * existe adentro de un JSX no se puede contar.
 *
 * ── Por qué las clases están escritas enteras y no armadas ─────────────────
 *
 * Tailwind escanea el CÓDIGO FUENTE buscando candidatos. Una clase construida
 * como `text-${nivel}` no la ve nadie y la regla no se emite: el atributo
 * queda en el HTML, el navegador no encuentra nada, y la página se ve "casi
 * bien" sin un solo error en consola. Por eso cada nivel escribe sus clases
 * completas y literales, aunque se repita el prefijo ocho veces.
 *
 * ── Seis fluidos y dos que no ──────────────────────────────────────────────
 *
 * `cuerpo` (15px) y `base` (1rem) **no tienen contraparte fluida**, y no es un
 * olvido: se midieron INVARIANTES entre 768 y 1920 (`LAYOUT.md`, hueco 7). El
 * sistema tiene tres regímenes conviviendo —53,9% fluido, 21,8% invariante,
 * 10,1% escalonado— y emitir `clamp()` para los ocho sería tan falso como no
 * emitir ninguno.
 *
 * ── El pendiente óptico que la ruta /v3/tipografia destraba ────────────────
 *
 * Nadie miró los ocho niveles renderizados, ni en la familia original ni en
 * Chivo. Y hay una razón concreta para que urja: la cap height de Chivo es más
 * chica. Los números están en `METRICAS_DE_CHIVO`, y no están transcritos de
 * un reporte: `s3-tipografia.invariant.ts` los lee del `.woff2` que /v3 sirve.
 */

/** Los ocho nombres. No hay un noveno, y el instrumento lo afirma. */
export const NIVELES = [
  'micro',
  'caption',
  'cuerpo',
  'base',
  'titulo-s',
  'titulo-m',
  'titulo-l',
  'titulo-xl',
] as const

export type Nivel = (typeof NIVELES)[number]

/** Los tres multiplicadores de interlineado del sistema. */
export const INTERLINEADOS = ['micro', 'texto', 'titulo'] as const
export type Interlineado = (typeof INTERLINEADOS)[number]

/** Los cuatro de interletrado. `display` es el único que ningún componente
 *  medido consume: se ejercita en la ruta de demostración. */
export const INTERLETRADOS = ['micro', 'texto', 'titulo', 'display'] as const
export type Interletrado = (typeof INTERLETRADOS)[number]

export const CLASE_INTERLINEADO: Readonly<Record<Interlineado, string>> = {
  micro: 'leading-micro',
  texto: 'leading-texto',
  titulo: 'leading-titulo',
}

export const CLASE_INTERLETRADO: Readonly<Record<Interletrado, string>> = {
  micro: 'tracking-micro',
  texto: 'tracking-texto',
  titulo: 'tracking-titulo',
  display: 'tracking-display',
}

export interface DefinicionDeNivel {
  /** La utilidad del tamaño fijo. Sale de `--text-<nivel>`. */
  readonly claseFija: string
  /** La del `clamp()`, o `null` si el nivel se midió invariante. */
  readonly claseFluida: string | null
  /** El token que declara el tamaño fijo, para trazar la cifra. */
  readonly token: string
  /** El valor declarado en `theme-develop.css`. El instrumento lo relee de ahí. */
  readonly valorFijo: string
  /** Interlineado por defecto — medido en `COMPONENTS.md` §2.1. */
  readonly interlineado: Interlineado
  /** Interletrado por defecto — medido en `COMPONENTS.md` §2.1. */
  readonly interletrado: Interletrado
}

/**
 * Los defaults de interlineado e interletrado NO son estéticos: salen de la
 * columna "tokens que consume" del inventario de los 27 componentes que
 * aparecen en las tres URLs medidas. Donde el inventario no dice nada —`base`,
 * `caption` fuera del chip— se hereda el par de `cuerpo`, que es el régimen de
 * lectura.
 */
export const NIVELES_TIPOGRAFICOS: Readonly<Record<Nivel, DefinicionDeNivel>> = {
  micro: {
    claseFija: 'text-micro',
    claseFluida: 'text-fluido-micro',
    token: '--text-micro',
    valorFijo: '10px',
    interlineado: 'micro',
    interletrado: 'micro',
  },
  caption: {
    claseFija: 'text-caption',
    claseFluida: 'text-fluido-caption',
    token: '--text-caption',
    valorFijo: '12px',
    interlineado: 'texto',
    interletrado: 'texto',
  },
  cuerpo: {
    claseFija: 'text-cuerpo',
    claseFluida: null,
    token: '--text-cuerpo',
    valorFijo: '15px',
    interlineado: 'texto',
    interletrado: 'texto',
  },
  base: {
    claseFija: 'text-base',
    claseFluida: null,
    token: '--text-base',
    valorFijo: '1rem',
    interlineado: 'texto',
    interletrado: 'texto',
  },
  'titulo-s': {
    claseFija: 'text-titulo-s',
    claseFluida: 'text-fluido-titulo-s',
    token: '--text-titulo-s',
    valorFijo: '20px',
    interlineado: 'titulo',
    interletrado: 'texto',
  },
  'titulo-m': {
    claseFija: 'text-titulo-m',
    claseFluida: 'text-fluido-titulo-m',
    token: '--text-titulo-m',
    valorFijo: '32px',
    interlineado: 'titulo',
    interletrado: 'texto',
  },
  'titulo-l': {
    claseFija: 'text-titulo-l',
    claseFluida: 'text-fluido-titulo-l',
    token: '--text-titulo-l',
    valorFijo: '44px',
    interlineado: 'titulo',
    interletrado: 'titulo',
  },
  'titulo-xl': {
    claseFija: 'text-titulo-xl',
    claseFluida: 'text-fluido-titulo-xl',
    token: '--text-titulo-xl',
    valorFijo: '56px',
    interlineado: 'titulo',
    interletrado: 'titulo',
  },
}

/** Los cuatro pesos que el sistema declara. El 300 de Chivo NO está: ver
 *  `REPORTE-S3` y la parada — es un token que falta y no se inventa acá. */
export const PESOS = ['normal', 'medio', 'semi', 'fuerte'] as const
export type Peso = (typeof PESOS)[number]

export const CLASE_PESO: Readonly<Record<Peso, string>> = {
  normal: 'font-normal',
  medio: 'font-medio',
  semi: 'font-semi',
  fuerte: 'font-fuerte',
}

/**
 * MÉTRICAS DE LA FAMILIA — lo que hace urgente la verificación óptica.
 *
 * `chivo` NO se transcribe: `s3-tipografia.invariant.ts` abre
 * `_fuentes/chivo-latin.woff2`, descomprime su directorio de tablas y lee
 * `sxHeight` y `sCapHeight` de la tabla `OS/2`. Estos valores están acá para
 * que el instrumento tenga contra qué comparar lo que lee del binario.
 *
 * `instrumentSans` es la familia del sistema de referencia, y ésa sí es una
 * cita: no tenemos su binario en el repo. Va etiquetada como tal.
 */
export const METRICAS_DE_CHIVO = {
  /** Leído del binario. */
  unidadesPorEm: 1000,
  xHeight: 511,
  capHeight: 686,
} as const

/** [citado, REPORTE-S0.md §"la cap height"] — no hay binario en el repo. */
export const METRICAS_DE_INSTRUMENT_SANS = {
  unidadesPorEm: 1000,
  xHeight: 510,
  capHeight: 720,
} as const

/**
 * El texto de muestra de la ruta de demostración.
 *
 * En Title Case y con minúsculas largas a propósito: es donde la cap height
 * más chica de Chivo se tiene que poder ver. Un texto todo en minúsculas
 * escondería exactamente el efecto que hay que juzgar.
 */
export const MUESTRA_TITULAR = 'Construimos Software que Trabaja'
export const MUESTRA_CUERPO =
  'Cada nivel de la escala se ve acá con el mismo texto, para que la comparación sea entre ' +
  'tamaños y no entre palabras. La banda fluida corre de 375 a 1440 píxeles de viewport.'
export const MUESTRA_MAYUSCULAS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
export const MUESTRA_MINUSCULAS = 'abcdefghijklmnñopqrstuvwxyz'
