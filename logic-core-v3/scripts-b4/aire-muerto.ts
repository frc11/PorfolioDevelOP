/**
 * AIRE MUERTO SOBRE EL PÍXEL — la métrica de `B1-DELTAS` §3, reimplementada.
 *
 * ── La definición, textual, y de dónde sale ───────────────────────────────
 *
 * «Una FILA de la pantalla *tiene contenido* si en algún punto hay un **borde**:
 * dos muestras vecinas cuya luminancia relativa difiere más de 0,02. Una franja
 * lisa —un panel de papel, un negro plano— o un degradé suave **no** tiene
 * contenido: es fondo. El aire muerto de una pantalla es la fracción de filas
 * sin contenido.»
 *
 * **Por qué un borde y no la varianza:** un degradé de fondo tiene varianza alta
 * y no es contenido; un renglón de texto tiene bordes aunque ocupe pocos
 * píxeles. Esa propiedad es lo que el control positivo de este módulo prueba —no
 * prueba «el código corre», prueba **que un degradé se lee como aire**—.
 *
 * ── ⚠️ LO QUE ESTA IMPLEMENTACIÓN DECLARA, PORQUE B1 NO LO DEJÓ ESCRITO ───
 *
 * B1 publicó la definición y perdió el código. Estas tres decisiones las toma
 * este archivo y **hay que leerlas antes de comparar un número de B4 con uno de
 * B1**:
 *
 *   1. **Las muestras vecinas son HORIZONTALES**, dentro de la fila, con paso 1.
 *      Es la lectura literal de «una fila tiene contenido».
 *   2. **El umbral es 0,02 de luminancia relativa**, estricto (`>`), tal cual.
 *   3. **La banda vacía máxima se mide en filas consecutivas sin contenido**, y
 *      se reporta en píxeles de la captura.
 *
 * ⚠️ **Y el punto ciego de la definición, medido y no escondido.** Una regla
 * horizontal que cruza la pantalla entera no tiene ningún borde HORIZONTAL en su
 * fila: la definición de B1 la lee como aire. Por eso este módulo devuelve
 * también `porcentajeConVertical`, que agrega la comparación contra la fila de
 * arriba. **El número que se compara con B1 es el primero**; el segundo dice
 * cuánto del aire reportado es punto ciego y no vacío.
 *
 * ── ⚠️ Y LA ADVERTENCIA DE COMPARABILIDAD, QUE ES LA IMPORTANTE ───────────
 *
 * Las cifras de B1 (45,30 % promedio, 849 px de banda máxima) salieron de un
 * código que ya no existe. **Un número de este módulo no es la continuación de
 * uno de B1**: es una medición nueva con la misma definición. Por eso el frente
 * que use esto tiene que medir TAMBIÉN el escritorio con este mismo módulo, y
 * comparar mobile contra ese escritorio —no contra la tabla vieja—. Comparar
 * dos instrumentos distintos y llamarlo delta es el modo de falla que este repo
 * lleva veinte sprints cazando.
 */

import { bandaDeLuminancia } from './color'
import type { Imagen } from './png'

/** El umbral de la definición de B1. No se toca sin cambiar la definición. */
export const UMBRAL_DE_BORDE = 0.02

export interface AireMuerto {
  readonly alto: number
  readonly ancho: number
  /** Filas sin ningún borde horizontal, contadas. */
  readonly filasSinContenido: number
  /** La cifra de B1: fracción de filas sin contenido, en por ciento. */
  readonly porcentaje: number
  /** La banda continua más larga de filas sin contenido, en píxeles. */
  readonly bandaVaciaMaxPx: number
  /** Dónde empieza esa banda, para poder ir a mirarla en la captura. */
  readonly bandaVaciaMaxDesdeY: number
  /** El mismo cálculo agregando el borde VERTICAL. Mide el punto ciego, no reemplaza. */
  readonly porcentajeConVertical: number
}

/**
 * Corre la métrica sobre una imagen ya decodificada.
 *
 * Tira con una imagen de alto 0 en vez de devolver 0 %: **una captura vacía no
 * es una pantalla sin aire muerto**, y ése es exactamente el «verde por vacío»
 * que la regla 7 del sprint prohíbe.
 */
export function aireMuerto(img: Imagen): AireMuerto {
  if (img.alto === 0 || img.ancho === 0) throw new Error('imagen vacía: no hay nada que medir')
  if (img.ancho < 2) throw new Error('una imagen de 1 px de ancho no tiene vecinos horizontales')

  const luz = bandaDeLuminancia(img.datos, img.ancho, img.alto)
  const conBorde = new Uint8Array(img.alto)
  const conBordeOVertical = new Uint8Array(img.alto)

  for (let y = 0; y < img.alto; y += 1) {
    const fila = y * img.ancho
    let horizontal = false
    for (let x = 1; x < img.ancho; x += 1) {
      if (Math.abs(luz[fila + x] - luz[fila + x - 1]) > UMBRAL_DE_BORDE) {
        horizontal = true
        break
      }
    }
    conBorde[y] = horizontal ? 1 : 0
    if (horizontal) {
      conBordeOVertical[y] = 1
      continue
    }
    if (y === 0) continue
    const anterior = (y - 1) * img.ancho
    for (let x = 0; x < img.ancho; x += 1) {
      if (Math.abs(luz[fila + x] - luz[anterior + x]) > UMBRAL_DE_BORDE) {
        conBordeOVertical[y] = 1
        break
      }
    }
  }

  let sinContenido = 0
  let corrida = 0
  let mejor = 0
  let mejorDesde = 0
  for (let y = 0; y < img.alto; y += 1) {
    if (conBorde[y] === 1) {
      corrida = 0
      continue
    }
    sinContenido += 1
    corrida += 1
    if (corrida > mejor) {
      mejor = corrida
      mejorDesde = y - corrida + 1
    }
  }

  let sinContenidoConVertical = 0
  for (let y = 0; y < img.alto; y += 1) if (conBordeOVertical[y] === 0) sinContenidoConVertical += 1

  return {
    alto: img.alto,
    ancho: img.ancho,
    filasSinContenido: sinContenido,
    porcentaje: (100 * sinContenido) / img.alto,
    bandaVaciaMaxPx: mejor,
    bandaVaciaMaxDesdeY: mejorDesde,
    porcentajeConVertical: (100 * sinContenidoConVertical) / img.alto,
  }
}

/**
 * La vara de la Fase 1 de B1, repetida acá para que un frente no la escriba a
 * mano: **ninguna banda vacía continua por encima de 104 px** —la mejor sección
 * que el sitio ya tenía—, contra los 50 px de la referencia externa.
 */
export const BANDA_VACIA_OBJETIVO_PX = 104
