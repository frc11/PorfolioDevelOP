/**
 * scripts/seed-matsu-notifications.ts — Lane client-notif-fix
 *
 * Puebla notificaciones de prueba para Matsu, para poder ver cómo se comporta
 * el panel de la campanita y el modal de historial completo con muchas filas
 * (~24: mix de tipos/estados, timestamps escalonados, algunas con link).
 *
 * Garantías:
 *   - INSERT-only sobre la tabla `notification`. NUNCA migra ni borra schema.
 *   - Idempotente: clean() borra lo marcado y reinserta (re-run = mismo set).
 *   - No crea la org/user: ABORTA si Matsu no existe (corré scripts/seed-matsu.ts antes).
 *   - No toca el drift de Franco (OsLead/setter/ActivityChannel): ningún FK llega ahí.
 *
 * Marcador (para idempotencia + revert):
 *   - `Notification` no tiene campo metadata → el marcador (MARKER) va embebido
 *     al final del `message`. El revert borra por organizationId + message contains.
 *
 * Run (desde logic-core-v3/):
 *   npx ts-node --transpile-only scripts/seed-matsu-notifications.ts          # seed
 *   npx ts-node --transpile-only scripts/seed-matsu-notifications.ts --clean  # revert
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient, Prisma } from '@prisma/client'
import type { NotificationType } from '@prisma/client'
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
const USER_EMAIL = 'matsu-admin@dev.local'
const MARKER = '[seed:matsu-notif]'

// ── Datos de prueba ──────────────────────────────────────────────────────────
interface SeedNotification {
  type: NotificationType
  title: string
  message: string
  read: boolean
  actionUrl?: string
  /** Antigüedad en minutos relativa al momento del run (para escalonar fechas). */
  minsAgo: number
}

// Ordenadas de más reciente a más vieja. Las no leídas (read:false) son 11 →
// el badge muestra "9+" y el header del panel "11 nuevas". Las ACTION_REQUIRED
// quedan no leídas aunque sean viejas (acción pendiente real).
const NOTIFICATIONS: SeedNotification[] = [
  {
    type: 'ACTION_REQUIRED',
    title: 'Aprobación requerida: campaña de email',
    message: 'La campaña "Hot Sale Toyota" está lista para tu aprobación antes del envío.',
    read: false,
    actionUrl: '/dashboard/modules/email-marketing/campaigns',
    minsAgo: 90,
  },
  {
    type: 'SUCCESS',
    title: 'Nuevo lead capturado por Aki',
    message: 'Aki capturó un lead caliente: Juan Pérez (Corolla XEI). Score 86.',
    read: false,
    actionUrl: '/dashboard/chatbot/leads',
    minsAgo: 180,
  },
  {
    type: 'INFO',
    title: 'Nuevo mensaje de tu equipo develOP',
    message: 'Tenés un mensaje nuevo sobre el rediseño del home de Matsu.',
    read: false,
    actionUrl: '/dashboard/messages',
    minsAgo: 300,
  },
  {
    type: 'WARNING',
    title: 'Tu quota mensual del chatbot está al 80%',
    message: 'Usaste 800 de 1000 conversaciones este mes. Considerá ampliar el plan.',
    read: false,
    actionUrl: '/dashboard/chatbot',
    minsAgo: 540,
  },
  {
    type: 'SUCCESS',
    title: 'Ticket #1043 respondido',
    message: 'Soporte respondió tu consulta sobre el formulario de contacto.',
    read: false,
    actionUrl: '/dashboard/soporte',
    minsAgo: 1200,
  },
  {
    type: 'ACTION_REQUIRED',
    title: 'Factura de junio disponible',
    message: 'Tu factura #2025-06 ya está disponible y vence en 5 días.',
    read: false,
    actionUrl: '/dashboard/cuenta/facturacion',
    minsAgo: 1560,
  },
  {
    type: 'INFO',
    title: 'Reporte de resultados de mayo listo',
    message: 'Ya podés ver el tráfico y la reputación del último mes.',
    read: false,
    actionUrl: '/dashboard/resultados',
    minsAgo: 1920,
  },
  {
    type: 'SUCCESS',
    title: 'Tu sitio web pasó a producción',
    message: 'El rediseño del home de Matsu ya está online.',
    read: false,
    actionUrl: '/dashboard/project',
    minsAgo: 2880,
  },
  {
    type: 'INFO',
    title: 'Aki actualizó su base de conocimiento',
    message: 'Se cargaron los nuevos modelos 2025 al chatbot.',
    read: true,
    minsAgo: 3240,
  },
  {
    type: 'WARNING',
    title: '3 leads sin contactar',
    message: 'Tenés 3 leads en estado "Nuevo" hace más de 48 horas.',
    read: true,
    actionUrl: '/dashboard/chatbot/leads',
    minsAgo: 4320,
  },
  {
    type: 'SUCCESS',
    title: 'Campaña "Service 10.000km" enviada',
    message: 'Se envió a 1.240 contactos. Tasa de apertura: 38%.',
    read: true,
    actionUrl: '/dashboard/modules/email-marketing/campaigns',
    minsAgo: 5760,
  },
  {
    type: 'INFO',
    title: 'Nueva reseña de 5 estrellas',
    message: 'Un cliente dejó una reseña destacando la atención del showroom.',
    read: true,
    actionUrl: '/dashboard/resultados/reputacion',
    minsAgo: 7200,
  },
  {
    type: 'ACTION_REQUIRED',
    title: 'Confirmá los datos de tu concesionaria',
    message: 'Revisá dirección y horarios antes de publicarlos en el sitio.',
    read: false,
    actionUrl: '/dashboard/cuenta/perfil',
    minsAgo: 8640,
  },
  {
    type: 'SUCCESS',
    title: 'Integración de WhatsApp activada',
    message: 'Los handoffs de Aki ahora derivan directo a tu WhatsApp.',
    read: true,
    minsAgo: 10080,
  },
  {
    type: 'INFO',
    title: 'Resumen semanal de Aki',
    message: 'Esta semana: 62 conversaciones, 9 leads y 3 derivaciones a WhatsApp.',
    read: true,
    actionUrl: '/dashboard/chatbot',
    minsAgo: 11520,
  },
  {
    type: 'WARNING',
    title: 'Pago pendiente del mes anterior',
    message: 'Registramos un pago pendiente. Regularizalo para evitar cortes de servicio.',
    read: true,
    actionUrl: '/dashboard/cuenta/facturacion',
    minsAgo: 14400,
  },
  {
    type: 'SUCCESS',
    title: 'Ticket #1021 resuelto',
    message: 'Tu consulta sobre la configuración del dominio fue resuelta.',
    read: true,
    actionUrl: '/dashboard/soporte',
    minsAgo: 17280,
  },
  {
    type: 'INFO',
    title: 'Bienvenido al módulo Email Marketing',
    message: 'Ya podés crear y enviar campañas a tus contactos.',
    read: true,
    actionUrl: '/dashboard/modules/email-marketing',
    minsAgo: 21600,
  },
  {
    type: 'ACTION_REQUIRED',
    title: 'Renová tu plan anual',
    message: 'Tu plan vence el mes próximo. Renová para mantener todos los módulos activos.',
    read: false,
    actionUrl: '/dashboard/plan',
    minsAgo: 25920,
  },
  {
    type: 'WARNING',
    title: 'Mantenimiento programado',
    message: 'El portal tendrá una breve pausa el domingo a las 3:00 AM.',
    read: true,
    minsAgo: 31680,
  },
  {
    type: 'ACTION_REQUIRED',
    title: 'Documentación pendiente',
    message: 'Falta tu CUIT para emitir la próxima factura. Cargalo en tu perfil.',
    read: false,
    actionUrl: '/dashboard/cuenta/perfil',
    minsAgo: 40320,
  },
  {
    type: 'SUCCESS',
    title: 'Reporte SEO de abril',
    message: 'Subiste 12 posiciones en búsquedas de "concesionaria Tucumán".',
    read: true,
    actionUrl: '/dashboard/resultados/seo',
    minsAgo: 47520,
  },
  {
    type: 'INFO',
    title: 'Tu chatbot Aki está activo',
    message: 'Aki ya está atendiendo en tu sitio las 24 horas.',
    read: true,
    actionUrl: '/dashboard/chatbot',
    minsAgo: 54720,
  },
  {
    type: 'INFO',
    title: 'Te damos la bienvenida a develOP',
    message: 'Tu cuenta fue creada. Empecemos a potenciar Matsu 🚀',
    read: true,
    minsAgo: 60480,
  },
]

// ── Limpieza (idempotencia + revert) ─────────────────────────────────────────
async function clean(organizationId: string): Promise<number> {
  const res = await prisma.notification.deleteMany({
    where: { organizationId, message: { contains: MARKER } },
  })
  return res.count
}

// ── Inserción ────────────────────────────────────────────────────────────────
async function seed(organizationId: string, userId: string): Promise<number> {
  const now = Date.now()
  const data: Prisma.NotificationCreateManyInput[] = NOTIFICATIONS.map((n) => ({
    type: n.type,
    title: n.title,
    // Marcador embebido al final del message (único campo de texto disponible).
    message: `${n.message} ${MARKER}`,
    read: n.read,
    actionUrl: n.actionUrl ?? null,
    userId,
    organizationId,
    createdAt: new Date(now - n.minsAgo * 60_000),
  }))

  const res = await prisma.notification.createMany({ data })
  return res.count
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  assertDevSeedTarget('seed-matsu-notifications.ts')
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

  const user = await prisma.user.findUnique({
    where: { email: USER_EMAIL },
    select: { id: true, email: true },
  })
  if (!user) {
    console.error(
      `ABORT: no existe User email="${USER_EMAIL}". ` +
        'Este seed NO crea el usuario — corré scripts/seed-matsu.ts primero.',
    )
    process.exit(1)
  }
  console.log(`✓ Matsu: org "${org.companyName}" (${org.id}) · user ${user.email} (${user.id})`)

  const removed = await clean(org.id)
  console.log(`🧹 Limpieza previa: ${removed} notificaciones marcadas borradas.`)

  if (cleanOnly) {
    console.log('✓ --clean: revert completo. No se insertó nada.')
    return
  }

  const inserted = await seed(org.id, user.id)
  const unread = NOTIFICATIONS.filter((n) => !n.read).length
  console.log(
    `✓ Insertadas ${inserted} notificaciones para Matsu (${unread} no leídas, ${inserted - unread} leídas).`,
  )
  console.log('\n✓ Seed de notificaciones para Matsu completo.\n')
}

main()
  .catch((e) => {
    console.error('❌ seed-matsu-notifications falló:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
