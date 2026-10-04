/**
 * [PASADA FINAL] A1 · SI LA ESCENA SE CAYÓ — lo escribe el escudo del canvas (`EscudoDeLaEscena.tsx`) cuando WebGL no
 * está o el lienzo tira; lo lee el DOM que esperaba al 3D (el titular del hero, que desde 1024 no se pinta hasta que sus
 * letras de volumen llegan): con la escena caída muestra su respaldo 2D en el acto, sin esperar el plazo. Sin React ni
 * three: un bit y sus oyentes, para `useSyncExternalStore`.
 */
let cayo = false
const oyentes = new Set<() => void>()

export function marcarLaEscenaCaida(): void {
  if (cayo) return
  cayo = true
  for (const f of oyentes) f()
}

export const laEscenaCayo = (): boolean => cayo

export function suscribirALaCaida(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}
