import { z } from 'zod'
import { AVATAR_IDS } from './registry'

/**
 * Escape-hatch ids that aren't registered components (they bind to a URL
 * or emoji string instead). Always allowed in admin mutations.
 */
export const AVATAR_ESCAPE_HATCHES = ['image', 'emoji'] as const

/**
 * Full set of valid avatar styles accepted by admin server actions.
 * Combines every registry id with the two escape hatches.
 *
 * Computed lazily (the registry is a runtime array) so adding a new
 * registry entry is a zero-touch change here.
 */
function allAdminStyles(): string[] {
  return [...AVATAR_IDS, ...AVATAR_ESCAPE_HATCHES]
}

/**
 * Set of styles the CLIENT dashboard exposes — only the 5 registry
 * avatars, no escape hatches. The 'image' style is reserved for the
 * custom-photo flow (post-B-SEC). 'emoji' is intentionally excluded:
 * Monograma covers the "letters on a disc" use case more coherently.
 */
function allClientStyles(): string[] {
  return [...AVATAR_IDS]
}

/**
 * Zod schema for any avatar style accepted by ADMIN mutations.
 * Source of truth: registry ids + escape hatches.
 */
export const AVATAR_STYLE_SCHEMA = z
  .string()
  .refine((value) => allAdminStyles().includes(value), {
    message: 'Estilo de avatar no soportado',
  })

/**
 * Zod schema for CLIENT-side mutations (dashboard). Same surface but
 * without the escape hatches.
 */
export const CLIENT_AVATAR_STYLE_SCHEMA = z
  .string()
  .refine((value) => allClientStyles().includes(value), {
    message: 'Estilo de avatar no soportado',
  })

/**
 * Type guard: does this string match any registered avatar id (no
 * escape hatches)? Used by client UI to fall back safely when reading
 * legacy DB values.
 */
export function isRegisteredAvatarId(value: string): boolean {
  return AVATAR_IDS.includes(value)
}
