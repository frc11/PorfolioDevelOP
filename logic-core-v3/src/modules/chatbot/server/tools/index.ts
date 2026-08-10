// Types
export type {
  ToolCallContext,
  ToolExecuteResult,
  CaptureLeadResult,
  InferToolInput,
} from './types'

// Factory (main entry point for consumers)
export { getTools, ALL_TOOL_SLUGS, CARD_RENDERING_TOOL_CONNECTORS } from './getTools'
export type { ChatbotTools, ToolSlug } from './getTools'

// Individual tool builders (rarely needed, exposed for testing)
export { buildCaptureLeadTool, CAPTURE_LEAD_DESCRIPTION, captureLeadInputSchema } from './captureLead'
export type { CaptureLeadInput } from './captureLead'

export { buildOfferHandoffOptionsTool, OFFER_HANDOFF_OPTIONS_DESCRIPTION, offerHandoffOptionsInputSchema } from './offerHandoffOptions'
export type { OfferHandoffOptionsInput } from './offerHandoffOptions'

export { buildShowWhatsappHandoffTool, SHOW_WHATSAPP_HANDOFF_DESCRIPTION, showWhatsappHandoffInputSchema } from './showWhatsappHandoff'
export type { ShowWhatsappHandoffInput } from './showWhatsappHandoff'

export { buildNavigateToPageTool, NAVIGATE_TO_PAGE_DESCRIPTION, navigateToPageInputSchema, VALID_PATHS } from './navigateToPage'
export type { NavigateToPageInput, ValidPath } from './navigateToPage'
