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
import { TEXTO_DEL_TITULAR } from './s3-banda-consecuencias'
import { avanceDeCaracter, leerAvancesDe, type TablasDeAvance } from './s10-woff2'

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
afirmar(layout.includes("variable: '--font-v3-archivo'"), 'declara `--font-v3-archivo`')
afirmarIgual((layout.match(/weight: '100 900'/g) ?? []).length, 3, 'las TRES familias declaran el eje wght 100→900')
/** La itálica entra a la MISMA familia que la romana, por `style`. Si alguien la
 *  sacara a un `localFont` propio, `italic` dejaría de elegirla y el navegador
 *  volvería a sintetizar una oblicua sobre la romana — sin un solo error. */
afirmar(/style: 'italic'/.test(layout), 'la itálica de Chivo se declara por `style`, adentro del `src` de la familia')
afirmarIgual((layout.match(/localFont\(/g) ?? []).length, 3, '  y son TRES llamadas a `localFont`, no cuatro: la itálica no es una familia aparte')
/** Ni `font-stretch` ni `font-variation-settings` en ninguna parte del árbol de
 *  /v3: el ancho de la cara de display viene pinchado EN EL BINARIO. Si alguien
 *  los escribiera, estaría pidiéndole a la fuente un eje que ya no tiene. */
afirmarIgual((layout.match(/font-stretch|font-variation-settings/g) ?? []).length, 0, 'y NADIE pide `font-stretch` ni `font-variation-settings`: el ancho ya viene pinchado')

controlPositivo(
  'el filtro de comentarios NO deja pasar una mención en prosa',
  '/* acá el docblock dice next/font/google para explicar que no se usa */\nconst x = 1',
  (fuente) => soloCodigo(fuente).includes('next/font/google'),
)

// La cadena completa: el token del tema tiene que apuntar a la variable que
// este layout declara. Si alguien renombra una punta, la cadena se corta en
// silencio y la página cae a la fuente del sistema.
const tema = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8')
/**
 * ⚠️ **LAS CUATRO CADENAS SE CUENTAN, Y TIENEN QUE APARECER DOS VECES.**
 *
 * Era `includes` —«¿está?»— y con el arreglo de alcance del titular eso dejó de
 * alcanzar: cada familia se declara DOS veces, en el `@theme static` y en el
 * bloque `[data-v3]`, y la que hace que la página pinte es la SEGUNDA. Un
 * `includes` seguía en verde con una sola, o sea con el defecto de vuelta.
 *
 * Lo destapó el control positivo de abajo, que se puso rojo solo: corrompía la
 * primera aparición con `replace` —que reemplaza UNA— y el predicado seguía
 * encontrando la otra. Un control positivo que se pone rojo cuando la cosa que
 * mide cambia de forma es exactamente para lo que existe.
 */
const veces = (aguja: string): number => tema.split(aguja).length - 1
const CADENAS = [
  ['--font-titulo', '--font-titulo: var(--font-v3-chivo)'],
  ['--font-cuerpo', '--font-cuerpo: var(--font-v3-chivo)'],
  ['--font-codigo', '--font-codigo: var(--font-v3-chivo-mono)'],
  ['--font-display', '--font-display: var(--font-v3-archivo)'],
] as const
for (const [nombre, cadena] of CADENAS) {
  afirmarIgual(veces(cadena), 2, `la cadena de ${nombre} cierra DOS veces: en el \`@theme static\` y en el bloque \`[data-v3]\` que la hace resolver`)
}

controlPositivo(
  'el chequeo de la cadena ve una variable renombrada — incluso si sólo se renombra UNA de las dos',
  tema.replace('--font-titulo: var(--font-v3-chivo)', '--font-titulo: var(--font-otra-cosa)'),
  (css) => css.split('--font-titulo: var(--font-v3-chivo)').length - 1 === 2,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LAS DOS CARAS QUE NO VIENEN DE S0 — su propia traza, de la misma clase')

/**
 * ── Por qué no se comparan contra el manifiesto de S0 ─────────────────────
 *
 * Porque S0 no las bajó. La traza de las dos de Chivo es «el sha256 coincide
 * con lo que gstatic sirvió el día que se midieron las métricas del sistema»;
 * la de estas dos es «el sha256 coincide con lo que produce el script del repo
 * a partir del TTF de Google Fonts, cuyo sha256 también está publicado». Es la
 * misma clase de afirmación —un binario identificado por su contenido y no por
 * su nombre— con otra fuente de verdad, y la fuente de verdad está EN el repo:
 * `scripts-titular/subsetear-fuentes.py` la produce y
 * `scripts-titular/manifiesto-fuentes.json` la publica.
 *
 * ── Y el avance, que es lo que descansa encima ────────────────────────────
 *
 * El tamaño del nivel `display` es un valor DERIVADO del avance de esta cara.
 * Así que no alcanza con que el archivo sea el que dice ser: hay que afirmar el
 * número que se le sacó. Si un re-subset cambiara el punto del eje de ancho, el
 * sha256 se movería —y esto se pondría rojo antes— pero además el avance
 * dejaría de ser 8,4750 em y el 58 dejaría de entrar. Las dos afirmaciones
 * miran la misma cosa desde los dos lados.
 */
interface CaraDelManifiesto {
  readonly cara: string
  readonly enElRepo: string
  readonly bytes: number
  readonly sha256: string
  readonly upstream: { readonly url: string; readonly archivo: string; readonly sha256: string }
  readonly licencia: { readonly nombre: string; readonly url: string; readonly enElRepo: string }
  readonly pines: readonly string[]
  readonly puntosDeCodigo: number
}

const MANIFIESTO_DEL_TITULAR = path.join(RAIZ, 'scripts-titular/manifiesto-fuentes.json')
afirmar(existsSync(MANIFIESTO_DEL_TITULAR), 'el manifiesto del script de subset está en el repo, no afuera')

const manifiesto = JSON.parse(readFileSync(MANIFIESTO_DEL_TITULAR, 'utf8')) as {
  readonly archivoWdth: number
  readonly caras: readonly CaraDelManifiesto[]
}
afirmarIgual(manifiesto.caras.length, 2, 'declara las DOS caras nuevas')
afirmarIgual(manifiesto.archivoWdth, 62, 'y el punto del eje de ancho con el que se pinchó Archivo: 62, el mínimo del eje')

for (const cara of manifiesto.caras) {
  const ruta = path.join(FUENTES, cara.enElRepo)
  afirmar(existsSync(ruta), `${cara.enElRepo} existe en el repo`)
  if (!existsSync(ruta)) continue
  const buffer = readFileSync(ruta)
  afirmarIgual(buffer.length, cara.bytes, `${cara.enElRepo} — ${cara.bytes} bytes (${(cara.bytes / 1024).toFixed(2)} KiB)`)
  afirmarIgual(sha256(buffer), cara.sha256, `  y su sha256 es el que el script publicó`)
  afirmarIgual(cara.licencia.nombre, 'OFL-1.1', `  licencia OFL 1.1 — ${cara.licencia.url}`)
  afirmar(existsSync(path.join(FUENTES, cara.licencia.enElRepo)), `  y el texto de la licencia viaja en el repo: _fuentes/${cara.licencia.enElRepo}`)
  afirmarIgual(cara.puntosDeCodigo, 68, `  subset de 68 posiciones: mayúsculas, cifras, las siete acentuadas y puntuación`)
  afirmar(cara.upstream.sha256.length === 64, `  y el TTF de origen queda identificado por contenido`, cara.upstream.archivo)
}

/** El subset NO tiene minúsculas, y es lo que obliga al `uppercase` de las dos
 *  clases del titular. Se afirma sobre el `cmap` del binario, no sobre la
 *  intención del script: si alguien re-subsetea con minúsculas, esto lo dice. */
for (const cara of manifiesto.caras) {
  const tablas = leerAvancesDe(`src/app/v3/_fuentes/${cara.enElRepo}`)
  const minusculas = [...'abcdefghijklmnopqrstuvwxyz'].filter((c) => tablas.cmap.has(c.codePointAt(0) ?? 0))
  afirmarIgual(minusculas, [], `${cara.enElRepo} NO trae una sola minúscula: es una cara de mayúsculas`)
  const mayusculas = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ÁÉÍÓÚÑÜ'].filter((c) => !tablas.cmap.has(c.codePointAt(0) ?? 0))
  afirmarIgual(mayusculas, [], `  y SÍ trae las 26 mayúsculas, las 10 cifras y las siete acentuadas del español`)
  afirmarIgual(tablas.unidadesPorEm, 1000, `  y mide 1000 unidades por em, como las dos de S0`)
}

controlPositivo(
  'el chequeo de «no hay minúsculas» ve una cara que sí las tiene: la romana de Chivo',
  leerAvancesDe('src/app/v3/_fuentes/chivo-latin.woff2'),
  (t: TablasDeAvance) => [...'abcdefghijklmnopqrstuvwxyz'].every((c) => !t.cmap.has(c.codePointAt(0) ?? 0)),
)

/** EL NÚMERO DEL QUE CUELGA EL 58. Se mide acá, sobre el binario. */
const AVANCE_DECLARADO_EM = 8.475
const ARCHIVO_TABLAS = leerAvancesDe('src/app/v3/_fuentes/archivo-display-latin.woff2')
const avanceDeLaLinea1 =
  [...TEXTO_DEL_TITULAR].reduce(
    (suma, c) => suma + avanceDeCaracter(ARCHIVO_TABLAS, c.codePointAt(0) ?? 0),
    0,
  ) / ARCHIVO_TABLAS.unidadesPorEm
afirmarIgual(
  Number(avanceDeLaLinea1.toFixed(4)),
  AVANCE_DECLARADO_EM,
  `"${TEXTO_DEL_TITULAR}" mide ${AVANCE_DECLARADO_EM} em en la cara de display — el avance del que se derivó el nivel`,
)
/** Y el CONTROL que hace honesto el pinchazo: con el eje vivo esto habría dado
 *  12,5070 em, o sea 47,6 % más. La diferencia entre las dos caras es la prueba
 *  de que la que se sirve NO es la instancia normal de Archivo. */
const CHIVO_TABLAS = leerAvancesDe('src/app/v3/_fuentes/chivo-latin.woff2')
const enChivo =
  [...TEXTO_DEL_TITULAR].reduce((s, c) => s + avanceDeCaracter(CHIVO_TABLAS, c.codePointAt(0) ?? 0), 0) /
  CHIVO_TABLAS.unidadesPorEm
afirmar(
  avanceDeLaLinea1 < enChivo * 0.8,
  `y es mucho más angosta que Chivo: ${avanceDeLaLinea1.toFixed(4)} contra ${enChivo.toFixed(4)} em`,
  `${((1 - avanceDeLaLinea1 / enChivo) * 100).toFixed(1)} % más angosta — es una cara condensada, no la normal`,
)

cerrar('fuentes.invariant')
