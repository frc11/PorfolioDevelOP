import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAgencyClients } from '@/actions/agency-actions'
import { CommandCenterClient } from '@/components/admin/agency-dashboard/CommandCenterClient'

export default async function AgencyDashboardPage() {
  const session = await auth()

  // Strict role verification implemented here
  if (session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard') // Or /login if preferred
  }

  // Fetch all clients with their active project and pending tasks (using the server fetcher)
  const clients = await getAgencyClients()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Agency Command Center</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Control centralizado de clientes, aprobaciones y bóveda digital.
        </p>
      </div>

      {/* Main Interactive Client Component */}
      <CommandCenterClient initialClients={clients} />
    </div>
  )
}
