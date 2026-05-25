import { NeuroAvatar } from './NeuroAvatar'
import { LegacyNeuroAvatarAdapter } from './LegacyNeuroAvatarAdapter'
import { MonogramAvatar } from './MonogramAvatar'
import { PulseAvatar } from './PulseAvatar'
import { GeometricAvatar } from './GeometricAvatar'
import type { AvatarRegistryEntry } from './types'

/**
 * Default avatar id when none is set or the stored id is unknown.
 * Backward-compat anchor: BotConfig.avatarStyle defaults to 'neuro' in DB.
 */
export const DEFAULT_AVATAR_ID = 'neuro'

/**
 * Central catalog of every selectable avatar. The picker UI (B7.3) iterates
 * over this; AvatarRenderer looks up entries by id.
 *
 * NEVER add image/emoji here — those are not registry entries, they bind to
 * a URL / string instead of a component. AvatarRenderer handles them
 * directly as an escape hatch.
 *
 * Currently registered:
 *  - neuro         → NeuroAvatar S7 (Fibonacci particles + glowing core, 3D, heavy)
 *  - legacy_neuro  → LegacyNeuroAvatar via adapter (face-based 3D, preserved, heavy)
 *  - monograma     → Initials on a brand-tinted disc (SVG, light)
 *  - onda          → Voice-assistant rings + central dot (SVG, light)
 *  - geometrico    → Organic blob with micro-expression (SVG, light)
 */
export const AVATAR_REGISTRY: readonly AvatarRegistryEntry[] = [
  {
    id: 'neuro',
    label: 'Orbe Neural',
    description: 'Esfera de partículas con núcleo pulsante. Vibe tech / innovador.',
    weight: 'heavy',
    component: NeuroAvatar,
  },
  {
    id: 'legacy_neuro',
    label: 'Rostro Neural',
    description: 'Cara 3D con micro-expresiones. Vibe asistente con presencia.',
    weight: 'heavy',
    component: LegacyNeuroAvatarAdapter,
  },
  {
    id: 'monograma',
    label: 'Monograma',
    description: 'Iniciales del negocio sobre color de marca. Corporativo y sobrio.',
    weight: 'light',
    component: MonogramAvatar,
  },
  {
    id: 'onda',
    label: 'Onda',
    description: 'Anillos concéntricos al estilo asistente de voz. Limpio y minimalista.',
    weight: 'light',
    component: PulseAvatar,
  },
  {
    id: 'geometrico',
    label: 'Asistente Geométrico',
    description: 'Forma orgánica con micro-expresión. Amigable y profesional.',
    weight: 'light',
    component: GeometricAvatar,
  },
] as const

/**
 * Lookup an avatar entry by id. Returns `undefined` when the id is not in
 * the registry — callers must handle the miss (AvatarRenderer falls back
 * to DEFAULT_AVATAR_ID).
 */
export function getAvatar(id: string | null | undefined): AvatarRegistryEntry | undefined {
  if (!id) return undefined
  return AVATAR_REGISTRY.find((entry) => entry.id === id)
}

/**
 * Lookup with guaranteed fallback to the default avatar. Use this when you
 * must render something no matter what (e.g. AvatarRenderer): an unknown id
 * resolves to the default entry instead of crashing.
 */
export function getAvatarOrDefault(id: string | null | undefined): AvatarRegistryEntry {
  const entry = getAvatar(id)
  if (entry) return entry
  const fallback = AVATAR_REGISTRY.find((e) => e.id === DEFAULT_AVATAR_ID)
  if (!fallback) {
    throw new Error(`AVATAR_REGISTRY missing default entry '${DEFAULT_AVATAR_ID}'`)
  }
  return fallback
}

/**
 * All registered ids — convenience for the picker UI and validation.
 */
export const AVATAR_IDS: readonly string[] = AVATAR_REGISTRY.map((e) => e.id)
