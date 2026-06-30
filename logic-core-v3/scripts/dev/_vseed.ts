import { config } from 'dotenv'; config({ path: '.env.local' })
async function main(){
  const { prisma } = await import('../../src/lib/prisma')
  const org = await prisma.organization.findUnique({ where: { slug: 'san-miguel' }, select: { id: true, botConfig: { select: { id: true } } } })
  if (!org) { console.log('san-miguel no existe'); return }
  let botId = org.botConfig?.id
  let createdBot = false
  if (!botId) {
    const b = await prisma.botConfig.upsert({ where: { organizationId: org.id }, update: {}, create: { organizationId: org.id, slug: 'qaseed-bot-san-miguel', botName: 'QA verif', welcomeMessage: 'hola', isActive: false }, select: { id: true } })
    botId = b.id; createdBot = true
  }
  const now = Date.now()
  const leads = [
    { i: 1, name: 'Juan', intent: 'QUOTE_REQUEST', msg: 'Quiero cotizar el Corolla 2021', cls: 'hot', score: 88, status: 'NEW', ref: 'https://www.google.com/', fc: null, phone: true, appt: true, model: true },
    { i: 2, name: 'Diego', intent: 'PURCHASE_READY', msg: 'Lo compro ya', cls: 'warm', score: 60, status: 'WON', ref: 'https://l.instagram.com/', fc: 20, phone: true, fin: true },
    { i: 3, name: 'Marina', intent: 'SCHEDULE_VISIT', msg: 'Quiero ir a verlo', cls: 'cold', score: 30, status: 'CONTACTED', ref: null, fc: 90 },
  ]
  for (const l of leads) {
    const convId = `qaseed-sanmiguel-conv-0${l.i}`, leadId = `qaseed-sanmiguel-lead-0${l.i}`
    const capturedAt = new Date(now - l.i*3600_000)
    await prisma.conversation.upsert({ where: { id: convId }, update: {}, create: { id: convId, botConfigId: botId!, sessionId: `qaseed-sm-${l.i}`, referrerUrl: l.ref, currentPath: '/usados', startedAt: new Date(capturedAt.getTime()-300000), lastMessageAt: capturedAt, messageCount: 5, leadCaptured: true } })
    const data = { botConfigId: botId!, conversationId: convId, name: `Lead de prueba — ${l.name}`, intent: l.intent as any, message: l.msg, category: 'sales' as const, channel: 'widget', providedPhone: !!l.phone, requestedAppointment: !!l.appt, askedSpecificModel: !!l.model, mentionedFinancing: !!l.fin, score: l.score, classification: l.cls as any, status: l.status as any, firstContactedAt: l.fc==null?null:new Date(capturedAt.getTime()+l.fc*60000), capturedAt }
    await prisma.chatbotLead.upsert({ where: { id: leadId }, update: data, create: { id: leadId, ...data } })
  }
  console.log(`seeded san-miguel: 3 leads (createdBot=${createdBot})`)
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
