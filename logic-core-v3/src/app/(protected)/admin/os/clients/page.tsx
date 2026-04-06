import { Building2 } from 'lucide-react'
import { ClientList } from './_components/client-list'
import type { ClientCardData } from './_components/client-card'
import { getClientHealthScore, listClients } from './_actions/client.actions'

export default async function AgencyOsClientsPage() {
  const result = await listClients()

  let clients: ClientCardData[] = []

  if (result.success) {
    clients = await Promise.all(
      result.data.map(async (client) => {
        const healthScoreResult = await getClientHealthScore(client.id)
        const primaryUser = client.users[0] ?? null

        return {
          id: client.id,
          companyName: client.companyName,
          primaryUser: primaryUser
            ? {
                name: primaryUser.name,
                email: primaryUser.email,
              }
            : null,
          subscription: client.subscription
            ? {
                status: client.subscription.status,
                planName: client.subscription.planName,
              }
            : null,
          healthScore: healthScoreResult.success ? healthScoreResult.data.score : 0,
          counts: {
            projects: client._count.projects,
            tickets: client._count.tickets,
            messages: client._count.messages,
          },
        } satisfies ClientCardData
      })
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Agency OS / Clientes
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Salud y operacion del portal
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              Revisa suscripciones, actividad, tickets y acceso directo a cada cuenta del
              portal desde una sola vista.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
            <Building2 className="h-4 w-4 text-cyan-300" />
            <span>{clients.length} cliente(s) cargados</span>
          </div>
        </div>
      </div>

      {!result.success ? (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {result.error}
        </div>
      ) : (
        <ClientList clients={clients} />
      )}
    </section>
  )
}
