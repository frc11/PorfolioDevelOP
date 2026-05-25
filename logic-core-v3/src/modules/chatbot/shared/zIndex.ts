/**
 * Centralized z-index tokens for the chatbot widget.
 *
 * Designed to layer above typical host site UI (nav, sticky headers, common
 * overlays usually live in the 100-9999 range) while leaving headroom for
 * legitimate host modals/full-screen overlays that may need to render above
 * the widget (e.g. a payment iframe the user opens from the chat).
 *
 * Do NOT raise these to int32 max (2_147_483_647). A widget that always wins
 * blocks legitimate host UI and is hostile to the embedder.
 *
 * Order (back → front): backdrop < bubble < panel < tooltip.
 * The tooltip sits above the panel intentionally: when the panel is closed
 * the bubble shows it; when open, the panel covers the area so the order
 * does not matter visually, but the token still orders cleanly.
 */
export const CHATBOT_Z_INDEX = {
  /** Backdrop dimming the host page when the panel is open. */
  backdrop: 2_147_000_000,
  /** Floating bubble (DOM in host site or in develOP's own site). */
  bubble: 2_147_000_100,
  /** Chat panel window. */
  panel: 2_147_000_200,
  /** Proactive tooltip attached to the bubble. */
  tooltip: 2_147_000_300,
} as const

export type ChatbotZIndexToken = keyof typeof CHATBOT_Z_INDEX
