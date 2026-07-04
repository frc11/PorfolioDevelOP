/**
 * Seed QA (Sprint 5.5) — estados del MANUAL que el tramo Seguimiento/Agenda
 * necesita para verse (M5 y M16). Corre SOLO contra la branch Neon dev (host
 * check abajo). Idempotente: reconcilia lead + dossier por businessName y
 * resetea/recrea las actividades → re-correrlo CONVERGE, no duplica.
 *
 * Complementa a `v1-qa-wizard-states.ts`: aquel siembra un lead por estado del
 * wizard pero SIN actividades ni envío/agenda, así que la derivación del manual
 * (`posicionDe`) nunca aterriza en M5 (necesita contactos > 0) ni en M16
 * (necesita demo enviada / reunión). Este cubre justo esos cuatro estados:
 *   · QA-M5 Toque     — EVALUADA, PROSPECTO, 2 toques SIN_RESPUESTA, toque vencido → m5 actual (próximo toque visible)
 *   · QA-M5 Agotada   — EVALUADA, PROSPECTO, 4 toques SIN_RESPUESTA, toque vencido → m5 actual (cadencia agotada / cierre)
 *   · QA-M16 Abierta  — APROBADA, RESPONDIO, demo enviada, sin reunión → m16 actual (form del booking)
 *   · QA-M16 Agendada — APROBADA, CALL_AGENDADA, demo enviada, agenda AGENDADA → m16 (resumen del traspaso)
 *
 * Uso: npx tsx scripts/dev/qa-manual-m5-m16.ts
 */
import { config as loadEnv } from 'dotenv'
import type { Prisma } from '@prisma/client'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const DEV_BRANCH_HOST = 'ep-quiet-waterfall-acv0fpll'
if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error(`ABORT: DATABASE_URL no apunta a la branch Neon dev (${DEV_BRANCH_HOST}-*).`)
  process.exit(1)
}

const DIA_MS = 24 * 60 * 60 * 1000

async function main() {
  const { prisma } = await import('../../src/lib/prisma')
  const { Prisma: PrismaNs } = await import('@prisma/client')
  const { FichaSchema, EvaluacionSchema, BriefSchema, SelfCheckSchema, AgendaSchema } = await import(
    '../../src/lib/leados/contracts'
  )
  const { HARD_CHECKS } = await import('../../src/lib/leados/flow-content')

  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true, role: true },
  })
  if (!setter || setter.role !== 'SETTER') {
    console.error("ABORT: setter-qa@develop.test no existe (o no es SETTER). Corré 'npx tsx prisma/seed.ts'.")
    process.exit(1)
  }

  const json = <T,>(value: T) => value as unknown as Prisma.InputJsonValue

  const fichaCompleta = (negocio: string) =>
    json(
      FichaSchema.parse({
        identidad: { notas: `${negocio}: atiende el dueño, decide él.`, igManejadoPor: 'DUENO' },
        presenciaDigital: 'IG activo (2-3 posts/semana), sin web, Maps a medias.',
        resenas: '"Muy buena atención" — "A veces no contestan los mensajes".',
        contenidoReal: 'Logo simple, fotos propias decentes del producto.',
      }),
    )
  const evalAvanzar = (score: number) =>
    json(
      EvaluacionSchema.parse({
        score,
        veredicto: 'AVANZAR',
        razonamiento: 'Negocio vivo con demanda desatendida — una demo con CTA de WhatsApp tiene chance.',
        fecha: new Date(Date.now() - 2 * DIA_MS).toISOString(),
      }),
    )
  const briefMinimo = (negocio: string) =>
    json(
      BriefSchema.parse({
        titulo: `Demo ${negocio}`,
        concepto: 'One-page cálida, foco en WhatsApp.',
        secciones: ['Hero', 'Qué ofrecen', 'Reseñas', 'Contacto'],
        cta: 'Escribinos por WhatsApp',
        notasMarca: 'Colores de la marca, fotos reales.',
      }),
    )
  const selfCheck6de6 = () =>
    json(
      SelfCheckSchema.parse({
        itemsDuros: HARD_CHECKS.map((c) => ({ nombre: c.nombre, ok: true })),
        softFlags: [],
      }),
    )
  const agendaBlob = (nombre: string, email: string) =>
    json(
      AgendaSchema.parse({
        estado: 'AGENDADA',
        calBookingUid: 'qa-m16-booking-demo',
        slotStart: new Date(Date.now() + 3 * DIA_MS).toISOString(),
        attendee: { nombre, email },
        notasTraspaso:
          'Dueño, Marce. Le duele perder consultas por no contestar a tiempo. Tono cercano, tutealo. No hablar de SEO.',
        agendadaAt: new Date(Date.now() - 1 * DIA_MS).toISOString(),
      }),
    )

  type Seed = {
    businessName: string
    contactName: string
    email: string
    status: Prisma.OsLeadCreateInput['status']
    reactivateAt: Date | null
    nextFollowUpAt: Date | null
    sinRespuesta: number
    dossier: Omit<Prisma.OsLeadDossierUncheckedUpdateInput, 'leadId'>
  }

  const vencido = new Date(Date.now() - 1 * DIA_MS)

  const SEEDS: Seed[] = [
    {
      businessName: 'QA-M5 Toque',
      contactName: 'Rocío',
      email: 'rocio@qa-m5-toque.test',
      status: 'PROSPECTO',
      reactivateAt: null,
      nextFollowUpAt: vencido,
      sinRespuesta: 2, // cadenciaInfo(2): toquesHechos 1, próximo toque 2, no agotada
      dossier: { stage: 'EVALUADA', fichaJson: fichaCompleta('Cafetería'), evaluacionJson: evalAvanzar(3), briefJson: null, selfCheckJson: null, draftUrl: null, finalUrl: null, aprobadaAt: null, enviadaAt: null, agendaJson: PrismaNs.DbNull, rechazos: null },
    },
    {
      businessName: 'QA-M5 Agotada',
      contactName: 'Bruno',
      email: 'bruno@qa-m5-agotada.test',
      status: 'PROSPECTO',
      reactivateAt: null,
      // Agotada ⟹ el motor deja nextFollowUpAt=null (calculateNextFollowUp(4)===null);
      // igual cae en m5 actual por `cadencia.agotada` (no necesita followUpVencido).
      nextFollowUpAt: null,
      sinRespuesta: 4, // cadenciaInfo(4): agotada → sin próximo toque, estructura de cierre
      dossier: { stage: 'EVALUADA', fichaJson: fichaCompleta('Panadería'), evaluacionJson: evalAvanzar(3), briefJson: null, selfCheckJson: null, draftUrl: null, finalUrl: null, aprobadaAt: null, enviadaAt: null, agendaJson: PrismaNs.DbNull, rechazos: null },
    },
    {
      businessName: 'QA-M16 Abierta',
      contactName: 'Sofía',
      email: 'sofia@qa-m16-abierta.test',
      status: 'RESPONDIO',
      reactivateAt: null,
      nextFollowUpAt: null,
      sinRespuesta: 0,
      dossier: { stage: 'APROBADA', fichaJson: fichaCompleta('Estética'), evaluacionJson: evalAvanzar(4), briefJson: briefMinimo('Estética Aura'), selfCheckJson: selfCheck6de6(), draftUrl: 'https://qa-m16-abierta-draft.example.com', finalUrl: 'https://qa-m16-abierta.example.com', aprobadaAt: new Date(Date.now() - 2 * DIA_MS), enviadaAt: new Date(Date.now() - 1 * DIA_MS), agendaJson: PrismaNs.DbNull, rechazos: null },
    },
    {
      businessName: 'QA-M16 Agendada',
      contactName: 'Diego',
      email: 'diego@qa-m16-agendada.test',
      status: 'CALL_AGENDADA',
      reactivateAt: null,
      nextFollowUpAt: null,
      sinRespuesta: 0,
      dossier: { stage: 'APROBADA', fichaJson: fichaCompleta('Veterinaria'), evaluacionJson: evalAvanzar(4), briefJson: briefMinimo('Veterinaria Norte'), selfCheckJson: selfCheck6de6(), draftUrl: 'https://qa-m16-agendada-draft.example.com', finalUrl: 'https://qa-m16-agendada.example.com', aprobadaAt: new Date(Date.now() - 3 * DIA_MS), enviadaAt: new Date(Date.now() - 2 * DIA_MS), agendaJson: agendaBlob('Diego', 'diego@qa-m16-agendada.test'), rechazos: null },
    },
  ]

  const out: Array<{ businessName: string; leadId: string; status: string; stage: string }> = []

  for (const s of SEEDS) {
    const existente = await prisma.osLead.findFirst({ where: { businessName: s.businessName }, select: { id: true } })
    const patch: Prisma.OsLeadUncheckedUpdateInput = {
      assignedToId: setter.id,
      contactName: s.contactName,
      email: s.email,
      phone: '+54 381 555-0100',
      status: s.status,
      caliente: false,
      reactivateAt: s.reactivateAt,
      nextFollowUpAt: s.nextFollowUpAt,
    }

    let leadId: string
    if (existente) {
      leadId = existente.id
      await prisma.osLead.update({ where: { id: leadId }, data: patch })
    } else {
      const creado = await prisma.osLead.create({
        data: { businessName: s.businessName, industry: 'QA', zone: 'Tucumán', ...patch } as Prisma.OsLeadUncheckedCreateInput,
        select: { id: true },
      })
      leadId = creado.id
    }

    // Campos Json? en `null` → Prisma.DbNull (SQL NULL): Prisma rechaza el `null`
    // literal en columnas Json (mismo criterio que el seed V-1).
    const JSON_FIELDS = ['fichaJson', 'evaluacionJson', 'briefJson', 'selfCheckJson', 'agendaJson', 'rechazos'] as const
    const dossierData: Record<string, unknown> = { ...s.dossier }
    for (const f of JSON_FIELDS) {
      if (dossierData[f] === null) dossierData[f] = PrismaNs.DbNull
    }
    await prisma.osLeadDossier.upsert({
      where: { leadId },
      update: dossierData as Prisma.OsLeadDossierUncheckedUpdateInput,
      create: { leadId, ...dossierData } as Prisma.OsLeadDossierUncheckedCreateInput,
    })

    // Actividades: reset + re-crear N SIN_RESPUESTA (comerciales) para fijar
    // followUpCount y contactos>0 de forma determinística.
    await prisma.osLeadActivity.deleteMany({ where: { leadId, performedById: setter.id } })
    if (s.sinRespuesta > 0) {
      await prisma.osLeadActivity.createMany({
        data: Array.from({ length: s.sinRespuesta }, (_, i) => ({
          leadId,
          channel: 'INSTAGRAM_DM' as const,
          result: 'SIN_RESPUESTA' as const,
          notes: `QA toque ${i + 1}`,
          performedById: setter.id,
          createdAt: new Date(Date.now() - (s.sinRespuesta - i) * DIA_MS),
        })),
      })
    }

    out.push({ businessName: s.businessName, leadId, status: String(s.status), stage: String(s.dossier.stage) })
  }

  await prisma.$disconnect()

  console.log(`\n${'='.repeat(80)}\nSeed manual M5/M16 (owned por setter-qa):\n`)
  for (const r of out) {
    console.log(`  ${r.businessName.padEnd(18)} ${r.status.padEnd(14)} ${r.stage.padEnd(12)} ${r.leadId}`)
  }
  console.log('')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
