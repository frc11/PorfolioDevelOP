/**
 * [INTERFAZ 1] Cierre · LLEVAR LA PÁGINA ADONDE LA CAPA DE DEMOS TERMINA DE LLEGAR, cuando la enfoca el teclado.
 *
 * La llegada de la capa no tiene reloj propio (`CapaDeDemos`: es una función de la fracción del vacío, y lo afirma
 * `demos-invariante`). Esto tampoco lo tiene sobre la capa: SÓLO mueve la página. Hace falta porque lo mostrado persigue al
 * scroll a través del regulador del túnel y, con la página quieta, se asienta por DETRÁS del salto (medido a 390: la capa
 * quedaba en escala 0,76, la primera portada del carrusel tapada a medias por el túnel y su anillo de foco cortado).
 * Mientras no llegó, la página avanza lo que le falta a lo mostrado, cada 0,4 s y como mucho seis veces.
 *
 * Devuelve cómo cancelarlo (un foco nuevo o el desmontaje).
 */
export function llevarALaLlegada(opciones: {
  readonly destino: number
  readonly alto: number
  readonly arranque: number
  readonly mostrado: () => number
  readonly llego: () => boolean
}): () => void {
  let pendiente = 0
  const completar = (intentos: number): void => {
    if (opciones.llego() || intentos === 0) return
    const falta = opciones.arranque - opciones.mostrado()
    if (falta > 0) window.scrollBy({ top: Math.ceil(falta * opciones.alto) })
    pendiente = window.setTimeout(() => completar(intentos - 1), 400)
  }
  window.scrollTo({ top: opciones.destino })
  pendiente = window.setTimeout(() => completar(6), 800)
  return () => window.clearTimeout(pendiente)
}
