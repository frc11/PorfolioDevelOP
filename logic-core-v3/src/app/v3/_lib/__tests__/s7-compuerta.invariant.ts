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
 * S1 y S2 controlaron su compuerta con una ruta que importa el mismo módulo de
 * forma ESTÁTICA. Acá no se podía: S7 borraba dos rutas de demostración y medía
 * el efecto de ese borrado, así que agregar una tercera lo contaminaba. El
 * control se consigue sobre el mismo predicado y el mismo conjunto de archivos:
 * el árbol QUIETO lleva su marca y **tiene que estar** en la carga inicial de
 * `/v3`. Un buscador roto no encontraría ninguna de las dos; uno sano encuentra
 * exactamente una. Misma asimetría, sin pagar una ruta.
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
 * ⚠ LO QUE CUESTA CRUZAR EL UMBRAL NO ES EL CHUNK MARCADO: SON TODOS. Pesar
 * sólo los marcados daba **3,5 KiB**: cifra correcta, respuesta equivocada — la
 * marca vive en el módulo que enchufa las primitivas, que es glue, y el sistema
 * que arrastra vive en otros chunks. Es el mismo error que este sprint le
 * corrigió al control de `test:s2-bundle`. Se pesa la UNIÓN de los marcados y
 * los que llevan huellas del sistema, menos la carga inicial. Es un piso, no un
 * techo: un módulo sin marca ni huella no se contaría, y queda dicho.
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
 * ⚠️⚠️ **ESTE BLOQUE ESTUVO A PUNTO DE PUBLICAR UNA ATRIBUCIÓN FALSA.**
 *
 * S7 lo escribió así: el padrón pasó de 7 a 5 rutas de demo, así que si el
 * heredado BAJA, la predicción del mapa va bien. Era razonable **mientras borrar
 * rutas fuera lo único que podía mover ese número**, y dejó de serlo: SITIO-S8
 * le cambió UN especificador al layout raíz —`HomeIntroBoot` pasaba por el
 * barril del preloader, que vive en el grupo de chunks de la PÁGINA DEL HOME y
 * lo arrastraba entero a toda ruta— y el heredado se desplomó **sin borrar una
 * sola ruta**. El texto viejo habría escrito *«BAJÓ: borrar rutas devuelve peso
 * heredado»*, dándole a la predicción un respaldo que no le corresponde.
 *
 * Es la trampa de §6.1 —*dos cambios juntos y el mérito a uno*— salvo que acá
 * **sí se sabe cuál fue**: `test:s8-peso` lo aisló ruta por ruta.
 *
 * La regla que queda: *un instrumento que compara contra una línea de base tiene
 * que decir qué cambió ENTRE las dos mediciones, no sólo cuánto.* Una
 * comparación sin inventario de cambios es una coincidencia con formato.
 */
const delta = pesoHeredado.crudo / 1024 - HEREDADO_CON_SIETE_RUTAS_KIB
console.log('')
console.log(`  ── EL HEREDADO CONTRA LA LÍNEA DE BASE DE S7 ──`)
console.log(`  S7 (7 rutas de demo): ${HEREDADO_CON_SIETE_RUTAS_KIB} KiB crudo · ${HEREDADO_CON_SIETE_RUTAS_ARCHIVOS} archivos heredados`)
console.log(
  `  hoy (${RUTAS_DE_DEMO.length} rutas): ${kib(pesoHeredado.crudo)} crudo · ${heredados.length} archivos heredados`,
)
console.log(
  `  delta: ${delta >= 0 ? '+' : ''}${delta.toFixed(1)} KiB · ${heredados.length - HEREDADO_CON_SIETE_RUTAS_ARCHIVOS} archivo(s)`,
)
console.log(`  ⚠️ ENTRE LAS DOS MEDICIONES PASARON DOS COSAS, y sólo una explica el delta:`)
console.log(`     · SITIO-S7 borró ${RUTAS_BORRADAS.length} rutas de demo — efecto medido entonces: +0,8 KiB.`)
console.log('     · SITIO-S8 sacó el barril del preloader del grafo del layout raíz — es ESTE delta.')
console.log('     La atribución la produce `test:s8-peso`, ruta por ruta, sobre el payload de flight.')
console.log(
  delta < 0
    ? '  → El heredado BAJÓ, y NO por el borrado de rutas: la predicción del mapa sigue sin evidencia a favor.'
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
console.log('  el heredado, ruta por ruta:')
for (const f of heredadoPorRuta) console.log(`    ${f.ruta.padEnd(28)} ${f.kib.toFixed(1)} KiB`)

/**
 * ⚠ **DECÍA «SON TODAS IGUALES» Y SITIO-S8 LA ROMPIÓ A PROPÓSITO.** S7 la
 * escribió para descartar el reflejo de *«el heredado subió porque `/v3` tiene
 * ocho secciones»*: si fuera de ESTA ruta, las otras seis darían otro número.
 * Daban el mismo, así que era del conjunto compartido.
 *
 * SITIO-S8 montó el preloader **en `/v3` y en ninguna otra ruta de `/v3`**, y su
 * overlay tiene que viajar en el HTML del servidor (el gate es pre-paint). Como
 * `/` monta el mismo componente, ese chunk es COMPARTIDO y cuenta como
 * heredado. Hoy hay DOS números, y la diferencia es **una pieza que `/v3` monta
 * de más**, no contenido de la ruta. Se afirma eso —más fuerte que la igualdad,
 * y no se vence cuando `/v3` monte otra cosa— con la diferencia nombrada.
 */
const deLasOtras = heredadoPorRuta.filter((f) => f.ruta !== '/v3')
const deV3 = heredadoPorRuta.find((f) => f.ruta === '/v3')
afirmar(
  new Set(deLasOtras.map((f) => f.kib.toFixed(1))).size === 1,
  '  las OTRAS rutas de /v3 coinciden entre sí: el heredado no es del contenido de cada ruta',
  `${deLasOtras.length} rutas · ${deLasOtras[0]?.kib.toFixed(1)} KiB`,
)
const extraDeV3 = conjuntoInicial('/v3').filter(
  (f) => inicialHome.includes(f) && !conjuntoInicial('/v3/componentes').includes(f),
)
console.log(`  /v3 hereda ${extraDeV3.length} archivo(s) más, y la causa está nombrada: monta el preloader`)
console.log('  (SITIO-S8), que `/` también monta — por eso el chunk es compartido y cuenta como heredado:')
for (const f of extraDeV3) console.log(`    ${f}  ${kib(pesar([f]).crudo)} crudo · ${kib(pesar([f]).gzip)} gzip`)
afirmar(
  deV3 !== undefined && extraDeV3.length > 0 && deV3.kib > (deLasOtras[0]?.kib ?? 0),
  '  y la diferencia está pesada: no es una cifra sin causa',
  `+${((deV3?.kib ?? 0) - (deLasOtras[0]?.kib ?? 0)).toFixed(1)} KiB en ${extraDeV3.length} archivo(s)`,
)

/** Se publica, no se afirma: el heredado es del chrome viejo (regla 13). */
afirmar(
  heredados.length > 0,
  'el heredado se pudo medir: la partición contra el home no está vacía',
)

cerrar('s7-compuerta.invariant')
