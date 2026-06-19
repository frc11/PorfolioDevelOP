import { redirect } from 'next/navigation'
import { AuditActionType } from '@prisma/client'
import { auth } from '@/auth'
import { getAuditLogStats, listAuditLog } from '@/lib/audit-log-queries'
import { AuditLogClient } from './_components/AuditLogClient'

export default async function AuditLogPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  const [initial, stats] = await Promise.all([
    listAuditLog(undefined, 0, 10),
    getAuditLogStats(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Sistema
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Audit log
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Registro de acciones administrativas y cambios sensibles.
        </p>
      </div>

      <AuditLogClient
        initialEntries={initial.entries}
        initialHasMore={initial.hasMore}
        actionTypes={Object.values(AuditActionType)}
        stats={stats}
      />
    </div>
  )
}
