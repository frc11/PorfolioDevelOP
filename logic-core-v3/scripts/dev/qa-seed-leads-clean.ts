/**
 * CONTRACARA del QA SEED — borra EXACTAMENTE lo sembrado por qa-seed-leads.ts.
 *
 *   npx tsx scripts/dev/qa-seed-leads-clean.ts
 *
 * Borra SOLO filas con id que empieza con `qaseed-`, y además acotado a las 3
 * orgs QA (doble candado): nada fuera de eso se toca. Primero los leads, después
 * las conversaciones (el lead apunta a la conversación).
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

const QA_ORG_SLUGS = ['sigma-contable', 'sonrisa-norte', 'matsu']
const SEED_PREFIX = 'qaseed-'
const BOT_SLUG_PREFIX = 'qaseed-bot-'

async function main() {
  const { prisma } = await import('../../src/lib/prisma')

  const orgScope = { botConfig: { organization: { slug: { in: QA_ORG_SLUGS } } } }

  // Orden: primero leads, después conversaciones (el lead apunta a la conv).
  const leads = await prisma.chatbotLead.deleteMany({
    where: { id: { startsWith: SEED_PREFIX }, ...orgScope },
  })

  const convs = await prisma.conversation.deleteMany({
    where: { id: { startsWith: SEED_PREFIX }, ...orgScope },
  })

  // Por último los botConfig QA creados por el seed (solo los marcados con el
  // prefijo de slug y dentro de las orgs QA — un bot REAL nunca se toca). El
  // cascade ya habría limpiado lo suyo; esto remueve el bot QA en sí.
  const bots = await prisma.botConfig.deleteMany({
    where: {
      slug: { startsWith: BOT_SLUG_PREFIX },
      organization: { slug: { in: QA_ORG_SLUGS } },
    },
  })

  console.log(
    `✓ Limpieza QA: ${leads.count} leads + ${convs.count} conversaciones + ${bots.count} botConfig QA borrados (marcas '${SEED_PREFIX}%' / '${BOT_SLUG_PREFIX}%' en las orgs QA).`,
  )
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
