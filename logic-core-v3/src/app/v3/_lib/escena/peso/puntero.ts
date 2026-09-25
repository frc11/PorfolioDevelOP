/**
 * [ESCENA 4] EL PUNTERO FINO — dónde está el mouse (o el lápiz) en NDC de la ventana, si está adentro
 * y si es de verdad un puntero con hover. En táctil `fino` queda en falso: ahí no hay cursor que
 * seguir. Lo comparten el peso del logo y la lente de la cúpula.
 */
export interface Puntero {
  readonly x: number
  readonly y: number
  readonly adentro: boolean
  readonly fino: boolean
}

export interface PunteroVivo {
  readonly leer: () => Puntero
  readonly soltar: () => void
}

export function crearPuntero(): PunteroVivo {
  const consulta = window.matchMedia('(hover: hover) and (pointer: fine)')
  let actual: Puntero = { x: 0, y: 0, adentro: false, fino: false }
  const alMover = (e: PointerEvent): void => {
    actual = {
      x: (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
      y: 1 - (e.clientY / Math.max(1, window.innerHeight)) * 2,
      adentro: true,
      fino: consulta.matches && (e.pointerType === 'mouse' || e.pointerType === 'pen'),
    }
  }
  const alSalir = (e: PointerEvent): void => {
    if (e.relatedTarget === null) actual = { ...actual, adentro: false }
  }
  window.addEventListener('pointermove', alMover, { passive: true })
  document.addEventListener('pointerout', alSalir, { passive: true })
  return {
    leer: () => actual,
    soltar: () => {
      window.removeEventListener('pointermove', alMover)
      document.removeEventListener('pointerout', alSalir)
    },
  }
}
