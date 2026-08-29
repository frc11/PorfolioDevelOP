/**
 * EL DIVISOR DE LÍNEAS — la parte que no se puede calcular.
 *
 * P1 son 142 instancias, el 58 % del corpus, y opera **sobre líneas visuales**,
 * no sobre palabras. Dónde corta una línea depende del ancho disponible, de la
 * familia tipográfica, del tamaño, del `letter-spacing` y del algoritmo de corte
 * del navegador. **No se calcula: se pregunta.**
 *
 * Este módulo es la parte pura de esa pregunta —agrupar palabras en líneas a
 * partir de sus posiciones medidas— más el contrato de accesibilidad que el
 * componente tiene que cumplir. Medir es del componente; agrupar y proteger, de
 * acá, porque son las dos cosas que se pueden comprobar sin navegador.
 *
 * ── Accesibilidad: innegociable ────────────────────────────────────────────
 *
 * Partir un texto en un `<span>` por línea **rompe los lectores de pantalla**:
 * en vez de una frase leen fragmentos sueltos, con una pausa donde el diseñador
 * puso un corte de línea. Y es peor que una molestia, porque el corte depende del
 * ancho: la misma frase se lee distinta en dos ventanas.
 *
 * La protección tiene dos mitades y las dos son obligatorias:
 *
 *   · **El texto completo sobrevive en un nodo accesible.** Acá es una copia
 *     visualmente oculta (`sr-only`), no un `aria-label`: `aria-label` sobre un
 *     elemento sin rol es ignorado por parte de las tecnologías de asistencia, y
 *     el sprint admite las dos formas.
 *   · **Las piezas visuales van `aria-hidden`.** Sin esto la frase se anuncia dos
 *     veces: la copia y los fragmentos.
 *
 * La referencia tiene cinco hallazgos de accesibilidad independientes, incluido
 * que el foco de teclado no tiene ningún indicador visible. No le agregamos un
 * sexto. `__tests__/lineas.invariant.tsx` renderiza el componente REAL a HTML y
 * exige las dos mitades, y corre el mismo predicado contra una versión sin la
 * protección, que tiene que fallar.
 */

/**
 * Tolerancia vertical para decidir que dos palabras están en la misma línea, en
 * píxeles.
 *
 * No es una medida del sistema visual: es el ruido admisible de una comparación.
 * Dos palabras de la misma línea comparten `offsetTop` exacto salvo por
 * redondeo sub-píxel; dos líneas distintas están separadas por el interlineado,
 * que en el sistema es 1,09 del tamaño en títulos —nunca menos de 20 px con la
 * escala tipográfica de develOP—. 2 px queda holgadamente entre los dos.
 */
export const TOLERANCIA_DE_LINEA_PX = 2

/** El atributo que marca la copia accesible. Lo busca el invariante. */
export const ATRIBUTO_TEXTO_ACCESIBLE = 'data-lineas-accesible'

/** El atributo que marca el envoltorio de las piezas visuales. */
export const ATRIBUTO_PIEZAS = 'data-lineas-piezas'

/**
 * Parte un texto en palabras. Colapsa cualquier espacio en blanco: los saltos de
 * línea del código fuente no son saltos de línea del texto.
 */
export function palabrasDe(texto: string): readonly string[] {
  return texto.trim().split(/\s+/u).filter(Boolean)
}

/**
 * Agrupa índices de palabra en líneas, a partir del tope medido de cada palabra.
 *
 * Recorre en orden y abre una línea nueva cuando el tope se aparta del de la
 * línea en curso más que la tolerancia. Es O(n) y no ordena: el orden del texto
 * ES el orden de lectura, y reordenar rompería la frase.
 *
 * Una palabra más ancha que el renglón entero se lleva su propia línea, que es
 * exactamente lo que hace el navegador.
 */
export function agruparEnLineas(
  topes: readonly number[],
  tolerancia: number = TOLERANCIA_DE_LINEA_PX,
): readonly (readonly number[])[] {
  if (topes.length === 0) return []

  const lineas: number[][] = []
  let actual: number[] = [0]
  let topeDeLaLinea = topes[0]

  for (let i = 1; i < topes.length; i++) {
    if (Math.abs(topes[i] - topeDeLaLinea) <= tolerancia) {
      actual.push(i)
      continue
    }
    lineas.push(actual)
    actual = [i]
    topeDeLaLinea = topes[i]
  }
  lineas.push(actual)
  return lineas
}

/**
 * Reconstruye el texto de cada línea a partir del agrupamiento.
 *
 * Es lo que se renderiza, y es también la comprobación de que el agrupamiento no
 * perdió ni duplicó nada: unir las líneas con un espacio tiene que devolver el
 * texto original normalizado.
 */
export function textoDeLineas(
  palabras: readonly string[],
  lineas: readonly (readonly number[])[],
): readonly string[] {
  return lineas.map((indices) => indices.map((i) => palabras[i]).join(' '))
}

/**
 * El texto original, normalizado: palabras separadas por un espacio.
 * Es contra esto que se compara la reconstrucción.
 */
export function textoNormalizado(texto: string): string {
  return palabrasDe(texto).join(' ')
}

/** Una sola línea con todas las palabras: el estado previo a la medición. */
export function lineaUnica(cantidadDePalabras: number): readonly (readonly number[])[] {
  if (cantidadDePalabras === 0) return []
  return [Array.from({ length: cantidadDePalabras }, (_, i) => i)]
}
