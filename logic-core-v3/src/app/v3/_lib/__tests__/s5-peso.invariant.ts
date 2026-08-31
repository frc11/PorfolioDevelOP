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
 */
const PRESUPUESTO_PROPIO_KIB = 60
afirmar(
  pesoPropio.crudo / 1024 < PRESUPUESTO_PROPIO_KIB,
  `lo propio de /v3 entra en ${PRESUPUESTO_PROPIO_KIB} KiB crudo`,
  `${kib(pesoPropio.crudo)} — ${(PRESUPUESTO_PROPIO_KIB - pesoPropio.crudo / 1024).toFixed(1)} KiB de aire`,
)

controlPositivo(
  'el presupuesto no se cumple solo: con un techo de 1 KiB, lo propio de hoy NO entra',
  1,
  (techo: number) => pesoPropio.crudo / 1024 < techo,
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
