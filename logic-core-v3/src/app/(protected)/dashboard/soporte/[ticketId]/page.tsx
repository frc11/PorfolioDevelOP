import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { Headphones, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { TicketReplyForm } from '@/components/dashboard/TicketReplyForm'
import { AnimatedChatBubble } from '@/components/dashboard/AnimatedChatBubble'

// Map enum translations
const CATEGORY_MAP = {
  TECHNICAL: 'Soporte Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Nuevo Requerimiento',
  OTHER: 'Otro'
}

const STATUS_MAP = {
  OPEN: { label: 'Abierto', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  IN_PROGRESS: { label: 'En Progreso por develOP', class: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  RESOLVED: { label: 'Resuelto', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
}

export default async function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const session = await auth()
  const organizationId = await resolveOrgId()
  
  if (!session?.user?.id || !organizationId) redirect('/login')

  const ticket = await prisma.ticket.findUnique({
    where: { 
      id: params.ticketId,
      organizationId // Security bound
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { name: true, image: true, role: true } } }
      }
    }
  })

  if (!ticket) redirect('/dashboard/soporte')

  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full h-[calc(100vh-8rem)]">
      {/* Header Controls */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/soporte" className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">{ticket.title}</h1>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_MAP[ticket.status].class}`}>
              {STATUS_MAP[ticket.status].label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 font-mono">
            <span>Ticket #{ticket.id.slice(-6).toUpperCase()}</span>
            <span>•</span>
            <span>{CATEGORY_MAP[ticket.category]}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 border border-white/10 bg-[#0c0e12]/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {ticket.messages.map((message) => {
            const isAgency = message.isAdmin
            
            return (
              <div key={message.id} className={`flex flex-col ${isAgency ? 'items-start' : 'items-end'}`}>
                {/* Meta */}
                <div className={`flex items-center gap-2 mb-1.5 ${isAgency ? 'flex-row' : 'flex-row-reverse'}`}>
                  <span className={`text-xs font-medium ${isAgency ? 'text-cyan-400' : 'text-zinc-400'}`}>
                    {isAgency ? 'develOP Operations' : (message.user.name || 'Cliente')}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {new Date(message.createdAt).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </span>
                </div>
                
                {/* Bubble */}
                <AnimatedChatBubble 
                  isAgency={isAgency}
                  className={`relative max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                    isAgency 
                      ? 'bg-gradient-to-br from-[#0a192f] to-[#04111d] border border-cyan-500/30 text-cyan-50 rounded-tl-sm shadow-[0_5px_25px_rgba(6,182,212,0.12)]' 
                      : 'bg-[#181a1f] border border-white/5 text-zinc-300 rounded-tr-sm shadow-[0_5px_15px_rgba(0,0,0,0.2)]'
                  }`}
                >
                  {message.content}
                </AnimatedChatBubble>
              </div>
            )
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 border-t border-white/5 bg-[#0a0c0f]">
          {ticket.status === 'RESOLVED' ? (
            <div className="flex flex-col items-center justify-center py-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={24} className="mb-2 opacity-80" />
              <p className="text-sm font-medium">Este ticket ha sido marcado como resuelto.</p>
              <p className="text-xs text-emerald-500/60 mt-1">Si el problema persiste, por favor abre un nuevo ticket.</p>
            </div>
          ) : (
            <TicketReplyForm ticketId={ticket.id} />
          )}
        </div>
      </div>
    </div>
  )
}
