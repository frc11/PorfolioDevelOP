import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getTicketById } from '../_actions/ticket.actions'
import { TicketChat } from '../_components/ticket-chat'

type TicketDetailPageProps = {
  params: Promise<{
    ticketId: string
  }>
}

export default async function AgencyOsTicketDetailPage({ params }: TicketDetailPageProps) {
  const { ticketId } = await params
  const ticketResult = await getTicketById(ticketId)

  if (!ticketResult.success) {
    notFound()
  }

  return (
    <section className="space-y-5">
      <Link
        href="/admin/os/tickets"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a tickets
      </Link>

      <TicketChat ticket={ticketResult.data} />
    </section>
  )
}
