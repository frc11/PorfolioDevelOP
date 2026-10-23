/**
 * [C2-50] EL AJUSTE DE LAS LETRAS DE UN SERVICIO — en el DOM, sin React (lo corre la coreografía cada vez que mide: al montar, al
 * cambiar de tamaño y cuando llega una letra).
 *
 *   · `ajustarElTexto`: el texto del medio ocupa TODO el alto de su franja (ítem 13, «de techo a pie»): el cuerpo más grande con el
 *     que todavía entra (búsqueda binaria entre el piso y el tope que pone la hoja), sin desbordar. Como la franja tiene su alto fijo
 *     (la grilla del panel), entrar es `scrollHeight <= clientHeight`.
 *   · `ajustarElTitulo`: el título del servicio, lo más grande que da la hoja, pero ninguna palabra más ancha que su columna (las
 *     palabras no se parten: «AUTOMATIZACIONES» manda en IA).
 */

/** El piso de los dos ajustes (px): por debajo, se deja desbordar antes que volverlo ilegible. */
export const PISO_DEL_TEXTO = 14
export const PISO_DEL_TITULO = 20

const tamanoDeLaHoja = (el: HTMLElement): number => {
  el.style.removeProperty('font-size')
  return Number.parseFloat(getComputedStyle(el).fontSize) || PISO_DEL_TEXTO
}

/** El tamaño más grande (entre `piso` y `tope`) con el que `entra()`; ocho pasos de búsqueda binaria. Puro: lo prueba s81. */
export function tamanoQueEntra(piso: number, tope: number, entra: (tamano: number) => boolean): number {
  if (!(tope > piso)) return piso
  if (entra(tope)) return tope
  let [abajo, arriba] = [piso, tope]
  for (let i = 0; i < 8; i += 1) {
    const medio = (abajo + arriba) / 2
    if (entra(medio)) abajo = medio
    else arriba = medio
  }
  return abajo
}

export function ajustarElTexto(caja: HTMLElement): void {
  const parrafos = caja.querySelector<HTMLElement>('[data-parte="parrafos"]')
  if (parrafos === null || !(caja.clientHeight > 0)) return
  const tope = tamanoDeLaHoja(parrafos)
  const tamano = tamanoQueEntra(PISO_DEL_TEXTO, tope, (t) => {
    parrafos.style.fontSize = `${t.toFixed(2)}px`
    return caja.scrollHeight <= caja.clientHeight + 1
  })
  parrafos.style.fontSize = `${tamano.toFixed(2)}px`
}

export function ajustarElTitulo(titulo: HTMLElement): void {
  if (!(titulo.clientWidth > 0)) return
  const tope = tamanoDeLaHoja(titulo)
  const tamano = tamanoQueEntra(PISO_DEL_TITULO, tope, (t) => {
    titulo.style.fontSize = `${t.toFixed(2)}px`
    return titulo.scrollWidth <= titulo.clientWidth + 1
  })
  titulo.style.fontSize = `${tamano.toFixed(2)}px`
}
