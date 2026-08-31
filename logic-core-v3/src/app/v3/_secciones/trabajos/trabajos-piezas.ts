/**
 * PIEZAS DEL INVARIANTE DE TRABAJOS — la parte que no entró en 300 líneas.
 *
 * Son detectores puros, y viven aparte por la misma razón que `s3-escaneo.ts`:
 * el control positivo tiene que poder correr **la misma función** contra una
 * entrada deliberadamente rota. Un detector que se prueba a sí mismo con otra
 * copia del código no prueba nada.
 *
 * ⚠ Este archivo es INSTRUMENTO, no pantalla: está declarado en
 * `ARCHIVOS_DE_APOYO` del padrón y queda fuera del escaneo de tokens y de
 * cifras, porque sus entradas equivocadas llevan a propósito lo que esos
 * escáneres persiguen.
 */

/** Los elementos que no cierran, para que la pila de ancestros no se desbalancee. */
const VACIOS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source'])

/** La cadena de ancestros abiertos sobre la primera aparición de una aguja. */
export function ancestrosDe(html: string, aguja: string): string[] {
  const corte = html.indexOf(aguja)
  if (corte < 0) return []
  const pila: string[] = []
  for (const m of html.slice(0, corte).matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g)) {
    if (m[1] === '/') pila.pop()
    else if (!m[3].trimEnd().endsWith('/') && !VACIOS.has(m[2].toLowerCase())) pila.push(m[0])
  }
  return pila
}

const OCULTA = /\bhidden\b|\bopacity-0\b|\bsr-only\b|visibility:\s*hidden|display:\s*none/
/** La métrica se ve: existe en el marcado Y ningún ancestro suyo la esconde.
 *  `aria-hidden` se saca antes de mirar: contiene la palabra y no oculta nada. */
export function metricaVisible(html: string): boolean {
  const cadena = ancestrosDe(html, '[MÉTRICA]')
  return cadena.length > 0 && cadena.every((t) => !OCULTA.test(t.replace(/aria-hidden="[^"]*"/g, '')))
}
