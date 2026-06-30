/**
 * QA SEED — leads/conversaciones de PRUEBA para verificar el dashboard del
 * cliente en los 3 niveles de plan. Escribe SOLO en las 3 orgs QA descartables.
 *
 *   npx tsx scripts/dev/qa-seed-leads.ts
 *
 * IDEMPOTENTE: cada fila usa un id determinístico con prefijo `qaseed-` y se
 * inserta con upsert → correrlo N veces no duplica (re-escribe las mismas filas,
 * refrescando las fechas al período actual). Limpieza: scripts/dev/qa-seed-leads-clean.ts
 * borra EXACTAMENTE lo sembrado (por el prefijo `qaseed-`).
 *
 * Orgs sin botConfig: se crea un botConfig QA mínimo (slug `qaseed-bot-`,
 * isActive:false) para poder sembrar — lo borra la limpieza. Un bot real
 * existente nunca se pisa.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import type {
  ChatbotLeadStatus,
  ChatbotLeadIntent,
  LeadClassification,
  LeadCategory,
} from '@prisma/client'

const QA_ORG_SLUGS = ['sigma-contable', 'sonrisa-norte', 'matsu'] as const
const SEED_PREFIX = 'qaseed-'
const BOT_SLUG_PREFIX = 'qaseed-bot-'
const NAME_PREFIX = 'Lead de prueba — '
const DAY = 86_400_000

type RefType = 'google' | 'instagram' | 'ownsite' | 'direct'
type Period = 'cur' | 'prev'

interface Bool6 {
  providedPhone?: boolean
  providedEmail?: boolean
  requestedAppointment?: boolean
  askedSpecificModel?: boolean
  mentionedFinancing?: boolean
  mentionedTradeIn?: boolean
}

interface LeadTpl {
  firstName: string
  classification: LeadClassification
  score: number
  status: ChatbotLeadStatus
  intent: ChatbotLeadIntent
  category: LeadCategory
  ref: RefType
  signals: Bool6
  period: Period
  /** posición dentro del período (cur: fracción 0..1 del tiempo transcurrido; prev: día) */
  at: number
  /** minutos hasta el primer contacto; null = todavía sin contactar */
  contactDelayMin: number | null
  message: string
}

// 9 leads que ejercitan: clasificación (hot×3, warm×3, cold×2, dq×1), status
// (NEW×4, CONTACTED×3, WON, LOST), velocidad (5 con firstContactedAt), origen
// (Google/Instagram/sitio propio/Directo) y las 6 señales variadas. Distribuidos
// entre la semana actual (6) y la anterior (3) para las comparativas.
const LEADS: LeadTpl[] = [
  { firstName: 'Juan', classification: 'hot', score: 88, status: 'NEW', intent: 'QUOTE_REQUEST', category: 'sales', ref: 'google', signals: { providedPhone: true, requestedAppointment: true, askedSpecificModel: true }, period: 'cur', at: 0.2, contactDelayMin: null, message: 'Quiero cotizar el Corolla 2021, ¿tienen stock?' },
  { firstName: 'Sofía', classification: 'hot', score: 82, status: 'NEW', intent: 'PURCHASE_READY', category: 'sales', ref: 'instagram', signals: { providedPhone: true, mentionedFinancing: true }, period: 'cur', at: 0.35, contactDelayMin: null, message: 'Lo quiero comprar ya, ¿financian en cuotas?' },
  { firstName: 'Martín', classification: 'warm', score: 58, status: 'CONTACTED', intent: 'SCHEDULE_VISIT', category: 'sales', ref: 'ownsite', signals: { providedEmail: true, askedSpecificModel: true }, period: 'cur', at: 0.5, contactDelayMin: 45, message: '¿Puedo ir a verlo el sábado?' },
  { firstName: 'Lucía', classification: 'cold', score: 32, status: 'CONTACTED', intent: 'SUPPORT', category: 'sales', ref: 'direct', signals: { providedPhone: true }, period: 'cur', at: 0.6, contactDelayMin: 180, message: 'Una consulta general sobre los planes.' },
  { firstName: 'Diego', classification: 'warm', score: 61, status: 'WON', intent: 'QUOTE_REQUEST', category: 'sales', ref: 'google', signals: { providedPhone: true, providedEmail: true, mentionedTradeIn: true }, period: 'cur', at: 0.7, contactDelayMin: 20, message: 'Entrego mi auto usado como parte de pago.' },
  { firstName: 'Carolina', classification: 'cold', score: 28, status: 'LOST', intent: 'OTHER', category: 'sales', ref: 'instagram', signals: { providedEmail: true }, period: 'prev', at: 1, contactDelayMin: 240, message: 'Estaba mirando nomás, gracias.' },
  { firstName: 'Pablo', classification: 'hot', score: 79, status: 'CONTACTED', intent: 'PURCHASE_READY', category: 'sales', ref: 'ownsite', signals: { providedPhone: true, requestedAppointment: true, mentionedFinancing: true }, period: 'prev', at: 3, contactDelayMin: 90, message: 'Listo para cerrar, coordinemos la entrega.' },
  { firstName: 'Marina', classification: 'warm', score: 54, status: 'NEW', intent: 'QUOTE_REQUEST', category: 'sales', ref: 'google', signals: { providedPhone: true }, period: 'prev', at: 5, contactDelayMin: null, message: '¿Qué precio tiene el modelo base?' },
  { firstName: 'Promo SEO (descartar)', classification: 'dq', score: 8, status: 'NEW', intent: 'OTHER', category: 'spam', ref: 'direct', signals: {}, period: 'cur', at: 0.15, contactDelayMin: null, message: 'Ofrezco servicios de posicionamiento web, ¿le interesa?' },
]

function refData(ref: RefType, siteUrl: string | null, slug: string): { referrerUrl: string | null; currentPath: string } {
  const ownBase = siteUrl ?? `https://www.${slug}.com.ar`
  switch (ref) {
    case 'google':
      return { referrerUrl: 'https://www.google.com/', currentPath: '/usados' }
    case 'instagram':
      return { referrerUrl: 'https://l.instagram.com/', currentPath: '/promociones' }
    case 'ownsite':
      return { referrerUrl: `${ownBase.replace(/\/$/, '')}/inicio`, currentPath: '/contacto' }
    case 'direct':
      return { referrerUrl: null, currentPath: '/' }
  }
}

async function main() {
  const { prisma } = await import('../../src/lib/prisma')
  const { weekRangeAR, previousRangeForPeriod } = await import('../../src/lib/dates-ar')

  const now = new Date()
  const cur = weekRangeAR(now)
  const prev = previousRangeForPeriod('week', now)
  const elapsed = Math.max(60_000, now.getTime() - cur.start.getTime())

  const capturedFor = (tpl: LeadTpl): Date =>
    tpl.period === 'cur'
      ? new Date(cur.start.getTime() + elapsed * tpl.at)
      : new Date(prev.start.getTime() + tpl.at * DAY)

  let grandTotal = 0
  for (const slug of QA_ORG_SLUGS) {
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true, siteUrl: true, botConfig: { select: { id: true } } },
    })
    if (!org) {
      console.log(`⚠️  ${slug}: la org NO existe — salteada.`)
      continue
    }
    // Si la org no tiene bot, se crea uno QA mínimo (idempotente por
    // organizationId @unique, marcado con slug `qaseed-bot-` para la limpieza,
    // isActive:false para que no quede "vivo"). Solo entra a esta rama si NO hay
    // bot — un bot real existente nunca se pisa.
    let botId = org.botConfig?.id
    if (!botId) {
      const bot = await prisma.botConfig.upsert({
        where: { organizationId: org.id },
        create: {
          organizationId: org.id,
          slug: `${BOT_SLUG_PREFIX}${slug}`,
          botName: `Bot de prueba QA — ${slug}`,
          welcomeMessage: 'Hola, soy el asistente de prueba (QA). ¿En qué te ayudo?',
          isActive: false,
        },
        update: {},
        select: { id: true },
      })
      botId = bot.id
      console.log(`  · ${slug}: sin bot → botConfig QA creado (slug ${BOT_SLUG_PREFIX}${slug}, isActive=false).`)
    }

    let count = 0
    for (let i = 0; i < LEADS.length; i++) {
      const tpl = LEADS[i]
      const idx = String(i + 1).padStart(2, '0')
      const convId = `${SEED_PREFIX}${slug}-conv-${idx}`
      const leadId = `${SEED_PREFIX}${slug}-lead-${idx}`
      const sessionId = `${SEED_PREFIX}${slug}-sess-${idx}`

      const capturedAt = capturedFor(tpl)
      const { referrerUrl, currentPath } = refData(tpl.ref, org.siteUrl, slug)
      const startedAt = new Date(capturedAt.getTime() - 5 * 60_000)
      const lastMessageAt = capturedAt
      const firstContactedAt =
        tpl.contactDelayMin == null
          ? null
          : new Date(Math.min(capturedAt.getTime() + tpl.contactDelayMin * 60_000, now.getTime() - 60_000))

      await prisma.conversation.upsert({
        where: { id: convId },
        create: {
          id: convId,
          botConfigId: botId,
          sessionId,
          referrerUrl,
          currentPath,
          startedAt,
          lastMessageAt,
          messageCount: 6,
          leadCaptured: true,
        },
        update: { referrerUrl, currentPath, startedAt, lastMessageAt, messageCount: 6, leadCaptured: true },
      })

      const data = {
        botConfigId: botId,
        conversationId: convId,
        name: `${NAME_PREFIX}${tpl.firstName}`,
        email: `${tpl.firstName.split(' ')[0].toLowerCase()}.prueba@example.com`,
        phone: `+54 9 11 5555-00${idx}`,
        intent: tpl.intent,
        message: tpl.message,
        category: tpl.category,
        channel: 'widget',
        requestedAppointment: tpl.signals.requestedAppointment ?? false,
        mentionedFinancing: tpl.signals.mentionedFinancing ?? false,
        mentionedTradeIn: tpl.signals.mentionedTradeIn ?? false,
        askedSpecificModel: tpl.signals.askedSpecificModel ?? false,
        providedPhone: tpl.signals.providedPhone ?? false,
        providedEmail: tpl.signals.providedEmail ?? false,
        utmSource: tpl.ref === 'instagram' ? 'instagram' : null,
        score: tpl.score,
        classification: tpl.classification,
        status: tpl.status,
        firstContactedAt,
        lastStatusChangeAt: tpl.status === 'NEW' ? null : firstContactedAt ?? capturedAt,
        capturedAt,
      }

      await prisma.chatbotLead.upsert({ where: { id: leadId }, create: { id: leadId, ...data }, update: data })
      count++
    }
    grandTotal += count
    console.log(`✓ ${slug}: ${count} leads (+ ${count} conversaciones) sembrados/actualizados.`)
  }

  console.log(`\nTotal: ${grandTotal} leads sembrados. Marca de limpieza: id LIKE '${SEED_PREFIX}%' (leads/convs) + slug LIKE '${BOT_SLUG_PREFIX}%' (bots QA).`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
