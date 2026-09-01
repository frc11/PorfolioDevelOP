/**
 * INVARIANTE — SITIO-S8 · LA MUDANZA Y EL MONTAJE DE LA ESCENA.
 *
 *     npx tsx src/app/v3/_lib/escena/__tests__/s8-escena.invariant.ts
 *     npm run test:s8-escena
 *
 * Ocho secciones, todas sobre el DISCO (el build es `s8-tres.invariant.ts`) y
 * todas con control positivo.
 *
 * ── ⚠️ LO QUE ESTE ARCHIVO **NO** AFIRMA, y por qué ────────────────────────
 *
 * **Que cada archivo mudado sea idéntico al original línea por línea.** La
 * comparación necesita el original, ya no está en el disco —se movió— y la
 * única fuente sería `git`. Un check contra `git` mide el momento del sprint y
 * no el código (§3.12 de `DIRECCION-ESCENA.md`): commiteado, el diff es vacío
 * por construcción y el check queda verde por vacío para siempre. Va en su
 * propio script de frontera o no va.
 *
 * **La fidelidad se midió con un instrumento más fuerte que un diff de líneas:**
 * las 34 suites que ya existían sobre estos módulos —20 en
 * `probe-escena/__tests__/`, 12 en `home-intro/` y 2 en `lib/`— **afirman
 * VALORES**, no texto: los 249,4 / 236,9 del papel, los seis valores medios del
 * cuadro, el 0,18–0,21 del borde de la penumbra, los 8 keyframes y su vuelta de
 * 360 exactos. Antes y después de la mudanza dan **890 afirmaciones en verde, 0
 * en rojo, archivo por archivo con la misma cuenta**. Un diff de líneas no
 * distingue un comentario de una constante; esas 890 sí.
 */

import path from 'node:path'

import { SECCIONES, SECCIONES_QUE_DEJAN_VER_LA_ESCENA } from '../../secciones'
import { CLASES_FUERA_DE_FLUJO } from '../../compuerta'
import { MARCA_ESCENA } from '../../marcaEscena'
import { CLASES_DE_LA_ESCENA, PAQUETES_DE_TRES } from '../contrato'
import { escenaRetenida } from '../retencion'
// prettier-ignore
import { MAPEO_DE_LAS_SECCIONES, PANTALLAS_DEL_DOCUMENTO, PANTALLAS_DE_SCROLL, pantallasDe, progresoDelScroll } from '../recorrido'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
// prettier-ignore
import { DESTINO, ORIGEN, MODULOS_MUDADOS, RAIZ, SUBARBOL_DEL_EDITOR, escribeAtributo, existe, importaValorDe, pesoDeUnFuente, resolverEspecificador, usaClassName } from './soporte'
// prettier-ignore
import { TODOS, conTipoDelPanel, conValorDelPanel, consumidoresDeLaMarca, fuenteDe, rotosDeLaMudanza, soloAplicacion } from './s8-escena-soporte'
import { desalineacionDeNombres, imprimirMapeo, pesoDelEditor } from './tablas'

const ESCENA_DEL_HOME = fuenteDe(`${DESTINO}/EscenaDelHome.tsx`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La mudanza está completa y no dejó una sola copia atrás')

const faltanEnDestino = MODULOS_MUDADOS.filter((n) => !existe(`${DESTINO}/${n}`))
const sobranEnOrigen = MODULOS_MUDADOS.filter((n) => existe(`${ORIGEN}/${n}`))

afirmarIgual(faltanEnDestino, [], `los ${MODULOS_MUDADOS.length} módulos están en el destino`)
afirmarIgual(sobranEnOrigen, [], '  y ninguno quedó duplicado en el origen')

controlPositivo(
  'el detector ve un módulo que falta en el destino',
  'EsteModuloNoExisteJamas.tsx',
  (nombre: string) => existe(`${DESTINO}/${nombre}`),
)
controlPositivo(
  'y ve una copia que sigue en el origen',
  'choreographyEditor.ts',
  (nombre: string) => !existe(`${ORIGEN}/${nombre}`),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Nadie importa un especificador de la mudanza que ya no existe')

/** El acote al radio del sprint y su motivo viven en `s8-escena-soporte.ts`: el
 *  barrido entero encuentra fixtures de otros instrumentos, y afirmar sobre ellos
 *  sería afirmar sobre código que este sprint no controla. */
const { todos: todosLosRotos, delSprint: rotosDelSprint } = rotosDeLaMudanza(TODOS)

afirmarIgual(
  rotosDelSprint,
  [],
  `${TODOS.length} archivos escaneados, cero especificadores rotos de la mudanza`,
)
afirmar(
  todosLosRotos.length > 0,
  '  y el MISMO barrido sigue encontrando los fixtures de los otros instrumentos: no está ciego',
  `${todosLosRotos.length} — ${todosLosRotos.join(' · ')}`,
)

const DESDE = path.join(RAIZ, `${DESTINO}/EscenaDelHome.tsx`)
afirmar(
  resolverEspecificador(DESDE, './ProbeStage') !== 'ROTO',
  '  y el resolvedor sí encuentra un módulo que existe',
)
controlPositivo(
  'el resolvedor —el mismo que usa el barrido— ve una ruta que no existe',
  './EsteModuloNoExisteJamas',
  (spec: string) => resolverEspecificador(DESDE, spec) !== 'ROTO',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El único vínculo que queda del destino hacia /probe-escena es de TIPO')

const deLaAplicacion = soloAplicacion(TODOS)
afirmarIgual(
  conValorDelPanel(TODOS),
  [],
  'ningún módulo de la escena importa un VALOR del panel de calibración',
)

afirmarIgual(
  conTipoDelPanel(TODOS),
  ['OrbitRig.tsx', 'ProbeStage.tsx', 'pistaDelHome.ts'].sort(),
  'y los TRES que lo nombran lo hacen SOLO por el tipo `ChoreoEditor` — ver el freno del reporte',
)

controlPositivo(
  'el detector distingue un import de VALOR de uno de tipo',
  "import { algo } from '@/app/probe-escena/_components/choreographyEditor'",
  (fuente: string) => !importaValorDe(fuente, 'probe-escena'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL MAPEO DEL RECORRIDO — derivado de la tabla, y POR ANCLAJE desde S9')

/**
 * ⚠ **ESTA SECCIÓN CAMBIÓ EN SITIO-S9, Y SÓLO ESTA SECCIÓN.** §7.2 se decidió: el
 * mapeo pasó a ser por anclaje y `MAPEO_PROVISIONAL` se llama ahora
 * `MAPEO_DE_LAS_SECCIONES`. **Lo que S8 afirmaba acá se queda acá** —una fila por
 * sección, monótono, cubre [0, 1], las transparentes salen de la tabla—: siguen
 * siendo verdad, y por eso vale volver a correrlas contra el mapeo nuevo. La
 * medición del anclaje en sí es de `s9-anclaje.invariant.ts`.
 */
imprimirMapeo()

// prettier-ignore
afirmarIgual(MAPEO_DE_LAS_SECCIONES.map((f) => f.id), SECCIONES.map((s) => s.id),
  'el mapeo tiene una fila por sección, en el orden de la tabla')
// prettier-ignore
afirmar(MAPEO_DE_LAS_SECCIONES.every((f, i) => i === 0 || f.llenaDesde >= MAPEO_DE_LAS_SECCIONES[i - 1].llenaHasta),
  'es monótono: ninguna sección arranca antes de que termine la anterior')
// prettier-ignore
afirmarIgual([MAPEO_DE_LAS_SECCIONES[0].llenaDesde, MAPEO_DE_LAS_SECCIONES[MAPEO_DE_LAS_SECCIONES.length - 1].llenaHasta],
  [0, 1], 'y cubre [0, 1]: la primera arranca en 0 y la última llega a 1')
afirmarIgual(PANTALLAS_DE_SCROLL, PANTALLAS_DEL_DOCUMENTO - 1, 'el recorrido de scroll es el documento menos una ventana')

const transparentes = MAPEO_DE_LAS_SECCIONES.filter((f) => f.dejaVerLaEscena).map((f) => f.id)
// prettier-ignore
afirmarIgual(transparentes, [...SECCIONES_QUE_DEJAN_VER_LA_ESCENA],
  'las dos secciones que dejan ver la escena salen de la tabla, no de acá')

/**
 * ⚠ La desalineación **de nombres** sigue existiendo y publicándose: `demos` no
 * es ninguna sección, y eso es un hecho de las dos tablas que el anclaje no
 * cambia. Lo que cambia es que ya no deja huérfano a nadie. La cuenta por
 * REPARTO —la que ahora significa algo— la publica `s9-anclaje` §5.
 */
const desalineacion = desalineacionDeNombres()
afirmar(
  desalineacion.tramosSinSeccion.includes('demos'),
  'LA DESALINEACIÓN DE NOMBRES sigue existiendo y no se tapó — el reparto que la resuelve es de S9',
  `tramos sin sección: ${desalineacion.tramosSinSeccion.join(', ')} · secciones sin tramo: ${desalineacion.seccionesSinTramo.join(', ')}`,
)

afirmarIgual(
  [
    progresoDelScroll(0, 1400, 100),
    progresoDelScroll(1300, 1400, 100),
    progresoDelScroll(9999, 1400, 100),
    progresoDelScroll(-50, 1400, 100),
    progresoDelScroll(0, 100, 100),
  ],
  [0, 1, 1, 0, 0],
  'progresoDelScroll: 0 arriba, 1 abajo, acotado a los dos lados, 0 si no hay recorrido',
)
controlPositivo(
  'pantallasDe no acepta una unidad que no sabe leer',
  '200px',
  (alto: string) => Number.isFinite(pantallasDe(alto)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · LA CIFRA DEL FRENO — lo que pesa el editor que NO se mudó')

const editor = pesoDelEditor()
console.log(
  `  ${SUBARBOL_DEL_EDITOR.length} archivos · ${(editor.total / 1024).toFixed(1)} KiB de código vivo` +
    ` (sin comentarios), de los cuales ${(editor.variantes / 1024).toFixed(1)} KiB son variantes y notas`,
)
afirmar(
  editor.total > 60 * 1024,
  'mudar el editor costaría más de 60 KiB de código vivo en el chunk de la escena',
  `${(editor.total / 1024).toFixed(1)} KiB — es la cifra sobre la que el humano decide`,
)
controlPositivo(
  'la cuenta no mira comentarios: 5.000 caracteres de bloque pesan cero',
  '/* '.concat('x'.repeat(5000), ' */\n'),
  (fuente: string) => pesoDeUnFuente(fuente) > 100,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · EscenaDelHome sale del flujo y escribe la marca como valor de atributo')

afirmarIgual(CLASES_DE_LA_ESCENA, CLASES_FUERA_DE_FLUJO, 'las clases son las de S1, no otras')
afirmarIgual(
  CLASES_FUERA_DE_FLUJO,
  'fixed inset-0 z-0 pointer-events-none',
  '  y siguen siendo fixed inset-0 z-0 pointer-events-none',
)
afirmar(
  usaClassName(ESCENA_DEL_HOME, 'CLASES_DE_LA_ESCENA'),
  'EscenaDelHome las usa como className, no una cadena escrita a mano',
)
afirmar(
  escribeAtributo(ESCENA_DEL_HOME, 'data-escena', 'MARCA_ESCENA'),
  `y escribe la marca como VALOR de atributo — data-escena={MARCA_ESCENA} = "${MARCA_ESCENA}"`,
)
controlPositivo(
  'el detector no confunde nombrar la marca con escribirla',
  'const x = MARCA_ESCENA // data-escena, MARCA_ESCENA',
  (fuente: string) => escribeAtributo(fuente, 'data-escena', 'MARCA_ESCENA'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La marca la importa UN archivo, y la escena no toca el sistema de motion')

/**
 * ⚠ Se excluyen los `__tests__/`, con nombre y motivo: **este mismo archivo
 * importa `MARCA_ESCENA`** para imprimirla, y un escáner que se cuente a sí
 * mismo reportaría dos consumidores donde hay uno. La afirmación de abajo exige
 * que lo excluido SIGA teniendo lo que el detector busca.
 */
const consumidores = consumidoresDeLaMarca(deLaAplicacion)
afirmarIgual(
  consumidores,
  [`${DESTINO}/EscenaDelHome.tsx`],
  'un solo archivo de la aplicación importa marcaEscena.ts',
)
afirmar(
  consumidoresDeLaMarca(TODOS).length > consumidores.length,
  '  y lo excluido —los instrumentos— sigue importándola: la exclusión no está vacía',
)

afirmar(
  !importaValorDe(ESCENA_DEL_HOME, '_lib/motion') && !importaValorDe(ESCENA_DEL_HOME, './motion'),
  'EscenaDelHome no importa un valor del sistema de motion',
)
afirmarIgual(
  PAQUETES_DE_TRES.filter((p) => importaValorDe(ESCENA_DEL_HOME, p)),
  [],
  'ni un valor de three directamente: lo alcanza por ProbeStage',
)
controlPositivo(
  'el detector de motion no está ciego',
  "import { algo } from '../_lib/motion/anclas'",
  (fuente: string) => !importaValorDe(fuente, '_lib/motion'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · El aviso del intro se respeta en las cuatro etapas')

afirmarIgual(
  [
    escenaRetenida('idle', true),
    escenaRetenida('covering', true),
    escenaRetenida('covering', false),
    escenaRetenida('revealing', true),
    escenaRetenida('revealing', false),
    escenaRetenida('clear', true),
  ],
  [false, true, true, true, false, false],
  'covering retiene siempre · revealing sólo con entrada limpia · idle y clear sueltan',
)
controlPositivo(
  'el detector no retiene una etapa que no está retenida',
  'clear' as const,
  (etapa: 'clear') => escenaRetenida(etapa, true),
)

cerrar('s8-escena.invariant')
