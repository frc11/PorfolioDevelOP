import type { ServiceStatus, ServiceType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type CurrentPlan = {
  hasActiveServices: boolean
  hasActiveModules: boolean
  services: Array<{
    id: string
    name: string
    type: string
    startedAt: Date | null
    status: 'ACTIVE' | 'PAUSED' | 'ENDED'
  }>
  premiumModules: Array<{
    slug: string
    name: string
    priceMonthlyUsd: number
    activatedAt: Date | null
    nextBillingAt: Date | null
  }>
  monthlyTotal: number
  nextBillingAt: Date | null
}

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  WEB_DEV: 'Desarrollo Web',
  AI: 'Inteligencia Artificial',
  AUTOMATION: 'Automatización',
  SOFTWARE: 'Software a Medida',
}

function mapServiceStatus(status: ServiceStatus): 'ACTIVE' | 'PAUSED' | 'ENDED' {
  if (status === 'CANCELLED') return 'ENDED'
  return status
}

export async function getCurrentPlan(organizationId: string): Promise<CurrentPlan> {
  const [services, modules] = await Promise.all([
    prisma.service.findMany({
      where: {
        organizationId,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
      select: {
        id: true,
        type: true,
        startDate: true,
        status: true,
      },
      orderBy: { startDate: 'asc' },
    }),
    prisma.organizationModule.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
      include: {
        module: {
          select: {
            slug: true,
            name: true,
            priceMonthlyUsd: true,
          },
        },
      },
      orderBy: { activatedAt: 'asc' },
    }),
  ])

  const monthlyTotal = modules.reduce(
    (sum, om) => sum + (om.module.priceMonthlyUsd ?? 0),
    0,
  )

  const now = new Date()
  const nextBillingAt =
    modules.length > 0 ? new Date(now.getFullYear(), now.getMonth() + 1, 1) : null

  return {
    hasActiveServices: services.length > 0,
    hasActiveModules: modules.length > 0,
    services: services.map((s) => ({
      id: s.id,
      name: SERVICE_TYPE_LABELS[s.type],
      type: s.type,
      startedAt: s.startDate,
      status: mapServiceStatus(s.status),
    })),
    premiumModules: modules.map((om) => ({
      slug: om.module.slug,
      name: om.module.name,
      priceMonthlyUsd: om.module.priceMonthlyUsd ?? 0,
      activatedAt: om.activatedAt ?? null,
      nextBillingAt,
    })),
    monthlyTotal,
    nextBillingAt,
  }
}
