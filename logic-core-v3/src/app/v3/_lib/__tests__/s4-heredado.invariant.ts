/**
 * INVARIANTE — el peso HEREDADO de `/v3`: se publica con atribución, se vigila
 * con una línea de base, y NO se afirma como si fuera de este sprint.
 *
 * Corre con `npm run build` y después `npm run test:s4-heredado`.
 *
 * ── Por qué es un instrumento aparte, y de S4 ─────────────────────────────
 *
 * `s3-peso.invariant.ts` afirmaba que la carga inicial de `/v3` no se movía más
 * de 1 KiB gzip ni sumaba archivos contra la línea de base de S1. Falló al
 * correr los tres sprints juntos —424,0 contra 422,0 KiB gzip, 25 archivos
 * contra 24— y la falla era legítima: el número había crecido.
 *
 * Pero **ese número no es de S3**. De los 25 archivos, **24 son heredados del
 * layout raíz** —el chrome viejo, compartido con el home, que estos sprints
 * tienen PROHIBIDO tocar— y **1 es propio de `/v3`**, que no se movió. El
 * invariante estaba puesto a fallar por algo que su sprint no produce ni puede
 * arreglar, y un check así no protege: entrena a ignorarlo.
 *
 * ⚠️ **Es la SEGUNDA vez que aparece el mismo error de diseño, y S1 lo había
 * hecho bien**: `bundle.invariant.ts` afirma `lo PROPIO de /v3 < 30 KiB` y deja
 * el total como cifra impresa con su veredicto. `s3-peso` no copió esa forma y
 * afirmó el total.
 *
 * **La regla que queda** —§3.13 de `DIRECCION-ESCENA.md`—: *un invariante
 * afirma lo que su sprint controla; lo que hereda se publica con atribución y
 * se vigila con una línea de base, pero no se afirma.* De ahí la separación:
 * la afirmación del peso propio se quedó en `s3-peso` (§1), que es de S3, y la
 * vigilancia de lo heredado vive acá, que es de nadie en particular — o sea,
 * del sistema.
 *
 * ── Las tres piezas ───────────────────────────────────────────────────────
 *
 *   1. CIFRA PUBLICADA — el total, con el reparto heredado/propio y de quién es.
 *   2. LÍNEA DE BASE — el heredado no crece más de lo esperable. El presupuesto
 *      escala con las rutas de demo que existan en el build, así que no depende
 *      de cuántas haya hoy: borrar una lo baja, agregar una lo sube en 2 KiB.
 *   3. PREDICCIÓN DIFERIDA — unificada con la de S2. Se activa sola el día que
 *      se borren las rutas de demo.
 */

import { afirmar, cerrar, controlPositivo, noCorre, titulo } from './afirmar'
import { conjuntoInicial, exigirBuild, htmlDe, kib, partirCargaInicial, pesar } from './s3-bundle'
import {
  HEREDADO_SIN_DEMOS_ARCHIVOS,
  HEREDADO_SIN_DEMOS_KIB,
  RUTAS_DE_DEMO,
  TECHO_POR_RUTA_KIB,
  TOLERANCIA_PREDICCION_KIB,
  techoHeredadoKiB,
  textoDeLaPrediccion,
} from './s4-rutas-de-demo'

exigirBuild()

const inicialV3 = conjuntoInicial('/v3')
const inicialHome = conjuntoInicial('/')
const { heredados, propios, pesoHeredado, pesoPropio } = partirCargaInicial(inicialV3, inicialHome)
const pesoV3 = pesar(inicialV3)

afirmar(inicialV3.length > 0, `la carga inicial de /v3 son ${inicialV3.length} archivos`)
/** Sin el home, la partición daría "todo propio" y la vigilancia miraría 0 KiB. */
afirmar(inicialHome.length > 0, `  y la del home ${inicialHome.length}, contra la que se parte`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La cifra heredada: se PUBLICA con atribución, no se afirma')

const deltaHeredado = pesoHeredado.crudo / 1024 - HEREDADO_SIN_DEMOS_KIB
console.log(`  /v3 entero   ${kib(pesoV3.crudo)} crudo · ${kib(pesoV3.gzip)} gzip   — ${inicialV3.length} archivos`)
console.log(`     heredado del layout raíz (compartido con el home): ${heredados.length} archivos · ${kib(pesoHeredado.crudo)} crudo`)
console.log(`     propio de /v3                                    : ${propios.length} archivos · ${kib(pesoPropio.crudo)} crudo`)
console.log('  DE QUIÉN ES: el layout RAÍZ importa estáticamente el chrome viejo (Navbar,')
console.log('  Shutter, Preloader, Lenis, sonner, el widget de chat). PublicOnlyComponents')
console.log('  los apaga en /v3 devolviendo null, pero el import estático ya metió los chunks')
console.log('  en la carga inicial de TODA ruta: apagar un componente no lo saca del bundle.')
console.log('  Estos sprints tienen PROHIBIDO tocarlo. Se vuelve alcanzable en el sprint que')
console.log('  REEMPLACE al home.')
console.log(
  `  contra la base de S1 (${HEREDADO_SIN_DEMOS_KIB} KiB · ${HEREDADO_SIN_DEMOS_ARCHIVOS} archivos): ` +
    `${deltaHeredado >= 0 ? '+' : ''}${deltaHeredado.toFixed(1)} KiB y ` +
    `${heredados.length - HEREDADO_SIN_DEMOS_ARCHIVOS} archivo(s), con ${RUTAS_DE_DEMO.length} rutas de demo agregadas desde entonces.`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Línea de base de regresión del heredado')

/**
 * NO es un objetivo: es una guardia para que el chrome viejo no engorde en
 * silencio. Escala con las rutas de demo que EXISTEN EN ESTE BUILD, así que no
 * se rompe cuando se borre una ni hay que tocarla cuando se agregue otra.
 */
const demosEnElBuild = RUTAS_DE_DEMO.filter((r) => htmlDe(r.ruta) !== '')
const techo = techoHeredadoKiB(demosEnElBuild.length)
afirmar(
  pesoHeredado.crudo / 1024 <= techo,
  `el heredado no pasa ${techo.toFixed(1)} KiB = ${HEREDADO_SIN_DEMOS_KIB} de base + ${demosEnElBuild.length} rutas × ${TECHO_POR_RUTA_KIB} KiB`,
  `${kib(pesoHeredado.crudo)} crudo — ${(techo - pesoHeredado.crudo / 1024).toFixed(1)} KiB de aire`,
)
console.log(`  rutas de demo en este build: ${demosEnElBuild.map((r) => r.ruta).join(' · ') || '(ninguna)'}`)

/**
 * ⚠️ **LA LÍNEA DE BASE DE ESTE CHEQUEO SE VENCIÓ EN SITIO-S8, Y CON ELLA SU
 * CONTROL POSITIVO. NO SE AFLOJA NINGUNO DE LOS DOS: SE EXPLICAN.**
 *
 * `HEREDADO_SIN_DEMOS_KIB` son **1381,3 KiB medidos el 2026-08-28**, con CERO
 * rutas de demo. El techo escala desde ahí, y el control positivo era: *con cero
 * rutas, el heredado de HOY no entraría* — o sea, la prueba de que el techo no
 * se cumple solo.
 *
 * SITIO-S8 sacó el barril del preloader del grafo del layout raíz y el heredado
 * cayó a **1111,5 KiB CON las cinco rutas puestas**: 270 KiB por debajo de una
 * base que se midió sin ninguna. El control positivo pasó a ser ciego —el
 * predicado ya no puede fallar contra esa entrada— y eso es información, no
 * ruido: **la base venía cargando un defecto que este sprint borró.**
 *
 * Qué se hace y qué NO:
 *
 *   · **NO se re-basea `HEREDADO_SIN_DEMOS_KIB`.** Sería inventar un número:
 *     esa constante dice «el heredado SIN rutas de demo» y hoy no se puede
 *     medir sin borrarlas. El experimento que lo mide está escrito en
 *     `s4-rutas-de-demo.ts` y sigue siendo una corrida de dos builds.
 *   · **Se declara la base VENCIDA**, con su fecha y su motivo, para que nadie
 *     compare contra ella sin saberlo.
 *   · **El control positivo se reemplaza por uno que SÍ puede fallar**, con la
 *     misma forma que usa `s5-peso`: un techo de 1 KiB, que ningún heredado real
 *     puede cumplir. Prueba lo mismo —que el predicado distingue— sin depender
 *     de una constante que se movió.
 */
console.log('')
console.log('  ⚠️ LA BASE DE ESTE TECHO ESTÁ VENCIDA — se publica, no se afirma:')
console.log(`     ${HEREDADO_SIN_DEMOS_KIB} KiB se midieron el 2026-08-28 con CERO rutas de demo, y hoy el`)
console.log(`     heredado es ${kib(pesoHeredado.crudo)} CON ${demosEnElBuild.length}. SITIO-S8 le sacó al layout raíz el barril del`)
console.log('     preloader, que arrastraba el grupo de chunks de la página del home a toda ruta.')
console.log('     La base no se re-basea acá: medirla pide un build sin las rutas de demo.')

controlPositivo(
  'el techo no se cumple solo: con un techo de 1 KiB, el heredado de hoy NO entra',
  1,
  (t: number) => pesoHeredado.crudo / 1024 <= t,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · PREDICCIÓN DEL MAPA — diferida, y unificada con la de S2')

console.log(textoDeLaPrediccion().replace(/^/gm, '  '))

if (demosEnElBuild.length > 0) {
  noCorre(
    'al borrar las rutas de demo, el heredado vuelve solo a su valor sin demos',
    `todavía existen ${demosEnElBuild.length} de las ${RUTAS_DE_DEMO.length} rutas. ` +
      'Se activa sola el día del borrado: no hay que construir nada.',
  )
} else {
  const desvio = Math.abs(pesoHeredado.crudo / 1024 - HEREDADO_SIN_DEMOS_KIB)
  afirmar(
    desvio <= TOLERANCIA_PREDICCION_KIB,
    `borradas las ${RUTAS_DE_DEMO.length} rutas, el heredado volvió a ${HEREDADO_SIN_DEMOS_KIB} KiB ±${TOLERANCIA_PREDICCION_KIB}`,
    `${kib(pesoHeredado.crudo)} crudo — se desvía ${desvio.toFixed(1)} KiB`,
  )
  afirmar(
    heredados.length <= HEREDADO_SIN_DEMOS_ARCHIVOS,
    '  y la cuenta de archivos heredados también',
    `${heredados.length} contra ${HEREDADO_SIN_DEMOS_ARCHIVOS}`,
  )
}

cerrar('s4-heredado.invariant')
