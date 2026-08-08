/**
 * STREAM-TIMEOUT (Fase 2) — Persistencia del turno en UNA sola función,
 * invocable desde `onFinish` (camino normal), desde `onAbort` (el stream murió
 * por timeout antes de que Gemini emitiera su chunk terminal) o desde el
 * watchdog del borde.
 *
 * POR QUÉ EXISTE: la evidencia de prod mostró que con el stream colgado NUNCA
 * se llega a `onFinish` — la respuesta le llega entera al visitante y no se
 * persiste NADA (cero filas ASSISTANT, cero ChatbotEvent). El corte por
 * timeout destraba el input, pero sin este camino alternativo el mensaje se
 * seguiría perdiendo: al abortar, el SDK no registra el step, así que su
 * `flush` no llama a `onFinish` y el único hook que corre es `onAbort`.
 *
 * IDEMPOTENCIA: `turnPersisted` se marca SINCRÓNICAMENTE al entrar, antes de
 * cualquier await. Los tres caminos corren en el mismo event loop de la misma
 * instancia, así que si una carrera dispara más de uno, el segundo sale por el
 * early-return: cero doble escritura y cero doble conteo de cupo. El dedup por
 * `findFirst` de ONF-1 (dentro del retry) sigue cubriendo el caso distinto:
 * commit-ack perdido entre reintentos.
 *
 * ─── MS-E6.2 (costura C) ────────────────────────────────────────────────────
 *
 * Movido VERBATIM desde `handleChatRequest.ts`, donde vivía como un closure de
 * 495 líneas dentro del handler. Cero cambio de comportamiento.
 *
 * ESTADO POR REQUEST: `turnPersisted` vive en el closure de ESTE factory, que
 * el handler instancia una vez por request. Nunca a nivel de módulo — en
 * serverless un contenedor caliente atiende muchos requests con el mismo módulo
 * cargado, y un flag compartido haría que el turno de una conversación se
 * saltee por culpa de otra.
 *
 * ⚠️ LOS CUATRO GETTERS, Y POR QUÉ NO SON VALORES. `persistTurn` lee cuatro
 * bindings que el handler MUTA DESPUÉS de construir este factory:
 *
 *   | binding                 | quién lo muta                  | si se pasara por valor |
 *   |-------------------------|--------------------------------|------------------------|
 *   | ttfbAt                  | `onChunk` (primer chunk útil)  | `llm_ttfb_ms` = null   |
 *   | stepCount               | `onStepFinish`                 | `step_count` = 0       |
 *   | emptyFallbackInjected   | el transform de respuesta vacía| el fallback no cierra  |
 *   | conversationDiscarded   | `discardNewConversation` y la  | re-infla una fila que  |
 *   |                         | compensación de cupo           | la compensación borró  |
 *
 * Congelarlos en el momento de la construcción los dejaría para siempre en
 * `null / 0 / false / false`, y NINGUNA de las cuatro roturas la detecta la
 * batería de tests (ningún test invoca `persistTurn`). Por eso viajan como
 * funciones, no como valores.
 */
import * as Sentry from '@sentry/nextjs'
import { calculateCost } from '../pricing'
import { incrementQuota } from '../quota'
import { validateAssistantOutput } from '../safety'
import { chatbotLog, logChatbotEvent, logPersistFailure } from '../logging'
import {
  PERSIST_TX_MAX_ATTEMPTS,
  PERSIST_TX_RETRY_BACKOFF_MS,
  ASSISTANT_PERSIST_DEDUP_WINDOW_MS,
  shouldSkipAssistantPersist,
  ONFINISH_TOTAL_BUDGET_MS,
  PERSIST_TX_DEADLINE_MS,
  EVENT_LOG_DEADLINE_MS,
  QUOTA_COMPENSATION_DEADLINE_MS,
  computeHookBudgetMs,
  type CompensationTrigger,
} from './reconcile'
import { createBudget, isDeadlineExceeded, type LateSettleInfo } from './withDeadline'
import {
  runHookOp,
  phaseOutcome,
  type HookOpResult,
  type PhaseRecord,
  type RetrySkipReason,
} from './hookOps'
import type { ChunkTally } from './chunkTally'
import type { StreamProbe } from './streamProbe'
import type { forOrg } from '@/lib/isolation'
import type { resolveEffectiveModel } from '../llm'

/**
 * STREAM-TIMEOUT (Fase 2) — Entrada de `persistTurn`. Es todo lo que cambia
 * entre los caminos que pueden cerrar un turno; el resto (conversación,
 * scope, presupuesto, fases) sale de las dependencias del factory.
 *
 *   - `onFinish`: el SDK entrega texto, usage y steps del run completo.
 *   - `onAbort`: el run murió por timeout sin chunk terminal. NO hay texto ni
 *     usage del SDK — el texto sale del acumulador de `onChunk` y los tokens
 *     quedan en 0 (subreporte honesto, ver el call-site).
 */
export interface PersistTurnInput {
  /**
   * WATCHDOG — `watchdog` es el camino nuevo: el borde de la respuesta se quedó
   * mudo y cerramos nosotros. A diferencia de `onAbort`, este SÍ se espera antes
   * de cerrar el stream, así que la persistencia no corre carrera contra el
   * freeze de la función.
   */
  source: 'onFinish' | 'onAbort' | 'watchdog'
  /** Texto que el visitante REALMENTE vio. Nunca se loguea, solo se persiste. */
  assistantText: string
  finishReason: string
  /**
   * Tool calls agregadas de todos los steps. `unknown[]` a propósito: acá es un
   * payload JSON opaco que va tal cual a una columna `Json` de Prisma — el tipo
   * fuerte vive en el call-site, donde el SDK lo infiere.
   */
  toolCalls: readonly unknown[]
  tokensIn: number
  tokensOut: number
}

export type PersistTurnFn = (input: PersistTurnInput) => Promise<void>

export interface PersistTurnDeps {
  // ─── Estables: resueltos antes de construir el factory, nunca reasignados ──
  conversation: { id: string; messageCount: number | null }
  resolvedBot: { id: string }
  slug: string
  orgId: string
  scope: ReturnType<typeof forOrg>
  startTime: number
  llmStartAt: number
  effectiveModel: Pick<ReturnType<typeof resolveEffectiveModel>, 'provider' | 'modelId'>
  emptyFallbackText: string
  chunkTally: ChunkTally
  streamProbe: StreamProbe
  /** Objeto mutado EN SITIO por el handler: la referencia es estable. */
  timings: Record<string, number | null>
  mark: (key: string) => void
  /** Reposiciona el cursor de `mark()` — el handler es dueño de `stepStart`. */
  setStepStart: (value: number) => void
  /** `null` si no hubo reserva atómica que compensar. Ya final en este punto. */
  compensateReservedQuota:
    | ((
        trigger: CompensationTrigger,
        ctx: { firstTokenDelivered: boolean; toolCallCount: number },
      ) => Promise<void>)
    | null

  // ─── Vivos: FUNCIONES, no valores. Ver la tabla del encabezado. ────────────
  getTtfbAt: () => number | null
  getStepCount: () => number
  getEmptyFallbackInjected: () => boolean
  getConversationDiscarded: () => boolean
}

export function createPersistTurn(deps: PersistTurnDeps): PersistTurnFn {
  const {
    conversation,
    resolvedBot,
    slug,
    orgId,
    scope,
    startTime,
    llmStartAt,
    effectiveModel,
    emptyFallbackText,
    chunkTally,
    streamProbe,
    timings,
    mark,
    setStepStart,
    compensateReservedQuota,
    getTtfbAt,
    getStepCount,
    getEmptyFallbackInjected,
    getConversationDiscarded,
  } = deps

  // Guard de idempotencia — una instancia por request, en este closure.
  let turnPersisted = false

  return async (input: PersistTurnInput): Promise<void> => {
    if (turnPersisted) {
      streamProbe.mark('persistTurn_skipped', { source: input.source })
      return
    }
    // ANTES de cualquier await — ver IDEMPOTENCIA arriba.
    turnPersisted = true

    // Se desestructura a los MISMOS nombres que ya usaba el cuerpo de onFinish,
    // así el bloque movido queda idéntico y el diff es un move puro.
    const persistSource = input.source
    const text = input.assistantText
    const finishReason = input.finishReason
    const allToolCalls = input.toolCalls
    const totalIn = input.tokensIn
    const totalOut = input.tokensOut

    const llmDoneAt = Date.now()
    // Lectura VIVA del acumulador de `onChunk`, capturada en una const local:
    // TS no narrowea el resultado de una llamada, y el original leia el valor de
    // ESTE instante. Mismo momento de lectura, mismo valor.
    const ttfbAt = getTtfbAt()
    timings.llm_ttfb_ms = ttfbAt !== null ? ttfbAt - llmStartAt : null
    timings.llm_stream_ms = ttfbAt !== null ? llmDoneAt - ttfbAt : null
    timings.llm_total_ms = llmDoneAt - llmStartAt
    timings.step_count = getStepCount()
    setStepStart(llmDoneAt)
    // ONF-1 — hoisted fuera del try: el catch INFRA.1 reporta cuántos
    // intentos de persistencia se agotaron.
    let persistAttempt = 0

    // ─── DEADLINE-ONFINISH — techo de tiempo del hook ─────────────────────
    // Este callback corre DENTRO del flush() del stream (el SDK lo invoca con
    // `await`): hasta que no retorna, el readable no llega a `done`, el
    // cliente no pasa a `status:'ready'` y el input del widget sigue trabado.
    // Por eso TODO await que toque la DB va con deadline, y el conjunto con un
    // presupuesto global — techado también contra el `maxDuration` de la ruta,
    // así un LLM lento no vuelve a empujar el hook contra el kill de 30s.
    const hookStartedAt = Date.now()
    const requestElapsedMsAtHookStart = hookStartedAt - startTime
    const budget = createBudget(computeHookBudgetMs(requestElapsedMsAtHookStart))
    let retrySkipped: RetrySkipReason = null
    // Longitud —NUNCA contenido— del mensaje del assistant. Hoisted para que
    // el registro de abandono la alcance desde el catch.
    let assistantMessageLength = 0

    // Todas las fases arrancan en 'skipped' para que el log salga SIEMPRE con
    // la misma forma: una fase condicional que no corrió queda distinguible de
    // una que corrió y falló, sin tener que cruzar el log contra el código.
    const phases: Record<string, PhaseRecord> = {
      validation_warnings_event: { ms: 0, outcome: 'skipped' },
      empty_fallback_event: { ms: 0, outcome: 'skipped' },
      quota_compensation: { ms: 0, outcome: 'skipped' },
      completed_event: { ms: 0, outcome: 'skipped' },
      persist_error_event: { ms: 0, outcome: 'skipped' },
    }
    for (let attempt = 1; attempt <= PERSIST_TX_MAX_ATTEMPTS; attempt += 1) {
      phases[`persist_tx_${attempt}`] = { ms: 0, outcome: 'skipped' }
    }

    // Rastro del settlement TARDÍO de una operación ya abandonada: es el
    // discriminador socket-vs-lock. Si la tx commitea a los 18s → conexión
    // viva pero lenta (lock / cold start). Si nunca aparece → socket muerto.
    // Caveat: Netlify puede congelar el contenedor al cerrar la respuesta, así
    // que su AUSENCIA no prueba nada; su PRESENCIA sí es concluyente.
    const reportLateSettlement = (info: LateSettleInfo): void => {
      chatbotLog(
        'chat.hook_late_settlement',
        {
          conversationId: conversation.id,
          botConfigId: resolvedBot.id,
          botSlug: slug,
          phase: info.label,
          deadlineMs: info.deadlineMs,
          elapsedMs: info.elapsedMs,
          settled: info.settled,
        },
        'warn',
      )
    }

    /** Corre una fase con deadline (techado al presupuesto) y la registra. */
    const runPhase = async <T>(
      phase: string,
      phaseBudgetMs: number,
      start: () => Promise<T>,
    ): Promise<HookOpResult<T>> => {
      const result = await runHookOp(
        phase,
        budget.clamp(phaseBudgetMs),
        start,
        reportLateSettlement,
      )
      phases[phase] = { ms: result.ms, outcome: phaseOutcome(result) }
      return result
    }

    try {
      // Validate output (capa 4)
      const warnings = validateAssistantOutput(text)
      if (warnings.length > 0) {
        chatbotLog(
          'chat.validation_warnings',
          {
            conversationId: conversation.id,
            warnings: warnings.map((w) => ({
              patternId: w.patternId,
              severity: w.severity,
            })),
          },
          'warn'
        )
        await runPhase('validation_warnings_event', EVENT_LOG_DEADLINE_MS, () =>
          logChatbotEvent({
            organizationId: orgId,
            botConfigId: resolvedBot.id,
            type: 'chat.validation_warnings',
            level: 'warn',
            message: `${warnings.length} validation warning(s) en respuesta`,
            conversationId: conversation.id,
            metadata: { warnings: warnings.map((w) => w.patternId) },
          }),
        )
      }

      // ONF-1 — Turno fallback: el modelo devolvió vacío y el transform
      // inyectó la derivación canned al stream. Se persiste el mensaje que
      // el visitante VIO (nunca un turno mudo), pero NO se cuenta como
      // respuesta entregada: sin tools ejecutadas, la reserva de cupo se
      // devuelve. `assistantContent` cae al canned explícito si el texto
      // transformado no llegara al onFinish (belt-and-suspenders).
      const assistantContent =
        getEmptyFallbackInjected() && text.trim().length === 0 ? emptyFallbackText : text
      assistantMessageLength = assistantContent.length
      if (getEmptyFallbackInjected()) {
        chatbotLog(
          'chat.empty_response_fallback',
          {
            conversationId: conversation.id,
            finishReason,
            toolCallCount: allToolCalls.length,
          },
          'warn',
        )
        await runPhase('empty_fallback_event', EVENT_LOG_DEADLINE_MS, () =>
          logChatbotEvent({
            organizationId: orgId,
            botConfigId: resolvedBot.id,
            type: 'chat.empty_response_fallback',
            level: 'warn',
            message: 'Respuesta vacía del modelo — turno degradado con derivación canned',
            conversationId: conversation.id,
            metadata: { finishReason, toolCallCount: allToolCalls.length },
          }),
        )
        // Se captura en un const para que el narrowing sobreviva al closure
        // (`compensateReservedQuota` es un `let` del scope externo).
        const compensate = compensateReservedQuota
        if (compensate) {
          await runPhase('quota_compensation', QUOTA_COMPENSATION_DEADLINE_MS, () =>
            compensate('empty_response', {
              firstTokenDelivered: getTtfbAt() !== null,
              toolCallCount: allToolCalls.length,
            }),
          )
        }
      }

      // ONF-1 — Si la compensación descartó la conversación (nueva, sin
      // ASSISTANT entregado: cupo devuelto + fila borrada en una tx), no hay
      // fila donde persistir el turno — y persistirlo re-inflaría lo que la
      // compensación limpió. El rastro queda en chat.empty_response_fallback
      // + chat.quota_compensated y en este log de cierre.
      if (getConversationDiscarded()) {
        mark('post_persist_ms')
        timings.total_ms = Date.now() - startTime
        chatbotLog('chat.llm_request_finished', {
          conversationId: conversation.id,
          finishReason,
          turnDiscarded: true,
          emptyFallback: getEmptyFallbackInjected(),
          durationMs: timings.total_ms,
          timings,
        })
        return
      }

      // MS-1: tokens y tool calls agregados desde todos los steps (ver bloque arriba).
      const tokensIn = totalIn
      const tokensOut = totalOut
      // COST-1 — mismo par efectivo que ejecutó la respuesta (arriba), no
      // resolvedBot.llmProvider/llmModel (legacy, podía divergir de plan.llmModel).
      const costBreakdown = calculateCost(
        effectiveModel.provider,
        effectiveModel.modelId,
        tokensIn,
        tokensOut
      )

      // ONF-1 (RB.3) — Los tres writes del turno son UNA transacción scoped
      // (mismo patrón que capture_lead): entran los tres o ninguno.
      // Orden dentro de la tx: mensaje → conversación → cupo.
      //   - mensaje primero: fila nueva, sin contención;
      //   - conversación después: único lock compartido con la tx de
      //     capture_lead (lead → conversación) — un solo recurso en común
      //     entre ambas transacciones → sin ciclo de deadlock posible;
      //   - cupo al final: la fila QuotaUsage del mes es la de mayor
      //     contención del tenant — se lockea a lo último para achicar su
      //     sección crítica.
      // Ante un corte de Netlify (~10s) a mitad de la transacción, la
      // conexión muere sin COMMIT → Postgres hace rollback: nunca queda
      // estado parcial (cupo movido sin mensaje, o mensaje sin contadores).
      // El turno cortado lo recupera el retry del widget (INFRA.2: la cola
      // USER sin responder no se duplica).
      //
      // Caso "respuesta YA entregada + persistencia falla" (decisión ONF-1):
      // retry acotado (PERSIST_TX_MAX_ATTEMPTS, retry de APLICACIÓN — no el
      // retry de conexión de INFRA.3, que sigue NO activo) con guard de
      // idempotencia: si el COMMIT del intento anterior entró pero el ack se
      // perdió (error post-commit), el reintento ve la cola ASSISTANT
      // idéntica y NO duplica — como los tres writes son atómicos, si el
      // mensaje está, los contadores también entraron. Si el último intento
      // también falla: INFRA.1 (catch de abajo) y se acepta la pérdida del
      // registro con evento claro — la respuesta ya salió y no es
      // re-enviable; preferimos un turno sin registrar a contadores dobles.
      const persistedAt = new Date()
      for (;;) {
        persistAttempt += 1
        const attempt = await runPhase(
          `persist_tx_${persistAttempt}`,
          PERSIST_TX_DEADLINE_MS,
          () =>
            scope.$transaction(async (tx) => {
              if (persistAttempt > 1) {
                // Query DIRIGIDA al ASSISTANT idéntico dentro de la ventana —
                // no a la cola (hallazgo del review): un USER interleaved de
                // otro request del mismo sessionId desplazaría la cola y
                // taparía el commit fantasma del intento 1.
                const committedCandidate = await tx.chatMessage.findFirst({
                  where: {
                    conversationId: conversation.id,
                    role: 'ASSISTANT',
                    content: assistantContent,
                    createdAt: { gte: new Date(Date.now() - ASSISTANT_PERSIST_DEDUP_WINDOW_MS) },
                  },
                  orderBy: { createdAt: 'desc' },
                  select: { role: true, content: true, createdAt: true },
                })
                if (shouldSkipAssistantPersist(committedCandidate, assistantContent, new Date())) {
                  return
                }
              }

              // Persist assistant message + tool calls (all steps).
              await tx.chatMessage.create({
                conversationId: conversation.id,
                role: 'ASSISTANT',
                content: assistantContent,
                tokensIn,
                tokensOut,
                toolCalls: allToolCalls.length > 0
                  ? (allToolCalls as unknown as object)
                  : undefined,
              })

              // Update Conversation aggregate metrics
              await tx.conversation.update(conversation.id, {
                messageCount: { increment: 2 },  // user + assistant
                tokensIn: { increment: tokensIn },
                tokensOut: { increment: tokensOut },
                estimatedCostUsd: { increment: costBreakdown.totalUsd },
                lastMessageAt: persistedAt,
              })

              // Update QuotaUsage for current period.
              // B4.2: `conversationsCount` ya se incrementó atómicamente vía
              // tryReserveConversation cuando isNewConversation=true. Acá pasamos
              // false siempre para evitar double-count del counter. Tokens y cost
              // se siguen acumulando normalmente — también en un turno fallback
              // (el modelo se consumió igual; lo que se devuelve es el CUPO).
              await incrementQuota(
                {
                  organizationId: orgId,
                  botConfigId: resolvedBot.id,
                  isNewConversation: false,
                  messagesAdded: 2,
                  tokensIn,
                  tokensOut,
                  costUsd: costBreakdown.totalUsd,
                },
                tx,
              )
            }),
        )
        if (attempt.ok) break

        // ── Gate del retry (DEADLINE-ONFINISH) ────────────────────────────
        // El retry de ONF-1 se diseñó para el transitorio CORTO de Neon: un
        // error real y rápido que el 2º intento supera. Un DEADLINE es otra
        // cosa — la operación quedó abandonada pero VIVA, reteniendo su
        // conexión del pool (withDeadline abandona, no cancela). Reintentar
        // ahí retendría una segunda conexión: en un contenedor caliente eso
        // envenena el pool para los requests siguientes (P2024) a cambio de
        // nada, porque el cuelgue no se va a destrabar en 300ms. El valor
        // diagnóstico ya quedó capturado por `onLateSettle` del intento 1.
        if (persistAttempt >= PERSIST_TX_MAX_ATTEMPTS) {
          retrySkipped = 'max_attempts'
          throw attempt.error
        }
        if (attempt.timedOut) {
          retrySkipped = 'deadline'
          throw attempt.error
        }
        // El techo global gana siempre: si no entra un intento COMPLETO más el
        // evento de cierre, no se reintenta — así el reporte de abandono
        // conserva su presupuesto y el stream cierra igual.
        if (
          !budget.hasRoomFor(
            PERSIST_TX_RETRY_BACKOFF_MS + PERSIST_TX_DEADLINE_MS + EVENT_LOG_DEADLINE_MS,
          )
        ) {
          retrySkipped = 'budget'
          throw attempt.error
        }
        // Primer intento fallido: rastro off-Neon YA (si el retry también
        // muere, este log es lo que sobrevive), backoff corto y reintento.
        logPersistFailure('chat.persist_retry', attempt.error, {
          conversationId: conversation.id,
          botSlug: slug,
          botConfigId: resolvedBot.id,
          attempt: persistAttempt,
        })
        await new Promise<void>((resolve) => setTimeout(resolve, PERSIST_TX_RETRY_BACKOFF_MS))
      }
      mark('post_persist_ms')
      const totalMs = Date.now() - startTime
      timings.total_ms = totalMs

      chatbotLog('chat.llm_request_finished', {
        conversationId: conversation.id,
        finishReason,
        tokensIn,
        tokensOut,
        costUsd: Number(costBreakdown.totalUsd.toFixed(6)),
        toolCallCount: allToolCalls.length,
        warningCount: warnings.length,
        durationMs: totalMs,
        // ONF-1 — 1 = camino feliz; >1 = el retry acotado recuperó el turno.
        persistAttempts: persistAttempt,
        emptyFallback: getEmptyFallbackInjected(),
        timings,
      })

      await runPhase('completed_event', EVENT_LOG_DEADLINE_MS, () =>
        logChatbotEvent({
          organizationId: orgId,
          botConfigId: resolvedBot.id,
          type: 'chat.message_completed',
          level: 'info',
          message: `Respuesta enviada (${tokensIn} in / ${tokensOut} out)`,
          conversationId: conversation.id,
          metadata: {
            tokensIn,
            tokensOut,
            costUsd: costBreakdown.totalUsd,
            toolCallCount: allToolCalls.length,
            durationMs: totalMs,
            latencyMs: totalMs,
            timings,
          },
        }),
      )
    } catch (persistError) {
      // INFRA.1 — Sink off-Neon PRIMERO, antes de cualquier write a Neon.
      // stderr estructurado con .code/.cause: el rastro que sobrevive a la
      // conexión muerta (Netlify Function Logs). Reemplaza al chatbotError
      // previo, que solo registraba name/message/stack (sin .code/.cause).
      logPersistFailure('chat.persist_failed', persistError, {
        conversationId: conversation.id,
        botSlug: slug,
        botConfigId: resolvedBot.id,
        turnIndex: Math.floor((conversation.messageCount ?? 0) / 2),
        // ONF-1 — intentos agotados del $transaction (retry acotado incluido).
        // El rollback garantiza que NO quedó estado parcial: se perdió el
        // registro del turno completo, no un pedazo.
        attempts: persistAttempt,
        // DEADLINE-ONFINISH — por qué no hubo (o no hubo más) reintentos.
        retrySkipped,
      })

      // DEADLINE-ONFINISH — Registro de RECONCILIACIÓN, distinto del de arriba.
      // `chat.persist_failed` cubre "Postgres falló y garantizó rollback: el
      // turno se perdió, punto". Esto cubre el caso nuevo: el turno se ABANDONÓ
      // por deadline, así que su desenlace es DESCONOCIDO — puede commitear más
      // tarde (ver `chat.hook_late_settlement`). Es la línea a partir de la
      // cual se puede reconciliar a mano lo que falta. Solo identificadores,
      // contadores y LONGITUDES: nunca contenido de mensajes.
      const abandoned = isDeadlineExceeded(persistError) || retrySkipped === 'budget'
      if (abandoned) {
        chatbotLog(
          'chat.persist_abandoned',
          {
            conversationId: conversation.id,
            botConfigId: resolvedBot.id,
            botSlug: slug,
            // STREAM-TIMEOUT — de qué camino venía. `onAbort` es best-effort
            // (el SDK no espera ese hook): un abandono ahí puede ser el freeze
            // de la función, no un problema de la DB.
            source: persistSource,
            phase: isDeadlineExceeded(persistError)
              ? persistError.label
              : `persist_tx_${persistAttempt}`,
            elapsedMs: Date.now() - hookStartedAt,
            assistantMessageLength,
            finishReason,
            attempts: persistAttempt,
            retrySkipped,
          },
          'error',
        )
      }

      // Best-effort: si Neon se recuperó, dejar también el row en chatbot_events.
      // logChatbotEvent traga su propio fallo (persistentLogger) y nunca relanza;
      // DEADLINE-ONFINISH le agrega el techo de tiempo y traga también el
      // deadline — el rastro autoritativo ya salió a stderr arriba, y esta
      // escritura puede quedar starved por la conexión que retuvo la tx
      // abandonada. El orden (stderr PRIMERO, DB después) es deliberado: el
      // reporte del fallo no puede depender del recurso que está fallando.
      await runPhase('persist_error_event', EVENT_LOG_DEADLINE_MS, () =>
        logChatbotEvent({
          organizationId: orgId,
          botConfigId: resolvedBot.id,
          type: 'chat.persist_error',
          level: 'error',
          message: persistError instanceof Error ? persistError.message : 'unknown',
          conversationId: conversation.id,
        }),
      )
      // B14.5 — Sentry best-effort (no-op sin NEXT_PUBLIC_SENTRY_DSN → [FALTA:sentry-dsn]).
      // El scrub-pii del beforeSend limpia antes de mandar.
      Sentry.captureException(persistError, {
        tags: { module: 'chatbot', stage: 'persist' },
        extra: { conversationId: conversation.id, botSlug: slug },
      })
    } finally {
      // ─── DEADLINE-ONFINISH (instrumentación) ────────────────────────────
      // UN log agregado, off-Neon, en TODOS los caminos (éxito, fallo, early
      // return del turno descartado). Es el entregable que cierra el
      // diagnóstico: la próxima corrida en prod dice exactamente qué await
      // cuelga y cuánto. Nunca contenido de mensajes — solo fases, duraciones,
      // desenlaces y longitudes.
      //
      // Cómo leerlo:
      //   - `persist_tx_1: deadline` con las fases previas en 'skipped'/'ok'
      //     rápidas → cuelga la transacción (socket muerto o lock).
      //   - un `*_event: deadline` ANTES de la tx → el problema es la conexión,
      //     no un lock de la tx. Ojo: esas fases son condicionales y en tráfico
      //     normal quedan en 'skipped', así que no siempre está disponible.
      //   - un `chat.hook_late_settlement` posterior con la misma `phase` →
      //     la operación SÍ terminó, tarde: conexión viva pero lenta.
      //   - `budgetExhausted: true` → el techo cortó el hook (lo esperado
      //     mientras la causa raíz siga abierta).
      const anomalous = Object.values(phases).some(
        (p) => p.outcome === 'deadline' || p.outcome === 'error' || p.outcome === 'no_budget',
      )
      chatbotLog(
        'chat.onfinish_phases',
        {
          conversationId: conversation.id,
          botConfigId: resolvedBot.id,
          botSlug: slug,
          // STREAM-TIMEOUT — `onFinish` = camino normal (el SDK espera el
          // hook); `onAbort` = el stream murió por timeout y la persistencia
          // corre carrera contra el freeze de la función (best-effort).
          source: persistSource,
          // Flujo de chunks del provider: si `chunks_total` siguió subiendo
          // después de que el texto terminó, el `chunkMs` nunca podía vencer.
          ...chunkTally.snapshot(),
          finishReason,
          assistantMessageLength,
          phases,
          retrySkipped,
          attempts: persistAttempt,
          totalMs: Date.now() - hookStartedAt,
          budgetMs: budget.totalMs,
          budgetExhausted: budget.remainingMs() === 0,
          // Cuánto llevaba el request al entrar al hook: si el presupuesto
          // salió recortado por debajo de ONFINISH_TOTAL_BUDGET_MS, fue por
          // acá (LLM lento empujando contra el maxDuration de la ruta).
          requestElapsedMsAtHookStart,
          budgetCapMs: ONFINISH_TOTAL_BUDGET_MS,
        },
        // Nivel según desenlace: un turno sano no ensucia el carril de error,
        // y uno anómalo sale por stderr junto al resto del rastro off-Neon.
        anomalous ? 'warn' : 'info',
      )
    }
  }
}
