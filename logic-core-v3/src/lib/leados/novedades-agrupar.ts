/**
 * LeadOS P21 — El AGRUPAMIENTO de las novedades. Módulo PURO (sin Prisma, sin
 * server-only, sin `Date.now`): vive aparte de `novedades.ts` —que sí importa
 * Prisma— para que el chequeo de invariante pueda ejecutar la función DE VERDAD
 * en lugar de reimplementarla en una fixture. `novedades.ts` lo re-exporta, así
 * que los call-sites no cambian.
 *
 * Qué problema resuelve: la corrida del novato encontró el panel con DOCE
 * entradas de texto idéntico ("Te reasignaron un lead", doce veces, una por cada
 * lead que salió de su cartera). No son doce noticias: son una, repetida. En la
 * cartera real medida había 32 de ese tipo, todas sin nada que abrir.
 */
import type { OsSetterNoticeKind } from '@prisma/client'

/**
 * Cuántas FILAS dibuja el panel después de agrupar. El corte es de filas, no de
 * avisos: lo que se pliega no consume cupo por unidad.
 */
export const FILAS_NOVEDADES = 6

export type AvisoView = {
  id: string
  kind: OsSetterNoticeKind
  title: string
  body: string
  /** "hace 20 min" / "hace 3 h" — antigüedad del aviso. */
  hace: string
  /**
   * A-06 — el lead que "Abrir" ANCLA como foco (no un href de navegación
   * directa): abrir desde un aviso pasa por el MISMO mecanismo del foco, no
   * reconstituye una segunda cola. `null` cuando no hay lead abrible
   * (reasignación-saliente: el setter ya no es dueño → el aviso solo informa).
   */
  leadId: string | null
  /**
   * P23 — ¿la ORDEN de este aviso sigue siendo la que el lead pide? El título es
   * un hecho y no caduca; el cuerpo lleva una orden y sí. Ver
   * `novedades-vigencia.ts`.
   */
  vigente: boolean
  /**
   * Qué pide el lead HOY, cuando la orden del aviso ya no corre. Sale de
   * `proximaAccion` — el MISMO dato que ordena la cola y el foco, así que las
   * dos superficies no pueden mandar cosas distintas. `null` si la orden vale.
   */
  enSuLugar: string | null
}

/**
 * Una FILA del panel. O es un aviso suelto (el que tiene algo que abrir: se
 * muestra entero, con su acción), o es el pliegue de varios avisos del MISMO
 * tipo que no tienen nada que abrir (`cantidad > 1`).
 *
 * El criterio del pliegue NO es el tipo: es si el aviso OFRECE UNA ACCIÓN
 * (`leadId`). Plegar por tipo a secas escondería el "Abrir" de una demo aprobada
 * detrás de un contador; plegar por "no tiene acción" no puede esconder ninguna,
 * porque los que se pliegan no tenían ninguna que esconder. Hoy el único tipo
 * que cae siempre de ese lado es la reasignación-saliente (`leadId: null` por
 * diseño: el setter ya no es dueño), y es justamente el que se repetía doce
 * veces con el mismo texto.
 */
export type FilaNovedad = {
  /** Clave de render: el id del aviso, o el kind cuando la fila es un pliegue. */
  key: string
  kind: OsSetterNoticeKind
  title: string
  /** Cuerpo del aviso (el más nuevo, si la fila pliega varios). */
  body: string
  /** Antigüedad del más nuevo de la fila. */
  hace: string
  /** Cuántos avisos representa. 1 = aviso suelto; >1 = pliegue. */
  cantidad: number
  /** Lead que "Abrir" ancla como foco. Siempre null en una fila plegada. */
  leadId: string | null
  /** P23 — ver `AvisoView.vigente`. Una fila plegada es siempre vigente: los
   *  avisos que se pliegan no dan órdenes (`leadId: null`). */
  vigente: boolean
  /** P23 — ver `AvisoView.enSuLugar`. */
  enSuLugar: string | null
}

/**
 * Agrupa los avisos en filas y las acota. Pura: la testea el invariante.
 *
 * Reglas, en orden:
 *   1. los avisos CON acción (`leadId`) van sueltos, uno por fila — nunca se
 *      pliegan, así que ninguna acción puede quedar escondida detrás de un
 *      contador;
 *   2. los avisos SIN acción se pliegan por `kind` en una sola fila, con el copy
 *      del más nuevo y la cuenta de cuántos son;
 *   3. las filas con acción van primero (es lo que se puede hacer), después los
 *      pliegues informativos;
 *   4. se corta en `tope`; lo que queda afuera se reporta en `ocultos` —
 *      contando AVISOS, no filas: un pliegue de 31 que no entra son 31 ocultos.
 *
 * Asume `avisos` ordenado del más nuevo al más viejo (así lo entrega la query).
 */
export function agruparAvisos(
  avisos: readonly AvisoView[],
  tope: number,
): { filas: FilaNovedad[]; ocultos: number } {
  const conAccion: FilaNovedad[] = []
  const pliegues = new Map<OsSetterNoticeKind, FilaNovedad>()

  for (const aviso of avisos) {
    if (aviso.leadId) {
      conAccion.push({
        key: aviso.id,
        kind: aviso.kind,
        title: aviso.title,
        body: aviso.body,
        hace: aviso.hace,
        cantidad: 1,
        leadId: aviso.leadId,
        vigente: aviso.vigente,
        enSuLugar: aviso.enSuLugar,
      })
      continue
    }
    const previo = pliegues.get(aviso.kind)
    if (previo) {
      previo.cantidad += 1
      continue
    }
    // El primero que se ve de su tipo es el más nuevo (entrada ordenada): su
    // copy y su antigüedad son los que representan al grupo.
    pliegues.set(aviso.kind, {
      key: `grupo-${aviso.kind}`,
      kind: aviso.kind,
      title: aviso.title,
      body: aviso.body,
      hace: aviso.hace,
      cantidad: 1,
      leadId: null,
      // Los que se pliegan no tienen `leadId` y por eso no dan órdenes: no hay
      // nada que pueda caducar. `vigenciaDeAviso` ya devuelve `true` para ellos.
      vigente: aviso.vigente,
      enSuLugar: aviso.enSuLugar,
    })
  }

  const todas = [...conAccion, ...pliegues.values()]
  const cupo = Math.max(0, tope)
  const filas = todas.slice(0, cupo)
  const ocultos = todas.slice(cupo).reduce((suma, fila) => suma + fila.cantidad, 0)

  return { filas, ocultos }
}
