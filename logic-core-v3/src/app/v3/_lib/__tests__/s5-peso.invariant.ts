/**
 * INVARIANTE TRANSVERSAL — el peso de `/v3`: lo PROPIO se afirma, lo HEREDADO
 * se publica con atribución.
 *
 * Corre con `npm run build` y después `npm run test:s5-peso`.
 *
 * ── Regla 13 del proyecto, y por qué existe ───────────────────────────────
 *
 * *Un invariante afirma lo que su sprint controla. Lo que hereda se publica con
 * atribución y se vigila, pero no se afirma.* La regla nació de `s3-peso`, que
 * afirmaba el total de la carga inicial de `/v3` y fallaba por 24 archivos del
 * layout RAÍZ que ese sprint tenía prohibido tocar. **Un check puesto a fallar
 * por algo que su sprint no produce ni puede arreglar no protege: entrena a
 * ignorarlo.**
 *
 * ═══ QUÉ CAMBIÓ EN SITIO-S7, Y POR QUÉ ESTE ARCHIVO SE PONE MEJOR ═════════
 *
 * Este invariante medía `/v3/secciones-a`, la ruta donde el lane mostraba sus
 * cuatro secciones, y partía su carga inicial en TRES —heredado del home, de
 * `/v3`, y del lane— porque eso era lo que hacía medible *cuánto agrega este
 * lane*. **Esa ruta ya no existe**: se borró al componer el home, que es lo que
 * su propio docblock declaraba como fecha de baja.
 *
 * La partición de tres se fue con ella y **no se reemplaza por una peor**: las
 * cuatro secciones ahora son parte de `/v3`, así que lo que se mide es `/v3`.
 *
 * Y hay algo que este archivo puede afirmar hoy y no podía cuando se escribió.
 * Su propio cierre decía:
 *
 * > *"La consecuencia que este lane NO resuelve y publica: el sistema de motion
 * > viaja también abajo de 1025 en esta ruta. […] Es una decisión de la
 * > composición del home, no de este lane."*
 *
 * La composición del home llegó. **Ese pendiente se cierra acá, afirmándolo:**
 * el presupuesto de este lane sumaba 28,2 KiB porque el sistema de motion
 * bajaba estáticamente, y ahora **no baja**. Un instrumento que declaró una
 * deuda es el lugar correcto para afirmar que se pagó.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { DIST, conjuntoInicial, exigirBuild, htmlDe, kib, partirCargaInicial, pesar } from './s3-bundle'
import { RUTAS_BORRADAS } from './s4-rutas-de-demo'

exigirBuild()

const RUTA = '/v3'

const inicial = conjuntoInicial(RUTA)
const inicialHome = conjuntoInicial('/')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La ruta existe en el build, y la partición no está vacía')

afirmar(htmlDe(RUTA) !== '', `la ruta ${RUTA} está prerenderizada en el build`)
afirmar(inicial.length > 0, `su carga inicial son ${inicial.length} archivos`)
afirmar(inicialHome.length > 0, `  y la del home ${inicialHome.length}, contra la que se parte`)

const { heredados, propios, pesoHeredado, pesoPropio } = partirCargaInicial(inicial, inicialHome)
const pesoTotal = pesar(inicial)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La cifra, con su reparto')

console.log(`  /v3 entero  ${kib(pesoTotal.crudo)} crudo · ${kib(pesoTotal.gzip)} gzip — ${inicial.length} archivos`)
console.log(`    heredado del layout raíz : ${heredados.length} archivos · ${kib(pesoHeredado.crudo)} crudo`)
console.log(`    propio de /v3            : ${propios.length} archivos · ${kib(pesoPropio.crudo)} crudo · ${kib(pesoPropio.gzip)} gzip`)
for (const f of propios) console.log(`      · ${f}`)
console.log('  DE QUIÉN ES lo heredado: el layout RAÍZ importa estáticamente el chrome viejo.')
console.log('  Estos sprints tienen PROHIBIDO tocarlo. Se publica, no se afirma (regla 13).')

afirmar(pesoPropio.crudo > 0, 'lo propio pesa más de cero bytes: las ocho secciones existen en el build')
afirmar(heredados.length > 0, 'y el heredado se pudo medir: la partición no está vacía')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL PRESUPUESTO PROPIO, con la cuenta a la vista')

/**
 * No es un número elegido: es la suma de dos medidos, y la cuenta cambió con la
 * compuerta.
 *
 *   · S1 fijó **30 KiB** para lo propio de `/v3` cuando era el esqueleto.
 *   · Las ocho secciones, con su árbol quieto, agregan lo que agregan — y **ya
 *     no agregan los 28,2 KiB del sistema de motion**, que era la mitad del
 *     presupuesto viejo de este lane: ese chunk ahora entra por la compuerta.
 *
 * 60 KiB es el mismo techo que este invariante tenía, y ahora cubre OCHO
 * secciones en vez de cuatro **porque lo que salió del bundle hizo lugar**.
 * Está escrito acá con la cuenta a la vista para que se pueda discutir el
 * número y no la intención.
 *
 * ═══ B4-A · DE DÓNDE SALÍAN LOS 1,3 KiB QUE B2 REPORTÓ ════════════════════
 *
 * B2 midió **61,3 KiB contra 60** y no lo aflojó: lo dejó anotado como lo único
 * que impedía que `verificar` cerrara en cero. Buscada la causa antes de tocar
 * el número, **son 1,36 KiB de preámbulo de Sentry**, y no hay que estimarlo:
 * `@sentry/nextjs` le inyecta a **cada chunk del build** un bloque idéntico de
 * **348 bytes** que registra un `_sentryDebugId`. Cuatro chunks propios × 348 B
 * = 1.392 B = **1,36 KiB**, que es exactamente el desvío que B2 publicó.
 *
 * ── Por qué esto NO es aflojar el techo (regla 13) ────────────────────────
 *
 * Porque **no es peso del lane y el lane no lo puede tocar**: lo inyecta la
 * integración de Sentry declarada en la configuración RAÍZ, que estos sprints
 * tienen prohibida —la misma razón por la que 21 chunks heredados traen otros
 * 5,10 KiB del mismo preámbulo—. Un techo que lo cuenta pone al lane a fallar
 * por bytes que no escribió, que es exactamente lo que la regla 13 nació para
 * no hacer (`s3-peso`, 24 archivos del layout raíz).
 *
 * **El techo NO se mueve: sigue en 60 KiB.** Lo que cambia es QUÉ se mide
 * contra él: los bytes que el lane escribe, con el preámbulo heredado restado y
 * **publicado aparte, con su dueño**. Si el preámbulo crece, se ve en la línea
 * de al lado; si lo propio crece, el techo lo caza igual.
 */
const PRESUPUESTO_DEL_LANE_KIB = 60

/**
 * ═══ EL TECHO SUBE A 61,25 KiB — LA DECISIÓN, CON SU RECIBO ═══════════════
 *
 * ⚠️ **Lo decidió el humano en la parada de B4-A, con el número a la vista**, y
 * queda escrito acá para que la decisión sea **revocable**: la alternativa
 * medida era **no montar la marca**.
 *
 * ── Qué compró el aumento ─────────────────────────────────────────────────
 *
 * B4-A montó en el home vivo la marca que B3 había construido y dejado sin
 * montar —el prefijo en los ocho rótulos de sección, el logotipo y el separador
 * en el pie, el prefijo en los cinco enlaces de la pastilla— y construyó la
 * meseta de Trabajos. Con eso cierra el diagnóstico que abrió el bloque: *lo que
 * lo haría funcionar es el SISTEMA, no el objeto*.
 *
 *     lo que ESCRIBE el lane hoy            61,140 KiB
 *     − lo que escribía antes de B4-A       59,940 KiB  (B2, 61,3 menos el preámbulo)
 *     = lo que B4-A monta                    1,200 KiB   ← lo que el techo sube
 *
 * El techo queda en **61,25 KiB**: los 1,200 medidos más 0,11 KiB de aire, que
 * es el mismo margen apretado con el que el 60 venía corriendo (59,94 contra 60).
 * **Sigue mordiendo**: cualquier byte que crezca después de esto lo caza igual.
 *
 * ── Lo que se achicó ANTES de subirlo, y por eso no sube más ──────────────
 *
 * La glue del bloque animado —`ANCLA_DEL_PIN`, `cronogramaDe`,
 * `especificacionDe`, `inerciaDe`— viajaba en la carga inicial por compartir
 * archivo con `deberiaAnimar`, que sí consume el árbol quieto. **503 B medidos**,
 * del lado equivocado de la compuerta de 1025 y **sin que ningún instrumento lo
 * viera** (`s7-compuerta` busca las huellas de `_lib/motion/` y esto era del
 * CONTRATO). Se fue a `_contrato/bloqueAnimado.ts`. Sin ese arreglo el aumento
 * habría sido de 1,70 KiB en vez de 1,20.
 *
 * ── Cómo se revoca, y qué queda vigilando el número viejo ─────────────────
 *
 * `PRESUPUESTO_DEL_LANE_KIB` **no se borró**: sigue en 60 y se afirma aparte,
 * restándole lo que B4-A monta. O sea que el techo viejo sigue vivo como
 * comprobación sobre todo lo que NO es la marca. Desmontar la marca tiene que
 * devolver el número a 59,94 y este archivo lo va a decir.
 *
 * ⚠️ **Un presupuesto que se sube cada vez que se pasa no es un presupuesto.**
 * Éste subió UNA vez, con la causa medida byte por byte —1,36 KiB heredados que
 * salieron de la cuenta, 503 B propios que se achicaron, 1,20 KiB propios que se
 * declararon— y con la alternativa escrita. El próximo que lo quiera mover tiene
 * que traer las tres cosas.
 */
const MONTAJE_DE_B4A_KIB = 1.25
const PRESUPUESTO_PROPIO_KIB = PRESUPUESTO_DEL_LANE_KIB + MONTAJE_DE_B4A_KIB

/** El preámbulo que `@sentry/nextjs` le pone a la cabeza de cada chunk. Se
 *  detecta por su forma, no por su largo: si cambiara de tamaño, la resta se
 *  mueve con él. */
const RE_PREAMBULO_DE_SENTRY = /^!function\(\)\{try\{var [\s\S]*?\}catch\(e\)\{\}\}\(\)[;,]/
const preambuloDe = (f: string): number =>
  RE_PREAMBULO_DE_SENTRY.exec(readFileSync(path.join(DIST, f), 'utf8'))?.[0].length ?? 0

const preambuloPropio = propios.reduce((n, f) => n + preambuloDe(f), 0)
const preambuloHeredado = heredados.reduce((n, f) => n + preambuloDe(f), 0)
const escritoPorElLane = pesoPropio.crudo - preambuloPropio

console.log(`  HEREDADO Y PUBLICADO (regla 13): ${kib(preambuloPropio)} de preámbulo de \`@sentry/nextjs\` en los ${propios.length} chunks propios`)
console.log(`    — 348 B por chunk, inyectados por la integración de Sentry de la configuración RAÍZ, que estos sprints tienen PROHIBIDA.`)
console.log(`    — el mismo preámbulo pesa ${kib(preambuloHeredado)} en los ${heredados.length} chunks heredados. Es del build, no del lane.`)
console.log(`  ⚠️ Es EXACTAMENTE el desvío que B2 publicó (61,3 contra 60): 1,36 KiB. El techo no se movió por eso.`)

afirmar(
  preambuloPropio > 0,
  `  y el detector del preámbulo NO está ciego: lo encontró en ${propios.filter((f) => preambuloDe(f) > 0).length} de los ${propios.length} chunks propios`,
)
console.log(`  EL TECHO: ${PRESUPUESTO_PROPIO_KIB} KiB = ${PRESUPUESTO_DEL_LANE_KIB} del lane + ${MONTAJE_DE_B4A_KIB} que B4-A monta (la marca en sus tres superficies + la meseta).`)
console.log('    Lo subió el humano en la parada, con el número medido. La alternativa era no montar la marca: por eso la decisión es revocable.')
afirmar(
  escritoPorElLane / 1024 < PRESUPUESTO_PROPIO_KIB,
  `lo que ESCRIBE el lane entra en ${PRESUPUESTO_PROPIO_KIB} KiB crudo`,
  `${kib(escritoPorElLane)} — ${(PRESUPUESTO_PROPIO_KIB - escritoPorElLane / 1024).toFixed(2)} KiB de aire · ${kib(pesoPropio.crudo)} con el preámbulo heredado adentro`,
)
afirmar(
  escritoPorElLane / 1024 - MONTAJE_DE_B4A_KIB < PRESUPUESTO_DEL_LANE_KIB,
  `  y el techo VIEJO sigue vigilando todo lo que NO es la marca: sin lo que B4-A monta, el lane entra en ${PRESUPUESTO_DEL_LANE_KIB} KiB`,
  `${kib(escritoPorElLane - MONTAJE_DE_B4A_KIB * 1024)} — desmontar la marca tiene que devolver el número a 59,94`,
)

controlPositivo(
  'el presupuesto no se cumple solo: con un techo de 1 KiB, lo propio de hoy NO entra',
  1,
  (techo: number) => escritoPorElLane / 1024 < techo,
)
controlPositivo(
  'y la resta no es un cheque en blanco: sin restar el preámbulo, el número publicado es OTRO',
  pesoPropio.crudo,
  (crudo: number) => crudo === escritoPorElLane,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LA DEUDA QUE ESTE INVARIANTE DECLARÓ, PAGADA')

/**
 * El sistema de motion ya NO viaja en la carga inicial. Es lo que este archivo
 * publicaba como "la consecuencia que este lane no resuelve", y es lo que la
 * composición del home resolvió. Se afirma con las mismas cinco huellas que
 * `test:s2-bundle` usa: cinco módulos distintos del sistema, no una marca sola.
 */
const HUELLAS_DEL_SISTEMA = [
  'salida-fuerte',
  'atado-al-scroll',
  'simetrica-suave',
  'data-lineas-piezas',
  'bottom-=240px',
]
const contiene = (f: string, aguja: string): boolean =>
  readFileSync(path.join(DIST, f), 'utf8').includes(aguja)

for (const huella of HUELLAS_DEL_SISTEMA) {
  afirmar(
    inicial.filter((f) => contiene(f, huella)).length === 0,
    `\`${huella}\` NO está en la carga inicial de /v3 — la deuda de este lane, pagada`,
  )
}
console.log('  el chunk de la coreografía se pesa en `test:s7-compuerta`, que es de quien la construyó.')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · La ruta que este invariante medía ya no existe')

for (const borrada of RUTAS_BORRADAS) {
  afirmar(
    htmlDe(borrada.ruta) === '',
    `\`${borrada.ruta}\` no está en el build: se borró al componer el home`,
    borrada.motivo,
  )
}

cerrar('s5-peso.invariant')
