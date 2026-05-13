/**
 * State of the avatar — drives all visual variation (rotation speed,
 * particle radius, glow intensity, opacity).
 */
export type NeuroAvatarState =
  | 'idle'       // chat closed or user idle — gentle rotation
  | 'listening'  // user is typing — subtle reaction
  | 'thinking'   // bot is processing the request
  | 'speaking'   // bot is streaming response — energetic
  | 'dormant'    // chat closed for a long time — slow, dimmed

export interface NeuroAvatarProps {
  state: NeuroAvatarState
  accentColor: string  // hex like "#06b6d4"
  /** Size in pixels. Default 56. */
  size?: number
  /** Disables frameloop when not visible to save CPU. */
  frameloop?: 'always' | 'demand' | 'never'
  /** Optional class for the wrapper. */
  className?: string
}

/**
 * Per-state visual config. Used by the internal animation logic.
 */
export interface StateVisualConfig {
  rotationSpeed: number       // rad per frame
  particleRadiusBase: number  // base radius of the sphere
  particleRadiusJitter: number // additional radius variation per particle
  coreScale: number           // scale of the central core
  coreEmissive: number        // emissive intensity of the core
  opacity: number             // overall opacity
  bloomIntensity: number
}

export const STATE_CONFIG: Record<NeuroAvatarState, StateVisualConfig> = {
  idle: {
    rotationSpeed: 0.003,
    particleRadiusBase: 1.0,
    particleRadiusJitter: 0.04,
    coreScale: 0.18,
    coreEmissive: 1.5,
    opacity: 1,
    bloomIntensity: 1.0,
  },
  listening: {
    rotationSpeed: 0.005,
    particleRadiusBase: 1.0,
    particleRadiusJitter: 0.08,
    coreScale: 0.20,
    coreEmissive: 2.0,
    opacity: 1,
    bloomIntensity: 1.2,
  },
  thinking: {
    rotationSpeed: 0.012,
    particleRadiusBase: 1.05,
    particleRadiusJitter: 0.12,
    coreScale: 0.22,
    coreEmissive: 2.5,
    opacity: 1,
    bloomIntensity: 1.5,
  },
  speaking: {
    rotationSpeed: 0.008,
    particleRadiusBase: 1.02,
    particleRadiusJitter: 0.16,
    coreScale: 0.24,
    coreEmissive: 3.0,
    opacity: 1,
    bloomIntensity: 1.8,
  },
  dormant: {
    rotationSpeed: 0.0008,
    particleRadiusBase: 0.95,
    particleRadiusJitter: 0.02,
    coreScale: 0.16,
    coreEmissive: 0.8,
    opacity: 0.5,
    bloomIntensity: 0.5,
  },
}
