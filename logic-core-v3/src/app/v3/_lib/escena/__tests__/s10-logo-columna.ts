/**
 * LA PALANCA DE LAYOUT DEL DEFECTO 7, MEDIDA — y el resultado es que NO ALCANZA.
 *
 * ⚠ **ESTE MÓDULO EXISTE PORQUE SITIO-S12 FUE A EJECUTAR UNA DECISIÓN Y LA
 * MEDICIÓN LA CONTRADIJO.** §7.43 de `DIRECCION-ESCENA.md` cerró el defecto 7
 * con una salida de LAYOUT —*«la columna de texto del diferencial se acota a la
 * IZQUIERDA, fuera de la silueta del logo»*— y con una premisa: *«es lo que el
 * Hero ya hace, y es exactamente por eso que el Hero tiene superposición mínima
 * 0% y el diferencial no»*.
 *
 * **Las dos mitades se midieron con el instrumento que la propia instrucción
 * nombra como confirmación (`test:s10-logo` §4), y las dos fallan:**
 *
 *   1. **La premisa no se reproduce.** Las dos columnas terminan casi en el
 *      mismo lugar —el `h1` del Hero en +0,27 a 1440 y el `h2` del diferencial
 *      en +0,31— y la del Hero **empieza más a la DERECHA** (188 px contra 32),
 *      porque el Hero lleva la columna lateral de 140 px del rótulo. Si alguna
 *      de las dos está «acotada a la izquierda» es la del diferencial. Lo que
 *      separa a las dos secciones **no es la columna: es el logo** — en el Hero
 *      ocupa el 8,7% del cuadro y vive a la derecha, y en `demos` ocupa el 35,7%
 *      y su banda cruza el cuadro de lado a lado.
 *   2. **La salida no llega a cero, y en dos de los cuatro cuadros EMPEORA.**
 *      Más angosta la hace más ALTA —`lineasDeTexto` recuenta con los avances
 *      reales del `.woff2`— y una caja más alta se queda sin altura de pantalla
 *      donde escapar (`barridoVertical`: `recorrido = max(0, 2 − alto)`). A 200
 *      px el titular pasa de 4 a 14 líneas y la mínima a 1025×844 sube de **16%
 *      a 39%**.
 *
 * ── Por qué es una MEDICIÓN y no una opinión, y qué NO dice ────────────────
 *
 * El barrido es exhaustivo sobre las dos únicas variables que el layout puede
 * mover —dónde empieza la columna y cuánto mide— y el resultado tiene su causa
 * geométrica al lado: a p=0,750 el logo deja **64 px libres a la izquierda y 197
 * a la derecha** en el cuadro de 1025×900, y con 165 px el titular corta en 19
 * líneas, o sea 916 px de alto contra un cuadro de 900.
 *
 * No dice que el defecto 7 no tenga arreglo: dice que **la palanca que §7.43
 * eligió no lo cierra**, y deja el número para que la decisión se vuelva a tomar
 * con él. Las tres que sí podrían llegar a cero salen del alcance que este
 * sprint tiene prohibido —bajar el nivel tipográfico del `h2`, acortar el
 * `TITULAR` de `contenido.ts`, o mover la sección en el progreso, que es el
 * anclaje entero de SITIO-S9— y por eso se nombran acá y no se aplican.
 */

import { afirmar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { anchoDeContenido, tokenPx } from '../../__tests__/s10-css'
import { lineasDeTexto } from '../../__tests__/s10-avance'
import { leerAvancesDe } from '../../__tests__/s10-woff2'
import { aCuadroAlto, aCuadroX } from './s10-logo-cajas'
import { VENTANAS, barridoVertical, cajaDelLogo, mayorCaja, muestra } from './s10-logo-lectura'

/** El progreso donde el diferencial llena el cuadro. Es el que §4 mide. */
export const PROGRESO_DEL_DIFERENCIAL = 0.75
const ID = 'por-que-develop'

/** La caja de referencia: la mayor del diferencial, leída a 1025. */
const BASE = mayorCaja(ID, 1025)
const AVANCES = leerAvancesDe(BASE.fuente)

/** El padding lateral del `Envoltorio`, que es donde empieza la columna hoy. */
const IZQUIERDA_DE_HOY = BASE.banda.izquierda

/**
 * EL HUECO LIBRE DE LOGO a cada lado, en píxeles del viewport.
 *
 * Es la cota dura de la palanca: una columna que caiga entera adentro de uno de
 * los dos huecos da superposición 0 en TODA posición vertical, por construcción
 * —`superposicion` no encuentra una sola celda de logo en su banda—. Que ninguno
 * de los dos alcance para un titular legible es el resultado.
 */
export interface HuecoLibre {
  readonly cuadro: string
  readonly logoX0: number
  readonly logoX1: number
  readonly izquierdaPx: number
  readonly derechaPx: number
}

export function huecosLibres(): HuecoLibre[] {
  return VENTANAS.map((v) => {
    const caja = cajaDelLogo(muestra(PROGRESO_DEL_DIFERENCIAL, v.aspecto))
    if (caja === null) throw new Error(`sin caja de logo en ${v.etiqueta}`)
    return {
      cuadro: v.etiqueta,
      logoX0: caja.x0,
      logoX1: caja.x1,
      izquierdaPx: ((caja.x0 + 1) / 2) * v.ancho,
      derechaPx: v.ancho - ((caja.x1 + 1) / 2) * v.ancho,
    }
  })
}

export interface MedidaDeCuadro {
  readonly cuadro: string
  readonly anchoPx: number
  readonly lineas: number
  readonly minima: number
}

export interface Candidato {
  readonly etiqueta: string
  readonly porCuadro: readonly MedidaDeCuadro[]
  /** La peor de las cuatro mínimas. Es lo que hay que llevar a 0. */
  readonly peor: number
}

/**
 * La superposición mínima de una columna `(izquierda, ancho)` en un cuadro.
 *
 * Repite exactamente la aritmética de `tablaDeSuperposicion` —misma muestra,
 * mismo barrido vertical, mismo recuento de líneas— con la banda como entrada en
 * vez de leerla del marcado. Es lo que permite preguntar «¿y si la columna
 * midiera otra cosa?» sin tocar el producto.
 */
export function minimaDeColumna(izquierdaPx: number, anchoPx: number, indiceDeVentana: number): MedidaDeCuadro {
  const v = VENTANAS[indiceDeVentana]
  const lineas = lineasDeTexto(AVANCES, BASE.texto, anchoPx, BASE.tamanoPx, BASE.interletradoEm)
  const alto = aCuadroAlto(lineas * BASE.tamanoPx * BASE.interlineado, v.alto)
  const b = barridoVertical(
    muestra(PROGRESO_DEL_DIFERENCIAL, v.aspecto),
    aCuadroX(izquierdaPx, v.ancho),
    aCuadroX(izquierdaPx + anchoPx, v.ancho),
    alto,
    200,
  )
  return { cuadro: v.etiqueta, anchoPx, lineas, minima: b.minima }
}

function candidato(etiqueta: string, ancho: (indice: number) => number, izquierda = IZQUIERDA_DE_HOY): Candidato {
  const porCuadro = VENTANAS.map((_, i) => minimaDeColumna(izquierda, ancho(i), i))
  return { etiqueta, porCuadro, peor: Math.max(...porCuadro.map((m) => m.minima)) }
}

/**
 * LOS PARES `(columnas, col-span)` DE LA `Grilla`, que es la ÚNICA forma en la
 * que este layout puede acotar la columna y el instrumento leerla sola.
 *
 * `s10-logo-cajas.ts` modela `grid-cols-N`, `col-span-N`, `gap-[var(--token)]`,
 * los tres `p[xlr]-[var(--token)]` y `max-w-tope`. **No modela `max-w-[…]`**, que
 * es justamente el patrón que un implementador copiaría de `Trabajos.tsx` — con
 * él el cambio no se vería y la tabla saldría igual que hoy.
 *
 * El primero es el de HOY (`columnas={3}` + `tablet:col-span-2`), para que la
 * comparación no dependa de un número escrito al lado.
 */
export const PARES_DE_GRILLA: readonly (readonly [number, number])[] = [
  [3, 2],
  [4, 3],
  [5, 3],
  [5, 4],
  [7, 4],
  [7, 5],
  [8, 5],
  [4, 2],
  [5, 2],
  [3, 1],
]

function anchoDeGrilla(columnas: number, span: number, indiceDeVentana: number): number {
  const v = VENTANAS[indiceDeVentana]
  const util = anchoDeContenido(v.ancho)
  const canal = tokenPx('--grilla-canal-amplio', v.ancho)
  const columna = (util - canal * (columnas - 1)) / columnas
  return span * columna + canal * (span - 1)
}

export function candidatosDeGrilla(): Candidato[] {
  return PARES_DE_GRILLA.map(([columnas, span]) =>
    candidato(`columnas=${columnas} col-span-${span}`, (i) => anchoDeGrilla(columnas, span, i)),
  )
}

/** Las izquierdas y los anchos del barrido exhaustivo, en píxeles. */
const IZQUIERDAS: readonly number[] = [32, 100, 200, 300, 400, 500, 600, 700, 800, 830, 900]
// prettier-ignore
const ANCHOS: readonly number[] = [635, 560, 480, 420, 360, 300, 240, 200, 165, 120, 80]

export interface BandaBarrida {
  readonly izquierdaPx: number
  readonly anchoPx: number
  readonly peor: number
  readonly porCuadro: readonly number[]
}

/**
 * EL BARRIDO EXHAUSTIVO sobre las dos únicas variables del layout: **dónde
 * empieza la columna y cuánto mide.**
 *
 * Descarta las bandas que no entran en un cuadro —una columna que se sale del
 * `Envoltorio` no es una composición— y devuelve las que quedan ordenadas por su
 * PEOR cuadro, que es lo que la instrucción pide llevar a cero.
 */
export function barridoDeBandas(): BandaBarrida[] {
  const salida: BandaBarrida[] = []
  for (const izquierdaPx of IZQUIERDAS) {
    for (const anchoPx of ANCHOS) {
      if (VENTANAS.some((v) => izquierdaPx + anchoPx > v.ancho - IZQUIERDA_DE_HOY)) continue
      const porCuadro = VENTANAS.map((_, i) => minimaDeColumna(izquierdaPx, anchoPx, i).minima)
      salida.push({ izquierdaPx, anchoPx, peor: Math.max(...porCuadro), porCuadro })
    }
  }
  return salida.sort((a, b) => a.peor - b.peor)
}

/** La composición de HOY, medida por el mismo camino que los candidatos. */
export function composicionDeHoy(): Candidato {
  return candidato('HOY — columnas=3 col-span-2', (i) => mayorCaja(ID, VENTANAS[i].ancho).banda.ancho)
}

const pct = (v: number): string => `${(v * 100).toFixed(0)}%`
export function tablaDeCandidatos(): string[] {
  const lineas = ['  forma de la columna          ' + VENTANAS.map((v) => v.etiqueta.padEnd(14)).join('')]
  for (const c of [composicionDeHoy(), ...candidatosDeGrilla().slice(1)]) {
    lineas.push(
      `  ${c.etiqueta.padEnd(28)}` +
        c.porCuadro.map((m) => `${m.anchoPx.toFixed(0)}px/${m.lineas}l/${pct(m.minima)}`.padEnd(14)).join('') +
        `  peor ${pct(c.peor)}`,
    )
  }
  return lineas
}
export function tablaDeHuecos(): string[] {
  return huecosLibres().map(
    (h) =>
      `  ${h.cuadro.padEnd(10)} el logo ocupa x ${h.logoX0.toFixed(3)} … ${h.logoX1.toFixed(3)} → libre a la IZQUIERDA ` +
      `${h.izquierdaPx.toFixed(0)} px · a la DERECHA ${h.derechaPx.toFixed(0)} px`,
  )
}

/**
 * §9 DEL INVARIANTE DEL LOGO — el barrido, con su control y su guardián.
 *
 * ⚠ **La afirmación central está en verde y afirma un HECHO ROJO**, que es la
 * forma que este repo ya usa para una decisión que todavía no se tomó (§7.42, el
 * recorte del Hero): el día que alguien cierre el defecto 7, `MEJOR.peor > 0`
 * se pone en rojo y ahí hay que escribir con qué palanca se cerró.
 */
export function afirmarLaPalancaDeLayout(): void {
  titulo('9 · LA PALANCA DE LAYOUT DE §7.43, MEDIDA — y NO alcanza')

  /**
   * ⚠ **SITIO-S12 FUE A EJECUTAR LA DECISIÓN DE §7.43 Y LA MEDICIÓN LA
   * CONTRADIJO.** La decisión era de LAYOUT —acotar la columna del diferencial a
   * la izquierda— y su confirmación, según la propia instrucción, era que la
   * superposición del §4 **cayera a 0 en los cuatro cuadros**. Esta sección es esa
   * confirmación, corrida ANTES de tocar el producto, y da que no cae.
   *
   * El barrido es exhaustivo sobre las dos únicas variables que el layout puede
   * mover —dónde empieza la columna y cuánto mide— así que el resultado no es «no
   * encontré una»: es que **no existe**, sobre la rejilla probada, con la causa
   * geométrica publicada al lado.
   */
  console.log('  EL HUECO LIBRE DE LOGO, que es la cota dura de la palanca:')
  for (const linea of tablaDeHuecos()) console.log(linea)
  console.log('  LAS FORMAS DE LA COLUMNA que la `Grilla` puede emitir, y que este instrumento lee solas:')
  for (const linea of tablaDeCandidatos()) console.log(linea)

  const BANDAS = barridoDeBandas()
  const MEJOR = BANDAS[0]
  const HOY = composicionDeHoy()
  console.log(
    `  el barrido exhaustivo probó ${BANDAS.length} bandas \`(izquierda, ancho)\` y la MEJOR deja ` +
      `${(MEJOR.peor * 100).toFixed(1)}% en su peor cuadro\n` +
      `  (izquierda ${MEJOR.izquierdaPx}px · ancho ${MEJOR.anchoPx}px · ${MEJOR.porCuadro.map((m) => `${(m * 100).toFixed(0)}%`).join(' / ')}), ` +
      `contra el ${(HOY.peor * 100).toFixed(1)}% de hoy.`,
  )
  afirmar(
    MEJOR.peor > 0,
    '🔴 NINGUNA banda horizontal lleva la superposición a 0 en los cuatro cuadros: la palanca de LAYOUT de §7.43 no cierra el defecto 7',
    `la mejor de ${BANDAS.length} deja ${(MEJOR.peor * 100).toFixed(1)}%, y el hueco libre más grande a 1025×900 mide 197 px`,
  )
  controlPositivo(
    'el barrido SÍ sabe encontrar un cero: una banda metida entera en el hueco libre da 0 en toda posición vertical',
    0,
    (i: number) => minimaDeColumna(0, 30, i).minima > 0,
  )
  afirmar(
    candidatosDeGrilla().every((c) => c.peor > 0),
    '  y tampoco lo cierra ninguna de las formas que la `Grilla` puede emitir',
    candidatosDeGrilla()
      .map((c) => `${c.etiqueta} → ${(c.peor * 100).toFixed(0)}%`)
      .join(' · '),
  )
  /**
   * ⚠ **LA PREMISA DE §7.43 NO SE REPRODUCE, y va afirmada porque es la que
   * sostenía la decisión.** *«Es lo que el Hero ya hace»* — no lo es: la columna
   * del Hero **empieza más a la derecha** que la del diferencial, porque lleva la
   * columna lateral de 140 px del rótulo. Lo que separa a las dos secciones no es
   * la columna: es cuánto cuadro ocupa el logo y dónde cae su banda.
   */
  const CAJA_DEL_HERO = mayorCaja('hero', 1440)
  const CAJA_DEL_DIFERENCIAL = mayorCaja('por-que-develop', 1440)
  afirmar(
    CAJA_DEL_HERO.banda.izquierda > CAJA_DEL_DIFERENCIAL.banda.izquierda,
    '  y la premisa de §7.43 —«es lo que el Hero ya hace»— tampoco: la columna del HERO empieza más a la DERECHA que la del diferencial',
    `hero ${CAJA_DEL_HERO.banda.izquierda}px contra diferencial ${CAJA_DEL_DIFERENCIAL.banda.izquierda}px, y las dos terminan casi igual ` +
      `(${aCuadroX(CAJA_DEL_HERO.banda.izquierda + CAJA_DEL_HERO.banda.ancho, 1440).toFixed(2)} contra ` +
      `${aCuadroX(CAJA_DEL_DIFERENCIAL.banda.izquierda + CAJA_DEL_DIFERENCIAL.banda.ancho, 1440).toFixed(2)})`,
  )
}
