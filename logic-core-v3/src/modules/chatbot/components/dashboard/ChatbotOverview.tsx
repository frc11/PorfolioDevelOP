import Link from 'next/link'
import { StatCard } from '@/app/(protected)/admin/_components/stat-card'

interface ChatbotOverviewProps {
  session: any
  usage: any
  recentLeads: any[]
}

export function ChatbotOverview({ session, usage, recentLeads }: ChatbotOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conversaciones este mes"
          value={usage?.conversationsCount ?? 0}
          color="cyan"
        />
        <StatCard
          label="Leads capturados"
          value={recentLeads.length}
          color="emerald"
        />
        <StatCard
          label="Tasa de conversión"
          value={
            usage && usage.conversationsCount > 0
              ? `${((recentLeads.length / usage.conversationsCount) * 100).toFixed(1)}%`
              : '—'
          }
          color="violet"
        />
        <StatCard
          label="Mensajes enviados"
          value={0}
          color="amber"
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-base font-semibold text-zinc-200 mb-3">Leads recientes</h2>
        {recentLeads.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Sin leads capturados todavía. Cuando alguien deje sus datos, aparecerá acá.
          </p>
        ) : (
          <ul className="space-y-3">
            {recentLeads.map((lead: any) => (
              <li key={lead.id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-zinc-100">{lead.name}</p>
                  <p className="text-xs text-zinc-500">
                    {lead.intent} · {new Date(lead.updatedAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <Link
                  href={`/dashboard/chatbot/leads`}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Ver →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Placeholder para insights AI (se implementa en sprint futuro) */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6">
        <p className="text-xs text-violet-400 uppercase tracking-widest mb-2">
          Insights AI
        </p>
        <p className="text-sm text-zinc-300">
          Los insights automáticos se activarán cuando tu bot acumule más conversaciones.
        </p>
      </div>
    </div>
  )
}
