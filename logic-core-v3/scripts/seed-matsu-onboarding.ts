/**
 * scripts/seed-matsu-onboarding.ts — Lane inicio (QA visual S1)
 *
 * Deja a Matsu con onboarding INCOMPLETO para que el OnboardingStatusCard del
 * Home (/dashboard) renderice. La card se muestra si la org tiene >=1
 * OnboardingTask y al menos una NO está en COMPLETED/SKIPPED
 * (ver OnboardingStatusCard.tsx). Insertamos 3 tareas PENDING/IN_PROGRESS.
 *
 * Garantías:
 *   - INSERT-only sobre `onboarding_task`. NUNCA migra ni toca schema.
 *   - NO toca tareas reales de Matsu: el clean filtra por el MARKER en
 *     `internalNotes` (las reales no lo tienen). Solo AGREGA filas marcadas;
 *     las COMPLETED/SKIPPED existentes quedan intactas.
 *   - Idempotente: clean() borra lo marcado y reinserta (re-run = mismo set de 3).
 *   - No crea la org: ABORTA si Matsu no existe (corré scripts/seed-matsu.ts antes).
 *   - Otras orgs: todo filtrado por organizationId de Matsu.
 *   - No toca el drift de Franco: OnboardingTask no tiene FK a OsLead/setter/
 *     ActivityChannel; ningún FK llega ahí.
 *
 * Marcador (idempotencia + revert): `internalNotes = MARKER` (admin-only, NO se
 *   muestra en la card). El revert borra por organizationId + internalNotes contains MARKER.
 *
 * sortOrder: hay `@@unique([organizationId, sortOrder])`. Para no colisionar con
 *   tareas reales, limpiamos primero las marcadas y luego insertamos en
 *   base = max(sortOrder real) + 1 .. +3 (o 1..3 si Matsu no tiene tareas).
 *
 * Run (desde logic-core-v3/):
 *   npx tsx scripts/seed-matsu-onboarding.ts          # seed
 *   npx tsx scripts/seed-matsu-onboarding.ts --clean  # revert
 *
 * (Runner: tsx, NO ts-node. En Node 24 ts-node corre como ESM y no resuelve el
 *  import relativo sin extensión `../prisma/seed-guard`; tsx sí lo resuelve.)
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient, Prisma } from '@prisma/client'
import type { OnboardingTaskCategory, OnboardingTaskStatus } from '@prisma/client'
import { assertDevSeedTarget } from '../prisma/seed-guard'

// No hay .env en logic-core-v3 (solo .env.local). Cargamos explícito (relativo al
// cwd, que debe ser logic-core-v3/); .env queda de fallback.
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL no está definida. Corré desde logic-core-v3/ con .env.local.',
  )
}

const prisma = new PrismaClient()

const ORG_SLUG = 'matsu'
const MARKER = '[seed:lane-inicio-onboarding]'

// ── Datos de prueba ──────────────────────────────────────────────────────────
interface SeedTask {
  category: OnboardingTaskCategory
  title: string
  description: string
  status: OnboardingTaskStatus
}

// 3 tareas; la #2 en IN_PROGRESS para ver también el chip "En curso" de la card.
const TASKS: SeedTask[] = [
  {
    category: 'DATA_CONNECTIONS',
    title: 'Conectar Google Analytics',
    description:
      'Vinculá tu cuenta de Google Analytics para empezar a medir el tráfico de tu sitio.',
    status: 'PENDING',
  },
  {
    category: 'CONTENT',
    title: 'Cargar catálogo de modelos 2025',
    description:
      'Subí el catálogo de modelos 2025 para que Aki responda con stock y precios al día.',
    status: 'IN_PROGRESS',
  },
  {
    category: 'TRAINING',
    title: 'Sesión de entrenamiento de Aki',
    description:
      'Coordiná la sesión donde entrenamos a Aki con las preguntas frecuentes de tu concesionaria.',
    status: 'PENDING',
  },
]

// ── Limpieza (idempotencia + revert) ─────────────────────────────────────────
async function clean(organizationId: string): Promise<number> {
  const res = await prisma.onboardingTask.deleteMany({
    where: { organizationId, internalNotes: { contains: MARKER } },
  })
  return res.count
}

// ── Inserción ────────────────────────────────────────────────────────────────
async function seed(organizationId: string): Promise<number> {
  // base = max(sortOrder) entre las tareas restantes (reales; las marcadas ya se
  // limpiaron antes de llamar acá) + 1. Garantiza no colisionar con el @@unique.
  const maxRow = await prisma.onboardingTask.findFirst({
    where: { organizationId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })
  const base = (maxRow?.sortOrder ?? 0) + 1

  const data: Prisma.OnboardingTaskCreateManyInput[] = TASKS.map((t, i) => ({
    organizationId,
    category: t.category,
    title: t.title,
    description: t.description,
    status: t.status,
    sortOrder: base + i,
    internalNotes: MARKER,
  }))

  const res = await prisma.onboardingTask.createMany({ data })
  return res.count
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  assertDevSeedTarget('seed-matsu-onboarding.ts')
  const cleanOnly = process.argv.includes('--clean')

  const org = await prisma.organization.findUnique({
    where: { slug: ORG_SLUG },
    select: { id: true, companyName: true },
  })
  if (!org) {
    console.error(
      `ABORT: no existe Organization slug="${ORG_SLUG}". ` +
        'Este seed NO crea la org — corré scripts/seed-matsu.ts primero.',
    )
    process.exit(1)
  }
  console.log(`✓ Matsu: org "${org.companyName}" (${org.id})`)

  // Reporte del estado REAL previo (excluye filas marcadas de runs anteriores).
  const [realTotal, realCompleted, realSkipped, realPending, realInProgress] =
    await Promise.all([
      prisma.onboardingTask.count({
        where: { organizationId: org.id, NOT: { internalNotes: { contains: MARKER } } },
      }),
      prisma.onboardingTask.count({
        where: {
          organizationId: org.id,
          status: 'COMPLETED',
          NOT: { internalNotes: { contains: MARKER } },
        },
      }),
      prisma.onboardingTask.count({
        where: {
          organizationId: org.id,
          status: 'SKIPPED',
          NOT: { internalNotes: { contains: MARKER } },
        },
      }),
      prisma.onboardingTask.count({
        where: {
          organizationId: org.id,
          status: 'PENDING',
          NOT: { internalNotes: { contains: MARKER } },
        },
      }),
      prisma.onboardingTask.count({
        where: {
          organizationId: org.id,
          status: 'IN_PROGRESS',
          NOT: { internalNotes: { contains: MARKER } },
        },
      }),
    ])
  console.log(
    `ℹ️  Tareas reales de Matsu (sin marcar): ${realTotal} ` +
      `(${realCompleted} completed · ${realSkipped} skipped · ${realPending} pending · ${realInProgress} in-progress).`,
  )
  if (realTotal > 0 && realPending + realInProgress > 0) {
    console.log(
      'ℹ️  Nota: Matsu YA tiene tareas reales pendientes → la card ya renderizaría. ' +
        'El seed agrega las marcadas igual (visibles + removibles con --clean).',
    )
  }

  const removed = await clean(org.id)
  console.log(`🧹 Limpieza previa: ${removed} tareas marcadas borradas.`)

  if (cleanOnly) {
    console.log('✓ --clean: revert completo. Matsu queda como estaba. No se insertó nada.')
    return
  }

  const inserted = await seed(org.id)

  // Preview del estado que va a mostrar la card (misma lógica que el componente:
  // completedCount / total, sobre TODAS las tareas incluidas las marcadas).
  const [cardTotal, cardCompleted] = await Promise.all([
    prisma.onboardingTask.count({ where: { organizationId: org.id } }),
    prisma.onboardingTask.count({ where: { organizationId: org.id, status: 'COMPLETED' } }),
  ])
  const pct = cardTotal > 0 ? Math.round((cardCompleted / cardTotal) * 100) : 0

  console.log(`✓ Insertadas ${inserted} tareas marcadas (2 PENDING, 1 IN_PROGRESS) para Matsu.`)
  console.log(
    `✓ La card ahora renderiza: "${cardCompleted} de ${cardTotal} listas" (${pct}%), ` +
      'arriba del HealthScore en /dashboard.',
  )
  console.log('\n✓ Seed de onboarding para Matsu completo.\n')
}

main()
  .catch((e) => {
    console.error('❌ seed-matsu-onboarding falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
