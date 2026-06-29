/**
 * scripts/seed-matsu-week-results.ts — Lane inicio (QA visual S3b)
 *
 * Da números realistas al grid "Resultados de la semana" del Home (/dashboard)
 * para poder checkear S3b: hover, igualdad de altura (caption en 2 de 4 cards) y
 * los captions honestos en contexto.
 *
 * Qué alimenta cada card (ver lib/dashboard/week-results.ts):
 *   - Visitas: HARDCODEADO en 0 → siempre '—' + caption "Sin integración aún". No seedeable.
 *   - Leads: ContactSubmission.count GLOBAL (sin organizationId). NO se toca acá (es
 *     tabla agency-wide). Queda con su número global + caption "En calibración".
 *   - Respondidos: Message (fromAdmin, org-scoped). ← se siembra.
 *   - Completadas: Task DONE bajo un proyecto de la org. ← se siembra.
 *
 * Garantías:
 *   - INSERT-only sobre `message` y `task` (org-scoped). NUNCA migra ni toca schema.
 *   - NO toca tablas globales (ContactSubmission) ni datos reales: el clean filtra por
 *     el MARKER embebido. Solo AGREGA filas marcadas.
 *   - Idempotente: clean() borra lo marcado y reinserta (re-run = mismo set).
 *   - No crea org/proyecto/usuario: ABORTA si Matsu no existe; si Matsu no tiene
 *     proyecto, SALTEA las tareas (no crea infra).
 *   - No toca el drift de Franco (OsLead/setter/ActivityChannel): ningún FK llega ahí.
 *
 * Marcador (idempotencia + revert): MARKER embebido en `Message.content` y
 *   `Task.description`. El revert borra por ese marcador (tasks además scoping por
 *   project.organizationId de Matsu).
 *
 * ⚠️ CACHE: getWeekResults usa unstable_cache (revalidate 1800s = 30 min). Tras correr
 *   el seed, REINICIÁ el dev server :3000 para ver los números nuevos.
 *
 * Run (desde logic-core-v3/):
 *   npx tsx scripts/seed-matsu-week-results.ts          # seed
 *   npx tsx scripts/seed-matsu-week-results.ts --clean  # revert
 *
 * (Runner: tsx, NO ts-node. En Node 24 ts-node corre como ESM y no resuelve el
 *  import relativo sin extensión `../prisma/seed-guard`; tsx sí lo resuelve.)
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient, Prisma } from '@prisma/client'
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
const MARKER = '[seed:lane-inicio-week-results]'

// ── Datos de prueba ──────────────────────────────────────────────────────────
// Mensajes fromAdmin: 8 esta semana (daysAgo < 7) + 5 la anterior (7 <= daysAgo < 14).
// → "Respondidos" = 8 con delta real calcTrend(8,5) = +60%.
const MESSAGES: { content: string; daysAgo: number }[] = [
  // Esta semana (8)
  { content: 'Te dejamos el avance del rediseño del home, contanos qué te parece.', daysAgo: 0.4 },
  { content: 'Subimos la nueva sección de modelos 2025 al staging.', daysAgo: 1.2 },
  { content: 'Respondimos tu consulta sobre el formulario de contacto.', daysAgo: 2.1 },
  { content: 'Ajustamos los colores del header según tu feedback.', daysAgo: 3.0 },
  { content: 'Aki ya está respondiendo con el stock actualizado.', daysAgo: 3.8 },
  { content: 'Programamos la pausa de mantenimiento para el domingo.', daysAgo: 4.5 },
  { content: 'Te compartimos el reporte de tráfico de la semana.', daysAgo: 5.3 },
  { content: 'Cerramos el ticket de la integración de WhatsApp.', daysAgo: 6.2 },
  // Semana anterior (5)
  { content: 'Activamos la campaña de Hot Sale en tu sitio.', daysAgo: 7.4 },
  { content: 'Migramos las fotos de la concesionaria a la nueva galería.', daysAgo: 8.6 },
  { content: 'Revisamos los textos de la home con vos.', daysAgo: 10.1 },
  { content: 'Configuramos el dominio y los certificados.', daysAgo: 11.5 },
  { content: 'Te enviamos el primer borrador del catálogo.', daysAgo: 12.8 },
]

// Tareas DONE de esta semana (updatedAt = now al crear) → "Completadas" = 4.
const TASKS: { title: string; description: string }[] = [
  { title: 'Rediseño del home', description: 'Maquetar y publicar la nueva home de Matsu.' },
  { title: 'Sección de modelos 2025', description: 'Cargar el catálogo 2025 con stock y precios.' },
  { title: 'Integración de WhatsApp', description: 'Conectar los handoffs de Aki al WhatsApp.' },
  { title: 'Reporte SEO de abril', description: 'Generar y entregar el reporte SEO mensual.' },
]

// ── Limpieza (idempotencia + revert) ─────────────────────────────────────────
async function clean(organizationId: string): Promise<{ messages: number; tasks: number }> {
  const [msg, tsk] = await Promise.all([
    prisma.message.deleteMany({
      where: { organizationId, content: { contains: MARKER } },
    }),
    prisma.task.deleteMany({
      where: { description: { contains: MARKER }, project: { organizationId } },
    }),
  ])
  return { messages: msg.count, tasks: tsk.count }
}

// ── Inserción ────────────────────────────────────────────────────────────────
async function seedMessages(organizationId: string): Promise<number> {
  const now = Date.now()
  const data: Prisma.MessageCreateManyInput[] = MESSAGES.map((m) => ({
    // Marcador embebido al final del content (idempotencia + revert).
    content: `${m.content} ${MARKER}`,
    fromAdmin: true,
    read: true, // read=true: no queremos perturbar el AttentionStack ("mensajes nuevos").
    organizationId,
    createdAt: new Date(now - m.daysAgo * 86_400_000),
  }))
  const res = await prisma.message.createMany({ data })
  return res.count
}

async function seedTasks(projectId: string): Promise<number> {
  const data: Prisma.TaskCreateManyInput[] = TASKS.map((t) => ({
    title: t.title,
    description: `${t.description} ${MARKER}`,
    status: 'DONE',
    projectId,
  }))
  const res = await prisma.task.createMany({ data })
  return res.count
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  assertDevSeedTarget('seed-matsu-week-results.ts')
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

  const removed = await clean(org.id)
  console.log(
    `🧹 Limpieza previa: ${removed.messages} mensajes + ${removed.tasks} tareas marcadas borradas.`,
  )

  if (cleanOnly) {
    console.log('✓ --clean: revert completo. Matsu queda como estaba. No se insertó nada.')
    return
  }

  const insertedMsgs = await seedMessages(org.id)
  console.log(
    `✓ ${insertedMsgs} mensajes fromAdmin (8 esta semana, 5 la anterior) → "Respondidos" ≈ 8 (↑60%).`,
  )

  const project = await prisma.project.findFirst({
    where: { organizationId: org.id },
    orderBy: { id: 'asc' },
    select: { id: true, name: true },
  })
  if (project) {
    const insertedTasks = await seedTasks(project.id)
    console.log(
      `✓ ${insertedTasks} tareas DONE en proyecto "${project.name}" (${project.id}) → "Completadas" = 4 (↑100%).`,
    )
  } else {
    console.warn(
      '⚠️  Matsu no tiene proyecto → se saltean las tareas (card "Completadas" queda en 0). ' +
        'El seed NO crea proyectos.',
    )
  }

  console.log(
    '\n⚠️  RECORDÁ: getWeekResults cachea 30 min (unstable_cache). ' +
      'Reiniciá el dev server :3000 para ver los números nuevos.',
  )
  console.log('✓ Seed de week-results para Matsu completo.\n')
}

main()
  .catch((e) => {
    console.error('❌ seed-matsu-week-results falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
