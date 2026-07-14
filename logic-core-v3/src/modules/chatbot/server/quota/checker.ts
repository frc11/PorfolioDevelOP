import { forOrg, type OrgScopeAccessors } from '@/lib/isolation'

/**
 * Quota tracking is per (BotConfig, year-month).
 *
 * The "period" key is "YYYY-MM" (UTC). One QuotaUsage row per month.
 *
 * B0-S3: todo acceso a QuotaUsage pasa por el helper de aislamiento scoped por
 * org (forOrg(organizationId).quotaUsage). Verifica que el bot pertenezca a la
 * org y las mutaciones atómicas llevan el guard de org embebido en el SQL.
 */

function currentPeriodKey(date: Date = new Date()) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
  }
}

export interface QuotaCheckResult {
  withinQuota: boolean
  conversationsUsed: number
  conversationsLimit: number
  year: number
  month: number
}

/**
 * Checks if the bot is within its monthly quota.
 * Does NOT increment counters — that's done after the message is processed.
 */
export async function checkQuota(
  organizationId: string,
  botConfigId: string,
  monthlyQuota: number
): Promise<QuotaCheckResult> {
  const { year, month } = currentPeriodKey()

  const usage = await forOrg(organizationId).quotaUsage.findByPeriod(botConfigId, year, month)

  const conversationsUsed = usage?.conversationsCount ?? 0

  return {
    withinQuota: conversationsUsed < monthlyQuota,
    conversationsUsed,
    conversationsLimit: monthlyQuota,
    year,
    month,
  }
}

export interface QuotaIncrementInput {
  organizationId: string
  botConfigId: string
  isNewConversation: boolean
  messagesAdded: number
  tokensIn: number
  tokensOut: number
  costUsd: number
}

/**
 * Upserts the QuotaUsage row for the current period with the new usage.
 *
 * ONF-1 — `accessors` opcional: cuando el write forma parte de una transacción
 * scoped (forOrg().$transaction), el caller pasa el `tx` para que el upsert
 * entre-o-caiga junto con el resto del turno (mensaje + conversación). Sin
 * `accessors`, comportamiento idéntico al histórico (scope raíz propio).
 */
export async function incrementQuota(
  input: QuotaIncrementInput,
  accessors?: Pick<OrgScopeAccessors, 'quotaUsage'>,
): Promise<void> {
  const { year, month } = currentPeriodKey()

  await (accessors ?? forOrg(input.organizationId)).quotaUsage.upsertPeriod({
    botConfigId: input.botConfigId,
    year,
    month,
    create: {
      conversationsCount: input.isNewConversation ? 1 : 0,
      tokensIn: input.tokensIn,
      tokensOut: input.tokensOut,
      costUsd: input.costUsd,
    },
    update: {
      conversationsCount: input.isNewConversation ? { increment: 1 } : undefined,
      tokensIn: { increment: input.tokensIn },
      tokensOut: { increment: input.tokensOut },
      costUsd: { increment: input.costUsd },
    },
  })
}

export interface QuotaReserveResult {
  reserved: boolean
  conversationsUsed: number
  conversationsLimit: number
  year: number
  month: number
}

/**
 * B4.2 — Reserva atómica de cupo de conversación nueva.
 *
 * Resuelve el race condition TOCTOU entre `checkQuota` (lectura) y el
 * incremento eventual en `incrementQuota` (post-LLM): en burst de N
 * requests simultáneos contra el último cupo, el `checkQuota`
 * optimista deja pasar a todos, y el contador termina por sobre el
 * límite.
 *
 * Esta función hace `UPDATE ... WHERE conversationsCount < limit
 * RETURNING ...` que es atómico en PostgreSQL (lock por fila). Si la
 * fila no existía, la crea con `count=1`; si existía pero el límite
 * ya está alcanzado, devuelve `reserved=false` sin tocar el contador.
 *
 * Garantía: el `conversationsCount` después de N reservas exitosas
 * concurrentes nunca excede `monthlyQuota`. La N+1ª reserva falla.
 *
 * Llamar SOLO cuando la conversación es NUEVA (isNewConversation=true).
 * Mensajes en conversación existente no incrementan el contador.
 *
 * Si esta función reserva, `incrementQuota` para el mismo turn debe
 * pasarse con `isNewConversation: false` para no double-count.
 */
export async function tryReserveConversation(
  organizationId: string,
  botConfigId: string,
  monthlyQuota: number,
): Promise<QuotaReserveResult> {
  const { year, month } = currentPeriodKey()

  // La reserva atómica (asegurar fila + UPDATE conditional con row-lock de
  // Postgres + re-lectura) vive en el accessor scoped. El guard de org va
  // EMBEBIDO en el SQL (EXISTS sobre chatbot_bot_config), preservando la
  // garantía TOCTOU: N reservas concurrentes nunca exceden monthlyQuota.
  const { reserved, conversationsUsed } = await forOrg(organizationId).quotaUsage.reserveConversation({
    botConfigId,
    year,
    month,
    monthlyQuota,
  })

  return {
    reserved,
    conversationsUsed,
    conversationsLimit: monthlyQuota,
    year,
    month,
  }
}

export interface QuotaCompensationResult {
  /** true = cupo devuelto Y fila de Conversation descartada (los dos, atómico). */
  compensated: boolean
  /** Contador tras el release; null cuando NO se compensó (el cobro queda). */
  conversationsUsed: number | null
}

/**
 * ONF-1 — Compensación ATÓMICA de la reserva de una conversación NUEVA cuyo
 * turno murió sin entregar respuesta: devuelve el cupo (releaseConversation:
 * UPDATE conditional `conversationsCount > 0` + guard de org — mismo patrón
 * atómico que la reserva, NUNCA un decrement suelto) y descarta la fila de
 * Conversation en la MISMA transacción. Entran los dos o ninguno — jamás
 * "cupo devuelto + fila viva".
 *
 * Por qué van JUNTOS (hallazgo del review ONF-1): si el release dejara la
 * fila viva, el retry del widget (INFRA.2) o la siguiente pregunta del
 * visitante la revive con isNew=false → nunca re-reserva → la conversación
 * entera queda sin cobrar (undercount sistemático en el flujo de cold-start
 * de Neon). Descartada la fila, el retry recrea la conversación y VUELVE a
 * reservar: el accounting queda exacto en ambos desenlaces.
 *
 * Guard anti-carrera: el delete es condicional a que la conversación siga
 * SIN ningún ASSISTANT persistido (`messages: none role ASSISTANT`). Si otro
 * request del mismo sessionId ya entregó y persistió un turno en esta fila,
 * el delete no matchea → `compensated: false` y el cobro QUEDA (la
 * conversación vive y fue entregada — cobrarla es lo correcto). El cascade
 * solo puede arrastrar colas USER sin responder, nunca historia entregada.
 *
 * `year`/`month` vienen del RESULTADO de la reserva (no del reloj): una
 * compensación que cruza el borde de mes (reserva 23:59:59 del mes M,
 * release 00:00:01 de M+1) devuelve el cupo al período que se reservó.
 *
 * Idempotencia por request (no compensar dos veces la misma reserva) es del
 * caller — acá se garantiza la atomicidad del par release+discard.
 */
export async function compensateNewConversationReservation(input: {
  organizationId: string
  botConfigId: string
  conversationId: string
  year: number
  month: number
}): Promise<QuotaCompensationResult> {
  return forOrg(input.organizationId).$transaction(async (tx) => {
    const discarded = await tx.conversation.deleteMany({
      id: input.conversationId,
      messages: { none: { role: 'ASSISTANT' } },
    })
    if (discarded.count === 0) {
      // Alguien entregó un turno en esta conversación (o ya fue descartada):
      // no se toca el contador — el cobro queda en pie.
      return { compensated: false, conversationsUsed: null }
    }
    const release = await tx.quotaUsage.releaseConversation({
      botConfigId: input.botConfigId,
      year: input.year,
      month: input.month,
    })
    return { compensated: true, conversationsUsed: release.conversationsUsed }
  })
}
