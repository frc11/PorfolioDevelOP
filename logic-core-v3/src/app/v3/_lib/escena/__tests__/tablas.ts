/**
 * LAS TABLAS QUE S8 · ESCENA PUBLICA — impresión y agregados, separados del
 * invariante.
 *
 * Están acá por la regla de tamaño del repo (300 líneas) y por una razón que no
 * es sólo de tamaño: **imprimir una tabla no es afirmar nada**, y mezclar las
 * dos cosas en el mismo archivo hace que cueste ver cuál es cuál. Lo que este
 * módulo devuelve son números; quién los afirma es el invariante.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { SECCIONES } from '../../secciones'
import { CHOREO_SCREENS, CHOREO_TRAMOS } from '../choreography'
import {
  ESTIRAMIENTO_DE_DOCUMENTO,
  ESTIRAMIENTO_DE_SCROLL,
  MAPEO_PROVISIONAL,
  PANTALLAS_DEL_DOCUMENTO,
  tramoEn,
} from '../recorrido'
import { ORIGEN, RAIZ, SUBARBOL_DEL_EDITOR, pesoVivo } from './soporte'

/** Imprime el mapeo derivado, sección por sección, con el tramo que le toca. */
export function imprimirMapeo(): void {
  console.log(
    `  la coreografía declara ${CHOREO_SCREENS} pantallas · la tabla del home suma ${PANTALLAS_DEL_DOCUMENTO}`,
  )
  console.log(
    `  estiramiento: ×${ESTIRAMIENTO_DE_DOCUMENTO.toFixed(3)} de documento · ×${ESTIRAMIENTO_DE_SCROLL.toFixed(3)} de scroll`,
  )
  console.log(
    '  sección           alto   llena [desde, hasta]    se ve [desde, hasta]   tramo           escena',
  )
  for (const fila of MAPEO_PROVISIONAL) {
    console.log(
      `  ${fila.id.padEnd(16)} ${fila.altoEnPantallas.toFixed(0)}pan  ` +
        `[${fila.llenaDesde.toFixed(3)}, ${fila.llenaHasta.toFixed(3)}]   ` +
        `[${fila.seVeDesde.toFixed(3)}, ${fila.seVeHasta.toFixed(3)}]   ` +
        `${tramoEn(fila.llenaDesde).padEnd(15)} ${fila.dejaVerLaEscena ? 'SE VE' : '—'}`,
    )
  }
}

/** `quiénes somos` → `quienes-somos`, que es la forma de los `id` de la tabla. */
function comoId(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ /g, '-')
}

export type Desalineacion = {
  readonly tramosSinSeccion: readonly string[]
  readonly seccionesSinTramo: readonly string[]
}

/**
 * Qué nombres de tramo no son una sección y qué secciones no son un tramo.
 *
 * Es la mitad de la contradicción que este sprint mide: la otra es el
 * estiramiento. Se deriva de las dos tablas, así que si mañana alguien renombra
 * un tramo o agrega una sección, la cuenta se mueve sola.
 */
export function desalineacionDeNombres(): Desalineacion {
  const tramos = CHOREO_TRAMOS.map((t) => comoId(t.name))
  const ids = SECCIONES.map((s) => s.id)
  return {
    tramosSinSeccion: tramos.filter((t) => !ids.includes(t)),
    seccionesSinTramo: ids.filter((id) => !tramos.includes(id)),
  }
}

export type PesoDelEditor = {
  /** Bytes de código vivo de los 11 archivos del subárbol del editor. */
  readonly total: number
  /** De esos, cuántos son las cuatro variantes alternativas y sus notas. */
  readonly variantes: number
}

/**
 * Lo que costaría mudar el editor de keyframes al chunk de la escena.
 *
 * Se mide **sin comentarios**, que es lo que aproxima lo que sobrevive a la
 * minificación: la mayor parte de estos archivos son notas de keyframe, y las
 * notas son cadenas —viven— mientras que los docblocks se borran.
 */
export function pesoDelEditor(): PesoDelEditor {
  const bytes = (nombre: string): number =>
    pesoVivo(readFileSync(path.join(RAIZ, ORIGEN, nombre), 'utf8'))
  return {
    total: SUBARBOL_DEL_EDITOR.reduce((n, f) => n + bytes(f), 0),
    variantes: SUBARBOL_DEL_EDITOR.filter((f) => f !== 'choreographyEditor.ts').reduce(
      (n, f) => n + bytes(f),
      0,
    ),
  }
}
