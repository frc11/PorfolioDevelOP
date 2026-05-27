import { History } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { SyncHistoryEntry } from '@/modules/chatbot/server/dashboard/getCrmSyncHistory'
import { CrmSyncBadge } from './CrmSyncBadge'
import { RetrySyncButton } from './RetrySyncButton'

interface CrmSyncHistoryListProps {
  entries: SyncHistoryEntry[]
}

// TZ-AR: orden por capturedAt/attemptedAt formateado en hora Argentina (B5.5 standard).
const ARG_DATETIME_FMT = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

function formatAttemptedAt(date: Date): string {
  return ARG_DATETIME_FMT.format(date)
}

/**
 * B5.8 — Lista del historial de syncs (a nivel org o a nivel lead).
 *
 * Cada entry ya viene con status EFECTIVO (PENDING/RETRYING viejos
 * reportados como FAILED por getEffectiveSyncStatus en el server action).
 *
 * Sin paginación interna por ahora — el server action ya limita a 10/20.
 * Si crece volumen, se agrega "Ver más" con cursor (deuda).
 */
export function CrmSyncHistoryList({ entries }: CrmSyncHistoryListProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Todavía no hay sincronizaciones"
        description="Cuando el chatbot capture un lead, va a aparecer acá el resultado del sync a tu CRM."
        size="sm"
      />
    )
  }

  return (
    <ul className="divide-y divide-white/[0.06]" aria-label="Historial de sincronizaciones">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-start justify-between gap-3 py-3 text-sm"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="pt-0.5">
              <CrmSyncBadge status={entry.status} />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="text-zinc-300">
                {formatAttemptedAt(entry.attemptedAt)}
                {entry.attemptNumber > 1 && (
                  <span className="ml-2 text-xs text-zinc-500">
                    · {entry.attemptNumber} intentos
                  </span>
                )}
                {entry.durationMs !== null && entry.status !== 'PENDING' && (
                  <span className="ml-2 text-xs text-zinc-500">
                    · {entry.durationMs}ms
                  </span>
                )}
              </div>
              {entry.status === 'FAILED' && entry.errorMessage && (
                <div
                  className="truncate text-xs text-red-400/80"
                  title={entry.errorMessage}
                >
                  {entry.errorMessage}
                </div>
              )}
              {entry.status === 'SUCCESS' && entry.httpStatus !== null && (
                <div className="text-xs text-zinc-500">HTTP {entry.httpStatus}</div>
              )}
            </div>
          </div>
          {entry.status === 'FAILED' && <RetrySyncButton leadId={entry.leadId} />}
        </li>
      ))}
    </ul>
  )
}
