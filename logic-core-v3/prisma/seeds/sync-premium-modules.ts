import { PrismaClient, type PremiumModule } from '@prisma/client'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PREMIUM_MODULES_CATALOG } from '../../src/lib/data/premium-modules'

const prisma = new PrismaClient()

type PremiumModuleWrite = {
  name: string
  shortDescription: string
  longDescription: string | null
  tier: PremiumModule['tier']
  priceMonthlyUsd: number
  iconName: string
  accentColor: string
  validRubros: string[]
  status: PremiumModule['status']
  sortOrder: number
}

type SyncStats = {
  created: number
  updated: number
  unchanged: number
  deleted: number
}

function normalizeCatalogModule(
  moduleData: (typeof PREMIUM_MODULES_CATALOG)[number],
): PremiumModuleWrite {
  return {
    name: moduleData.name,
    shortDescription: moduleData.shortDescription,
    longDescription: moduleData.longDescription ?? null,
    tier: moduleData.tier,
    priceMonthlyUsd: moduleData.priceMonthlyUsd,
    iconName: moduleData.iconName,
    accentColor: moduleData.accentColor,
    validRubros: moduleData.validRubros ?? [],
    status: moduleData.status,
    sortOrder: moduleData.sortOrder,
  }
}

function hasModuleChanged(
  existing: PremiumModule,
  nextData: PremiumModuleWrite,
): boolean {
  return (
    existing.name !== nextData.name ||
    existing.shortDescription !== nextData.shortDescription ||
    existing.longDescription !== nextData.longDescription ||
    existing.tier !== nextData.tier ||
    existing.priceMonthlyUsd !== nextData.priceMonthlyUsd ||
    existing.iconName !== nextData.iconName ||
    existing.accentColor !== nextData.accentColor ||
    existing.status !== nextData.status ||
    existing.sortOrder !== nextData.sortOrder ||
    existing.validRubros.length !== nextData.validRubros.length ||
    existing.validRubros.some((value, index) => value !== nextData.validRubros[index])
  )
}

export async function syncPremiumModules(): Promise<SyncStats> {
  const catalogSlugs = new Set(PREMIUM_MODULES_CATALOG.map((moduleData) => moduleData.slug))
  const existingModules = await prisma.premiumModule.findMany()
  const existingBySlug = new Map(existingModules.map((moduleData) => [moduleData.slug, moduleData]))
  const obsoleteModules = existingModules.filter((moduleData) => !catalogSlugs.has(moduleData.slug))

  if (obsoleteModules.length > 0) {
    const blockers = await Promise.all(
      obsoleteModules.map(async (moduleData) => {
        const activeReferences = await prisma.organizationModule.count({
          where: {
            moduleId: moduleData.id,
            status: 'ACTIVE',
          },
        })

        return {
          slug: moduleData.slug,
          activeReferences,
        }
      }),
    )

    const blockedModules = blockers.filter((blocker) => blocker.activeReferences > 0)

    if (blockedModules.length > 0) {
      const details = blockedModules
        .map((blocker) => `${blocker.slug}: ${blocker.activeReferences} activaciones ACTIVE`)
        .join(', ')

      throw new Error(
        `No se pueden eliminar módulos premium obsoletos con OrganizationModule ACTIVE: ${details}`,
      )
    }
  }

  let deleted = 0

  if (obsoleteModules.length > 0) {
    const obsoleteIds = obsoleteModules.map((moduleData) => moduleData.id)

    await prisma.organizationModule.deleteMany({
      where: {
        moduleId: { in: obsoleteIds },
        status: { not: 'ACTIVE' },
      },
    })

    const deleteResult = await prisma.premiumModule.deleteMany({
      where: {
        id: { in: obsoleteIds },
      },
    })

    deleted = deleteResult.count
  }

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const moduleData of PREMIUM_MODULES_CATALOG) {
    const nextData = normalizeCatalogModule(moduleData)
    const existing = existingBySlug.get(moduleData.slug)

    if (!existing) {
      await prisma.premiumModule.create({
        data: {
          slug: moduleData.slug,
          ...nextData,
        },
      })
      created++
      continue
    }

    if (!hasModuleChanged(existing, nextData)) {
      unchanged++
      continue
    }

    await prisma.premiumModule.update({
      where: { slug: moduleData.slug },
      data: nextData,
    })
    updated++
  }

  return {
    created,
    updated,
    unchanged,
    deleted,
  }
}

export async function runSyncPremiumModules() {
  try {
    const stats = await syncPremiumModules()
    console.log(
      [
        'Premium modules synced',
        `- Created: ${stats.created}`,
        `- Updated: ${stats.updated}`,
        `- Unchanged: ${stats.unchanged}`,
        `- Deleted: ${stats.deleted}`,
      ].join('\n'),
    )
  } catch (error: unknown) {
    console.error('Error syncing premium modules:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? '')).href) {
  void runSyncPremiumModules()
}
