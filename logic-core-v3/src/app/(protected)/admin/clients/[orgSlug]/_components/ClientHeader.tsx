import { Building2 } from 'lucide-react'
import { AdminBreadcrumbs } from '@/app/(protected)/admin/_components/AdminBreadcrumbs'
import { ClientSwitcher } from './ClientSwitcher'
import { ImpersonateButton } from './ImpersonateButton'

interface ClientHeaderProps {
  client: {
    id: string
    companyName: string
    slug: string
    siteUrl: string | null
    whatsapp: string | null
    botConfig: {
      isActive: boolean
      botName: string
      _count?: { conversations: number; leads: number }
    } | null
    subscription: { status: string; planName: string } | null
    _count: {
      projects: number
      clientAssets: number
      tickets: number
      messages: number
    }
  }
  allClients: Array<{ id: string; name: string; slug: string }>
}

export function ClientHeader({ client, allClients }: ClientHeaderProps) {
  return (
    <div className="space-y-4">
      <AdminBreadcrumbs
        items={[
          { label: 'Clientes', href: '/admin/clients' },
          { label: client.companyName },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden rounded-2xl bg-cyan-400/10 p-3 sm:block">
            <Building2 className="h-6 w-6 text-cyan-300" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="mb-3">
              <ClientSwitcher
                currentClientId={client.id}
                currentClientName={client.companyName}
                clients={allClients}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Cliente
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              {client.companyName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
              <span>
                Slug: <span className="font-mono text-zinc-300">{client.slug}</span>
              </span>
              {client.subscription && (
                <>
                  <span className="text-zinc-700">/</span>
                  <span>
                    {client.subscription.planName} ({client.subscription.status})
                  </span>
                </>
              )}
              {client.siteUrl && (
                <>
                  <span className="text-zinc-700">/</span>
                  <a
                    href={client.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    Website
                  </a>
                </>
              )}
              {client.whatsapp && (
                <>
                  <span className="text-zinc-700">/</span>
                  <span>WhatsApp: {client.whatsapp}</span>
                </>
              )}
              {client.botConfig && (
                <>
                  <span className="text-zinc-700">/</span>
                  <span>
                    Bot:{' '}
                    <span
                      className={
                        client.botConfig.isActive
                          ? 'text-emerald-400'
                          : 'text-zinc-500'
                      }
                    >
                      {client.botConfig.botName}{' '}
                      {client.botConfig.isActive ? '(activo)' : '(pausado)'}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
            <StatChip label="Proyectos" value={client._count.projects} />
            <StatChip label="Archivos" value={client._count.clientAssets} />
            <StatChip label="Tickets" value={client._count.tickets} />
            <StatChip label="Mensajes" value={client._count.messages} />
            <StatChip
              label="Conversaciones"
              value={client.botConfig?._count?.conversations ?? 0}
            />
            <StatChip label="Leads" value={client.botConfig?._count?.leads ?? 0} />
          </div>
          <div className="lg:self-end">
            <ImpersonateButton clientId={client.id} clientName={client.companyName} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-zinc-100">{value}</p>
    </div>
  )
}
