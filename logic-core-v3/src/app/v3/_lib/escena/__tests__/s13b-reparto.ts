/**
 * TODOS LOS ANCLAJES QUE `TRAMOS_ANCLADOS` PUEDE PRODUCIR — el espacio de la
 * decisión, enumerado en vez de argumentado.
 *
 * ── Por qué esto existe (V3-B, defecto 4 de §7.46) ─────────────────────────
 *
 * La instrucción de V3-B dice: *«Si hay una ventana donde los dos pasan,
 * anclalo ahí»*. Eso supone que el ancla del diferencial es un número que se
 * puede elegir. **No lo es: está cuantizado.** El progreso en el que una sección
 * llena el cuadro sale de `progresoDePantalla` sobre los nudos, y los nudos
 * salen de UNA sola cosa escrita a mano —`TRAMOS_ANCLADOS`, en `anclaje.ts`—
 * cruzada con dos tablas que este lane no toca (`secciones.ts` y los `from/to` de
 * `CHOREO_TRAMOS`).
 *
 * Así que la pregunta «¿se puede anclar el diferencial adentro de la ventana?»
 * no se contesta con un argumento: **se contesta enumerando el espacio entero**
 * y mirando qué valores salen. Eso es lo que hace este módulo. Corre
 * `derivarAnclaje` —la función de producción, no un modelo de ella— sobre cada
 * reparto posible y publica el ancla que produce, o el error con el que el
 * guardián lo rechaza.
 *
 * ── QUÉ ES UN REPARTO POSIBLE, y por qué la forma es ésa ───────────────────
 *
 * El guardián 2 de `derivarAnclaje` exige que las secciones con recorrido sean
 * **un prefijo contiguo de la tabla, en orden**, y el guardián 1 que haya
 * exactamente un tramo por tramo de la coreografía, en su orden. O sea: un
 * reparto es una **partición ordenada de un prefijo de las ocho secciones en
 * exactamente seis grupos contiguos y no vacíos**. Nada más, y nada menos: no se
 * eligen los prefijos «razonables» a mano — se generan todos, incluidos los que
 * el guardián 3 y el 4 rechazan, porque un rechazo es un dato del espacio.
 */

import { SECCIONES } from '../../secciones'
import { SUPERFICIES } from '../../superficies'
import { CHOREO_TRAMOS } from '../choreography'
import { derivarAnclaje, type Anclaje, type TramoAnclado } from '../anclajeDerivacion'
import { progresoEnNudos } from '../recorrido'

/**
 * LA SECCIÓN CUYO ANCLA SE ESTÁ DECIDIENDO — la última que deja ver la sala.
 *
 * No se escribe `'por-que-develop'`: sale de cruzar `secciones.ts` con
 * `superficies.ts`, que es de donde sale en todo el resto del repo. Si mañana el
 * recorrido de superficies cambia, este módulo mide la que corresponda en vez de
 * medir una que ya no es el diferencial.
 */
export const EL_DIFERENCIAL: string = (() => {
  const transparentes = SECCIONES.filter((s) => SUPERFICIES[s.superficie].dejaVerElCanvas)
  if (transparentes.length === 0) throw new Error('reparto: ninguna sección deja ver la escena.')
  return transparentes[transparentes.length - 1].id
})()

/** Particiones ordenadas de `n` elementos en exactamente `grupos` bloques contiguos. */
export function particiones(n: number, grupos: number): readonly (readonly number[])[] {
  if (grupos <= 0 || n < grupos) return []
  if (grupos === 1) return [[n]]
  const salida: number[][] = []
  for (let primero = 1; primero <= n - grupos + 1; primero += 1) {
    for (const resto of particiones(n - primero, grupos - 1)) salida.push([primero, ...resto])
  }
  return salida
}

/** Un reparto candidato, con el veredicto de la derivación de producción. */
export interface RepartoMedido {
  readonly anclados: readonly TramoAnclado[]
  /** Cómo se lee: `hero | quienes-somos | … `, un grupo por tramo. */
  readonly etiqueta: string
  /** El anclaje derivado, o `null` si un guardián lo rechazó. */
  readonly anclaje: Anclaje | null
  /** El mensaje del guardián que lo rechazó, o `''`. */
  readonly rechazo: string
  /** Progreso en el que el diferencial llena el cuadro. `NaN` si no deriva. */
  readonly anclaDelDiferencial: number
  /** Progreso en el que EMPIEZA a verse. `NaN` si no deriva. */
  readonly seVeDesde: number
  /** Si es el reparto que el repo declara hoy en `TRAMOS_ANCLADOS`. */
  readonly esElDeHoy: boolean
}

function medirReparto(
  anclados: readonly TramoAnclado[],
  declaradoHoy: string,
): RepartoMedido {
  const etiqueta = anclados.map((a) => a.secciones.join('+')).join(' | ')
  const base = {
    anclados,
    etiqueta,
    esElDeHoy: etiqueta === declaradoHoy,
  }
  let anclaje: Anclaje
  try {
    anclaje = derivarAnclaje(SECCIONES, CHOREO_TRAMOS, anclados)
  } catch (error) {
    const rechazo = error instanceof Error ? error.message : String(error)
    return { ...base, anclaje: null, rechazo, anclaDelDiferencial: Number.NaN, seVeDesde: Number.NaN }
  }
  const geo = anclaje.geometria.find((g) => g.id === EL_DIFERENCIAL)
  if (geo === undefined) throw new Error(`reparto: la geometría no tiene "${EL_DIFERENCIAL}".`)
  return {
    ...base,
    anclaje,
    rechazo: '',
    anclaDelDiferencial: progresoEnNudos(anclaje.nudos, geo.desdePantalla),
    seVeDesde: progresoEnNudos(anclaje.nudos, geo.desdePantalla - 1),
  }
}

/**
 * EL ESPACIO ENTERO, medido. Un reparto por cada partición ordenada de cada
 * prefijo de la tabla en seis grupos.
 *
 * `declaradoHoy` entra por parámetro —y no se lee de `anclaje.ts`— para que el
 * invariante pueda pedirle al espacio que se reconozca a sí mismo: si el reparto
 * de producción no apareciera acá, la enumeración estaría incompleta y todo lo
 * que se concluya de ella sería falso.
 */
export function repartosPosibles(declaradoHoy: string): readonly RepartoMedido[] {
  const salida: RepartoMedido[] = []
  const tramos = CHOREO_TRAMOS.map((t) => t.name)
  for (let prefijo = tramos.length; prefijo <= SECCIONES.length; prefijo += 1) {
    for (const tamanos of particiones(prefijo, tramos.length)) {
      let cursor = 0
      const anclados: TramoAnclado[] = tamanos.map((n, i) => {
        const secciones = SECCIONES.slice(cursor, cursor + n).map((s) => s.id)
        cursor += n
        return { tramo: tramos[i], secciones }
      })
      salida.push(medirReparto(anclados, declaradoHoy))
    }
  }
  return salida
}

/** Los anclajes distintos que el espacio produce, ordenados. Es la respuesta. */
export function anclasAlcanzables(repartos: readonly RepartoMedido[]): readonly number[] {
  const vistos = new Set<number>()
  for (const r of repartos) if (r.anclaje !== null) vistos.add(r.anclaDelDiferencial)
  return [...vistos].sort((a, b) => a - b)
}

/** Las líneas de la tabla del espacio: sólo los repartos que DERIVAN. */
export function tablaDeRepartos(repartos: readonly RepartoMedido[]): readonly string[] {
  return repartos
    .filter((r) => r.anclaje !== null)
    .map(
      (r) =>
        `${r.esElDeHoy ? '→ HOY' : '     '}  ancla ${r.anclaDelDiferencial.toFixed(4)}` +
        `  se ve desde ${r.seVeDesde.toFixed(4)}   ${r.etiqueta}`,
    )
}
