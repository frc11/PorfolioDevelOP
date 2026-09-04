/**
 * INVARIANTE TRANSVERSAL — el ritmo del lane A: pantallas y momentos reales.
 *
 * Corre con `npm run test:s5-ritmo`.
 *
 * ── Regla 11, aplicada ────────────────────────────────────────────────────
 *
 * *Una cifra que se publica en un reporte y no tiene instrumento que la
 * produzca es prosa, no medición.* "Nuestro lane tiene N momentos" es
 * exactamente esa clase de cifra: si más adelante hay que compararla, no se
 * puede; si hay que defenderla, tampoco. Este archivo es el instrumento, y la
 * cuenta lee la MISMA tabla que le da el alto a cada panel.
 *
 * ── El control externo ────────────────────────────────────────────────────
 *
 * La fórmula reproduce los 20,5 momentos que SCROLL.md §6 publicó para la home
 * de la referencia a partir de sus tres entradas medidas. Si no los
 * reprodujera, no estaría calculando lo que dice calcular — y la comparación
 * entre nuestro número y el suyo no significaría nada.
 *
 * ── Lo que este invariante NO afirma, y por qué ───────────────────────────
 *
 * El ritmo de las OCHO secciones. Cuatro son del lane de S6 y sus alturas son
 * las que dejó el esqueleto: afirmar ese total sería poner un check a fallar
 * por algo que este sprint no produce ni puede arreglar, que es la regla 13.
 * Se publica con atribución y no se afirma.
 */

import { compresionDe, momentosDe, ritmoDe, RITMO_DE_LA_REFERENCIA } from '../../_secciones/_contrato/ritmo'
import { pantallasDe } from '../../_secciones/_contrato/forma'
import { SECCIONES, seccionPorId } from '../secciones'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { IDS_DE_S5 } from './s5-modulos'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La fórmula reproduce el número de la referencia')

const { pantallas: pRef, pantallasPinneadas: pinRef, secuencias: secRef, momentos: momRef } =
  RITMO_DE_LA_REFERENCIA

afirmarIgual(
  momentosDe(pRef, pinRef, secRef),
  momRef,
  `momentos = pantallas − pinneadas + secuencias reproduce los ${momRef} de la home medida (${pRef} − ${pinRef} + ${secRef})`,
)

controlPositivo(
  'la fórmula NO es la identidad: sin pinneo el número cambia',
  { pantallas: pRef, pinneadas: 0, secuencias: 0 },
  (c: { pantallas: number; pinneadas: number; secuencias: number }) =>
    momentosDe(c.pantallas, c.pinneadas, c.secuencias) === momRef,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Las cuatro secciones del lane, una por una')

const DEL_LANE = IDS_DE_S5.map((id) => seccionPorId(id))

const ESPERADO: readonly { id: string; pantallas: number; pinneada: string }[] = [
  { id: 'hero', pantallas: 1, pinneada: 'no' },
  { id: 'quienes-somos', pantallas: 3, pinneada: 'no' },
  { id: 'numeros', pantallas: 4, pinneada: 'no' },
  { id: 'trabajos', pantallas: 3, pinneada: 'desde-escritorio' },
]

afirmarIgual(
  DEL_LANE.map((s) => ({ id: s.id, pantallas: pantallasDe(s), pinneada: s.pinneada ?? 'no' })),
  ESPERADO,
  'cada sección ocupa lo que el sprint le asignó, leído de `secciones.ts`',
)

controlPositivo(
  'el comparador ve un alto cambiado',
  DEL_LANE.map((s) => (s.id === 'numeros' ? { ...s, alto: '200svh' } : s)),
  (lista) =>
    JSON.stringify(
      lista.map((s) => ({ id: s.id, pantallas: pantallasDe(s), pinneada: s.pinneada ?? 'no' })),
    ) === JSON.stringify(ESPERADO),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El ritmo del lane — la cifra que se publica')

const ritmo = ritmoDe(DEL_LANE)

/**
 * ⚠ LA CUENTA CAMBIÓ DE DEFINICIÓN EN SITIO-S7, y estos números son la
 * corrección, no un ajuste.
 *
 * Este lane contaba la sección pinneada ENTERA (3 de 3); el otro contaba el
 * recorrido del pin (2 de 3). Ganó el del otro **porque es el que la referencia
 * midió**: `rangoPegado = alto del contenedor − alto del elemento pegado`
 * (SCROLL.md §4). El porqué entero está en `_contrato/ritmo.ts`.
 *
 * Consecuencia: el ritmo de estas cuatro pasa de 5 a 6 momentos. No es que el
 * tramo haya cambiado — es que una de las dos cuentas estaba mal.
 */
afirmarIgual(ritmo.pantallas, 11, 'pantallas nominales del tramo')
afirmarIgual(ritmo.pantallasPinneadas, 2, 'de las cuales pinneadas: las que consume el pin de Trabajos')
afirmarIgual(ritmo.secuencias, 1, 'una secuencia pinneada — Trabajos')
afirmarIgual(ritmo.momentos, 10, 'MOMENTOS REALES de las cuatro primeras')

const compresion = compresionDe(ritmo)
const compresionDeLaReferencia = compresionDe({
  pantallas: pRef,
  pantallasPinneadas: pinRef,
  secuencias: secRef,
  momentos: momRef,
})
console.log(
  `  compresión: ${compresion} momentos por pantalla — la home de la referencia comprime a ${compresionDeLaReferencia}`,
)
console.log(
  `  o sea: este tramo se lee como ${ritmo.momentos} cosas en ${ritmo.pantallas} pantallas de scroll.`,
)
afirmar(
  compresion < 1,
  'el lane comprime: hay menos momentos que pantallas, que es lo que aporta la secuencia pinneada',
  `${compresion} < 1`,
)

controlPositivo(
  'la compresión NO se cumple sola: un tramo sin pinneo no comprime',
  ritmoDe(DEL_LANE.map((s) => ({ ...s, pinneada: undefined }))),
  (r) => compresionDe(r) < 1,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El sitio entero — PUBLICADO, no afirmado (regla 13)')

/**
 * Cuatro de las ocho son del lane de S6 y sus alturas son las que dejó el
 * esqueleto de S1. Afirmar este total sería poner un check a fallar por algo
 * que este sprint no produce ni puede arreglar. Se publica con atribución.
 */
const ritmoDelSitio = ritmoDe(SECCIONES)
console.log(
  `  las OCHO hoy: ${ritmoDelSitio.pantallas} pantallas · ${ritmoDelSitio.pantallasPinneadas} pinneadas · ` +
    `${ritmoDelSitio.secuencias} secuencias → ${ritmoDelSitio.momentos} momentos`,
)
console.log(
  `  DE QUIÉN ES: 1 a 4 son de este lane (SITIO-S5). 5 a 8 conservan el alto del esqueleto de S1`,
)
console.log(
  `  y las escribe SITIO-S6. El total NO se afirma acá: cambiaría por trabajo ajeno.`,
)
console.log(`  la referencia, para comparar: ${pRef} pantallas → ${momRef} momentos.`)

afirmar(
  ritmoDelSitio.pantallas > ritmo.pantallas,
  'y el total contiene al lane: la cuenta de las ocho es mayor que la de las cuatro',
  `${ritmoDelSitio.pantallas} > ${ritmo.pantallas}`,
)

cerrar('s5-ritmo.invariant')
