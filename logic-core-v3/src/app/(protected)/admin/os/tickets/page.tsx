import { LifeBuoy } from 'lucide-react'
import { listTickets } from './_actions/ticket.actions'
import { TicketList } from './_components/ticket-list'

export default async function AgencyOsTicketsPage() {
  const ticketResult = await listTickets()

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
            <LifeBuoy className="h-7 w-7" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Agency OS / Soporte
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Tickets</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Bandeja unificada de conversaciones de soporte del portal, con seguimiento por estado y respuesta directa desde Agency OS.
            </p>
          </div>
        </div>
      </div>

      {!ticketResult.success ? (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {ticketResult.error}
        </div>
      ) : (
        <TicketList tickets={ticketResult.data} />
      )}
    </section>
  )
}
