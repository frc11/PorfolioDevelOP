'use server'

import type { Prisma } from '@prisma/client'
import {
  ProjectStatus,
  ServiceStatus,
  ServiceType,
  SubscriptionStatus,
  TicketStatus,
} from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { estimateLastLoginAt } from '@/lib/client-health'
import {
  startImpersonationAction as startImpersonationActionBase,
  stopImpersonationAction as stopImpersonationActionBase,
} from '@/lib/actions/impersonation'
import {
  GetClientByIdSchema,
  GetClientHealthScoreSchema,
  ToggleModulePremiumSchema,
} from './client.schemas'

type ClientListRecord = Prisma.OrganizationGetPayload<{
  include: {
    subscription: true
    members: {
      select: {
        user: {
          select: {
            id: true
            name: true
            email: true
            role: true
          }
        }
      }
    }
    _count: {
      select: {
        tickets: true
        messages: true
        projects: true
      }
    }
  }
}>

type ClientDetailRecord = Prisma.OrganizationGetPayload<{
  include: {
    subscription: true
    members: {
      include: {
        user: {
          include: {
            sessions: {
              orderBy: {
                expires: 'desc'
              }
              take: 1
              select: {
                expires: true
              }
            }
          }
        }
      }
    }
    services: true
    projects: {
      include: {
        tasks: true
        paymentMilestones: true
      }
    }
    tickets: true
    messages: true
  }
}>

type ClientListItem = Omit<ClientListRecord, 'members'> & {
  users: Array<{
    id: string
    name: string | null
    email: string
    role: ClientListRecord['members'][number]['user']['role']
  }>
}

type ClientDetailItem = Omit<ClientDetailRecord, 'members'> & {
  users: Array<ClientDetailRecord['members'][number]['user']>
}

type HealthFactor = {
  label: string
  impact: number
}

type HealthScoreResult = {
  score: number
  factors: HealthFactor[]
}

const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  ProjectStatus.PLANNING,
  ProjectStatus.IN_PROGRESS,
  ProjectStatus.REVIEW,
]

const UNRESOLVED_TICKET_STATUSES: TicketStatus[] = [
  TicketStatus.OPEN,
  TicketStatus.IN_PROGRESS,
]

const MODULE_KEY_TO_SERVICE_TYPE: Record<string, ServiceType> = {
  web_dev: ServiceType.WEB_DEV,
  'web-dev': ServiceType.WEB_DEV,
  web: ServiceType.WEB_DEV,
  website: ServiceType.WEB_DEV,
  site: ServiceType.WEB_DEV,
  ai: ServiceType.AI,
  ia: ServiceType.AI,
  'whatsapp-autopilot': ServiceType.AI,
  automation: ServiceType.AUTOMATION,
  automatizacion: ServiceType.AUTOMATION,
  automations: ServiceType.AUTOMATION,
  'agenda-inteligente': ServiceType.AUTOMATION,
  'social-media-hub': ServiceType.AUTOMATION,
  'seo-avanzado': ServiceType.AUTOMATION,
  'pixel-retargeting': ServiceType.AUTOMATION,
  'motor-resenias': ServiceType.AUTOMATION,
  'email-nurturing': ServiceType.AUTOMATION,
  'email-automation': ServiceType.AUTOMATION,
  software: ServiceType.SOFTWARE,
  'custom-software': ServiceType.SOFTWARE,
  ecommerce: ServiceType.SOFTWARE,
  'mini-crm': ServiceType.SOFTWARE,
  'client-portal': ServiceType.SOFTWARE,
}

function normalizeUsersFromMembers(
  members: Array<{ user: ClientListRecord['members'][number]['user'] }>
) {
  return members.map((member) => member.user)
}

function normalizeClientListItem(organization: ClientListRecord): ClientListItem {
  const { members, ...rest } = organization

  return {
    ...rest,
    users: normalizeUsersFromMembers(members),
  }
}

function normalizeClientDetailItem(organization: ClientDetailRecord): ClientDetailItem {
  const { members, ...rest } = organization

  return {
    ...rest,
    users: members.map((member) => member.user),
  }
}

function resolveModuleServiceType(moduleKey: string): ServiceType | null {
  const trimmed = moduleKey.trim()
  if (!trimmed) {
    return null
  }

  const directMatch = Object.values(ServiceType).find((value) => value === trimmed)
  if (directMatch) {
    return directMatch
  }

  return MODULE_KEY_TO_SERVICE_TYPE[trimmed.toLowerCase()] ?? null
}

function resolveLatestLoginAt(
  members: Array<{
    user: {
      sessions: Array<{
        expires: Date
      }>
    }
  }>
): Date | null {
  let latestLoginAt: Date | null = null

  for (const member of members) {
    const estimatedLoginAt = estimateLastLoginAt(member.user.sessions[0]?.expires)
    if (!estimatedLoginAt) {
      continue
    }

    if (!latestLoginAt || estimatedLoginAt > latestLoginAt) {
      latestLoginAt = estimatedLoginAt
    }
  }

  return latestLoginAt
}

export async function startImpersonationAction(organizationId: string) {
  return startImpersonationActionBase(organizationId)
}

export async function stopImpersonationAction() {
  return stopImpersonationActionBase()
}

export async function listClients(): Promise<ActionResult<ClientListItem[]>> {
  try {
    await requireSuperAdmin()

    const organizations = await prisma.organization.findMany({
      include: {
        subscription: true,
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            tickets: true,
            messages: true,
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return ok(organizations.map(normalizeClientListItem))
  } catch (error) {
    console.error('listClients error:', error)
    return fail('No se pudieron listar los clientes.')
  }
}

export async function getClientById(
  id: string
): Promise<ActionResult<ClientDetailItem>> {
  try {
    await requireSuperAdmin()
    const organizationId = GetClientByIdSchema.parse(id)

    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        subscription: true,
        members: {
          orderBy: {
            joinedAt: 'asc',
          },
          include: {
            user: {
              include: {
                sessions: {
                  orderBy: {
                    expires: 'desc',
                  },
                  take: 1,
                  select: {
                    expires: true,
                  },
                },
              },
            },
          },
        },
        services: {
          orderBy: {
            startDate: 'desc',
          },
        },
        projects: {
          orderBy: {
            name: 'asc',
          },
          include: {
            tasks: {
              orderBy: {
                position: 'asc',
              },
            },
            paymentMilestones: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
        tickets: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    })

    if (!organization) {
      return fail('Cliente no encontrado.')
    }

    return ok(normalizeClientDetailItem(organization))
  } catch (error) {
    console.error('getClientById error:', error)
    return fail('No se pudo cargar el cliente.')
  }
}

export async function getClientHealthScore(
  organizationId: string
): Promise<ActionResult<HealthScoreResult>> {
  try {
    await requireSuperAdmin()
    const id = GetClientHealthScoreSchema.parse(organizationId)

    const organization = await prisma.organization.findUnique({
      where: {
        id,
      },
      include: {
        subscription: {
          select: {
            status: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                sessions: {
                  orderBy: {
                    expires: 'desc',
                  },
                  take: 1,
                  select: {
                    expires: true,
                  },
                },
              },
            },
          },
        },
        projects: {
          where: {
            status: {
              in: ACTIVE_PROJECT_STATUSES,
            },
          },
          select: {
            id: true,
          },
        },
      },
    })

    if (!organization) {
      return fail('Cliente no encontrado.')
    }

    const [openTicketsCount, unreadAdminMessagesCount] = await Promise.all([
      prisma.ticket.count({
        where: {
          organizationId: id,
          status: {
            in: UNRESOLVED_TICKET_STATUSES,
          },
        },
      }),
      prisma.message.count({
        where: {
          organizationId: id,
          fromAdmin: true,
          read: false,
        },
      }),
    ])

    const latestLoginAt = resolveLatestLoginAt(organization.members)
    const hasRecentLogin =
      latestLoginAt !== null &&
      Date.now() - latestLoginAt.getTime() < 7 * 24 * 60 * 60 * 1000

    const factors: HealthFactor[] = []

    if (organization.subscription?.status === SubscriptionStatus.ACTIVE) {
      factors.push({ label: 'Suscripcion activa', impact: 30 })
    } else {
      factors.push({ label: 'Sin suscripcion activa', impact: 0 })
    }

    if (hasRecentLogin) {
      factors.push({ label: 'Ultimo login dentro de 7 dias', impact: 20 })
    } else {
      factors.push({ label: 'Sin login reciente', impact: 0 })
    }

    if (openTicketsCount > 0) {
      factors.push({
        label: `${openTicketsCount} ticket(s) abierto(s)`,
        impact: -10 * openTicketsCount,
      })
    }

    if (unreadAdminMessagesCount > 0) {
      factors.push({
        label: `${unreadAdminMessagesCount} mensaje(s) del admin sin leer`,
        impact: -5 * unreadAdminMessagesCount,
      })
    }

    if (organization.projects.length > 0) {
      factors.push({ label: 'Tiene proyectos activos', impact: 20 })
    } else {
      factors.push({ label: 'Sin proyectos activos', impact: 0 })
    }

    const score = Math.max(
      0,
      Math.min(
        100,
        factors.reduce((total, factor) => total + factor.impact, 0)
      )
    )

    return ok({
      score,
      factors,
    })
  } catch (error) {
    console.error('getClientHealthScore error:', error)
    return fail('No se pudo calcular el health score del cliente.')
  }
}

export async function toggleModulePremium(
  organizationId: string,
  moduleKey: string,
  enabled: boolean
): Promise<ActionResult<{ enabled: boolean; serviceType: ServiceType }>> {
  try {
    await requireSuperAdmin()
    const parsed = ToggleModulePremiumSchema.parse({ organizationId, moduleKey, enabled })
    const id = parsed.organizationId
    const serviceType = resolveModuleServiceType(parsed.moduleKey)
    if (!serviceType) {
      return fail('Modulo premium invalido.')
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    })

    if (!organization) {
      return fail('Cliente no encontrado.')
    }

    const activeService = await prisma.service.findFirst({
      where: {
        organizationId: id,
        type: serviceType,
        status: ServiceStatus.ACTIVE,
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    if (enabled) {
      if (!activeService) {
        const reusableService = await prisma.service.findFirst({
          where: {
            organizationId: id,
            type: serviceType,
          },
          orderBy: {
            startDate: 'desc',
          },
        })

        if (reusableService) {
          await prisma.service.update({
            where: {
              id: reusableService.id,
            },
            data: {
              status: ServiceStatus.ACTIVE,
              startDate: reusableService.startDate ?? new Date(),
            },
          })
        } else {
          await prisma.service.create({
            data: {
              organizationId: id,
              type: serviceType,
              status: ServiceStatus.ACTIVE,
            },
          })
        }
      }
    } else {
      await prisma.service.updateMany({
        where: {
          organizationId: id,
          type: serviceType,
          status: {
            in: [ServiceStatus.ACTIVE, ServiceStatus.PAUSED],
          },
        },
        data: {
          status: ServiceStatus.CANCELLED,
        },
      })
    }

    revalidatePath('/admin/os/clients')
    revalidatePath(`/admin/os/clients/${id}`)

    return ok({
      enabled,
      serviceType,
    })
  } catch (error) {
    console.error('toggleModulePremium error:', error)
    return fail('No se pudo actualizar el modulo premium.')
  }
}
