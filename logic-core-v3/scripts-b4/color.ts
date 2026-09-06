/**
 * LUMINANCIA RELATIVA Y CONTRASTE WCAG — la mitad de color del banco.
 *
 * Vive aparte del decodificador porque son dos cosas distintas: uno lee bytes de
 * un archivo, el otro aplica una fórmula del estándar. Partirlos deja que el
 * control positivo de cada uno pruebe una sola cosa.
 *
 * ── ⚠️ LA REGLA DE MÉTODO QUE B1 DEJÓ Y QUE ACÁ SE HEREDA ─────────────────
 *
 * **El contraste va bajo el GLIFO, no bajo la caja del renglón** (`B1-DELTAS`
 * §4-bis). La caja de un renglón es casi todo fondo, así que una partícula
 * oscura de 3 px que cae entre dos letras hunde el «peor píxel» sin volver
 * ilegible nada: medido sobre el titular del hero a 1440, la caja da 3,04:1 y el
 * glifo 10,45:1. Este módulo da la fórmula; **quién es glifo lo decide el
 * procedimiento de tres capturas de §4-bis**, y una cifra de contraste de este
 * bloque que no diga cuál de los dos usó no está terminada.
 */

/** Un canal sRGB de 0..255 llevado a lineal. Es la parte de la fórmula que la gente saltea. */
function aLineal(canal: number): number {
  const c = canal / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** Luminancia relativa WCAG 2.x. 0 = negro, 1 = blanco. */
export function luminancia(r: number, g: number, b: number): number {
  return 0.2126 * aLineal(r) + 0.7152 * aLineal(g) + 0.0722 * aLineal(b)
}

/**
 * Contraste WCAG entre dos luminancias. Devuelve el número de la razón, o sea
 * 21 para blanco contra negro y 1 para dos colores iguales. El orden no importa.
 */
export function contraste(l1: number, l2: number): number {
  const claro = Math.max(l1, l2)
  const oscuro = Math.min(l1, l2)
  return (claro + 0.05) / (oscuro + 0.05)
}

/** El piso de AA para texto normal. Está acá para que nadie lo escriba a mano en un frente. */
export const AA_TEXTO_NORMAL = 4.5
/** El piso de AA para texto grande (≥ 24 px, o ≥ 18,66 px en negrita). */
export const AA_TEXTO_GRANDE = 3

/**
 * La luminancia de cada píxel de una imagen RGBA, como banda plana.
 *
 * ⚠️ **El alfa se ignora, y hay que decir por qué.** Una captura de
 * `Page.captureScreenshot` viene ya COMPUESTA sobre el fondo de la página: no
 * hay transparencia que resolver, y el canal alfa vale 255 en todas partes. Si
 * alguien le pasara a esta función una imagen con alfa real —un PNG recortado—
 * el número saldría mal y en silencio. No es el caso de este banco, y queda
 * escrito para el día que alguien lo intente.
 */
export function bandaDeLuminancia(datos: Uint8Array, ancho: number, alto: number): Float64Array {
  const banda = new Float64Array(ancho * alto)
  for (let i = 0; i < ancho * alto; i += 1) {
    const k = i * 4
    banda[i] = luminancia(datos[k], datos[k + 1], datos[k + 2])
  }
  return banda
}
