/**
 * B7 · FRENTE A — EL DELTA DE PESO DEL ARREGLO, CON SU INSTRUMENTO Y SU CEGUERA
 * DECLARADA.
 *
 *     npx tsx scripts-b7/a-peso.ts
 *
 * El presupuesto de `s5-peso` está al filo: 61,25 KiB crudo de techo, subido por
 * B4-A con recibo. El arreglo del frente A monta una pieza nueva en el layout de
 * /v3, así que la pregunta «cuánto pesa» no es retórica.
 *
 * ── Las DOS mitades de la pregunta, y por qué se contestan distinto ────────
 *
 *   1. **¿El arreglo arrastra MÓDULOS DE LIBRERÍA nuevos?** Ésta se contesta
 *      sobre el build de producción que ya está servido (`.next-probe`), que es
 *      un build ANTERIOR al cambio: si el módulo que el proveedor necesita ya
 *      estaba en la carga inicial de `/v3`, montarlo cuesta cero bytes de
 *      librería. Es una medición sobre bytes reales.
 *
 *   2. **¿Cuánto pesa el código PROPIO que el frente escribe?** Ésta NO se puede
 *      contestar hoy sin correr `npm run build`, que este frente tiene prohibido
 *      —el padre lo corre en su Fase 2, y cuatro frentes comparten el árbol—.
 *      Se publica una **cota superior del FUENTE** (sin comentarios, crudo y
 *      gzip) y se declara que la cifra definitiva la da `npm run test:s5-peso`
 *      después de ese build. Una cota declarada como cota no es una medición
 *      inventada; una cota publicada como si fuera el número del chunk, sí.
 *
 * ── ⚠️ LA CEGUERA, DECLARADA ANTES DE PUBLICAR NADA ───────────────────────
 *
 * La alternativa a `MotionConfigContext.Provider` era `<MotionConfig>`, que
 * arrastra `resolveTransition` (de `motion-dom`) y `loadExternalIsValidProp` (de
 * `render/dom/utils/filter-props`). **Esa comparación NO se puede hacer en
 * bytes sobre el build**: el minificador mangla esos identificadores y las tres
 * cadenas aparecen en **0 de los 343 chunks del build entero**, o sea que un
 * «0 en la carga inicial» sería verde por vacío. Este archivo lo comprueba y lo
 * dice; la comparación entre las dos opciones se cierra donde SÍ es observable:
 * en el grafo de imports del fuente instalado, derivado de `node_modules`.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../src/app/v3/_lib/__tests__/afirmar'

import { guardarJson } from './b7-comun'

const RAIZ = process.cwd()
const DIST = path.join(RAIZ, process.argv[2] ?? '.next-probe')

/** El módulo de la librería que el proveedor necesita, y su huella en el build. */
const HUELLA_DEL_CONTEXTO = 'reducedMotion:"never"'
/** La misma huella por otro lado: el nombre de propiedad del objeto por defecto. */
const HUELLA_DEL_CONTEXTO_2 = 'transformPagePoint'
/** Las tres que el minificador se come. Se listan para poder AFIRMAR la ceguera. */
const HUELLAS_MANGLADAS = ['resolveTransition', 'loadExternalIsValidProp', 'isValidMotionProp']

const NUEVO = 'src/app/v3/_lib/motion/ProveedorDeMovimiento.tsx'
const MOTION_CONFIG = 'node_modules/framer-motion/dist/es/components/MotionConfig/index.mjs'

function htmlDe(ruta: string): string {
  const nombre = ruta === '/' ? 'index' : ruta.replace(/^\//, '')
  const archivo = path.join(DIST, 'server', 'app', `${nombre}.html`)
  return existsSync(archivo) ? readFileSync(archivo, 'utf8') : ''
}

function conjuntoInicial(ruta: string): string[] {
  return [...new Set([...htmlDe(ruta).matchAll(/\/_next\/(static\/[^"']+?\.js)/g)].map((m) => m[1]))].sort()
}

function todosLosChunks(dir = path.join(DIST, 'static', 'chunks'), acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, e.name)
    if (e.isDirectory()) todosLosChunks(completo, acc)
    else if (e.name.endsWith('.js')) acc.push(path.relative(DIST, completo).split(path.sep).join('/'))
  }
  return acc
}

const contiene = (relativo: string, aguja: string): boolean => {
  const p = path.join(DIST, relativo)
  return existsSync(p) && readFileSync(p, 'utf8').includes(aguja)
}

/** Los imports de un módulo ESM, derivados del fuente. */
const importsDe = (fuente: string): string[] =>
  [...fuente.matchAll(/^import\s[\s\S]*?from\s+'([^']+)'/gm)].map((m) => m[1])

/** El fuente sin comentarios ni líneas vacías: lo que de verdad se compila. */
const ejecutable = (fuente: string): string =>
  fuente
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => l.trim() !== '' && !/^\s*\/\//.test(l))
    .join('\n')

const kib = (n: number): string => `${(n / 1024).toFixed(3)} KiB`

if (!existsSync(DIST)) {
  console.error(`\nNo existe ${DIST}. Este instrumento mide sobre un build de producción.`)
  process.exit(1)
}

const inicialV3 = conjuntoInicial('/v3')
const chunks = todosLosChunks()

// ═══════════════════════════════════════════════════════════════════════════
titulo('P0 · El conjunto que se mira existe')

console.log(`  build medido: ${path.relative(RAIZ, DIST)} — ANTERIOR al cambio del frente A`)
afirmar(inicialV3.length > 0, `la carga inicial de /v3 son ${inicialV3.length} archivos`)
afirmar(chunks.length > 0, `y el build tiene ${chunks.length} chunks`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1 · `MotionConfigContext` YA estaba en la carga inicial de /v3')

const conElContexto = inicialV3.filter((f) => contiene(f, HUELLA_DEL_CONTEXTO))
const conElContexto2 = inicialV3.filter((f) => contiene(f, HUELLA_DEL_CONTEXTO_2))

afirmar(
  conElContexto.length > 0,
  `el objeto por defecto del contexto (\`${HUELLA_DEL_CONTEXTO}\`) está en ${conElContexto.length} chunk(s) de la carga inicial`,
  conElContexto.join(' · '),
)
afirmarIgual(
  conElContexto2,
  conElContexto,
  '  y la segunda huella del mismo módulo cae en los mismos chunks: no es una coincidencia de una cadena',
)
console.log(
  '  → montar `MotionConfigContext.Provider` NO baja un módulo de librería nuevo: el contexto ya viajaba,',
)
console.log('    porque `_lib/motion/reducido.ts` lo consume por su excepción de política declarada.')

controlPositivo(
  'el buscador no encuentra una huella que no existe en ningún chunk',
  'esta-huella-de-motion-no-existe-en-ningun-chunk-jamas',
  (huella: string) => chunks.some((f) => contiene(f, huella)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P2 · LA CEGUERA, AFIRMADA — el build no puede contestar por `<MotionConfig>`')

/**
 * Se afirma que el detector ESTÁ ciego, no que el módulo no está. Es la
 * diferencia entre publicar un límite y publicar un cero.
 */
const mangladasEnElBuild = HUELLAS_MANGLADAS.map((h) => ({
  huella: h,
  chunks: chunks.filter((f) => contiene(f, h)).length,
}))
for (const m of mangladasEnElBuild) {
  afirmarIgual(
    m.chunks,
    0,
    `\`${m.huella}\` no aparece en NINGUNO de los ${chunks.length} chunks: el minificador la mangló`,
  )
}
console.log('  → «no está en la carga inicial» sería VERDE POR VACÍO para estas tres.')
console.log('    La comparación entre las dos opciones se cierra en el grafo de imports del fuente.')

// ═══════════════════════════════════════════════════════════════════════════
titulo('P3 · El grafo de imports: el proveedor es un SUBCONJUNTO de `<MotionConfig>`')

const importsDelProveedor = importsDe(readFileSync(path.join(RAIZ, NUEVO), 'utf8'))
const importsDeMotionConfig = importsDe(readFileSync(path.join(RAIZ, MOTION_CONFIG), 'utf8'))

const deLibreriaDelProveedor = importsDelProveedor.filter((m) => !m.startsWith('.'))
console.log(`  el proveedor importa de librería : ${deLibreriaDelProveedor.join(' · ')}`)
console.log(`  <MotionConfig> importa           : ${importsDeMotionConfig.join(' · ')}`)

afirmarIgual(
  deLibreriaDelProveedor,
  ['motion/react', 'react'],
  'el proveedor sólo toca `motion/react` (por el contexto) y `react`',
)
afirmar(
  importsDeMotionConfig.some((m) => m.includes('motion-dom')) &&
    importsDeMotionConfig.some((m) => m.includes('filter-props')),
  `  y <MotionConfig> arrastra además \`motion-dom\` y \`filter-props\`: ${importsDeMotionConfig.length} imports contra ${importsDelProveedor.length}`,
)
afirmar(
  importsDeMotionConfig.length > importsDelProveedor.length,
  '  o sea que la opción elegida es estrictamente más chica en el grafo, no sólo en el papel',
)

controlPositivo(
  'el lector de imports no inventa imports en un módulo sin ninguno',
  'export const x = 1\n',
  (fuente: string) => importsDe(fuente).length > 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P4 · La COTA del código propio — declarada como cota, no como el número')

const fuenteNuevo = readFileSync(path.join(RAIZ, NUEVO), 'utf8')
const codigo = ejecutable(fuenteNuevo)
const crudoConComentarios = statSync(path.join(RAIZ, NUEVO)).size
const crudo = Buffer.byteLength(codigo, 'utf8')
const gzip = gzipSync(Buffer.from(codigo, 'utf8')).length

console.log(`  ${NUEVO}`)
console.log(`    fuente entero            ${kib(crudoConComentarios)} (${crudoConComentarios} B) — casi todo docblock`)
console.log(`    código ejecutable        ${kib(crudo)} (${crudo} B) crudo · ${kib(gzip)} (${gzip} B) gzip`)
console.log('  ⚠️ Es una COTA SUPERIOR del fuente, no el peso del chunk: el build minifica y')
console.log('    los comentarios no viajan. La cifra definitiva la da `npm run test:s5-peso`')
console.log('    después del build de la Fase 2, contra el techo de 61,25 KiB.')

afirmar(crudo > 0, 'el archivo nuevo existe y tiene código, no sólo comentarios')
afirmar(
  crudo < crudoConComentarios / 2,
  '  y más de la mitad del archivo es documentación: el docblock no es peso de runtime',
  `${crudo} B de código contra ${crudoConComentarios} B de archivo`,
)

console.log(`\n→ ${guardarJson('a-peso', {
  build: path.relative(RAIZ, DIST),
  esBuildAnteriorAlCambio: true,
  contextoYaEnLaCargaInicial: { chunks: conElContexto, cuantos: conElContexto.length },
  cegueraDelBuild: mangladasEnElBuild,
  imports: { proveedor: importsDelProveedor, motionConfig: importsDeMotionConfig },
  cotaDelFuente: { archivo: NUEVO, crudoConComentarios, crudoEjecutable: crudo, gzipEjecutable: gzip },
  cifraDefinitiva: 'npm run test:s5-peso, después del build de la Fase 2',
})}`)

cerrar('a-peso')
