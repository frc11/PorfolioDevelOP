'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { INCLINACION_DEL_TELEFONO } from '../../_lib/escena/giroscopio'
import { hayMovimiento, movimientoGuardado, retomarElMovimiento } from '../../_lib/escena/movimiento'
import { ControlDelMovimiento } from './ControlDelMovimiento'

/** Lo que lee el banco (`scripts-carga/movimiento.ts`): lo que la cámara recibe del sensor y lo guardado en la sesión. */
type VentanaDelBanco = Window & { __entornoDeLaEscena?: string; __movimientoDelBanco?: () => { readonly x: number; readonly y: number; readonly activa: boolean; readonly estado: string; readonly guardado: string | null } }

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
  // Sólo con el banco de la escena puesto.
  useEffect(() => {
    const w = window as VentanaDelBanco
    if (typeof w.__entornoDeLaEscena !== 'string') return undefined
    w.__movimientoDelBanco = () => ({ x: INCLINACION_DEL_TELEFONO.x, y: INCLINACION_DEL_TELEFONO.y, activa: INCLINACION_DEL_TELEFONO.activa, estado: INCLINACION_DEL_TELEFONO.estado, guardado: movimientoGuardado() })
    return () => {
      delete w.__movimientoDelBanco
    }
  }, [])
  if (!hay) return null
  return (
    <div data-pieza="esquina-del-movimiento" className="pointer-events-none fixed top-[max(var(--spacing-4),env(safe-area-inset-top))] right-[max(var(--spacing-4),env(safe-area-inset-right))] z-[var(--z-cabecera)] escritorio:hidden">
      <div data-parte="lugar-del-movimiento">
        <ControlDelMovimiento />
      </div>
    </div>
  )
}
