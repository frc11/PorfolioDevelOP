import type { PanelAnnouncementAudience } from '@prisma/client'

/**
 * Reglas PURAS de visibilidad de una novedad del panel para un cliente. Es el corazón
 * del aislamiento (anti-IDOR) y de la caducidad, separado de Prisma para poder testearlo
 * sin DB. La query del feed (get-announcements-for-org) espeja exactamente este predicado.
 */

/** Lo mínimo de una novedad para decidir si un viewer la ve. */
export interface AnnouncementVisibility {
  audience: PanelAnnouncementAudience
  /** Org destinataria cuando audience = ORG; null para ALL. */
  organizationId: string | null
  /** Caducidad; null = no caduca. */
  expiresAt: Date | null
}

/** Contexto del cliente que mira el feed. */
export interface ViewerContext {
  organizationId: string
  now: Date
}

/** Una novedad caduca cuando tiene fecha y esa fecha ya pasó (o es exactamente ahora). */
export function isAnnouncementExpired(expiresAt: Date | null, now: Date): boolean {
  return expiresAt !== null && expiresAt.getTime() <= now.getTime()
}

/**
 * ¿Este viewer ve esta novedad?
 * - Caducada → nunca (no se vuelve ruido).
 * - audience ALL → sí (broadcast a todas las orgs).
 * - audience ORG → SOLO si es de la org del viewer. Un cliente jamás ve una novedad
 *   segmentada de otra org (anti-IDOR estructural: el orgId ajeno no puede colarse).
 */
export function isAnnouncementVisibleTo(
  announcement: AnnouncementVisibility,
  viewer: ViewerContext,
): boolean {
  if (isAnnouncementExpired(announcement.expiresAt, viewer.now)) return false
  if (announcement.audience === 'ALL') return true
  return announcement.audience === 'ORG' && announcement.organizationId === viewer.organizationId
}

/**
 * Filtra una lista al subconjunto visible para el viewer y la ordena por publicación
 * (más reciente primero). Determinista. Una novedad ORG de otra org nunca sobrevive
 * al filtro (anti-IDOR a nivel de lista).
 */
export function selectVisibleAnnouncements<
  T extends AnnouncementVisibility & { publishedAt: Date },
>(announcements: readonly T[], viewer: ViewerContext): T[] {
  return announcements
    .filter((announcement) => isAnnouncementVisibleTo(announcement, viewer))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

/** Cuenta las no leídas de un conjunto ya resuelto (cada item trae su flag `read`). */
export function countUnread(items: ReadonlyArray<{ read: boolean }>): number {
  return items.reduce((total, item) => (item.read ? total : total + 1), 0)
}
