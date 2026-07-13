/**
 * CONTRACARA del QA SEED sucio — borra EXACTAMENTE lo sembrado por
 * qa-seed-leads-dirty.ts.
 *
 *   npx tsx scripts/dev/qa-seed-leads-dirty-clean.ts
 *
 * Borra SOLO filas con id que empieza con `qaseed-dirty-`, acotado a la org
 * QA `matsu` (doble candado, mismo patrón que qa-seed-leads-clean.ts).
 * Primero los leads, después las conversaciones. El botConfig QA fallback
 * (si alguna vez se creó, slug `qaseed-bot-`) se limpia con el MISMO filtro
 * que ya usa qa-seed-leads-clean.ts — nunca toca un bot real, sea cual sea
 * el script que lo haya creado.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

const ORG_SLUG = 'matsu'
const SEED_PREFIX = 'qaseed-dirty-'
const BOT_SLUG_PREFIX = 'qaseed-bot-'

async function main() {
  const { prisma } = await import('../../src/lib/prisma')

  const orgScope = { botConfig: { organization: { slug: ORG_SLUG } } }

  // Orden: primero leads, después conversaciones (el lead apunta a la conv).
  const leads = await prisma.chatbotLead.deleteMany({
    where: { id: { startsWith: SEED_PREFIX }, ...orgScope },
  })

  const convs = await prisma.conversation.deleteMany({
    where: { id: { startsWith: SEED_PREFIX }, ...orgScope },
  })

  // Mismo filtro que qa-seed-leads-clean.ts (slug prefix + org). Un bot real
  // nunca tiene este slug, así que este delete es un no-op salvo que la org
  // no tuviera bot real y el fallback QA se haya creado.
  const bots = await prisma.botConfig.deleteMany({
    where: {
      slug: { startsWith: BOT_SLUG_PREFIX },
      organization: { slug: ORG_SLUG },
    },
  })

  console.log(
    `✓ Limpieza QA (dirty): ${leads.count} leads + ${convs.count} conversaciones + ${bots.count} botConfig QA borrados (marca '${SEED_PREFIX}%' en org '${ORG_SLUG}').`,
  )
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
