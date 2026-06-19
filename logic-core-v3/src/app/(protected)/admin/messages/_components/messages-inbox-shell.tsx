'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AdminBackButton } from '../../_components/AdminBackButton'
import { activeOrgIdFromPath } from './active-org'

type MessagesInboxShellProps = {
  list: ReactNode
  children: ReactNode
}

/**
 * Shell persistente del inbox (vive en messages/layout.tsx). Mantiene el layout
 * viewport-fijo del lote 1 (la página no scrollea; lista y thread scrollean
 * interno, composer al fondo) y, al ser layout, Next preserva la lista entre
 * navegaciones: cambiar de conversación solo reemplaza el children (el thread),
 * sin recargar ni parpadear la lista.
 *
 * El responsive depende de si estamos en el índice o en una conversación, que se
 * deriva del pathname (el layout no recibe el orgId como param):
 *   - índice (mobile): solo la lista.        - índice (desktop): lista + placeholder.
 *   - detalle (mobile): solo el thread + volver. - detalle (desktop): lista + thread.
 */
export function MessagesInboxShell({ list, children }: MessagesInboxShellProps) {
  const pathname = usePathname()
  // isDetail = hay un orgId real en la URL (no por simple prefijo, que trataría
  // un '/admin/messages/' con trailing-slash como detalle y ocultaría la lista).
  const isDetail = activeOrgIdFromPath(pathname) !== null

  return (
    <section className="flex h-[calc(100dvh_-_228px)] min-h-0 flex-col gap-4 overflow-hidden sm:h-[calc(100dvh_-_200px)]">
      {isDetail ? (
        <div className="shrink-0 lg:hidden">
          <AdminBackButton href="/admin/messages" label="Volver a mensajes" />
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-rows-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className={`min-h-0 ${isDetail ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
          {list}
        </div>
        <div className={`min-h-0 ${isDetail ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
          {children}
        </div>
      </div>
    </section>
  )
}
