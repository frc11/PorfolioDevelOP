import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { BulkImportClient } from './BulkImportClient'

export default async function BulkImportPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Clientes</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Bulk Import</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Subí un CSV con varios clientes para onboardearlos en lote.
        </p>
      </div>

      <BulkImportClient />
    </div>
  )
}
