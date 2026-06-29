'use client'

import { useActionState, useState } from 'react'
import { replyToTicketAction } from '@/lib/tickets/actions'
import type { ActionResult } from '@/lib/action-utils'
import { ClientChatComposer } from './ClientChatComposer'

/**
 * Composer de respuesta del ticket. Reusa el molde compartido
 * (ClientChatComposer: emoji + autogrow + Enter-para-enviar) y conecta SU
 * propio send-path (replyToTicketAction), que revalida el path del ticket para
 * mostrar el mensaje nuevo. NO comparte datos con Mensajes.
 */
export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [content, setContent] = useState('')
  const [state, action, isPending] = useActionState<ActionResult<{ id: string }> | null, FormData>(
    async (_prev, formData) => {
      const value = String(formData.get('content') ?? '')
      return replyToTicketAction({ ticketId, content: value })
    },
    null,
  )

  return (
    <ClientChatComposer
      value={content}
      onValueChange={setContent}
      action={action}
      isPending={isPending}
      state={state}
      placeholder="Escribí tu respuesta..."
      helperText="El equipo de develOP será notificado de inmediato. Respuesta asíncrona estándar en menos de 24hs."
    />
  )
}
