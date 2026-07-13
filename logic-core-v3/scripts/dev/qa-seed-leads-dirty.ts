/**
 * QA SEED (dirty) — leads de prueba con datos "sucios" para verificar PA-2
 * (CSV injection / quoting roto en los exports admin de leads). Cubre:
 * prefijo de fórmula (= + - @), comillas y comas internas, y un lead de
 * control limpio. Escribe SOLO en la org QA `matsu`.
 *
 *   npx tsx scripts/dev/qa-seed-leads-dirty.ts
 *
 * IDEMPOTENTE: cada fila usa un id determinístico con prefijo `qaseed-dirty-`
 * y se inserta con upsert → correrlo N veces no duplica. Limpieza:
 * scripts/dev/qa-seed-leads-dirty-clean.ts borra EXACTAMENTE lo sembrado.
 *
 * Espeja el patrón de scripts/dev/qa-seed-leads.ts (mismo prefijo de ids
 * determinista, misma resolución org→bot con fallback QA, mismo estilo de
 * upsert). Simplificado respecto del original: sin la lógica de períodos
 * cur/prev (es para comparativas del dashboard, no aplica acá) y sin
 * diversidad de señales/clasificación (no son relevantes para el CSV export).
 *
 * No es throwaway: utilidad de QA reutilizable para regresión de PA-2, como
 * qa-seed-leads.ts lo es para el dashboard.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import type { ChatbotLeadIntent } from '@prisma/client'

const ORG_SLUG = 'matsu'
const SEED_PREFIX = 'qaseed-dirty-'
const BOT_SLUG_PREFIX = 'qaseed-bot-'

interface DirtyLeadTpl {
  case: string
  name: string
  email?: string
  phone?: string
  intent: ChatbotLeadIntent
}

// 8 leads: 4 disparan anti-fórmula (= + - @ al inicio de name), 2 disparan
// quoting roto (comilla y coma internas), 1 combina phone+email peligrosos,
// 1 es el control limpio (debe salir SIN comillas de más en el CSV).
const LEADS: DirtyLeadTpl[] = [
  { case: 'formula: name empieza con =', name: '=1+1', intent: 'OTHER' },
  { case: 'formula: name empieza con +', name: '+SUM(A1:A9)', intent: 'OTHER' },
  { case: 'formula: name empieza con -', name: '-2+3', intent: 'OTHER' },
  { case: 'formula: name empieza con @', name: '@admin', intent: 'OTHER' },
  { case: 'quoting: comilla interna', name: 'Juan "El Crack" Pérez', intent: 'QUOTE_REQUEST' },
  { case: 'quoting: coma interna', name: 'Pérez, Juan', intent: 'QUOTE_REQUEST' },
  {
    case: 'formula: phone y email peligrosos',
    name: 'Contacto Peligroso',
    email: '+admin@x.com',
    phone: '=cmd()',
    intent: 'SUPPORT',
  },
  { case: 'control: dato limpio (sin chars especiales)', name: 'Ana Torres', intent: 'INFO' },
]

async function main() {
  const { prisma } = await import('../../src/lib/prisma')

  const org = await prisma.organization.findUnique({
    where: { slug: ORG_SLUG },
    select: { id: true, botConfig: { select: { id: true } } },
  })
  if (!org) {
    console.log(`⚠️  ${ORG_SLUG}: la org NO existe — abortando.`)
    return
  }

  // Mismo fallback que qa-seed-leads.ts: si la org no tiene bot, se crea uno
  // QA mínimo (isActive:false). matsu tiene bot real en los seeds conocidos
  // del repo, así que esta rama normalmente no se ejecuta acá.
  let botId = org.botConfig?.id
  if (!botId) {
    const bot = await prisma.botConfig.upsert({
      where: { organizationId: org.id },
      create: {
        organizationId: org.id,
        slug: `${BOT_SLUG_PREFIX}${ORG_SLUG}`,
        botName: `Bot de prueba QA — ${ORG_SLUG}`,
        welcomeMessage: 'Hola, soy el asistente de prueba (QA). ¿En qué te ayudo?',
        isActive: false,
      },
      update: {},
      select: { id: true },
    })
    botId = bot.id
    console.log(
      `  · ${ORG_SLUG}: sin bot → botConfig QA creado (slug ${BOT_SLUG_PREFIX}${ORG_SLUG}, isActive=false).`,
    )
  }

  const now = new Date()
  let count = 0

  for (let i = 0; i < LEADS.length; i++) {
    const tpl = LEADS[i]
    const idx = String(i + 1).padStart(2, '0')
    const convId = `${SEED_PREFIX}${ORG_SLUG}-conv-${idx}`
    const leadId = `${SEED_PREFIX}${ORG_SLUG}-lead-${idx}`
    const sessionId = `${SEED_PREFIX}${ORG_SLUG}-sess-${idx}`

    const capturedAt = new Date(now.getTime() - (LEADS.length - i) * 5 * 60_000)
    const startedAt = new Date(capturedAt.getTime() - 5 * 60_000)

    await prisma.conversation.upsert({
      where: { id: convId },
      create: {
        id: convId,
        botConfigId: botId,
        sessionId,
        referrerUrl: null,
        currentPath: '/',
        startedAt,
        lastMessageAt: capturedAt,
        messageCount: 6,
        leadCaptured: true,
      },
      update: { startedAt, lastMessageAt: capturedAt, messageCount: 6, leadCaptured: true },
    })

    const data = {
      botConfigId: botId,
      conversationId: convId,
      name: tpl.name,
      email: tpl.email ?? `dirty${idx}.prueba@example.com`,
      phone: tpl.phone ?? `+54 9 11 5555-01${idx}`,
      intent: tpl.intent,
      message: 'Lead de prueba QA para verificar escape CSV (PA-2). No es un lead real.',
      category: 'sales' as const,
      channel: 'widget',
      requestedAppointment: false,
      mentionedFinancing: false,
      mentionedTradeIn: false,
      askedSpecificModel: false,
      providedPhone: false,
      providedEmail: false,
      utmSource: null,
      status: 'NEW' as const,
      capturedAt,
    }

    await prisma.chatbotLead.upsert({
      where: { id: leadId },
      create: { id: leadId, ...data },
      update: data,
    })
    count++
    console.log(
      `  · ${leadId} — ${tpl.case} — name="${tpl.name}"${tpl.email ? ` email="${tpl.email}"` : ''}${tpl.phone ? ` phone="${tpl.phone}"` : ''}`,
    )
  }

  console.log(
    `\n✓ ${ORG_SLUG}: ${count} leads sucios sembrados/actualizados. Marca de limpieza: id LIKE '${SEED_PREFIX}%'.`,
  )
  console.log(`Limpieza: npx tsx scripts/dev/qa-seed-leads-dirty-clean.ts`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
