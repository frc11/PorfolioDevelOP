import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { MessagesInboxShell } from './_components/messages-inbox-shell'
import { ConversationListLoader } from './_components/conversation-list-loader'
import { ConversationListSkeleton } from './_components/conversation-list-skeleton'

/**
 * Layout persistente de la sección Mensajes. Al vivir la lista acá (y no en cada
 * page), Next la preserva entre el índice y /[orgId]: cambiar de conversación
 * solo cambia el children (el thread), sin recargar la lista. La lista va en un
 * <Suspense> para streamear con su propio skeleton en el primer load.
 */
export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <MessagesInboxShell
      list={
        <Suspense fallback={<ConversationListSkeleton />}>
          <ConversationListLoader />
        </Suspense>
      }
    >
      {children}
    </MessagesInboxShell>
  )
}
