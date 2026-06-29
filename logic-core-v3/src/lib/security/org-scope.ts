/**
 * Decisión de autorización PURA para un `organizationId` recibido del cliente.
 *
 * Invariante de seguridad del producto: la org NUNCA se confía desde un
 * parámetro del cliente — siempre se deriva de la sesión server-side
 * (`resolveOrgId()`), y si además llega un `organizationId` por parámetro debe
 * coincidir con el de la sesión. Si no coincide, se RECHAZA (cross-tenant).
 *
 * Se mantiene puro (sin leer la sesión adentro) a propósito: el caller hace el
 * `await resolveOrgId()` y pasa ambos valores, así esta decisión es trivial de
 * testear sin DB ni request context (ver `idor-tokens.invariant.ts`).
 *
 * @param sessionOrgId   org derivada de la sesión (`resolveOrgId()`), o `null`
 *                       si no hay sesión / rol válido.
 * @param requestedOrgId org que mandó el cliente (NO confiable), o `null` si la
 *                       action no recibe ninguno.
 * @returns la org de la SESIÓN sobre la que se puede operar, o `null` para
 *          rechazar (sin sesión, o el parámetro no coincide → acceso cruzado).
 */
export function resolveScopedOrgId(
  sessionOrgId: string | null,
  requestedOrgId: string | null,
): string | null {
  if (!sessionOrgId) return null
  if (requestedOrgId !== null && requestedOrgId !== sessionOrgId) return null
  return sessionOrgId
}
