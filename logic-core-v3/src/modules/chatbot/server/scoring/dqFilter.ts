/**
 * B5.3 — Helper de filtrado DQ para queries de leads.
 *
 * Los DQ NO se borran (auditoría). Se filtran SOLO en queries que alimenten:
 *   - métricas de conversión visibles al cliente,
 *   - listado "leads calientes" (vista 5B),
 *   - reportes semanales del cliente.
 *
 * Listados admin de auditoría / soporte / debugging deben mostrar TODO,
 * incluidos los DQ — no apliques este filtro ahí.
 *
 * Diseñado para componer con AND implícito en `where`:
 *
 *   prisma.chatbotLead.findMany({
 *     where: { botConfigId, ...excludeDqWhere() },
 *   })
 */

import type { Prisma } from '@prisma/client'

export function excludeDqWhere(): Prisma.ChatbotLeadWhereInput {
  return {
    NOT: { classification: 'dq' },
  }
}
