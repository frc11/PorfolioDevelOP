/**
 * [CIERRE A-ter] A13 · LAS FUENTES DEL DOM, para lo que se imprime midiendo el DOM (los títulos de volumen, las piezas del pie, la tarjeta de
 * gracias o de error) y para lo que mide cajas (la época de medición). `document.fonts.ready` resuelve cuando no hay nada cargando EN ESE
 * MOMENTO, no cuando la fuente de un texto está: con la red lenta un título se armaba con la x de cada letra medida con la de respaldo y nunca
 * se rehacía. Ahora:
 *
 *   · `esperarLaFuenteDe(el)`: la cara exacta con que el DOM pinta ese elemento (estilo, peso, cuerpo y familia) para su texto
 *     (`document.fonts.load`); si la red falla, igual (con la de respaldo: mejor algo que nada, y al cargar se rehace);
 *   · `alCargarseLasFuentes(f)`: cada vez que termina de cargar una tanda de caras (`loadingdone`): lo medido con otra métrica se rehace.
 *
 * `?reimpresion=no` es la bandera del control positivo de s75 (con el arnés y las fuentes demoradas): la espera de antes y sin rehacer.
 */

/** La fuente con que el DOM pinta un elemento, como la piden `document.fonts.load` y `check`. */
export function fuenteDe(el: Element): string {
  const s = getComputedStyle(el)
  return `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`
}

/** ¿Están cargadas las caras con que el DOM pinta este elemento, para su texto? */
export function fuenteCargadaPara(el: Element): boolean {
  try {
    return document.fonts.check(fuenteDe(el), el.textContent ?? '')
  } catch {
    return false
  }
}

/** Resuelve cuando la cara de este elemento está cargada (o falló: no se espera para siempre). */
export function esperarLaFuenteDe(el: Element): Promise<void> {
  return document.fonts.load(fuenteDe(el), el.textContent || 'A').then(
    () => undefined,
    () => undefined,
  )
}

let reimpresion: boolean | null = null
/** Sin `?reimpresion=no` (la bandera del control positivo): se espera la fuente de cada texto y se rehace lo medido cuando carga otra. */
export function conReimpresion(): boolean {
  reimpresion ??= typeof window === 'undefined' || new URLSearchParams(window.location.search).get('reimpresion') !== 'no'
  return reimpresion
}

const oyentes = new Set<() => void>()
let cableado = false
let tandas = 0

function cablear(): void {
  if (cableado || typeof document === 'undefined' || document.fonts === undefined) return
  cableado = true
  document.fonts.addEventListener('loadingdone', () => {
    tandas += 1
    for (const g of [...oyentes]) g()
  })
}

/** Cada vez que termina de cargar una tanda de caras. Devuelve cómo dejar de escuchar. */
export function alCargarseLasFuentes(f: () => void): () => void {
  oyentes.add(f)
  cablear()
  return () => {
    oyentes.delete(f)
  }
}

/** Cuántas tandas de caras terminaron de cargar desde que se pregunta (para la firma de lo que se imprime por cuadro: barata). */
export function versionDeLasFuentes(): number {
  cablear()
  return tandas
}
