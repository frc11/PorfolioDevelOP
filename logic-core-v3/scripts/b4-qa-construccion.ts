/**
 * B4 — Deja un dossier QA listo para recorrer los pasos 4–6 del wizard del
 * setter (construcción → draft → self-check → enviar a revisión).
 *
 * Qué deja armado (idempotente, solo branch Neon dev):
 *   "QA-B4 Barbería El Faro" — lead asignado a setter-qa@develop.test, status
 *   RESPONDIO (gate abierto + indicador de urgencia visible), dossier en
 *   BRIEF con ficha, evaluación (score 3, fecha estampada) y brief mínimo.
 *
 * Checklist de Franco desde ahí (como setter): el wizard ofrece el Paso 4
 * marcado provisorio → arrancar construcción → pegar draftUrl (sin confirmar
 * "carga" no avanza) → self-check (hard-block en falla bloquea el envío;
 * soft-flags no) → enviar → aparece en /admin/leados (B5) → rechazar como
 * admin → reabrir como setter → reenviar (historial de rechazos conservado).
 *
 * Uso: npx tsx scripts/b4-qa-construccion.ts
 */
import { config as loadEnv } from 'dotenv'
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

const BARBERIA = 'QA-B4 Barbería El Faro'

async function main() {
  // Imports dinámicos para que dotenv corra antes de instanciar PrismaClient.
  const { prisma } = await import('../src/lib/prisma')
  const { transitionDossier } = await import('../src/lib/leados/dossier')
  const { EvaluacionSchema, FichaSchema, BriefSchema } = await import(
    '../src/lib/leados/contracts'
  )

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

  // 1. Lead: existente o nuevo, siempre asignado y con status RESPONDIO
  //    (abre el gate y enciende el indicador de urgencia del Paso 4).
  let lead = await prisma.osLead.findFirst({
    where: { businessName: BARBERIA },
    select: { id: true, status: true, assignedToId: true },
  })
  if (!lead) {
    lead = await prisma.osLead.create({
      data: {
        businessName: BARBERIA,
        contactName: 'Maxi',
        industry: 'Barbería',
        zone: 'Yerba Buena',
        instagramUrl: 'https://instagram.com/barberia.elfaro.qa',
        status: 'RESPONDIO',
        notes: 'Lead QA del bloque B4 — recorrer pasos 4–6 del wizard del setter.',
        assignedToId: setter.id,
      },
      select: { id: true, status: true, assignedToId: true },
    })
    console.log(`✨ ${BARBERIA}: creado y asignado (${lead.id})`)
  } else {
    const data: Prisma.OsLeadUpdateInput = {}
    if (lead.assignedToId !== setter.id) data.assignedTo = { connect: { id: setter.id } }
    if (lead.status === 'PROSPECTO') data.status = 'RESPONDIO'
    if (Object.keys(data).length > 0) {
      await prisma.osLead.update({ where: { id: lead.id }, data })
      console.log(`🔁 ${BARBERIA}: re-asignado / status → RESPONDIO`)
    } else {
      console.log(`✅ ${BARBERIA}: ya existe (${lead.id})`)
    }
  }

  // 2. Dossier hasta BRIEF, siempre vía transitionDossier (la única puerta).
  let dossier = await prisma.osLeadDossier.upsert({
    where: { leadId: lead.id },
    update: {},
    create: { leadId: lead.id },
  })

  if (dossier.stage === 'FICHA') {
    if (!dossier.fichaJson) {
      const ficha = FichaSchema.parse({
        identidad: { notas: 'Atiende Maxi, el dueño. Corta él y un ayudante.', igManejadoPor: 'DUENO' },
        presenciaDigital: 'IG activo (3 posts/semana), sin web, Maps con ficha incompleta.',
        resenas: '"El mejor fade de Yerba Buena" — "Siempre hay que esperar, atiende solo por orden de llegada".',
        contenidoReal: 'Logo simple negro/dorado, buenas fotos de cortes en el feed.',
      })
      await prisma.osLeadDossier.update({
        where: { leadId: lead.id },
        data: { fichaJson: ficha as Prisma.InputJsonValue },
      })
      console.log(`📝 ${BARBERIA}: ficha QA guardada`)
    }
    await transitionDossier(lead.id, {
      to: 'EVALUADA',
      evaluacion: EvaluacionSchema.parse({
        score: 3,
        veredicto: 'AVANZAR',
        razonamiento:
          'Negocio vivo con reseñas que piden turnos online — demo con CTA de WhatsApp tiene chance.',
      }),
    })
    console.log(`⚖️  ${BARBERIA}: evaluación registrada (score 3, AVANZAR)`)
    dossier = (await prisma.osLeadDossier.findUniqueOrThrow({ where: { leadId: lead.id } }))
  }

  if (dossier.stage === 'EVALUADA') {
    if (!dossier.briefJson) {
      const brief = BriefSchema.parse({
        titulo: 'Demo Barbería El Faro',
        concepto: 'One-page oscura negro/dorado, foco en pedir turno por WhatsApp.',
        secciones: ['Hero', 'Cortes y precios', 'Reseñas', 'Cómo pedir turno', 'Ubicación'],
        cta: 'Pedí tu turno por WhatsApp',
        notasMarca: 'Negro + dorado del logo. Fotos reales del feed de IG.',
      })
      await prisma.osLeadDossier.update({
        where: { leadId: lead.id },
        data: { briefJson: brief as Prisma.InputJsonValue },
      })
      console.log(`📐 ${BARBERIA}: brief mínimo QA guardado`)
    }
    await transitionDossier(lead.id, { to: 'BRIEF' })
    console.log(`✨ ${BARBERIA}: dossier en BRIEF — gate abierto (RESPONDIO)`)
  } else if (dossier.stage === 'BRIEF') {
    console.log(`✅ ${BARBERIA}: ya está en BRIEF — listo para el Paso 4`)
  } else {
    console.log(
      `ℹ️  ${BARBERIA}: stage actual ${dossier.stage} — ya avanzó por el flujo B4 (no se retrocede)`,
    )
  }

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
