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
