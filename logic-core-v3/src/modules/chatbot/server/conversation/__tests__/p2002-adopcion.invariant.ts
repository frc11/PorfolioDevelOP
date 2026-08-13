/**
 * CARRERAS commit 1 — P2002 perdedor-adopta. Corre:
 *
 *   npm run test:p2002
 *   (o: npx tsx src/modules/chatbot/server/conversation/__tests__/p2002-adopcion.invariant.ts)
 *
 * Formaliza el harness de ráfaga del bloque privacidad como invariante de
 * carrera: N llamadas CONCURRENTES del mismo (bot, sessionId) contra la Neon
 * DEV real — la constraint la enforcea Postgres, así que esto no se puede
 * pinnear con mocks. Secciones:
 *
 *   1. isUniqueConstraintError — clasificación pura (P2002 sí; P2025/Error/
 *      undefined no).
 *   2. getOrCreateConversation — ráfaga N=4 del mismo sessionId: nadie ve el
 *      P2002 crudo, todos adoptan la MISMA fila y hay EXACTAMENTE UN
 *      isNew:true. Ese pinneo es la aserción de cupo: la reserva atómica
 *      (handleChatRequest §5.b) se dispara solo con isNew — N callers, una
 *      sola reserva. Sin él, el perdedor cobraría dos veces.
 *   3. captureLeadExecute — dos ejecuciones concurrentes para la misma
 *      conversación: ambas success:true, mismo leadId, exactamente un
 *      alreadyCaptured:false (el ganador) y UNA fila en la tabla. El perdedor
 *      adopta con el contrato alreadyCaptured ya existente del pre-check.
 *
 * FAIL-FIRST (baseline de telemetría del bloque): contra el código sin el fix,
 * la sección 2 muestra el P2002 crudo que hoy termina en el catch externo de
 * handleChatRequest (chat.unhandled_failed + evento chat.unhandled_error +
 * Sentry + 500 al widget), y la sección 3 el success:false del perdedor ("No
 * pude guardar tus datos...") con el lead YA guardado por el ganador.
 *
 * Contra la Neon DEV real (guard de host EXACTO, mismo criterio que
 * evals/shared.ts). Filas propias: bot QA `qaseed-evals-base` + sessionId con
 * prefijo `evals-carrera-`; se borran en finally. Red de seguridad: el prefijo
 * arranca con `evals-`, así que `npm run evals:purge` barre cualquier fila que
 * un crash deje viva.
 *
 * dotenv.config() corre ANTES que cualquier módulo que toque Prisma, vía
 * import() dinámico (mismo resguardo anti-hoisting que
 * get-client-monthly-report-data.invariant.ts).
 */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import dotenv from 'dotenv'
import { guardDevHost } from '../../../evals/shared'

dotenv.config({ path: '.env.local' })

// Neutralizar notificaciones REALES antes de importar los módulos bajo test:
// el ganador de la sección 3 dispara notifyClient (Telegram/Brevo) en
// detached — sin estas vars, ambos canales hacen skip logueado. El sync a CRM
// no necesita gate: la org QA no tiene CrmIntegration y sale por skip.
delete process.env.BREVO_API_KEY
delete process.env.TELEGRAM_BOT_TOKEN
delete process.env.TELEGRAM_CHAT_ID

/** Prefijo de sessionId de TODA fila creada acá (marca de cleanup). */
const SESSION_TAG = 'evals-carrera-'
const QA_BOT_SLUG = 'qaseed-evals-base'
/** Ráfaga de la sección 2. */
const BURST = 4

const failures: string[] = []

async function section(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run()
    console.log(`  ✓ ${name}`)
  } catch (error) {
    failures.push(name)
    console.error(`  ✗ ${name}`)
    console.error(error)
  }
}

async function main(): Promise<void> {
  guardDevHost()

  const { prisma } = await import('@/lib/prisma')
  const { Prisma } = await import('@prisma/client')
  const { isUniqueConstraintError } = await import('@/lib/isolation')
  const { getOrCreateConversation } = await import('../resolver')
  const { captureLeadExecute } = await import('../../tools/captureLead')
  type CaptureInput = Parameters<typeof captureLeadExecute>[0]

  const bot = await prisma.botConfig.findUnique({
    where: { slug: QA_BOT_SLUG },
    select: { id: true, organizationId: true },
  })
  if (!bot) {
    console.log(
      `⚠ invariante omitido: no existe el bot QA "${QA_BOT_SLUG}" en la BD dev. Correr: npm run evals:seed`,
    )
    await prisma.$disconnect()
    return
  }

  // ── 1. Clasificación pura del guard ─────────────────────────────────────
  await section('isUniqueConstraintError clasifica P2002 y solo P2002', async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`sessionId`)',
      { code: 'P2002', clientVersion: 'invariant', meta: { target: ['sessionId'] } },
    )
    assert.equal(isUniqueConstraintError(p2002), true, 'P2002 real → true')
    const p2025 = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'invariant',
    })
    assert.equal(isUniqueConstraintError(p2025), false, 'P2025 → false')
    assert.equal(isUniqueConstraintError(new Error('P2002')), false, 'Error plano → false')
    assert.equal(isUniqueConstraintError(undefined), false, 'undefined → false')
  })

  try {
    // ── 2. Ráfaga sobre getOrCreateConversation ───────────────────────────
    await section(
      `ráfaga N=${BURST} del mismo sessionId: nadie ve P2002, una fila, UN isNew:true`,
      async () => {
        // Calentar el pool ANTES de la ráfaga. Con el cliente frío, Prisma
        // arranca con una sola conexión y SERIALIZA la ráfaga: el findFirst de
        // los perdedores corre después del commit del ganador, todos salen por
        // la rama `existing` y la carrera del create (lo que este invariante
        // pinnea) nunca ocurre — verificado empíricamente en la corrida
        // fail-first. Con BURST conexiones abiertas, los findFirst corren de
        // verdad en paralelo (todos ven null) y los perdedores chocan el
        // unique en el create, como en serverless (una lambda = un request,
        // la carrera es entre lambdas).
        await Promise.all(
          Array.from({ length: BURST }, () =>
            prisma.conversation.count({ where: { botConfigId: bot.id } }),
          ),
        )

        const sessionId = `${SESSION_TAG}${randomUUID()}`
        const results = await Promise.allSettled(
          Array.from({ length: BURST }, () =>
            getOrCreateConversation({
              organizationId: bot.organizationId,
              botConfigId: bot.id,
              sessionId,
            }),
          ),
        )

        const rejected = results.filter(
          (r): r is PromiseRejectedResult => r.status === 'rejected',
        )
        assert.equal(
          rejected.length,
          0,
          `ningún caller debe ver el P2002 crudo — rechazados: ${rejected.length} ` +
            `(primero: ${rejected[0] ? String(rejected[0].reason) : 'n/a'})`,
        )

        const fulfilled = results.map(
          (r) => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof getOrCreateConversation>>>).value,
        )
        const ids = new Set(fulfilled.map((f) => f.conversation.id))
        assert.equal(ids.size, 1, 'todos los callers adoptan la MISMA fila')

        const winners = fulfilled.filter((f) => f.isNew)
        assert.equal(
          winners.length,
          1,
          `exactamente UN isNew:true (hubo ${winners.length}) — el pinneo de cupo: ` +
            'la reserva atómica se dispara solo con isNew, así N callers = 1 sola reserva',
        )

        const rows = await prisma.conversation.count({
          where: { botConfigId: bot.id, sessionId },
        })
        assert.equal(rows, 1, 'una sola fila de Conversation en la BD')
      },
    )

    // ── 3. Carrera sobre captureLeadExecute ───────────────────────────────
    await section(
      'dos capture_lead concurrentes: ambos success, mismo leadId, un solo create',
      async () => {
        const sessionId = `${SESSION_TAG}${randomUUID()}`
        const { conversation } = await getOrCreateConversation({
          organizationId: bot.organizationId,
          botConfigId: bot.id,
          sessionId,
        })

        // El turno USER con el email a capturar: la validación de pertenencia
        // (SEC-LLM-03) exige que el canal aparezca en lo que el visitante
        // escribió. Email y no teléfono a propósito: su validador de formato
        // (Zod .email) no depende de la heurística de prefijos AR.
        const email = `carrera-p2002-${randomUUID().slice(0, 8)}@test.dev`
        await prisma.chatMessage.create({
          data: {
            conversationId: conversation.id,
            role: 'USER',
            content: `Soy Prueba Carrera, mi mail es ${email}`,
          },
        })

        const ctx = {
          conversationId: conversation.id,
          botConfigId: bot.id,
          organizationId: bot.organizationId,
          botSlug: QA_BOT_SLUG,
          verticalPack: 'base',
        }
        const input: CaptureInput = {
          name: 'Prueba Carrera',
          email,
          intent: 'quote_request',
          contextSummary: 'Invariante de carrera P2002 del bloque carreras (fila de test).',
          category: 'sales',
          requestedAppointment: false,
          mentionedFinancing: false,
          mentionedTradeIn: false,
          askedSpecificModel: false,
        }

        const [a, b] = await Promise.all([
          captureLeadExecute(input, ctx),
          captureLeadExecute(input, ctx),
        ])

        assert.equal(a.success, true, `caller A success (error: ${a.error ?? 'n/a'})`)
        assert.equal(b.success, true, `caller B success (error: ${b.error ?? 'n/a'})`)
        assert.ok(a.data && b.data, 'ambos con data')
        assert.equal(a.data.leadId, b.data.leadId, 'mismo leadId para los dos')

        const creators = [a.data, b.data].filter((d) => !d.alreadyCaptured)
        assert.equal(
          creators.length,
          1,
          `exactamente UN alreadyCaptured:false (hubo ${creators.length}) — el perdedor adopta`,
        )

        const leadRows = await prisma.chatbotLead.count({
          where: { conversationId: conversation.id },
        })
        assert.equal(leadRows, 1, 'una sola fila de ChatbotLead en la BD')
      },
    )
  } finally {
    // Settle: el ganador de la sección 3 dejó notifyClient/syncLeadToCrm
    // corriendo en detached (ambos neutralizados/skip, pero tocan la BD para
    // decidirlo) — no borrarles las filas abajo de los pies ni matarles el
    // engine con el $disconnect (3s cubre el par de queries del skip del CRM).
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const conversations = await prisma.conversation.findMany({
      where: { sessionId: { startsWith: SESSION_TAG } },
      select: { id: true },
    })
    const ids = conversations.map((c) => c.id)
    if (ids.length > 0) {
      // Eventos primero (FK SetNull: sobrevivirían al delete de la
      // conversación como huérfanos), después leads, después conversaciones
      // (cascade barre ChatMessage).
      await prisma.chatbotEvent.deleteMany({ where: { conversationId: { in: ids } } })
      await prisma.chatbotLead.deleteMany({ where: { conversationId: { in: ids } } })
      await prisma.conversation.deleteMany({ where: { id: { in: ids } } })
    }
    console.log(`  · cleanup: ${ids.length} conversaciones de test borradas`)
    await prisma.$disconnect()
  }

  if (failures.length > 0) {
    console.error(
      `\n[p2002-adopcion invariant] ✗ ${failures.length} sección(es) fallida(s): ${failures.join(' | ')}`,
    )
    process.exitCode = 1
    return
  }
  console.log(
    '\n[p2002-adopcion invariant] ✓ Perdedor-adopta pinneado: P2002 nunca escapa, ' +
      'un solo isNew:true (una sola reserva de cupo) y alreadyCaptured:true para el perdedor del lead.',
  )
}

void main()
