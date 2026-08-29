'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { CONSULTA_MENOS_MOVIMIENTO } from './cursor'

/**
 * Lee `prefers-reduced-motion` como store externo.
 *
 * Mismo patrón que `useAnchoMinimo`, y por las mismas razones: `matchMedia`
 * ES un store externo, así que `useSyncExternalStore` es el hook que React
 * tiene para el caso — sin `setState` en un efecto y sin desincronizarse si la
 * preferencia cambia después de montar (en Windows y en macOS se puede cambiar
 * con la ventana abierta).
 *
 * ── El snapshot de servidor es `true`, y NO por simetría ───────────────────
 *
 * `useAnchoMinimo` devuelve `false` en el servidor porque el ancho no existe y
 * `false` es "no montes". Acá el valor que significa "no montes" es el
 * CONTRARIO: `true` es "prefiere menos movimiento".
 *
 * Devolver `true` es la opción conservadora, y es la que corresponde: el
 * servidor no sabe la preferencia, y ante la duda lo que no se hace es
 * moverse. El costo de equivocarse hacia `true` es un fotograma sin cursor
 * propio; el costo de equivocarse hacia `false` es montar movimiento en la
 * cara de alguien que pidió que no.
 *
 * React usa este snapshot también durante el render de HIDRATACIÓN, así que
 * el primer render de cliente coincide con el HTML servido y el valor real
 * entra en el re-render posterior. Nunca se lee `matchMedia` durante el render.
 */
export function usePrefiereMenosMovimiento(): boolean {
  const suscribir = useCallback((alCambiar: () => void) => {
    const mql = window.matchMedia(CONSULTA_MENOS_MOVIMIENTO)
    mql.addEventListener('change', alCambiar)
    return () => mql.removeEventListener('change', alCambiar)
  }, [])

  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(CONSULTA_MENOS_MOVIMIENTO).matches,
    snapshotDeServidor,
  )
}

/**
 * `true` siempre. Es función y no una constante para que el hook la pase por
 * referencia estable — `useSyncExternalStore` compara identidades y una
 * función nueva por render lo haría releer en cada uno.
 */
export function snapshotDeServidor(): boolean {
  return true
}
