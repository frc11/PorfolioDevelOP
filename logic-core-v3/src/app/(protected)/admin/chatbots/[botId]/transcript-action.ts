'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getConversationMessagesForOrg } from '@/modules/chatbot/index.server'

const TranscriptSchema = z.object({
  conversationId: z.string().min(1, 'Conversación inválida.'),
})

export interface TranscriptMessage {
  id: string
  role: string
  content: string
  createdAt: string
}

// Lee el transcript de una conversación reutilizando la query org-scopeada
// existente (getConversationMessagesForOrg). Gate SUPER_ADMIN (mismo patrón que
// actions.ts). Resuelve la org de la conversación para alimentar el guard
// relacional de la query — no se toca server/admin/queries.ts.
export async function getConversationTranscriptAction(
  conversationId: string,
): Promise<{ ok: true; messages: TranscriptMessage[] } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { ok: false, error: 'Forbidden' }
  }

  const parsed = TranscriptSchema.safeParse({ conversationId })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  }

  try {
    const conv = await prisma.conversation.findUnique({
      where: { id: parsed.data.conversationId },
      select: { botConfig: { select: { organizationId: true } } },
    })
    if (!conv) return { ok: true, messages: [] }

    const rows = await getConversationMessagesForOrg(
      parsed.data.conversationId,
      conv.botConfig.organizationId,
      200,
    )

    return {
      ok: true,
      messages: rows.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo cargar el transcript.',
    }
  }
}
