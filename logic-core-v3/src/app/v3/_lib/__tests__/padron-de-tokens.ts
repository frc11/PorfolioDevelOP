/**
 * EL PADRÓN DE TOKENS — una sola fuente para "cuántos tokens declara el tema".
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 *
 * `tokens-de-uso.invariant.ts` afirmaba `TOKENS.length === 89` con un literal.
 * Eran 89 cuando se escribió y son 90 desde la corrección aprobada en la parada
 * de S3 —`--color-superficie-translucida`, el papel translúcido que le dio
 * superficie a `--blur-panel`—, así que el instrumento empezó a fallar por
 * crecer bien.
 *
 * **Un instrumento que afirma una cardinalidad escrita a mano se rompe cada vez
 * que el sistema crece legítimamente, y entrena a que se lo actualice sin
 * pensar** — que es la peor cosa que se le puede enseñar a quien lo mantiene.
 *
 * ── Qué hace en lugar de eso ──────────────────────────────────────────────
 *
 * El número NO se declara: se DERIVA del mismo padrón que ya usaba
 * `tokens.invariant.ts` —el original de S0, más una lista de excepciones
 * NOMBRADAS—. La cuenta sale de dos hechos verificables:
 *
 *   · cuántos tokens declara `docs/rediseno/s0/theme-develop.css`, que se
 *     conserva sin tocar justamente para esto;
 *   · qué se aprobó agregar o renombrar después, con su sprint y su motivo.
 *
 * Un renombre no mueve la cuenta (sale uno, entra uno). Un agregado la mueve en
 * uno, y sólo si está declarado acá. **Un token nuevo que no esté en esta lista
 * sigue rompiendo la comprobación, que es exactamente para lo que existe.**
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Cinco niveles: __tests__ → _lib → v3 → app → src → raíz del proyecto. */
export const RAIZ_DEL_PROYECTO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../..',
)

export const ORIGINAL_DE_S0 = path.join(RAIZ_DEL_PROYECTO, 'docs/rediseno/s0/theme-develop.css')
export const TEMA_EN_EL_REPO = path.join(RAIZ_DEL_PROYECTO, 'src/app/theme-develop.css')

/** Quita comentarios para no leer nombres de token citados en prosa. */
export const sinComentarios = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Nombres de custom property DECLARADOS (no referenciados). */
export function declarados(css: string): string[] {
  const encontrados = [...sinComentarios(css).matchAll(/(?:^|[;{}\s])(--[a-zA-Z0-9-]+)\s*:/g)]
  return [...new Set(encontrados.map((m) => m[1]))]
}

export interface Renombre {
  readonly de: string
  readonly a: string
  readonly sprint: string
  readonly motivo: string
}

export interface Agregado {
  readonly token: string
  readonly sprint: string
  readonly motivo: string
}

/**
 * Los renombres aprobados. NO mueven la cardinalidad: sale uno, entra uno.
 */
export const RENOMBRES: readonly Renombre[] = [
  {
    de: '--font-mono',
    a: '--font-codigo',
    sprint: 'S1',
    motivo: '`--font-mono` ya existía en `globals.css` y era la única colisión de nombre contra el sistema viejo.',
  },
]

/**
 * Los agregados aprobados después de S0. **Cada uno mueve la cardinalidad en
 * uno**, y sólo entra acá con aprobación explícita en una parada.
 */
export const AGREGADOS: readonly Agregado[] = [
  {
    token: '--color-superficie-translucida',
    sprint: 'S3',
    motivo:
      'La superficie sobre la cual `--blur-panel` significa algo. S0 había emitido el desenfoque sin emitir la superficie, así que era un token muerto que parecía vivo.',
  },
  {
    token: '--font-display',
    sprint: 'TITULAR',
    motivo:
      'La cuarta familia: Archivo, de la MISMA fundición que Chivo y con la misma cap height (686 sobre 1000, leída de los dos binarios), pero con un eje de ancho que Chivo no tiene. Es la cara de la línea 1 del titular del hero y la única del sistema que se sirve pinchada en un punto del eje `wdth` (62). Sin token, la familia viviría escrita adentro de una clase del Hero.',
  },
  {
    token: '--font-weight-liviano',
    sprint: 'TITULAR',
    motivo:
      'El quinto peso, 300. CIERRA UNA DECISIÓN QUE EL PROPIO TEMA DEJÓ ABIERTA: su bloque de pesos declaraba que el 300 existe en el eje de Chivo y que no se agregaba porque «agregarlo es una decisión de sistema», dejando el dato escrito para cuando hubiera que tomarla. La línea 2 del titular —Chivo Light itálica— la tomó.',
  },
  {
    token: '--text-display',
    sprint: 'TITULAR',
    motivo:
      'El noveno nivel de la escala, 58 px. [derivado] No es «un tamaño más grande»: es el mayor entero que entra en UNA línea en la caja medida del titular (478,40 px a 1440) con el avance del `.woff2` que se sirve (8,5670 em en wdth 62 · wght 700) y el interletrado del nivel (−0,02 em). Con 59 se pasa. La cuenta la vuelve a correr `hero.invariant.tsx` §12b contra el binario.',
  },
  {
    token: '--text-fluido-display',
    sprint: 'TITULAR',
    motivo:
      'La séptima expresión fluida, con EL MISMO método que las seis de S0 y ni una excepción: piso a 375, el token fijo a 1440, la recta evaluada en 1920 como techo. El piso (37 px) también es forzado: es el único entero que a la vez pasa el piso de `titulo-xl` (36, o los dos niveles colisionarían a 375) y entra en una línea en la caja medida a 375 (311,00 px).',
  },
  {
    token: '--text-display-xl',
    sprint: 'TITULAR',
    motivo:
      'El décimo nivel de la escala, 104 px, y el MÁS GRANDE de los diez. [derivado] Es la línea 2 del titular con el mismo método que el noveno: el mayor entero que entra en UNA línea en la caja medida (478,39 px a 1440) con el avance medido de la cara (4,58409 em, Chivo Light itálica) y el interletrado del nivel (−0,03 em). Con 105 se pasa: 481,33 px contra 478,39 de caja. Sube la línea 2 de 44 a 104 px, o sea al 179 % de la línea 1, que queda congelada en 58.',
  },
  {
    token: '--text-fluido-display-xl',
    sprint: 'TITULAR',
    motivo:
      'La octava expresión fluida, con el mismo método y las mismas tres anclas: piso a 375, el token fijo a 1440, la recta evaluada en 1920 como techo. El piso (67 px) también es forzado: es el mayor entero que entra en una línea en la caja medida a 375 (311,00 px; con 68 da 311,7 y se pasa), y pasa de sobra el piso del nivel de abajo (`display`, 37), así que la escala sigue estrictamente creciente en los cuatro anchos.',
  },
]

/** Los tokens que declara el original de S0, leídos del archivo. */
export function tokensDeS0(): string[] {
  return declarados(readFileSync(ORIGINAL_DE_S0, 'utf8'))
}

/** Los tokens que declara el tema del repo, leídos del archivo. */
export function tokensDelRepo(): string[] {
  return declarados(readFileSync(TEMA_EN_EL_REPO, 'utf8'))
}

/**
 * La cardinalidad que el padrón implica. **No es un literal**: es
 * `|S0| + |AGREGADOS|`, porque los renombres no mueven la cuenta.
 */
export function cardinalidadEsperada(): number {
  return tokensDeS0().length + AGREGADOS.length
}

/** El texto con el que se publica la cuenta, para que el número no viaje solo. */
export function comoSeDeriva(): string {
  const s0 = tokensDeS0().length
  const agregados = AGREGADOS.map((a) => `${a.token} (${a.sprint})`).join(', ')
  return `${s0} de S0 + ${AGREGADOS.length} aprobado(s) después [${agregados}] = ${s0 + AGREGADOS.length}`
}
