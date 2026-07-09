/**
 * Detección de violación de unique (P2002) para los caminos de idempotencia
 * del motor (B1-S1). El helper de aislamiento traduce P2025/P2003 a
 * IsolationNotFoundError pero deja pasar P2002 tal cual: acá se clasifica.
 * Importa SOLO tipos/errores de @prisma/client — el cliente de datos sigue
 * siendo exclusivo de src/lib/isolation/ (frontera del módulo).
 */
import { Prisma } from '@prisma/client'

export function isUniqueViolation(error: unknown, field?: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return false
  }
  if (field === undefined) return true
  const target: unknown = error.meta?.target
  if (Array.isArray(target)) return target.some((entry) => entry === field)
  if (typeof target === 'string') return target.includes(field)
  return false
}
