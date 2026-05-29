import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'

export interface RateLimitInput {
  key: string
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

interface UpsertRow {
  count: number
  expiresAt: Date
}

// Rate limit compartido entre lambdas via tabla Neon (B14.1).
//
// Atomicidad: la única query es un UPSERT con ON CONFLICT, que adquiere un
// row lock en Postgres. Dos lambdas concurrentes que peguen la misma key se
// serializan en la fila → cero race. Reemplaza el limiter in-memory por proceso
// que era evadible rotando lambdas.
//
// TTL / cleanup lazy: si la ventana del registro existente ya expiró, el mismo
// UPSERT resetea count=1 y muda la ventana. No hay job de limpieza — la tabla
// no acumula buckets "muertos" dentro de la misma ventana porque la siguiente
// request los pisa. Queda un índice en expiresAt por si más adelante hace
// falta purgar registros de keys que nunca volvieron.
//
// Identificadores entre comillas dobles ("windowStart", "expiresAt") porque
// Prisma genera columnas camelCase y Postgres es case-sensitive con quoted
// identifiers. El @@map sólo afecta el nombre de la tabla, no las columnas.
export async function checkRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const { key, limit, windowMs } = input

  const now = new Date()
  const expiresAt = new Date(now.getTime() + windowMs)
  const id = randomUUID()

  const rows = await prisma.$queryRawUnsafe<UpsertRow[]>(
    `
    INSERT INTO rate_limit (id, key, count, "windowStart", "expiresAt", "createdAt", "updatedAt")
    VALUES ($1, $2, 1, $3, $4, $3, $3)
    ON CONFLICT (key) DO UPDATE SET
      count         = CASE WHEN rate_limit."expiresAt" <= $3 THEN 1
                           ELSE rate_limit.count + 1 END,
      "windowStart" = CASE WHEN rate_limit."expiresAt" <= $3 THEN $3
                           ELSE rate_limit."windowStart" END,
      "expiresAt"   = CASE WHEN rate_limit."expiresAt" <= $3 THEN $4
                           ELSE rate_limit."expiresAt" END,
      "updatedAt"   = $3
    RETURNING count, "expiresAt"
    `,
    id,
    key,
    now,
    expiresAt,
  )

  const row = rows[0]
  if (!row) {
    // El UPSERT con RETURNING siempre devuelve una fila. Si no la hay,
    // hay un problema de conexión o de schema — fail closed (rechazar)
    // antes que fallar abierto y dejar pasar abuso.
    return { allowed: false, remaining: 0, resetAt: now.getTime() + windowMs }
  }

  const count = Number(row.count)
  const resetAt = row.expiresAt.getTime()

  if (count > limit) {
    return { allowed: false, remaining: 0, resetAt }
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - count),
    resetAt,
  }
}
