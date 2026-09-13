/**
 * LOS DIEZ NIVELES TIPOGRÁFICOS — la tabla, sin React.
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
 * completas y literales, aunque se repita el prefijo diez veces.
 *
 * ── Ocho fluidos y dos que no ──────────────────────────────────────────────
 *
 * `cuerpo` (15px) y `base` (1rem) **no tienen contraparte fluida**, y no es un
 * olvido: se midieron INVARIANTES entre 768 y 1920 (`LAYOUT.md`, hueco 7). El
 * sistema tiene tres regímenes conviviendo —53,9% fluido, 21,8% invariante,
 * 10,1% escalonado— y emitir `clamp()` para todos sería tan falso como no
 * emitir ninguno.
 *
 * ── ✅ B7 · LA JERARQUÍA A 375: ACEPTADA. Es una DECISIÓN, no un límite ────
 *
 * **Decisión del dueño del proyecto, en la parada de B7.** B4-B lo publicó como
 * defecto `D8` —«a 375 la escala se comprime a un píxel entre cuatro niveles»—
 * y se cierra como decisión tomada, no como deuda.
 *
 * **La medición, con el instrumento** (`b4/b-tipografia.json`, una sonda por
 * nivel en el DOM vivo leyendo el `font-size` computado). A 375 la banda fluida
 * resuelve `cuerpo 15 → base 16 → titulo-s 17 → titulo-m 18`: **cuatro niveles
 * en tres píxeles**. Los saltos `base → titulo-s` y `titulo-s → titulo-m` valen
 * **×1,06 y ×1,06** a 375, contra **×1,33 y ×1,79** a 1920. Ningún nivel
 * colapsa —no hay dos con el mismo px— pero la jerarquía por TAMAÑO
 * prácticamente desaparece en el piso de la banda.
 *
 * **Y no es un descuido: es la consecuencia de tres restricciones que ya están
 * en su mínimo.** El piso de `titulo-s` es **17 px**, y `theme-develop.css` lo
 * declara como *«el ÚNICO entero que a la vez pasa `--text-base` (16) y se queda
 * abajo del piso de `titulo-m` (18)»* — con 18 los dos niveles colisionarían en
 * el otro extremo, que es el defecto de vuelta.
 *
 * **Las tres salidas, con su número, para que la decisión sea revocable:**
 *
 *   1. **Bajar `--text-cuerpo` (15 px).** Abriría el salto por abajo, y gobierna
 *      las ocho secciones. ⚠️ **Es el mismo texto que `D-B5.1` tiene al borde
 *      del contraste**: 33,61 % de sus píxeles bajo AA a 1440 con el cuerpo
 *      actual. Achicarlo empeora un defecto de accesibilidad abierto para
 *      arreglar uno de composición. **Descartada por eso.**
 *   2. **Subir el piso de `titulo-m` (18 px).** Aplanaría su banda: los seis
 *      techos salen de medición y están anclados a 1440, así que subir el piso
 *      acorta el recorrido fluido del nivel que más recorre (×1,79 a 1920).
 *      **Descartada por eso.**
 *   3. **Aceptarlo.** A 375 la jerarquía la llevan **el peso, el color y el
 *      aire**, que es lo que de hecho pasa, y **una diferencia de un píxel no la
 *      ve nadie**. Es la que se tomó.
 *
 * ⚠️ **Esto NO es un umbral aflojado ni un pendiente reetiquetado.** La cifra
 * sigue publicada y sigue siendo la misma; lo que cambió es que hay una decisión
 * escrita al lado. Si algún día el criterio es otro, las tres salidas están acá
 * con lo que cuesta cada una.
 *
 * ── El pendiente óptico que la ruta /v3/tipografia destraba ────────────────
 *
 * Nadie miró los diez niveles renderizados, ni en la familia original ni en
 * Chivo. Y hay una razón concreta para que urja: la cap height de Chivo es más
 * chica. Los números están en `METRICAS_DE_CHIVO`, y no están transcritos de
 * un reporte: `s3-tipografia.invariant.ts` los lee del `.woff2` que /v3 sirve.
 */

/**
 * Los DIEZ nombres, en orden creciente. El instrumento afirma la cardinalidad
 * y, en los cuatro anchos de la banda, que la escala es estrictamente creciente
 * en ESTE orden.
 *
 * ⚠️ **`display` ES EL NOVENO, y entró con el titular del hero rehecho.** Los
 * ocho de S0 son la escala MEDIDA de una sola familia; `display` es un nivel
 * [derivado] de OTRA —Archivo, la cara condensada— y su valor sale de una
 * cuenta, no de un barrido: el mayor entero que entra en una línea en la caja
 * medida del titular. La cuenta entera está en `theme-develop.css`, al lado del
 * token, y `hero.invariant.tsx` la vuelve a correr.
 *
 * Está último porque es el más grande en los cuatro anchos, y eso NO es una
 * coincidencia que haya que vigilar a mano: `s3-tipografia` §6 afirma que los
 * diez crecen estrictamente en el orden de esta lista, así que si algún día
 * `display` cayera abajo de `titulo-xl` la comprobación se pone roja.
 */
export const NIVELES = [
  'micro',
  'caption',
  'cuerpo',
  'base',
  'titulo-s',
  'titulo-m',
  'titulo-l',
  'titulo-xl',
  'display',
  'display-xl',
] as const

export type Nivel = (typeof NIVELES)[number]

/** Los tres multiplicadores de interlineado del sistema. */
export const INTERLINEADOS = ['micro', 'texto', 'titulo'] as const
export type Interlineado = (typeof INTERLINEADOS)[number]

/** Los cuatro de interletrado. `display` era el único que ningún componente
 *  medido consumía —se ejercitaba sólo en la ruta de demostración— y desde el
 *  titular del hero rehecho es el default del nivel `display`, o sea que tiene
 *  un consumidor en una de las ocho secciones. */
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
  /**
   * EL NIVEL DE DISPLAY. Su interletrado por defecto es `display` y eso le da
   * al único token de interletrado que el sistema declaraba **sin un solo
   * consumidor medido** su primer consumidor de verdad (ver `INTERLETRADOS`).
   * No es una casualidad aprovechada: −0,02 em es el valor con el que se derivó
   * el 58, así que el default de la tabla y la cuenta del token son el MISMO
   * número. Si alguien lo cambia acá, el 58 deja de entrar y el invariante del
   * hero lo dice.
   */
  display: {
    claseFija: 'text-display',
    claseFluida: 'text-fluido-display',
    token: '--text-display',
    valorFijo: '58px',
    interlineado: 'titulo',
    interletrado: 'display',
  },
  /**
   * EL DÉCIMO NIVEL — la línea 2 del titular, y **el más grande de la escala**.
   * Su interletrado por defecto es `titulo` (−0,03 em) y NO `display`: es con el
   * que se derivó el 104, así que el default de la tabla y la cuenta del token
   * son el MISMO número. Los dos registros llevan interletrados distintos
   * porque son dos caras distintas, y cada cuenta salió del suyo. */
  'display-xl': {
    claseFija: 'text-display-xl',
    claseFluida: 'text-fluido-display-xl',
    token: '--text-display-xl',
    valorFijo: '104px',
    interlineado: 'titulo',
    interletrado: 'titulo',
  },
}

/** Los CINCO pesos que el sistema declara. El 300 de Chivo entró con la línea 2
 *  del titular del hero, que lo pide por su nombre —Light itálica—; hasta ese
 *  pedido era un token que faltaba y que `REPORTE-S3` dejó escrito sin
 *  inventar. El porqué completo, en `theme-develop.css`. */
export const PESOS = ['liviano', 'normal', 'medio', 'semi', 'fuerte'] as const
export type Peso = (typeof PESOS)[number]

export const CLASE_PESO: Readonly<Record<Peso, string>> = {
  liviano: 'font-liviano',
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
