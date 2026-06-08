'use client'

import { useMemo } from 'react'
import { LegacyNeuroAvatar } from './LegacyNeuroAvatar'
import { mapStateToLegacyProps } from './legacyStateMapper'
import type { AvatarComponentProps } from './types'
import styles from './LegacyNeuroAvatarAdapter.module.css'

/**
 * Adapter wrapping the FROZEN LegacyNeuroAvatar to the canonical
 * AvatarComponentProps contract via `mapStateToLegacyProps`.
 *
 * Sizing: LegacyNeuroAvatar hardcodes its wrapper to h-28/md:h-56 (112/224px)
 * and renders its own R3F <Canvas>. We size a plain box to `size` and force the
 * wrapper to fill it via the CSS module — no transform (a previous
 * `transform: scale()` stopped R3F from measuring the canvas). The canvas itself
 * is sized robustly from inside via <CanvasAutoResize/> (rendered inside the
 * frozen component's <Canvas>), which defeats the R3F mount-time measure race.
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
    <div className={styles.fit} style={{ width: size, height: size }}>
      <LegacyNeuroAvatar {...legacyProps} />
    </div>
  )
}
