/**
 * B14.2 — Cleanup del bot bench creado por _b14-2-seed-bench-prod.ts.
 *
 * Borra todo lo que dejó la medición en la DB de prod:
 *   - ChatbotEvent del bot bench
 *   - Mensajes y conversaciones del bot bench
 *   - Leads del bot bench
 *   - QuotaUsage de la org bench
 *   - KnowledgeBase del bot
 *   - BotConfig
 *   - OrgMember (vínculo user/org)
 *   - User bench
 *   - Organization bench
 *
 * Mismos safety checks que el seed: --confirm + host != dev + neon.tech.
 *
 * Run:
 *   DATABASE_URL=<prod_neon_url> npx tsx scripts/_b14-2-cleanup-bench-prod.ts --confirm
 *
 * Throwaway — borrar después del sprint B14.2.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const EXPECTED_DEV_HOST = 'ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech'

const ORG_SLUG = 'bench-matsu'
const USER_EMAIL = 'bench-matsu@bench.local'
const BOT_SLUG = 'bench-matsu'

function preflight(): void {
  const args = process.argv.slice(2)
  if (!args.includes('--confirm')) {
    console.error('ABORT: faltó --confirm. Este script borra rows de PROD.')
    process.exit(1)
  }

  const url = process.env.DATABASE_URL ?? ''
  if (!url) {
    console.error('ABORT: DATABASE_URL no está seteada.')
    process.exit(1)
  }

  const host = url.match(/@([^/]+)/)?.[1] ?? '(unknown)'

  if (host === EXPECTED_DEV_HOST) {
    console.error(`ABORT: DATABASE_URL host es el DEV branch (${host}).`)
    process.exit(1)
  }
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    console.error('ABORT: DATABASE_URL apunta a localhost.')
    process.exit(1)
  }
  if (!host.includes('neon.tech')) {
    console.error(`ABORT: host "${host}" no parece Neon.`)
    process.exit(1)
  }

  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  B14.2 — CLEANUP BENCH BOT EN PROD')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`  Host detectado:  ${host}`)
  console.log(`  Target slugs:    org="${ORG_SLUG}", bot="${BOT_SLUG}", user="${USER_EMAIL}"`)
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
}

async function main(): Promise<void> {
  preflight()

  const org = await prisma.organization.findUnique({ where: { slug: ORG_SLUG } })
  if (!org) {
    console.log(`(noop) No existe org "${ORG_SLUG}" — nada para borrar.`)
    return
  }

  const bot = await prisma.botConfig.findUnique({ where: { organizationId: org.id } })

  if (bot) {
    // Borro en orden de dependencia para evitar FK violations.
    // Algunas relaciones tienen onDelete:Cascade pero las explícitas son
    // más seguras (visibilidad de qué se borró).

    const events = await prisma.chatbotEvent.deleteMany({ where: { botConfigId: bot.id } })
    console.log(`✓ ChatbotEvent: ${events.count} borrados`)

    const leads = await prisma.chatbotLead.deleteMany({ where: { botConfigId: bot.id } })
    console.log(`✓ ChatbotLead: ${leads.count} borrados`)

    // Mensajes y conversaciones: las conversaciones cascade-borran sus mensajes
    // pero borro explícito para tener el conteo.
    const convos = await prisma.conversation.findMany({
      where: { botConfigId: bot.id },
      select: { id: true },
    })
    const convoIds = convos.map((c) => c.id)
    if (convoIds.length > 0) {
      const msgs = await prisma.message.deleteMany({ where: { conversationId: { in: convoIds } } })
      console.log(`✓ Message: ${msgs.count} borrados`)
    }
    const convosDel = await prisma.conversation.deleteMany({ where: { botConfigId: bot.id } })
    console.log(`✓ Conversation: ${convosDel.count} borradas`)

    await prisma.knowledgeBase.deleteMany({ where: { botConfigId: bot.id } })
    console.log('✓ KnowledgeBase borrada')

    await prisma.botConfig.delete({ where: { id: bot.id } })
    console.log(`✓ BotConfig "${bot.slug}" borrado`)
  } else {
    console.log('(noop) No existe BotConfig para esta org.')
  }

  const quota = await prisma.quotaUsage.deleteMany({ where: { organizationId: org.id } })
  console.log(`✓ QuotaUsage: ${quota.count} borrados`)

  const member = await prisma.orgMember.deleteMany({ where: { organizationId: org.id } })
  console.log(`✓ OrgMember: ${member.count} borrados`)

  const user = await prisma.user.findUnique({ where: { email: USER_EMAIL } })
  if (user) {
    await prisma.user.delete({ where: { id: user.id } })
    console.log(`✓ User "${USER_EMAIL}" borrado`)
  }

  await prisma.organization.delete({ where: { id: org.id } })
  console.log(`✓ Organization "${ORG_SLUG}" borrada`)

  console.log('')
  console.log('✅ Cleanup B14.2 completo.')
}

main()
  .catch((e) => {
    console.error('❌ Cleanup bench prod falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
