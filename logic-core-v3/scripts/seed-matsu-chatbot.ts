/**
 * scripts/seed-matsu-chatbot.ts — Lane 3 (client-chatbot)
 *
 * Puebla data de prueba del MÓDULO CHATBOT para Matsu (concesionaria Toyota,
 * bot "Aki"): ~5 conversaciones con mensajes, ~9 leads con scoring variado,
 * ~3 handoffs a WhatsApp y la QuotaUsage del mes actual.
 *
 * Garantías:
 *   - INSERT-only: NUNCA migra ni borra schema. Solo toca tablas chatbot_*.
 *   - Idempotente: clean() borra todo lo marcado y reinserta (re-run = mismo set).
 *   - No crea la org/bot: ABORTA si Matsu no existe (corré scripts/seed-matsu.ts antes).
 *   - QuotaUsage: se crea SOLO si no existe fila del período (no pisa usage real);
 *     el revert la borra solo si la creó este seed (marcador event seed.quota_created).
 *   - No toca el drift de Franco (OsLead/setter/ActivityChannel): ningún FK llega ahí.
 *
 * Marcadores (para idempotencia + revert):
 *   - Conversaciones: sessionId con prefijo SESSION_PREFIX.
 *   - Leads: internalNotes contiene LEAD_MARKER (chatbot_lead no tiene metadata).
 *   - Eventos: metadata.seedTag = EVENT_SEED_TAG.
 *
 * Run (desde logic-core-v3/):
 *   npx ts-node --transpile-only scripts/seed-matsu-chatbot.ts          # seed
 *   npx ts-node --transpile-only scripts/seed-matsu-chatbot.ts --clean  # revert
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient, Prisma } from '@prisma/client'
import type {
  ChatMessageRole,
  ChatbotLeadIntent,
  ChatbotLeadStatus,
  LeadCategory,
  LeadClassification,
} from '@prisma/client'
import { assertDevSeedTarget } from '../prisma/seed-guard'

// No hay .env en logic-core-v3 (solo .env.local). Cargamos explícito (relativo al
// cwd, que debe ser logic-core-v3/); .env queda de fallback.
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL no está definida. Corré desde logic-core-v3/ con .env.local.',
  )
}

const prisma = new PrismaClient()

const BOT_SLUG = 'matsu'
const SESSION_PREFIX = 'seed-matsu-chat-'
const LEAD_MARKER = '[seed:matsu-chat]'
const EVENT_SEED_TAG = 'matsu-chat'
const HANDOFF_TYPE = 'handoff.whatsapp'
const QUOTA_MARKER_TYPE = 'seed.quota_created'

// ── Tipos de los datos de prueba ─────────────────────────────────────────────
interface SeedMessage {
  role: ChatMessageRole
  content: string
}

interface SeedLead {
  name?: string
  email?: string
  phone?: string
  intent?: ChatbotLeadIntent
  message?: string
  category?: LeadCategory
  status?: ChatbotLeadStatus
  score?: number
  classification?: LeadClassification
  requestedAppointment?: boolean
  mentionedFinancing?: boolean
  mentionedTradeIn?: boolean
  askedSpecificModel?: boolean
  providedPhone?: boolean
  providedEmail?: boolean
  // Record (no interface) → asignable al input JSON de Prisma sin casts.
  scoreSignals?: Record<string, string | number>[]
}

interface SeedHandoff {
  visitorName: string
  reason: string
  intent: string
  topicSummary: string
}

interface SeedConversation {
  currentPath: string
  daysAgo: number
  messages: SeedMessage[]
  lead?: SeedLead
  handoff?: SeedHandoff
}

// ── Datos: 5 conversaciones (con lead atado) + 4 leads sueltos ───────────────
const CONVERSATIONS: SeedConversation[] = [
  {
    currentPath: '/autos/corolla',
    daysAgo: 1,
    messages: [
      { role: 'USER', content: 'Hola! Quiero comprar un Corolla 0KM, ¿tenés stock del XEI?' },
      { role: 'ASSISTANT', content: '¡Hola! Soy Aki, de Matsu 🚗 Sí, tenemos Corolla XEI 0KM con entrega inmediata. ¿Ya lo tenés decidido o estás comparando versiones?' },
      { role: 'USER', content: 'Decidido. ¿Cuánto sale y financian?' },
      { role: 'ASSISTANT', content: 'Bárbaro. El XEI tiene financiación de hasta 60 cuotas con tasa preferencial. ¿Me dejás tu nombre y un teléfono así un asesor te arma el plan a medida?' },
      { role: 'USER', content: 'Juan Pérez, 381-555-1234, juan.perez@gmail.com. Quiero pasar mañana a la mañana.' },
      { role: 'ASSISTANT', content: '¡Genial, Juan! Te derivo con un asesor por WhatsApp para coordinar mañana y dejarte el auto separado. 🙌' },
    ],
    lead: {
      name: 'Juan Pérez',
      email: 'juan.perez@gmail.com',
      phone: '381-555-1234',
      intent: 'PURCHASE_READY',
      message: 'Decidido a comprar un Corolla XEI 0KM con entrega inmediata; consultó financiación y pidió turno para mañana.',
      score: 86,
      classification: 'hot',
      status: 'NEW',
      requestedAppointment: true,
      mentionedFinancing: true,
      askedSpecificModel: true,
      scoreSignals: [
        { key: 'purchase_intent', label: 'Intención de compra explícita', points: 35 },
        { key: 'provided_contact', label: 'Dejó teléfono y email', points: 25 },
        { key: 'specific_model', label: 'Pidió un modelo específico (Corolla XEI)', points: 15 },
        { key: 'appointment', label: 'Pidió turno/visita', points: 11 },
      ],
    },
    handoff: {
      visitorName: 'Juan Pérez',
      reason: 'Cliente decidido a comprar un Corolla XEI, pidió coordinar la entrega para mañana.',
      intent: 'purchase_ready',
      topicSummary: 'Corolla XEI 0KM, financiación 60 cuotas, entrega inmediata',
    },
  },
  {
    currentPath: '/autos/yaris',
    daysAgo: 2,
    messages: [
      { role: 'USER', content: 'Buenas, ¿cuánto está el Yaris 0KM? Tengo un Etios 2017 para entregar.' },
      { role: 'ASSISTANT', content: '¡Hola! Tomamos tu Etios como parte de pago y lo tasamos sin cargo. ¿Querés que un asesor te pase la cotización del Yaris con la toma incluida?' },
      { role: 'USER', content: 'Sí, dale. Mi teléfono es 381-444-9876.' },
      { role: 'ASSISTANT', content: 'Perfecto, te derivo con un asesor para la tasación del Etios y la cotización del Yaris. 📲' },
    ],
    lead: {
      phone: '381-444-9876',
      intent: 'QUOTE_REQUEST',
      message: 'Consulta el precio del Yaris 0KM y ofrece un Etios 2017 en parte de pago.',
      score: 58,
      classification: 'warm',
      status: 'CONTACTED',
      mentionedTradeIn: true,
      scoreSignals: [
        { key: 'quote_request', label: 'Pidió cotización', points: 28 },
        { key: 'trade_in', label: 'Ofrece un usado en parte de pago', points: 18 },
        { key: 'provided_phone', label: 'Dejó teléfono', points: 12 },
      ],
    },
    handoff: {
      visitorName: 'Visitante (Yaris)',
      reason: 'Cotización de Yaris con toma de un Etios 2017 en parte de pago.',
      intent: 'quote_request',
      topicSummary: 'Yaris XLS + permuta Etios 2017',
    },
  },
  {
    currentPath: '/autos/hilux',
    daysAgo: 3,
    messages: [
      { role: 'USER', content: 'Quiero ver la Hilux SRV 4x4. ¿Puedo ir a verla y hacer un test drive?' },
      { role: 'ASSISTANT', content: '¡Claro! Tenemos la Hilux SRV 4x4 en showroom. Coordinamos test drive de lunes a viernes. ¿Te sirve esta semana? Dejame tu nombre y contacto y lo agendamos.' },
      { role: 'USER', content: 'Sí, el jueves. Soy Carla Gómez, 381-222-3344, carla.gomez@hotmail.com. ¿Financian?' },
      { role: 'ASSISTANT', content: 'Excelente, Carla. Sí, financiamos hasta el 70%. Te derivo con un asesor para confirmar el test drive del jueves y pasarte las opciones. 🚙' },
    ],
    lead: {
      name: 'Carla Gómez',
      email: 'carla.gomez@hotmail.com',
      phone: '381-222-3344',
      intent: 'SCHEDULE_VISIT',
      message: 'Pidió test drive de la Hilux SRV 4x4 para el jueves y consultó financiación.',
      score: 79,
      classification: 'hot',
      status: 'IN_NEGOTIATION',
      requestedAppointment: true,
      mentionedFinancing: true,
      askedSpecificModel: true,
      scoreSignals: [
        { key: 'schedule_visit', label: 'Agendó test drive', points: 30 },
        { key: 'provided_contact', label: 'Dejó teléfono y email', points: 25 },
        { key: 'financing', label: 'Consultó financiación', points: 14 },
        { key: 'specific_model', label: 'Modelo específico (Hilux SRV 4x4)', points: 10 },
      ],
    },
    handoff: {
      visitorName: 'Carla Gómez',
      reason: 'Test drive de Hilux SRV 4x4 agendado para el jueves, consultó financiación.',
      intent: 'schedule_visit',
      topicSummary: 'Hilux SRV 4x4 — test drive jueves',
    },
  },
  {
    currentPath: '/',
    daysAgo: 5,
    messages: [
      { role: 'USER', content: 'Hola, ¿a qué hora abren los sábados?' },
      { role: 'ASSISTANT', content: '¡Hola! Los sábados atendemos de 9 a 13 hs en el showroom de San Miguel de Tucumán. ¿Querés que te muestre algún modelo?' },
      { role: 'USER', content: 'No, gracias, solo era eso.' },
      { role: 'ASSISTANT', content: '¡Perfecto! Cualquier cosa, acá estoy. 👋' },
    ],
    lead: {
      intent: 'SUPPORT',
      message: 'Consultó el horario de atención de los sábados.',
      score: 22,
      classification: 'cold',
      status: 'NEW',
    },
  },
  {
    currentPath: '/postventa',
    daysAgo: 6,
    messages: [
      { role: 'USER', content: 'Necesito turno para el service de los 10.000 km de mi Corolla.' },
      { role: 'ASSISTANT', content: '¡Hola! El service lo coordina el área de Postventa. ¿Querés que te derive con el taller para agendar el turno de los 10.000 km?' },
      { role: 'USER', content: 'Sí, gracias.' },
      { role: 'ASSISTANT', content: 'Listo, te derivo con Postventa para coordinar el turno de service. 🔧' },
    ],
    lead: {
      intent: 'SCHEDULE_VISIT',
      message: 'Pidió turno de service de 10.000 km (postventa, no es venta).',
      score: 0,
      classification: 'dq',
      category: 'postventa',
      status: 'NEW',
      requestedAppointment: true,
    },
  },
]

const STANDALONE_LEADS: SeedLead[] = [
  {
    name: 'Martín Suárez',
    phone: '381-666-1212',
    intent: 'QUOTE_REQUEST',
    message: 'Cotización de SW4 0KM, consultó planes de financiación.',
    score: 52,
    classification: 'warm',
    status: 'NEW',
    mentionedFinancing: true,
    askedSpecificModel: true,
    scoreSignals: [
      { key: 'quote_request', label: 'Pidió cotización', points: 28 },
      { key: 'financing', label: 'Consultó financiación', points: 14 },
      { key: 'specific_model', label: 'Modelo específico (SW4)', points: 10 },
    ],
  },
  {
    name: 'Lucía Fernández',
    email: 'lu.fernandez@gmail.com',
    phone: '381-777-8989',
    intent: 'SCHEDULE_VISIT',
    message: 'Agendó test drive del Corolla Cross y avanzó con la compra.',
    score: 49,
    classification: 'warm',
    status: 'WON',
    requestedAppointment: true,
    scoreSignals: [
      { key: 'schedule_visit', label: 'Agendó test drive', points: 30 },
      { key: 'provided_contact', label: 'Dejó teléfono y email', points: 19 },
    ],
  },
  {
    intent: 'OTHER',
    message: 'Preguntó si hacen permuta de motos por autos.',
    score: 30,
    classification: 'cold',
    status: 'NEW',
  },
  {
    name: 'Diego Romero',
    email: 'diego.romero@gmail.com',
    phone: '381-333-5566',
    intent: 'PURCHASE_READY',
    message: 'Quiere comprar una Hilux ya, con pago al contado.',
    score: 83,
    classification: 'hot',
    status: 'CONTACTED',
    askedSpecificModel: true,
    scoreSignals: [
      { key: 'purchase_intent', label: 'Intención de compra explícita', points: 35 },
      { key: 'cash_payment', label: 'Pago al contado', points: 20 },
      { key: 'provided_contact', label: 'Dejó teléfono y email', points: 18 },
      { key: 'specific_model', label: 'Modelo específico (Hilux)', points: 10 },
    ],
  },
]

// ── Helpers de fecha (determinísticos relativos al run) ──────────────────────
function daysAgoDate(days: number, hour: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, 0, 0, 0)
  return d
}

function addMinutes(d: Date, mins: number): Date {
  return new Date(d.getTime() + mins * 60_000)
}

function buildLeadData(
  botConfigId: string,
  l: SeedLead,
  conversationId: string | null,
  capturedAt: Date,
): Prisma.ChatbotLeadUncheckedCreateInput {
  const status: ChatbotLeadStatus = l.status ?? 'NEW'
  return {
    botConfigId,
    conversationId,
    name: l.name ?? null,
    email: l.email ?? null,
    phone: l.phone ?? null,
    intent: l.intent ?? null,
    message: l.message ?? null,
    category: l.category ?? 'sales',
    status,
    score: l.score ?? null,
    classification: l.classification ?? null,
    scoreSignals: l.scoreSignals,
    requestedAppointment: l.requestedAppointment ?? false,
    mentionedFinancing: l.mentionedFinancing ?? false,
    mentionedTradeIn: l.mentionedTradeIn ?? false,
    askedSpecificModel: l.askedSpecificModel ?? false,
    providedPhone: l.providedPhone ?? Boolean(l.phone),
    providedEmail: l.providedEmail ?? Boolean(l.email),
    internalNotes: `${LEAD_MARKER} lead de prueba`,
    capturedAt,
    lastStatusChangeAt: status === 'NEW' ? null : capturedAt,
  }
}

// ── Limpieza (idempotencia + revert) ─────────────────────────────────────────
function readPeriod(meta: Prisma.JsonValue): { year: number; month: number } | null {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null
  const m = meta as Record<string, unknown>
  if (typeof m.year === 'number' && typeof m.month === 'number') {
    return { year: m.year, month: m.month }
  }
  return null
}

async function clean(botConfigId: string): Promise<{
  leads: number
  events: number
  conversations: number
  quota: number
}> {
  // 0. QuotaUsage: SOLO la que creó este seed (la marca el event seed.quota_created).
  //    Se resuelve ANTES de borrar los eventos (el marcador es uno de ellos).
  const quotaMarkers = await prisma.chatbotEvent.findMany({
    where: {
      botConfigId,
      type: QUOTA_MARKER_TYPE,
      metadata: { path: ['seedTag'], equals: EVENT_SEED_TAG },
    },
    select: { metadata: true },
  })
  let quota = 0
  for (const marker of quotaMarkers) {
    const period = readPeriod(marker.metadata)
    if (period) {
      const r = await prisma.quotaUsage.deleteMany({
        where: { botConfigId, year: period.year, month: period.month },
      })
      quota += r.count
    }
  }

  // 1. Leads PRIMERO: el FK lead→conversation es SetNull (no cascade), así que si
  //    borrásemos la conversación antes, el lead quedaría huérfano en vez de irse.
  const leads = await prisma.chatbotLead.deleteMany({
    where: { botConfigId, internalNotes: { contains: LEAD_MARKER } },
  })

  // 2. Eventos sembrados (handoffs + marcadores de quota) por seedTag.
  const events = await prisma.chatbotEvent.deleteMany({
    where: { botConfigId, metadata: { path: ['seedTag'], equals: EVENT_SEED_TAG } },
  })

  // 3. Conversaciones por prefijo (cascade borra ChatMessage + cualquier evento atado).
  const conversations = await prisma.conversation.deleteMany({
    where: { botConfigId, sessionId: { startsWith: SESSION_PREFIX } },
  })

  return {
    leads: leads.count,
    events: events.count,
    conversations: conversations.count,
    quota,
  }
}

// ── Inserción ────────────────────────────────────────────────────────────────
async function seed(botConfigId: string): Promise<void> {
  let leadCount = 0
  let handoffCount = 0

  for (const [ci, conv] of CONVERSATIONS.entries()) {
    const startedAt = daysAgoDate(conv.daysAgo, 10 + ci)
    const messages = conv.messages.map((m, i) => ({
      role: m.role,
      content: m.content,
      createdAt: addMinutes(startedAt, i * 2),
    }))
    const lastMessageAt = messages.length
      ? messages[messages.length - 1].createdAt
      : startedAt

    const created = await prisma.conversation.create({
      data: {
        botConfigId,
        sessionId: `${SESSION_PREFIX}${String(ci + 1).padStart(2, '0')}`,
        currentPath: conv.currentPath,
        userAgent: 'Mozilla/5.0 (seed-matsu-chatbot)',
        referrerUrl: 'https://www.google.com',
        startedAt,
        lastMessageAt,
        messageCount: messages.length,
        tokensIn: messages.length * 120,
        tokensOut: messages.length * 90,
        estimatedCostUsd: 0.012 * messages.length,
        leadCaptured: Boolean(conv.lead),
        messages: { create: messages },
      },
      select: { id: true },
    })

    if (conv.lead) {
      await prisma.chatbotLead.create({
        data: buildLeadData(botConfigId, conv.lead, created.id, lastMessageAt),
      })
      leadCount += 1
    }

    if (conv.handoff) {
      const metadata: Record<string, string | number | boolean> = {
        seedTag: EVENT_SEED_TAG,
        visitorName: conv.handoff.visitorName,
        reason: conv.handoff.reason,
        intent: conv.handoff.intent,
        topicSummary: conv.handoff.topicSummary,
        hadLeadBeforeHandoff: Boolean(conv.lead),
      }
      await prisma.chatbotEvent.create({
        data: {
          botConfigId,
          type: HANDOFF_TYPE,
          level: 'INFO',
          conversationId: created.id,
          message: `Derivación a WhatsApp — ${conv.handoff.visitorName} (${conv.handoff.intent})`,
          createdAt: addMinutes(lastMessageAt, 1),
          metadata,
        },
      })
      handoffCount += 1
    }
  }

  for (const [li, lead] of STANDALONE_LEADS.entries()) {
    await prisma.chatbotLead.create({
      data: buildLeadData(botConfigId, lead, null, daysAgoDate(2 + li, 12)),
    })
    leadCount += 1
  }

  // QuotaUsage del mes actual (UTC) — SOLO si no existe (no pisar usage real).
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1
  const existingQuota = await prisma.quotaUsage.findUnique({
    where: { botConfigId_year_month: { botConfigId, year, month } },
  })
  if (existingQuota) {
    console.log(`• QuotaUsage ${year}-${String(month).padStart(2, '0')} ya existe — NO se toca (usage real preservada).`)
  } else {
    await prisma.quotaUsage.create({
      data: {
        botConfigId,
        year,
        month,
        conversationsCount: 62,
        tokensIn: 48200,
        tokensOut: 31700,
        costUsd: 9.84,
      },
    })
    const quotaMeta: Record<string, string | number> = { seedTag: EVENT_SEED_TAG, year, month }
    await prisma.chatbotEvent.create({
      data: {
        botConfigId,
        type: QUOTA_MARKER_TYPE,
        level: 'DEBUG',
        message: 'seed-matsu-chatbot: QuotaUsage del mes creada por el seed.',
        metadata: quotaMeta,
      },
    })
    console.log(`✓ QuotaUsage ${year}-${String(month).padStart(2, '0')} creada (conversationsCount=62).`)
  }

  console.log(`✓ Insertado: ${CONVERSATIONS.length} conversaciones, ${leadCount} leads, ${handoffCount} handoffs.`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  assertDevSeedTarget('seed-matsu-chatbot.ts')
  const cleanOnly = process.argv.includes('--clean')

  const bot = await prisma.botConfig.findUnique({
    where: { slug: BOT_SLUG },
    select: { id: true, botName: true },
  })
  if (!bot) {
    console.error(
      `ABORT: no existe BotConfig slug="${BOT_SLUG}". ` +
        'Este seed NO crea la org/bot — corré scripts/seed-matsu.ts primero.',
    )
    process.exit(1)
  }
  console.log(`✓ Bot de Matsu encontrado: "${bot.botName}" (id ${bot.id})`)

  const removed = await clean(bot.id)
  console.log(
    `🧹 Limpieza previa: ${removed.leads} leads, ${removed.events} eventos, ` +
      `${removed.conversations} conversaciones, ${removed.quota} quota.`,
  )

  if (cleanOnly) {
    console.log('✓ --clean: revert completo. No se insertó nada.')
    return
  }

  await seed(bot.id)
  console.log('\n✓ Seed de chatbot para Matsu completo.\n')
}

main()
  .catch((e) => {
    console.error('❌ seed-matsu-chatbot falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
