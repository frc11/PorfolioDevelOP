/**
 * Q1.1 — Lectura canónica desde la DB. El texto del assistant y las toolCalls
 * (con sus `input`) se leen de las filas que `handleChatRequest.onFinish`
 * persiste (`ChatMessage.content` + `ChatMessage.toolCalls`), no del SSE.
 * Patrón `scripts/regression/run-baseline.ts` (`waitForAssistantMessage` +
 * `parseToolCalls`).
 */
import type { PrismaClient, Prisma } from '@prisma/client'
import type { LeadSnapshot, ToolCallRecord } from './types'

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/**
 * Normaliza el JSON `toolCalls` persistido a `{toolName, input}[]`. Lee
 * `toolName` y `input ?? args` (la SDK escribe `input`; `args` es defensivo).
 */
export function parseToolCalls(raw: Prisma.JsonValue | null | undefined): ToolCallRecord[] {
  if (!raw || !Array.isArray(raw)) return []
  const out: ToolCallRecord[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) continue
    const obj = item as Record<string, Prisma.JsonValue>
    const name = typeof obj.toolName === 'string' ? obj.toolName : '(unknown)'
    let input: Record<string, unknown> = {}
    if (obj.input && typeof obj.input === 'object' && !Array.isArray(obj.input)) {
      input = obj.input as Record<string, unknown>
    } else if (obj.args && typeof obj.args === 'object' && !Array.isArray(obj.args)) {
      input = obj.args as Record<string, unknown>
    }
    out.push({ toolName: name, input })
  }
  return out
}

/**
 * Poll hasta que `onFinish` haya persistido el assistant message N-ésimo
 * (`expectedAssistantCount`), o hasta el timeout. Devuelve `null` si no
 * apareció — el caller lo reporta como fallo del turno (sin reintentar).
 */
export async function waitForAssistantMessage(
  prisma: PrismaClient,
  sessionId: string,
  expectedAssistantCount: number,
  timeoutMs = 30_000,
): Promise<{ content: string; toolCalls: ToolCallRecord[]; conversationId: string } | null> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const conv = await prisma.conversation.findUnique({
      where: { sessionId },
      include: {
        // El rol persistido es UPPERCASE (`ChatMessageRole.ASSISTANT`).
        messages: { where: { role: 'ASSISTANT' }, orderBy: { createdAt: 'asc' } },
      },
    })
    if (conv && conv.messages.length >= expectedAssistantCount) {
      const msg = conv.messages[expectedAssistantCount - 1]
      return {
        content: msg.content,
        toolCalls: parseToolCalls(msg.toolCalls),
        conversationId: conv.id,
      }
    }
    await sleep(500)
  }
  return null
}

/** Snapshot final: conversationId + lead capturado (si lo hubo). */
export async function readConversationSnapshot(
  prisma: PrismaClient,
  sessionId: string,
): Promise<{ conversationId: string | null; lead: LeadSnapshot | null }> {
  const conv = await prisma.conversation.findUnique({
    where: { sessionId },
    include: { lead: true },
  })
  if (!conv) return { conversationId: null, lead: null }
  const lead: LeadSnapshot | null = conv.lead
    ? {
        name: conv.lead.name,
        email: conv.lead.email,
        phone: conv.lead.phone,
        intent: conv.lead.intent,
        category: conv.lead.category,
        requestedAppointment: conv.lead.requestedAppointment,
        mentionedFinancing: conv.lead.mentionedFinancing,
        mentionedTradeIn: conv.lead.mentionedTradeIn,
        askedSpecificModel: conv.lead.askedSpecificModel,
        providedPhone: conv.lead.providedPhone,
        providedEmail: conv.lead.providedEmail,
        score: conv.lead.score,
        classification: conv.lead.classification,
      }
    : null
  return { conversationId: conv.id, lead }
}
