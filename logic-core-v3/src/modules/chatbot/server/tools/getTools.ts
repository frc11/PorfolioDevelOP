import type { ToolCallContext } from './types'
import { buildCaptureLeadTool } from './captureLead'
import { buildOfferHandoffOptionsTool } from './offerHandoffOptions'
import { buildShowWhatsappHandoffTool } from './showWhatsappHandoff'
import { buildNavigateToPageTool } from './navigateToPage'

/**
 * Returns the complete tool set bound to the given conversation context.
 *
 * Server-side tools (capture_lead) have closures over `ctx` for DB writes.
 * Client-side tools (the other 3) are stateless and don't need context.
 *
 * Usage:
 *   const tools = getTools({ conversationId, botConfigId, organizationId })
 *   const result = streamText({ model, system, messages, tools })
 */
export function getTools(ctx: ToolCallContext) {
  return {
    capture_lead: buildCaptureLeadTool(ctx),
    offer_handoff_options: buildOfferHandoffOptionsTool(),
    show_whatsapp_handoff: buildShowWhatsappHandoffTool(),
    navigate_to_page: buildNavigateToPageTool(),
  }
}

/**
 * Type of the tool record returned by getTools.
 * Useful for typing the API route handler.
 */
export type ChatbotTools = ReturnType<typeof getTools>
