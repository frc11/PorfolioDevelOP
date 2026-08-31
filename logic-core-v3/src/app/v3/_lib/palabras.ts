/**
 * PARTIR UN TEXTO EN PALABRAS — dos líneas, y viven fuera de `_lib/motion/` por
 * una razón de EMPAQUETADO, no de estilo.
 *
 * ── Por qué se mudaron acá (SITIO-S7) ─────────────────────────────────────
 *
 * Estaban en `_lib/motion/lineas.ts`, que es el divisor de líneas de S2. Ahí
 * tienen todo el sentido del mundo salvo uno: el párrafo que se enciende
 * palabra por palabra en Servicios **también** necesita partir su texto, y ese
 * contenido corre en el árbol QUIETO, el que se sirve abajo de 1025 y no puede
 * importar una línea del sistema de motion.
 *
 * Importar `lineas.ts` sólo por esto habría arrastrado el divisor entero a la
 * carga inicial de `/v3`, con los atributos que declara adentro — y uno de
 * ellos es una de las cinco huellas que `test:s2-bundle` busca. O sea que
 * partir un texto en palabras habría roto la compuerta.
 *
 * Es la misma mudanza, por la misma razón, que la de `acotar.ts`. Que hayan
 * hecho falta dos dice algo del corte: **el sistema de motion tiene átomos de
 * texto y de número que no son de motion**, y quedaron ahí por vecindad. El día
 * que aparezca un tercero, va acá.
 *
 * ⚠ Este comentario NO escribe la huella. Un archivo del árbol quieto que
 * mencionara la cadena literal la metería en el fuente que el instrumento
 * escanea: el minificador la borraría del build, pero cualquier comprobación
 * sobre el CÓDIGO la encontraría. Es un instrumento midiéndose a sí mismo, y ya
 * apareció tres veces en este proyecto.
 */

/**
 * Parte un texto en palabras. Colapsa cualquier espacio en blanco: los saltos de
 * línea del código fuente no son saltos de línea del texto.
 */
export function palabrasDe(texto: string): readonly string[] {
  return texto.trim().split(/\s+/u).filter(Boolean)
}

/**
 * El texto original, normalizado: palabras separadas por un espacio.
 * Es contra esto que el divisor compara su reconstrucción.
 */
export function textoNormalizado(texto: string): string {
  return palabrasDe(texto).join(' ')
}
