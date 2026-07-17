/**
 * B2-S1 — Verificación humana de `generateBotReply` con el LLM REAL.
 *
 * Llama la superficie sincrónica del chatbot contra un bot de prueba y con el
 * provider real (Vertex/Google) — es decir, TIENE COSTO de LLM y persiste un
 * turno real en la conversación `wa:b2s1-dev:*`. Corre a mano, no es un test.
 *
 * Uso:
 *   npx tsx scripts/dev/b2s1-sync-reply.ts [botSlug] ["mensaje del visitante"]
 *   # defaults: botSlug = primer bot activo; mensaje = saludo simple
 *
 * Qué demuestra: mensaje entrante → texto completo de respuesta en UNA llamada,
 * sin HTTP, drenando el stream internamente. El sessionId `wa:...` namespaced
 * crea/reusa una conversación propia sin colisionar con el widget.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main(): Promise<void> {
  const [, , slugArg, msgArg] = process.argv
  const userMessageText = msgArg ?? 'Hola, ¿qué servicios ofrecen?'

  const { prisma } = await import('../../src/lib/prisma')
  const { generateBotReply } = await import('../../src/modules/chatbot/public-api')

  const bot = slugArg
    ? await prisma.botConfig.findUnique({
        where: { slug: slugArg },
        select: { id: true, slug: true, organizationId: true, isActive: true },
      })
    : await prisma.botConfig.findFirst({
        where: { isActive: true, knowledgeBase: { isNot: null } },
        select: { id: true, slug: true, organizationId: true, isActive: true },
      })

  if (!bot) {
    console.error('[b2s1] No se encontró un bot' + (slugArg ? ` con slug "${slugArg}"` : ' activo con KB'))
    process.exit(1)
  }

  // sessionId namespaced + estable por corrida del día → conversación propia,
  // reusable si se re-ejecuta (idempotente por (bot, sessionId)).
  const sessionId = `wa:b2s1-dev:${bot.slug}`

  console.log('[b2s1] Llamando generateBotReply con el LLM REAL (tiene costo)…')
  console.log(`[b2s1] bot=${bot.slug} org=${bot.organizationId} sessionId=${sessionId}`)
  console.log(`[b2s1] mensaje: ${userMessageText}`)

  const started = Date.now()
  const result = await generateBotReply({
    organizationId: bot.organizationId,
    botConfigId: bot.id,
    sessionId,
    userMessageText,
  })

  console.log('\n[b2s1] ── Resultado ──────────────────────────────')
  console.log(`conversationId : ${result.conversationId}`)
  console.log(`leadCaptured   : ${result.leadCaptured}`)
  console.log(`durationMs     : ${Date.now() - started}`)
  console.log(`\ntext:\n${result.text}\n`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[b2s1] Falló:', err)
  process.exit(1)
})
