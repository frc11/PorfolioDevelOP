import { MITAD_DEL_CAMBIO_MS } from '../../_lib/pie3d/faqDelPie'

/**
 * [B10] EL BLOQUE DE LA DERECHA — lo que muestra (el aviso o una respuesta) y su cambio, por reloj: al tocar una pregunta se hunde lo que
 * estaba y, a cubierto, sube la respuesta en su lugar (el cambio del formulario del pie: la mitad cada lado). Con otra pregunta, se hunde
 * la anterior y sube la nueva. Pura, como el reloj del FAQ.
 *
 * Si se pide otra mientras se hunde la de antes, sube la última pedida (el cambio no se repite); si se pide mientras sube, al terminar
 * empieza otro cambio. Con la primera respuesta que sube, sube también el bloque de WhatsApp (`primeraEn`).
 */
export type ContenidoDeLaRespuesta = number | 'aviso'

export interface RelojDeLaRespuesta {
  /** Lo que está en el bloque (en la primera mitad del cambio, lo que se hunde; desde la mitad, lo que sube). */
  mostrado: ContenidoDeLaRespuesta
  /** Lo último pedido. */
  pedido: ContenidoDeLaRespuesta
  /** Cuándo empezó el cambio en curso (ms de `performance.now`; −∞: quieto) y si ya se cambiaron. */
  desde: number
  cambiado: boolean
  /** Cuándo empezó a subir la primera respuesta (−∞: todavía ninguna): ahí sube el bloque de WhatsApp. */
  primeraEn: number
}

export const relojDeLaRespuestaQuieto = (): RelojDeLaRespuesta => ({ mostrado: 'aviso', pedido: 'aviso', desde: Number.NEGATIVE_INFINITY, cambiado: false, primeraEn: Number.NEGATIVE_INFINITY })

/** Pide una pregunta (o el aviso). El cambio lo corre `pasoDeLaRespuesta`. */
export function pedirLaRespuesta(r: RelojDeLaRespuesta, c: ContenidoDeLaRespuesta): void {
  r.pedido = c
}

const entre = (x: number): number => Math.min(1, Math.max(0, x))

/**
 * Un cuadro en `ahora`: cuánto está arriba el bloque (0 a 1). Escribe el cambio (lo mostrado, a la mitad). Devuelve también si sigue
 * moviéndose (para pedir otro cuadro) y si cambió lo mostrado (para que React lo pinte).
 */
// [L5] Y `cambio`: el tiempo del cambio en curso (0 a 1), o `null` quieto (el bloque de volumen hace con él el cambio del formulario).
export function pasoDeLaRespuesta(r: RelojDeLaRespuesta, ahora: number): { readonly nivel: number; readonly enCurso: boolean; readonly cambioLoMostrado: boolean; readonly cambio: number | null } {
  const M = MITAD_DEL_CAMBIO_MS
  if (r.desde === Number.NEGATIVE_INFINITY) {
    if (r.pedido === r.mostrado) return { nivel: 1, enCurso: false, cambioLoMostrado: false, cambio: null }
    r.desde = ahora
    r.cambiado = false
  }
  const e = ahora - r.desde
  if (e < M) return { nivel: 1 - entre(e / M), enCurso: true, cambioLoMostrado: false, cambio: entre(e / (2 * M)) }
  let cambioLoMostrado = false
  if (!r.cambiado) {
    r.cambiado = true
    cambioLoMostrado = r.mostrado !== r.pedido
    r.mostrado = r.pedido
    if (r.mostrado !== 'aviso' && r.primeraEn === Number.NEGATIVE_INFINITY) r.primeraEn = r.desde + M
  }
  if (e < 2 * M) return { nivel: entre((e - M) / M), enCurso: true, cambioLoMostrado, cambio: entre(e / (2 * M)) }
  r.desde = Number.NEGATIVE_INFINITY
  r.cambiado = false
  // Se pidió otra mientras subía: otro cambio, desde el próximo cuadro.
  return { nivel: 1, enCurso: r.pedido !== r.mostrado, cambioLoMostrado, cambio: null }
}

/** Cuánto está arriba el bloque de WhatsApp en `ahora` (sube con la primera respuesta y se queda). */
export function nivelDelWhatsApp(r: RelojDeLaRespuesta, ahora: number): number {
  return r.primeraEn === Number.NEGATIVE_INFINITY ? 0 : entre((ahora - r.primeraEn) / MITAD_DEL_CAMBIO_MS)
}
