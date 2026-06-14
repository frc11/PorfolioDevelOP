/**
 * B1 — Verificación del helper de aislamiento `getOwnedLead` (LeadOS).
 *
 * Corre SOLO contra la branch Neon dev (host check abajo). Qué hace:
 *   1. Upsertea el setter QA (mismos datos que prisma/seed.ts — idempotente,
 *      restaura password provisoria + passwordResetRequired).
 *   2. Lead existente NO asignado al setter → getOwnedLead debe dar null.
 *   3. Lead temporal asignado al setter → getOwnedLead debe devolverlo.
 *   4. Mismo lead consultado con OTRO userId → null (anti cross-setter).
 *   5. leadId inexistente → null.
 *   6. Borra el lead temporal (try/finally — no deja residuo).
 *
 * Uso: npx tsx scripts/b1-verify-setter-ownership.ts
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

async function main() {
  // Imports dinámicos para que dotenv corra antes de instanciar PrismaClient.
  const [{ prisma }, { getOwnedLead }, bcrypt] = await Promise.all([
    import('../src/lib/prisma'),
    import('../src/lib/leados/ownership'),
    import('bcryptjs').then((m) => m.default),
  ])

  const results: Array<{ name: string; pass: boolean; detail?: string }> = []
  const check = (name: string, pass: boolean, detail?: string) => {
    results.push({ name, pass, detail })
    console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
  }

  const setterPassword = await bcrypt.hash('Setter1234!', 12)
  const setter = await prisma.user.upsert({
    where: { email: 'setter-qa@develop.test' },
    update: {
      name: 'QA Setter',
      password: setterPassword,
      role: 'SETTER',
      emailVerified: new Date(),
      passwordResetRequired: true,
    },
    create: {
      name: 'QA Setter',
      email: 'setter-qa@develop.test',
      password: setterPassword,
      role: 'SETTER',
      emailVerified: new Date(),
      passwordResetRequired: true,
    },
  })
  console.log(`Setter QA listo: ${setter.email} (${setter.id})`)

  let tempLeadId: string | null = null
  try {
    const foreignLead = await prisma.osLead.findFirst({
      where: { OR: [{ assignedToId: null }, { assignedToId: { not: setter.id } }] },
      select: { id: true, assignedToId: true },
    })
    if (foreignLead) {
      const res = await getOwnedLead(foreignLead.id, setter.id)
      check(
        'Lead existente NO asignado al setter → null',
        res === null,
        `leadId=${foreignLead.id}`,
      )
    } else {
      check('Lead existente NO asignado al setter → null', false, 'SKIP: no hay leads en la DB')
    }

    const tempLead = await prisma.osLead.create({
      data: {
        businessName: 'B1-QA ownership probe (temporal, se borra solo)',
        source: 'b1-qa-script',
        assignedToId: setter.id,
      },
    })
    tempLeadId = tempLead.id

    const owned = await getOwnedLead(tempLead.id, setter.id)
    check('Lead asignado al setter → lo retorna', owned?.id === tempLead.id)

    const admin = await prisma.user.findFirst({
      where: { id: { not: setter.id } },
      select: { id: true },
    })
    if (admin) {
      const crossed = await getOwnedLead(tempLead.id, admin.id)
      check('Mismo lead con OTRO userId → null (anti cross-setter)', crossed === null)
    }

    const ghost = await getOwnedLead('lead-id-inexistente-b1qa', setter.id)
    check('leadId inexistente → null', ghost === null)
  } finally {
    if (tempLeadId) {
      await prisma.osLead.delete({ where: { id: tempLeadId } })
      console.log('Lead temporal borrado.')
    }
    await prisma.$disconnect()
  }

  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} checks OK`)
  if (failed.length > 0) process.exit(1)
}

main().catch((error) => {
  console.error('Error en verificación B1:', error)
  process.exit(1)
})
