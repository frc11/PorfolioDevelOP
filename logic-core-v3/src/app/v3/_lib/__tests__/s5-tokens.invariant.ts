/**
 * INVARIANTE TRANSVERSAL — cero color, tamaño, espaciado u opacidad fuera de
 * los tokens, en las cuatro secciones y en el contrato.
 *
 * Corre con `npm run test:s5-tokens`.
 *
 * ── Por qué hace falta un instrumento ─────────────────────────────────────
 *
 * "Ni un hex, ni un px suelto" es una regla que se cumple leyendo, y por eso se
 * incumple sin que nadie lo note: un `p-7` entre veinte clases es invisible en
 * una revisión y **no sale del sistema** —Tailwind lo computa como
 * `calc(var(--spacing) * 7)`, que es otra escala—. Con cuatro autores en
 * paralelo, cada uno con su carpeta, la única forma de que la regla signifique
 * algo es que la mire una máquina.
 *
 * ── Cómo decide qué está permitido ────────────────────────────────────────
 *
 * **Leyendo `theme-develop.css`**, no una lista escrita a mano. Los sufijos
 * válidos de cada familia salen de los tokens declarados: si mañana alguien
 * agrega `--spacing-7`, `p-7` pasa a ser legítimo sin tocar este archivo; si
 * borra `--color-superficie-3`, `bg-superficie-3` empieza a fallar. El
 * instrumento no se puede desincronizar del sistema porque lo lee.
 *
 * Es la misma forma que `_lib/motion/__tests__/tokens-de-uso.invariant.ts`, con
 * otro alcance y dos correcciones que ese archivo no necesitaba:
 *
 *   · los **pesos** son `--font-weight-*` pero se escriben `font-semi`, así que
 *     la familia `font-` valida contra los dos espacios de nombres;
 *   · los **estilos de borde** (`border-dashed`) no son un color y son
 *     estructurales, como ya lo eran los lados.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_ESCANEABLES, RAIZ } from './s5-archivos'

const TEMA = path.join(RAIZ, 'src/app/theme-develop.css')

/**
 * El alcance sale del PADRÓN declarado, no de un recorrido del directorio.
 *
 * Los dos caminos parecen equivalentes y no lo son. Los instrumentos y sus
 * módulos de apoyo llevan hex y píxeles sueltos **a propósito** —son las
 * entradas equivocadas contra las que se prueba cada detector— así que un
 * recorrido ciego los escanearía y la comprobación fallaría por su propio
 * arnés. Excluirlos por el sufijo del nombre sería una heurística: alcanza para
 * `.invariant.tsx` y no para un `<sección>-piezas.tsx` que sólo existe porque el
 * invariante no entraba en 300 líneas.
 *
 * Con el padrón la regla es explícita: `ARCHIVOS_ESCANEABLES` es lo que pinta
 * pantalla, y `s5-codigo` afirma aparte que el padrón cierra contra el disco en
 * los dos sentidos — así que un archivo nuevo no se puede colar sin que alguien
 * decida en qué lista va.
 */
const fuentesDelLane = ARCHIVOS_ESCANEABLES.filter((a) => /\.tsx?$/.test(a))

/** Saca comentarios de bloque y líneas de comentario: ahí se nombran clases al
 *  hablar de ellas, y un detector que las cuente encuentra cosas que no están. */
function sinComentarios(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((linea) => !/^\s*(\/\/|\*)/.test(linea.trim()))
    .join('\n')
}

const tema = readFileSync(TEMA, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const TOKENS = [...new Set([...tema.matchAll(/(?:^|[;{}\s])(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]))]
const sufijos = (prefijo: string): Set<string> =>
  new Set(TOKENS.filter((t) => t.startsWith(prefijo)).map((t) => t.slice(prefijo.length)))

const COLORES = sufijos('--color-')
const TEXTOS = sufijos('--text-')
const LEADINGS = sufijos('--leading-')
const TRACKINGS = sufijos('--tracking-')
/** Familias Y pesos: `font-titulo` sale de `--font-*` y `font-semi` de
 *  `--font-weight-*`, y las dos se escriben con el mismo prefijo. */
const FUENTES = new Set([...sufijos('--font-'), ...sufijos('--font-weight-')])
const RADIOS = sufijos('--radius-')
const OPACIDADES = sufijos('--opacity-')
const ESPACIADOS = sufijos('--spacing-')
const CONTENEDORES = sufijos('--container-')

const fuentes = fuentesDelLane
const textoDeTodo = fuentes.map((f) => sinComentarios(readFileSync(path.join(RAIZ, f), 'utf8'))).join('\n')
const palabras = [...new Set(textoDeTodo.match(/[a-zA-Z][a-zA-Z0-9:_/[\]().,%-]*/g) ?? [])]

// ═══════════════════════════════════════════════════════════════════════════
titulo('T0 · Alcance del escaneo')

afirmar(fuentes.length > 0, `el escaneo mira ${fuentes.length} archivos del lane`, fuentes.length.toString())
afirmar(TOKENS.length > 0, `y el tema declara ${TOKENS.length} tokens`, 'leídos, no transcritos')
afirmar(ESPACIADOS.size === 9, `de los cuales ${ESPACIADOS.size} son múltiplos de espaciado`, [...ESPACIADOS].join(' '))
afirmar(palabras.length > 0, `${palabras.length} candidatos a utilidad en el texto escaneado`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · Ni un hex, ni un rgb, ni un hsl')

const buscarColoresCrudos = (fuente: string): string[] => [
  ...(fuente.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []),
  ...(fuente.match(/\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/g) ?? []),
]
afirmarIgual(buscarColoresCrudos(textoDeTodo), [], 'ningún color literal en el código del lane')

controlPositivo(
  'el buscador de colores ve un hex',
  'className="bg-[#ff0000] text-tinta"',
  (fuente: string) => buscarColoresCrudos(fuente).length === 0,
)
controlPositivo(
  'y ve un rgba()',
  'style={{ color: rgba(0,0,0,0.5) }}',
  (fuente: string) => buscarColoresCrudos(fuente).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · Espaciado: sólo los nueve múltiplos declarados')

const RE_ESPACIADO =
  /^-?(?:p|m)(?:[xytrbl])?-(\d+(?:\.\d+)?)$|^gap(?:-[xy])?-(\d+(?:\.\d+)?)$|^space-[xy]-(\d+(?:\.\d+)?)$|^-?(?:top|right|bottom|left|inset)-(\d+(?:\.\d+)?)$/

/** El cero es estructural: `inset-0` no elige una distancia, dice "pegado al
 *  borde". No hay —ni tendría sentido que hubiera— un `--spacing-0`. */
const CERO_ESTRUCTURAL = '0'

const espaciadosFuera = (lista: readonly string[]): string[] => {
  const fuera: string[] = []
  for (const palabra of lista) {
    const m = RE_ESPACIADO.exec(palabra)
    if (m === null) continue
    const n = m[1] ?? m[2] ?? m[3] ?? m[4]
    if (n === CERO_ESTRUCTURAL) continue
    if (!ESPACIADOS.has(n)) fuera.push(palabra)
  }
  return fuera
}

afirmarIgual(espaciadosFuera(palabras), [], 'todas las utilidades de espaciado usan un múltiplo declarado')
console.log(`  espaciados en uso: ${[...new Set(palabras.filter((p) => RE_ESPACIADO.test(p)))].sort().join(' · ')}`)

controlPositivo(
  'el escáner ve un p-7, que NO es un múltiplo declarado',
  ['flex', 'p-7', 'text-tinta'],
  (lista: string[]) => espaciadosFuera(lista).length === 0,
)
controlPositivo(
  'y ve un -mt-1.5',
  ['-mt-1.5'],
  (lista: string[]) => espaciadosFuera(lista).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T3 · Color, tipografía, radio y opacidad: sólo nombres de token')

interface Familia {
  readonly nombre: string
  readonly re: RegExp
  readonly validos: ReadonlySet<string>
  /** Sufijos de Tailwind que no llevan un valor de diseño. */
  readonly estructurales: readonly string[]
}

const FAMILIAS: readonly Familia[] = [
  { nombre: 'bg-', re: /^bg-([a-z0-9-]+)$/, validos: COLORES, estructurales: ['transparent', 'current'] },
  {
    nombre: 'text-',
    re: /^text-([a-z0-9-]+)$/,
    validos: new Set([...COLORES, ...TEXTOS]),
    estructurales: ['left', 'right', 'center', 'justify', 'balance', 'pretty', 'nowrap'],
  },
  {
    nombre: 'border-',
    re: /^border-([a-z0-9-]+)$/,
    validos: COLORES,
    // Lados y ESTILOS: `border-dashed` no es un color, es la forma del trazo.
    estructurales: ['t', 'b', 'l', 'r', 'x', 'y', 'solid', 'dashed', 'dotted', 'double', 'hidden', 'none'],
  },
  { nombre: 'leading-', re: /^leading-([a-z0-9-]+)$/, validos: LEADINGS, estructurales: ['none'] },
  { nombre: 'tracking-', re: /^tracking-([a-z0-9-]+)$/, validos: TRACKINGS, estructurales: [] },
  { nombre: 'font-', re: /^font-([a-z0-9-]+)$/, validos: FUENTES, estructurales: [] },
  { nombre: 'rounded-', re: /^rounded-([a-z0-9-]+)$/, validos: RADIOS, estructurales: ['full', 'none'] },
  { nombre: 'opacity-', re: /^opacity-([a-z0-9-]+)$/, validos: OPACIDADES, estructurales: [] },
  { nombre: 'max-w-', re: /^max-w-([a-z0-9-]+)$/, validos: CONTENEDORES, estructurales: ['full', 'none'] },
]

const fueraDeFamilia = (familia: Familia, lista: readonly string[]): string[] => {
  const fuera: string[] = []
  for (const palabra of lista) {
    const m = familia.re.exec(palabra)
    if (m === null) continue
    if (familia.estructurales.includes(m[1])) continue
    if (!familia.validos.has(m[1])) fuera.push(palabra)
  }
  return fuera
}

for (const familia of FAMILIAS) {
  const enUso = [...new Set(palabras.filter((p) => familia.re.test(p)))].sort()
  afirmarIgual(fueraDeFamilia(familia, palabras), [], `\`${familia.nombre}\` — ${enUso.length} en uso, todas de token`)
}

controlPositivo(
  'el escáner ve un bg-red-500, que no es un token del sistema',
  ['bg-red-500'],
  (lista: string[]) => fueraDeFamilia(FAMILIAS[0], lista).length === 0,
)
controlPositivo(
  'y ve un text-2xl, que es la escala de Tailwind y no la de develOP',
  ['text-2xl'],
  (lista: string[]) => fueraDeFamilia(FAMILIAS[1], lista).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T4 · Los valores arbitrarios: cada uno con su token adentro')

/**
 * `algo-[...]` es la puerta de escape de Tailwind. Acá se admite UNA sola forma
 * —`var(--token)`— y es el mecanismo que el propio tema documenta para los
 * tokens sin namespace (`--pad-lateral-compacto`, `--columna-lateral`, `--z-*`).
 *
 * Las unidades de viewport que el demo de motion sí admitía **acá no van**: la
 * geometría de scroll de una sección la declara `secciones.ts`, no una clase
 * suelta adentro de un componente.
 */
const arbitrarios = [...new Set(textoDeTodo.match(/[a-z-]+-\[[^\]]+\]/g) ?? [])].sort()
const noJustificados = arbitrarios.filter((a) => !/var\(--[a-z0-9-]+\)/.test(a))
afirmarIgual(noJustificados, [], `los ${arbitrarios.length} valores arbitrarios son var(--token)`)
console.log(`  arbitrarios en uso: ${arbitrarios.length === 0 ? '(ninguno)' : arbitrarios.join(' · ')}`)

controlPositivo(
  'el escáner ve un valor arbitrario en píxeles crudos',
  ['text-[13px]'],
  (lista: string[]) => lista.filter((a) => !/var\(--/.test(a)).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T5 · Los bordes: 1 px, y ninguno con grosor numérico')

const hairline = /--border-hairline:\s*([^;]+);/.exec(tema)?.[1].trim()
afirmarIgual(hairline, '1px', 'el token de borde vale 1 px, así que la utilidad de Tailwind computa el mismo píxel')
const bordesConNumero = palabras.filter((p) => /^border(-[tblrxy])?-\d+$/.test(p))
afirmarIgual(bordesConNumero, [], 'ninguna utilidad de borde con grosor numérico: no hay un border-2 suelto')

controlPositivo(
  'el detector ve un border-2',
  ['border-2'],
  (lista: string[]) => lista.filter((p) => /^border(-[tblrxy])?-\d+$/.test(p)).length === 0,
)

cerrar('s5-tokens.invariant')
