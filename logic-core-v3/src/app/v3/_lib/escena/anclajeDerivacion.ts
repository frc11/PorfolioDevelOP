/**
 * LA DERIVACIÓN DEL ANCLAJE — la aritmética, separada de la decisión.
 *
 * La decisión —qué tramo corre sobre qué secciones y qué keyframe cambia de
 * dueño— vive en `anclaje.ts` y se lee ahí. Acá está lo que no se elige: cómo
 * salen la geometría de las secciones, los nudos y las ventanas de la escena a
 * partir de las tres fuentes del repo.
 *
 * **Está en su propio módulo por la regla de las 300 líneas del repo**, y por
 * una razón que no es sólo de tamaño: `derivarAnclaje` es una función **pura de
 * sus argumentos y no de los módulos**, que es lo que permite que un invariante
 * la corra con datos deliberadamente rotos y compruebe que cada guardián ve.
 * Mezclada con la decisión habría que importar la decisión para probar la
 * derivación, y entonces sólo se podría probar con el único dato que hay.
 */

import { SUPERFICIES } from '../superficies'
import type { Seccion } from '../secciones'

/** Una pantalla es `100svh`. La unidad en la que la tabla declara sus altos. */
const SVH_POR_PANTALLA = 100

/**
 * Cuántas pantallas mide un `alto` de la tabla.
 *
 * Tira con una unidad que no sea `svh`: un alto que este módulo no sabe leer es
 * un error del que hay que enterarse, no un cero que se propaga hasta un
 * recorrido mal repartido.
 */
export function pantallasDe(alto: string): number {
  const m = /^(\d+(?:\.\d+)?)svh$/.exec(alto)
  if (m === null) throw new Error(`alto que este módulo no sabe leer: ${alto}`)
  return Number(m[1]) / SVH_POR_PANTALLA
}

/** `quiénes somos` → `quienes-somos`, que es la forma de los `id` de la tabla. */
export function comoId(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ /g, '-')
}

export type TramoAnclado = {
  /** El `name` de un tramo de `CHOREO_TRAMOS`, literal. */
  readonly tramo: string
  /** Los `id` de `SECCIONES` sobre los que ese tramo corre, en orden. */
  readonly secciones: readonly string[]
}

/** Lo mínimo de un tramo que la derivación necesita. */
export type BordeDeTramo = {
  readonly name: string
  readonly from: number
  readonly to: number
}

export type GeometriaDeSeccion = {
  readonly id: string
  readonly altoEnPantallas: number
  /** Pantallas de scroll acumuladas antes de esta sección. */
  readonly desdePantalla: number
  /** Dónde termina su bloque en el documento, en pantallas. */
  readonly hastaPantalla: number
  readonly dejaVerLaEscena: boolean
}

export type Nudo = {
  /** Posición de scroll, en pantallas. */
  readonly pantalla: number
  readonly progreso: number
  /** Qué la ancla ahí: el borde de tramo, o el principio del recorrido. */
  readonly porQue: string
}

export type Anclaje = {
  readonly geometria: readonly GeometriaDeSeccion[]
  readonly pantallasDelDocumento: number
  /** El documento menos la ventana. La ventana vale UNA pantalla por `svh`. */
  readonly pantallasDeScroll: number
  readonly nudos: readonly Nudo[]
  /** Ventanas de scroll en las que hay un panel transparente en cuadro. */
  readonly ventanasDeLaEscena: readonly (readonly [number, number])[]
}

/**
 * Deriva el anclaje entero de las tres fuentes.
 *
 * **Tira —no devuelve un anclaje degradado— en las seis formas en las que el
 * dato puede dejar de cerrar.** Un mapeo que no cubre el documento no es algo
 * que se renderice a medias, y el modo de falla que este repo persigue desde
 * S10 es exactamente el verde que no distingue «verifiqué» de «no había nada».
 */
export function derivarAnclaje(
  secciones: readonly Seccion[],
  tramos: readonly BordeDeTramo[],
  anclados: readonly TramoAnclado[],
): Anclaje {
  if (secciones.length === 0) throw new Error('anclaje: no hay secciones.')
  if (tramos.length === 0) throw new Error('anclaje: no hay tramos.')

  let acumulado = 0
  const geometria: GeometriaDeSeccion[] = secciones.map((s) => {
    const alto = pantallasDe(s.alto)
    const fila: GeometriaDeSeccion = {
      id: s.id,
      altoEnPantallas: alto,
      desdePantalla: acumulado,
      hastaPantalla: acumulado + alto,
      dejaVerLaEscena: SUPERFICIES[s.superficie].dejaVerElCanvas,
    }
    acumulado += alto
    return fila
  })

  const pantallasDelDocumento = acumulado
  const pantallasDeScroll = pantallasDelDocumento - 1
  if (!(pantallasDeScroll > 0)) throw new Error('anclaje: el documento no scrollea.')

  // 1 · Los tramos declarados son EXACTAMENTE los de la coreografía, en orden.
  const declarados = anclados.map((a) => a.tramo)
  const reales = tramos.map((t) => t.name)
  if (declarados.join('|') !== reales.join('|')) {
    throw new Error(
      `anclaje: los tramos declarados no son los de la coreografía — ${declarados.join(', ')} contra ${reales.join(', ')}.`,
    )
  }

  // 2 · Las secciones que llevan recorrido son un prefijo contiguo de la tabla.
  const conRecorrido = anclados.flatMap((a) => a.secciones)
  const esperadas = geometria.slice(0, conRecorrido.length).map((g) => g.id)
  if (conRecorrido.join('|') !== esperadas.join('|')) {
    throw new Error(
      `anclaje: el reparto no cubre las secciones en orden — ${conRecorrido.join(', ')} contra ${esperadas.join(', ')}.`,
    )
  }

  // 3 · Las que quedan afuera son exactamente las que no tienen scroll propio.
  for (const g of geometria.slice(conRecorrido.length)) {
    if (Math.min(pantallasDeScroll, g.hastaPantalla) - g.desdePantalla > 0) {
      throw new Error(
        `anclaje: la sección "${g.id}" tiene recorrido de scroll propio y ningún tramo corre sobre ella.`,
      )
    }
  }

  // 4 · Los nudos: el borde de cada tramo contra el borde de sus secciones.
  const porId = new Map(geometria.map((g) => [g.id, g]))
  const nudos: Nudo[] = [
    { pantalla: 0, progreso: tramos[0].from, porQue: 'el principio del recorrido' },
  ]
  for (let i = 0; i < anclados.length; i += 1) {
    const ids = anclados[i].secciones
    if (ids.length === 0) throw new Error(`anclaje: el tramo "${tramos[i].name}" no tiene secciones.`)
    const ultima = porId.get(ids[ids.length - 1])
    if (ultima === undefined) throw new Error(`anclaje: sección desconocida: "${ids[ids.length - 1]}".`)
    const pantalla = Math.min(pantallasDeScroll, ultima.hastaPantalla)
    const anterior = nudos[nudos.length - 1]
    if (!(pantalla > anterior.pantalla) || !(tramos[i].to > anterior.progreso)) {
      throw new Error(
        `anclaje: el tramo "${tramos[i].name}" no avanza — pantalla ${anterior.pantalla}→${pantalla}, progreso ${anterior.progreso}→${tramos[i].to}.`,
      )
    }
    nudos.push({
      pantalla,
      progreso: tramos[i].to,
      porQue: `cierra el tramo "${tramos[i].name}" sobre ${ids.join(' + ')}`,
    })
  }

  // 5 · Y cubren el recorrido entero: de 0 a 1 sobre las pantallas de scroll.
  const fin = nudos[nudos.length - 1]
  if (fin.pantalla !== pantallasDeScroll || fin.progreso !== 1) {
    throw new Error(
      `anclaje: el último nudo no cierra el recorrido — pantalla ${fin.pantalla} de ${pantallasDeScroll}, progreso ${fin.progreso}.`,
    )
  }

  // 6 · Las ventanas en las que un panel transparente está en cuadro. El panel
  //     se ve desde una pantalla ANTES de llenar el cuadro —entra por abajo—
  //     hasta que su borde inferior sale por arriba.
  const ventanasDeLaEscena = geometria
    .filter((g) => g.dejaVerLaEscena)
    .map((g): readonly [number, number] => [
      Math.max(0, g.desdePantalla - 1),
      Math.min(pantallasDeScroll, g.hastaPantalla),
    ])

  return { geometria, pantallasDelDocumento, pantallasDeScroll, nudos, ventanasDeLaEscena }
}
