import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface SupportTabProps {
  clientId: string
}

export async function SupportTab({ clientId }: SupportTabProps) {
  const [tickets, recentMessages] = await Promise.all([
    prisma.ticket.findMany({
      where: { organizationId: clientId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.message.findMany({
      where: { organizationId: clientId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SupportSection title={`Tickets recientes (${tickets.length})`} href={`/admin/tickets?clientId=${clientId}`}>
        {tickets.length === 0 ? (
          <p className="text-sm italic text-zinc-500">Sin tickets</p>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-sm text-zinc-200">{ticket.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Estado: {ticket.status} · {ticket.createdAt.toLocaleDateString('es-AR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </SupportSection>

      <SupportSection title="Mensajes recientes" href={`/admin/messages?clientId=${clientId}`}>
        {recentMessages.length === 0 ? (
          <p className="text-sm italic text-zinc-500">Sin mensajes</p>
        ) : (
          <div className="space-y-2">
            {recentMessages.map((message) => (
              <div key={message.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <p className="line-clamp-2 text-sm text-zinc-200">{message.content}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {message.createdAt.toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </SupportSection>
    </div>
  )
}

function SupportSection({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium text-zinc-200">{title}</h3>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
        >
          Ver todos
          <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
        </Link>
      </div>
      {children}
    </div>
  )
}
