import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Gate de hidratación SIN setState-en-effect (cumple `react-hooks/set-state-in-effect`).
 *
 * Devuelve `false` en SSR y en el primer render de hidratación (matchea el server, sin
 * mismatch), y `true` en cliente una vez hidratado. Pensado para montar portales
 * (`createPortal(..., document.body)`) solo en cliente, evitando tocar `document` en SSR.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}
