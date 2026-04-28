import { prisma } from '@/lib/prisma'
import { getConnectionLevel, parseDataConnections } from '@/lib/types/data-connections'

export type AttentionPriority = 'critical' | 'high' | 'medium' | 'low'

export type AttentionItem = {
  id: string
  type: 'billing' | 'approval' | 'message' | 'connection' | 'review'
  priority: AttentionPriority
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  meta?: string
}

const PRIORITY_ORDER: Record<AttentionPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export async function getAttentionItems(organizationId: string): Promise<AttentionItem[]> {
  const items: AttentionItem[] = []

  const [subscription, pendingTask, unreadMsgCount, org] = await Promise.all([
    prisma.subscription
      .findFirst({
        where: { organizationId },
        select: { status: true },
      })
      .catch(() => null),
    prisma.task
      .findFirst({
        where: {
          project: { organizationId },
          approvalStatus: 'PENDING_APPROVAL',
        },
        orderBy: { id: 'asc' },
        select: {
          id: true,
          title: true,
          project: { select: { name: true } },
        },
      })
      .catch(() => null),
    prisma.message
      .count({
        where: { organizationId, fromAdmin: true, read: false },
      })
      .catch(() => 0),
    prisma.organization
      .findUnique({
        where: { id: organizationId },
        select: { dataConnections: true },
      })
      .catch(() => null),
  ])

  if (subscription?.status === 'PAST_DUE') {
    items.push({
      id: 'billing-past-due',
      type: 'billing',
      priority: 'critical',
      title: 'Tu factura esta vencida',
      description: 'Para continuar usando todos los servicios, regulariza tu pago.',
      ctaLabel: 'Ver facturacion',
      ctaHref: '/dashboard/cuenta/facturacion',
    })
  }

  if (pendingTask) {
    items.push({
      id: `approval-${pendingTask.id}`,
      type: 'approval',
      priority: 'high',
      title: 'Una entrega espera tu aprobacion',
      description: `"${pendingTask.title}" del proyecto ${pendingTask.project.name}`,
      ctaLabel: 'Revisar ahora',
      ctaHref: '/dashboard/project',
    })
  }

  if (unreadMsgCount > 0) {
    items.push({
      id: 'messages-unread',
      type: 'message',
      priority: 'medium',
      title:
        unreadMsgCount === 1
          ? 'Tenes 1 mensaje nuevo'
          : `Tenes ${unreadMsgCount} mensajes nuevos`,
      description: 'Tu equipo de develOP te escribio.',
      ctaLabel: 'Leer mensajes',
      ctaHref: '/dashboard/messages',
    })
  }

  if (org) {
    const connections = parseDataConnections(org.dataConnections)
    const { level, connectedCount, totalCount } = getConnectionLevel(connections)

    if (level === 'ONBOARDING') {
      items.push({
        id: 'onboarding-connections',
        type: 'connection',
        priority: 'low',
        title: 'Estamos configurando tu negocio',
        description: `develOP esta conectando tus herramientas (${connectedCount}/${totalCount} listas).`,
        ctaLabel: 'Hablar con el equipo',
        ctaHref: '/dashboard/messages',
      })
    }
  }

  return items.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
}
