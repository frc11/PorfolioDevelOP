import { cuandoElVeloQuede } from '../../veloDeNavegacion'

/**
 * Con la página ociosa (a lo sumo en 1,5 s); Safari no tiene `requestIdleCallback`: ahí, en 200 ms. Devuelve cómo
 * cancelarlo. [NOCTURNO] A1: salió de `TitulosDeVolumen.tsx` (que pasaba las 300 líneas de código).
 * [B12a.8] (4) Y con el velo de la navegación quieto: el ocio llegaba mientras destapaba (369 ms en el build, llegando al home).
 */
export function enOcio(f: () => void): () => void {
  let soltar = (): void => undefined
  const sinElVelo = cuandoElVeloQuede(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const pedido = window.requestIdleCallback(f, { timeout: 1500 })
      soltar = () => window.cancelIdleCallback(pedido)
      return
    }
    const pedido = window.setTimeout(f, 200)
    soltar = () => window.clearTimeout(pedido)
  })
  return () => {
    sinElVelo()
    soltar()
  }
}
