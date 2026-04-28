import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_CONNECTIONS = {
  ga4: { connected: false, lastSync: null },
  searchConsole: { connected: false, lastSync: null },
  googleBusinessProfile: { connected: false, lastSync: null },
  whatsappBusiness: { connected: false, lastSync: null },
  afip: { connected: false, lastSync: null },
  pixel: { connected: false, lastSync: null },
}

async function initDataConnections() {
  console.log('Inicializando dataConnections en organizaciones existentes...')

  const orgs = await prisma.organization.findMany({
    where: { dataConnections: { equals: null as any } },
    select: {
      id: true,
      companyName: true,
      analyticsPropertyId: true,
      siteUrl: true,
      whatsapp: true,
    },
  })

  console.log(`Found ${orgs.length} orgs sin dataConnections`)

  let count = 0
  for (const org of orgs) {
    const connections = {
      ...DEFAULT_CONNECTIONS,
      ga4: {
        connected: Boolean(org.analyticsPropertyId),
        lastSync: org.analyticsPropertyId ? new Date().toISOString() : null,
      },
      searchConsole: {
        connected: Boolean(org.siteUrl),
        lastSync: org.siteUrl ? new Date().toISOString() : null,
      },
      whatsappBusiness: {
        connected: Boolean(org.whatsapp),
        lastSync: org.whatsapp ? new Date().toISOString() : null,
      },
    }

    await prisma.organization.update({
      where: { id: org.id },
      data: { dataConnections: connections },
    })

    console.log(`  - ${org.companyName}`)
    count++
  }

  console.log(`${count} organizaciones inicializadas`)
}

initDataConnections()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
