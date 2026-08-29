/**
 * INVARIANTE — cuánto pesa lo que ESTE SPRINT CONTROLA, sobre la salida del
 * build.
 *
 * Corre con `npm run build` y después `npm run test:s3-peso`.
 * Acepta un distDir alternativo: `npx tsx …/s3-peso.invariant.ts .next-otro`.
 *
 * ── REDISEÑADO EN S4, Y POR QUÉ ───────────────────────────────────────────
 *
 * La versión anterior afirmaba que la carga inicial de `/v3` no se movía más de
 * 1 KiB gzip ni sumaba archivos contra la línea de base de S1. **Falló al
 * correr los tres sprints juntos** —424,0 contra 422,0 KiB gzip, 25 archivos
 * contra 24— y la falla era legítima: el número había crecido.
 *
 * Pero **ese número no es de este sprint**. De los 25 archivos, 24 son
 * heredados del layout raíz —el chrome viejo, compartido con el home, que estos
 * sprints tienen PROHIBIDO tocar— y 1 es propio de `/v3`, que no se movió.
 * Afirmar el total ponía a este invariante a fallar por algo que su sprint no
 * produce ni puede arreglar, y un check así no protege: entrena a ignorarlo.
 *
 * ⚠️ **Era la SEGUNDA vez que aparecía el mismo error, y S1 lo había hecho
 * bien**: `bundle.invariant.ts` afirma `lo PROPIO de /v3 < 30 KiB` y deja el
 * total como cifra impresa. La regla que quedó —§3.13 de
 * `DIRECCION-ESCENA.md`— es: *un invariante afirma lo que su sprint controla;
 * lo que hereda se publica con atribución y se vigila, pero no se afirma.*
 *
 * **La vigilancia de lo heredado se mudó a `s4-heredado.invariant.ts`**, junto
 * con la línea de base de regresión y la predicción diferida del mapa. Acá
 * queda lo de S3, y sólo eso.
 *
 * ── Qué afirma ────────────────────────────────────────────────────────────
 *
 *   1. El peso PROPIO de `/v3`, con umbral y control positivo.
 *   2. El CSS que el sprint agrega: las cinco hojas del chrome.
 *   3. Las rutas de demostración, con su peso propio aparte.
 *   4. La compuerta del cursor, sobre la salida del build.
 *   5. Que las utilidades del sistema que el sprint escribe existen.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

import { MARCA_CURSOR } from '../marcaCursor'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import {
  DIST,
  conjuntoInicial,
  contiene,
  exigirBuild,
  hojasDe,
  htmlDe,
  kib,
  partirCargaInicial,
  pesar,
  todosLosChunks,
} from './s3-bundle'
import { partesDeSelector, reglas } from './s3-css'
import { RUTAS_DE_DEMO } from './s4-rutas-de-demo'

exigirBuild()

const inicialV3 = conjuntoInicial('/v3')
const inicialHome = conjuntoInicial('/')
const { propios, pesoPropio } = partirCargaInicial(inicialV3, inicialHome)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Lo que este sprint CONTROLA: el peso propio de /v3')

afirmar(inicialV3.length > 0, `la carga inicial de /v3 son ${inicialV3.length} archivos`)
/** Sin el home, la partición daría "todo propio" y el umbral pasaría por vacío. */
afirmar(inicialHome.length > 0, `  y la del home ${inicialHome.length}, contra la que se parte`)

/** El mismo umbral que S1: es el sprint el que lo controla, y no lo movió. */
const PRESUPUESTO_PROPIO_KIB = 30
afirmar(
  pesoPropio.crudo / 1024 < PRESUPUESTO_PROPIO_KIB,
  `lo PROPIO de /v3 < ${PRESUPUESTO_PROPIO_KIB} KiB crudo`,
  `${kib(pesoPropio.crudo)} crudo · ${kib(pesoPropio.gzip)} gzip en ${propios.length} archivo(s)`,
)
afirmar(
  propios.length <= 2,
  '  y a lo sumo dos archivos propios: el sprint no monta ninguna pieza en el home nuevo',
  propios.join(' · ') || '(ninguno)',
)

controlPositivo(
  'el umbral de lo propio vería un exceso',
  { crudo: (PRESUPUESTO_PROPIO_KIB + 1) * 1024 },
  (p) => p.crudo / 1024 < PRESUPUESTO_PROPIO_KIB,
)
controlPositivo(
  'y el partidor no llama propio a un archivo que el home también pide',
  inicialHome,
  (delHome) => partirCargaInicial(inicialV3, delHome).propios.length === inicialV3.length,
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
titulo('3 · Las rutas de demostración, aparte')

for (const { ruta } of RUTAS_DE_DEMO.filter((r) => r.sprint === 'S3')) {
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
