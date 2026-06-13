/**
 * B5 — Puebla la cola de revisión del admin con los dossiers QA (LeadOS).
 *
 * B4 (construcción/self-check) todavía no existe: este script es el camino
 * reproducible para empujar dossiers QA a EN_REVISION sin tocar Prisma Studio
 * a mano. Corre SOLO contra la branch Neon dev (host check abajo). Idempotente.
 *
 * Qué deja armado:
 *   1. "QA-B3 Café La Esquina" (score 4, CALIENTE) → EN_REVISION + draftUrl.
 *      Si estaba RECHAZADA (de una corrida previa del checklist), la re-empuja
 *      CONSTRUCCION → EN_REVISION (el loop legal de rechazo).
 *   2. "QA-B3 Panadería Doña Rosa" (score 3) → status RESPONDIO (abre el gate)
 *      + brief mínimo → EN_REVISION + draftUrl. Es el ítem "normal": en la
 *      cola tiene que aparecer DEBAJO del caliente.
 *   3. Estampa `fecha` en las evaluaciones QA sin fecha (pre-B5): café hace
 *      2 días, panadería hace 10, ferretería hace 40 → la métrica
 *      descarte/avance muestra la diferencia total vs últimos 30 días.
 *   4. "QA-B5 Vivero Las Talitas": lead nuevo asignado al setter, SIN dossier
 *      — para correr ficha → evaluación score 4 desde la UI y verificar el
 *      Telegram de caliente en vivo.
 *
 * Uso: npx tsx scripts/b5-qa-review-queue.ts
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

const CAFE = 'QA-B3 Café La Esquina'
const PANADERIA = 'QA-B3 Panadería Doña Rosa'
const FERRETERIA = 'QA-B3 Ferretería El Tornillo'
const VIVERO = 'QA-B5 Vivero Las Talitas'

const diasAtras = (dias: number) =>
  new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()

async function main() {
  // Imports dinámicos para que dotenv corra antes de instanciar PrismaClient.
  const { prisma } = await import('../src/lib/prisma')
  const { transitionDossier } = await import('../src/lib/leados/dossier')
  const { BriefSchema, EvaluacionSchema } = await import('../src/lib/leados/contracts')

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

  const leadPorNombre = async (businessName: string) =>
    prisma.osLead.findFirst({
      where: { businessName },
      select: { id: true, status: true },
    })

  const estamparFecha = async (leadId: string, fechaIso: string) => {
    const dossier = await prisma.osLeadDossier.findUnique({ where: { leadId } })
    if (!dossier) return
    const evaluacion = EvaluacionSchema.safeParse(dossier.evaluacionJson)
    if (!evaluacion.success || evaluacion.data.fecha) return
    await prisma.osLeadDossier.update({
      where: { leadId },
      data: {
        evaluacionJson: { ...evaluacion.data, fecha: fechaIso } as Prisma.InputJsonValue,
      },
    })
    console.log(`🕒 fecha de evaluación estampada (${fechaIso.slice(0, 10)}) — lead ${leadId}`)
  }

  const empujarARevision = async (businessName: string, draftUrl: string) => {
    const lead = await leadPorNombre(businessName)
    if (!lead) {
      console.log(`⏭️  ${businessName}: no existe — corré scripts/b3-qa-assign-leads.ts primero`)
      return
    }
    const dossier = await prisma.osLeadDossier.findUnique({ where: { leadId: lead.id } })
    if (!dossier) {
      console.log(`⏭️  ${businessName}: sin dossier (faltó el flujo B3 del wizard)`)
      return
    }

    let stage = dossier.stage
    if (stage === 'EN_REVISION') {
      console.log(`✅ ${businessName}: ya está EN_REVISION`)
    } else if (stage === 'APROBADA' || stage === 'DESCARTADA') {
      console.log(`⏭️  ${businessName}: stage terminal ${stage} — no se toca`)
      return
    } else {
      if (stage === 'RECHAZADA') {
        await transitionDossier(lead.id, { to: 'CONSTRUCCION' })
        stage = 'CONSTRUCCION'
      }
      if (stage === 'EVALUADA') {
        await transitionDossier(lead.id, { to: 'BRIEF' })
        stage = 'BRIEF'
      }
      if (stage === 'BRIEF') {
        await transitionDossier(lead.id, { to: 'CONSTRUCCION' })
        stage = 'CONSTRUCCION'
      }
      if (stage === 'CONSTRUCCION') {
        await transitionDossier(lead.id, { to: 'EN_REVISION' })
        console.log(`✨ ${businessName}: empujado a EN_REVISION`)
      } else {
        console.log(`⏭️  ${businessName}: stage ${stage} no empujable (¿ficha sin evaluar?)`)
        return
      }
    }

    if (!dossier.draftUrl) {
      await prisma.osLeadDossier.update({
        where: { leadId: lead.id },
        data: { draftUrl },
      })
      console.log(`🔗 ${businessName}: draftUrl seteada (${draftUrl})`)
    }
  }

  // 1. Café (caliente, score 4): BRIEF → … → EN_REVISION.
  const cafe = await leadPorNombre(CAFE)
  if (cafe) await estamparFecha(cafe.id, diasAtras(2))
  await empujarARevision(CAFE, 'https://example.com')

  // 2. Panadería (score 3, "normal"): gate cerrado → RESPONDIO lo abre.
  const panaderia = await leadPorNombre(PANADERIA)
  if (panaderia) {
    if (panaderia.status === 'PROSPECTO') {
      await prisma.osLead.update({
        where: { id: panaderia.id },
        data: { status: 'RESPONDIO' },
      })
      console.log(`🔁 ${PANADERIA}: status → RESPONDIO (abre el gate del brief)`)
    }
    const dossier = await prisma.osLeadDossier.findUnique({
      where: { leadId: panaderia.id },
    })
    if (dossier && !dossier.briefJson) {
      const brief = BriefSchema.parse({
        titulo: 'Demo Panadería Doña Rosa',
        concepto: 'One-page cálida, foco en producto fresco del día.',
        secciones: ['Hero', 'Productos', 'Horarios', 'Contacto'],
      })
      await prisma.osLeadDossier.update({
        where: { leadId: panaderia.id },
        data: { briefJson: brief as Prisma.InputJsonValue },
      })
      console.log(`📝 ${PANADERIA}: brief mínimo QA guardado`)
    }
    await estamparFecha(panaderia.id, diasAtras(10))
  }
  await empujarARevision(PANADERIA, 'https://example.org')

  // 3. Ferretería (DESCARTADA): solo la fecha, fuera de la ventana de 30 días.
  const ferreteria = await leadPorNombre(FERRETERIA)
  if (ferreteria) await estamparFecha(ferreteria.id, diasAtras(40))

  // 4. Vivero: lead fresco para el Telegram de caliente desde la UI.
  const vivero = await prisma.osLead.findFirst({ where: { businessName: VIVERO } })
  if (vivero) {
    console.log(`✅ ${VIVERO}: ya existe (${vivero.id})`)
  } else {
    const creado = await prisma.osLead.create({
      data: {
        businessName: VIVERO,
        contactName: 'Lucía',
        industry: 'Vivero',
        zone: 'Las Talitas',
        instagramUrl: 'https://instagram.com/vivero.lastalitas.qa',
        notes:
          'Lead QA del bloque B5 — correr ficha → evaluación score 4 desde la UI para verificar el Telegram de caliente.',
        assignedToId: setter.id,
      },
      select: { id: true },
    })
    console.log(`✨ ${VIVERO}: creado y asignado (${creado.id})`)
  }

  const enRevision = await prisma.osLeadDossier.count({ where: { stage: 'EN_REVISION' } })
  console.log(`\nCola de revisión: ${enRevision} dossier(s) EN_REVISION.`)
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
