/**
 * B6 — Deja el terreno listo para el checklist de outreach (LeadOS).
 *
 * Corre SOLO contra la branch Neon dev (host check abajo). Idempotente.
 *
 * Qué deja armado:
 *   1. "QA-B6 Pizzería Don Carlo" (score 3, AVANZAR, EVALUADA, sin
 *      actividades): el camino completo del flujo invertido desde la UI —
 *      Paso 7 (opener sin link, sin demo posible) → "no respondió" (la
 *      cadencia se reagenda sola) → "respondió" (gate abierto) → producir y
 *      aprobar por B3/B4/B5 → recién ahí el Paso 9 ofrece el envío.
 *   2. "QA-B6 Gimnasio Atlas" (score 4, CALIENTE, dossier ya APROBADA con
 *      finalUrl, sin actividades): el camino preventivo — el Paso 9 ofrece
 *      el envío ANTES de la respuesta; marcar "envié" dos veces verifica la
 *      idempotencia (un solo OsDemo, lead PROSPECTO→DEMO_ENVIADA).
 *
 * Uso: npx tsx scripts/b6-qa-outreach.ts
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

const PIZZERIA = 'QA-B6 Pizzería Don Carlo'
const GIMNASIO = 'QA-B6 Gimnasio Atlas'
const FINAL_URL_GIMNASIO = 'https://qa-b6-gimnasio-atlas.example.com'

async function main() {
  // Imports dinámicos para que dotenv corra antes de instanciar PrismaClient.
  const { prisma } = await import('../src/lib/prisma')
  const { transitionDossier } = await import('../src/lib/leados/dossier')
  const { FichaSchema } = await import('../src/lib/leados/contracts')

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

  const fichaQa = (notas: string) =>
    FichaSchema.parse({
      identidad: { notas, igManejadoPor: 'DUENO' },
      presenciaDigital: 'Instagram activo con stories diarias; sin web propia.',
      resenas: '"Atienden de diez pero nunca sé si está abierto" — reseña de Google.',
    })

  const asegurarLead = async (
    businessName: string,
    data: Omit<Prisma.OsLeadCreateInput, 'businessName'>,
  ) => {
    const existente = await prisma.osLead.findFirst({
      where: { businessName },
      select: { id: true, status: true },
    })
    if (existente) {
      console.log(`✅ ${businessName}: ya existe (${existente.id})`)
      return existente.id
    }
    const creado = await prisma.osLead.create({
      data: { businessName, ...data },
      select: { id: true },
    })
    console.log(`✨ ${businessName}: creado y asignado (${creado.id})`)
    return creado.id
  }

  const asegurarDossierEvaluado = async (
    leadId: string,
    businessName: string,
    notas: string,
    score: number,
    veredicto: 'AVANZAR' | 'CALIENTE',
  ) => {
    const dossier = await prisma.osLeadDossier.upsert({
      where: { leadId },
      update: {},
      create: { leadId },
    })
    if (dossier.stage !== 'FICHA') {
      console.log(`✅ ${businessName}: dossier ya en ${dossier.stage}`)
      return dossier.stage
    }
    await prisma.osLeadDossier.update({
      where: { leadId },
      data: { fichaJson: fichaQa(notas) as Prisma.InputJsonValue },
    })
    await transitionDossier(leadId, {
      to: 'EVALUADA',
      evaluacion: {
        score,
        veredicto,
        razonamiento: `Evaluación QA-B6: señal suficiente, score ${score}.`,
      },
    })
    console.log(`📝 ${businessName}: ficha QA + EVALUADA (score ${score}, ${veredicto})`)
    return 'EVALUADA' as const
  }

  // 1. Pizzería (score 3): queda EVALUADA, sin actividades — el checklist
  //    arranca en el Paso 7 desde la UI.
  const pizzeriaId = await asegurarLead(PIZZERIA, {
    contactName: 'Carlos',
    industry: 'Pizzería',
    zone: 'Barrio Norte',
    instagramUrl: 'https://instagram.com/pizzeria.doncarlo.qa',
    notes:
      'Lead QA del bloque B6 — camino normal: opener (Paso 7) → cadencia → respondió → producir → aprobar → enviar (Paso 9).',
    assignedTo: { connect: { id: setter.id } },
  })
  await asegurarDossierEvaluado(
    pizzeriaId,
    PIZZERIA,
    'El dueño contesta los DMs él mismo, tarda pero contesta.',
    3,
    'AVANZAR',
  )

  // 2. Gimnasio (score 4, caliente): dossier empujado hasta APROBADA con
  //    finalUrl — el Paso 9 ofrece el envío preventivo apenas se abre la UI.
  const gimnasioId = await asegurarLead(GIMNASIO, {
    contactName: 'Mariana',
    industry: 'Gimnasio',
    zone: 'Yerba Buena',
    instagramUrl: 'https://instagram.com/gimnasio.atlas.qa',
    notes:
      'Lead QA del bloque B6 — camino preventivo (caliente): demo APROBADA antes de respuesta; verificar envío + idempotencia.',
    assignedTo: { connect: { id: setter.id } },
  })
  let stageGimnasio = await asegurarDossierEvaluado(
    gimnasioId,
    GIMNASIO,
    'Cuenta muy activa, responden rápido las consultas en comentarios.',
    4,
    'CALIENTE',
  )
  if (stageGimnasio === 'EVALUADA') {
    await transitionDossier(gimnasioId, { to: 'BRIEF' })
    stageGimnasio = 'BRIEF'
  }
  if (stageGimnasio === 'BRIEF') {
    await transitionDossier(gimnasioId, { to: 'CONSTRUCCION' })
    stageGimnasio = 'CONSTRUCCION'
  }
  if (stageGimnasio === 'CONSTRUCCION') {
    await prisma.osLeadDossier.update({
      where: { leadId: gimnasioId },
      data: { draftUrl: 'https://qa-b6-gimnasio-atlas-draft.example.com' },
    })
    await transitionDossier(gimnasioId, { to: 'EN_REVISION' })
    stageGimnasio = 'EN_REVISION'
  }
  if (stageGimnasio === 'EN_REVISION') {
    await transitionDossier(gimnasioId, {
      to: 'APROBADA',
      finalUrl: FINAL_URL_GIMNASIO,
    })
    console.log(`🚀 ${GIMNASIO}: empujado a APROBADA con finalUrl (${FINAL_URL_GIMNASIO})`)
  } else if (stageGimnasio === 'APROBADA') {
    console.log(`✅ ${GIMNASIO}: ya estaba APROBADA`)
  }

  const resumen = await prisma.osLead.findMany({
    where: { businessName: { in: [PIZZERIA, GIMNASIO] } },
    select: {
      businessName: true,
      status: true,
      nextFollowUpAt: true,
      dossier: { select: { stage: true, finalUrl: true, enviadaAt: true } },
      _count: { select: { activities: true, demos: true } },
    },
  })
  console.log('\nEstado QA-B6:')
  for (const lead of resumen) {
    console.log(
      `  ${lead.businessName} — status ${lead.status} · stage ${lead.dossier?.stage ?? '—'} · ` +
        `actividades ${lead._count.activities} · demos ${lead._count.demos} · ` +
        `enviadaAt ${lead.dossier?.enviadaAt?.toISOString() ?? 'null'}`,
    )
  }
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
