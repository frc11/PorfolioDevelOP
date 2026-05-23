import { prisma } from '@/lib/prisma'

/**
 * Quota tracking is per (BotConfig, year-month).
 *
 * The "period" key is "YYYY-MM" (UTC). One QuotaUsage row per month.
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
  botConfigId: string,
  monthlyQuota: number
): Promise<QuotaCheckResult> {
  const { year, month } = currentPeriodKey()

  const usage = await prisma.quotaUsage.findUnique({
    where: {
      botConfigId_year_month: { botConfigId, year, month },
    },
  })

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
  botConfigId: string
  isNewConversation: boolean
  messagesAdded: number
  tokensIn: number
  tokensOut: number
  costUsd: number
}

/**
 * Upserts the QuotaUsage row for the current period with the new usage.
 */
export async function incrementQuota(input: QuotaIncrementInput): Promise<void> {
  const { year, month } = currentPeriodKey()

  await prisma.quotaUsage.upsert({
    where: {
      botConfigId_year_month: { botConfigId: input.botConfigId, year, month },
    },
    create: {
      botConfigId: input.botConfigId,
      year,
      month,
      conversationsCount: input.isNewConversation ? 1 : 0,
      tokensIn: input.tokensIn,
      tokensOut: input.tokensOut,
      costUsd: input.costUsd,
    },
    update: {
      conversationsCount: input.isNewConversation
        ? { increment: 1 }
        : undefined,
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
  botConfigId: string,
  monthlyQuota: number,
): Promise<QuotaReserveResult> {
  const { year, month } = currentPeriodKey()

  // 1) Asegurar que existe el row del período (insertar con count=0 si no existe).
  //    El UPDATE conditional de abajo no afecta filas inexistentes, así que necesitamos
  //    la fila creada antes. `upsert` con `update: {}` es no-op en update path → idempotente.
  await prisma.quotaUsage.upsert({
    where: { botConfigId_year_month: { botConfigId, year, month } },
    create: { botConfigId, year, month },
    update: {},
  })

  // 2) UPDATE conditional atómico: incrementa solo si está por debajo del límite.
  //    PostgreSQL serializa por fila (locked during UPDATE), así que múltiples requests
  //    concurrentes no pueden incrementar más allá del límite.
  const affected = await prisma.$executeRaw`
    UPDATE "chatbot_quota_usage"
    SET "conversationsCount" = "conversationsCount" + 1,
        "updatedAt" = NOW()
    WHERE "botConfigId" = ${botConfigId}
      AND "year" = ${year}
      AND "month" = ${month}
      AND "conversationsCount" < ${monthlyQuota}
  `

  // 3) Re-leer el contador actual para devolver al caller.
  const usage = await prisma.quotaUsage.findUnique({
    where: { botConfigId_year_month: { botConfigId, year, month } },
    select: { conversationsCount: true },
  })

  return {
    reserved: affected === 1,
    conversationsUsed: usage?.conversationsCount ?? 0,
    conversationsLimit: monthlyQuota,
    year,
    month,
  }
}
