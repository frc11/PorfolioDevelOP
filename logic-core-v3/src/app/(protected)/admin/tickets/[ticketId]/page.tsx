import { notFound } from 'next/navigation'
import { AdminBackButton } from '../../_components/AdminBackButton'
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
      <AdminBackButton href="/admin/tickets" label="Volver a tickets" />

      <TicketChat ticket={ticketResult.data} />
    </section>
  )
}
