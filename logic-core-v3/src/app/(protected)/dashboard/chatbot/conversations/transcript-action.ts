'use server'

import { z } from 'zod'
import {
  getClientChatbotSession,
  getConversationMessagesForOrg,
} from '@/modules/chatbot/index.server'

const TranscriptSchema = z.object({
  conversationId: z.string().min(1, 'Conversación inválida.'),
})

export interface TranscriptMessage {
  id: string
  role: string
  content: string
  createdAt: string
}

/**
 * Transcript de una conversación para el DASHBOARD del cliente. Reusa la query
 * org-scopeada `getConversationMessagesForOrg` derivando el orgId de la SESIÓN
 * (no de un param de URL): su guard relacional hace que cualquier conversationId
 * de OTRA org devuelva [] (anti-IDOR), sin lookup de ownership extra. NO reusa la
 * action del admin (gateada a SUPER_ADMIN) ni toca ConversationsTable.
 *
 * Firma calzada con la prop `fetchTranscript` de la tabla: devuelve el array y
 * lanza ante error; ConversationsTable captura el throw → muestra su estado de
 * error genérico (el mensaje del throw nunca llega a la UI).
 */
export async function getClientConversationTranscriptAction(
  conversationId: string,
): Promise<TranscriptMessage[]> {
  const session = await getClientChatbotSession()
  if (!session) {
    throw new Error('Forbidden')
  }

  const parsed = TranscriptSchema.safeParse({ conversationId })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos.')
  }

  const rows = await getConversationMessagesForOrg(
    parsed.data.conversationId,
    session.organization.id,
    200,
  )

  return rows.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }))
}
