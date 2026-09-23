'use client'

/**
 * LA MÁQUINA DE ESCRIBIR DEL CTA — el recorte por palabra y el cursor.
 *
 * ⚠ Vive en su propio archivo por la regla de las 300 líneas, con el corte por
 * TEMA: acá está todo lo que escribe la frase, y nada que mire al túnel.
 *
 * ── ⚠️ DE QUÉ DEPENDE, Y EL DEFECTO QUE ESTO CIERRA ──────────────────────
 *
 * Depende de UNA cosa: cuánto de su tamaño final lleva la ventana del CTA. No
 * de un reloj, no de una ventana de scroll propia, no del avance en e-plegados.
 *
 * La distinción no es cosmética. Cuando el tipeo colgaba de la fracción de la
 * ventana de SCROLL —lineal en e-plegados— y la escala pasó a ser exponencial,
 * las dos dejaron de ser la misma cosa: en la fracción 0,72 la ventana medía el
 * **13 % de su tamaño final**. O sea que la frase terminaba de escribirse con la
 * ventana todavía diminuta y todo el crecimiento visible ocurría con el cartel
 * ya completo. Se reportó como «se fue el efecto de escritura», y era
 * exactamente eso: no se veía escribir nada, se veía crecer un cartel escrito.
 */

import { cabezaDelTipeo, letrasEscritas } from './tunel'

/**
 * Escribe la frase hasta donde le toca y pone el cursor en la cabeza de tipeo.
 *
 * ── ⚠️ EL CURSOR VA POSICIONADO, EN CAJA DE LAYOUT ───────────────────────
 *
 * `offsetLeft`/`offsetTop`/`offsetWidth` y NO `getBoundingClientRect`: la
 * ventana del CTA lleva una escala viva, y un rect vendría multiplicado por ella
 * —el cursor se iría alejando a medida que la ventana crece—. La caja de layout
 * no la toca ninguna transformada.
 *
 * Y el `left` no se escribe: se traslada. Escribir `left` por cuadro invalida
 * layout; una transformada no.
 *
 * @param fraccionDelTamano cuánto de su tamaño final lleva la ventana, 0 a 1.
 */
export function pintarElTipeo(
  frase: HTMLDivElement | null,
  cursor: HTMLSpanElement | null,
  fraccionDelTamano: number,
  letrasDeLaFrase: number,
): void {
  if (frase === null) return

  // El tipeo es un RECORTE por palabra: se reparten las letras escritas entre
  // las palabras, en orden, y cada una se descubre de izquierda a derecha en la
  // fracción que le tocó.
  const escritas = letrasEscritas(fraccionDelTamano, letrasDeLaFrase)
  let restan = escritas
  const palabras = frase.querySelectorAll('[data-palabra]')
  const largos: number[] = []
  for (let k = 0; k < palabras.length; k += 1) {
    const el = palabras[k] as HTMLElement
    const largo = (el.getAttribute('data-palabra') ?? '').length
    largos.push(largo)
    const visibles = Math.max(0, Math.min(largo, restan))
    restan -= visibles
    const oculto = largo === 0 ? 0 : (1 - visibles / largo) * 100
    el.style.setProperty('clip-path', `inset(0 ${oculto.toFixed(2)}% 0 0)`)
  }

  const cabeza = cabezaDelTipeo(escritas, largos)
  const palabra = palabras[cabeza.palabra] as HTMLElement | undefined
  if (cursor === null || palabra === undefined) return
  const x = palabra.offsetLeft + palabra.offsetWidth * cabeza.fraccion
  cursor.style.setProperty('transform', `translate(${x.toFixed(1)}px, ${palabra.offsetTop.toFixed(1)}px)`)
}
