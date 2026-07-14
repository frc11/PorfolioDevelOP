/**
 * src/lib/isolation — fuente única de aislamiento multi-tenant del repo.
 *
 * Generalización del patrón de LeadOS (src/lib/leados/isolation.ts) al eje
 * organizationId, para el Motor WhatsApp (B0) y los modelos del chatbot que
 * B0-S3 porta. Es la única puerta a Prisma para los modelos cubiertos:
 * src/modules/motor tiene PROHIBIDO importar @/lib/prisma (eslint, B0-S1).
 *
 * Qué se ADOPTA de LeadOS:
 *   - Fuente única del `where` de aislamiento: donde LeadOS define
 *     ownedListWhere(userId) / ownedLeadWhere(leadId, userId), acá cada modelo
 *     tiene UN scopeWhere(organizationId) en registry.ts. Si el aislamiento
 *     cambia, cambia en un solo lugar.
 *   - Anti-IDOR de lectura por id (espejo de ownedLeadWhere: id + dueño en la
 *     misma query): findById(id) compone { id } con el scope y devuelve null
 *     para un id de otra org — indistinguible de inexistente, sin leak de
 *     existencia (mismo criterio que getLeadByIdForOrg del chatbot).
 *   - Anti-IDOR de ESCRITURA (espejo de ownedLeadCreateData: el dueño se
 *     deriva de la sesión, jamás del cliente): create() fija organizationId
 *     desde el scope; un organizationId ajeno en el data lanza IsolationError.
 *
 * Qué se GENERALIZA (y por qué diverge):
 *   - Eje de aislamiento: setter (assignedToId / setterId) → organización.
 *   - LeadOS es un módulo PURO: exporta fragmentos y el caller los pasa a su
 *     propio prisma (las queries viven en ownership.ts). Acá los dos roles se
 *     FUSIONAN: el helper contiene el acceso a datos, porque para el motor el
 *     scope no es opt-in del caller — es la única puerta disponible.
 *   - De fragmentos sueltos a accessors por modelo: forOrg(orgId).modelo.*
 *     inyecta el scope de forma no-sobreescribible (el where del caller se
 *     compone con AND, nunca reemplaza; update/delete por id llevan guard
 *     atómico; el re-parenting de FKs scoped está prohibido en update).
 *   - Modelos con scope RELACIONAL (chatbot: Conversation vía botConfig,
 *     ChatMessage vía conversation.botConfig): la cadena hasta la org se
 *     resuelve acá adentro — el caller solo da organizationId.
 *   - Escape explícito y greppable para lo legítimamente global:
 *     unsafeGlobalQuery(reason, fn). `grep -r unsafeGlobal src/` enumera
 *     todos los accesos cross-org del repo.
 *
 * Cobertura: WabaChannel, ContactIdentity, MotorConversation, MotorMessage
 * (motor) + BotConfig, Conversation, ChatMessage, ChatbotLead, CrmIntegration
 * (chatbot, port en B0-S3). Fuera de este directorio, prisma directo sobre
 * estos modelos solo queda en el código legacy del chatbot hasta B0-S3;
 * LeadOS conserva su helper propio (otro eje de aislamiento, no se toca).
 *
 * Test negativo real (dos orgs con datos solapados, A no alcanza B):
 * tests/integration/motor-isolation.spec.ts.
 */
import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { buildScope } from './registry'
import { IsolationError } from './scoped-model'

export { IsolationError, IsolationNotFoundError } from './scoped-model'

/**
 * ONF-1 — Accessors scoped SIN la envoltura transaccional: el tipo del `tx`
 * que recibe el callback de forOrg().$transaction. Exportado para que un
 * módulo pueda tipar funciones que aceptan "el scope o el tx de una
 * transacción en curso" (ej. incrementQuota dentro del reconcile del turno).
 */
export type { OrgScopeAccessors } from './registry'

/** Scope de una organización: accessors por modelo con el tenant ya fijado. */
export type OrgScope = ReturnType<typeof buildScope>

/**
 * Punto de entrada del aislamiento. Toda lectura/escritura scoped exige la
 * organización acá — sin organizationId no hay accessors, y no compila: el
 * parámetro es obligatorio en tipos.
 */
export function forOrg(organizationId: string): OrgScope {
  if (typeof organizationId !== 'string' || organizationId.trim().length === 0) {
    throw new IsolationError('forOrg: organizationId es obligatorio y no puede ser vacío.')
  }
  return buildScope(organizationId)
}

/**
 * Escape explícito para lo legítimamente GLOBAL (alta de tenants, crons
 * cross-org, tooling admin). El `reason` es obligatorio también en tipos:
 * sin él no compila; vacío, lanza. El nombre está elegido para grep:
 * `grep -r unsafeGlobal src/` lista todos los usos del escape.
 */
export async function unsafeGlobalQuery<T>(
  reason: string,
  fn: (client: PrismaClient) => Promise<T>,
): Promise<T> {
  if (typeof reason !== 'string' || reason.trim().length === 0) {
    throw new IsolationError('unsafeGlobalQuery: el reason es obligatorio (auditable y greppable).')
  }
  return fn(prisma)
}
