/**
 * EL SOPORTE DE `s9-instrumentos.invariant.ts` — los escáneres, sin las
 * afirmaciones.
 *
 * ── Por qué está partido ───────────────────────────────────────────────────
 *
 * Por la regla de las 300 líneas, y porque las dos mitades se leen distinto: acá
 * están los INSTRUMENTOS —qué se mira y cómo— y al lado están las CIFRAS y lo
 * que se afirma de ellas. Un archivo solo mezclaría "cómo se cuenta" con "cuánto
 * dio", que son las dos cosas que este sprint viene justamente a separar.
 *
 * Nada de acá afirma nada. Si un escáner devuelve vacío, el invariante lo
 * detecta con su control positivo; ése es el reparto.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { RAIZ } from './s4-corrida'

export const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')
export const existe = (rel: string): boolean => existsSync(path.join(RAIZ, rel))

/**
 * Los archivos del lane de la ESCENA, derivados de `package.json` — no listados.
 *
 * Misma disciplina que `s4-suites.ts`: una lista escrita a mano no se queja de
 * lo que le falta, y acá lo que falta sería un archivo con el marcador viejo que
 * el barrido no tocó. El lane es `test:sNe-<algo>`, que es lo que distingue a
 * las ocho suites de la escena de las del sitio.
 */
export function archivosDelLaneDeLaEscena(): string[] {
  const datos: unknown = JSON.parse(leer('package.json'))
  const scripts =
    typeof datos === 'object' && datos !== null && 'scripts' in datos
      ? (datos as { scripts: Record<string, unknown> }).scripts
      : {}
  const rutas: string[] = []
  for (const [script, comando] of Object.entries(scripts)) {
    if (typeof comando !== 'string' || !/^test:s\d+e-/.test(script)) continue
    const forma = /^npx tsx\s+(?:"([^"]+)"|(\S+))\s*$/.exec(comando)
    if (forma === null) continue
    rutas.push(forma[1] ?? forma[2])
  }
  return rutas.sort()
}

/**
 * Cuántas etiquetas de `check()` abren con el marcador, en el FUENTE.
 *
 * Se cuenta sobre el código y no sobre la salida por una razón de costo: la
 * salida sale de correr 34 procesos, y este invariante corre en el mismo
 * agregado que ellos. El número estático y el de la corrida se compararon a mano
 * en SITIO-S9 y dieron lo mismo (36 y 36); lo que el invariante custodia es que
 * el estático no se mueva sin que alguien lo declare.
 */
export function etiquetasMarcadas(fuente: string): number {
  return (fuente.match(/check\(\s*'control positivo\b/g) ?? []).length
}

/** Los títulos de `section()` de un fuente, en orden. */
export function titulosDeSeccion(fuente: string): string[] {
  return [...fuente.matchAll(/section\(\s*(['"`])([\s\S]*?)\1\s*\)/g)].map((m) => m[2])
}

/** ¿Este texto se declara a sí mismo un control positivo? */
export function reclamaSerControl(texto: string): boolean {
  return /control(es)?\s+positivos?/i.test(texto)
}

/**
 * El bloque §7.13 de `DIRECCION-ESCENA.md`, del `13.` al `14.` de la §7.
 *
 * Se corta por la numeración del documento y no por un `slice` de líneas: un
 * documento que crece arriba movería los números y el escáner leería otra cosa
 * sin quejarse.
 */
export function bloque713(documento: string): string {
  const desde = documento.indexOf('\n13. **DEUDA DE TAMAÑO')
  if (desde === -1) return ''
  const hasta = documento.indexOf('\n14. ', desde + 1)
  return hasta === -1 ? documento.slice(desde) : documento.slice(desde, hasta)
}

/** Las rutas repo-relativas que un texto nombra entre acentos graves. */
export function rutasQueNombra(texto: string): string[] {
  return [...new Set([...texto.matchAll(/`(src\/[A-Za-z0-9_@./[\]-]+\.(?:tsx?|css|json))`/g)].map((m) => m[1]))].sort()
}

/** Las líneas de un texto, con la cuenta de `wc -l`. Igual que `s8-largos.ts`. */
export { contarLineas } from './s8-largos'

/**
 * El valor de una declaración CSS, sin comentarios ni el `;`.
 *
 * Devuelve `null` si no está: la diferencia entre «vale otra cosa» y «no existe»
 * la tiene que ver el invariante, no adivinarla el escáner.
 */
export function declaracionCss(css: string, propiedad: string): string | null {
  const re = new RegExp(`(?:^|[;{\\s])${propiedad}\\s*:\\s*([^;}]+)`, 'm')
  const m = re.exec(css.replace(/\/\*[\s\S]*?\*\//g, ''))
  return m === null ? null : m[1].trim()
}

/** `4rem` → 64, `24px` → 24. `null` si la unidad no es una de esas dos. */
export function aPx(valor: string, raizPx = 16): number | null {
  const m = /^(-?\d+(?:\.\d+)?)(rem|px)$/.exec(valor.trim())
  if (m === null) return null
  return m[2] === 'rem' ? Number.parseFloat(m[1]) * raizPx : Number.parseFloat(m[1])
}

/** ¿El fuente importa un VALOR de ese especificador, o sólo un tipo? */
export function importaValorDe(fuente: string, aguja: string): boolean {
  for (const m of fuente.matchAll(/^import\s+(type\s+)?[\s\S]*?from\s*'([^']+)'/gm)) {
    if (m[2].includes(aguja) && m[1] === undefined) return true
  }
  return false
}

/**
 * Los usos de un identificador que NO están en posición de tipo.
 *
 * Es deliberadamente conservador: lo que busca es el nombre precedido por algo
 * que sólo aparece en código —`new`, `(`, `=`— y no la ausencia de `:`. Un
 * detector optimista acá diría «cero bytes» sin haber mirado, que es exactamente
 * la afirmación de memoria que este sprint viene a reemplazar por una medida.
 */
export function usosDeValor(fuente: string, nombre: string): string[] {
  const sinComentarios = fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  const re = new RegExp(`(?:new\\s+|=\\s*|\\(\\s*|\\breturn\\s+)${nombre}\\b`, 'g')
  return [...sinComentarios.matchAll(re)].map((m) => m[0])
}

/**
 * TODOS los imports del fuente, con el especificador y si es de TIPO.
 *
 * ⚠ **Existe porque `importaValorDe` contesta otra pregunta, y en SITIO-S11 la
 * pregunta cambió.** Mientras el acoplamiento hacia `/probe-escena` era la
 * situación a medir, lo que importaba era «¿cuesta bytes?», y para eso alcanzaba
 * con mirar los imports de VALOR: un `import type` costaba cero y podía quedarse.
 * Con el acoplamiento CERRADO la propiedad que hay que custodiar es más fuerte
 * —**ninguna referencia al panel, ni siquiera de tipo**— y un detector que sólo
 * mira valores la daría por buena con el import viejo de vuelta en su lugar.
 *
 * Los comentarios se descartan antes de escanear: los tres docblocks que
 * cuentan la historia del acoplamiento **citan el especificador viejo**, y un
 * escáner que los leyera reportaría un import que no existe.
 */
export type ImportLeido = { readonly especificador: string; readonly soloTipo: boolean }

export function importsDe(fuente: string): ImportLeido[] {
  return [...sinComentarios(fuente).matchAll(/^import\s+(type\s+)?[^'"]*?from\s*'([^']+)'/gm)].map((m) => ({
    especificador: m[2],
    soloTipo: m[1] !== undefined,
  }))
}

/** ¿El fuente nombra ese especificador en ALGÚN import — de tipo o de valor? */
export function importaDe(fuente: string, aguja: string): boolean {
  return importsDe(fuente).some((leido) => leido.especificador.includes(aguja))
}

/** ¿El fuente DECLARA ese tipo, o sea que es el dueño del contrato? */
export function declaraTipo(fuente: string, nombre: string): boolean {
  return new RegExp(`^export type ${nombre} = `, 'm').test(sinComentarios(fuente))
}

/**
 * ¿El fuente RE-EXPORTA ese tipo, trayéndolo de ese otro módulo?
 *
 * **Pide las dos mitades y no una**, y ahí está toda la gracia: que lo traiga
 * con `import type … from <desde>` **y** que lo vuelva a sacar con
 * `export type { … }`. La segunda mitad sola la cumple también un archivo que
 * DECLARA el tipo y lo exporta —o sea el estado ANTERIOR al arreglo—, así que un
 * detector de media regla no sabría distinguir el antes del después, que es
 * exactamente lo único que este instrumento tiene que poder decir.
 */
export function reexportaTipoDesde(fuente: string, nombre: string, desde: string): boolean {
  const limpio = sinComentarios(fuente)
  const traido = [...limpio.matchAll(/^import\s+type\s*\{([^}]*)\}\s*from\s*'([^']+)'/gm)].some(
    (m) => m[2].includes(desde) && nombresEnLlaves(m[1]).includes(nombre),
  )
  const sacado = [...limpio.matchAll(/^export\s+type\s*\{([^}]*)\}/gm)].some((m) =>
    nombresEnLlaves(m[1]).includes(nombre),
  )
  return traido && sacado
}

/** Los nombres de una lista entre llaves, sin el `as` y sin los vacíos. */
function nombresEnLlaves(cuerpo: string): string[] {
  return cuerpo
    .split(',')
    .map((pieza) => pieza.trim().split(/\s+as\s+/)[0].trim())
    .filter((pieza) => pieza.length > 0)
}

/** El fuente sin bloques ni comentarios de línea. */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

/**
 * Los archivos del PANEL que siguen trayendo alguno de esos tipos desde
 * `./choreographyEditor`, o sea los que la re-exportación sostiene.
 *
 * ⚠ **Se derivan del disco, no de una lista escrita a mano** (regla 14). Una
 * lista fija diría siete para siempre: el día que alguien migre un consumidor al
 * módulo de la escena —o borre uno— el número tiene que moverse solo, porque lo
 * que se afirma con él es que la re-exportación NO es decorativa.
 */
export function consumidoresDelPanel(nombres: readonly string[]): string[] {
  const carpeta = 'src/app/probe-escena/_components'
  return readdirSync(path.join(RAIZ, carpeta))
    .filter((archivo) => archivo.endsWith('.ts') || archivo.endsWith('.tsx'))
    .map((archivo) => `${carpeta}/${archivo}`)
    .filter((rel) =>
      [...sinComentarios(leer(rel)).matchAll(/^import\s+type\s*\{([^}]*)\}\s*from\s*'\.\/choreographyEditor'/gm)].some(
        (m) => nombresEnLlaves(m[1]).some((nombre) => nombres.includes(nombre)),
      ),
    )
    .sort()
}
