import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { Headphones, CheckCircle2, Clock, HelpCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { NewTicketModal } from '@/components/dashboard/NewTicketModal'
import { EmptyState } from '@/components/dashboard/EmptyState'

export const metadata = { title: 'Soporte B2B | develOP Dashboard' }

// Map enum translations
const CATEGORY_MAP = {
  TECHNICAL: 'Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Requerimiento',
  OTHER: 'Otro'
}

const STATUS_MAP = {
  OPEN: { label: 'Abierto', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  IN_PROGRESS: { label: 'En Progreso', class: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  RESOLVED: { label: 'Resuelto', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
}

export default async function SoportePage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  
  if (!session?.user?.id || !organizationId) redirect('/login')

  const tickets = await prisma.ticket.findMany({
    where: { organizationId },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { messages: true }
      }
    }
  })

  const activeTickets = tickets.filter(t => t.status !== 'RESOLVED')
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED')

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Headphones className="text-cyan-500" />
            Centro de Soporte Asíncrono
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Gestiona tus requerimientos técnicos de forma estructurada. Cero caos por WhatsApp.
          </p>
        </div>
        <NewTicketModal />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Tickets Table */}
        <div className="flex flex-col border border-white/10 bg-[#0c0e12]/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
            <Clock className="text-amber-400" size={18} />
            <h3 className="text-sm font-semibold text-zinc-200">Tickets Abiertos / En Curso</h3>
            <span className="ml-auto bg-white/10 text-xs px-2 py-0.5 rounded-full text-zinc-300 font-mono">{activeTickets.length}</span>
          </div>

          <div className="flex-1">
            {activeTickets.length === 0 ? (
              <EmptyState 
                icon={CheckCircle2} 
                title="Sistemas funcionando" 
                description="No tienes tickets abiertos o en curso en este momento."
                iconColor="text-cyan-500" 
              />
            ) : (
              <div className="divide-y divide-white/5">
                {activeTickets.map(ticket => (
                  <Link href={`/dashboard/soporte/${ticket.id}`} key={ticket.id} className="block p-5 hover:bg-white/[0.03] transition-all duration-300 group hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] rounded-lg m-1 border border-transparent hover:border-white/5 cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_MAP[ticket.status].class}`}>
                            {STATUS_MAP[ticket.status].label}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">#{ticket.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <h4 className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors truncate pr-4">{ticket.title}</h4>
                        <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                          <span className="text-zinc-400">{CATEGORY_MAP[ticket.category]}</span>
                          <span>•</span>
                          <span>{ticket._count.messages} {ticket._count.messages === 1 ? 'Mensaje' : 'Mensajes'}</span>
                          <span>•</span>
                          <span>Actualizado {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-3" size={20} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="flex flex-col border border-white/10 bg-[#0c0e12]/40 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={18} />
            <h3 className="text-sm font-semibold text-zinc-400">Historial Resueltos</h3>
            <span className="ml-auto bg-white/5 text-xs px-2 py-0.5 rounded-full text-zinc-500 font-mono">{resolvedTickets.length}</span>
          </div>

          <div className="flex-1">
            {resolvedTickets.length === 0 ? (
              <EmptyState 
                icon={Headphones} 
                title="Historial limpio" 
                description="Aún no tienes tickets resueltos archivados."
                iconColor="text-zinc-600" 
                className="opacity-70"
              />
            ) : (
              <div className="divide-y divide-white/5">
                {resolvedTickets.map(ticket => (
                  <Link href={`/dashboard/soporte/${ticket.id}`} key={ticket.id} className="block p-4 hover:bg-white/[0.03] transition-all duration-300 group opacity-70 hover:opacity-100 rounded-lg m-1 border border-transparent hover:border-emerald-500/10">
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">{ticket.title}</h4>
                      <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                        <span className="text-emerald-500/70 group-hover:text-emerald-400 transition-colors">#{ticket.id.slice(-6).toUpperCase()}</span>
                        <span>•</span>
                        <span>Cerrado el {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
