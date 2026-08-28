/**
 * INVARIANTE — /v3 sirve LOS BINARIOS DE S0, no otros.
 *
 * Corre con `npm run test:s1-fuentes`.
 *
 * ── Por qué esto es una afirmación y no un detalle ─────────────────────────
 *
 * Todo el sistema tipográfico descansa sobre métricas medidas: x-height 511,
 * cap height 686, factor 0,998 contra Instrument Sans, eje `wght` 100→900. Si
 * el proyecto sirviera otro binario —otra versión de gstatic, otro subset, el
 * TTF upstream, o el que baje `next/font/google` en otro momento— el sistema
 * descansaría sobre una medición que no corresponde a lo que el usuario
 * descarga. La escala sería una cita, no un hecho.
 *
 * La identidad se comprueba por **sha256 contra el manifiesto de descarga que
 * produjo S0**, no por nombre de archivo ni por tamaño a ojo.
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')
const FUENTES = path.join(RAIZ, 'src/app/v3/_fuentes')
const LAYOUT_V3 = path.join(RAIZ, 'src/app/v3/layout.tsx')

/**
 * El manifiesto de S0. Vive fuera del repo, en la carpeta donde S0 corrió.
 * Si no está, el invariante NO pasa en verde por vacío: usa las cifras
 * transcritas y lo dice. Son las mismas que publica `REPORTE-S0.md`.
 */
const MANIFIESTO_S0 = 'C:/develop-v3-cimientos/medicion-1-tipografia/salida/manifiesto-descarga.json'

interface ArchivoDeS0 {
  readonly archivo: string
  readonly subset: string
  readonly pesoCss: string | null
  readonly bytes: number
  readonly sha256: string
}
interface FamiliaDeS0 {
  readonly archivos: readonly ArchivoDeS0[]
}
interface Manifiesto {
  readonly familias: readonly FamiliaDeS0[]
}

/** Lo esperado, transcrito de `REPORTE-S0.md` — la red si el manifiesto no está. */
const ESPERADO = [
  {
    enElRepo: 'chivo-latin.woff2',
    enS0: 'chivo-latin-normal.woff2',
    bytes: 33252,
    sha256: '4b1f32027ce991997893f63a6b3bfd6ed887f1628b7baa2d3390d86bc67f6e28',
  },
  {
    enElRepo: 'chivo-mono-latin.woff2',
    enS0: 'chivomono-latin-normal.woff2',
    bytes: 26380,
    sha256: 'aa138151dbaaf3a008469af5fd30d1e917b67d2b645dec435586f5a144082d1b',
  },
] as const

const sha256 = (buffer: Buffer): string => createHash('sha256').update(buffer).digest('hex')

titulo('1 · Los dos binarios están, y son los de S0')

const hayManifiesto = existsSync(MANIFIESTO_S0)
afirmar(true, hayManifiesto ? 'manifiesto de S0 disponible: se compara contra él' : 'manifiesto de S0 NO disponible: se compara contra las cifras publicadas en REPORTE-S0.md')

const delManifiesto = new Map<string, ArchivoDeS0>()
if (hayManifiesto) {
  const m = JSON.parse(readFileSync(MANIFIESTO_S0, 'utf8')) as Manifiesto
  for (const familia of m.familias) {
    for (const archivo of familia.archivos) delManifiesto.set(archivo.archivo, archivo)
  }
  afirmarIgual(delManifiesto.size, 8, 'el manifiesto lista los 8 archivos que S0 bajó')
}

for (const esperado of ESPERADO) {
  const ruta = path.join(FUENTES, esperado.enElRepo)
  afirmar(existsSync(ruta), `${esperado.enElRepo} existe en el repo`)
  if (!existsSync(ruta)) continue

  const buffer = readFileSync(ruta)
  afirmarIgual(buffer.length, esperado.bytes, `${esperado.enElRepo} — ${esperado.bytes} bytes`)
  afirmarIgual(sha256(buffer), esperado.sha256, `${esperado.enElRepo} — sha256 de S0`)

  const enS0 = delManifiesto.get(esperado.enS0)
  if (enS0) {
    afirmarIgual(enS0.sha256, esperado.sha256, `  el manifiesto de S0 dice el mismo sha256 para ${esperado.enS0}`)
    afirmarIgual(enS0.subset, 'latin', `  y que ${esperado.enS0} es el subset latin`)
    afirmarIgual(enS0.pesoCss, '100 900', `  y que declara el eje wght 100→900 (es variable)`)
  }
}

controlPositivo(
  'el comparador de sha256 ve un binario alterado (un solo byte)',
  (() => {
    const b = Buffer.from(readFileSync(path.join(FUENTES, 'chivo-latin.woff2')))
    b[b.length - 1] = b[b.length - 1] ^ 0xff
    return b
  })(),
  (buffer) => sha256(buffer) === ESPERADO[0].sha256,
)

titulo('2 · El subset latin cubre el español rioplatense')

/**
 * El rango del subset `latin`, tal cual lo capturó S0 en `css2-chivo.css`.
 * Se afirma sobre los puntos de código que el sitio va a escribir de verdad,
 * no sobre el rango entero: lo que importa es que ninguna letra del copy caiga
 * afuera y se sirva con la fuente del sistema.
 */
const RANGO_LATIN_INICIO = 0x0000
const RANGO_LATIN_FIN = 0x00ff
const CARACTERES_DEL_ESPANOL = 'áéíóúÁÉÍÓÚüÜñÑ¿¡«»'

const afuera = [...CARACTERES_DEL_ESPANOL].filter((c) => {
  const cp = c.codePointAt(0) ?? 0
  return cp < RANGO_LATIN_INICIO || cp > RANGO_LATIN_FIN
})
afirmarIgual(afuera, [], `los ${CARACTERES_DEL_ESPANOL.length} caracteres del español caen dentro de U+0000–U+00FF`)

controlPositivo(
  'el chequeo de cobertura ve un carácter fuera de rango',
  'ł', // U+0142, latin-ext — tiene que quedar AFUERA
  (c) => {
    const cp = c.codePointAt(0) ?? 0
    return cp >= RANGO_LATIN_INICIO && cp <= RANGO_LATIN_FIN
  },
)

titulo('3 · El layout de /v3 los carga como corresponde')

/**
 * Sobre el CÓDIGO, no sobre los comentarios.
 *
 * Sin esto el invariante falla en verde al revés: el docblock del layout dice
 * "No `next/font/google`" y menciona el eje `100 900` en prosa, así que un
 * `includes` crudo cuenta la explicación como si fuera código. Es exactamente
 * el mismo modo de falla que tuvo el primer comparador de tokens de este
 * sprint — leer el texto en vez de la cosa.
 */
function soloCodigo(fuente: string): string {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*'))
    .join('\n')
}

const layout = soloCodigo(readFileSync(LAYOUT_V3, 'utf8'))
afirmar(/from 'next\/font\/local'/.test(layout), 'usa `next/font/local` — auto-hospedadas')
afirmar(!/next\/font\/google/.test(layout), 'y NO `next/font/google`')
for (const esperado of ESPERADO) {
  afirmar(layout.includes(`./_fuentes/${esperado.enElRepo}`), `apunta a ./_fuentes/${esperado.enElRepo}`)
}
afirmar(layout.includes("variable: '--font-v3-chivo'"), 'declara `--font-v3-chivo`')
afirmar(layout.includes("variable: '--font-v3-chivo-mono'"), 'declara `--font-v3-chivo-mono`')
afirmarIgual((layout.match(/weight: '100 900'/g) ?? []).length, 2, 'las dos declaran el eje wght 100→900')

controlPositivo(
  'el filtro de comentarios NO deja pasar una mención en prosa',
  '/* acá el docblock dice next/font/google para explicar que no se usa */\nconst x = 1',
  (fuente) => soloCodigo(fuente).includes('next/font/google'),
)

// La cadena completa: el token del tema tiene que apuntar a la variable que
// este layout declara. Si alguien renombra una punta, la cadena se corta en
// silencio y la página cae a la fuente del sistema.
const tema = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
afirmar(tema.includes('--font-titulo: var(--font-v3-chivo)'), 'la cadena cierra: --font-titulo → --font-v3-chivo')
afirmar(tema.includes('--font-cuerpo: var(--font-v3-chivo)'), 'la cadena cierra: --font-cuerpo → --font-v3-chivo')
afirmar(tema.includes('--font-codigo: var(--font-v3-chivo-mono)'), 'la cadena cierra: --font-codigo → --font-v3-chivo-mono')

controlPositivo(
  'el chequeo de la cadena ve una variable renombrada',
  tema.replace('--font-titulo: var(--font-v3-chivo)', '--font-titulo: var(--font-otra-cosa)'),
  (css) => css.includes('--font-titulo: var(--font-v3-chivo)'),
)

cerrar('fuentes.invariant')
