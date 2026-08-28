'use client'

import dynamic from 'next/dynamic'

import { CONSULTA_ESCENARIO } from '../_lib/compuerta'
import { useAnchoMinimo } from '../_lib/useAnchoMinimo'

/**
 * LA COMPUERTA DE 1025 — estructural, no cosmética.
 *
 * ── Lo que hace, en una línea ──────────────────────────────────────────────
 *
 * Abajo del umbral este componente devuelve `null`, el `import()` de abajo
 * NUNCA se ejecuta, y el navegador no pide el chunk del escenario. No es una
 * clase de CSS que esconde: **el bundle no se importa**.
 *
 * ── Por qué `ssr: false` no es opcional ────────────────────────────────────
 *
 * Dos cosas a la vez. Primero: el ancho no existe en el servidor, así que el
 * servidor no puede decidir. Segundo, y es la que importa para el bundle: con
 * `ssr: false` webpack emite el módulo en un chunk asíncrono aparte y este
 * archivo se queda solo con la llamada que lo pide. Si el import fuera
 * estático, el escenario viajaría en la carga inicial de `/v3` en TODOS los
 * anchos —incluido mobile— y la compuerta sería decorativa.
 *
 * Eso último no es una afirmación de confianza: la ruta gemela
 * `/v3/control-estatico` hace exactamente el import estático, y
 * `bundle.invariant.ts` comprueba que ahí la marca SÍ aparece en la carga
 * inicial. Es el control positivo — sin él, la comprobación pasaría en verde
 * aunque el escenario no existiera.
 *
 * ── Por qué no hay salto de layout al cruzar el umbral ─────────────────────
 *
 * En los dos sentidos, y por una sola razón: el escenario está `fixed inset-0`
 * (ver `CLASES_FUERA_DE_FLUJO`), o sea que **no ocupa espacio en el flujo del
 * documento**. Montarlo o desmontarlo no puede mover un panel. Y abajo del
 * umbral no se renderiza un placeholder con caja: se renderiza `null`.
 *
 * ── Por qué no hay discrepancia de hidratación ─────────────────────────────
 *
 * `useAnchoMinimo` es `useSyncExternalStore` con snapshot de servidor en
 * `false`. React usa ese snapshot también en el render de hidratación, así que
 * el primer render de cliente es idéntico al HTML servido —los dos sin
 * escenario— y el valor real entra recién en el re-render. Nunca se lee
 * `window` durante el render.
 */
const EscenarioDePrueba = dynamic(() => import('./EscenarioDePrueba'), { ssr: false })

export function EscenarioCompuerta() {
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_ESCENARIO)

  if (!arribaDelUmbral) return null

  return <EscenarioDePrueba />
}
