/**
 * B3 — Alta/asignación de leads QA para el setter (LeadOS).
 *
 * La UI de asignación de leads a setters llega en B5; hasta entonces este
 * script es el camino reproducible (en lugar de tocar Prisma Studio a mano).
 * Corre SOLO contra la branch Neon dev (host check abajo). Idempotente:
 *   1. Verifica que el setter QA exista (lo crea el seed o b1-verify).
 *   2. Upsertea dos leads QA-B3 asignados al setter:
 *        - "QA-B3 Café La Esquina"      → para el flujo feliz (ficha → eval → brief)
 *        - "QA-B3 Ferretería El Tornillo" → para el flujo de descarte (score 1–2)
 *   3. No toca leads existentes ni el dossier (eso lo hace el panel).
 *
 * Uso: npx tsx scripts/b3-qa-assign-leads.ts
 */
import { config as loadEnv } from 'dotenv'

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

const QA_LEADS = [
  {
    businessName: 'QA-B3 Café La Esquina',
    contactName: 'Marcela',
    industry: 'Cafetería',
    zone: 'Yerba Buena',
    instagramUrl: 'https://instagram.com/cafelaesquina.qa',
    googleMapsUrl: 'https://maps.google.com/?q=cafe+la+esquina+qa',
    notes: 'Lead QA del bloque B3 — flujo feliz (ficha → evaluación → brief).',
  },
  {
    businessName: 'QA-B3 Ferretería El Tornillo',
    contactName: 'Rubén',
    industry: 'Ferretería',
    zone: 'San Miguel de Tucumán',
    instagramUrl: 'https://instagram.com/eltornillo.qa',
    googleMapsUrl: null,
    notes: 'Lead QA del bloque B3 — flujo de descarte (score 1–2).',
  },
  {
    businessName: 'QA-B3 Panadería Doña Rosa',
    contactName: 'Rosa',
    industry: 'Panadería',
    zone: 'Tafí Viejo',
    instagramUrl: 'https://instagram.com/dona.rosa.qa',
    googleMapsUrl: null,
    notes: 'Lead QA del bloque B3 — score 3 con gate de brief cerrado (PROSPECTO sin respuesta).',
  },
] as const

async function main() {
  // Import dinámico para que dotenv corra antes de instanciar PrismaClient.
  const { prisma } = await import('../src/lib/prisma')

  const setter = await prisma.user.findUnique({
    where: { email: 'setter-qa@develop.test' },
    select: { id: true, role: true },
  })

  if (!setter || setter.role !== 'SETTER') {
    console.error(
      "ABORT: setter-qa@develop.test no existe (o no es SETTER). Corré 'npx tsx prisma/seed.ts' " +
        "o 'npx tsx scripts/b1-verify-setter-ownership.ts' antes.",
    )
    process.exit(1)
  }

  for (const lead of QA_LEADS) {
    const existente = await prisma.osLead.findFirst({
      where: { businessName: lead.businessName },
      select: { id: true, assignedToId: true },
    })

    if (existente) {
      if (existente.assignedToId !== setter.id) {
        await prisma.osLead.update({
          where: { id: existente.id },
          data: { assignedToId: setter.id },
        })
        console.log(`🔁 ${lead.businessName} — re-asignado al setter QA (${existente.id})`)
      } else {
        console.log(`✅ ${lead.businessName} — ya existe y está asignado (${existente.id})`)
      }
      continue
    }

    const creado = await prisma.osLead.create({
      data: { ...lead, assignedToId: setter.id },
      select: { id: true },
    })
    console.log(`✨ ${lead.businessName} — creado y asignado (${creado.id})`)
  }

  const total = await prisma.osLead.count({ where: { assignedToId: setter.id } })
  console.log(`\nSetter QA tiene ${total} lead(s) asignado(s).`)
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
