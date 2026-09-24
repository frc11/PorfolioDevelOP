/**
 * s24 · EL DÍA DEL FINAL — la noche se apaga escondida detrás de Servicios y Tu panel. **[FINAL 2]**
 *
 * La compuerta (`nocheDisparada.ts`) es una función de la geometría del bloque opaco, así que
 * se prueba sobre un recorrido simulado de a un píxel, en los dos sentidos y con saltos: el
 * documento es Trabajos (con demos), Servicios, Tu panel y «Por qué develOP», y el cuadro se
 * mueve sobre él. La gota se representa por lo único que deja: la cantidad de noche.
 *
 * Cada afirmación lleva su control positivo: una compuerta equivocada que el chequeo tiene que
 * ver.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { cruceDelTramo, gestoDelCruce } from '../../../_secciones/trabajos/gota'
import {
  DIA_DEL_FINAL,
  NOCHE_DISPARADA,
  bloqueTapaElCuadro,
  diaDelFinalEn,
  nocheEfectiva,
  nocheQueSeRepone,
  type BloqueOpaco,
} from '../nocheDisparada'

/** Un documento: Trabajos arriba (con demos al pie), después el bloque, después «Por qué develOP». */
interface Documento {
  readonly alto: number
  readonly trabajos: number
  readonly servicios: number
  readonly tuPanel: number
}
/** Tres documentos: escritorio (los altos declarados), 375 y 768 (altos de contenido medidos en el orden de magnitud). */
const DOCUMENTOS: readonly (readonly [string, Documento])[] = [
  ['1440×900', { alto: 900, trabajos: 7200, servicios: 2700, tuPanel: 1800 }],
  ['768×1024', { alto: 1024, trabajos: 6800, servicios: 2600, tuPanel: 2300 }],
  ['375×812', { alto: 812, trabajos: 6400, servicios: 3100, tuPanel: 2900 }],
]

/** El bloque visto desde un scroll `y` (en coordenadas del cuadro). */
const bloqueEn = (d: Documento, y: number): BloqueOpaco => {
  const s0 = d.trabajos - y
  const t0 = s0 + d.servicios
  return { servicios: { tope: s0, pie: t0 }, tuPanel: { tope: t0, pie: t0 + d.tuPanel }, alto: d.alto }
}
/** Demos está en cuadro: el pie de Trabajos se ve. */
const demosSeVe = (b: BloqueOpaco): boolean => b.servicios.tope > 0
/** La escena se ve debajo del panel: «Por qué develOP» asoma. */
const finalSeVe = (b: BloqueOpaco): boolean => b.tuPanel.pie < b.alto
/** De demos entero en cuadro a «Por qué develOP» entero en cuadro. */
const tramo = (d: Documento): readonly [number, number] => [d.trabajos - d.alto, d.trabajos + d.servicios + d.tuPanel]

type Compuerta = (b: BloqueOpaco) => boolean

/** Corre el recorrido cuadro a cuadro con la regla real (compuerta + reposición) y devuelve la noche que ve cada cuadro. */
function recorrer(d: Documento, ys: readonly number[], cantidadInicial: number, compuerta: Compuerta = diaDelFinalEn, repone = true): { y: number; b: BloqueOpaco; noche: number }[] {
  NOCHE_DISPARADA.cantidad = cantidadInicial
  return ys.map((y) => {
    const b = bloqueEn(d, y)
    DIA_DEL_FINAL.activo = compuerta(b)
    const r = repone ? nocheQueSeRepone(b, NOCHE_DISPARADA.cantidad) : null
    if (r !== null) NOCHE_DISPARADA.cantidad = r
    return { y, b, noche: nocheEfectiva() }
  })
}
const bajando = (d: Documento): number[] => {
  const [a, z] = tramo(d)
  return Array.from({ length: z - a + 1 }, (_, i) => a + i)
}
const subiendo = (d: Documento): number[] => bajando(d).reverse()

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El cambio sólo ocurre con el bloque tapando el cuadro entero')

/** Cada cambio de la compuerta entre dos cuadros seguidos, con el bloque tapando los dos. */
const cambiosTapados = (d: Documento, ys: readonly number[], compuerta: Compuerta): { cambios: number; todosTapados: boolean } => {
  let cambios = 0
  let todosTapados = true
  for (let i = 1; i < ys.length; i += 1) {
    const [a, b] = [bloqueEn(d, ys[i - 1]), bloqueEn(d, ys[i])]
    if (compuerta(a) !== compuerta(b)) {
      cambios += 1
      if (!bloqueTapaElCuadro(a) || !bloqueTapaElCuadro(b)) todosTapados = false
    }
  }
  return { cambios, todosTapados }
}
for (const [nombre, d] of DOCUMENTOS) {
  const ida = cambiosTapados(d, bajando(d), diaDelFinalEn)
  const vuelta = cambiosTapados(d, subiendo(d), diaDelFinalEn)
  afirmar(ida.cambios === 1 && vuelta.cambios === 1 && ida.todosTapados && vuelta.todosTapados, `${nombre}: un solo cambio bajando y uno subiendo, los dos con el bloque tapando el cuadro`, `ida ${String(ida.cambios)} · vuelta ${String(vuelta.cambios)}`)
}
afirmar(DOCUMENTOS.every(([, d]) => d.servicios + d.tuPanel > 2 * d.alto), '  en los tres anchos el bloque mide más de dos cuadros: el medio cae lejos de los dos bordes')
/** La compuerta ingenua: de día apenas el bloque arranca a tapar. Cambia con Trabajos todavía en cuadro. */
const EN_EL_BORDE: Compuerta = (b) => b.servicios.tope <= 0
controlPositivo('  el chequeo vería una compuerta que cambia en el borde del bloque', EN_EL_BORDE, (c: Compuerta) => cambiosTapados(DOCUMENTOS[0][1], bajando(DOCUMENTOS[0][1]), c).todosTapados)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Bajando: en el primer cuadro en que la escena se ve bajo el panel, la noche vale 0')

const primeraNocheAlAsomar = (d: Documento, compuerta: Compuerta = diaDelFinalEn): number => {
  const cuadros = recorrer(d, bajando(d), 1, compuerta)
  const primero = cuadros.find((c) => finalSeVe(c.b))
  return primero === undefined ? Number.NaN : primero.noche
}
for (const [nombre, d] of DOCUMENTOS) {
  afirmarIgual(primeraNocheAlAsomar(d), 0, `${nombre}: la gota dejó la noche en 1 y aun así, al asomar «Por qué develOP», la sala ve 0`)
}
/** Una compuerta un cuadro tarde: se apaga cuando la sección ya asomó un píxel. */
const TARDE: Compuerta = (b) => b.tuPanel.pie < b.alto - 1
controlPositivo('  el chequeo vería una compuerta que se apaga un cuadro tarde', TARDE, (c: Compuerta) => primeraNocheAlAsomar(DOCUMENTOS[0][1], c) === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Mientras demos se ve, bajando o subiendo, la noche vale 1')

const nocheEnDemos = (cuadros: readonly { b: BloqueOpaco; noche: number }[]): number[] => [...new Set(cuadros.filter((c) => demosSeVe(c.b)).map((c) => c.noche))]
for (const [nombre, d] of DOCUMENTOS) {
  afirmarIgual(nocheEnDemos(recorrer(d, bajando(d), 1)), [1], `${nombre}: bajando, demos se ve de noche en todos sus cuadros`)
  // Subiendo desde el final con la noche puesta (se pasó por la gota).
  afirmarIgual(nocheEnDemos(recorrer(d, subiendo(d), 1)), [1], `${nombre}: subiendo, demos vuelve de noche`)
}
// El salto que pasó por encima de la gota (Fin desde arriba): la noche quedó en 0 y se sube desde el final.
const SALTADO = DOCUMENTOS[0][1]
afirmarIgual(nocheEnDemos(recorrer(SALTADO, subiendo(SALTADO), 0)), [1], '  y subiendo después de un salto que nunca pasó por la gota: la noche se repone tapada, antes de que demos asome')
controlPositivo('  el chequeo vería el mismo recorrido sin la reposición: demos de día', false, (repone: boolean) => nocheEnDemos(recorrer(SALTADO, subiendo(SALTADO), 0, diaDelFinalEn, repone)).join() === '1')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La banda del barrido no se pinta en esta frontera')

// La frontera de abajo de Trabajos: el tramo sale por arriba bajando y vuelve a entrar por arriba subiendo.
const SALE_BAJANDO = cruceDelTramo({ cruza: false, tope: -7200, pie: -4 })
const ENTRA_SUBIENDO = cruceDelTramo({ cruza: true, tope: -7196, pie: 4 })
afirmarIgual([SALE_BAJANDO, ENTRA_SUBIENDO], ['abajo-bajando', 'abajo-subiendo'], 'los dos cruces de la frontera con Servicios son las dos entradas «por abajo» de la gota')
afirmarIgual([gestoDelCruce(SALE_BAJANDO), gestoDelCruce(ENTRA_SUBIENDO)], ['nada', 'nada'], '  y ninguna corre la banda: el barrido vive sólo en la frontera con Quiénes somos')
controlPositivo('  el chequeo vería la entrada que sí la corre (la de arriba, bajando)', cruceDelTramo({ cruza: true, tope: 300, pie: 7500 }), (e: ReturnType<typeof cruceDelTramo>) => gestoDelCruce(e) === 'nada')
afirmar(!/banda|mask|visibility|style/.test(diaDelFinalEn.toString() + nocheQueSeRepone.toString()), '  y la compuerta no toca la capa: sólo decide un booleano y, tapada, una cantidad')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Los saltos de scroll (Fin, Inicio, el menú) caen del lado correcto')

/** Un salto: dos cuadros, sin nada en el medio. Devuelve la noche del cuadro de llegada. */
const saltar = (d: Documento, desde: number, hasta: number, cantidad: number, compuerta: Compuerta = diaDelFinalEn): number => recorrer(d, [desde, hasta], cantidad, compuerta)[1].noche
const D = DOCUMENTOS[0][1]
const EN_DEMOS = D.trabajos - D.alto
const AL_FINAL = D.trabajos + D.servicios + D.tuPanel + 4 * D.alto
const EN_SERVICIOS = D.trabajos
const ARRIBA = 0
afirmarIgual(saltar(D, EN_DEMOS, AL_FINAL, 1), 0, 'Fin desde demos: el primer cuadro del final ya es de día')
afirmarIgual(saltar(D, AL_FINAL, EN_DEMOS, 1), 1, 'el menú a Trabajos desde el final: demos, de noche')
afirmar(saltar(D, AL_FINAL, ARRIBA, 1) === 1 && !DIA_DEL_FINAL.activo, 'Inicio desde el final: arriba del bloque la compuerta no rige y la noche es la que dejó la gota (lo de arriba es de ella)')
afirmar(saltar(D, AL_FINAL, EN_SERVICIOS, 0) === 1 && !DIA_DEL_FINAL.activo, 'el menú a Servicios desde el final: tapado y del lado de arriba, la noche repuesta para cuando se suba a demos')
/** La compuerta con memoria: cambia sólo al pasar por un cuadro tapado. Un salto la deja del lado viejo. */
const conMemoria = (): Compuerta => {
  let estado = false
  return (b) => {
    if (bloqueTapaElCuadro(b)) estado = diaDelFinalEn(b)
    return estado
  }
}
controlPositivo('  el chequeo vería una compuerta con memoria, que un salto de demos al final deja de noche', conMemoria(), (c: Compuerta) => saltar(D, EN_DEMOS, AL_FINAL, 1, c) === 0)

NOCHE_DISPARADA.cantidad = 0
DIA_DEL_FINAL.activo = false
cerrar('s24-dia.invariant')
