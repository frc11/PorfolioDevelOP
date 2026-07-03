import { useSyncExternalStore } from 'react'

const subscribeNoop = () => () => {}

/**
 * "Ya montó" hidratación-safe vía `useSyncExternalStore` con snapshots estables
 * (true en cliente, false en server). Es la forma correcta de diferir un cálculo
 * dependiente del reloj del cliente SIN setState-dentro-de-effect (que dispara
 * cascading renders — regla `react-hooks/set-state-in-effect`). Server y primer
 * render de cliente coinciden en `false` (sin hydration mismatch); recién después
 * de hidratar pasa a `true` y se calcula el "hace X".
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )
}
