/**
 * INVARIANTE — SITIO-S8 · `three` NO VIAJA EN LA CARGA INICIAL DE `/v3`.
 *
 *     npm run build   (con las DOS variables — ver §6.1 de DIRECCION-ESCENA.md)
 *     npm run test:s8-tres
 *
 * ── La condición dura del sprint ───────────────────────────────────────────
 *
 * La escena pesa cientos de KiB y `three` **no viajaba** en la carga inicial de
 * `/v3` antes de montarla —medido sobre el build de la línea de base (HEAD de
 * SITIO-S7, commit 09113f42): cero de las tres huellas en los 28 archivos que la
 * ruta pide—. Tiene que seguir sin viajar. Es lo que hace que la compuerta de
 * 1025 sea estructural y no cosmética: abajo del umbral el chunk **no se pide**.
 *
 * ── Por qué se mide sobre el BUILD y no sobre el fuente ────────────────────
 *
 * Porque un chunk que no se descarga no se prueba a ojo, y porque el fuente
 * dice de dónde viene una dependencia pero no prueba dónde terminó. Los dos
 * instrumentos hacen falta y no se reemplazan: el del fuente es
 * `s8-escena.invariant.ts` §3 y §7. Es la misma pareja que `s7-compuerta` y
 * `s7-contrato`.
 *
 * ── Las huellas, y por qué son TRES ────────────────────────────────────────
 *
 * `HUELLAS_DE_TRES` (en `../contrato.ts`) son cadenas que `three` escribe y que
 * **sobreviven a la minificación** —mensajes de error y nombres de chunk de
 * GLSL—, no nombres de export, que el minificador renombra. Son tres y no una
 * por lo mismo que `s2-bundle` busca cinco del sistema de motion: **una marca
 * sola no prueba que la librería no se coló por otro lado**, y una huella que
 * webpack mueva de chunk dejaría el chequeo ciego sin que nada se queje.
 *
 * ── LOS DOS CONTROLES, y hacen falta los dos ───────────────────────────────
 *
 * 1. **Que el buscador no esté ciego**: cada huella tiene que aparecer en ALGÚN
 *    chunk del build. Si `three` desapareciera del build entero, la tesis
 *    pasaría en verde sin significar nada.
 * 2. **La ASIMETRÍA**: el MISMO buscador, sobre el MISMO conjunto de archivos de
 *    la carga inicial de `/v3`, **sí** encuentra `MARCA_HOME_QUIETO` —que es el
 *    árbol quieto de S7 y tiene que estar ahí—. Un buscador roto no encontraría
 *    ninguna de las dos; uno sano encuentra exactamente lo que corresponde.
 *
 * ── ⚠️ CONTRA QUÉ BUILD CORRE ──────────────────────────────────────────────
 *
 * Contra el que haya en `.next/`. Si es el de la línea de base —el de HEAD, sin
 * el código de este sprint— **la §5 falla a propósito**: `MARCA_ESCENA` no
 * existe todavía en ningún chunk, y el instrumento tiene que decirlo en vez de
 * pasar en verde. Es la diferencia entre "verifiqué" y "no había nada que
 * verificar", que es el modo de falla que este proyecto viene cazando.
 */

import { readFileSync } from 'node:fs'

import { MARCA_ESCENA } from '../../marcaEscena'
import { MARCA_HOME_QUIETO } from '../../../_secciones/_contrato/marcaHomeQuieto'
import { HUELLAS_DE_TRES } from '../contrato'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
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
} from '../../__tests__/s3-bundle'

exigirBuild()

const inicialV3 = conjuntoInicial('/v3')
const inicialHome = conjuntoInicial('/')
const inicialProbe = conjuntoInicial('/probe-escena')
const chunks = todosLosChunks()

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los conjuntos que se miran existen y no están vacíos')

afirmar(inicialV3.length > 0, `la carga inicial de /v3 son ${inicialV3.length} archivos`)
afirmar(inicialHome.length > 0, `  la de / son ${inicialHome.length}`)
afirmar(inicialProbe.length > 0, `  la de /probe-escena son ${inicialProbe.length}`)
afirmar(pesar(inicialV3).crudo > 0, 'y pesan más de cero bytes', kib(pesar(inicialV3).crudo))
afirmar(chunks.length > 0, `el build tiene ${chunks.length} chunks para buscar`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Las tres huellas de `three` existen en el build — el buscador no está ciego')

for (const huella of HUELLAS_DE_TRES) {
  const donde = chunks.filter((f) => contiene(f, huella))
  afirmar(
    donde.length > 0,
    `\`${huella}\` aparece en ${donde.length} chunk(s) del build`,
    donde.join(' · '),
  )
}

controlPositivo(
  'y no encuentra una huella que three no escribe en ningún lado',
  'THREE.EstaClaseNoExisteEnNingunaVersionDeThree',
  (huella: string) => chunks.some((f) => readFileSync(`${DIST}/${f}`, 'utf8').includes(huella)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · LA TESIS — ninguna huella de `three` en la carga inicial de /v3')

for (const huella of HUELLAS_DE_TRES) {
  afirmarIgual(
    inicialV3.filter((f) => contiene(f, huella)),
    [],
    `\`${huella}\` no está en ningún archivo de la carga inicial de /v3`,
  )
  afirmarIgual(
    inicialHome.filter((f) => contiene(f, huella)),
    [],
    `  ni en la de / (el home viejo, que este sprint no toca)`,
  )
  afirmarIgual(
    inicialProbe.filter((f) => contiene(f, huella)),
    [],
    `  ni en la de /probe-escena, que también la pide con dynamic(ssr:false)`,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL CONTROL DE ASIMETRÍA — el mismo buscador SÍ encuentra lo que sí está')

const conLaMarcaQuieta = inicialV3.filter((f) => contiene(f, MARCA_HOME_QUIETO))
afirmar(
  conLaMarcaQuieta.length > 0,
  'la MISMA búsqueda, sobre los MISMOS archivos, encuentra la marca del árbol quieto',
  conLaMarcaQuieta.join(' · '),
)
afirmar(
  conLaMarcaQuieta.length > 0 &&
    HUELLAS_DE_TRES.every((h) => inicialV3.filter((f) => contiene(f, h)).length === 0),
  '  o sea que el chequeo distingue: es capaz de encontrar, y no encuentra a three',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · LA MARCA DE LA ESCENA — está en el build y NO en la carga inicial de /v3')

const conLaMarcaDeLaEscena = chunks.filter((f) => contiene(f, MARCA_ESCENA))
afirmar(
  conLaMarcaDeLaEscena.length > 0,
  `\`${MARCA_ESCENA}\` existe en ${conLaMarcaDeLaEscena.length} chunk(s) — si esto falla, el build es anterior a SITIO-S8`,
  conLaMarcaDeLaEscena.join(' · '),
)
afirmarIgual(
  inicialV3.filter((f) => contiene(f, MARCA_ESCENA)),
  [],
  'y ninguno de ellos está en la carga inicial de /v3',
)
afirmar(
  !htmlDe('/v3').includes(MARCA_ESCENA),
  '  ni en el HTML servido de /v3: `ssr: false` no la renderiza en el servidor',
)

const pesoDeLaEscena = pesar(conLaMarcaDeLaEscena)
console.log(
  `  el/los chunk(s) que llevan la marca pesan ${kib(pesoDeLaEscena.crudo)} crudo · ${kib(pesoDeLaEscena.gzip)} gzip`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Lo propio y lo heredado de /v3 — publicado con atribución, no afirmado')

/**
 * ⚠ **Esta sección NO afirma un umbral, y es la regla 13 de §3 aplicada.** De
 * los archivos que `/v3` pide, la enorme mayoría son del layout RAÍZ —el chrome
 * viejo, compartido con el home, que estos sprints tienen prohibido tocar—.
 * Poner un techo sobre el total sería poner en rojo a este sprint por algo que
 * no produce ni puede arreglar, y un check así no protege: entrena a ignorarlo.
 *
 * Lo que sí se afirma es **lo propio**: que la escena no esté ahí.
 */
const particion = partirCargaInicial(inicialV3, inicialHome)
console.log(
  `  /v3 pide ${inicialV3.length} archivos · ${kib(pesar(inicialV3).crudo)} crudo · ${kib(pesar(inicialV3).gzip)} gzip`,
)
console.log(
  `    heredados del layout raíz: ${particion.heredados.length} archivos · ${kib(particion.pesoHeredado.crudo)} crudo · ${kib(particion.pesoHeredado.gzip)} gzip`,
)
console.log(
  `    propios de la ruta:        ${particion.propios.length} archivos · ${kib(particion.pesoPropio.crudo)} crudo · ${kib(particion.pesoPropio.gzip)} gzip`,
)
console.log(
  `  línea de base de S7 sobre el build de HEAD: 28 archivos · 1442,7 KiB crudo · 440,7 KiB gzip`,
)

afirmarIgual(
  particion.propios.filter((f) => HUELLAS_DE_TRES.some((h) => contiene(f, h))),
  [],
  'ninguno de los archivos PROPIOS de /v3 lleva una huella de three',
)

cerrar('s8-tres.invariant')
