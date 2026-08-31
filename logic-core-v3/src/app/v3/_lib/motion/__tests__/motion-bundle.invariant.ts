/**
 * INVARIANTE — la compuerta de 1025, para el chunk de la COREOGRAFÍA.
 *
 * Corre con `npm run build` y después `npm run test:s2-bundle`.
 * Acepta un distDir alternativo: `npx tsx …/motion-bundle.invariant.ts .next-s2-control`.
 *
 * ── Es el mecanismo de S1, con otra marca ──────────────────────────────────
 *
 * Mismo umbral (`ESCENARIO_MIN_ANCHO_PX`), misma consulta (`CONSULTA_ESCENARIO`),
 * mismo hook (`useAnchoMinimo`), misma forma de verificar: sobre la SALIDA DEL
 * BUILD, leyendo los `<script src>` del HTML prerenderizado de cada ruta, con
 * una ruta gemela que importa el mismo módulo de forma estática como control
 * positivo.
 *
 * Lo único propio es la marca, porque son DOS chunks distintos detrás de la
 * MISMA compuerta —el escenario de S1 y la coreografía de S2— y hay que poder
 * pesarlos por separado.
 *
 * ── Las tres afirmaciones ──────────────────────────────────────────────────
 *
 *   B1  La MARCA existe en algún archivo de `static/chunks`.
 *       → el módulo compiló y el buscador NO está ciego.
 *   B2  La MARCA no está en ningún archivo de la carga inicial de `/v3/motion`,
 *       ni en su HTML.
 *       → LA TESIS: abajo del umbral la coreografía no se importa.
 *   B3  La MARCA sí está en la carga inicial de `/v3/motion/control-estatico`.
 *       → EL CONTROL POSITIVO.
 *
 * B2 sin B3 no vale nada: pasaría en verde aunque la coreografía no existiera.
 * B3 sin B1 tampoco: si la marca se podara, las dos rutas saldrían limpias.
 *
 * Las utilidades de CSS que la ruta escribe se comprueban aparte, en
 * `motion-css.invariant.ts`: es otra pregunta sobre la misma salida de build.
 *
 * ── Y una cuarta cosa, que es de este sprint ───────────────────────────────
 *
 * Que la compuerta sea LA MISMA y no otra igual. Se afirma leyendo el fuente del
 * componente: tiene que importar el umbral y el hook de `_lib/`, no declarar los
 * suyos. Un 1025 escrito dos veces son dos compuertas que se van a desincronizar.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CONSULTA_ESCENARIO, ESCENARIO_MIN_ANCHO_PX } from '../../compuerta'
import { MARCA_MOTION } from '../marcaMotion'

// Seis niveles: __tests__ → motion → _lib → v3 → app → src → raíz del proyecto.
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const DIST = path.join(RAIZ, process.argv[2] ?? '.next')

if (!existsSync(DIST)) {
  console.error(`\nNo existe ${DIST}. Corré \`npm run build\` primero.`)
  process.exit(1)
}

/** El HTML que el servidor manda para una ruta prerenderizada. */
function htmlDe(ruta: string): string {
  const nombre = ruta === '/' ? 'index' : ruta.replace(/^\//, '')
  const archivo = path.join(DIST, 'server', 'app', `${nombre}.html`)
  if (!existsSync(archivo)) {
    console.error(`  no existe el HTML prerenderizado de ${ruta}: ${archivo}`)
    return ''
  }
  return readFileSync(archivo, 'utf8')
}

/** Los `.js` que pide la carga inicial de una ruta: los `<script src>` de su HTML. */
function conjuntoInicial(ruta: string): string[] {
  const encontrados = htmlDe(ruta).matchAll(/\/_next\/(static\/[^"']+?\.js)/g)
  return [...new Set([...encontrados].map((m) => m[1]))].sort()
}

const rutaDe = (relativo: string): string => path.join(DIST, relativo)
const tieneLaMarca = (relativo: string): boolean => {
  const p = rutaDe(relativo)
  return existsSync(p) && readFileSync(p, 'utf8').includes(MARCA_MOTION)
}

function todosLosChunks(
  dir = path.join(DIST, 'static', 'chunks'),
  acumulado: string[] = [],
): string[] {
  if (!existsSync(dir)) return acumulado
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name)
    if (entrada.isDirectory()) todosLosChunks(completo, acumulado)
    else if (entrada.name.endsWith('.js'))
      acumulado.push(path.relative(DIST, completo).replace(/\\/g, '/'))
  }
  return acumulado
}

const pesar = (archivos: readonly string[]): { crudo: number; gzip: number } => {
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
titulo('B0 · La compuerta es LA MISMA de S1, no una copia')

/**
 * Los comentarios se sacan antes de mirar: el archivo EXPLICA la compuerta de
 * 1025 y eso es correcto. Lo que no puede es declararla. La primera versión de
 * este chequeo miraba el archivo entero y falló contra su propio título.
 */
const sinComentarios = (fuente: string): string =>
  fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((linea) => !/^\s*\/\//.test(linea))
    .join('\n')

const fuenteDeLaCompuerta = sinComentarios(
  readFileSync(path.join(RAIZ, 'src/app/v3/motion/_componentes/CompuertaDeMotion.tsx'), 'utf8'),
)
afirmar(
  /from '\.\.\/\.\.\/_lib\/compuerta'/.test(fuenteDeLaCompuerta),
  'el componente importa el umbral de `_lib/compuerta`',
)
afirmar(
  /from '\.\.\/\.\.\/_lib\/useAnchoMinimo'/.test(fuenteDeLaCompuerta),
  '  y el hook de `_lib/useAnchoMinimo`',
)
afirmar(
  !/1025/.test(fuenteDeLaCompuerta),
  '  y NO escribe el 1025 por su cuenta: un número repetido son dos compuertas',
)
afirmarIgual(ESCENARIO_MIN_ANCHO_PX, 1025, 'el umbral compartido son 1025 px')
afirmarIgual(CONSULTA_ESCENARIO, '(min-width: 1025px)', 'y la consulta es la de S1')

controlPositivo(
  'el chequeo del import ve un componente que declara su propio umbral',
  "const MIO = 1025\nexport function X() { return null }",
  (fuente: string) => !/1025/.test(fuente),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1 · La MARCA existe en la salida — el buscador no está ciego')

const conLaMarca = todosLosChunks().filter(tieneLaMarca)
afirmar(
  conLaMarca.length > 0,
  `la marca aparece en ${conLaMarca.length} chunk(s)`,
  conLaMarca.join(' · '),
)

controlPositivo(
  'el buscador no encuentra una marca que no existe',
  'esta-marca-de-motion-no-existe-en-ningun-chunk-jamas',
  (marca: string) => todosLosChunks().some((f) => readFileSync(rutaDe(f), 'utf8').includes(marca)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B2 · LA TESIS — la marca NO está en la carga inicial de /v3/motion')

const inicialMotion = conjuntoInicial('/v3/motion')
const inicialHome = conjuntoInicial('/')
afirmar(inicialMotion.length > 0, `la carga inicial de /v3/motion son ${inicialMotion.length} archivos`)
afirmar(pesar(inicialMotion).crudo > 0, '  y pesan más de cero bytes — el conjunto no está vacío')

const sucios = inicialMotion.filter(tieneLaMarca)
afirmarIgual(sucios, [], 'ningún archivo de la carga inicial de /v3/motion contiene la marca')
afirmar(
  !htmlDe('/v3/motion').includes(MARCA_MOTION),
  'y el HTML servido de /v3/motion tampoco: `ssr: false` no lo renderiza',
)
afirmar(
  htmlDe('/v3/motion').includes('La coreografía no se descarga acá'),
  'lo que sí sirve es el texto de abajo del umbral: la ruta no queda en blanco',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B3 · EL CONTROL POSITIVO — en /v3/motion/control-estatico SÍ está')

const inicialControl = conjuntoInicial('/v3/motion/control-estatico')
afirmar(inicialControl.length > 0, `la carga inicial del control son ${inicialControl.length} archivos`)

const suciosControl = inicialControl.filter(tieneLaMarca)
afirmar(
  suciosControl.length > 0,
  'la MISMA comprobación SÍ encuentra la marca en la ruta con import estático',
  suciosControl.join(' · '),
)
afirmar(
  htmlDe('/v3/motion/control-estatico').includes(MARCA_MOTION),
  '  y ahí la coreografía además se renderiza en el servidor: la marca está en el HTML',
)
afirmar(
  suciosControl.length > 0 && sucios.length === 0,
  'el chequeo distingue las dos rutas: es capaz de fallar, y en /v3/motion no falla',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('PESO — el chunk de la coreografía, arriba y abajo de 1025')

const abajo = pesar(inicialMotion)
/** Lo que la coreografía suma al cruzar el umbral: los chunks con la marca que
 *  /v3/motion NO pide en su carga inicial. */
const chunksDeMotion = conLaMarca.filter((f) => !inicialMotion.includes(f))
const extra = pesar(chunksDeMotion)
const arriba = { crudo: abajo.crudo + extra.crudo, gzip: abajo.gzip + extra.gzip }

console.log(
  `  ABAJO de 1025   ${kib(abajo.crudo)} crudo · ${kib(abajo.gzip)} gzip   — ${inicialMotion.length} archivos`,
)
console.log(
  `  ARRIBA de 1025  ${kib(arriba.crudo)} crudo · ${kib(arriba.gzip)} gzip  — +${chunksDeMotion.length} chunk(s) de coreografía`,
)
console.log(
  `  CHUNK DE MOTION ${kib(extra.crudo)} crudo · ${kib(extra.gzip)} gzip  (${extra.crudo} B · ${extra.gzip} B)`,
)
console.log(`  archivos: ${chunksDeMotion.join(' · ') || '(ninguno)'}`)

afirmar(chunksDeMotion.length > 0, 'hay al menos un chunk de coreografía fuera de la carga inicial')
afirmar(extra.crudo > 0, '  y pesa más de cero bytes: existe de verdad')

/**
 * La coreografía es CÓDIGO propio: `motion/react` no viaja acá. La librería ya
 * está en la carga inicial de toda ruta porque el layout RAÍZ importa el chrome
 * viejo, que la usa. Eso es exactamente lo que S1 dejó anotado como pendiente y
 * no es de este sprint. Lo que este sprint controla es su propio peso.
 */
const PRESUPUESTO_COREOGRAFIA_KIB = 60
afirmar(
  extra.crudo / 1024 < PRESUPUESTO_COREOGRAFIA_KIB,
  `el chunk de coreografía pesa menos de ${PRESUPUESTO_COREOGRAFIA_KIB} KiB crudo`,
  `${kib(extra.crudo)} crudo · ${kib(extra.gzip)} gzip`,
)

// Lo heredado del layout raíz, para que el número de arriba se lea en contexto.
const heredados = inicialMotion.filter((f) => inicialHome.includes(f))
const propios = inicialMotion.filter((f) => !inicialHome.includes(f))
console.log(
  `     heredado del layout raíz: ${heredados.length} archivos · ${kib(pesar(heredados).crudo)} crudo`,
)
console.log(
  `     propio de /v3/motion    : ${propios.length} archivos · ${kib(pesar(propios).crudo)} crudo`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B4 · LOS DOS NÚMEROS — /v3 y /v3/motion, por separado')

/**
 * ⚠ ESTA SECCIÓN EXISTE POR UNA PREGUNTA CONCRETA, Y ES LA QUE SOSTIENE LA
 * ARQUITECTURA DE LA COMPUERTA.
 *
 * "El peso abajo de 1025 subió" admite dos lecturas incompatibles:
 *
 *   (a) subió el de `/v3/motion`, porque es una ruta MÁS y trae su propio chunk
 *       de página. Eso no es una regresión: es lo que cuesta existir.
 *   (b) subió el de `/v3`, la ruta que S1 dejó medida. Eso SÍ sería una
 *       regresión, y de la peor clase: significaría que agregar una ruta
 *       detrás de la compuerta le cobra peso a una ruta que no la usa.
 *
 * Las dos se distinguen midiendo LAS DOS y comparando los CONJUNTOS, no los
 * totales. Un total que sube no dice de dónde salió; la diferencia de conjuntos
 * sí, archivo por archivo.
 */
const inicialV3 = conjuntoInicial('/v3')
const pesoV3 = pesar(inicialV3)
const pesoMotion = pesar(inicialMotion)

console.log(
  `  /v3         ${inicialV3.length} archivos · ${kib(pesoV3.crudo)} crudo · ${kib(pesoV3.gzip)} gzip`,
)
console.log(
  `  /v3/motion  ${inicialMotion.length} archivos · ${kib(pesoMotion.crudo)} crudo · ${kib(pesoMotion.gzip)} gzip`,
)

const soloEnMotion = inicialMotion.filter((f) => !inicialV3.includes(f))
const soloEnV3 = inicialV3.filter((f) => !inicialMotion.includes(f))
for (const f of soloEnMotion) console.log(`  + solo en /v3/motion: ${f} (${kib(statSync(rutaDe(f)).size)})`)
for (const f of soloEnV3) console.log(`  + solo en /v3       : ${f} (${kib(statSync(rutaDe(f)).size)})`)

/**
 * ⚠ ESTA COMPROBACIÓN CAMBIÓ DE FORMA EN SITIO-S7, y por la misma razón que la
 * de las huellas: **afirmaba una propiedad del reparto y no del sistema.**
 *
 * Decía `soloEnV3 === []`, o sea *"la carga inicial de `/v3` está ENTERA dentro
 * de la de `/v3/motion`"*, y era una forma de decir "no hay dos bundles
 * distintos". Funcionaba porque `/v3` era un esqueleto: no tenía nada propio que
 * `/v3/motion` no tuviera. **Con el home compuesto, `/v3` tiene sus chunks y la
 * inclusión deja de valer sin que nada se haya roto.**
 *
 * Lo que la comprobación quería decir sobrevive intacto y se afirma directo:
 * **las dos rutas comparten EXACTAMENTE el mismo conjunto heredado**. Ésa es la
 * propiedad —"no hay dos bundles distintos"— y no depende de que una ruta sea
 * un subconjunto de la otra, que es un accidente de cuánto contenido tenga cada
 * una.
 */
const heredadoDe = (inicial: readonly string[]): string[] =>
  inicial.filter((f) => inicialHome.includes(f)).sort()

afirmarIgual(
  heredadoDe(inicialV3),
  heredadoDe(inicialMotion),
  'las dos rutas comparten EXACTAMENTE el mismo conjunto heredado: no hay dos bundles distintos',
)
afirmar(
  heredadoDe(inicialV3).length > 0,
  `  y ese conjunto son ${heredadoDe(inicialV3).length} archivos: la comparación no es sobre el vacío`,
)
afirmar(
  soloEnMotion.every((f) => f.includes('app/v3/motion/')),
  'y lo único que /v3/motion agrega sobre /v3 son sus propios chunks de página',
  soloEnMotion.join(' · ') || '(ninguno)',
)

/**
 * Y la otra mitad de la pregunta: que lo que agrega no sea CÓDIGO DEL SISTEMA
 * de motion escondido en un chunk compartido. La marca sola no alcanza —vive en
 * un archivo— así que se buscan cadenas de CINCO módulos distintos del sistema.
 */
const HUELLAS_DEL_SISTEMA = [
  'salida-fuerte',
  'atado-al-scroll',
  'simetrica-suave',
  'data-lineas-piezas',
  'bottom-=240px',
]
for (const huella of HUELLAS_DEL_SISTEMA) {
  const sucios = inicialV3.filter((f) => readFileSync(rutaDe(f), 'utf8').includes(huella))
  afirmarIgual(sucios, [], `\`${huella}\` no está en ningún archivo de la carga inicial de /v3`)
}

/**
 * ⚠ EL CONTROL DE ESTE BLOQUE — REESCRITO EN SITIO-S7, Y POR QUÉ EL ANTERIOR
 * ERA FRÁGIL POR DISEÑO.
 *
 * Decía esto:
 *
 *     controlPositivo('…las encuentra donde tienen que estar (el chunk perezoso)',
 *       conLaMarca, (chunks) => !HUELLAS.every((h) => chunks.some(tiene(h))))
 *
 * o sea: las cinco huellas tienen que estar **en los chunks que llevan
 * `MARCA_MOTION`**. Eso no es una propiedad del sistema de motion: es una
 * propiedad del REPARTO DE CHUNKS que webpack eligió ese día. Y el reparto
 * cambia con la cantidad de consumidores — **este control cambió de resultado
 * tres veces en tres builds distintos**, según cuántas rutas había:
 *
 *   · con un solo consumidor (la ruta de demostración), las huellas caían en el
 *     mismo chunk perezoso que la marca y el control pasaba;
 *   · al aparecer un SEGUNDO consumidor estático —las secciones—, webpack
 *     factorizó el sistema a un chunk compartido y cuatro de las cinco huellas
 *     se mudaron. El control se puso en rojo **sin que se rompiera nada**;
 *   · y con la composición del home volvería a moverse.
 *
 * **Un control positivo tiene que afirmar una propiedad que sobreviva a que el
 * empaquetador reagrupe los módulos.** "Está en ESTE archivo" no sobrevive;
 * "está en el build" sí, porque la unión de los chunks es la misma sea cual sea
 * la partición. Ésa es la regla que queda, y es general: **una afirmación sobre
 * la salida del build no puede depender de en qué archivo cayó cada módulo,
 * salvo que el archivo sea justamente lo que se afirma** —como en B2 y B3, que
 * hablan del CONJUNTO de la carga inicial de una ruta, no de un chunk.
 *
 * Así que se afirma lo que el control quería decir y decía mal: que el buscador
 * encuentra las cinco huellas en la salida del build. Sigue probando que no
 * está ciego —que es su único trabajo— y deja de afirmar un reparto que ya no
 * es cierto.
 */
const chunksDelBuild = todosLosChunks()
const contiene = (huella: string): string[] =>
  chunksDelBuild.filter((f) => readFileSync(rutaDe(f), 'utf8').includes(huella))

for (const huella of HUELLAS_DEL_SISTEMA) {
  const donde = contiene(huella)
  afirmar(
    donde.length > 0,
    `el buscador SÍ encuentra \`${huella}\` en la salida del build — no está ciego`,
    `${donde.length} chunk(s): ${donde.join(' · ')}`,
  )
}

controlPositivo(
  'y no encuentra una huella que no existe en ningún chunk',
  'esta-huella-del-sistema-de-motion-no-existe-en-ningun-chunk-jamas',
  (huella: string) => contiene(huella).length > 0,
)

/**
 * La cifra que el control viejo escondía, ahora publicada: en cuántos chunks
 * distintos vive el sistema. No se afirma —es del empaquetador— pero se ve, que
 * es lo que hace que un cambio de reparto se note sin poner nada en rojo.
 */
console.log(
  `  reparto del sistema en este build: ${HUELLAS_DEL_SISTEMA.map((h) => `${h}→${contiene(h).length}`).join(' · ')}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('REGRESIÓN — /v3 no se contaminó con el chunk de motion')

afirmarIgual(
  inicialV3.filter(tieneLaMarca),
  [],
  'la marca de motion no aparece en la carga inicial de /v3',
)
afirmar(
  !htmlDe('/v3').includes(MARCA_MOTION),
  '  ni en su HTML: la ruta hermana no arrastra la coreografía',
)

cerrar('motion-bundle.invariant')
