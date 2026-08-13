'use client'

import { type ReactNode } from 'react'
import { z } from 'zod'
import { HandoffOptionsCard } from './HandoffOptionsCard'
import { WhatsappHandoffCard } from './WhatsappHandoffCard'
import { NavigateToPageCard } from './NavigateToPageCard'
import type { PublicBotConfig } from '../../shared/publicConfig'
import type { ToolCallInUIMessage } from '../chat/types'

// Lightweight client-side validators — mirror the Zod schemas of S4.
// We don't import the server schemas to keep the bundle small.

const handoffOptionsSchema = z.object({
  preamble: z.string(),
})

const whatsappHandoffSchema = z.object({
  prefilledMessage: z.string(),
})

const navigateToPageSchema = z.object({
  path: z.string(),
  reason: z.string(),
})

export interface ToolCallCallbacks {
  onSelectWhatsapp: () => void
  onSelectCallback: () => void
  onNavigate: (path: string) => void
}

/**
 * Returns the appropriate React node for a tool call invocation
 * in the chat stream. Returns null if the tool is unknown or
 * the input validation fails.
 */
export function renderToolCall(
  toolCall: ToolCallInUIMessage,
  config: PublicBotConfig,
  callbacks: ToolCallCallbacks,
  // R3 (CARRERAS) — true mientras el turno sigue en vuelo. Hoy solo gatea los
  // botones de HandoffOptionsCard: es la única card cuyas acciones MANDAN un
  // mensaje (doble click = turno duplicado y doble costo de Vertex).
  busy = false
): ReactNode {
  switch (toolCall.toolName) {
    case 'offer_handoff_options': {
      const parsed = handoffOptionsSchema.safeParse(toolCall.input)
      if (!parsed.success) return null
      return (
        <HandoffOptionsCard
          config={config}
          preamble={parsed.data.preamble}
          onSelectWhatsapp={callbacks.onSelectWhatsapp}
          onSelectCallback={callbacks.onSelectCallback}
          disabled={busy}
        />
      )
    }
    case 'show_whatsapp_handoff': {
      const parsed = whatsappHandoffSchema.safeParse(toolCall.input)
      if (!parsed.success) return null
      return (
        <WhatsappHandoffCard
          config={config}
          prefilledMessage={parsed.data.prefilledMessage}
        />
      )
    }
    case 'navigate_to_page': {
      const parsed = navigateToPageSchema.safeParse(toolCall.input)
      if (!parsed.success) return null
      return (
        <NavigateToPageCard
          config={config}
          path={parsed.data.path}
          reason={parsed.data.reason}
          onNavigate={callbacks.onNavigate}
        />
      )
    }
    default:
      return null
  }
}
