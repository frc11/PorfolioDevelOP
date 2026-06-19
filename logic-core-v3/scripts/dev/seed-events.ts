/**
 * scripts/dev/seed-events.ts — LOTE INTELIGENCIA 2 / Lane ACTIVIDAD GLOBAL · Sprint 1
 *
 * Puebla `ChatbotEvent` (tabla compartida chatbots/Health/Activity) con data de prueba
 * para ejercitar los filtros (tipo/nivel/fecha) y el chart de /admin/chatbot/activity.
 *
 * - Idempotente: borra primero TODO lo marcado con metadata._seed = 'intel-actividad'
 *   (y las conversations de prueba por prefijo de sessionId) antes de insertar.
 * - Solo INSERTA data: no toca queries.ts, el filtro/ActivityLog.tsx, ni el schema.
 * - Mapeo de filtros + reversibilidad + bug pre-existente del filtro de nivel:
 *   ver scripts/dev/seed-events.md
 *
 * Run (desde logic-core-v3/):
 *   npx ts-node --transpile-only scripts/dev/seed-events.ts          # seed
 *   npx ts-node --transpile-only scripts/dev/seed-events.ts --clean  # cleanup
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient, ChatbotEventLevel, Prisma } from '@prisma/client'

// No hay .env en logic-core-v3 (solo .env.local). Cargamos explícito (relativo al cwd,
// que debe ser logic-core-v3/); .env queda de fallback. Correr desde logic-core-v3/.
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL no está definida. Asegurate de correr desde logic-core-v3/ y de tener .env.local con DATABASE_URL.',
  )
}

const prisma = new PrismaClient()

const SEED_TAG = 'intel-actividad'
const BOT_SLUG = 'develop'
const CONV_SESSION_PREFIX = 'seed-intel-actividad'
const L = ChatbotEventLevel

interface Template {
  type: string
  level: ChatbotEventLevel
  message: string
  /** Atar a una conversación de prueba (eventos de chat/lead). */
  conv?: boolean
  metadata: Record<string, string | number | boolean>
}

/**
 * Pool de plantillas. Cobertura: cada substring del filtro de tipo
 * (chat/lead/error/quota/config) y cada nivel (INFO/WARN/ERROR/DEBUG) aparecen
 * varias veces. Tipos espejados de los call-sites reales donde existen.
 */
const POOL: Template[] = [
  { type: 'chat.message_completed', level: L.INFO, conv: true,
    message: 'Respuesta enviada (412 in / 188 out)',
    metadata: { tokensIn: 412, tokensOut: 188, durationMs: 2310 } },
  { type: 'chat.session_started', level: L.INFO, conv: true,
    message: 'Nueva sesión de chat iniciada',
    metadata: { entryPath: '/' } },
  { type: 'tool.lead_captured', level: L.INFO, conv: true,
    message: 'Lead capturado (intent: cotizar, score: 78/HOT)',
    metadata: { intent: 'cotizar', category: 'web', score: 78, classification: 'HOT' } },
  { type: 'lead.status_changed', level: L.INFO,
    message: 'Lead movido NEW → CONTACTED',
    metadata: { from: 'NEW', to: 'CONTACTED' } },
  { type: 'chat.quota_exceeded', level: L.WARN, conv: true,
    message: 'Cuota agotada (500/500) — plan STARTER',
    metadata: { conversationsUsed: 500, conversationsLimit: 500, planKey: 'STARTER' } },
  { type: 'quota.warning', level: L.WARN,
    message: 'Uso de cuota al 85% (425/500)',
    metadata: { usagePct: 85, planKey: 'STARTER' } },
  { type: 'chat.gating_domain_overflow', level: L.WARN,
    message: 'Origin example.com excede el cap del plan STARTER',
    metadata: { origin: 'example.com', planKey: 'STARTER', maxDomains: 1 } },
  { type: 'tool.lead_reask', level: L.WARN, conv: true,
    message: 'Re-pregunta de contacto (email inválido)',
    metadata: { missing: 'email' } },
  { type: 'chat.unhandled_error', level: L.ERROR, conv: true,
    message: 'Error no manejado durante la generación',
    metadata: { error: 'TypeError: cannot read properties of undefined' } },
  { type: 'chat.persist_error', level: L.ERROR,
    message: 'No se pudo persistir la conversación',
    metadata: { error: 'P2002 unique constraint' } },
  { type: 'llm.error', level: L.ERROR,
    message: 'Proveedor LLM devolvió 529 (overloaded)',
    metadata: { provider: 'anthropic', status: 529 } },
  { type: 'config.updated', level: L.INFO,
    message: 'Configuración del bot actualizada (persona/tono)',
    metadata: { section: 'persona', by: 'admin' } },
  { type: 'config.kb_reindexed', level: L.DEBUG,
    message: 'KB reindexada (42 chunks)',
    metadata: { chunks: 42, durationMs: 1875 } },
  { type: 'chat.llm_request_start', level: L.DEBUG, conv: true,
    message: 'Inicio de request al LLM',
    metadata: { model: 'claude-haiku-4-5' } },
]

const TYPE_SUBSTRINGS = ['chat', 'lead', 'error', 'quota', 'config'] as const

/**
 * createdAt determinístico (sin Math.random → re-run idéntico tras el deleteMany).
 * - Hoy (daysAgo=0): minutos previos a "ahora" → quedan al tope del stream y nunca en el futuro.
 * - Días previos: franja 09:00–20:00 local (lejos de medianoche → sin off-by-one en el chart).
 */
function eventDate(daysAgo: number, k: number, count: number): Date {
  const d = new Date()
  if (daysAgo === 0) {
    d.setMinutes(d.getMinutes() - (k + 1) * 6)
    return d
  }
  d.setDate(d.getDate() - daysAgo)
  const hour = 9 + Math.floor((k * 11) / count)
  const minute = (k * 17) % 60
  d.setHours(hour, minute, 0, 0)
  return d
}

async function clean(): Promise<{ events: number; conversations: number }> {
  const events = await prisma.chatbotEvent.deleteMany({
    where: { metadata: { path: ['_seed'], equals: SEED_TAG } },
  })
  const conversations = await prisma.conversation.deleteMany({
    where: { sessionId: { startsWith: CONV_SESSION_PREFIX } },
  })
  return { events: events.count, conversations: conversations.count }
}

async function seed(): Promise<void> {
  const bot = await prisma.botConfig.findUnique({
    where: { slug: BOT_SLUG },
    select: { id: true },
  })
  if (!bot) {
    throw new Error(`BotConfig slug="${BOT_SLUG}" no existe. Corré el seed base primero.`)
  }

  // 1) Idempotencia — borrar en orden FK (eventos → conversations)
  const removed = await clean()
  console.log(
    `[clean] eventos previos: ${removed.events} · conversations previas: ${removed.conversations}`,
  )

  // 2) Conversations de prueba (conversationId es OPCIONAL; las usamos para realismo)
  const convPaths = ['/', '/servicios', '/contacto']
  const convIds: string[] = []
  for (let i = 0; i < convPaths.length; i++) {
    const created = await prisma.conversation.create({
      data: {
        botConfigId: bot.id,
        sessionId: `${CONV_SESSION_PREFIX}-conv-${i + 1}`,
        currentPath: convPaths[i],
      },
      select: { id: true },
    })
    convIds.push(created.id)
  }

  // 3) Eventos distribuidos en la ventana del chart (7 días: 12/06–18/06)
  const data: Prisma.ChatbotEventCreateManyInput[] = []
  let convCursor = 0
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    // Hoy recibe el pool completo → todas las combos al tope del stream (cap de 50/bot).
    const count = daysAgo === 0 ? POOL.length : 8
    const offset = daysAgo * 3
    for (let k = 0; k < count; k++) {
      const tpl = POOL[(offset + k) % POOL.length]
      const conversationId = tpl.conv ? convIds[convCursor++ % convIds.length] : null
      data.push({
        botConfigId: bot.id,
        type: tpl.type,
        level: tpl.level,
        message: tpl.message,
        conversationId,
        metadata: { ...tpl.metadata, _seed: SEED_TAG },
        createdAt: eventDate(daysAgo, k, count),
      })
    }
  }

  const inserted = await prisma.chatbotEvent.createMany({ data })
  console.log(`[seed] eventos insertados: ${inserted.count} · conversations: ${convIds.length}`)

  // 4) Reporte de cobertura (lo que el seed produjo)
  const byLevel: Record<string, number> = {}
  const bySub: Record<string, number> = {}
  for (const e of data) {
    const lvl = String(e.level)
    byLevel[lvl] = (byLevel[lvl] ?? 0) + 1
    for (const s of TYPE_SUBSTRINGS) {
      if (e.type.toLowerCase().includes(s)) bySub[s] = (bySub[s] ?? 0) + 1
    }
  }
  console.log('[cobertura] por nivel:', byLevel)
  console.log('[cobertura] por filtro-tipo (substring):', bySub)

  // 5) Verificación: ¿quedan visibles en el top-50 que carga la página?
  const recent = await prisma.chatbotEvent.findMany({
    where: { botConfigId: bot.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { type: true, metadata: true },
  })
  const seededInTop = recent.filter((r) => {
    const m = r.metadata as Record<string, unknown> | null
    return m?._seed === SEED_TAG
  }).length
  const subsInTop = new Set<string>()
  for (const r of recent) {
    for (const s of TYPE_SUBSTRINGS) {
      if (r.type.toLowerCase().includes(s)) subsInTop.add(s)
    }
  }
  const missing = TYPE_SUBSTRINGS.filter((s) => !subsInTop.has(s))
  console.log(
    `[verif] top-50 del bot: ${seededInTop} son del seed · filtros-tipo presentes: ${[...subsInTop].join(', ') || '—'}`,
  )
  if (missing.length > 0) {
    console.warn(
      `[verif] ⚠️ faltan en el top-50 (otros eventos más recientes los taparon): ${missing.join(', ')}`,
    )
  }
}

async function main(): Promise<void> {
  if (process.argv.includes('--clean')) {
    const removed = await clean()
    console.log(`[clean] eventos: ${removed.events} · conversations: ${removed.conversations}`)
    return
  }
  await seed()
}

main()
  .catch((err: unknown) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => {
    void prisma.$disconnect()
  })
