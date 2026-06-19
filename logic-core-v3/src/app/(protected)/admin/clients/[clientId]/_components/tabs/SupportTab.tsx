import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui'
import {
  HoverScaleCard,
  hoverTint,
} from '@/app/(protected)/admin/clients/_components/HoverScaleCard'

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
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                className="block"
              >
                <HoverScaleCard className="rounded-xl">
                  <Card padding="sm" className={`rounded-xl ${hoverTint}`}>
                    <p className="text-sm text-zinc-200">{ticket.title}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Estado: {ticket.status} · {ticket.createdAt.toLocaleDateString('es-AR')}
                    </p>
                  </Card>
                </HoverScaleCard>
              </Link>
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
              <Link
                key={message.id}
                href={`/admin/messages/${clientId}`}
                className="block"
              >
                <HoverScaleCard className="rounded-xl">
                  <Card padding="sm" className={`rounded-xl ${hoverTint}`}>
                    <p className="line-clamp-2 text-sm text-zinc-200">{message.content}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {message.createdAt.toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </p>
                  </Card>
                </HoverScaleCard>
              </Link>
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
    <Card variant="elevated" padding="lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium text-zinc-200">{title}</h3>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-400/[0.12]"
        >
          Ver todos
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>
      {children}
    </Card>
  )
}
