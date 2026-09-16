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

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { PESO_DE_LA_LLAVE_EN_BYTES, RECIBOS_DE_LA_LLAVE } from './s5-presupuesto-recibos-de-la-llave'
import {
  AIRE_MINIMO_UTIL_BYTES,
  BUILDS_QUE_FALTAN_PARA_EL_REPARTO,
  DESVIO_DEL_TITULAR_BYTES,
  INVENTARIO_DEL_TITULAR,
  PROPUESTA_DEL_TITULAR_KIB,
  aireDe,
} from './s5-presupuesto-recibos-del-titular'
import {
  DESCARGA_ANTES_BYTES,
  DESCARGA_DELTA_BYTES,
  DESCARGA_DESPUES_BYTES,
  DESCARGA_REPARTIDA_BYTES,
  DESVIO_DE_MOVIL_BYTES,
  RECIBOS_DE_LA_DESCARGA,
} from './s5-presupuesto-recibos-de-movil'
import {
  ARREGLO_DE_B7_KIB,
  HEREDADO_SIN_DECLARAR_KIB,
  MONTAJES_DECLARADOS_KIB,
  MONTAJE_DE_B11_KIB,
  MONTAJE_DE_B12_KIB,
  MONTAJE_DEL_TITULAR_KIB,
  MONTAJE_DE_MOVIL_KIB,
  MONTAJE_DE_TAPADO_KIB,
  MONTAJE_DE_B4A_KIB,
  MONTAJE_DE_B6A_KIB,
  MONTAJE_DE_B8_KIB,
  MONTAJE_DE_B9_KIB,
  PRESUPUESTO_DEL_LANE_KIB,
  PESO_DE_LA_LLAVE_KIB,
  PRESUPUESTO_PROPIO_KIB,
} from './s5-presupuesto'
import { DIST, conjuntoInicial, exigirBuild, htmlDe, kib, partirCargaInicial, pesar } from './s3-bundle'
import {
  AIRE_DE_LA_PROPUESTA_BYTES,
  DESVIO_DE_TAPADO_BYTES,
  LINEA_QUE_LA_PROPUESTA_PEDIA_KIB,
  PROPUESTA_DE_TAPADO_KIB,
  aireDeTapado,
} from './s5-presupuesto-recibos-de-tapado'
import { RUTAS_BORRADAS } from './s4-rutas-de-demo'

/**
 * El valor que la línea del titular tenía ANTES de la parada de PESO-1. Vive acá
 * y no en el recibo porque su único uso es ser la entrada equivocada del control
 * positivo de abajo: un control que se alimentara de la constante de verdad no
 * probaría nada.
 */
const LINEA_VIEJA_DEL_TITULAR_KIB = 0.69

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

/** Las siete líneas del presupuesto viven en `s5-presupuesto.ts`, una por dueño
 *  (B6-A, con la forma de B7); el recibo completo de cada una, en
 *  `s5-presupuesto-recibos.ts` y `s5-presupuesto-recibos-del-merge.ts`. */

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
// ⚠ B10 · acá había DOS bloques `EL TECHO`, uno abajo del otro: el merge de las
// cuatro ramas conservó los dos lados del conflicto. El de arriba era el de B9 y
// **le faltaban dos montajes** (B6-A y B8), o sea que imprimía un reparto que no
// sumaba el número que él mismo publicaba al lado. Queda el completo.
console.log(
  `  EL TECHO: ${PRESUPUESTO_PROPIO_KIB.toFixed(2)} KiB = ${PRESUPUESTO_DEL_LANE_KIB} del lane` +
    ` + ${MONTAJE_DE_B4A_KIB} que B4-A monta (la marca en sus tres superficies + la meseta)` +
    ` + ${ARREGLO_DE_B7_KIB} que B7 arregla (el proveedor de \`prefers-reduced-motion\`, 0,52 medidos A/B)` +
    ` + ${MONTAJE_DE_B6A_KIB} que B6-A monta (la cuarta superficie: 225 B medidos entre dos builds)` +
    ` + ${MONTAJE_DE_B8_KIB} que B8 monta (el arco con la noche, el contraluz atado y el brillo de las partículas)` +
    ` + ${MONTAJE_DE_B9_KIB} que B9 monta (la regla del rango en 13 sitios, 312 B contados dos veces)` +
    ` + ${MONTAJE_DE_B11_KIB} que B11 monta (el texto corrido de donde pasa el logo y dos tintas a plena: 25 B netos medidos A/B entre dos builds del mismo árbol, atribuidos byte a byte)` +
    ` + ${MONTAJE_DE_B12_KIB} que B12 monta (la GOTA de entrada a la noche, 1.304 B, y la BANDA local del pie, 176 B, contra −87 B que devuelve todo el resto del bloque: 1.393 B netos, apagando cada pieza y restaurándola byte a byte)` +
    ` + ${MONTAJE_DEL_TITULAR_KIB} que monta el TITULAR rehecho (los DOS niveles nuevos de la escala, el quinto peso, las dos cadenas de clase y el atributo del CTA, contra lo que devuelven la bajada, el cepillo y la pieza quieta: 706 B de desvio en dos pasadas (614 + 91,6) medidos por este mismo invariante contra el techo que fijo el build de B12)` +
    ` + ${MONTAJE_DE_MOVIL_KIB} que MOVIL-1 monta (la compuerta de la escena partida en dos: ${DESVIO_DE_MOVIL_BYTES} B de desvio medidos A/B entre dos builds del mismo arbol, con los cinco archivos de producto devueltos a HEAD por git show y restaurados con sha256 verificado)` +
    ` + ${MONTAJE_DE_TAPADO_KIB} que TAPADO-1 monta (el texto del hero abajo del breakpoint: ${DESVIO_DE_TAPADO_BYTES} B de desvio medidos A/B entre dos builds del mismo arbol, con Hero.tsx devuelto a cdd7ae03 por git show y restaurado con sha256 verificado)` +
    ` + ${HEREDADO_SIN_DECLARAR_KIB} HEREDADOS y publicados con su dueño.`,
)
console.log(`    EL HEREDADO se RE-MIDIÓ en B10 sobre este árbol, el de las cuatro ramas mergeadas: 63.864 B escritos − 62,27 KiB de líneas con nombre = 99,5 B, declarados ${HEREDADO_SIN_DECLARAR_KIB}.`)
console.log('    ⚠️ Creció 28,5 B contra los 71 B que B8 midió sobre un árbol SIN B9. El candidato —el producto que B9 tocó fuera de los 13 literales del rango— está escrito con su número en `s5-presupuesto-recibos-del-merge.ts`, sin apropiárselo.')
console.log('    B11 fue el sprint que chocó contra los 2,9 B que B10 dejó: declaró su montaje con su A/B, su reparto byte a byte y su alternativa escrita (`s5-presupuesto-recibos-de-b11.ts`). El 60 no se movió.')
console.log('    B12 es la línea más grande que este techo llevó, y las DOS piezas que la componen son nuevas y pedidas por su nombre: la gota («un efecto de gota o algo exótico y deluxe») y el velo local del pie. El resto del bloque DEVUELVE 87 B (`s5-presupuesto-recibos-de-b12.ts`).')
console.log(`    EL TITULAR es la primera linea cuyo REPARTO POR PIEZA no esta medido, y se declara: el total son ${DESVIO_DEL_TITULAR_BYTES} B medidos, el inventario tiene ${INVENTARIO_DEL_TITULAR.length} piezas derivadas del codigo, y cerrarlo cuesta ${BUILDS_QUE_FALTAN_PARA_EL_REPARTO} builds. El precio del pendiente esta escrito en s5-presupuesto-recibos-del-titular.ts.`)
console.log('    Y los dos `.woff2` nuevos (21.352 B) NO entran en esta cuenta: `conjuntoInicial()` mide los `<script src>` de la ruta, o sea SOLO JavaScript. Las dos fuentes de S0 tampoco estan. Se publican aparte, en el reporte y en `scripts-titular/manifiesto-fuentes.json`.')
console.log('    Cada línea la subió el humano en su parada, con el número medido y su alternativa escrita en los SIETE archivos de recibos: por eso cada una es revocable por separado.')
console.log('    El séptimo (`s5-presupuesto-recibos-de-tapado.ts`) era el único SIN línea —medía bytes que ya estaban en el lane y cuya parada no había pasado, y por eso esta corrida salía en rojo—. La parada de PAPEL-1 la aprobó: ya tiene línea, y la subió al centésimo siguiente con la regla del aire útil.')
/**
 * ✅ **LA PROPUESTA DEL TITULAR ESTÁ APLICADA, y por eso dejó de imprimirse y
 * pasó a AFIRMARSE.**
 *
 * El aire de una línea es la parte ÚTIL del redondeo al centésimo de arriba, y la
 * del titular había caído en 0,6 B —dos pasadas seguidas del lado malo del
 * centésimo—. El humano aprobó subirla a 0,70 en la parada de PESO-1.
 *
 * Mientras estuvo pendiente esto era un `console.log`, porque una propuesta que
 * nadie ve no es una propuesta. **Aplicada, un `console.log` sería peor que
 * nada**: diría que algo está bien sin que nada lo vigile. Lo que queda son dos
 * afirmaciones y su control —que la línea sea la que el recibo propuso, y que su
 * aire esté por encima del umbral declarado—, así que el día que alguien la
 * devuelva a 0,69 el gate lo dice con el número.
 */
afirmar(
  MONTAJE_DEL_TITULAR_KIB === PROPUESTA_DEL_TITULAR_KIB,
  '✅ la línea del titular es la que su recibo propuso: la parada la aprobó',
  `${MONTAJE_DEL_TITULAR_KIB} KiB — el techo de ${PRESUPUESTO_DEL_LANE_KIB} no se movió, y la línea sigue siendo revocable sola`,
)
afirmar(
  aireDe(MONTAJE_DEL_TITULAR_KIB) >= AIRE_MINIMO_UTIL_BYTES,
  '  y su aire vuelve a cumplir su función: está arriba del umbral declarado',
  `${aireDe(MONTAJE_DEL_TITULAR_KIB).toFixed(1)} B contra un umbral de ${AIRE_MINIMO_UTIL_BYTES} B — era ${aireDe(LINEA_VIEJA_DEL_TITULAR_KIB).toFixed(1)} B, el orden de B11 (8,6) y B12 (8,2)`,
)
controlPositivo(
  'el lector de aire no está ciego: con la línea VIEJA (0,69) el aire cae debajo del umbral',
  LINEA_VIEJA_DEL_TITULAR_KIB,
  (kib: number) => aireDe(kib) >= AIRE_MINIMO_UTIL_BYTES,
)
/**
 * ⚠️ **EL PESO DE LA LLAVE SE RESTA APARTE, Y EN VOZ ALTA (B12 §4).**
 *
 * Lo que el contenido inventado agrega **no es producto**: es andamio que se va
 * el día que llegue el contenido real. Meterlo adentro del techo del lane lo
 * volvería indistinguible de un montaje, y el 60 dejaría de poder leerse solo.
 * Así que se resta como una línea propia, con su nombre, y el techo del lane
 * queda exactamente donde B12 §1–§3 lo dejó.
 *
 * ⚠ La cifra que la afirmación mira es `escritoPorElLane − PESO_DE_LA_LLAVE`, y
 * el día que la llave se apague y las veinte casillas se borren, esta resta
 * tiene que volver a cero. Mientras tanto se publica en cada corrida.
 */
const escritoSinLaLlave = escritoPorElLane - PESO_DE_LA_LLAVE_KIB * 1024
console.log(
  `  ⚠️ LA LLAVE (B12 §4): ${PESO_DE_LA_LLAVE_KIB} KiB de contenido INVENTADO se restan APARTE del techo del lane — ${kib(escritoPorElLane)} escritos, ${kib(escritoSinLaLlave)} sin el andamio.`,
)
console.log('    No es un montaje y no entra en `MONTAJES_DECLARADOS_KIB`: el techo no se movió por §4. Reparto en `s5-presupuesto-recibos-de-la-llave.ts`.')
console.log('    ⚠️ Y apagar la llave devuelve 0 bytes, medido: lo que devuelve los bytes es borrar las veinte entradas de `_contrato/inventado.ts` (1.064 B).')

afirmar(
  escritoSinLaLlave / 1024 < PRESUPUESTO_PROPIO_KIB,
  `lo que ESCRIBE el lane, sin el andamio de la llave, entra en ${PRESUPUESTO_PROPIO_KIB} KiB crudo`,
  // ⚠ B10 · el aire va TAMBIÉN en bytes: con 2,9 B de margen, `toFixed(2)` sobre
  // KiB imprime `0.00` y eso se lee como "no queda aire", que no es lo medido.
  `${kib(escritoSinLaLlave)} — ${(PRESUPUESTO_PROPIO_KIB * 1024 - escritoSinLaLlave).toFixed(1)} B de aire · ${kib(pesoPropio.crudo)} con el preámbulo heredado adentro`,
)
afirmar(
  escritoSinLaLlave / 1024 - MONTAJES_DECLARADOS_KIB < PRESUPUESTO_DEL_LANE_KIB,
  `  y el techo VIEJO sigue vigilando todo lo que NO está declarado: sin los ${MONTAJES_DECLARADOS_KIB.toFixed(2)} KiB de líneas con nombre, el lane entra en ${PRESUPUESTO_DEL_LANE_KIB} KiB`,
  `${((escritoSinLaLlave - MONTAJES_DECLARADOS_KIB * 1024) / 1024).toFixed(3)} KiB — es la cifra que la afirmación mira: lo escrito, menos el andamio de la llave, menos las líneas con nombre, y tiene que quedar abajo de ${PRESUPUESTO_DEL_LANE_KIB}`,
)

/**
 * ✅ **LA PROPUESTA DE TAPADO-1 ESTÁ APLICADA, y por eso dejó de imprimirse y
 * pasó a AFIRMARSE.** Es el mismo tránsito que hizo la del titular, por el mismo
 * motivo: una propuesta pendiente se imprime porque nadie la ve si no; una
 * propuesta aplicada impresa diría que algo está bien sin que nada lo vigile.
 *
 * La línea del titular se aprobó y se aplicó, y **no alcanzaba**: daba 10,24 B de
 * techo contra 12,4 B de excedente. Los 2,2 B que sobraban no eran suyos. Se
 * midió de quién eran, con un A/B de dos builds del mismo árbol
 * (`scripts-peso/a-atribuir.ts`): eran de **TAPADO-1**, que cambió producto
 * —`Hero.tsx`— y no declaró su línea.
 *
 * 🔴 **Y la parada la subió UN CENTÉSIMO por encima de lo que la propuesta
 * pedía**, estrenando una regla: *una línea nueva no nace por debajo del umbral
 * de aire útil*. 0,03 dejaba 7,7 B —0,3 B debajo de los 8 declarados—; 0,04 deja
 * 17,96. Las tres afirmaciones de abajo son las que hacen que eso no se pueda
 * deshacer en silencio: que la línea sea la que el recibo dice, que su aire esté
 * arriba del umbral, y —el control positivo— que el lector de aire SÍ vea en rojo
 * el centésimo que la propuesta pedía.
 */
afirmar(
  MONTAJE_DE_TAPADO_KIB === PROPUESTA_DE_TAPADO_KIB,
  '✅ la línea de TAPADO-1 es la que su recibo propuso: la parada la aprobó',
  `${MONTAJE_DE_TAPADO_KIB} KiB por ${DESVIO_DE_TAPADO_BYTES} B medidos — el techo de ${PRESUPUESTO_DEL_LANE_KIB} no se movió, y la línea sigue siendo revocable sola`,
)
afirmar(
  aireDeTapado(MONTAJE_DE_TAPADO_KIB) >= AIRE_MINIMO_UTIL_BYTES,
  '  y NACE con el aire arriba del umbral: es la regla que esta línea estrena',
  `${AIRE_DE_LA_PROPUESTA_BYTES.toFixed(1)} B contra un umbral de ${AIRE_MINIMO_UTIL_BYTES} B — con el centésimo que la propuesta pedía (${LINEA_QUE_LA_PROPUESTA_PEDIA_KIB}) eran ${aireDeTapado(LINEA_QUE_LA_PROPUESTA_PEDIA_KIB).toFixed(1)} B, ${(AIRE_MINIMO_UTIL_BYTES - aireDeTapado(LINEA_QUE_LA_PROPUESTA_PEDIA_KIB)).toFixed(1)} B DEBAJO`,
)
controlPositivo(
  'el lector de aire no está ciego acá tampoco: con el centésimo que la propuesta pedía (0,03) el aire cae debajo del umbral',
  LINEA_QUE_LA_PROPUESTA_PEDIA_KIB,
  (kib: number) => aireDeTapado(kib) >= AIRE_MINIMO_UTIL_BYTES,
)

/**
 * ⚠️ **EL TECHO PASÓ DE 63,76 A 64,36 Y LA DIFERENCIA ES UNA LÍNEA CON NOMBRE.**
 *
 * Este renglón afirmaba que §4 de B12 no había movido el techo ni un centésimo,
 * y eso sigue siendo cierto: lo movió el titular rehecho, con
 * `MONTAJE_DEL_TITULAR_KIB` (0,60), su recibo y su alternativa escrita. Lo que
 * la afirmación protege es que el techo NO se mueva sin línea, así que se
 * reescribe para que siga protegiendo eso: **el número de hoy es el 60 del
 * lane más la suma de las líneas declaradas, y ni un centésimo más.**
 *
 * Puesto así es más fuerte que antes: la versión vieja clavaba una cifra y
 * había que acordarse de moverla; ésta compara el techo contra el reparto que
 * el propio archivo publica, así que un centésimo que aparezca sin línea que lo
 * cubra la pone en rojo sola.
 */
afirmarIgual(
  PRESUPUESTO_PROPIO_KIB.toFixed(2),
  (PRESUPUESTO_DEL_LANE_KIB + MONTAJES_DECLARADOS_KIB).toFixed(2),
  `⚠️ el techo del lane es EXACTAMENTE el 60 del original más las líneas con nombre: ${PRESUPUESTO_PROPIO_KIB.toFixed(2)} KiB, sin un centésimo sin dueño`,
)
afirmarIgual(PRESUPUESTO_DEL_LANE_KIB, 60, '  y el 60 NO se movió: las nueve líneas se le SUMAN y se pueden revocar una por una')
afirmarIgual(PESO_DE_LA_LLAVE_EN_BYTES, 4303, `  la línea de la llave la sostiene su recibo: ${RECIBOS_DE_LA_LLAVE.length} renglones medidos que suman ${PESO_DE_LA_LLAVE_EN_BYTES} B`)
/** ⚠ La suma de los renglones es un MODELO del reparto —cada A/B se midió
 *  sobre un árbol intermedio distinto— y **la cifra que manda es la del árbol
 *  que se commitea**, que es la que la afirmación de arriba mira. La diferencia
 *  no se apropia: se publica, como B10 hizo con los 28,5 B del heredado. */
afirmar(
  Math.abs(PESO_DE_LA_LLAVE_EN_BYTES - PESO_DE_LA_LLAVE_KIB * 1024) < 64,
  `  y el modelo y la línea no se contradicen: ${(PESO_DE_LA_LLAVE_KIB * 1024 - PESO_DE_LA_LLAVE_EN_BYTES).toFixed(1)} B de diferencia, publicados y no apropiados`,
)

/**
 * ⚠️ **LA OTRA CIFRA DE MOVIL-1 — la que este techo NO mide, publicada al lado.**
 *
 * El techo de arriba gobierna la CARGA INICIAL. Lo que un teléfono DESCARGA al
 * abrir `/v3` es otra cosa: la carga inicial más lo que el `import()` diferido
 * pide después de hidratar. Hasta MOVIL-1 no había nada diferido que contar
 * abajo de 1025 —la compuerta no ejecutaba el import— y por eso ningún
 * instrumento del repo miraba este número.
 *
 * **No se le suma al techo, y el porqué está desarrollado en el recibo**: con
 * 259,83 KiB adentro, el gate quedaría con un cuarto de mega de aire y dejaría
 * de poder ponerse en rojo. Es la forma que B12 §4 le dio al peso de la llave.
 */
console.log(
  `  ⚠️ LO QUE DESCARGA UN TELÉFONO (MOVIL-1, fuera de este techo): ${kib(DESCARGA_ANTES_BYTES)} antes → ${kib(DESCARGA_DESPUES_BYTES)} después = +${kib(DESCARGA_DELTA_BYTES)} a 390×844, con la caché apagada.`,
)
console.log(`    Repartido en ${RECIBOS_DE_LA_DESCARGA.length} renglones, el mayor ${kib(RECIBOS_DE_LA_DESCARGA[0][1])} (${RECIBOS_DE_LA_DESCARGA[0][2]}). Recibo: \`s5-presupuesto-recibos-de-movil.ts\`.`)
console.log('    NO se suma a `MONTAJES_DECLARADOS_KIB`: el techo mide la carga inicial y esto es descarga diferida. Sumarlo dejaría el gate sin capacidad de fallar.')

afirmarIgual(
  DESCARGA_REPARTIDA_BYTES,
  DESCARGA_DELTA_BYTES,
  `  y el reparto de la descarga CIERRA sin residuo: ${RECIBOS_DE_LA_DESCARGA.length} renglones suman los ${DESCARGA_DELTA_BYTES} B medidos`,
)
afirmarIgual(
  DESCARGA_DESPUES_BYTES - DESCARGA_ANTES_BYTES,
  DESCARGA_DELTA_BYTES,
  '  y las dos mediciones del A/B reconstruyen el delta publicado',
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
