/**
 * B7 — Deja el terreno listo para el checklist de agenda (LeadOS).
 *
 * Corre SOLO contra la branch Neon dev (host check abajo). Idempotente.
 *
 * Qué deja armado:
 *   1. "QA-B7 Estética Bella Vista" asignada al setter QA, dossier EVALUADA
 *      (score 3) con ficha (IG manejado por el dueño), opener registrado y
 *      respuesta registrada → lead en RESPONDIO. Desde la UI: el Paso 10 se
 *      ofrece, exige el check del decisor + notas de traspaso, pide slots
 *      reales (requiere setup B7.0) y el booking mueve a CALL_AGENDADA.
 *   2. "QA-B7 Vivero El Aromo" en CALL_AGENDADA con agendaJson AGENDADA
 *      (booking SIMULADO, uid qa-b7-booking-demo — no existe en Cal.com):
 *      el Paso 10 muestra el resumen del traspaso, y el panel admin de
 *      /admin/leads/[id] ofrece "realizada" + resultado (GANADO admin-only)
 *      sin necesidad del setup B7.0.
 *
 * Uso: npx tsx scripts/b7-qa-agenda.ts
 */
import { config as loadEnv } from 'dotenv'
// Import type-only: se borra al compilar, no instancia el client antes de dotenv.
import type { Prisma } from '@prisma/client'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const DEV_BRANCH_HOST = 'ep-quiet-waterfall-acv0fpll'

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error(
    `ABORT: DATABASE_URL no apunta a la branch Neon dev (${DEV_BRANCH_HOST}-*). ` +
      'Este script solo corre contra dev.',
  )
  process.exit(1)
}

const ESTETICA = 'QA-B7 Estética Bella Vista'
const VIVERO = 'QA-B7 Vivero El Aromo'

async function main() {
  // Imports dinámicos para que dotenv corra antes de instanciar PrismaClient.
  const { prisma } = await import('../src/lib/prisma')
  const { transitionDossier } = await import('../src/lib/leados/dossier')
  const { FichaSchema } = await import('../src/lib/leados/contracts')
  const { registrarContactoComercial } = await import('../src/lib/os-commercial')

  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true, role: true },
  })
  if (!setter || setter.role !== 'SETTER') {
    console.error(
      "ABORT: setter-qa@develop.test no existe (o no es SETTER). Corré 'npx tsx prisma/seed.ts' antes.",
    )
    process.exit(1)
  }

  // 1. Lead asignado al setter QA
  let leadId: string
  const existente = await prisma.osLead.findFirst({
    where: { businessName: ESTETICA },
    select: { id: true, status: true },
  })
  if (existente) {
    console.log(`✅ ${ESTETICA}: ya existe (${existente.id}, ${existente.status})`)
    leadId = existente.id
  } else {
    const creado = await prisma.osLead.create({
      data: {
        businessName: ESTETICA,
        contactName: 'Valeria',
        email: 'valeria@bellavista.example.com',
        industry: 'Estética',
        zone: 'Centro',
        instagramUrl: 'https://instagram.com/estetica.bellavista.qa',
        notes:
          'Lead QA del bloque B7 — camino de agenda: RESPONDIO + acepta reunirse → Paso 10 (slots reales, requiere setup B7.0).',
        assignedTo: { connect: { id: setter.id } },
      },
      select: { id: true },
    })
    console.log(`✨ ${ESTETICA}: creado y asignado (${creado.id})`)
    leadId = creado.id
  }

  // 2. Dossier con ficha (dueño al mando del IG — el hint del decisor) + EVALUADA
  const dossier = await prisma.osLeadDossier.upsert({
    where: { leadId },
    update: {},
    create: { leadId },
  })
  if (dossier.stage === 'FICHA') {
    const ficha = FichaSchema.parse({
      identidad: {
        notas: 'Atiende Valeria, la dueña — responde ella misma los DMs.',
        igManejadoPor: 'DUENO',
      },
      presenciaDigital: 'Instagram activo con turnos por DM; sin web.',
      resenas: '"Excelente atención pero conseguir turno es una odisea" — Google.',
    })
    await prisma.osLeadDossier.update({
      where: { leadId },
      data: { fichaJson: ficha as Prisma.InputJsonValue },
    })
    await transitionDossier(leadId, {
      to: 'EVALUADA',
      evaluacion: {
        score: 3,
        veredicto: 'AVANZAR',
        razonamiento: 'Evaluación QA-B7: señal suficiente para conversación y reunión.',
      },
    })
    console.log(`📝 ${ESTETICA}: ficha QA + EVALUADA (score 3)`)
  } else {
    console.log(`✅ ${ESTETICA}: dossier ya en ${dossier.stage}`)
  }

  // 3. Conversación: opener + respuesta → RESPONDIO (por la puerta existente)
  const actividades = await prisma.osLeadActivity.count({ where: { leadId } })
  if (actividades === 0) {
    await registrarContactoComercial({
      leadId,
      channel: 'INSTAGRAM_DM',
      result: 'SIN_RESPUESTA',
      notes: 'Opener: Hola Valeria! Vi las reseñas del local — sale un mimo para los turnos?',
      performedById: setter.id,
    })
    await registrarContactoComercial({
      leadId,
      channel: 'INSTAGRAM_DM',
      result: 'RESPONDIO',
      notes: 'Respondió: "sí! me interesa, ¿podemos hablarlo en una llamada?"',
      performedById: setter.id,
    })
    console.log(`💬 ${ESTETICA}: opener + respuesta registrados → RESPONDIO`)
  } else {
    console.log(`✅ ${ESTETICA}: ya tiene ${actividades} contactos registrados`)
  }

  // 4. Segundo lead: agendada SIMULADA → resumen Paso 10 + panel admin de cierre
  const { AgendaSchema } = await import('../src/lib/leados/contracts')
  let viveroId: string
  const viveroExistente = await prisma.osLead.findFirst({
    where: { businessName: VIVERO },
    select: { id: true, status: true },
  })
  if (viveroExistente) {
    console.log(`✅ ${VIVERO}: ya existe (${viveroExistente.id}, ${viveroExistente.status})`)
    viveroId = viveroExistente.id
  } else {
    const creado = await prisma.osLead.create({
      data: {
        businessName: VIVERO,
        contactName: 'Ramón',
        email: 'ramon@elaromo.example.com',
        industry: 'Vivero',
        zone: 'Camino del Perú',
        status: 'CALL_AGENDADA',
        instagramUrl: 'https://instagram.com/vivero.elaromo.qa',
        notes:
          'Lead QA del bloque B7 — booking SIMULADO (uid qa-b7-booking-demo, no existe en Cal.com): para verificar el resumen del Paso 10 y el cierre de loop admin (realizada + GANADO).',
        assignedTo: { connect: { id: setter.id } },
      },
      select: { id: true },
    })
    const agendaSimulada = AgendaSchema.parse({
      estado: 'AGENDADA',
      calBookingUid: 'qa-b7-booking-demo',
      slotStart: '2026-06-16T10:30:00.000-03:00',
      attendee: { nombre: 'Ramón', email: 'ramon@elaromo.example.com' },
      notasTraspaso:
        'Dueño directo, decide él. Le duele perder ventas de fin de semana porque no da abasto con los DMs. Espera ver cómo la web le ordena los pedidos. Tono campechano — nada de tecnicismos.',
      agendadaAt: new Date().toISOString(),
    })
    await prisma.osLeadDossier.create({
      data: { leadId: creado.id, agendaJson: agendaSimulada as Prisma.InputJsonValue },
    })
    console.log(`✨ ${VIVERO}: creado en CALL_AGENDADA con agenda simulada (${creado.id})`)
    viveroId = creado.id
  }

  const leads = await prisma.osLead.findMany({
    where: { id: { in: [leadId, viveroId] } },
    select: {
      id: true,
      businessName: true,
      status: true,
      dossier: { select: { stage: true, agendaJson: true } },
    },
  })
  console.log('\n— Estado final —')
  for (const lead of leads) {
    console.log(
      `   ${lead.businessName}: status=${lead.status} · stage=${lead.dossier?.stage} · agenda=${lead.dossier?.agendaJson ? 'AGENDADA' : 'vacía'} · id=${lead.id}`,
    )
  }
  console.log('\nChecklist: entrá como setter-qa@develop.test → la Estética ofrece el Paso 10')
  console.log('(sin notas de traspaso no deja confirmar; el booking real exige setup B7.0).')
  console.log('Como admin: /admin/leads/<id del Vivero> muestra el panel de reunión y el cierre.')
}

main()
  .catch((error) => {
    console.error('❌ b7-qa-agenda falló:', error)
    process.exit(1)
  })
  .finally(async () => {
    const { prisma } = await import('../src/lib/prisma')
    await prisma.$disconnect()
  })
