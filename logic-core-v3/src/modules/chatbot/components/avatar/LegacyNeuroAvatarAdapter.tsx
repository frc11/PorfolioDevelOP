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

  return (
    <div style={{ width: size, height: size }}>
      <LegacyNeuroAvatar {...legacyProps} />
    </div>
  )
}
