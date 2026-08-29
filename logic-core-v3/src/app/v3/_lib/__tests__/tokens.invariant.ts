/**
 * INVARIANTE — los 89 tokens de S0 entraron enteros, y las cuatro diferencias
 * son EXACTAMENTE las cuatro aprobadas en la Parada 1.
 *
 * Corre con `npm run test:s1-tokens`.
 *
 * Qué afirma, y por qué cada cosa:
 *
 *   1. El archivo del repo declara los mismos 89 tokens que el original de S0,
 *      salvo el renombre aprobado. Un token perdido en la copia es un token
 *      que nadie va a extrañar hasta que algo se vea mal.
 *   2. Las diferencias de VALOR contra el original son exactamente 12 líneas:
 *      3 familias + 9 espaciados. Ni una más.
 *   3. `@theme static` — y las tres variantes compiladas, con sus números.
 *      Es la medición que corrige a S0 y no se puede dejar como prosa.
 *   4. `@theme inline` rompe el override contextual. Es la regla no negociable
 *      del sprint y acá queda medida, no citada.
 *   5. Una sola colisión de nombre contra `globals.css`, y está resuelta.
 *   6. Los nueve `--spacing-*` en rem computan el MISMO píxel que los px de S0
 *      con raíz 16, y las quince utilidades afectadas también.
 *   7. El umbral de la compuerta y `--breakpoint-escritorio` dicen lo mismo.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { ESCENARIO_MIN_ANCHO_PX } from '../compuerta'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')
const ORIGINAL_S0 = path.join(RAIZ, 'docs/rediseno/s0/theme-develop.css')
const EN_EL_REPO = path.join(RAIZ, 'src/app/theme-develop.css')
const GLOBALS = path.join(RAIZ, 'src/app/globals.css')

const original = readFileSync(ORIGINAL_S0, 'utf8')
const enElRepo = readFileSync(EN_EL_REPO, 'utf8')
const globals = readFileSync(GLOBALS, 'utf8')

/** Quita comentarios para no leer nombres de token citados en prosa. */
const sinComentarios = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Nombres de custom property DECLARADOS (no referenciados). */
function declarados(css: string): string[] {
  const encontrados = [...sinComentarios(css).matchAll(/(?:^|[;{}\s])(--[a-zA-Z0-9-]+)\s*:/g)]
  return [...new Set(encontrados.map((m) => m[1]))]
}

/** Las líneas de declaración, ya sin comentarios ni vacías. */
function declaraciones(css: string): string[] {
  return sinComentarios(css)
    .split('\n')
    .map((l) => l.replace(/\/\*[\s\S]*?\*\//g, '').trim())
    .filter((l) => l.length > 0)
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
async function emitirCss(cuerpoDelTema: string): Promise<string> {
  corrida += 1
  const url = (rel: string): string => `file://${path.join(RAIZ, rel).replace(/\\/g, '/')}`
  const postcss = ((await import(/* webpackIgnore: true */ url('node_modules/postcss/lib/postcss.mjs'))) as { default: Postcss }).default
  const tw = ((await import(/* webpackIgnore: true */ url('node_modules/@tailwindcss/postcss/dist/index.mjs'))) as { default: PluginPostcss }).default
  const entrada = globals.replace('@import "./theme-develop.css";', cuerpoDelTema)
  const res = await postcss([tw({ optimize: false })]).process(entrada, {
    from: path.join(RAIZ, 'src/app', `.invariante-${corrida}.css`),
    to: path.join(RAIZ, `.invariante-salida-${corrida}.css`),
  })
  return res.css
}

/** Los nombres declarados en el `:root` de la capa `theme`, sin comentarios. */
function tokensDelRoot(css: string): Set<string> | null {
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

async function principal(): Promise<void> {
  // ─────────────────────────────────────────────────────────────────────────
  titulo('1 · Los 89 tokens llegaron enteros, más la corrección de S3')

  /**
   * ⚠ ACTUALIZADO POR S3 (2026-08-29), con aprobación en su parada.
   *
   * S3 agregó UN token: `--color-superficie-translucida`, la superficie sobre
   * la cual `--blur-panel` significa algo. S0 había emitido el desenfoque sin
   * emitir la superficie, así que era un token muerto que parecía vivo.
   *
   * El conteo NO se subió a 90 a secas, y la diferencia importa: eso
   * convertiría este invariante en un contador y dejaría entrar cualquier
   * token futuro. Lo que se hace es nombrar la excepción. Un token nuevo que
   * no sea éste sigue rompiendo la comprobación, que es para lo que existe.
   */
  const AGREGADOS_POR_S3 = ['--color-superficie-translucida']

  const nombresS0 = declarados(original)
  const nombresRepo = declarados(enElRepo)
  afirmarIgual(nombresS0.length, 89, 'S0 declara 89 tokens')
  afirmarIgual(
    nombresRepo.length,
    89 + AGREGADOS_POR_S3.length,
    `el archivo del repo declara ${89 + AGREGADOS_POR_S3.length}: los 89 de S0 más ${AGREGADOS_POR_S3.length} de S3`,
  )

  const perdidos = nombresS0.filter((n) => n !== '--font-mono' && !nombresRepo.includes(n))
  afirmarIgual(perdidos, [], 'ningún token de S0 se perdió en la copia')

  const agregados = nombresRepo.filter(
    (n) => n !== '--font-codigo' && !nombresS0.includes(n) && !AGREGADOS_POR_S3.includes(n),
  )
  afirmarIgual(agregados, [], 'no se agregó ningún token fuera de la corrección declarada')

  const declaradosQueNoEstan = AGREGADOS_POR_S3.filter((n) => !nombresRepo.includes(n))
  afirmarIgual(declaradosQueNoEstan, [], 'y la corrección de S3 está donde dice estar')

  controlPositivo(
    'el filtro de agregados vería un token que nadie declaró',
    '--token-colado-por-la-ventana',
    (nombre) =>
      [...nombresRepo, nombre].filter(
        (n) => n !== '--font-codigo' && !nombresS0.includes(n) && !AGREGADOS_POR_S3.includes(n),
      ).length === 0,
  )

  afirmar(!nombresRepo.includes('--font-mono'), 'CAMBIO 2 — `--font-mono` ya no se declara acá')
  afirmar(nombresRepo.includes('--font-codigo'), 'CAMBIO 2 — `--font-codigo` ocupa su lugar')

  controlPositivo(
    'el detector de tokens ve un token faltante',
    declarados(original.replace('--color-foco: var(--color-tinta);', '')),
    (lista) => lista.includes('--color-foco'),
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('2 · Las diferencias contra el original de S0 son exactamente las aprobadas')

  const declS0 = declaraciones(original)
  const declRepo = declaraciones(enElRepo)
  const soloEnS0 = declS0.filter((l) => !declRepo.includes(l))
  const soloEnRepo = declRepo.filter((l) => !declS0.includes(l))

  const ESPERADO_FUERA = [
    '@theme {',
    '--font-titulo: "Chivo", system-ui, sans-serif;',
    '--font-cuerpo: "Chivo", system-ui, sans-serif;',
    '--font-mono: "Chivo Mono", ui-monospace, monospace;',
    '--spacing-1: 4px;',
    '--spacing-2: 8px;',
    '--spacing-3: 12px;',
    '--spacing-4: 16px;',
    '--spacing-5: 20px;',
    '--spacing-6: 24px;',
    '--spacing-8: 32px;',
    '--spacing-12: 48px;',
    '--spacing-20: 80px;',
    '--text-base: 16px;',
  ]
  const ESPERADO_DENTRO = [
    '@theme static {',
    '--font-titulo: var(--font-v3-chivo), system-ui, sans-serif;',
    '--font-cuerpo: var(--font-v3-chivo), system-ui, sans-serif;',
    '--font-codigo: var(--font-v3-chivo-mono), ui-monospace, monospace;',
    '--spacing-1: 0.25rem;',
    '--spacing-2: 0.5rem;',
    '--spacing-3: 0.75rem;',
    '--spacing-4: 1rem;',
    '--spacing-5: 1.25rem;',
    '--spacing-6: 1.5rem;',
    '--spacing-8: 2rem;',
    '--spacing-12: 3rem;',
    '--spacing-20: 5rem;',
    '--text-base: 1rem;',
    // ⚠ AGREGADO POR S3 (2026-08-29), aprobado en su parada: la superficie
    // translúcida que le faltaba a `--blur-panel`. Son DOS líneas porque el
    // token se declara en el tema claro y se redefine en la sección invertida.
    '--color-superficie-translucida: rgba(247, 247, 245, 0.60);',
    '--color-superficie-translucida: rgba(14, 14, 14, 0.60);',
    // La regla de foco que agrega S1. Su `}` de cierre NO aparece acá porque
    // esa línea ya existe idéntica en el archivo de S0 — el comparador es de
    // conjuntos, no de posiciones.
    '[data-v3] :focus-visible,',
    '[data-v3]:focus-visible {',
    'outline: var(--foco-grosor) solid var(--color-foco);',
    'outline-offset: var(--foco-desplazamiento);',
  ]
  afirmarIgual(soloEnS0.sort(), [...ESPERADO_FUERA].sort(), `las ${ESPERADO_FUERA.length} líneas que salieron son las previstas`)
  afirmarIgual(soloEnRepo.sort(), [...ESPERADO_DENTRO].sort(), `las ${ESPERADO_DENTRO.length} líneas que entraron son las previstas`)

  controlPositivo(
    'el comparador de declaraciones ve una línea cambiada',
    declaraciones(enElRepo.replace('--radius-sutil: 4px;', '--radius-sutil: 99px;')),
    (lista) => lista.includes('--radius-sutil: 4px;'),
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('3 · `@theme static`, y las tres variantes medidas')

  afirmar(/^@theme static \{/m.test(enElRepo), 'CAMBIO 1 — el bloque abre con `@theme static`')
  // Sobre el texto SIN comentarios: el archivo menciona `@theme inline` varias
  // veces en prosa, justamente para explicar por qué no se usa.
  afirmar(
    !/@theme\s+inline/.test(sinComentarios(enElRepo)),
    'nunca `@theme inline` — regla no negociable del sprint',
  )

  const cuerpoRepo = enElRepo
  const cuerpoLlano = enElRepo.replace(/^@theme static \{/m, '@theme {')
  const cuerpoInline = enElRepo.replace(/^@theme static \{/m, '@theme inline {')

  // CONTROL POSITIVO DEL DETECTOR, antes de creerle un solo número: si le saco
  // un token al tema, ¿lo ve ausente? Sin esto, "0 ausentes" es indistinguible
  // de un detector que mira el lugar equivocado.
  const rootMutilado = tokensDelRoot(await emitirCss(cuerpoRepo.replace('--color-superficie-3: #DBDBD9;', '')))
  afirmar(
    rootMutilado !== null && !rootMutilado.has('--color-superficie-3') && rootMutilado.has('--color-superficie-2'),
    '[control positivo] el detector ve ausente un token borrado, y presente uno que no borré',
    `${rootMutilado?.size ?? 0} tokens en el :root de la corrida mutilada`,
  )

  const ausentes = async (cuerpo: string): Promise<string[]> => {
    const enRoot = tokensDelRoot(await emitirCss(cuerpo))
    if (enRoot === null) return nombresRepo
    return nombresRepo.filter((n) => !enRoot.has(n))
  }

  const cssStatic = await emitirCss(cuerpoRepo)
  const cssInline = await emitirCss(cuerpoInline)

  afirmarIgual((await ausentes(cuerpoRepo)).length, 0, '`@theme static` — los 89 llegan al :root')

  /**
   * LA MEDICIÓN QUE CORRIGE A S0. Tailwind 4.3.1 SÍ poda, y poda POR USO.
   *
   * ⚠ NO SE AFIRMA UN NÚMERO EXACTO, Y LA RAZÓN ES UN HALLAZGO DEL SPRINT:
   * el conteo es INESTABLE POR CONSTRUCCIÓN. Tailwind escanea `src/` entero, y
   * este archivo está adentro de `src/`. Al escribir los nombres
   * `--radius-pastilla-l`, `--ease-principal` y `--grilla-canal-compacto` como
   * literales en una afirmación, esos tres DEJARON DE PODARSE: el conteo pasó
   * de 24 a 21 sin que cambiara una línea del tema. El instrumento estaba
   * creando lo que medía.
   *
   * Es la misma clase de contaminación que la lección del `distDir` fuera de
   * `.gitignore`, y acá enseña algo más útil que un número: **qué contiene el
   * sistema de diseño en el navegador es función de lo que el escáner vea ese
   * día.** Un token puede existir en el archivo y no existir en el `:root`, y
   * cuál depende de qué componentes haya. Eso es exactamente lo que `static`
   * cierra, y por eso vale más que la cifra puntual.
   *
   * Lo que sí se afirma: con `static` no se poda NINGUNO, sin `static` se poda
   * AL MENOS UNO, y el listado del día se imprime para que quede fechado.
   */
  const podados = await ausentes(cuerpoLlano)
  afirmar(podados.length > 0, `\`@theme\` a secas — ${podados.length} de 89 NO llegan al :root`)
  console.log(`       podados hoy: ${podados.join(' ')}`)
  /**
   * ⚠ ACTUALIZADO POR S3. Esta afirmación decía que entre los podados estaban
   * las seis expresiones fluidas, "escala medida que ningún componente consume
   * todavía". **Ya no es cierto, y ésa es la noticia**: S3 construyó los
   * componentes de tipografía y los seis `--text-fluido-*` tienen consumidor,
   * así que sobreviven a la poda aun sin `static`.
   *
   * No se borra la afirmación: se da vuelta. Lo que antes probaba que la poda
   * es real con un grupo sin usar, ahora lo prueba con el grupo que quedó sin
   * usar —los radios que ningún componente de /v3 pide todavía— y afirma
   * además el hecho nuevo. Si mañana alguien consume esos radios, esta
   * comprobación va a fallar y va a haber que elegir otro testigo; eso es
   * correcto y es barato.
   */
  afirmar(
    !podados.some((n) => n.startsWith('--text-fluido-')),
    '  las seis expresiones fluidas YA NO se podan: S3 les dio consumidor',
    `podados: ${podados.join(' ')}`,
  )
  afirmar(
    podados.some((n) => n.startsWith('--radius-')),
    '  y el testigo de que la poda sigue siendo real son los radios sin consumidor',
    podados.filter((n) => n.startsWith('--radius-')).join(' '),
  )
  // La contracara acota el alcance: los referenciados sobreviven aun sin
  // `static`, así que el problema no es de namespace sino de uso.
  afirmar(
    !podados.includes('--color-foco') && !podados.includes('--pad-lateral-compacto'),
    '  los referenciados sobreviven: la poda es por uso, no por namespace',
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('4 · `@theme inline` rompe el override contextual — medido, no citado')

  const regla = (css: string, selector: string): string => {
    const m = sinComentarios(css).match(new RegExp(`\\${selector}\\s*\\{[^}]*\\}`))
    return m ? m[0].replace(/\s+/g, ' ') : 'NO EMITIDA'
  }
  afirmar(
    regla(cssStatic, '.text-acento').includes('var(--color-acento)'),
    '`static` — la utilidad consume var(--color-acento): el override llega',
    regla(cssStatic, '.text-acento'),
  )
  afirmar(
    regla(cssInline, '.text-acento').includes('var(--color-acento-web)'),
    '`inline` — el valor queda incrustado: el override NO llega',
    regla(cssInline, '.text-acento'),
  )
  afirmar(
    regla(cssInline, '.bg-fondo').includes('#F7F7F5'),
    '`inline` — el hex queda incrustado en la utilidad',
    regla(cssInline, '.bg-fondo'),
  )
  afirmar(
    /\[data-servicio="software"\]/.test(cssStatic) && /\[data-seccion="invertida"\]/.test(cssStatic),
    'los bloques de override contextual e invertida se emiten',
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('5 · Colisiones contra `globals.css`')

  const nombresGlobals = declarados(globals.replace(/@import\s+"[^"]+";/g, ''))
  const colisiones = nombresRepo.filter((n) => nombresGlobals.includes(n))
  afirmarIgual(colisiones, [], 'cero colisiones de nombre con el sistema viejo')
  afirmar(nombresGlobals.includes('--font-mono'), '  (y `--font-mono` sigue siendo del sistema viejo, intacto)')

  controlPositivo(
    'el detector de colisiones ve una colisión que existe',
    declarados(globals).filter((n) => n !== '--font-mono'),
    (lista) => nombresRepo.concat('--font-mono').filter((n) => lista.includes(n)).length > 0,
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('6 · CAMBIO 4 — los nueve `--spacing-*` en rem computan el mismo píxel')

  const RAIZ_PX = 16
  const EQUIVALENCIAS: ReadonlyArray<readonly [string, number]> = [
    ['1', 4],
    ['2', 8],
    ['3', 12],
    ['4', 16],
    ['5', 20],
    ['6', 24],
    ['8', 32],
    ['12', 48],
    ['20', 80],
  ]
  const enRem = (sufijo: string, css: string): number => {
    const m = css.match(new RegExp(`--spacing-${sufijo}:\\s*([0-9.]+)rem`))
    return m ? Number.parseFloat(m[1]) * RAIZ_PX : Number.NaN
  }
  for (const [sufijo, px] of EQUIVALENCIAS) {
    afirmarIgual(enRem(sufijo, enElRepo), px, `--spacing-${sufijo} = ${px}px con raíz ${RAIZ_PX}`)
  }

  controlPositivo(
    'la conversión rem→px ve una equivalencia mal hecha',
    enElRepo.replace('--spacing-4: 1rem;', '--spacing-4: 1.5rem;'),
    (css) => enRem('4', css) === 16,
  )

  // Las quince utilidades que cambian de fórmula: el valor computado tiene que
  // ser el mismo que la fórmula dinámica de Tailwind con raíz 16.
  const UTILIDADES = ['p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-12', 'p-20', 'gap-4', 'm-20', 'space-y-2', 'leading-6', 'md:p-4', 'lg:p-4']
  const cssUtil = sinComentarios(cssStatic)
  const SPACING_BASE_REM = 0.25
  /** El múltiplo es SIEMPRE el último segmento: `space-y-2` → 2, `md:p-4` → 4. */
  const multiploDe = (utilidad: string): number => Number.parseInt(utilidad.split('-').pop() ?? '', 10)
  const desajustadas = UTILIDADES.filter((u) => {
    const multiplo = multiploDe(u)
    return enRem(String(multiplo), enElRepo) !== multiplo * SPACING_BASE_REM * RAIZ_PX
  })
  afirmarIgual(desajustadas, [], 'las 15 utilidades afectadas computan el mismo píxel que antes')
  afirmarIgual(UTILIDADES.length, 15, '  y son quince, las quince medidas')

  controlPositivo(
    'el lector de múltiplos no devuelve NaN en `space-y-2` (el bug que tuvo antes)',
    'space-y-2',
    (u) => Number.isNaN(multiploDe(u)),
  )
  // Sobre el CSS del pipeline real: los múltiplos DECLARADOS consumen el token
  // y los NO declarados siguen en la fórmula dinámica. Las dos mitades importan
  // — si la escala dinámica hubiera muerto, medio sitio se quedaría sin padding.
  afirmar(
    /\.p-7\s*\{[^}]*calc\(var\(--spacing\)\s*\*\s*7\)/.test(cssUtil),
    'la escala dinámica sobrevive: `p-7` sigue en calc(var(--spacing) * 7)',
  )
  afirmar(/\.p-4\s*\{[^}]*var\(--spacing-4\)/.test(cssUtil), '  y `p-4` pasa a consumir el token declarado')

  // ─────────────────────────────────────────────────────────────────────────
  titulo('6b · CAMBIO 5 — `--text-base` en rem computa el mismo píxel')

  /**
   * Mismo argumento y mismo control que el CAMBIO 4, sobre el único token de
   * los ocho de la escala de texto que cae en un nombre que Tailwind ya usa.
   * A diferencia del 4, éste no pisa nada: RESTITUYE el defecto de Tailwind.
   */
  const baseEnRem = enElRepo.match(/--text-base:\s*([0-9.]+)rem/)
  afirmarIgual(
    baseEnRem ? Number.parseFloat(baseEnRem[1]) * RAIZ_PX : Number.NaN,
    16,
    '--text-base = 16px con raíz 16 — mismo valor que el px de S0',
  )
  afirmar(!/--text-base:\s*\d+px/.test(sinComentarios(enElRepo)), '  y ya no hay un px pisando el defecto de Tailwind')
  afirmar(
    /\.text-base\s*\{[^}]*var\(--text-base\)/.test(cssUtil) || /--text-base:\s*1rem/.test(cssUtil),
    '  el CSS emitido lo lleva en rem, igual que text-sm y text-lg: una sola especie',
  )

  controlPositivo(
    'la conversión de --text-base ve una equivalencia mal hecha',
    enElRepo.replace('--text-base: 1rem;', '--text-base: 1.5rem;'),
    (css) => {
      const m = css.match(/--text-base:\s*([0-9.]+)rem/)
      return (m ? Number.parseFloat(m[1]) * RAIZ_PX : Number.NaN) === 16
    },
  )

  // ─────────────────────────────────────────────────────────────────────────
  titulo('7 · El umbral de la compuerta y el token dicen lo mismo')

  const breakpoint = enElRepo.match(/--breakpoint-escritorio:\s*(\d+)px/)
  afirmarIgual(breakpoint ? Number.parseInt(breakpoint[1], 10) : null, ESCENARIO_MIN_ANCHO_PX, '`--breakpoint-escritorio` = ESCENARIO_MIN_ANCHO_PX = 1025')

  controlPositivo(
    'el comparador de umbral ve una desincronización',
    enElRepo.replace('--breakpoint-escritorio: 1025px', '--breakpoint-escritorio: 1024px'),
    (css) => {
      const m = css.match(/--breakpoint-escritorio:\s*(\d+)px/)
      return (m ? Number.parseInt(m[1], 10) : 0) === ESCENARIO_MIN_ANCHO_PX
    },
  )

  cerrar('tokens.invariant')
}

void principal()
