/**
 * INVARIANTE — B3 · EL REVELADO DE LA ESCENA.
 *
 *     npx tsx src/app/v3/_lib/escena/__tests__/s17-revelado.invariant.ts
 *     npm run test:s17-revelado
 *
 * Mide que el revelado (1) produzca una máscara ESPACIAL —no un `opacity` de cero
 * a uno—, (2) devuelva `null` cuando no hay costura que ablandar (sin máscara
 * permanente), (3) derive los bordes de las ventanas transparentes sin ablandar
 * el borde del DOCUMENTO, (3b) no fabrique una costura entre dos transparentes
 * contiguas —B6-A, cuando el recorrido pasó a tenerlas—, (4) escale la rampa con
 * el viewport en vez de un píxel fijo, y (5) esté cableado en `EscenaDelHome`
 * **gateado por la misma retención que ya usa la escena** y sin tocar la pose ni
 * el progreso.
 *
 * ⚠ NO mide cómo se VE el reingreso en el navegador: eso es captura y va al
 * reporte. Acá se afirma el mecanismo, que es lo que un instrumento puede.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import {
  REVELADO_FRACCION,
  type BordeDeRevelado,
  type PanelDelRecorrido,
  bordesDeRevelado,
  maskDeRevelado,
} from '../revelado'
import { MARGEN_DE_REANUDACION } from '../visibilidad'
import { SECCIONES, SECCIONES_QUE_DEJAN_VER_LA_ESCENA } from '../../secciones'
import { SUPERFICIES } from '../../superficies'
import { ATRIBUTO_DEL_PANEL } from '../extensionDeLasSecciones'

const RAIZ = process.cwd()
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')

const VENTANA = 1080
const RAMPA = VENTANA * REVELADO_FRACCION // 135 a 1080

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · EL NÚCLEO — una rampa espacial en la costura, no un opacity')

const entra = maskDeRevelado([{ row: 540, tipo: 'entra' }], VENTANA, RAMPA)
afirmar(entra !== null && /linear-gradient\(to bottom/.test(entra), 'un borde `entra` produce un gradiente vertical', entra ?? 'null')
afirmar(
  entra !== null && entra.includes('transparent 540px') && entra.includes(`#000 ${540 + RAMPA}px`),
  '  con la escena OCULTA (transparent) sobre la costura y PLENA (#000) una rampa más abajo',
  `rampa de ${RAMPA}px en [540, ${540 + RAMPA}]`,
)
const sale = maskDeRevelado([{ row: 540, tipo: 'sale' }], VENTANA, RAMPA)
afirmar(
  sale !== null && sale.includes(`#000 ${540 - RAMPA}px`) && sale.includes('transparent 540px'),
  'un borde `sale` es la rampa espejada: plena arriba, oculta bajo la costura',
  sale ?? 'null',
)
// NO es un opacity: no hay ningún valor global de opacidad; son stops en px.
afirmar(
  entra !== null && !/opacity/i.test(entra) && (entra.match(/px/g) ?? []).length >= 3,
  'NO es un `opacity` de 0 a 1: la transición es espacial, con stops en píxeles',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · SIN COSTURA, SIN MÁSCARA — no queda una máscara permanente')

afirmarIgual(maskDeRevelado([{ row: 2000, tipo: 'entra' }], VENTANA, RAMPA), null, 'una costura fuera del cuadro → sin máscara')
afirmarIgual(maskDeRevelado([{ row: -900, tipo: 'entra' }], VENTANA, RAMPA), null, 'la escena llena la ventana (costura muy arriba) → sin máscara')
afirmarIgual(maskDeRevelado([], VENTANA, RAMPA), null, 'sin bordes → sin máscara')
afirmarIgual(maskDeRevelado([{ row: 540, tipo: 'entra' }], 0, RAMPA), null, 'ventana cero → sin máscara')
controlPositivo(
  'el núcleo NO devuelve máscara para una costura que no toca el cuadro (no inventa una rampa)',
  [{ row: 3000, tipo: 'entra' }] as BordeDeRevelado[],
  (bordes) => maskDeRevelado(bordes, VENTANA, RAMPA) !== null,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · LOS BORDES — de las ventanas transparentes, sin el borde del documento')

/**
 * El recorrido que recibe el detector: las ocho EN ORDEN con si cada una deja
 * ver el canvas. Se deriva acá de las dos tablas —igual que lo hace `revelado.ts`
 * por su cuenta— y se afirma contra la constante derivada de `secciones.ts`,
 * para que las tres lecturas no puedan decir cosas distintas.
 */
const RECORRIDO: readonly PanelDelRecorrido[] = SECCIONES.map((s) => ({
  id: s.id,
  dejaVerElCanvas: SUPERFICIES[s.superficie].dejaVerElCanvas,
}))
afirmarIgual(
  RECORRIDO.filter((p) => p.dejaVerElCanvas).map((p) => p.id),
  SECCIONES_QUE_DEJAN_VER_LA_ESCENA,
  'el recorrido del revelado dice lo mismo que `SECCIONES_QUE_DEJAN_VER_LA_ESCENA`',
)

// Doc falso: Hero (primera, arriba de todo) y Por qué develOP (interior), a mitad del reingreso.
const docFalso = {
  querySelector: (s: string) => {
    if (s.includes('por-que-develop')) return { getBoundingClientRect: () => ({ top: 540, bottom: 1620 }) }
    if (s.includes('hero')) return { getBoundingClientRect: () => ({ top: -12420, bottom: -11340 }) }
    return null
  },
}
const idPrimera = SECCIONES[0].id
const bordes = bordesDeRevelado(docFalso, RECORRIDO, ATRIBUTO_DEL_PANEL)
afirmar(idPrimera === 'hero', 'el Hero es la PRIMERA sección del recorrido', idPrimera)
afirmar(RECORRIDO[0].dejaVerElCanvas, '  y deja ver el canvas: su borde de arriba es el caso que NO debe ablandarse')
afirmar(
  !bordes.some((b) => b.tipo === 'entra' && b.row < -1000),
  'el borde de ARRIBA del Hero NO se ablanda: es el borde del documento, no una costura contra un opaco',
  JSON.stringify(bordes),
)
afirmar(
  bordes.some((b) => b.tipo === 'entra' && b.row === 540),
  'el borde de arriba de Por qué develOP SÍ es una costura `entra` (panel opaco encima)',
)
const maskReal = maskDeRevelado(bordes, VENTANA, RAMPA)
afirmar(maskReal !== null && maskReal.includes('transparent 540px'), 'y de esos bordes sale la máscara del reingreso', maskReal ?? 'null')
controlPositivo(
  'si `por-que-develop` no existiera en el DOM, no habría costura (el detector no la fabrica)',
  { querySelector: () => null },
  (doc: { querySelector: () => null }) =>
    maskDeRevelado(bordesDeRevelado(doc, RECORRIDO, ATRIBUTO_DEL_PANEL), VENTANA, RAMPA) !== null,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3b · VECINDADES (B6-A) — dos transparentes contiguas NO tienen costura; con un opaco entre medio, sí')

/**
 * Hasta B6-A el recorrido nunca puso dos transparentes seguidas, y el detector
 * emitía un `sale` al pie y un `entra` a la cabeza de TODA transparente interior.
 * Con dos contiguas eso fabricaba, en la fila donde se tocan, una rampa a cero y
 * otra desde cero: una banda de papel de 0,25 pantallas cruzando la escena donde
 * el recorrido sigue continuo. Un doc falso de cuatro paneles apilados, con la
 * frontera a mitad del cuadro (540), y dos recorridos sobre las MISMAS cajas: el
 * de dos transparentes contiguas y el que mete un opaco entre medio.
 */
const CAJAS: Readonly<Record<string, { top: number; bottom: number }>> = {
  arriba: { top: -1080, bottom: 0 },
  a: { top: 0, bottom: 540 },
  b: { top: 540, bottom: 1080 },
  abajo: { top: 1080, bottom: 2160 },
}
const docApilado = {
  querySelector: (s: string) => {
    const id = Object.keys(CAJAS).find((k) => s.includes(`="${k}"`))
    return id === undefined ? null : { getBoundingClientRect: () => CAJAS[id] }
  },
}
const contiguas: readonly PanelDelRecorrido[] = [
  { id: 'arriba', dejaVerElCanvas: false },
  { id: 'a', dejaVerElCanvas: true },
  { id: 'b', dejaVerElCanvas: true },
  { id: 'abajo', dejaVerElCanvas: false },
]
const conOpacoEntreMedio: readonly PanelDelRecorrido[] = [
  { id: 'arriba', dejaVerElCanvas: false },
  { id: 'a', dejaVerElCanvas: true },
  { id: 'b', dejaVerElCanvas: false },
  { id: 'abajo', dejaVerElCanvas: true },
]

const bordesContiguas = bordesDeRevelado(docApilado, contiguas, ATRIBUTO_DEL_PANEL)
afirmarIgual(
  bordesContiguas,
  [{ row: 0, tipo: 'entra' }, { row: 1080, tipo: 'sale' }],
  'dos transparentes contiguas: UNA costura arriba de la primera y UNA abajo de la segunda — ninguna en la frontera (540)',
)
const maskContiguas = maskDeRevelado(bordesContiguas, VENTANA, RAMPA)
afirmar(
  maskContiguas !== null && !maskContiguas.includes(' 540px'),
  '  y la máscara no tiene un stop en 540: la escena cruza la frontera plena',
  maskContiguas ?? 'null',
)
afirmar(
  maskContiguas !== null && maskContiguas.includes(`#000 ${RAMPA}px`) && maskContiguas.includes(`#000 ${VENTANA - RAMPA}px`),
  '  con la rampa de entrada arriba y la de salida abajo, donde SÍ hay opaco',
)

const bordesConOpaco = bordesDeRevelado(docApilado, conOpacoEntreMedio, ATRIBUTO_DEL_PANEL)
afirmar(
  bordesConOpaco.some((b) => b.row === 540 && b.tipo === 'sale') && bordesConOpaco.some((b) => b.row === 1080 && b.tipo === 'entra'),
  'con un opaco entre medio, la frontera de 540 SÍ es costura (`sale`), y la de 1080 también (`entra`): las mismas cajas, otro recorrido',
  JSON.stringify(bordesConOpaco),
)
controlPositivo(
  'el detector de «sin costura en la frontera» la vería si hubiera un opaco entre las dos',
  conOpacoEntreMedio,
  (recorrido) => !bordesDeRevelado(docApilado, recorrido, ATRIBUTO_DEL_PANEL).some((b) => b.row === 540),
)
controlPositivo(
  'y una transparente a la que le falta el vecino en el DOM no fabrica la costura del vecino',
  { querySelector: (s: string) => (s.includes('="a"') ? { getBoundingClientRect: () => CAJAS.a } : null) },
  (doc: { querySelector: (s: string) => { getBoundingClientRect: () => { top: number; bottom: number } } | null }) =>
    bordesDeRevelado(doc, conOpacoEntreMedio, ATRIBUTO_DEL_PANEL).some((b) => b.row === 1080),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LA RAMPA ESCALA CON EL VIEWPORT, no es un píxel copiado')

afirmarIgual(REVELADO_FRACCION, MARGEN_DE_REANUDACION, 'el ancho del ablandado es el MISMO octavo que la reanudación (0,125)')
const m720 = maskDeRevelado([{ row: 300, tipo: 'entra' }], 720, 720 * REVELADO_FRACCION)
const m1080 = maskDeRevelado([{ row: 300, tipo: 'entra' }], 1080, 1080 * REVELADO_FRACCION)
afirmar(
  m720 !== null && m720.includes(`#000 ${300 + 720 * REVELADO_FRACCION}px`),
  'a 720 de alto la rampa mide 90px; a 1080, 135px — la fracción por el viewport',
  `720→${720 * REVELADO_FRACCION}px · 1080→${1080 * REVELADO_FRACCION}px`,
)
afirmar(m1080 !== null && m720 !== null && m1080 !== m720, '  y las dos máscaras difieren: la rampa no es un número fijo')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · POSE-SAFE Y CABLEADO — cambia CÓMO se revela, no la pose ni el progreso')

const FUENTE_REVELADO = leer('src/app/v3/_lib/escena/revelado.ts')
/**
 * ⚠️ **EL FUENTE DE LA ESCENA SON DOS ARCHIVOS DESDE B5.** `EscenaDelHome.tsx`
 * estaba en 300 líneas exactas —el límite del repo— y B5 tenía que agregarle la
 * fuente de eventos del puntero, así que el hook `useEscenaAtadaAlScroll` se
 * mudó entero a `ataduraAlScroll.ts`, verbatim. El cableado del revelado viajó
 * con él, porque sale de la misma lectura de scroll.
 *
 * Se concatenan: lo que esta sección afirma —que el revelado esté importado,
 * gateado por la misma retención que la pose, y DESPUÉS de fijar el progreso—
 * es una propiedad del módulo de la escena, no del archivo donde hoy vive.
 */
const FUENTE_ESCENA = [
  leer('src/app/v3/_lib/escena/EscenaDelHome.tsx'),
  leer('src/app/v3/_lib/escena/ataduraAlScroll.ts'),
].join('\n')

for (const [prohibido, motivo] of [
  ["from 'three'", 'no importa `three`: no monta ni toca el árbol 3D'],
  ['@react-three', 'no importa r3f/drei'],
  ["from './recorrido'", 'no importa el mapeo del recorrido: no traduce scroll a progreso'],
  ["from './anclaje'", 'no importa el anclaje'],
  ['.set(', 'no escribe en ningún store (ni progress ni pose)'],
] as const) {
  afirmar(!FUENTE_REVELADO.includes(prohibido), `revelado.ts ${motivo}`)
}
afirmar(FUENTE_REVELADO.includes("mask-image"), 'lo único que escribe es `mask-image` — presentación, no estado')

afirmar(FUENTE_ESCENA.includes("import { aplicarRevelado } from './revelado'"), 'EscenaDelHome importa `aplicarRevelado`')
afirmar(
  FUENTE_ESCENA.includes('aplicarRevelado(reveladoRef.current, ventana, !quieta && enCuadro)'),
  'y lo llama GATEADO: sólo con la escena en cuadro y el intro sin retener — la MISMA retención que la pose',
)
// El revelado va DESPUÉS de escribir el progreso: no puede alterarlo.
const posProgreso = FUENTE_ESCENA.indexOf("rig.set('progress'")
const posRevelado = FUENTE_ESCENA.indexOf('aplicarRevelado(')
afirmar(posProgreso >= 0 && posRevelado > posProgreso, 'el revelado corre DESPUÉS de fijar el progreso, en la misma lectura de scroll')
controlPositivo(
  'el detector de imports prohibidos NO está ciego: vería un import de three',
  "import * as THREE from 'three'\n",
  (fuente: string) => !fuente.includes("from 'three'"),
)

cerrar('s17-revelado')
