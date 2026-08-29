/**
 * LA PODA DE TAILWIND, Y EL TESTIGO QUE LA DEMUESTRA.
 *
 * Vive fuera de `tokens.invariant.ts` por dos motivos: el archivo ya estaba en
 * 463 líneas contra un límite de 300, y porque el testigo tiene una regla de
 * construcción que hay que poder leer sin atravesar siete secciones.
 *
 * ── EL TESTIGO ES SINTÉTICO, Y NO ES UN CAPRICHO ──────────────────────────
 *
 * La afirmación que este módulo custodia es "la poda de Tailwind es real":
 * con `@theme` a secas hay tokens declarados que NO llegan al `:root`, y con
 * `@theme static` llegan todos. Se demuestra señalando un token que se poda.
 *
 * **Ese testigo se agotó dos veces en dos sprints seguidos.**
 *
 *   · S1 lo puso en las seis expresiones fluidas (`--text-fluido-*`), que
 *     ningún componente consumía todavía. Medía 21 podados de 89.
 *   · S3 construyó la tipografía, les dio consumidor a las seis, y el testigo
 *     tuvo que mudarse a `--radius-medio` y `--radius-fuerte`.
 *   · S2 —mergeado después— le dio consumidor también a los radios. **Hoy se
 *     podan 0 de 90.**
 *
 * O sea: **cualquier token real del sistema es un mal testigo por
 * construcción**, porque el trabajo normal de los sprints es justamente darle
 * consumidor a los tokens. Un testigo así no se rompe cuando algo anda mal: se
 * rompe cuando todo anda bien.
 *
 * Por eso el testigo de acá es un token INVENTADO, que se inyecta en el fixture
 * en memoria —el archivo del repo no se toca— y que **nadie puede consumir sin
 * escribir su nombre**. Y su nombre no está escrito en ninguna parte: se arma
 * por concatenación en `testigosSinteticos()`, así que el escáner de Tailwind
 * —que decide qué podar mirando si el nombre aparece en `src/`— no lo ve.
 *
 * Si algún día alguien lo escribe, la comprobación falla y el arreglo es
 * gratis: se cambia el nombre inventado. Con un token real no había arreglo
 * gratis, y por eso este sprint es el tercero que toca lo mismo.
 *
 * ── POR QUÉ `@theme static` SIGUE SIENDO NECESARIO CON 0 PODADOS ──────────
 *
 * Porque **la poda es por uso, no por diseño**. Que hoy se poden 0 de 90 no
 * dice que Tailwind dejó de podar: dice que hoy los 90 tienen consumidor. El
 * primer token que quede sin consumidor —uno nuevo que todavía no se usa, o uno
 * viejo cuyo último consumidor se borró— se va a podar, y va a desaparecer del
 * `:root` sin que nada falle, sin error de build y sin diff.
 *
 * El testigo sintético lo demuestra en cada corrida: es exactamente un token
 * sin consumidor, y se poda. **`@theme static` es lo que hace que el sistema de
 * diseño en el navegador no dependa de qué componentes existan ese día.**
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { RAIZ_DEL_PROYECTO, sinComentarios } from './padron-de-tokens'

const GLOBALS = path.join(RAIZ_DEL_PROYECTO, 'src/app/globals.css')
const globals = readFileSync(GLOBALS, 'utf8')

/**
 * LOS DOS TESTIGOS, ARMADOS POR PARTES.
 *
 * ⚠ NO escribir estos nombres completos en ningún archivo de `src/`. Tailwind
 * decide qué tokens conservar escaneando el proyecto: si el nombre aparece
 * entero en cualquier archivo escaneado, el token deja de podarse y el testigo
 * nace muerto. Es el mismo mecanismo que hizo que S1 midiera 21 podados en vez
 * de 24 por nombrar tres tokens en una afirmación.
 *
 *   · propio — en un namespace que no existe en el tema. Demuestra que la poda
 *     sigue pasando, sin depender de ningún token real.
 *   · enFamiliaDeColor — en la familia `--color-*`, la más consumida del
 *     sistema. Demuestra que la poda es POR USO Y NO POR NAMESPACE: convive con
 *     `--color-fondo`, que sobrevive, y se poda igual.
 */
export interface Testigos {
  readonly propio: string
  readonly enFamiliaDeColor: string
}

export function testigosSinteticos(): Testigos {
  return {
    propio: ['--testigo', 'de', 'poda', 'sin', 'consumidor'].join('-'),
    enFamiliaDeColor: ['--color', 'testigo', 'sin', 'consumidor'].join('-'),
  }
}

/** Los dos testigos, inyectados en el bloque @theme del cuerpo que se le pase. */
export function conTestigos(cuerpoDelTema: string): string {
  const apertura = /^@theme[^\n{]*\{/m
  if (!apertura.test(cuerpoDelTema)) {
    throw new Error('el cuerpo del tema no abre con un bloque @theme: no hay dónde inyectar los testigos')
  }
  const t = testigosSinteticos()
  return cuerpoDelTema.replace(
    apertura,
    (linea) => `${linea}
  ${t.propio}: 1px;
  ${t.enFamiliaDeColor}: #ABCDEF;`,
  )
}

/**
 * Compila por EL PIPELINE REAL: `@tailwindcss/postcss` sobre el `globals.css`
 * de este repo, que es literalmente lo que corre `next build`.
 *
 * ⚠ NO se usa la API `compile()` de `tailwindcss/dist/lib.mjs`, y hay una razón
 * medida: sin el escaneo de fuentes que hace el plugin, esa API no ve casi
 * ningún candidato y poda de más — dio 80 de 89 contra los ~21 del pipeline.
 * Es un artefacto del arnés, no del framework, y estuvo a punto de publicarse
 * como la cifra que retracta a S0. Medir la poda con un compilador que no
 * escanea el proyecto es medir otra cosa.
 *
 * ⚠ `from` DISTINTO por corrida: el plugin cachea el resultado por ruta de
 * entrada. Con el mismo `from`, la segunda corrida devuelve el CSS de la
 * primera y las tres variantes dan el mismo número — un falso "no poda". Lo
 * cazó el control positivo del detector, no una relectura.
 */
interface PluginPostcss {
  (opciones: { optimize: boolean }): unknown
}
interface Postcss {
  (plugins: unknown[]): { process: (css: string, opciones: { from: string; to: string }) => Promise<{ css: string }> }
}

let corrida = 0
export async function emitirCss(cuerpoDelTema: string): Promise<string> {
  corrida += 1
  const url = (rel: string): string => `file://${path.join(RAIZ_DEL_PROYECTO, rel).replace(/\\/g, '/')}`
  const postcss = ((await import(/* webpackIgnore: true */ url('node_modules/postcss/lib/postcss.mjs'))) as { default: Postcss }).default
  const tw = ((await import(/* webpackIgnore: true */ url('node_modules/@tailwindcss/postcss/dist/index.mjs'))) as { default: PluginPostcss }).default
  const entrada = globals.replace('@import "./theme-develop.css";', cuerpoDelTema)
  const res = await postcss([tw({ optimize: false })]).process(entrada, {
    from: path.join(RAIZ_DEL_PROYECTO, 'src/app', `.invariante-${corrida}.css`),
    to: path.join(RAIZ_DEL_PROYECTO, `.invariante-salida-${corrida}.css`),
  })
  return res.css
}

/** Los nombres declarados en el `:root` de la capa `theme`, sin comentarios. */
export function tokensDelRoot(css: string): Set<string> | null {
  const limpio = sinComentarios(css)
  const i = limpio.indexOf('@layer theme')
  if (i < 0) return null
  const j = limpio.indexOf('{', limpio.indexOf('{', i) + 1)
  let prof = 1
  let k = j + 1
  while (k < limpio.length && prof > 0) {
    if (limpio[k] === '{') prof += 1
    else if (limpio[k] === '}') prof -= 1
    k += 1
  }
  return new Set([...limpio.slice(j + 1, k - 1).matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]))
}

/**
 * Los nombres de `esperados` que NO llegan al `:root` al compilar `cuerpo`.
 * Si la capa `theme` no existe, devuelve todos: no hay "verde por vacío".
 */
export async function ausentesDelRoot(cuerpo: string, esperados: readonly string[]): Promise<string[]> {
  const enRoot = tokensDelRoot(await emitirCss(cuerpo))
  if (enRoot === null) return [...esperados]
  return esperados.filter((n) => !enRoot.has(n))
}
