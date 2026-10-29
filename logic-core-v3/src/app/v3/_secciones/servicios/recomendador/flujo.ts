import { PREGUNTAS, recomendar, type IdDeSolucion, type Respuestas } from './logica'

/**
 * [C2-51] EL FLUJO DEL RECOMENDADOR — puro (sin React): en qué etapa está, qué respondió, el procesando, el resultado y cuál eligió.
 * El componente lo corre con `useReducer`; `s78-c2-51` lo prueba sin navegador.
 *
 *   preguntas   tres etapas, una pregunta cada una. «Siguiente» sin respuesta marca la falta (y no avanza); «Atrás» vuelve una
 *               etapa y conserva lo respondido. En la última, «Siguiente» es «Ver mi recomendación» y pasa al procesando.
 *   procesando  el loader con sus tres líneas; al terminar (`procesado`), el resultado.
 *   resultado   las dos soluciones; `elegir` una (sólo A o B, y una sola vez) las cambia, en el mismo lugar, por el contacto; `volver` (lo
 *               que pasa después de un envío) trae las dos soluciones de nuevo.
 *   `reiniciar` («Empezar de nuevo») vuelve al principio, vacío.
 */

export type FaseDelRecomendador = 'preguntas' | 'procesando' | 'resultado'

export interface EstadoDelRecomendador {
  readonly fase: FaseDelRecomendador
  readonly etapa: number
  readonly respuestas: readonly (number | null)[]
  /** Tocó «Siguiente» sin elegir: se ve el aviso hasta que elija. */
  readonly falta: boolean
  readonly elegida: IdDeSolucion | null
}

export const INICIO_DEL_RECOMENDADOR: EstadoDelRecomendador = { fase: 'preguntas', etapa: 0, respuestas: PREGUNTAS.map(() => null), falta: false, elegida: null }

export type AccionDelRecomendador =
  | { readonly tipo: 'responder'; readonly opcion: number }
  | { readonly tipo: 'siguiente' }
  | { readonly tipo: 'atras' }
  | { readonly tipo: 'procesado' }
  | { readonly tipo: 'elegir'; readonly solucion: IdDeSolucion }
  | { readonly tipo: 'volver' }
  | { readonly tipo: 'reiniciar' }

/** Las tres respuestas, si están todas. */
export function respuestasCompletas(r: readonly (number | null)[]): Respuestas | null {
  const [a, b, c] = r
  return r.length === PREGUNTAS.length && typeof a === 'number' && typeof b === 'number' && typeof c === 'number' ? [a, b, c] : null
}

export function avanzar(e: EstadoDelRecomendador, accion: AccionDelRecomendador): EstadoDelRecomendador {
  switch (accion.tipo) {
    case 'responder': {
      const opciones = PREGUNTAS[e.etapa]?.opciones.length ?? 0
      if (e.fase !== 'preguntas' || !Number.isInteger(accion.opcion) || accion.opcion < 0 || accion.opcion >= opciones) return e
      return { ...e, respuestas: e.respuestas.map((r, i) => (i === e.etapa ? accion.opcion : r)), falta: false }
    }
    case 'siguiente': {
      if (e.fase !== 'preguntas') return e
      if (e.respuestas[e.etapa] === null || e.respuestas[e.etapa] === undefined) return { ...e, falta: true }
      if (e.etapa < PREGUNTAS.length - 1) return { ...e, etapa: e.etapa + 1, falta: false }
      return respuestasCompletas(e.respuestas) === null ? e : { ...e, fase: 'procesando', falta: false }
    }
    case 'atras':
      return e.fase === 'preguntas' && e.etapa > 0 ? { ...e, etapa: e.etapa - 1, falta: false } : e
    case 'procesado':
      return e.fase === 'procesando' ? { ...e, fase: 'resultado' } : e
    case 'elegir': {
      const r = respuestasCompletas(e.respuestas)
      if (e.fase !== 'resultado' || e.elegida !== null || r === null) return e
      const { a, b } = recomendar(r)
      return accion.solucion === a || accion.solucion === b ? { ...e, elegida: accion.solucion } : e
    }
    // [L4] Después de enviar: el contacto se va y vuelven las dos soluciones (las respuestas se conservan).
    case 'volver':
      return e.fase === 'resultado' && e.elegida !== null ? { ...e, elegida: null } : e
    case 'reiniciar':
      return INICIO_DEL_RECOMENDADOR
  }
}
