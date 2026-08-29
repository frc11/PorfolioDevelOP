/**
 * INVARIANTE — cero color, tamaño o duración fuera de los tokens.
 *
 * Corre con `npm run test:s2-tokens`.
 *
 * ── Por qué hace falta un instrumento ──────────────────────────────────────
 *
 * "Ni un hex, ni un px suelto" es una regla que se cumple leyendo, y por eso se
 * incumple sin que nadie lo note: un `p-7` entre veinte clases es invisible en
 * una revisión y es un valor que NO sale del sistema —Tailwind lo computa como
 * `calc(var(--spacing) * 7)`, otra escala—. Este archivo lo mira por nosotros.
 *
 * ── Cómo decide qué está permitido ─────────────────────────────────────────
 *
 * **Leyendo `theme-develop.css`**, no una lista escrita a mano. Los sufijos
 * válidos de cada familia salen de los tokens declarados: si mañana alguien
 * agrega `--spacing-7`, `p-7` pasa a ser legítimo acá sin tocar este archivo, y
 * si borra `--color-superficie-3`, `bg-superficie-3` empieza a fallar. El
 * instrumento no puede desincronizarse del sistema porque lo lee.
 *
 * ── Alcance ────────────────────────────────────────────────────────────────
 *
 * Los archivos de este sprint: `_lib/motion/` y `motion/`, sin los invariantes.
 * No mira el resto del repo, que tiene su propia historia y no es de este sprint.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { cardinalidadEsperada, comoSeDeriva } from '../../__tests__/padron-de-tokens'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
// Seis niveles: __tests__ → motion → _lib → v3 → app → src → raíz del proyecto.
const RAIZ = path.resolve(AQUI, '../../../../../..')
const TEMA = path.join(RAIZ, 'src/app/theme-develop.css')
const ALCANCE = [
  path.join(RAIZ, 'src/app/v3/_lib/motion'),
  path.join(RAIZ, 'src/app/v3/motion'),
]

/** Los archivos del sprint, sin los invariantes (que no pintan nada). */
function archivos(dir: string, acumulado: string[] = []): string[] {
  if (!existsSync(dir)) return acumulado
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (entrada.name === '__tests__') continue
    const completo = path.join(dir, entrada.name)
    if (entrada.isDirectory()) archivos(completo, acumulado)
    else if (/\.tsx?$/.test(entrada.name)) acumulado.push(completo)
  }
  return acumulado
}

/** Saca comentarios de bloque y de línea entera: ahí se nombran clases al hablar. */
function sinComentarios(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((linea) => !/^\s*\/\//.test(linea))
    .join('\n')
}

// ── Los tokens declarados, leídos del tema ─────────────────────────────────
const tema = readFileSync(TEMA, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const TOKENS = [
  ...new Set([...tema.matchAll(/(?:^|[;{}\s])(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1])),
]
const sufijos = (prefijo: string): Set<string> =>
  new Set(TOKENS.filter((t) => t.startsWith(prefijo)).map((t) => t.slice(prefijo.length)))

const COLORES = sufijos('--color-')
const TEXTOS = sufijos('--text-')
const LEADINGS = sufijos('--leading-')
const TRACKINGS = sufijos('--tracking-')
const FUENTES = sufijos('--font-')
const RADIOS = sufijos('--radius-')
const OPACIDADES = sufijos('--opacity-')
const ESPACIADOS = sufijos('--spacing-')
const CONTENEDORES = sufijos('--container-')

const fuentes = ALCANCE.flatMap((d) => archivos(d))
const textoDeTodo = fuentes.map((f) => sinComentarios(readFileSync(f, 'utf8'))).join('\n')

/** Todas las palabras que parecen una clase de utilidad. */
const palabras = [...new Set(textoDeTodo.match(/[a-zA-Z][a-zA-Z0-9:_/[\]().,%-]*/g) ?? [])]

// ═══════════════════════════════════════════════════════════════════════════
titulo('U0 · Alcance del escaneo')

afirmar(fuentes.length > 0, `el escaneo mira ${fuentes.length} archivos del sprint`)
/**
 * ⚠ EL CONTEO NO ES UN LITERAL — S4.
 *
 * Decía `TOKENS.length === 89`. Eran 89 cuando se escribió y son 90 desde la
 * corrección aprobada en la parada de S3 —`--color-superficie-translucida`, el
 * papel translúcido que le dio superficie a `--blur-panel`—, así que este
 * instrumento empezó a fallar **por crecer bien**.
 *
 * Un instrumento que afirma una cardinalidad escrita a mano se rompe cada vez
 * que el sistema crece legítimamente, y entrena a que se lo actualice sin
 * pensar. Ahora el número sale del mismo padrón declarado que usa
 * `tokens.invariant.ts`, con su lista de excepciones nombradas: si aparece un
 * token que nadie declaró, esto sigue fallando, que es para lo que existe.
 */
afirmar(
  TOKENS.length === cardinalidadEsperada(),
  `y el tema declara ${TOKENS.length} tokens`,
  comoSeDeriva(),
)
controlPositivo(
  'el conteo derivado NO se cumple solo: un token de más lo rompe',
  [...TOKENS, '--token-que-nadie-declaro'],
  (lista: string[]) => lista.length === cardinalidadEsperada(),
)
afirmar(ESPACIADOS.size === 9, `de los cuales ${ESPACIADOS.size} son múltiplos de espaciado`, [...ESPACIADOS].join(' '))

// ═══════════════════════════════════════════════════════════════════════════
titulo('U1 · Ni un hex, ni un rgb, ni un hsl')

const buscarColoresCrudos = (fuente: string): string[] => [
  ...(fuente.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []),
  ...(fuente.match(/\b(?:rgba?|hsla?)\s*\(/g) ?? []),
]
const coloresCrudos = buscarColoresCrudos(textoDeTodo)
afirmarIgual(coloresCrudos, [], 'ningún color literal en el código del sprint')

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
titulo('U2 · Espaciado: solo los nueve múltiplos declarados')

const RE_ESPACIADO = /^-?(?:p|m)(?:[xytrbl])?-(\d+(?:\.\d+)?)$|^gap(?:-[xy])?-(\d+(?:\.\d+)?)$|^space-[xy]-(\d+(?:\.\d+)?)$|^-?(?:top|right|bottom|left|inset)-(\d+(?:\.\d+)?)$/

/**
 * El cero es estructural, no una medida.
 *
 * `inset-0`, `top-0` y `left-0` no eligen una distancia: dicen "pegado al
 * borde". No hay —ni tendría sentido que hubiera— un `--spacing-0`, y el valor
 * no cambia si el sistema cambia de escala. Se admite explícitamente y se
 * declara; cualquier otro múltiplo tiene que estar en el tema.
 */
const CERO_ESTRUCTURAL = '0'

const espaciadosUsados = (lista: readonly string[]): string[] => {
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
const fueraDeEscala = espaciadosUsados(palabras)
afirmarIgual(fueraDeEscala, [], 'todas las utilidades de espaciado usan un múltiplo declarado')

const usados = [...new Set(palabras.filter((p) => RE_ESPACIADO.test(p)))].sort()
console.log(`  espaciados en uso: ${usados.join(' · ')}`)

controlPositivo(
  'el escáner ve un p-7, que NO es un múltiplo declarado',
  ['flex', 'p-7', 'text-tinta'],
  (lista: string[]) => espaciadosUsados(lista).length === 0,
)
controlPositivo(
  'y ve un -mt-1.5',
  ['-mt-1.5'],
  (lista: string[]) => espaciadosUsados(lista).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('U3 · Color, tipografía, radio y opacidad: solo nombres de token')

interface Familia {
  readonly nombre: string
  readonly re: RegExp
  readonly validos: ReadonlySet<string>
  /** Sufijos estructurales de Tailwind que no llevan valor de diseño. */
  readonly estructurales: readonly string[]
}

const FAMILIAS: readonly Familia[] = [
  { nombre: 'bg-', re: /^bg-([a-z0-9-]+)$/, validos: COLORES, estructurales: [] },
  {
    nombre: 'text-',
    re: /^text-([a-z0-9-]+)$/,
    validos: new Set([...COLORES, ...TEXTOS]),
    estructurales: ['left', 'right', 'center', 'justify'],
  },
  {
    nombre: 'border-',
    re: /^border-([a-z0-9-]+)$/,
    validos: COLORES,
    estructurales: ['t', 'b', 'l', 'r', 'x', 'y'],
  },
  { nombre: 'leading-', re: /^leading-([a-z0-9-]+)$/, validos: LEADINGS, estructurales: [] },
  { nombre: 'tracking-', re: /^tracking-([a-z0-9-]+)$/, validos: TRACKINGS, estructurales: [] },
  { nombre: 'font-', re: /^font-([a-z0-9-]+)$/, validos: FUENTES, estructurales: [] },
  { nombre: 'rounded-', re: /^rounded-([a-z0-9-]+)$/, validos: RADIOS, estructurales: [] },
  { nombre: 'opacity-', re: /^opacity-([a-z0-9-]+)$/, validos: OPACIDADES, estructurales: [] },
  { nombre: 'max-w-', re: /^max-w-([a-z0-9-]+)$/, validos: CONTENEDORES, estructurales: ['full'] },
]

const fueraDeFamilia = (familia: Familia, lista: readonly string[]): string[] => {
  const fuera: string[] = []
  for (const palabra of lista) {
    const m = familia.re.exec(palabra)
    if (m === null) continue
    const sufijo = m[1]
    if (familia.estructurales.includes(sufijo)) continue
    if (!familia.validos.has(sufijo)) fuera.push(palabra)
  }
  return fuera
}

for (const familia of FAMILIAS) {
  const fuera = fueraDeFamilia(familia, palabras)
  const enUso = [...new Set(palabras.filter((p) => familia.re.test(p)))].sort()
  afirmarIgual(
    fuera,
    [],
    `\`${familia.nombre}\` — ${enUso.length} en uso, todas de token`,
  )
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
titulo('U4 · Los valores arbitrarios: cada uno con su motivo')

/**
 * `algo-[...]` es la puerta de escape de Tailwind. Acá solo se admiten dos
 * formas, y las dos se declaran:
 *
 *   · `var(--token)` — consumir un token que no tiene utilidad propia. Es el
 *     mecanismo que el propio tema documenta para `--z-*` y `--pad-lateral-*`.
 *   · unidades de viewport (`svh`) — geometría del INSTRUMENTO, no del sistema:
 *     cuánto scroll gasta una demostración. No hay ni debería haber un token.
 */
const arbitrarios = [...new Set(textoDeTodo.match(/[a-z-]+-\[[^\]]+\]/g) ?? [])].sort()
const noJustificados = arbitrarios.filter(
  (a) => !/var\(--[a-z0-9-]+\)/.test(a) && !/\d+svh/.test(a),
)
afirmarIgual(noJustificados, [], `los ${arbitrarios.length} valores arbitrarios son var(--token) o svh`)
console.log(`  arbitrarios en uso: ${arbitrarios.join(' · ')}`)

controlPositivo(
  'el escáner ve un valor arbitrario en píxeles crudos',
  ['text-[13px]'],
  (lista: string[]) => lista.filter((a) => !/var\(--/.test(a) && !/svh/.test(a)).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('U5 · Los bordes: el único tamaño que no viene de una utilidad de token')

/**
 * `--border-hairline` NO genera utilidad. El tema lo dice y lo deja anotado como
 * uno de los renombres pendientes (`--border-hairline` → `--border-width-hairline`
 * → `.border-hairline`). Mientras tanto el sprint usa `border`, `border-t`,
 * `border-b` y `border-l` de Tailwind, que son de 1 px.
 *
 * Eso NO es un valor elegido a ojo, y acá está el número que lo respalda: el
 * token vale exactamente 1 px, así que la utilidad de Tailwind computa el mismo
 * píxel. Se declara como la única excepción, con su motivo y su instrumento.
 */
const hairline = /--border-hairline:\s*([^;]+);/.exec(tema)?.[1].trim()
afirmarIgual(hairline, '1px', 'el token de borde vale 1 px')
const bordesEstructurales = [...new Set(palabras.filter((p) => /^border(-[tblrxy])?$/.test(p)))].sort()
afirmar(
  bordesEstructurales.length > 0,
  `el sprint usa ${bordesEstructurales.length} utilidades de borde, todas de 1 px`,
  bordesEstructurales.join(' · '),
)
const bordesConNumero = palabras.filter((p) => /^border(-[tblrxy])?-\d+$/.test(p))
afirmarIgual(bordesConNumero, [], 'y ninguna con grosor numérico: no hay un border-2 suelto')

cerrar('tokens-de-uso.invariant')
