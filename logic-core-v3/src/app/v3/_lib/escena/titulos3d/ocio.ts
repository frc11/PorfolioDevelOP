/**
 * Con la página ociosa (a lo sumo en 1,5 s); Safari no tiene `requestIdleCallback`: ahí, en 200 ms. Devuelve cómo
 * cancelarlo. [NOCTURNO] A1: salió de `TitulosDeVolumen.tsx` (que pasaba las 300 líneas de código).
 */
export function enOcio(f: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const pedido = window.requestIdleCallback(f, { timeout: 1500 })
    return () => window.cancelIdleCallback(pedido)
  }
  const pedido = window.setTimeout(f, 200)
  return () => window.clearTimeout(pedido)
}
