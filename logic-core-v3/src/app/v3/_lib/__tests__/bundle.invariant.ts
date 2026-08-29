/**
 * INVARIANTE — la compuerta de 1025, sobre LA SALIDA DEL BUILD.
 *
 * Corre con `npm run build` y después `npm run test:s1-bundle`.
 * Acepta un distDir alternativo: `npx tsx …/bundle.invariant.ts .next-s1-control`.
 *
 * ── Por qué esto no se puede verificar mirando la página ───────────────────
 *
 * Un chunk que no se descarga no se prueba a ojo. Abrir /v3 en una ventana
 * angosta y no ver el escenario es compatible con dos cosas distintas: que la
 * compuerta funcione, o que el escenario esté roto. Lo único que las distingue
 * es qué archivos pide la carga inicial.
 *
 * ── De dónde sale "la carga inicial" ───────────────────────────────────────
 *
 * De los `<script src>` del HTML PRERENDERIZADO de cada ruta
 * (`.next/server/app/<ruta>.html`), no de un manifiesto.
 *
 * Es a propósito: ese HTML es literalmente lo que el servidor manda y lo que
 * el navegador pide en el primer viaje. Un manifiesto es una descripción; el
 * HTML es la cosa. Además `app-build-manifest.json` dejó de existir en Next
 * 16.2.9 —se intentó primero y no está—, así que la descripción encima cambia
 * de forma entre versiones y el HTML no.
 *
 * ── Las tres afirmaciones ──────────────────────────────────────────────────
 *
 *   A1  La MARCA existe en algún archivo de `static/chunks`.
 *       → el módulo compiló y el buscador NO está ciego.
 *   A2  La MARCA no está en ningún archivo de la carga inicial de `/v3`,
 *       ni en su HTML.
 *       → LA TESIS: abajo del umbral el bundle no se importa.
 *   A3  La MARCA sí está en la carga inicial de `/v3/control-estatico`.
 *       → EL CONTROL POSITIVO. La ruta gemela importa el mismo módulo de forma
 *         estática, en el mismo build, y la comprueba la misma función.
 *
 * A2 sin A3 no vale nada: pasaría en verde aunque el escenario no existiera,
 * que es exactamente el caso hoy, porque es un marcador de posición.
 * A3 sin A1 tampoco: si la marca se podara, las dos rutas saldrían limpias.
 *
 * ── Si A2 falla ────────────────────────────────────────────────────────────
 *
 * Hay dos causas posibles y hay que distinguirlas antes de tocar nada:
 *   (a) la compuerta gotea de verdad;
 *   (b) webpack hoisteó el módulo a un chunk compartido POR CULPA de la ruta
 *       gemela — o sea, el instrumento contaminó lo que mide.
 * Se distingue corriendo el plan B: build aislado sin la ruta gemela
 *   E2E_DIST_DIR=.next-s1-control npm run build
 *   npx tsx src/app/v3/_lib/__tests__/bundle.invariant.ts .next-s1-control
 * (el directorio ya está en `.gitignore`, agregado ANTES de correr ningún
 * build, por la lección del `distDir` que envenena a Tailwind).
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

import { MARCA_ESCENARIO } from '../marcaEscenario'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')
const DIST = path.join(RAIZ, process.argv[2] ?? '.next')

if (!existsSync(DIST)) {
  console.error(`\nNo existe ${DIST}. Corré \`npm run build\` primero.`)
  process.exit(1)
}

/** El HTML que el servidor manda para una ruta prerenderizada. */
function htmlDe(ruta: string): string {
  // El home prerenderizado se llama `index.html`, no `.html`.
  const nombre = ruta === '/' ? 'index' : ruta.replace(/^\//, '')
  const archivo = path.join(DIST, 'server', 'app', `${nombre}.html`)
  if (!existsSync(archivo)) {
    console.error(`  no existe el HTML prerenderizado de ${ruta}: ${archivo}`)
    return ''
  }
  return readFileSync(archivo, 'utf8')
}

/**
 * Los `.js` que pide la carga inicial de una ruta: los `<script src>` de su
 * HTML. Los chunks perezosos NO están acá — ésa es exactamente la propiedad
 * que hace que este conjunto responda la pregunta.
 */
function conjuntoInicial(ruta: string): string[] {
  const encontrados = htmlDe(ruta).matchAll(/\/_next\/(static\/[^"']+?\.js)/g)
  return [...new Set([...encontrados].map((m) => m[1]))].sort()
}

const rutaDe = (relativo: string): string => path.join(DIST, relativo)
const tieneLaMarca = (relativo: string): boolean => {
  const p = rutaDe(relativo)
  return existsSync(p) && readFileSync(p, 'utf8').includes(MARCA_ESCENARIO)
}

/** Todos los `.js` bajo `static/chunks`, recursivo, en ruta relativa al dist. */
function todosLosChunks(dir = path.join(DIST, 'static', 'chunks'), acumulado: string[] = []): string[] {
  if (!existsSync(dir)) return acumulado
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name)
    if (entrada.isDirectory()) todosLosChunks(completo, acumulado)
    else if (entrada.name.endsWith('.js')) acumulado.push(path.relative(DIST, completo).replace(/\\/g, '/'))
  }
  return acumulado
}

const pesar = (archivos: string[]): { crudo: number; gzip: number } => {
  let crudo = 0
  let gzip = 0
  for (const f of archivos) {
    const p = rutaDe(f)
    if (!existsSync(p)) continue
    crudo += statSync(p).size
    gzip += gzipSync(readFileSync(p)).length
  }
  return { crudo, gzip }
}
const kib = (n: number): string => `${(n / 1024).toFixed(1)} KiB`

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · La MARCA existe en la salida — el buscador no está ciego')

const conLaMarca = todosLosChunks().filter(tieneLaMarca)
afirmar(conLaMarca.length > 0, `la marca aparece en ${conLaMarca.length} chunk(s)`, conLaMarca.join(' · '))

controlPositivo(
  'el buscador no encuentra una marca que no existe',
  'esta-marca-no-existe-en-ningun-chunk-jamas',
  (marca) => todosLosChunks().some((f) => readFileSync(rutaDe(f), 'utf8').includes(marca)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A2 · LA TESIS — la marca NO está en la carga inicial de /v3')

const inicialV3 = conjuntoInicial('/v3')
afirmar(inicialV3.length > 0, `la carga inicial de /v3 son ${inicialV3.length} archivos`)
afirmar(pesar(inicialV3).crudo > 0, '  y pesan más de cero bytes — el conjunto no está vacío')

const sucios = inicialV3.filter(tieneLaMarca)
afirmarIgual(sucios, [], 'ningún archivo de la carga inicial de /v3 contiene la marca')
afirmar(!htmlDe('/v3').includes(MARCA_ESCENARIO), 'y el HTML servido de /v3 tampoco: `ssr: false` no lo renderiza')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A3 · EL CONTROL POSITIVO — en /v3/control-estatico SÍ está')

const inicialControl = conjuntoInicial('/v3/control-estatico')
afirmar(inicialControl.length > 0, `la carga inicial del control son ${inicialControl.length} archivos`)

const suciosControl = inicialControl.filter(tieneLaMarca)
afirmar(
  suciosControl.length > 0,
  'la MISMA comprobación SÍ encuentra la marca en la ruta con import estático',
  suciosControl.join(' · '),
)
afirmar(
  htmlDe('/v3/control-estatico').includes(MARCA_ESCENARIO),
  '  y ahí el escenario además se renderiza en el servidor: la marca está en el HTML',
)
afirmar(
  suciosControl.length > 0 && sucios.length === 0,
  'el chequeo distingue las dos rutas: es capaz de fallar, y en /v3 no falla',
)

// El instrumento no contaminó lo que mide: si webpack hubiera hoisteado el
// módulo a un chunk compartido, /v3 tendría los mismos archivos que el control.
const extraDelControl = inicialControl.filter((f) => !inicialV3.includes(f))
afirmarIgual(
  extraDelControl.length,
  1,
  'la ruta gemela agrega exactamente UN archivo sobre /v3: no hubo hoisting a un chunk compartido',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('PESO — el bundle inicial arriba y abajo de 1025')

const abajo = pesar(inicialV3)
const perezosos = conLaMarca.filter((f) => !inicialV3.includes(f) && !inicialControl.includes(f))
const extra = pesar(perezosos)
const arriba = { crudo: abajo.crudo + extra.crudo, gzip: abajo.gzip + extra.gzip }

console.log(`  ABAJO de 1025   ${kib(abajo.crudo)} crudo · ${kib(abajo.gzip)} gzip   — ${inicialV3.length} archivos`)
console.log(`  ARRIBA de 1025  ${kib(arriba.crudo)} crudo · ${kib(arriba.gzip)} gzip  — +${perezosos.length} chunk perezoso (${extra.crudo} B crudo · ${extra.gzip} B gzip)`)
console.log(`  chunk perezoso del escenario: ${perezosos.join(' · ') || '(ninguno)'}`)

/**
 * ⚠ EL PRESUPUESTO NO SE CUMPLE, Y NO ES DE /v3.
 *
 * El sprint fija `JS < 300 KB` abajo del umbral. /v3 mide ~1386 KiB crudo, o
 * sea que NO cumple. Pero la descomposición dice de quién es el peso:
 *
 *   23 de los 24 archivos son LOS MISMOS que pide el home actual. Vienen del
 *   layout RAÍZ, que importa estáticamente Navbar, Shutter, Preloader, Lenis,
 *   sonner y el widget de chat. `PublicOnlyComponents` los apaga en tiempo de
 *   ejecución para /v3 —devuelve null— pero el import estático ya metió los
 *   chunks en la carga inicial de TODA ruta. Apagar un componente no lo saca
 *   del bundle; ésa es exactamente la lección que la compuerta aplica.
 *
 *   Lo propio de /v3 es UN archivo de ~4,5 KiB, más el chunk perezoso del
 *   escenario, que abajo del umbral no se pide.
 *
 * Este sprint tiene prohibido tocar el layout raíz. El presupuesto se vuelve
 * alcanzable en el sprint que REEMPLACE al home, cuando el layout raíz deje de
 * cargar el chrome viejo en rutas que no lo usan.
 *
 * Qué se afirma acá, entonces: lo que este sprint SÍ controla —su peso propio—
 * y que el heredado no CREZCA. El total se imprime con su veredicto, sin
 * maquillarlo, para que nadie lea un verde y crea que el presupuesto se cumple.
 */
const PRESUPUESTO_JS_KIB = 300
const cumple = abajo.crudo / 1024 < PRESUPUESTO_JS_KIB
console.log(`  PRESUPUESTO JS < ${PRESUPUESTO_JS_KIB} KiB  →  ${cumple ? 'CUMPLE' : 'NO CUMPLE'} (${kib(abajo.crudo)} crudo)`)

const inicialHome = conjuntoInicial('/')
const heredados = inicialV3.filter((f) => inicialHome.includes(f))
const propios = inicialV3.filter((f) => !inicialHome.includes(f))
const pesoHeredado = pesar(heredados)
const pesoPropio = pesar(propios)
console.log(`     heredado del layout raíz (compartido con el home): ${heredados.length} archivos · ${kib(pesoHeredado.crudo)} crudo`)
console.log(`     propio de /v3                                    : ${propios.length} archivos · ${kib(pesoPropio.crudo)} crudo`)

const PRESUPUESTO_PROPIO_KIB = 30
afirmar(
  (pesoPropio.crudo + extra.crudo) / 1024 < PRESUPUESTO_PROPIO_KIB,
  `lo PROPIO de /v3 (lo que este sprint controla) < ${PRESUPUESTO_PROPIO_KIB} KiB`,
  `${kib(pesoPropio.crudo + extra.crudo)} crudo · ${kib(pesoPropio.gzip + extra.gzip)} gzip`,
)

/**
 * Guardia de regresión del peso heredado. NO es un objetivo: es una línea de
 * base con fecha, para que el chrome viejo no siga engordando en silencio
 * mientras se espera al sprint del reemplazo. Si sube, hay que mirar por qué.
 */
const HEREDADO_BASE_KIB = 1400 // medido 2026-08-28: 1381,3 KiB
afirmar(
  pesoHeredado.crudo / 1024 < HEREDADO_BASE_KIB,
  `el peso heredado no creció sobre la línea de base (${HEREDADO_BASE_KIB} KiB)`,
  kib(pesoHeredado.crudo),
)
afirmar(
  propios.length <= 2,
  'y /v3 aporta a lo sumo dos archivos propios a la carga inicial',
  `${propios.length}: ${propios.join(' · ')}`,
)

afirmarIgual(perezosos.length, 1, 'hay exactamente un chunk perezoso con el escenario')
afirmar(extra.crudo > 0, '  y pesa más de cero bytes: existe de verdad')

// ═══════════════════════════════════════════════════════════════════════════
titulo('CSS — los 90 tokens llegan al :root en el CSS que se sirve')

const cssDir = path.join(DIST, 'static', 'css')
const hojas = existsSync(cssDir) ? readdirSync(cssDir).filter((f) => f.endsWith('.css')) : []
afirmar(hojas.length > 0, `el build emitió ${hojas.length} hoja(s) de CSS`)

const tema = readFileSync(path.join(RAIZ, 'src/app/theme-develop.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const tokens = [...new Set([...tema.matchAll(/(?:^|[;{}\s])(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]))]
const cssServido = hojas.map((f) => readFileSync(path.join(cssDir, f), 'utf8')).join('\n')
const faltantes = tokens.filter((t) => !new RegExp(`${t}\\s*:`).test(cssServido))

/**
 * 90 y no 89 desde S3 (2026-08-29): entró `--color-superficie-translucida`,
 * la superficie que le faltaba a `--blur-panel`. El nombre de la excepción lo
 * afirma `tokens.invariant.ts`; acá sólo importa que TODOS lleguen al CSS que
 * se sirve, sean 89 o 90.
 */
afirmarIgual(tokens.length, 90, 'el tema declara 90 tokens — los 89 de S0 más la corrección de S3')
afirmarIgual(faltantes, [], 'los 90 llegan al CSS servido — `@theme static` hace lo que promete')

controlPositivo(
  'el buscador de tokens ve uno que NO está en el CSS servido',
  '--token-que-no-existe-en-ningun-lado',
  (t) => new RegExp(`${t}\\s*:`).test(cssServido),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('CSS — las utilidades del sistema que /v3 usa EXISTEN en el CSS servido')

/**
 * Un token fuera de namespace es un token muerto que parece vivo — y una clase
 * que Tailwind no generó es exactamente lo mismo: el atributo está en el HTML,
 * el navegador no encuentra la regla, y la página se ve "casi bien". No hay
 * error en consola y no lo caza ni el tipado ni el linter.
 *
 * Acá se afirma, contra el CSS que SE SIRVE, que cada clase derivada de un
 * token de develOP que el árbol de /v3 escribe tiene su regla emitida.
 */
const CLASES_DEL_SISTEMA = [
  'font-titulo',
  'font-cuerpo',
  'font-codigo',
  'text-micro',
  'text-cuerpo',
  'text-titulo-l',
  'text-titulo-m',
  'leading-micro',
  'leading-texto',
  'leading-titulo',
  'tracking-micro',
  'tracking-texto',
  'tracking-titulo',
  'text-tinta',
  'bg-fondo',
  'max-w-tope',
  'opacity-casi',
]
const sinRegla = CLASES_DEL_SISTEMA.filter((c) => !new RegExp(`\\.${c}\\s*[,{]`).test(cssServido))
afirmarIgual(sinRegla, [], `las ${CLASES_DEL_SISTEMA.length} utilidades del sistema que /v3 usa tienen regla emitida`)

// Y el breakpoint propio: `tablet:` sale de `--breakpoint-tablet`, que sin
// `static` es de los que se podan.
afirmar(
  /@media\s*\(\s*(?:min-)?width\s*[:>=]+\s*768px\s*\)/.test(cssServido),
  'el breakpoint `tablet` (768px) emitió su media query',
)

controlPositivo(
  'el buscador de utilidades ve una clase que NO existe',
  'font-que-no-existe',
  (c) => new RegExp(`\\.${c}\\s*[,{]`).test(cssServido),
)

cerrar('bundle.invariant')
