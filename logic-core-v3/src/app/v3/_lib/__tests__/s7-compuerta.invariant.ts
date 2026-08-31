/**
 * INVARIANTE — LA COMPUERTA DEL HOME, SOBRE LA SALIDA DEL BUILD.
 *
 * Corre con `npm run build` y después `npm run test:s7-compuerta`.
 *
 * ── Qué se afirma, y por qué se afirma acá y no mirando la página ─────────
 *
 * Que **abajo de 1025 el árbol animado no se descarga**. Un chunk que no se
 * pide no se prueba a ojo: la única forma de saberlo es leer los `<script src>`
 * del HTML prerenderizado y ver qué está y qué no. Es el mismo método de S1 y
 * S2, con otra marca, porque son tres chunks distintos detrás de la misma
 * compuerta y hay que poder pesarlos por separado.
 *
 * ── EL CONTROL POSITIVO, Y POR QUÉ NO ES UNA RUTA GEMELA ─────────────────
 *
 * S1 y S2 controlaron su compuerta con una ruta que hace el import ESTÁTICO del
 * mismo módulo (`/v3/control-estatico`, `/v3/motion/control-estatico`), y ahí la
 * marca TIENE que aparecer. Acá eso no se puede: **este sprint borra dos rutas
 * de demostración**, y el efecto de ese borrado sobre el peso heredado es una de
 * las mediciones que el sprint produce. Agregar una tercera ruta la
 * contaminaría.
 *
 * El control se consigue igual, y sobre el mismo predicado y el mismo conjunto
 * de archivos: el árbol QUIETO lleva su propia marca, y **tiene que estar** en
 * la carga inicial de `/v3`. Un buscador roto no encontraría ninguna de las dos;
 * uno sano encuentra exactamente una. Es la misma asimetría que da la ruta
 * gemela, sin pagar una ruta.
 *
 * ── Y las huellas del sistema, que la marca sola no cubre ────────────────
 *
 * La marca vive en un archivo; el sistema de motion vive en varios. Se buscan
 * las mismas cinco cadenas de cinco módulos distintos que `test:s2-bundle` usa,
 * y ninguna puede estar en la carga inicial de `/v3`.
 */

import { readFileSync } from 'node:fs'

import { MARCA_COREOGRAFIA_DEL_HOME } from '../../_secciones/_contrato/marcaCoreografia'
import { MARCA_HOME_QUIETO } from '../../_secciones/_contrato/marcaHomeQuieto'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import {
  DIST,
  conjuntoInicial,
  contiene,
  exigirBuild,
  htmlDe,
  kib,
  partirCargaInicial,
  pesar,
  todosLosChunks,
} from './s3-bundle'
import { HEREDADO_CON_SIETE_RUTAS_ARCHIVOS, HEREDADO_CON_SIETE_RUTAS_KIB, RUTAS_BORRADAS, RUTAS_DE_DEMO } from './s4-rutas-de-demo'

exigirBuild()

const inicialV3 = conjuntoInicial('/v3')
const chunks = todosLosChunks()
const conLaMarcaAnimada = chunks.filter((f) => contiene(f, MARCA_COREOGRAFIA_DEL_HOME))
const conLaMarcaQuieta = chunks.filter((f) => contiene(f, MARCA_HOME_QUIETO))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El conjunto que se mira existe y no está vacío')

afirmar(inicialV3.length > 0, `la carga inicial de /v3 son ${inicialV3.length} archivos`)
afirmar(pesar(inicialV3).crudo > 0, '  y pesan más de cero bytes')
afirmar(chunks.length > 0, `el build tiene ${chunks.length} chunks para buscar`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Las DOS marcas existen en la salida — el buscador no está ciego')

afirmar(
  conLaMarcaAnimada.length > 0,
  `la marca del ÁRBOL ANIMADO aparece en ${conLaMarcaAnimada.length} chunk(s)`,
  conLaMarcaAnimada.join(' · '),
)
afirmar(
  conLaMarcaQuieta.length > 0,
  `la marca del ÁRBOL QUIETO aparece en ${conLaMarcaQuieta.length} chunk(s)`,
  conLaMarcaQuieta.join(' · '),
)

controlPositivo(
  'el buscador no encuentra una marca que no existe',
  'esta-marca-del-home-no-existe-en-ningun-chunk-jamas',
  (marca: string) => chunks.some((f) => readFileSync(`${DIST}/${f}`, 'utf8').includes(marca)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · LA TESIS — abajo de 1025 el árbol animado NO se descarga')

const suciosAnimado = inicialV3.filter((f) => contiene(f, MARCA_COREOGRAFIA_DEL_HOME))
afirmarIgual(
  suciosAnimado,
  [],
  'ningún archivo de la carga inicial de /v3 lleva la marca del árbol animado',
)
afirmar(
  !htmlDe('/v3').includes(MARCA_COREOGRAFIA_DEL_HOME),
  '  ni el HTML servido: `ssr: false` no lo renderiza en el servidor',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL CONTROL POSITIVO — el árbol QUIETO sí está, en el mismo conjunto')

const limpiosQuieto = inicialV3.filter((f) => contiene(f, MARCA_HOME_QUIETO))
afirmar(
  limpiosQuieto.length > 0,
  'la MISMA búsqueda, sobre los MISMOS archivos, SÍ encuentra la marca del árbol quieto',
  limpiosQuieto.join(' · '),
)
afirmar(
  limpiosQuieto.length > 0 && suciosAnimado.length === 0,
  'o sea que el chequeo distingue las dos: es capaz de encontrar, y no encuentra la animada',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Y el SISTEMA de motion tampoco baja — las cinco huellas')

/**
 * La marca vive en un archivo; el sistema vive en varios. Son las mismas cinco
 * cadenas de cinco módulos distintos que `test:s2-bundle` busca, y por la misma
 * razón: una marca sola no prueba que el sistema no se coló por otro lado.
 */
const HUELLAS_DEL_SISTEMA = [
  'salida-fuerte',
  'atado-al-scroll',
  'simetrica-suave',
  'data-lineas-piezas',
  'bottom-=240px',
]
for (const huella of HUELLAS_DEL_SISTEMA) {
  afirmarIgual(
    inicialV3.filter((f) => contiene(f, huella)),
    [],
    `\`${huella}\` no está en ningún archivo de la carga inicial de /v3`,
  )
  afirmar(
    chunks.some((f) => contiene(f, huella)),
    `  y SÍ está en el build: el buscador de \`${huella}\` no está ciego`,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · EL PESO — /v3 arriba y abajo del umbral')

const abajo = pesar(inicialV3)

/**
 * ⚠ LO QUE CUESTA CRUZAR EL UMBRAL NO ES EL CHUNK MARCADO: SON TODOS.
 *
 * Primera versión de este bloque: pesaba sólo los chunks con la marca, y dio
 * **3,5 KiB**. Es una cifra correcta y una respuesta equivocada — la marca vive
 * en el módulo que enchufa las primitivas, y ese módulo es glue; **el sistema de
 * motion que arrastra vive en otros chunks**, que se descargan con él y que la
 * marca no toca.
 *
 * Es el mismo error de forma que este sprint le corrigió al control de
 * `test:s2-bundle`: confundir "el archivo donde puse la marca" con "lo que pasa
 * al cruzar". Así que lo que se pesa es la UNIÓN de los chunks marcados y los
 * que llevan las huellas del sistema, menos lo que ya está en la carga inicial.
 * Es un piso, no un techo: si la coreografía arrastrara un módulo sin marca ni
 * huella, no se contaría — y eso queda dicho en vez de escondido.
 */
const conElSistema = HUELLAS_DEL_SISTEMA.flatMap((h) => chunks.filter((f) => contiene(f, h)))
const chunksDelArbolAnimado = [...new Set([...conLaMarcaAnimada, ...conElSistema])].filter(
  (f) => !inicialV3.includes(f),
)
const extra = pesar(chunksDelArbolAnimado)
const arriba = { crudo: abajo.crudo + extra.crudo, gzip: abajo.gzip + extra.gzip }

console.log(
  `  ABAJO de 1025   ${kib(abajo.crudo)} crudo · ${kib(abajo.gzip)} gzip   — ${inicialV3.length} archivos`,
)
console.log(
  `  ARRIBA de 1025  ${kib(arriba.crudo)} crudo · ${kib(arriba.gzip)} gzip  — +${chunksDelArbolAnimado.length} chunk(s)`,
)
console.log(
  `  LA COREOGRAFÍA  ${kib(extra.crudo)} crudo · ${kib(extra.gzip)} gzip  (${extra.crudo} B · ${extra.gzip} B)`,
)
for (const f of chunksDelArbolAnimado) console.log(`    · ${f}  ${kib(pesar([f]).crudo)}`)

afirmar(chunksDelArbolAnimado.length > 0, 'hay al menos un chunk de coreografía fuera de la carga inicial')
afirmar(extra.crudo > 0, '  y pesa más de cero bytes: existe de verdad')

/** La cifra que el sprint publica contra la de hoy. */
const GZIP_ANTES_DE_LA_COMPOSICION = 424.0
console.log(
  `  contra los ${GZIP_ANTES_DE_LA_COMPOSICION} KiB gzip que /v3 pesaba antes de componer las ocho: ` +
    `${(abajo.gzip / 1024 - GZIP_ANTES_DE_LA_COMPOSICION >= 0 ? '+' : '')}${(abajo.gzip / 1024 - GZIP_ANTES_DE_LA_COMPOSICION).toFixed(1)} KiB abajo del umbral.`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Lo propio y lo heredado — y el EFECTO de borrar las dos rutas')

const inicialHome = conjuntoInicial('/')
afirmar(inicialHome.length > 0, `la carga inicial del home son ${inicialHome.length} archivos`)

const { heredados, propios, pesoHeredado, pesoPropio } = partirCargaInicial(inicialV3, inicialHome)
console.log(
  `  heredado del layout raíz: ${heredados.length} archivos · ${kib(pesoHeredado.crudo)} crudo`,
)
console.log(`  propio de /v3           : ${propios.length} archivos · ${kib(pesoPropio.crudo)} crudo`)

/**
 * ⚠ LA MEDICIÓN DEL BORRADO — prueba PARCIAL de la predicción del mapa.
 *
 * El padrón pasó de 7 a 5 rutas de demo. Si el diagnóstico de S2/S4 es correcto
 * —cada ruta le cobra peso a las que ya existían, en chunks compartidos con el
 * home— el heredado de `/v3` tiene que BAJAR. No cierra la predicción: quedan
 * cinco rutas. Pero es evidencia gratis, y va en los dos sentidos: si no se
 * mueve, el diagnóstico estaba mal.
 */
const delta = pesoHeredado.crudo / 1024 - HEREDADO_CON_SIETE_RUTAS_KIB
console.log('')
console.log(`  ── EL EFECTO DE BORRAR ${RUTAS_BORRADAS.length} RUTAS DE DEMO ──`)
console.log(`  antes (7 rutas): ${HEREDADO_CON_SIETE_RUTAS_KIB} KiB crudo · ${HEREDADO_CON_SIETE_RUTAS_ARCHIVOS} archivos heredados`)
console.log(
  `  ahora (${RUTAS_DE_DEMO.length} rutas): ${kib(pesoHeredado.crudo)} crudo · ${heredados.length} archivos heredados`,
)
console.log(
  `  delta: ${delta >= 0 ? '+' : ''}${delta.toFixed(1)} KiB · ${heredados.length - HEREDADO_CON_SIETE_RUTAS_ARCHIVOS} archivo(s)`,
)
console.log(
  delta < 0
    ? '  → BAJÓ. La predicción del mapa va en la dirección correcta: borrar rutas devuelve peso heredado.'
    : '  → NO bajó. ⚠️ ES UNA MEDICIÓN SIN CAUSA ATRIBUIBLE, NO UNA REFUTACIÓN.',
)

/**
 * ⚠ EL DELTA ES UNA MEDICIÓN SIN CAUSA ATRIBUIBLE. NO ES UNA REFUTACIÓN.
 *
 * Se puede afirmar el número y no se puede afirmar por qué. Las dos mitades:
 *
 * **Lo que SÍ quedó descartado, porque se midió.** El primer reflejo es *"subió
 * porque `/v3` ahora tiene ocho secciones"*, y no es eso: el heredado es el
 * mismo, hasta el décimo de KiB, para TODAS las rutas de `/v3` —incluidas las
 * tres que este sprint no tocó—. Es una propiedad del conjunto compartido.
 *
 * **Lo que NO se puede descartar.** El mismo commit borró dos rutas **y**
 * compuso el home, y componer cambia el grafo de módulos, que es de donde
 * webpack saca su partición. Dos causas entraron juntas; cuando eso pasa, no se
 * sabe cuál fue. Leer esto como "la predicción del mapa está refutada" sería
 * exactamente el error que §6.1 de `DIRECCION-ESCENA` ya cometió al atribuirle
 * a una variable el mérito de una corrida que llevaba dos.
 *
 * **El experimento limpio está escrito, y es una corrida de dos builds**, no un
 * sprint: `s4-rutas-de-demo.ts`, arriba de `EXPERIMENTO_LIMPIO_PENDIENTE`.
 */
const heredadoPorRuta = ['/v3', ...RUTAS_DE_DEMO.map((r) => r.ruta), '/v3/control-estatico']
  .filter((r) => htmlDe(r) !== '')
  .map((r) => ({
    ruta: r,
    kib: partirCargaInicial(conjuntoInicial(r), inicialHome).pesoHeredado.crudo / 1024,
  }))
console.log('')
console.log('  el heredado es el MISMO para todas las rutas de /v3 — no es de esta ruta:')
for (const f of heredadoPorRuta) console.log(`    ${f.ruta.padEnd(28)} ${f.kib.toFixed(1)} KiB`)
afirmar(
  new Set(heredadoPorRuta.map((f) => f.kib.toFixed(1))).size === 1,
  '  y las cifras coinciden: el delta NO viene de que /v3 haya cambiado de contenido',
  `${heredadoPorRuta.length} rutas medidas`,
)
console.log('  ⚠️ SIN CAUSA ATRIBUIBLE: este commit borró dos rutas Y compuso el home. El delta')
console.log('     está bien medido; a qué se debe, no se sabe. NO es una refutación.')
console.log('     El experimento limpio —dos builds que difieran SÓLO en la existencia de las')
console.log('     rutas— está escrito en `s4-rutas-de-demo.ts`. Es una corrida, no un sprint.')
console.log('     Y ni ése cierra la predicción del mapa: quedan cinco rutas.')

/** Se publica, no se afirma: el heredado es del chrome viejo (regla 13). */
afirmar(
  heredados.length > 0,
  'el heredado se pudo medir: la partición contra el home no está vacía',
)

cerrar('s7-compuerta.invariant')
