'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { hayMovimiento, retomarElMovimiento } from '../../_lib/escena/movimiento'
import { ControlDelMovimiento } from './ControlDelMovimiento'

/**
 * [C2-81] LA ESQUINA DEL MOVIMIENTO — arriba a la derecha, enfrente del parlante (`EsquinaDelSonido`), sólo donde va el movimiento
 * (`hayMovimiento`: táctil, abajo de 1024 y con el sensor). En escritorio no hay nada. Se decide después de hidratar (el servidor no sabe
 * qué aparato es): el primer render es sin nada. Al montarse retoma lo de la sesión (`retomarElMovimiento`). Con la cabecera del teléfono
 * retirada al fondo, se retira con ella (`barra.css`, `lugar-del-movimiento`).
 */
const sinCambios = (): (() => void) => () => undefined

export function EsquinaDelMovimiento(): React.JSX.Element | null {
  const hay = useSyncExternalStore(sinCambios, hayMovimiento, () => false)
  useEffect(() => (hay ? retomarElMovimiento() : undefined), [hay])
  if (!hay) return null
  return (
    <div data-pieza="esquina-del-movimiento" className="pointer-events-none fixed top-[max(var(--spacing-4),env(safe-area-inset-top))] right-[max(var(--spacing-4),env(safe-area-inset-right))] z-[var(--z-cabecera)] escritorio:hidden">
      <div data-parte="lugar-del-movimiento">
        <ControlDelMovimiento />
      </div>
    </div>
  )
}
