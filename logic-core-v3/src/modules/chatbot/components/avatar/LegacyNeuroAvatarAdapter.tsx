'use client'

import { useMemo } from 'react'
import { LegacyNeuroAvatar } from './LegacyNeuroAvatar'
import { mapStateToLegacyProps } from './legacyStateMapper'
import type { AvatarComponentProps } from './types'

/**
 * Adapter that wraps LegacyNeuroAvatar (1041 lines, phase + booleans-based)
 * so it satisfies the canonical AvatarComponentProps contract.
 *
 * The underlying LegacyNeuroAvatar is FROZEN — we never touch its internals.
 * This adapter translates the 3-state canonical model into the legacy prop
 * shape via `mapStateToLegacyProps`.
 */
export function LegacyNeuroAvatarAdapter({
  state,
  accentColor,
  size = 56,
}: AvatarComponentProps) {
  const legacyProps = useMemo(
    () => mapStateToLegacyProps(state, accentColor, 0),
    [state, accentColor]
  )

  // LegacyNeuroAvatar (FROZEN) renderiza con clases CSS hardcoded h-28/md:h-56
  // (= 112-224px) que ignoran este `size` prop. Para que respete el contenedor
  // chico (sidebar, ChatHeader, preview), envolvemos en un box del size pedido
  // con `overflow: hidden` y escalamos el avatar legacy al ratio correcto
  // usando el peor caso (224px en desktop). El transformOrigin del legacy es
  // `bottom right`, así que mantenemos esa misma esquina como anchor.
  const scale = size / 224

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 224,
          height: 224,
          transform: `scale(${scale})`,
          transformOrigin: 'bottom right',
        }}
      >
        <LegacyNeuroAvatar {...legacyProps} />
      </div>
    </div>
  )
}
