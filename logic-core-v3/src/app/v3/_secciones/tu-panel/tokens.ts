/**
 * LOS TOKENS DEL TEMA, LEÍDOS EN EL NAVEGADOR — el remate los lee para su cronograma. [RETOQUE PANEL] T1: vivían en
 * `vuelo.ts` (la cuenta de la ampliación), que se fue con la ampliación.
 */

/** El valor de un token del tema (`--spacing-20`), leído del documento. */
export function leerToken(nombre: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()
}

/** Un token de largo (`5rem`, `80px`) en px, con la raíz del documento. */
export function pixelesDe(valor: string): number {
  const n = Number.parseFloat(valor)
  if (!Number.isFinite(n)) return 0
  if (!valor.trim().endsWith('rem')) return n
  const raiz = typeof document === 'undefined' ? Number.NaN : Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(raiz) ? n * raiz : 0
}

/** Un token de duración (`500ms`, `0.5s`) en milisegundos. */
export function milisegundosDe(valor: string): number {
  const n = Number.parseFloat(valor)
  if (!Number.isFinite(n)) return 0
  return valor.trim().endsWith('ms') ? n : n * 1000
}
