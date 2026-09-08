/**
 * LA HUELLA DE UN ELEMENTO — una etiqueta legible, para poder mirarlo después.
 *
 * Vive sola porque la comparten los dos archivos de lectores y **tiene que ser
 * la misma**: dos formas de nombrar un elemento producen dos tablas que no se
 * pueden cruzar, y cruzarlas es lo que este bloque hace todo el tiempo.
 *
 * Es una cadena y no una función porque cruza al proceso del navegador por
 * `Runtime.evaluate`. La barra invertida va doble: la simple la come el
 * literal de plantilla de TypeScript y el `\s` del navegador llegaría como `s`.
 */
export const HUELLA = `(el) => {
  const clase = typeof el.className === 'string' ? el.className : ''
  const marcas = [...el.attributes].filter((a) => a.name.startsWith('data-')).map((a) => a.name + '=' + a.value)
  return el.tagName.toLowerCase() + (marcas.length > 0 ? '[' + marcas.join('][') + ']' : '') + (clase !== '' ? ' .' + clase.trim().split(/\\s+/).join('.') : '')
}`
