import type { ComponentType } from 'react'

/**
 * Canonical avatar state — the public contract every avatar in the
 * registry must implement. Three states cover the entire bot lifecycle:
 *
 *  - idle      → chat closed, waiting for input, or no activity
 *  - thinking  → bot is processing (pendingSubmit / status === 'submitted')
 *  - speaking  → bot is streaming a response (status === 'streaming')
 */
export type AvatarCoreState = 'idle' | 'thinking' | 'speaking'

/**
 * Backward-compat alias. Older code (LogicCompanion, ChatHeader, useChatbot,
 * legacyStateMapper, etc.) still imports `NeuroAvatarState`. Kept as a pure
 * alias of `AvatarCoreState` so the existing call sites continue to compile
 * without churn. Prefer `AvatarCoreState` in new code.
 */
export type NeuroAvatarState = AvatarCoreState

/**
 * Weight class of an avatar. Drives the picker UI in B7.3 (badge "ligero"
 * vs "pesado") and lets us recommend lights for mobile-first tenants.
 *
 *  - heavy → 3D / WebGL (R3F + Three.js). High visual impact, higher cost.
 *  - light → SVG / CSS / canvas 2D. Cheap, mobile-friendly.
 */
export type AvatarWeight = 'heavy' | 'light'

/**
 * Common props every avatar in the registry receives from AvatarRenderer.
 * The contract is intentionally minimal:
 *
 *  - state           → canonical 3-state lifecycle (required)
 *  - accentColor     → brand hex from BotConfig.accentColor
 *  - size            → render size in px (default 56)
 *  - businessInitials→ optional, used by the Monogram avatar (B7.2). Heavy
 *                      avatars ignore it. Wired from BotConfig.botName in B7.2.
 *  - className       → wrapper class hook
 *  - frameloop       → R3F frameloop hint, ignored by non-3D avatars
 */
export interface AvatarComponentProps {
  state: AvatarCoreState
  accentColor: string
  size?: number
  businessInitials?: string
  className?: string
  frameloop?: 'always' | 'demand' | 'never'
}

/**
 * Type of any concrete avatar component. Used by AvatarRegistryEntry.
 */
export type AvatarComponent = ComponentType<AvatarComponentProps>

/**
 * Identifier of an avatar in the registry. Persisted in BotConfig.avatarStyle.
 * Kept as a `string` union (not enum) so adding a new id in B7.2 is a
 * one-line registry change with zero Prisma migration.
 *
 * NOTE: 'image' and 'emoji' are NOT registry ids — they are escape hatches
 * handled directly by AvatarRenderer (they bind to a URL / emoji string,
 * not to a component).
 */
export type AvatarKindId = 'neuro' | 'legacy_neuro' | (string & {})

/**
 * Entry in the avatar registry. The registry is the single source of truth
 * for "what avatars exist". AvatarRenderer reads from it; the picker UI
 * (B7.3) iterates over it.
 */
export interface AvatarRegistryEntry {
  /** Internal id, persisted in BotConfig.avatarStyle. */
  id: string
  /** Commercial label shown in the admin/dashboard picker. */
  label: string
  /** One-line description shown under the label. */
  description: string
  /** Weight class — drives badges and mobile recommendations. */
  weight: AvatarWeight
  /** The React component that implements AvatarComponentProps. */
  component: AvatarComponent
  /**
   * Optional render-size multiplier. Heavy 3D avatars frame their subject with
   * margin (the model never fills the canvas the way a flat SVG disc does), so
   * at a given box size their visible content reads smaller than the light
   * avatars'. `fillScale` enlarges this avatar's rendered box so its *content*
   * matches the others at the same nominal size. Default 1 (no scaling).
   * Applied via `getAvatarRenderSize` at the call sites that own the container.
   */
  fillScale?: number
}

/**
 * Per-state visual config for NeuroAvatar S7. Internal to the heavy
 * 3D avatar; not part of the public contract.
 */
export interface StateVisualConfig {
  rotationSpeed: number
  particleRadiusBase: number
  particleRadiusJitter: number
  coreScale: number
  coreEmissive: number
  opacity: number
  bloomIntensity: number
}

/**
 * NeuroAvatar S7 visual config keyed by canonical state.
 *
 * The previous 5-state model ('listening' and 'dormant') was collapsed into
 * the canonical 3-state contract: 'listening' folded into 'idle' (subtle
 * baseline), 'dormant' is no longer emitted by useChatbot (chat-closed now
 * returns 'idle' with full opacity — visible avatars don't fade out).
 */
export const STATE_CONFIG: Record<AvatarCoreState, StateVisualConfig> = {
  idle: {
    rotationSpeed: 0.003,
    particleRadiusBase: 1.0,
    particleRadiusJitter: 0.04,
    coreScale: 0.22,
    coreEmissive: 1.5,
    opacity: 1,
    bloomIntensity: 1.0,
  },
  thinking: {
    rotationSpeed: 0.012,
    particleRadiusBase: 1.05,
    particleRadiusJitter: 0.12,
    coreScale: 0.26,
    coreEmissive: 2.5,
    opacity: 1,
    bloomIntensity: 1.5,
  },
  speaking: {
    rotationSpeed: 0.008,
    particleRadiusBase: 1.02,
    particleRadiusJitter: 0.16,
    coreScale: 0.28,
    coreEmissive: 3.0,
    opacity: 1,
    bloomIntensity: 1.8,
  },
}

/**
 * Props of the canonical NeuroAvatar component. Extends AvatarComponentProps
 * with the 3D-specific `frameloop` hint already declared in the parent.
 *
 * Kept as a named interface so existing imports of `NeuroAvatarProps`
 * (from index.ts) keep working.
 */
export type NeuroAvatarProps = AvatarComponentProps
