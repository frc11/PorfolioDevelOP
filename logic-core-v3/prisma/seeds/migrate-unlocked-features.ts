import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapeo de slugs viejos (en unlockedFeatures) a nuevos slugs del catálogo
const LEGACY_TO_NEW_SLUG: Record<string, string> = {
  'whatsapp-autopilot': 'whatsapp-autopilot',
  'agenda-inteligente': 'agenda-inteligente',
  'social-media-hub': 'email-marketing-pro', // social media → email marketing
  'seo-avanzado': '', // DEPRECATED — no migrar
  'ecommerce': 'tienda-conectada',
  'reactivacion-clientes': 'reactivacion-clientes',
  'motor-resenias': 'motor-resenas',
  'mini-crm': 'mini-crm',
  'email-nurturing': 'email-marketing-pro', // nurturing → email marketing
  'email-automation': 'email-marketing-pro',
  'pixel-retargeting': 'email-marketing-pro',
  'client-portal': '', // Deprecated maybe?
}

async function migrateUnlockedFeatures() {
  console.log('🔄 Migrating legacy unlockedFeatures to OrganizationModule...')

  const orgsWithUsers = await prisma.organization.findMany({
    include: {
      members: {
        include: { user: { select: { unlockedFeatures: true } } },
      },
    },
  })

  let migratedCount = 0
  let skippedCount = 0

  for (const org of orgsWithUsers) {
    // Recolectar TODAS las features de TODOS los users de la org
    const allFeatures = new Set<string>()
    for (const member of org.members) {
      for (const feat of member.user.unlockedFeatures) {
        allFeatures.add(feat)
      }
    }

    for (const legacySlug of allFeatures) {
      const newSlug = LEGACY_TO_NEW_SLUG[legacySlug]
      if (!newSlug) {
        console.log(`  ⚠ Skipping legacy slug "${legacySlug}" (deprecated or unknown)`)
        skippedCount++
        continue
      }

      const module = await prisma.premiumModule.findUnique({
        where: { slug: newSlug },
      })

      if (!module) {
        console.log(`  ⚠ Module "${newSlug}" not found in catalog, skipping`)
        skippedCount++
        continue
      }

      await prisma.organizationModule.upsert({
        where: {
          organizationId_moduleId: {
            organizationId: org.id,
            moduleId: module.id,
          },
        },
        create: {
          organizationId: org.id,
          moduleId: module.id,
          status: 'ACTIVE',
          priceLockedUsd: module.priceMonthlyUsd,
        },
        update: {}, // si ya existe, no tocar
      })

      console.log(`  ✓ ${org.companyName} → ${newSlug}`)
      migratedCount++
    }
  }

  console.log(`✅ Migrated: ${migratedCount} | Skipped: ${skippedCount}`)
}

migrateUnlockedFeatures()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
