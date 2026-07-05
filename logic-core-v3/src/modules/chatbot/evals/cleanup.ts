/**
 * Q1.1 — Purga dev-only de las filas que crea el corredor.
 *
 * Borra TODO lo que tenga `sessionId` con prefijo `evals-` (marca de cleanup):
 *   ChatbotEvent → ChatbotLead → Conversation (cascade borra ChatMessage).
 * Patrón `scripts/regression/purge.ts`: transacción + doble filtro `startsWith`
 * defensivo. Opcionalmente resetea el `QuotaUsage` de los 3 bots QA (la quota
 * mensual NO se reembolsa al borrar conversaciones).
 *
 * Uso:
 *   - Como librería:  `await purgeEvalRows(prisma, { resetQuota })` (lo llama el runner).
 *   - Standalone:     `npx tsx src/modules/chatbot/evals/cleanup.ts [--dry] [--reset-quota]`
 */
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { PrismaClient } from '@prisma/client'
import { EVAL_BOT_SLUGS, SESSION_PREFIX, guardDevHost, hasFlag } from './shared'

export interface PurgeResult {
  conversations: number
  leads: number
  events: number
  messages: number
  quotaRowsDeleted: number
}

/** Ids de los 3 bots QA (por slug). Vacío si el seed no corrió aún. */
async function evalBotIds(prisma: PrismaClient): Promise<string[]> {
  const slugs = Object.values(EVAL_BOT_SLUGS).map((b) => b.botSlug)
  const bots = await prisma.botConfig.findMany({
    where: { slug: { in: slugs } },
    select: { id: true },
  })
  return bots.map((b) => b.id)
}

export async function purgeEvalRows(
  prisma: PrismaClient,
  opts: { dryRun?: boolean; resetQuota?: boolean } = {},
): Promise<PurgeResult> {
  const empty: PurgeResult = {
    conversations: 0,
    leads: 0,
    events: 0,
    messages: 0,
    quotaRowsDeleted: 0,
  }

  const targets = await prisma.conversation.findMany({
    where: { sessionId: { startsWith: SESSION_PREFIX } },
    select: { id: true, sessionId: true },
  })

  // Defensa: cada fila target DEBE arrancar con el prefijo (bug en el filtro
  // borraría datos reales).
  for (const c of targets) {
    if (!c.sessionId.startsWith(SESSION_PREFIX)) {
      throw new Error(
        `ABORT purga: conversation ${c.id} tiene sessionId "${c.sessionId}" — no empieza con "${SESSION_PREFIX}".`,
      )
    }
  }
  const conversationIds = targets.map((c) => c.id)

  const [events, leads, messages] = await Promise.all([
    conversationIds.length
      ? prisma.chatbotEvent.count({ where: { conversationId: { in: conversationIds } } })
      : Promise.resolve(0),
    conversationIds.length
      ? prisma.chatbotLead.count({ where: { conversationId: { in: conversationIds } } })
      : Promise.resolve(0),
    conversationIds.length
      ? prisma.chatMessage.count({ where: { conversationId: { in: conversationIds } } })
      : Promise.resolve(0),
  ])

  if (opts.dryRun) {
    return { ...empty, conversations: conversationIds.length, leads, events, messages }
  }

  if (conversationIds.length) {
    await prisma.$transaction([
      prisma.chatbotEvent.deleteMany({ where: { conversationId: { in: conversationIds } } }),
      prisma.chatbotLead.deleteMany({ where: { conversationId: { in: conversationIds } } }),
      prisma.conversation.deleteMany({
        where: {
          id: { in: conversationIds },
          sessionId: { startsWith: SESSION_PREFIX }, // doble cinturón
        },
      }),
    ])
  }

  let quotaRowsDeleted = 0
  if (opts.resetQuota) {
    const botIds = await evalBotIds(prisma)
    if (botIds.length) {
      const del = await prisma.quotaUsage.deleteMany({ where: { botConfigId: { in: botIds } } })
      quotaRowsDeleted = del.count
    }
  }

  return {
    conversations: conversationIds.length,
    leads,
    events,
    messages,
    quotaRowsDeleted,
  }
}

// ─── Entry standalone ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { config: loadEnv } = await import('dotenv')
  loadEnv({ path: '.env.local' })
  loadEnv({ path: '.env' })
  guardDevHost()

  const dryRun = hasFlag('--dry')
  const resetQuota = hasFlag('--reset-quota')

  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    console.log(
      `🧹 Purga de evals (prefijo "${SESSION_PREFIX}")  ·  modo: ${dryRun ? 'DRY RUN' : 'EJECUTAR'}` +
        `${resetQuota ? '  ·  +reset QuotaUsage' : ''}`,
    )
    const r = await purgeEvalRows(prisma, { dryRun, resetQuota })
    console.log(
      `  conversations=${r.conversations}  leads=${r.leads}  events=${r.events}  messages=${r.messages}` +
        (resetQuota ? `  quotaRowsDeleted=${r.quotaRowsDeleted}` : ''),
    )
    console.log(dryRun ? '  (dry run — no se borró nada)' : '✓ Purga completa.')
  } finally {
    await prisma.$disconnect()
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? '')).href) {
  main().catch((e) => {
    console.error('❌ Purga falló:', e)
    process.exit(1)
  })
}
