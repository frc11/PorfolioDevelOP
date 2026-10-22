/**
 * [B1] EL MAPA DE PASOS DEL PORTFOLIO — puro: la altura de la sección, el paso en cada píxel, las anclas, el reloj de Demos y el
 * descuento que se le anota a la escena (plan: `docs/rediseno/SPRINT-B1-PORTFOLIO.md` §5.3; [B1.2b] §12, punto 5).
 *
 * Todo en **px de la regla** (contados contra un alto de 900, `ALTO_DE_VIEWPORT_DE_LA_REFERENCIA`) desde que arranca el progreso
 * de la sección (su tope en el pie del cuadro), como lo contaba el túnel. Y todo sale de UNA constante, `PANTALLAS_POR_PASO`: lo
 * que dura cada proyecto (y «la tuya»). Las funciones la reciben como parámetro para que s76 pruebe la derivación con otros
 * valores; la página usa la constante (las banderas de B1.2 salieron).
 *
 *   0 → 900                 la aproximación, igual que hoy
 *   900 → 900 + 4 pasos     el selector: un paso por proyecto (El Garage, Esquina Estudio, Banú Scents) y uno para «la tuya»
 *   → + 2.931               la cola de hoy, al píxel: la salida (1.131, el panel se retrae) y Demos (1.800)
 *
 * ── LA REGLA DE ALTURAS (la tabla no se toca) ─────────────────────────────
 *
 * `secciones.ts` sigue declarando 717svh + 40 de solape: 6.813 px, lo que la escena lee para sus nudos. El selector se le anota
 * como un tramo estirado (`TRAMO_ESTIRADO`, el mecanismo que usaba el túnel): la escena ve, en cada ancho, el medio que veía hoy
 * (`PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA`), y el selector mide `k` veces eso. Antes del pin y en la cola, el progreso de la escena es el
 * de hoy, bit a bit (s76).
 */

import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../../_lib/navegacion'

import { ARRANQUE_DEL_VACIO, LLEGADA_DE_LOS_DEMOS, PX_DEL_VACIO } from '../demos/relojDeDemos'

/**
 * [B1.2b] Las pantallas que dura cada proyecto: lo que ocupaban sus dos pasos de B1.2 (portada y ficha, 0,75 cada uno). Un solo
 * gatillo por proyecto; el resto de su scroll es permanencia. «La tuya» dura lo mismo.
 */
export const PANTALLAS_POR_PASO = 1.5

/** Tres proyectos y «la próxima es la tuya»: un paso cada uno. */
export const CANTIDAD_DE_PASOS = 4
export const PX_DE_LA_APROXIMACION = ALTO_DE_VIEWPORT_DE_LA_REFERENCIA

/**
 * La cola de hoy, al píxel: la salida (`PX_DE_LA_SALIDA`, 1.131: lo que tardaba el vacío en llevarse el túnel; ahora el panel se
 * retrae en ese tramo) y el espacio de Demos (dos pantallas, 1.800).
 */
export const PX_DE_LA_SALIDA = 1131
export const PX_DEL_ESPACIO_DE_DEMOS = 2 * ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
export const PX_DE_LA_COLA = PX_DE_LA_SALIDA + PX_DEL_ESPACIO_DE_DEMOS

/** El largo de la sección que la escena lee de la tabla (717svh + 40 de solape): no cambia. */
export const PX_DE_LA_SECCION_EN_LA_TABLA = 6813
/** Dónde arrancaba la salida en la sección de hoy: la cola se cuenta desde acá en el reloj de Demos. */
export const PX_DEL_ARRANQUE_DE_LA_SALIDA_DE_HOY = PX_DE_LA_SECCION_EN_LA_TABLA - PX_DE_LA_COLA

export type AnchoDelPortfolio = 'escritorio' | 'tablet' | 'movil'

/**
 * Lo que la escena veía HOY entre el pin y la salida (el cartel, el túnel y la espera), por ancho: 2.982 desde 1024 (el túnel
 * estirado ×1,8 lo descontaba), y abajo sin descontar, con el túnel estirado ×1,5 en tablet y ×2 en el teléfono:
 * 950 + 1.480 × e + 552. s76 lo compara contra la fórmula del túnel archivado (`_archivo/tunel-portfolio/`).
 */
export const PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA: Readonly<Record<AnchoDelPortfolio, number>> = {
  escritorio: 2982,
  tablet: 3722,
  movil: 4462,
}

export const pxDelPaso = (paso: number): number => paso * ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
export const pxDeLosPasos = (paso: number): number => CANTIDAD_DE_PASOS * pxDelPaso(paso)
export const pxDeLaSeccion = (paso: number): number => PX_DE_LA_APROXIMACION + pxDeLosPasos(paso) + PX_DE_LA_COLA
/** Dónde arranca la cola (el panel empieza a retraerse). */
export const pxDeLaSalida = (paso: number): number => PX_DE_LA_APROXIMACION + pxDeLosPasos(paso)

/** Las pantallas que la sección suma sobre el alto de la tabla (en todo ancho: la tabla y la cola son las mismas). */
export const pantallasExtra = (paso: number): number =>
  (pxDeLosPasos(paso) - PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA.escritorio) / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA

/** El factor del tramo anotado a la escena: lo que mide el selector sobre lo que la escena veía. Puede ser menor que 1. */
export const kDelAncho = (paso: number, ancho: AnchoDelPortfolio): number => pxDeLosPasos(paso) / PX_DEL_MEDIO_QUE_VEIA_LA_ESCENA[ancho]

/** El ancho que decidió el CSS (`--ancho-del-portfolio`: vacía desde 1024, `tablet` o `movil` abajo). La sección no mide el ancho. */
export function anchoDelValor(valor: string): AnchoDelPortfolio {
  const v = valor.trim()
  return v === 'tablet' || v === 'movil' ? v : 'escritorio'
}

// ─── Los pasos ────────────────────────────────────────────────────────────

/** −1 antes del pin (la aproximación), 0…3 los pasos (las tiras), 4 la cola (panel afuera). [B1.2e] Con el carrusel, −1, 0 y 4. */
export type IndiceDePaso = -1 | 0 | 1 | 2 | 3 | 4
export const ANTES_DEL_PIN = -1
export const EN_LA_COLA = CANTIDAD_DE_PASOS

function acotarPaso(n: number): IndiceDePaso {
  return Math.min(EN_LA_COLA, Math.max(ANTES_DEL_PIN, n)) as IndiceDePaso
}

/** El paso crudo de un píxel. */
export function pasoEn(px: number, paso: number): IndiceDePaso {
  if (px < PX_DE_LA_APROXIMACION) return ANTES_DEL_PIN
  return acotarPaso(Math.floor((px - PX_DE_LA_APROXIMACION) / pxDelPaso(paso)))
}

/** Los bordes de un paso, en px de la regla. */
export function bordesDelPaso(i: IndiceDePaso, paso: number): { readonly desde: number; readonly hasta: number } {
  if (i === ANTES_DEL_PIN) return { desde: Number.NEGATIVE_INFINITY, hasta: PX_DE_LA_APROXIMACION }
  if (i === EN_LA_COLA) return { desde: pxDeLaSalida(paso), hasta: Number.POSITIVE_INFINITY }
  const desde = PX_DE_LA_APROXIMACION + i * pxDelPaso(paso)
  return { desde, hasta: desde + pxDelPaso(paso) }
}

/** La histéresis de los gatillos: para dejar el paso de ahora hay que pasar su borde por esto. */
export const HISTERESIS_PX = 30

/** El paso con histéresis: el de ahora se queda mientras el píxel no pase su borde por `HISTERESIS_PX`. */
export function pasoConHisteresis(actual: IndiceDePaso, px: number, paso: number): IndiceDePaso {
  const crudo = pasoEn(px, paso)
  if (crudo === actual) return actual
  const { desde, hasta } = bordesDelPaso(actual, paso)
  if (px >= desde - HISTERESIS_PX && px < hasta + HISTERESIS_PX) return actual
  return crudo
}

/**
 * [B1.2d] Justo antes de donde aparece el Portfolio (A11, el clic afuera): debajo del pin, con un margen para el redondeo del scroll
 * (un píxel de la página puede ser más de uno de la regla). La histéresis lo deja afuera hasta que el scroll vuelva a pasar el pin.
 */
export const PX_JUSTO_ANTES_DEL_PIN = PX_DE_LA_APROXIMACION - 4

/** El centro de un paso, en px de la regla: adonde salta el selector. */
export const centroDelPaso = (i: number, paso: number): number => PX_DE_LA_APROXIMACION + (i + 0.5) * pxDelPaso(paso)

/**
 * El scroll de la página (px) para un píxel de la regla: el progreso arranca con el tope del panel (en el layout) en el pie del
 * cuadro, y la regla escala con el alto de la ventana.
 */
export const scrollDelPx = (px: number, topeDelPanel: number, alto: number): number =>
  topeDelPanel - alto + (px * alto) / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA

export const pxDelScroll = (scroll: number, topeDelPanel: number, alto: number): number =>
  ((scroll - topeDelPanel + alto) * ALTO_DE_VIEWPORT_DE_LA_REFERENCIA) / alto

/**
 * Dónde va el ancla de un paso adentro de la sección (en pantallas desde su tope): el salto nativo pone el ancla arriba del
 * cuadro, así que el ancla va una pantalla antes del centro del paso. Sin JS, el salto cae en ese paso (en su tira).
 */
export const pantallasDelAncla = (i: number, paso: number): number => centroDelPaso(i, paso) / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA - 1

// ─── El reloj de Demos ────────────────────────────────────────────────────

/**
 * [B1.2d] A9 · LO QUE SE ADELANTA DEMOS (px de la regla). Con el reloj de B1.2c el título de Demos subía 581 px después del arranque
 * de la cola, y la salida del Portfolio se dispara 30 después de ese arranque (bajando) y vuelve 30 antes (subiendo): quedaban 551 px de
 * escena sola bajando y 611 subiendo. Ahora el título empieza a subir en el borde de la cola menos la histéresis, donde el Portfolio
 * ya se fue en las dos direcciones: 0 px vacíos, y se pisan. Las alturas no cambian (la deriva de la escena es 0).
 */
export const ADELANTO_DE_DEMOS = ARRANQUE_DEL_VACIO + LLEGADA_DE_LOS_DEMOS.desde * PX_DEL_VACIO - PX_DEL_ARRANQUE_DE_LA_SALIDA_DE_HOY + HISTERESIS_PX

/**
 * Demos cuenta su llegada con el `mostrado` de hoy (la fracción de la sección de 6.813 px). La cola es la misma al píxel, así que
 * el reloj es la cola corrida: el arranque de la salida nueva cae en el de hoy (3.882) [B1.2d] menos `ADELANTO_DE_DEMOS`. Antes,
 * saturado (el vacío en 0). Ya no hay resorte del túnel: Demos llega con el scroll y su propia persecución (§11.4).
 */
export function mostradoDeDemos(px: number, paso: number): number {
  return mostradoDeLaCola(px, pxDeLaSalida(paso))
}

/** [B1.2e] El mismo reloj con la cola en cualquier lugar (`salida`, px de la regla): con el carrusel, donde termina su flujo. */
export function mostradoDeLaCola(px: number, salida: number): number {
  const deHoy = px - (salida - PX_DEL_ARRANQUE_DE_LA_SALIDA_DE_HOY) + ADELANTO_DE_DEMOS
  return Math.min(1, Math.max(0, deHoy / PX_DE_LA_SECCION_EN_LA_TABLA))
}

/** Al revés: el píxel de la sección nueva para un `mostrado` de hoy en la cola (el destino del foco de Demos). */
export function pxDelMostradoDeDemos(mostrado: number, paso: number): number {
  return pxDelMostradoDeLaCola(mostrado, pxDeLaSalida(paso))
}

/** [B1.2e] Al revés, con la cola en `salida` (px de la regla). */
export function pxDelMostradoDeLaCola(mostrado: number, salida: number): number {
  return mostrado * PX_DE_LA_SECCION_EN_LA_TABLA + salida - PX_DEL_ARRANQUE_DE_LA_SALIDA_DE_HOY - ADELANTO_DE_DEMOS
}
