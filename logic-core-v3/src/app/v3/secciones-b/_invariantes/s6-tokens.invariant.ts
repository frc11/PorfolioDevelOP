/**
 * INVARIANTE — CERO VALORES FUERA DE LOS TOKENS, en todo el lane.
 *
 * Corre con `npm run test:s6-tokens`.
 *
 * ── Por qué es un instrumento propio y no uno compartido ──────────────────
 *
 * S1, S2 y S3 tienen cada uno el suyo, con su propio ALCANCE, y no es
 * duplicación por descuido: **lo que cambia entre ellos es qué archivos mira**,
 * y ése es justamente el dato que no puede quedar implícito. Un escáner
 * compartido con un alcance configurable esconde la pregunta "¿este sprint está
 * cubierto?" adentro de un parámetro. Acá el alcance es una constante de este
 * archivo y se imprime en cada corrida.
 *
 * ── Los sufijos válidos salen del tema, no de una lista ───────────────────
 *
 * Si mañana alguien agrega `--spacing-7`, `p-7` pasa a ser legítimo sin tocar
 * este archivo. Y si alguien borra un token, la clase que lo consumía empieza a
 * fallar acá antes que en la pantalla.
 *
 * ⚠️ **Los instrumentos NO se escanean.** Sus controles positivos contienen a
 * propósito hex, píxeles sueltos y clases de Tailwind que no son del sistema:
 * incluirlos haría fallar la comprobación por culpa de su propio arnés. Es la
 * misma excepción declarada que S3 dejó escrita, y el alcance de abajo la aplica.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import {
  arbitrariosSinVar,
  funcionesDeColorEncontradas,
  hexEncontrados,
  literalesConUnidad,
  quitarComentarios,
} from '../../_lib/__tests__/s3-escaneo'
import { RAIZ, codigoDelLane, leer } from './soporte'

const TEMA = path.join(RAIZ, 'src/app/theme-develop.css')

// ── Los tokens declarados, leídos del tema ─────────────────────────────────
const tema = readFileSync(TEMA, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const TOKENS = [...new Set([...tema.matchAll(/(?:^|[;{}\s])(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]))]

const sufijos = (prefijo: string): Set<string> =>
  new Set(TOKENS.filter((t) => t.startsWith(prefijo)).map((t) => t.slice(prefijo.length)))

const COLORES = sufijos('--color-')
const TEXTOS = sufijos('--text-')
const LEADINGS = sufijos('--leading-')
const TRACKINGS = sufijos('--tracking-')
/**
 * Tailwind 4 mapea `--font-*` y `--font-weight-*` a la MISMA utilidad `font-`:
 * `--font-codigo` da `font-codigo` y `--font-weight-medio` da `font-medio`.
 * Un escáner que sólo mire `--font-` rechaza los cuatro pesos del sistema.
 */
const FUENTES = new Set([...sufijos('--font-'), ...sufijos('--font-weight-')])
const RADIOS = sufijos('--radius-')
const OPACIDADES = sufijos('--opacity-')
const ESPACIADOS = sufijos('--spacing-')
const CONTENEDORES = sufijos('--container-')

const ARCHIVOS = codigoDelLane()
const textoDeTodo = ARCHIVOS.map((f) => quitarComentarios(leer(f))).join('\n')
const palabras = [...new Set(textoDeTodo.match(/[a-zA-Z][a-zA-Z0-9:_/[\]().,%-]*/g) ?? [])]

// ═══════════════════════════════════════════════════════════════════════════
titulo('T0 · Alcance del escaneo — el contrapeso')

afirmar(ARCHIVOS.length > 0, `el escaneo mira ${ARCHIVOS.length} archivos de producto del lane`)
console.log(`  ${ARCHIVOS.map((a) => a.replace('src/app/v3/secciones-b/', '')).join(' · ')}`)
afirmar(
  textoDeTodo.length > 0,
  `${textoDeTodo.length} caracteres de código, sin comentarios`,
  'sin esto, "cero hallazgos" sería compatible con "cero archivos"',
)
afirmar(TOKENS.length > 0, `el tema declara ${TOKENS.length} tokens`, `${ESPACIADOS.size} múltiplos de espaciado`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T1 · Ni un hex, ni un rgb, ni un hsl')

afirmarIgual(hexEncontrados(textoDeTodo), [], 'cero colores escritos a mano')
afirmarIgual(funcionesDeColorEncontradas(textoDeTodo), [], 'cero funciones de color literales')

controlPositivo('el detector de hex ve un color escrito a mano', 'color: #1D5B8F', (t) => hexEncontrados(t).length === 0)
controlPositivo('y el de funciones ve un rgba()', 'background: rgba(17,17,17,.1)', (t) =>
  funcionesDeColorEncontradas(t).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T2 · Ni un literal con unidad')

const literales = literalesConUnidad(textoDeTodo)
afirmarIgual(literales, [], 'cero px, rem, em, ms, deg, vh, vw o svh sueltos en el código')

controlPositivo('el detector ve un padding en px', 'padding-left: 32px', (t) => literalesConUnidad(t).length === 0)
controlPositivo('y una duración suelta', 'transition-duration: 1.3s', (t) => literalesConUnidad(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T3 · Cada familia de utilidad consume un token del sistema')

interface Familia {
  readonly nombre: string
  readonly re: RegExp
  readonly validos: ReadonlySet<string>
  /** Sufijos estructurales de Tailwind: no llevan valor de diseño. */
  readonly estructurales: readonly string[]
}

const FAMILIAS: readonly Familia[] = [
  { nombre: 'bg-', re: /^bg-([a-z0-9-]+)$/, validos: COLORES, estructurales: ['transparent', 'current'] },
  {
    nombre: 'text-',
    re: /^text-([a-z0-9-]+)$/,
    validos: new Set([...COLORES, ...TEXTOS]),
    estructurales: ['left', 'right', 'center', 'justify', 'balance', 'pretty', 'wrap', 'nowrap'],
  },
  {
    nombre: 'border-',
    re: /^border-([a-z0-9-]+)$/,
    validos: COLORES,
    // `dashed`/`solid`/`none` son ESTILO de borde, no un valor de diseño: el
    // sistema no tiene ni tiene que tener un token para "punteado".
    estructurales: ['t', 'b', 'l', 'r', 'x', 'y', 'dashed', 'solid', 'dotted', 'none'],
  },
  { nombre: 'leading-', re: /^leading-([a-z0-9-]+)$/, validos: LEADINGS, estructurales: [] },
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
    const sufijo = m[1]
    if (familia.estructurales.includes(sufijo)) continue
    if (!familia.validos.has(sufijo)) fuera.push(palabra)
  }
  return fuera
}

let enUsoTotal = 0
for (const familia of FAMILIAS) {
  const fuera = fueraDeFamilia(familia, palabras)
  const enUso = [...new Set(palabras.filter((p) => familia.re.test(p)))].sort()
  enUsoTotal += enUso.length
  afirmarIgual(fuera, [], `\`${familia.nombre}\` — ${enUso.length} en uso, todas de token`)
}
afirmar(enUsoTotal > 0, `el escáner revisó ${enUsoTotal} clases de las nueve familias`, 'no es verde por vacío')

controlPositivo('el escáner ve un bg-red-500, que no es del sistema', ['bg-red-500'], (lista: string[]) =>
  fueraDeFamilia(FAMILIAS[0], lista).length === 0,
)
controlPositivo('y un text-2xl, que es la escala de Tailwind y no la de develOP', ['text-2xl'], (lista: string[]) =>
  fueraDeFamilia(FAMILIAS[1], lista).length === 0,
)
controlPositivo('y un font-light, que es un peso que el sistema no declara', ['font-light'], (lista: string[]) =>
  fueraDeFamilia(FAMILIAS[5], lista).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T4 · El espaciado sale de los nueve múltiplos declarados')

const RE_ESPACIADO =
  /^-?(?:p|m)(?:[xytrbl])?-(\d+(?:\.\d+)?)$|^gap(?:-[xy])?-(\d+(?:\.\d+)?)$|^space-[xy]-(\d+(?:\.\d+)?)$|^-?(?:top|right|bottom|left|inset)-(\d+(?:\.\d+)?)$/

/** El cero estructural: `top-0` no consume la escala, la apaga. */
const CERO_ESTRUCTURAL = '0'

const espaciadosUsados = (lista: readonly string[]): string[] => {
  const fuera: string[] = []
  for (const palabra of lista) {
    const m = RE_ESPACIADO.exec(palabra)
    if (m === null) continue
    const valor = m[1] ?? m[2] ?? m[3] ?? m[4]
    if (valor === CERO_ESTRUCTURAL) continue
    if (!ESPACIADOS.has(valor)) fuera.push(palabra)
  }
  return fuera
}

const usados = [...new Set(palabras.filter((p) => RE_ESPACIADO.test(p)))].sort()
afirmarIgual(espaciadosUsados(palabras), [], `${usados.length} utilidades de espaciado, todas de la escala`)
console.log(`  en uso: ${usados.join(' · ') || '(ninguna con número: todo por var(--spacing-*))'}`)

controlPositivo('el detector ve un p-7, que no está en la escala', ['p-7'], (lista: string[]) =>
  espaciadosUsados(lista).length === 0,
)
controlPositivo('y un -mt-1.5', ['-mt-1.5'], (lista: string[]) => espaciadosUsados(lista).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T5 · Los valores arbitrarios: todos consumen un token por var()')

const arbitrarios = [...new Set(textoDeTodo.match(/[a-z-]+-\[[^\]]+\]/g) ?? [])].sort()
afirmarIgual(arbitrariosSinVar(textoDeTodo), [], `los ${arbitrarios.length} valores arbitrarios consumen var(--token)`)
console.log(`  arbitrarios en uso: ${arbitrarios.join(' · ') || '(ninguno)'}`)
afirmar(
  arbitrarios.length > 0,
  'el contrapeso: hay valores arbitrarios que revisar',
  'sin esto, "cero sin var()" sería compatible con "cero arbitrarios"',
)

controlPositivo('el escáner ve un arbitrario en píxeles crudos', 'text-[13px]', (t) => arbitrariosSinVar(t).length === 0)
controlPositivo('y uno con vw', 'px-[5vw]', (t) => arbitrariosSinVar(t).length === 0)
controlPositivo('y una columna de ancho fijo', 'grid-cols-[300px_minmax(0,1fr)]', (t) => arbitrariosSinVar(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('T6 · Los bordes: la única excepción declarada del sistema')

const hairline = /--border-hairline:\s*([^;]+);/.exec(tema)?.[1].trim()
afirmarIgual(hairline, '1px', 'el token de borde vale 1 px, así que `border` de Tailwind computa el mismo píxel')
const bordesConNumero = palabras.filter((p) => /^border(-[tblrxy])?-\d+$/.test(p))
afirmarIgual(bordesConNumero, [], 'ninguna utilidad de borde con grosor numérico: no hay un border-2 suelto')

controlPositivo('el detector vería un border-2', ['border-2'], (lista: string[]) =>
  lista.filter((p) => /^border(-[tblrxy])?-\d+$/.test(p)).length === 0,
)

cerrar('s6-tokens.invariant')
