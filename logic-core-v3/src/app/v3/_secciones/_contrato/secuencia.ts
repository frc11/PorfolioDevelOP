/**
 * LA SECUENCIA SINCRONIZADA — UN progreso, N canales colgando.
 *
 * ── La observación que define la sección de Servicios ─────────────────────
 *
 * > *Es una secuencia sincronizada: al scrollear cambian **a la vez** el nombre
 * > del servicio, el video del panel y el párrafo con resaltado progresivo.
 * > **No son tres animaciones: es una.***
 *
 * Es el mismo patrón que la escena de este proyecto ya usa: **un número
 * alimentando varios canales**. Y es una propiedad que se puede afirmar sin
 * navegador, porque el reparto es una función pura del progreso.
 *
 * ── Por qué vive en el contrato y no en la sección ────────────────────────
 *
 * Porque es EL mecanismo, y porque un subagente que lo escribiera por su cuenta
 * podría llegar a tres progresos que se ven parecidos y no están sincronizados.
 * Acá el reparto es una sola función, y el instrumento afirma la propiedad
 * —simultaneidad— sobre ella, no sobre el componente.
 *
 * ── La propiedad, escrita ─────────────────────────────────────────────────
 *
 * Con `cantidad = 3`, el recorrido se parte en tres tercios iguales. En cada
 * punto del recorrido los cuatro canales leen **el mismo** `indice` y **el
 * mismo** `local`:
 *
 *     p = 0,00 → indice 0 · local 0,00      el primer servicio arranca
 *     p = 1/3  → indice 1 · local 0,00      el nombre cambia Y el párrafo se
 *                                           reinicia Y la lista se reinicia,
 *                                           en el mismo punto
 *     p = 1,00 → indice 2 · local 1,00      el último termina
 *
 * El control positivo es la implementación equivocada: tres canales con su
 * propio progreso, desfasados. Corre por **el mismo predicado** y tiene que
 * fallar.
 */

import { acotar01 } from '../../_lib/acotar'

/** Dónde cae un punto del recorrido: en qué tramo, y cuánto lleva ese tramo. */
export interface TramoDeSecuencia {
  /** El tramo activo, de 0 a `cantidad − 1`. */
  readonly indice: number
  /** El progreso DENTRO del tramo, de 0 a 1. */
  readonly local: number
}

/**
 * El reparto. Es toda la matemática de la secuencia y no tiene ramas salvo el
 * borde de arriba: en `p = 1` el último tramo tiene que quedar completo, no
 * saltar a un tramo que no existe.
 */
export function tramoDeSecuencia(progreso: number, cantidad: number): TramoDeSecuencia {
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw new Error(`secuencia: la cantidad de tramos tiene que ser un entero ≥ 1, vino ${cantidad}`)
  }
  const p = acotar01(progreso)
  const escalado = p * cantidad
  const indice = Math.min(cantidad - 1, Math.floor(escalado))
  return { indice, local: acotar01(escalado - indice) }
}

/** Los puntos del recorrido donde cambia el tramo. Con 3: 1/3 y 2/3. */
export function limitesDeSecuencia(cantidad: number): readonly number[] {
  return Array.from({ length: Math.max(0, cantidad - 1) }, (_, i) => (i + 1) / cantidad)
}

/**
 * LOS CANALES DE UN PUNTO DEL RECORRIDO.
 *
 * Los cuatro que la observación nombra, más la lista que la instrucción agrega.
 * Los discretos guardan un índice; los continuos, un tramo entero.
 */
export interface CanalesDeUnPunto {
  /** Canal discreto — qué nombre de servicio se lee. */
  readonly nombre: number
  /** Canal discreto — qué medio se ve en el panel. */
  readonly medio: number
  /** Canal discreto — qué acento tiñe el contexto. */
  readonly acento: number
  /** Canal continuo — el resaltado progresivo del párrafo (P3). */
  readonly parrafo: TramoDeSecuencia
  /** Canal continuo — la lista que entra ítem por ítem (P4). */
  readonly lista: TramoDeSecuencia
}

/** Un lector de canales: de un progreso a lo que muestra cada canal. */
export type LectorDeCanales = (progreso: number, cantidad: number) => CanalesDeUnPunto

/**
 * LA IMPLEMENTACIÓN CORRECTA: los cinco canales salen del MISMO tramo.
 *
 * No hay cinco cuentas: hay una, y cinco lecturas de ella. Por eso la
 * sincronización no es algo que haya que mantener — es lo único que puede pasar.
 */
export const canalesSincronizados: LectorDeCanales = (progreso, cantidad) => {
  const tramo = tramoDeSecuencia(progreso, cantidad)
  return {
    nombre: tramo.indice,
    medio: tramo.indice,
    acento: tramo.indice,
    parrafo: tramo,
    lista: tramo,
  }
}

/** Una desincronización encontrada, con el punto del recorrido donde ocurre. */
export interface Desincronizacion {
  readonly progreso: number
  readonly detalle: string
}

/** Cuántos puntos se barren. Impar y fino: cae exacto en los límites de 1/3. */
export const MUESTRAS_DEL_BARRIDO = 601

/**
 * EL PREDICADO. Recorre el recorrido entero y busca un punto donde los canales
 * no coincidan.
 *
 * Devuelve la lista y no un booleano: "está desincronizado" no dice dónde, y lo
 * que hay que poder leer en la salida es el punto.
 */
export function desincronizaciones(
  lector: LectorDeCanales,
  cantidad: number,
  muestras: number = MUESTRAS_DEL_BARRIDO,
): Desincronizacion[] {
  const encontradas: Desincronizacion[] = []
  for (let i = 0; i < muestras; i++) {
    const p = i / (muestras - 1)
    const c = lector(p, cantidad)
    const esperado = tramoDeSecuencia(p, cantidad)

    if (c.nombre !== esperado.indice || c.medio !== esperado.indice || c.acento !== esperado.indice) {
      encontradas.push({
        progreso: p,
        detalle: `los canales discretos no coinciden: nombre ${c.nombre} · medio ${c.medio} · acento ${c.acento} — se esperaba ${esperado.indice}`,
      })
      continue
    }
    if (c.parrafo.indice !== esperado.indice || c.lista.indice !== esperado.indice) {
      encontradas.push({
        progreso: p,
        detalle: `los canales continuos están en otro tramo: párrafo ${c.parrafo.indice} · lista ${c.lista.indice} — se esperaba ${esperado.indice}`,
      })
      continue
    }
    if (c.parrafo.local !== esperado.local || c.lista.local !== esperado.local) {
      encontradas.push({
        progreso: p,
        detalle: `los canales continuos avanzan distinto: párrafo ${c.parrafo.local} · lista ${c.lista.local} — se esperaba ${esperado.local}`,
      })
    }
  }
  return encontradas
}

/**
 * Cuántas veces cambia el tramo a lo largo del recorrido. Con 3 tramos tiene
 * que dar 2, y no 0 —una secuencia que no avanza— ni 3 —una que se pasa del
 * último—. Es el contrapeso del predicado de arriba: sin esto, un lector que
 * devolviera siempre el tramo 0 pasaría la simultaneidad con honores.
 */
export function cambiosDeTramo(
  lector: LectorDeCanales,
  cantidad: number,
  muestras: number = MUESTRAS_DEL_BARRIDO,
): number {
  let cambios = 0
  let anterior = lector(0, cantidad).nombre
  for (let i = 1; i < muestras; i++) {
    const actual = lector(i / (muestras - 1), cantidad).nombre
    if (actual !== anterior) cambios += 1
    anterior = actual
  }
  return cambios
}
