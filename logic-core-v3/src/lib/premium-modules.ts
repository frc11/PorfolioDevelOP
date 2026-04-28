import { prisma } from '@/lib/prisma'
import type { PremiumModule } from '@prisma/client'


export type PremiumModuleWithStatus = PremiumModule & {
  isActive: boolean
  activatedAt: Date | null
}

/**
 * Lista todos los módulos premium del catálogo, indicando
 * cuáles están activos para una organización dada.
 *
 * Compatibilidad: lee de OrganizationModule (nuevo modelo) Y
 * fallback a User.unlockedFeatures (legacy) durante la migración.
 */
export async function getModulesForOrganization(
  organizationId: string,
): Promise<PremiumModuleWithStatus[]> {
  const [allModules, activeModules] = await Promise.all([
    prisma.premiumModule.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.organizationModule.findMany({
      where: { organizationId, status: 'ACTIVE' },
      include: { module: true },
    }),
  ])

  const activeBySlug = new Map(
    activeModules.map((om) => [om.module.slug, om]),
  )

  return allModules.map((mod) => ({
    ...mod,
    isActive: activeBySlug.has(mod.slug),
    activatedAt: activeBySlug.get(mod.slug)?.activatedAt ?? null,
  }))
}

/**
 * Verifica si una organización tiene un módulo activo.
 */
export async function hasModuleActive(
  organizationId: string,
  moduleSlug: string,
): Promise<boolean> {
  const om = await prisma.organizationModule.findFirst({
    where: {
      organizationId,
      status: 'ACTIVE',
      module: { slug: moduleSlug },
    },
  })
  return Boolean(om)
}

/**
 * Calcula el MRR (Monthly Recurring Revenue) en USD de una
 * organización basado en sus módulos activos.
 */
export async function getMonthlyRecurringRevenue(
  organizationId: string,
): Promise<number> {
  const activeModules = await prisma.organizationModule.findMany({
    where: { organizationId, status: 'ACTIVE' },
  })
  return activeModules.reduce((sum, om) => sum + om.priceLockedUsd, 0)
}

/**
 * Devuelve los slugs de los módulos activos de una organización.
 * Útil para reemplazar consultas a User.unlockedFeatures.
 */
export async function getActiveModuleSlugs(
  organizationId: string,
): Promise<string[]> {
  const modules = await prisma.organizationModule.findMany({
    where: { organizationId, status: 'ACTIVE' },
    include: { module: { select: { slug: true } } },
  })
  return modules.map((om) => om.module.slug)
}

/**
 * Filtra módulos por rubro de la organización.
 * Si validRubros está vacío, el módulo aplica a todos.
 */
export function isModuleValidForRubro(
  module: PremiumModule,
  organizationRubro: string | null,
): boolean {
  if (module.validRubros.length === 0) return true
  if (!organizationRubro) return true
  return module.validRubros.includes(organizationRubro)
}

/**
 * Activa un módulo para una organización.
 * Toma el precio actual del catálogo y lo guarda como snapshot.
 */
export async function activateModule(
  organizationId: string,
  moduleSlug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const module = await prisma.premiumModule.findUnique({
    where: { slug: moduleSlug },
  })
  if (!module) {
    return { ok: false, error: 'Módulo no encontrado' }
  }

  await prisma.organizationModule.upsert({
    where: {
      organizationId_moduleId: {
        organizationId,
        moduleId: module.id,
      },
    },
    create: {
      organizationId,
      moduleId: module.id,
      status: 'ACTIVE',
      priceLockedUsd: module.priceMonthlyUsd,
    },
    update: {
      status: 'ACTIVE',
      pausedAt: null,
      cancelledAt: null,
    },
  })

  return { ok: true }
}

/**
 * Cancela un módulo para una organización (no lo borra).
 */
export async function cancelModule(
  organizationId: string,
  moduleSlug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const module = await prisma.premiumModule.findUnique({
    where: { slug: moduleSlug },
  })
  if (!module) {
    return { ok: false, error: 'Módulo no encontrado' }
  }

  await prisma.organizationModule.update({
    where: {
      organizationId_moduleId: {
        organizationId,
        moduleId: module.id,
      },
    },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  })

  return { ok: true }
}

