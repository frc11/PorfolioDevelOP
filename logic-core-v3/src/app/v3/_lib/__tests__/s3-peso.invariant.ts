/**
 * INVARIANTE — cuánto pesa este sprint, sobre LA SALIDA DEL BUILD.
 *
 * Corre con `npm run build` y después `npm run test:s3-peso`.
 * Acepta un distDir alternativo: `npx tsx …/s3-peso.invariant.ts .next-otro`.
 *
 * ── Qué se mide, y contra qué ─────────────────────────────────────────────
 *
 * S1 midió la carga inicial de `/v3` en **1385,8 KiB crudo · 422,0 KiB gzip**,
 * en 24 archivos, de los cuales 23 son heredados del layout raíz —el chrome
 * viejo, que este sprint tiene prohibido tocar—. La pregunta que este
 * instrumento responde es qué le agregó S3 a ese número.
 *
 * La respuesta se descompone en tres, porque son tres cosas distintas:
 *
 *   · **JS de `/v3`**: el sprint no monta ninguna pieza en el home nuevo —eso
 *     es del sprint de secciones—, así que tiene que quedar igual.
 *   · **CSS**: las cinco hojas del chrome se importan en el layout de /v3, así
 *     que sí entran en la carga inicial de la ruta. Se miden extrayendo del
 *     CSS SERVIDO las reglas del sprint —las que nombran `data-pieza` o
 *     `data-parte`— y pesándolas crudas y comprimidas.
 *   · **Las dos rutas de demostración**: peso propio, que se va con ellas.
 *
 * ── Y la compuerta del cursor, sobre el build ─────────────────────────────
 *
 * Un chunk que no se descarga no se prueba a ojo. La marca del cursor tiene
 * que existir en algún chunk (el buscador no está ciego) y no estar en la
 * carga inicial de la ruta que lo monta.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

import { MARCA_CURSOR } from '../marcaCursor'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { RAIZ } from './s3-archivos'
import { partesDeSelector, reglas } from './s3-css'

const DIST = path.join(RAIZ, process.argv[2] ?? '.next')

if (!existsSync(DIST)) {
  console.error(`\nNo existe ${DIST}. Corré \`npm run build\` primero.`)
  process.exit(1)
}

/** La línea de base que midió S1, para poder decir "no creció". */
const BASE_S1 = { crudoKiB: 1385.8, gzipKiB: 422.0, archivos: 24 }

function htmlDe(ruta: string): string {
  const nombre = ruta === '/' ? 'index' : ruta.replace(/^\//, '')
  const archivo = path.join(DIST, 'server', 'app', `${nombre}.html`)
  return existsSync(archivo) ? readFileSync(archivo, 'utf8') : ''
}

/** Los `.js` que pide la carga inicial de una ruta: sus `<script src>`. */
function conjuntoInicial(ruta: string): string[] {
  const encontrados = htmlDe(ruta).matchAll(/\/_next\/(static\/[^"']+?\.js)/g)
  return [...new Set([...encontrados].map((m) => m[1]))].sort()
}

/** Las hojas que pide una ruta: sus `<link rel=stylesheet>`. */
function hojasDe(ruta: string): string[] {
  const encontrados = htmlDe(ruta).matchAll(/\/_next\/(static\/css\/[^"']+?\.css)/g)
  return [...new Set([...encontrados].map((m) => m[1]))].sort()
}

const pesar = (archivos: readonly string[]): { crudo: number; gzip: number } => {
  let crudo = 0
  let gzip = 0
  for (const f of archivos) {
    const p = path.join(DIST, f)
    if (!existsSync(p)) continue
    crudo += statSync(p).size
    gzip += gzipSync(readFileSync(p)).length
  }
  return { crudo, gzip }
}

const kib = (n: number): string => `${(n / 1024).toFixed(1)} KiB`

function todosLosChunks(dir = path.join(DIST, 'static', 'chunks'), acumulado: string[] = []): string[] {
  if (!existsSync(dir)) return acumulado
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name)
    if (entrada.isDirectory()) todosLosChunks(completo, acumulado)
    else if (entrada.name.endsWith('.js')) acumulado.push(path.relative(DIST, completo).replace(/\\/g, '/'))
  }
  return acumulado
}

const contiene = (relativo: string, aguja: string): boolean => {
  const p = path.join(DIST, relativo)
  return existsSync(p) && readFileSync(p, 'utf8').includes(aguja)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La carga inicial de /v3 no creció')

const inicialV3 = conjuntoInicial('/v3')
afirmar(inicialV3.length > 0, `la carga inicial de /v3 son ${inicialV3.length} archivos`)

const pesoV3 = pesar(inicialV3)
console.log(`  /v3   ${kib(pesoV3.crudo)} crudo · ${kib(pesoV3.gzip)} gzip   (S1 midió ${BASE_S1.crudoKiB} KiB · ${BASE_S1.gzipKiB} KiB en ${BASE_S1.archivos})`)

/**
 * "No creció" sería mentira: crece 0,3 KiB gzip, y hay que decirlo. El cambio
 * es el `import` de las cinco hojas en el layout de /v3, que mueve el chunk del
 * layout unos bytes. Lo que se afirma es el orden de magnitud: **el sprint no
 * pone JavaScript nuevo en la carga inicial del home**, porque no monta
 * ninguna pieza ahí — eso es del sprint de secciones.
 */
afirmar(
  pesoV3.gzip / 1024 <= BASE_S1.gzipKiB + 1,
  'el JS inicial de /v3 se mantiene dentro de 1 KiB gzip de la línea de base de S1',
  `${kib(pesoV3.gzip)} gzip contra ${BASE_S1.gzipKiB} KiB — ${(pesoV3.gzip / 1024 - BASE_S1.gzipKiB).toFixed(1)} KiB de diferencia`,
)
afirmar(
  inicialV3.length <= BASE_S1.archivos,
  'ni sumó archivos: este sprint no monta ninguna pieza en el home nuevo',
  `${inicialV3.length} contra ${BASE_S1.archivos}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Lo que SÍ agrega: las cinco hojas del chrome')

const hojasDeV3 = hojasDe('/v3')
afirmar(hojasDeV3.length > 0, `/v3 pide ${hojasDeV3.length} hoja(s) de CSS`)
const cssServido = hojasDeV3.map((f) => readFileSync(path.join(DIST, f), 'utf8')).join('\n')

/** Las reglas del sprint dentro del CSS servido: las que nombran nuestros
 *  atributos. Es la forma de aislar lo nuestro sin depender de nombres de
 *  archivo con hash. */
function reglasDelSprint(css: string): string[] {
  return reglas(css)
    .filter((r) => partesDeSelector(r.selector).some((p) => /data-(?:pieza|parte|forzado)/.test(p)))
    .map((r) => `${r.selector}{${r.cuerpo}}`)
}

const nuestras = reglasDelSprint(cssServido)
const textoNuestro = nuestras.join('')
const crudoCss = Buffer.byteLength(textoNuestro, 'utf8')
const gzipCss = gzipSync(Buffer.from(textoNuestro, 'utf8')).length
const pesoCssTotal = pesar(hojasDeV3)

console.log(`  CSS servido de /v3        ${kib(pesoCssTotal.crudo)} crudo · ${kib(pesoCssTotal.gzip)} gzip`)
console.log(`  del cual, reglas de S3    ${kib(crudoCss)} crudo · ${kib(gzipCss)} gzip   (${nuestras.length} reglas)`)

afirmar(nuestras.length > 0, 'las reglas del sprint llegaron al CSS servido', `${nuestras.length} reglas`)

/**
 * Guardia de regresión, no un presupuesto: la instrucción no fija ninguno para
 * el CSS. La cifra que importa es la que se imprime arriba; esto sólo existe
 * para que el chrome no engorde en silencio en los sprints que vienen.
 */
const GUARDIA_CSS_KIB = 24
afirmar(
  crudoCss / 1024 < GUARDIA_CSS_KIB,
  `y no pasan la guardia de ${GUARDIA_CSS_KIB} KiB crudo`,
  kib(crudoCss),
)

controlPositivo(
  'el extractor de reglas del sprint no se queda con las ajenas',
  '.utilidad-de-tailwind{display:flex}',
  (css) => reglasDelSprint(css).length > 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Las dos rutas de demostración, aparte')

for (const ruta of ['/v3/componentes', '/v3/tipografia', '/v3/tipografia/muestra']) {
  const inicial = conjuntoInicial(ruta)
  const peso = pesar(inicial)
  const propios = inicial.filter((f) => !inicialV3.includes(f))
  const pesoPropio = pesar(propios)
  console.log(
    `  ${ruta.padEnd(24)} ${kib(peso.crudo)} crudo · ${kib(peso.gzip)} gzip  ·  propio de la ruta: ${kib(pesoPropio.crudo)} (${propios.length} archivos)`,
  )
  afirmar(inicial.length > 0, `  ${ruta} se prerenderizó`, `${inicial.length} archivos`)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La compuerta del cursor, sobre la salida del build')

const conLaMarca = todosLosChunks().filter((f) => contiene(f, MARCA_CURSOR))
afirmar(conLaMarca.length > 0, `la marca del cursor está en ${conLaMarca.length} chunk(s)`, conLaMarca.join(' · '))

const inicialComponentes = conjuntoInicial('/v3/componentes')
const suciosComponentes = inicialComponentes.filter((f) => contiene(f, MARCA_CURSOR))
afirmarIgual(suciosComponentes, [], 'y NO está en la carga inicial de /v3/componentes, que es quien lo monta')
afirmar(!htmlDe('/v3/componentes').includes(MARCA_CURSOR), '  ni en su HTML servido: `ssr: false` no lo renderiza')

/**
 * El control positivo de la ceguera: la MISMA función, buscando algo que SÍ
 * está en la carga inicial de esa ruta. Sin esto, "no lo encontré" y "no sé
 * buscar" son indistinguibles.
 *
 * La sonda es la consulta de preferencia, y no un rótulo del CTA: el CTA es un
 * componente de servidor, así que su marcado va al HTML y no a un chunk de
 * cliente — buscarlo ahí no probaría nada. Esta cadena, en cambio, es un
 * literal de `_lib/cursor.ts`, que la compuerta importa y la compuerta ES
 * cliente: tiene que estar en el grafo inicial.
 */
const SONDA_PRESENTE = '(prefers-reduced-motion: reduce)'
const conLaSonda = inicialComponentes.filter((f) => contiene(f, SONDA_PRESENTE))
afirmar(
  conLaSonda.length > 0,
  `[control positivo] la misma búsqueda SÍ encuentra "${SONDA_PRESENTE}" en la carga inicial`,
  conLaSonda.join(' · '),
)

controlPositivo(
  'el buscador no encuentra una marca que no existe en ningún chunk',
  'marca-que-no-existe-en-ningun-chunk-jamas',
  (marca) => todosLosChunks().some((f) => contiene(f, marca)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Las utilidades del sistema que el sprint escribe EXISTEN')

/**
 * Una clase que Tailwind no generó es el peor tipo de error: el atributo está
 * en el HTML, el navegador no encuentra la regla, y la página se ve "casi
 * bien". No hay error en consola, no lo caza el tipado y no lo caza el linter.
 *
 * Pasa de verdad y es fácil: Tailwind escanea el CÓDIGO FUENTE buscando
 * candidatos, así que una clase armada con una plantilla —`text-${nivel}`— no
 * la ve nadie. Todas las tablas de este sprint escriben las clases enteras por
 * esta razón, y acá se comprueba contra el CSS que SE SIRVE.
 */
const CLASES_DEL_SPRINT = [
  'font-titulo', 'font-cuerpo', 'font-codigo',
  'font-normal', 'font-medio', 'font-semi',
  'text-micro', 'text-caption', 'text-cuerpo', 'text-base',
  'text-titulo-s', 'text-titulo-m', 'text-titulo-l', 'text-titulo-xl',
  'text-fluido-micro', 'text-fluido-caption', 'text-fluido-titulo-s',
  'text-fluido-titulo-m', 'text-fluido-titulo-l', 'text-fluido-titulo-xl',
  'leading-micro', 'leading-texto', 'leading-titulo',
  'tracking-micro', 'tracking-texto', 'tracking-titulo', 'tracking-display',
  'text-tinta', 'text-tinta-tenue', 'bg-fondo', 'bg-superficie-1', 'border-borde',
  'max-w-tope', 'opacity-casi',
]

const todasLasHojas = [
  ...new Set(
    ['/v3', '/v3/componentes', '/v3/tipografia', '/v3/tipografia/muestra'].flatMap((r) => hojasDe(r)),
  ),
]
const cssDeTodo = todasLasHojas.map((f) => readFileSync(path.join(DIST, f), 'utf8')).join('\n')

const tieneRegla = (clase: string): boolean =>
  new RegExp(`\\.${clase.replace(/[-]/g, '\\-')}(?![\\w-])`).test(cssDeTodo)

const sinRegla = CLASES_DEL_SPRINT.filter((c) => !tieneRegla(c))
afirmarIgual(sinRegla, [], `las ${CLASES_DEL_SPRINT.length} utilidades del sistema tienen regla emitida`)

// Y los dos breakpoints que las variantes del sprint usan.
for (const ancho of [768, 1025]) {
  afirmar(
    new RegExp(`@media\\s*\\(\\s*(?:min-)?width\\s*[:>=]+\\s*${ancho}px\\s*\\)`).test(cssDeTodo),
    `la variante de ${ancho}px emitió su media query`,
  )
}

controlPositivo(
  'el buscador de utilidades ve una clase que NO existe',
  'text-nivel-que-no-existe',
  (clase) => tieneRegla(clase),
)

cerrar('s3-peso.invariant')
