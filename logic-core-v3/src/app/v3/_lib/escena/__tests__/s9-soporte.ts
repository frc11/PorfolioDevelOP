/**
 * LOS DETECTORES Y LOS AGREGADOS DE SITIO-S9 · ANCLAJE — funciones puras de sus
 * argumentos, para que el control positivo pueda correr **la misma** contra una
 * entrada rota.
 *
 * ── Por qué este módulo existe, con las DOS razones ────────────────────────
 *
 * 1. **La regla de las 300 líneas del repo.** `s9-anclaje.invariant.ts` publica
 *    ocho secciones y no entra en un archivo. Se parte donde la costura ya
 *    estaba, con el reparto que este directorio venía usando: **la impresión va
 *    a `tablas.ts`, los detectores y los agregados acá, la caminata del grafo a
 *    `s9-compuerta.ts`, y en el invariante quedan las afirmaciones y nada más.**
 * 2. **La razón de siempre en este repo, que no es de tamaño:** *un predicado
 *    escrito adentro del archivo que lo usa no se puede probar contra un caso
 *    roto sin duplicarlo, y un predicado duplicado no es el mismo predicado.*
 *    Es el patrón de `s7-soporte.ts` y de `soporte.ts`.
 *
 * ── LO QUE NO ESTÁ ACÁ, y por qué ─────────────────────────────────────────
 *
 * **La caminata del grafo de módulos** (§8 del invariante) vive en
 * `s9-compuerta.ts`. No es una partición por tamaño: este módulo es aritmética
 * pura sobre tablas del repo y aquél lee el disco. Mezclarlos obligaría a
 * importar `node:fs` para medir un ritmo.
 */

// prettier-ignore
import { ANCLAJE, REASIGNACIONES, TRAMOS_ANCLADOS, comoId, keyframeEn, type Nudo } from '../anclaje'
import { CHOREO_KEYFRAMES } from '../choreography'
import { SECCIONES } from '../../secciones'
// prettier-ignore
import { MAPEO_DE_LAS_SECCIONES, PANTALLAS_DE_SCROLL, RITMO_POR_SEGMENTO, progresoEnNudos, tramoEn } from '../recorrido'
// prettier-ignore
import { MAPEO_PROVISIONAL_HISTORICO, bordesDe, desalineacionDelAnclaje, desalineacionDeNombres, repartoDelAnclaje } from './tablas'

// ── Los detectores del mapeo ────────────────────────────────────────────────

/** Estrictamente creciente. Un empate no alcanza: el progreso no se estanca. */
export function esEstrictamenteCreciente(valores: readonly number[]): boolean {
  return valores.every((v, i) => i === 0 || v > valores[i - 1])
}

/** Los progresos de una grilla de pantallas, sobre una lista de nudos cualquiera. */
export function progresosSobre(nudos: readonly Nudo[], muestras: readonly number[]): number[] {
  return muestras.map((p) => progresoEnNudos(nudos, p))
}

/**
 * El error máximo de la vuelta `x → ida → vuelta → x`.
 *
 * Recibe las dos funciones como argumentos —y no las importa— porque es lo que
 * permite correrla con la inversa REAL (tiene que dar cero) y con una inversa
 * mentirosa (tiene que no darlo). Sin eso, «es reversible» sería una afirmación
 * que no sabe fallar.
 */
export function errorDeVuelta(
  ida: (x: number) => number,
  vuelta: (y: number) => number,
  muestras: readonly number[],
): number {
  return Math.max(...muestras.map((x) => Math.abs(vuelta(ida(x)) - x)))
}

// ── Los datos derivados que el invariante afirma ────────────────────────────

/** Grillas densas para muestrear el mapeo en los dos sentidos. */
export const PANTALLAS = Array.from({ length: 105 }, (_, i) => (i * PANTALLAS_DE_SCROLL) / 104)
export const PROGRESOS = Array.from({ length: 105 }, (_, i) => i / 104)

/** El progreso en el que una sección llena el cuadro, en la tabla que se le pase. */
export function llenaEn(
  tabla: readonly { readonly id: string; readonly llenaDesde: number }[],
  id: string,
): number {
  const fila = tabla.find((f) => f.id === id)
  if (fila === undefined) throw new Error(`no hay fila para "${id}"`)
  return fila.llenaDesde
}

/**
 * Las cuatro secciones que §7.2 nombra por su nombre: *«con la recta, Números
 * cae adentro del tramo de Quiénes somos, y tu-panel, por-que-develop y cierre
 * caen los tres adentro del tramo de cierre»*.
 */
export const CUATRO_DE_LA_72: readonly string[] = [
  'numeros',
  'tu-panel',
  'por-que-develop',
  'cierre',
]

/** ¿La tabla avanza sin solaparse? Ninguna sección arranca antes de que la anterior termine. */
export function esMonotonaLaTabla(tabla: readonly { readonly llenaDesde: number; readonly llenaHasta: number }[]): boolean {
  return tabla.every((f, i) => i === 0 || f.llenaDesde >= tabla[i - 1].llenaHasta)
}

/** ¿Los siete nudos se devuelven LITERALES en los dos sentidos? Igualdad exacta, no épsilon. */
export function losNudosSonExactos(
  ida: (pantalla: number) => number,
  vuelta: (progreso: number) => number,
): boolean {
  return ANCLAJE.nudos.every((n) => ida(n.pantalla) === n.progreso && vuelta(n.progreso) === n.pantalla)
}

/** El mismo anclaje con UN nudo movido hacia atrás: el mapeo que no cierra. */
export const NUDOS_FUERA_DE_ORDEN: readonly Nudo[] = ANCLAJE.nudos.map((n, i) =>
  i === 4 ? { ...n, progreso: ANCLAJE.nudos[2].progreso } : n,
)

/**
 * El ritmo ÚNICO del provisional: 1/13 de progreso por pantalla de scroll. Es
 * ×0,615 del compuesto, o sea el recíproco exacto del ×1,625 de estiramiento de
 * scroll que §7.2 publica. Se deriva; no se escribe.
 */
export const RITMO_DEL_PROVISIONAL = 1 / PANTALLAS_DE_SCROLL

/**
 * La ventana de scroll de un tramo: desde que su primera sección llena el cuadro
 * hasta que la última deja de verse. `corrimiento` existe para el control
 * positivo — un octavo de más tiene que romper la igualdad.
 */
export function ventanaDelTramo(i: number, corrimiento = 0): readonly [number, number] {
  const ids = TRAMOS_ANCLADOS[i].secciones
  const ultima = MAPEO_DE_LAS_SECCIONES.find((f) => f.id === ids[ids.length - 1])
  if (ultima === undefined) throw new Error(`no hay fila para "${ids[ids.length - 1]}"`)
  return [llenaEn(MAPEO_DE_LAS_SECCIONES, ids[0]) + corrimiento, ultima.seVeHasta]
}

export type VeredictoDeNombres = {
  readonly antesTramosSinSeccion: readonly string[]
  readonly antesSeccionesSinTramo: readonly string[]
  /** Con el provisional: sección → tramo, para las que no coincidían. */
  readonly antesDesajustadas: readonly string[]
  readonly despuesTramosSinSeccion: readonly string[]
  readonly despuesSeccionesSinTramo: readonly string[]
  /** Con el anclaje: las que caen en un tramo que no lleva su nombre. */
  readonly conOtroNombre: readonly string[]
  /** Si cada una de esas aparece declarada en `TRAMOS_ANCLADOS`. */
  readonly declaradas: readonly boolean[]
}

/**
 * EL ANTES CONTRA EL DESPUÉS DE LA DESALINEACIÓN DE NOMBRES, en un solo objeto.
 *
 * ⚠ Las dos mitades no miden lo mismo, y por eso salen de dos funciones y no de
 * una con una bandera. **Antes** la pregunta era *«¿este nombre de tramo existe
 * como sección?»*; **después** es *«¿hay una sección que ningún tramo recorra?»*.
 * Un tramo puede llevar el nombre de una sección y no correr sobre ella —`cierre`
 * es exactamente ese caso—, así que comparar nombres después del anclaje daría
 * una cuenta que no significa nada.
 */
export function veredictoDeNombres(): VeredictoDeNombres {
  const antes = desalineacionDeNombres()
  const despues = desalineacionDelAnclaje()
  const conOtroNombre = repartoDelAnclaje()
    .filter((f) => f.tramo !== null && !f.llevaSuNombre)
    .map((f) => f.id)
  return {
    antesTramosSinSeccion: antes.tramosSinSeccion,
    antesSeccionesSinTramo: antes.seccionesSinTramo,
    antesDesajustadas: MAPEO_PROVISIONAL_HISTORICO.filter(
      (f) => tramoEn(f.llenaDesde) !== comoId(f.id),
    ).map((f) => `${f.id}→${tramoEn(f.llenaDesde)}`),
    despuesTramosSinSeccion: despues.tramosSinSeccion,
    despuesSeccionesSinTramo: despues.seccionesSinTramo,
    conOtroNombre,
    declaradas: conOtroNombre.map((id) => TRAMOS_ANCLADOS.some((t) => t.secciones.includes(id))),
  }
}

export type VeredictoDelRitmo = {
  /** Los tramos que corren al ritmo compuesto exacto. */
  readonly alCompuesto: readonly string[]
  /** Los que no, con su múltiplo, ya formateados para publicar. */
  readonly fueraDelCompuesto: readonly string[]
  /** Cuántos ritmos DISTINTOS hay. El provisional tenía uno para las trece pantallas. */
  readonly distintos: number
  readonly multiplos: readonly string[]
}

/** El ritmo de los seis segmentos, resumido. Reemplaza a las dos cifras de estiramiento. */
export function veredictoDelRitmo(): VeredictoDelRitmo {
  return {
    alCompuesto: RITMO_POR_SEGMENTO.filter((r) => r.multiploDelCompuesto === 1).map((r) => r.tramo),
    fueraDelCompuesto: RITMO_POR_SEGMENTO.filter((r) => r.multiploDelCompuesto !== 1).map(
      (r) => `${r.tramo} ×${r.multiploDelCompuesto.toFixed(3)}`,
    ),
    distintos: new Set(RITMO_POR_SEGMENTO.map((r) => r.porPantalla)).size,
    multiplos: RITMO_POR_SEGMENTO.map((r) => `×${r.multiploDelCompuesto.toFixed(3)}`),
  }
}

/**
 * Las cinco llamadas a `progresoDelScroll` que cubren los bordes: arriba de
 * todo, abajo de todo, pasado de rosca en los dos sentidos, y un documento que
 * no scrollea. Están acá para que el invariante afirme la lista, no la arme.
 */
export const MUESTRAS_DE_SCROLL: readonly (readonly [number, number, number])[] = [
  [0, 1400, 100],
  [1300, 1400, 100],
  [9999, 1400, 100],
  [-50, 1400, 100],
  [0, 100, 100],
]

export type VeredictoDeReasignacion = {
  readonly keyframe: string
  readonly seccion: string
  /** El `at` del keyframe en la coreografía, o `null` si no existe. */
  readonly at: number | null
  readonly noEsUnaSeccion: boolean
  /** Si el `at` cae en uno de los cuatro bordes de la ventana de la sección. */
  readonly enUnBorde: boolean
  /** Si la coreografía alcanza ESE keyframe en ese progreso. */
  readonly loAlcanzaAhi: boolean
  readonly bordes: readonly number[]
}

/**
 * Lo que el guardián de `anclaje.ts` promete de cada reasignación, comprobado
 * contra las tres fuentes. Acá **no se decide nada**: la decisión y su razón
 * están escritas allá, y esto sólo mira si siguen siendo verdad.
 */
export function veredictoDeReasignaciones(): readonly VeredictoDeReasignacion[] {
  return REASIGNACIONES.map((r): VeredictoDeReasignacion => {
    const k = CHOREO_KEYFRAMES.find((f) => f.name === r.keyframe)
    const at = k === undefined ? null : k.at
    const bordes = bordesDe(r.seccion)
    return {
      keyframe: r.keyframe,
      seccion: r.seccion,
      at,
      noEsUnaSeccion: !SECCIONES.some((s) => s.id === comoId(r.keyframe)),
      enUnBorde: at !== null && bordes.includes(at),
      loAlcanzaAhi: at !== null && keyframeEn(at) === r.keyframe,
      bordes,
    }
  })
}

