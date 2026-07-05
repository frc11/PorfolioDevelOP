// scripts/p41-inject-campaigns.ts
// P4.1 — Clona un ChatbotLead existente para inyectar filas de prueba CON utmCampaign.
// Clona en vez de construir → hereda todos los campos obligatorios reales, sin adivinar.
// ⚠ Escribe en la Neon compartida — avisá a Franco antes. Cleanup: --clean.
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()
const TAG = 'p41-test'

async function main() {
  const clean = process.argv.includes('--clean')

  if (clean) {
    const del = await prisma.chatbotLead.deleteMany({ where: { name: { startsWith: 'ZZ P41' } } })
    console.log(`🧹 Borrados ${del.count} leads de prueba.`)
    return
  }

  // Tomo un lead existente como molde (hereda botConfigId, conversationId y todo lo obligatorio).
  const molde = await prisma.chatbotLead.findFirst({ orderBy: { capturedAt: 'desc' } })
  if (!molde) throw new Error('No hay ningún ChatbotLead para clonar. Usá la opción A (flujo del widget).')

  const campaigns = [
    { suffix: 'Ana',  campaign: 'promo_diciembre' },
    { suffix: 'Beto', campaign: 'promo_diciembre' },
    { suffix: 'Caro', campaign: 'black-friday-2025' },
    { suffix: 'Dani', campaign: 'launch_q3' },
  ]

  for (const c of campaigns) {
    // Copio el molde, saco id/fechas autogeneradas, piso nombre + campaña.
    const { id, createdAt, updatedAt, capturedAt, ...rest } = molde as Record<string, unknown>
    await prisma.chatbotLead.create({
      data: {
        ...(rest as any),
        name: `ZZ P41 ${c.suffix}`,
        utmCampaign: c.campaign,
      },
    })
  }
  console.log(`✅ Inyectados ${campaigns.length} leads (clonados, con campaña). Prefijo: "ZZ P41".`)
  console.log('   Limpiar después:  npx tsx scripts/p41-inject-campaigns.ts --clean')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())