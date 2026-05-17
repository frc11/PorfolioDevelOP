import Link from 'next/link'
import { Building2, ChevronLeft, LogIn } from 'lucide-react'
import { startImpersonationAction } from '../../_actions/client.actions'

interface ClientHeaderProps {
  client: {
    id: string
    companyName: string
    slug: string
    siteUrl: string | null
    whatsapp: string | null
    botConfig: { isActive: boolean; botName: string } | null
    subscription: { status: string; planName: string } | null
    _count: {
      projects: number
      clientAssets: number
      tickets: number
      messages: number
    }
  }
}

export function ClientHeader({ client }: ClientHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Volver a clientes
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-cyan-400/10 p-3">
            <Building2 className="h-6 w-6 text-cyan-300" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Cliente
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
              {client.companyName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
              <span>
                Slug: <span className="font-mono text-zinc-300">{client.slug}</span>
              </span>
              {client.subscription && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span>{client.subscription.planName} ({client.subscription.status})</span>
                </>
              )}
              {client.siteUrl && (
                <>
                  <span className="text-zinc-700">·</span>
                  <a href={client.siteUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                    Website
                  </a>
                </>
              )}
              {client.whatsapp && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span>WhatsApp: {client.whatsapp}</span>
                </>
              )}
              {client.botConfig && (
                <>
                  <span className="text-zinc-700">·</span>
                  <span>
                    Bot:{' '}
                    <span className={client.botConfig.isActive ? 'text-emerald-400' : 'text-zinc-500'}>
                      {client.botConfig.botName} {client.botConfig.isActive ? '(activo)' : '(pausado)'}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <StatChip label="Proyectos" value={client._count.projects} />
            <StatChip label="Archivos" value={client._count.clientAssets} />
            <StatChip label="Tickets" value={client._count.tickets} />
            <StatChip label="Mensajes" value={client._count.messages} />
          </div>
          <form action={startImpersonationAction.bind(null, client.id)} className="lg:self-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-400/15"
            >
              <LogIn className="h-4 w-4" strokeWidth={1.5} />
              Impersonar
            </button>
          </form>
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
