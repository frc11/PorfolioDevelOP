/**
 * B3.2 — Purga de datos generados por la batería de regresión.
 *
 * Borra TODO lo que tenga sessionId con prefijo `regression-test-`:
 *   - ChatbotEvent (vía conversationId)
 *   - ChatbotLead (vía conversationId, también @unique=conversationId)
 *   - Conversation (cascade borra ChatMessage)
 *
 * Idempotente y seguro:
 *   - Verifica host de Neon (debe ser dev branch).
 *   - Verifica que cada conversationId target arranca con el prefijo
 *     antes de borrar — un bug acá borra datos reales.
 *
 * Run:
 *   npx tsx scripts/regression/purge.ts          (modo borrar)
 *   npx tsx scripts/regression/purge.ts --dry    (solo conteo)
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SESSION_PREFIX = 'regression-test-'
const EXPECTED_DEV_HOST = 'ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech'

function checkHost(): void {
  const url = process.env.DATABASE_URL ?? ''
  const host = url.match(/@([^/]+)/)?.[1] ?? '(unknown)'
  if (host !== EXPECTED_DEV_HOST) {
    console.error(`ABORT: DATABASE_URL host "${host}" no coincide con dev branch.`)
    console.error(`(esperado: ${EXPECTED_DEV_HOST})`)
    process.exit(1)
  }
  console.log(`✓ Host dev confirmado: ${host}`)
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry')

  checkHost()

  console.log(`\n🧹 Purga de datos de regresión (prefijo "${SESSION_PREFIX}")`)
  console.log(`   Modo: ${dryRun ? 'DRY RUN (no borra)' : 'EJECUTAR'}\n`)

  // 1. Encontrar todas las conversations con prefijo
  const targetConversations = await prisma.conversation.findMany({
    where: { sessionId: { startsWith: SESSION_PREFIX } },
    select: { id: true, sessionId: true, botConfigId: true },
  })

  if (targetConversations.length === 0) {
    console.log('  Nada para borrar — no hay conversations con el prefijo.')
    return
  }

  // 2. Safety: verificar que CADA conversationId target arranca con el prefijo
  //    (defensa adicional contra un bug en el filtro de Prisma)
  for (const c of targetConversations) {
    if (!c.sessionId.startsWith(SESSION_PREFIX)) {
      console.error(`ABORT: conversation ${c.id} tiene sessionId "${c.sessionId}" — NO empieza con prefijo. Bug en query.`)
      process.exit(1)
    }
  }
  const conversationIds = targetConversations.map((c) => c.id)
  console.log(`  ↪ ${conversationIds.length} conversations matchean.`)

  // 3. Contar lo que vamos a borrar
  const [eventCount, leadCount, messageCount] = await Promise.all([
    prisma.chatbotEvent.count({ where: { conversationId: { in: conversationIds } } }),
    prisma.chatbotLead.count({ where: { conversationId: { in: conversationIds } } }),
    prisma.chatMessage.count({ where: { conversationId: { in: conversationIds } } }),
  ])

  console.log(`  ↪ ${eventCount} chatbot_events asociados.`)
  console.log(`  ↪ ${leadCount} chatbot_leads asociados.`)
  console.log(`  ↪ ${messageCount} chatbot_messages asociados (cascade desde Conversation).`)

  if (dryRun) {
    console.log('\n  DRY RUN — no se borra nada. Quitá --dry para ejecutar.')
    return
  }

  // 4. Borrar en orden: events → leads → conversations (cascade messages)
  //    Todo en una transacción para evitar estados intermedios.
  await prisma.$transaction([
    prisma.chatbotEvent.deleteMany({
      where: { conversationId: { in: conversationIds } },
    }),
    prisma.chatbotLead.deleteMany({
      where: { conversationId: { in: conversationIds } },
    }),
    prisma.conversation.deleteMany({
      where: {
        id: { in: conversationIds },
        // Doble cinturón: filtro por prefijo además del id
        sessionId: { startsWith: SESSION_PREFIX },
      },
    }),
  ])

  console.log('\n✓ Purga completa.')
  console.log(`   - ${eventCount} events borrados.`)
  console.log(`   - ${leadCount} leads borrados.`)
  console.log(`   - ${conversationIds.length} conversations borradas (con ${messageCount} mensajes en cascade).`)
}

main()
  .catch((e) => {
    console.error('❌ Purga falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
