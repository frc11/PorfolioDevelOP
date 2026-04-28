const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const prisma = new PrismaClient()

async function backup() {
  const mp = await prisma.modulePricing.findMany()
  const pm = await prisma.premiumModule.findMany()
  const om = await prisma.organizationModule.findMany()

  fs.mkdirSync('prisma/backups', { recursive: true })
  fs.writeFileSync('prisma/backups/module-pricing-legacy.json', JSON.stringify(mp, null, 2))
  fs.writeFileSync('prisma/backups/premium-module-pre-push.json', JSON.stringify(pm, null, 2))
  fs.writeFileSync('prisma/backups/organization-module-pre-push.json', JSON.stringify(om, null, 2))

  console.log('Backup done.')
  console.log('  ModulePricing rows:', mp.length)
  console.log('  PremiumModule rows:', pm.length)
  console.log('  OrgModule rows:', om.length)

  await prisma.$disconnect()
}

backup().catch((e) => {
  console.error(e)
  process.exit(1)
})
