'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { snapshotServidor } from './compuerta'

/**
 * Lee un media query de ancho como store externo.
 *
 * `useSyncExternalStore` y no `useState` + `useEffect`: `matchMedia` ES un
 * store externo, así que éste es el hook que React tiene para el caso. Sin
 * `setState` en un efecto —que dispara un render en cascada— y sin
 * desincronizarse si el viewport cambia después de montar.
 *
 * ── Por qué esto resuelve la hidratación ───────────────────────────────────
 *
 * El ancho no existe en el servidor. React usa `getServerSnapshot` también
 * durante el render de HIDRATACIÓN, no solo en el SSR: el primer render de
 * cliente devuelve `false`, idéntico al HTML servido, y el valor real entra en
 * el re-render posterior. **El escenario no puede causar hidratación distinta
 * del HTML servido**, que es la condición que el sprint pide.
 *
 * Lo que NO se puede hacer, y es el error que este hook evita: leer
 * `window.innerWidth` o `matchMedia(...)` durante el render. Eso da un primer
 * render de cliente distinto del servidor y React lo reporta como mismatch —
 * o peor, lo repara en silencio y deja el árbol inconsistente.
 *
 * Es el mismo patrón que ya usa `components/layout/HeroLogoSlot.tsx`. Se
 * reescribe acá en vez de importarlo porque el árbol de /v3 no depende del
 * árbol viejo: el viejo se borra cuando /v3 reemplace al home.
 *
 * ⚠ El nombre arranca en inglés (`use…`) y sigue en español a propósito. No es
 * inconsistencia con la convención del árbol: `react-hooks/rules-of-hooks`
 * identifica los hooks POR EL NOMBRE, y con `usarAnchoMinimo` el linter no
 * reconoce que esto es un hook —lo reportó como error— y deja de verificar las
 * reglas adentro. El prefijo `use` es requisito de React, no estilo.
 */
export function useAnchoMinimo(consulta: string): boolean {
  const suscribir = useCallback(
    (alCambiar: () => void) => {
      const mql = window.matchMedia(consulta)
      mql.addEventListener('change', alCambiar)
      return () => mql.removeEventListener('change', alCambiar)
    },
    [consulta],
  )

  return useSyncExternalStore(suscribir, () => window.matchMedia(consulta).matches, snapshotServidor)
}
