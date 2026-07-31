import type { ToolCallContext } from './types'
import { buildCaptureLeadTool } from './captureLead'
import { buildOfferHandoffOptionsTool } from './offerHandoffOptions'
import { buildShowWhatsappHandoffTool } from './showWhatsappHandoff'
import { buildNavigateToPageTool } from './navigateToPage'
import { buildConfirmContactRequestTool } from './confirmContactRequest'

/**
 * Slug → builder de cada tool. El builder recibe el contexto y devuelve
 * la tool armada con su closure. Centraliza el catálogo así el filter de
 * B4.2 no se desincroniza con el set real disponible.
 */
const TOOL_BUILDERS = {
  capture_lead: (ctx: ToolCallContext) => buildCaptureLeadTool(ctx),
  offer_handoff_options: (_ctx: ToolCallContext) => buildOfferHandoffOptionsTool(),
  show_whatsapp_handoff: (ctx: ToolCallContext) => buildShowWhatsappHandoffTool(ctx),
  navigate_to_page: (_ctx: ToolCallContext) => buildNavigateToPageTool(),
  // CONTACT-PATH — espejo server-side de `show_whatsapp_handoff` para el camino
  // "que me contacten". Su `execute` es lo que fuerza el step final: sin un tool
  // server-side ese camino cerraba sin texto (ver confirmContactRequest.ts).
  confirm_contact_request: (ctx: ToolCallContext) => buildConfirmContactRequestTool(ctx),
} as const

export type ToolSlug = keyof typeof TOOL_BUILDERS

/** Lista canónica de slugs disponibles (en orden de declaración). */
export const ALL_TOOL_SLUGS: readonly ToolSlug[] = Object.keys(
  TOOL_BUILDERS,
) as ToolSlug[]

/**
 * Returns the tool set bound to the given conversation context.
 *
 * Si se pasa `enabledTools`, sólo devuelve las que matchean Y existen
 * en el catálogo. Slugs desconocidos en `enabledTools` se ignoran
 * silenciosamente (cero crash). Si no se pasa o es `null`, devuelve
 * el set completo (comportamiento pre-B4.2).
 *
 * B4.2 — gating de tools por plan:
 *   const plan = await getPlanForOrg(orgId)
 *   const tools = getTools(ctx, plan.tools)  // ← filtra por slugs del plan
 */
export function getTools(
  ctx: ToolCallContext,
  enabledTools: readonly string[] | null = null,
) {
  const allow: ReadonlySet<string> | null =
    enabledTools === null ? null : new Set(enabledTools)

  const result: Partial<Record<ToolSlug, ReturnType<(typeof TOOL_BUILDERS)[ToolSlug]>>> = {}

  for (const slug of ALL_TOOL_SLUGS) {
    if (allow !== null && !allow.has(slug)) continue
    result[slug] = TOOL_BUILDERS[slug](ctx)
  }

  return result
}

/**
 * Type of the tool record returned by getTools.
 * Useful for typing the API route handler.
 */
export type ChatbotTools = ReturnType<typeof getTools>
