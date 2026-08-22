'use client'

import { useSyncExternalStore } from 'react'

/**
 * El tamaño de la ventana, como store externo.
 *
 * `useSyncExternalStore` y no `useState` + efecto: el viewport **es** un store
 * externo, y leerlo así evita el `setState` en un efecto y la desincronización
 * si la ventana cambia entre el render y el listener. Es el mismo patrón que
 * `HeroLogoSlot` usa para su breakpoint.
 *
 * ⚠ Con la pestaña oculta, minimizada o en una ventana de fondo el navegador
 * reporta **0** (lección ya documentada en `CLAUDE.md`). No se corrige acá: se
 * publica el 0 tal cual y quien lo consume decide. En el preloader, un viewport
 * de 0 significa que no hay destino y por lo tanto no hay vuelo — mejor eso que
 * inventar una medida.
 */

export type ViewportSize = {
  readonly width: number
  readonly height: number
}

const SERVER_SIZE: ViewportSize = { width: 0, height: 0 }

// El snapshot tiene que ser ESTABLE por referencia mientras no cambie, o
// `useSyncExternalStore` entra en un bucle de renders.
let cached: ViewportSize = SERVER_SIZE

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange, { passive: true })
  window.addEventListener('orientationchange', onChange, { passive: true })
  return () => {
    window.removeEventListener('resize', onChange)
    window.removeEventListener('orientationchange', onChange)
  }
}

function getSnapshot(): ViewportSize {
  const width = window.innerWidth
  const height = window.innerHeight
  if (width !== cached.width || height !== cached.height) {
    cached = { width, height }
  }
  return cached
}

function getServerSnapshot(): ViewportSize {
  return SERVER_SIZE
}

export function useViewportSize(): ViewportSize {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
