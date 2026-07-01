import { prisma } from '@/lib/prisma'
import { countUnread } from './visibility'

/**
 * Feed de novedades del panel para una org. Fetch SEPARADO del NotificationCenter
 * (que hidrata solo take:5 en dashboard/layout.tsx): las novedades tienen su propio
 * límite y no se cuelgan de ese tope. Org-scoped y con caducidad aplicada en la query,
 * espejando el predicado puro de visibility.ts (anti-IDOR: una novedad ORG de otra org
 * no puede matchear porque exige `organizationId` = la org de la sesión).
 */

// Tope del feed. Son novedades curadas (pocas, de baja frecuencia) → un fetch capeado
// alcanza; si algún día crecen, se revisita con paginación (igual que el historial de
// notificaciones). NO es el take:5 del NotificationCenter.
export const ANNOUNCEMENT_FEED_LIMIT = 20

export interface AnnouncementFeedItem {
  id: string
  title: string
  body: string
  publishedAt: Date
  expiresAt: Date | null
  read: boolean
}

export interface AnnouncementsFeed {
  items: AnnouncementFeedItem[]
  unreadCount: number
}

export async function getAnnouncementsForOrg(
  organizationId: string,
  userId: string,
): Promise<AnnouncementsFeed> {
  const now = new Date()

  const rows = await prisma.panelAnnouncement.findMany({
    where: {
      AND: [
        // Vigentes: sin caducidad o con caducidad futura.
        { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        // Alcance: broadcast a todos, o segmentada a ESTA org.
        { OR: [{ audience: 'ALL' }, { audience: 'ORG', organizationId }] },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: ANNOUNCEMENT_FEED_LIMIT,
    select: {
      id: true,
      title: true,
      body: true,
      publishedAt: true,
      expiresAt: true,
      // Relación filtrada: solo las lecturas de ESTE usuario para estas novedades.
      reads: { where: { userId }, select: { id: true } },
    },
  })

  const items: AnnouncementFeedItem[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    publishedAt: row.publishedAt,
    expiresAt: row.expiresAt,
    read: row.reads.length > 0,
  }))

  return { items, unreadCount: countUnread(items) }
}
