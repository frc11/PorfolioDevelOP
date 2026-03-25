import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CreditCard, CheckCircle2, Clock, FileText, ChevronRight, ShieldCheck } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { BillingSubscriptionCard } from '@/components/dashboard/BillingSubscriptionCard'

export const metadata = { title: 'Facturación | develOP Dashboard' }

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const orgMember = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
    include: {
      organization: {
        include: {
          subscription: true,
          invoices: {
            orderBy: { dueDate: 'desc' }
          }
        }
      }
    }
  })

  if (!orgMember?.organization) redirect('/login')

  const { subscription, invoices } = orgMember.organization

  // UI state derived from subscription
  const statusColor = subscription?.status === 'ACTIVE' 
    ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
    : subscription?.status === 'PAST_DUE'
      ? 'text-red-400 border-red-500/20 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
      : 'text-zinc-400 border-zinc-700 bg-zinc-800'

  const statusText = subscription?.status === 'ACTIVE' 
    ? 'Activa' 
    : subscription?.status === 'PAST_DUE' 
      ? 'Vencida' 
      : 'Cancelada'

  // Derived / Mock Precision Data
  const nextDueDate = subscription ? new Date(subscription.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) : null

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <CreditCard className="text-cyan-500" />
          Facturación y Suscripciones
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Administra tu retainer mensual y descarga tus recibos fiscales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <BillingSubscriptionCard 
          subscription={subscription}
          statusColor={statusColor}
          statusText={statusText}
          nextDueDate={nextDueDate}
        />

        {/* Invoice History */}
        <div className="md:col-span-2 border border-white/10 bg-[#0c0e12]/80 backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Historial de Pagos</h3>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {invoices.length === 0 ? (
              <EmptyState 
                icon={<ShieldCheck size={32} />} 
                title="Historial al día" 
                titleColor="text-emerald-500/50"
                description="Tus facturas legales se generan automáticamente el día 1 de cada mes."
                subtext="Cumplen con todas las normativas fiscales vigentes."
                iconColor="text-emerald-500" 
              />
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider text-zinc-500">Monto</th>
                    <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider text-zinc-500">Estado</th>
                    <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider text-zinc-500">Vencimiento</th>
                    <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider text-right text-zinc-500">Recibo / Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="group hover:bg-white/[0.04] transition-all duration-300 cursor-default font-mono">
                      <td className="px-6 py-4 font-bold text-zinc-200 group-hover:text-white transition-colors">
                        ${invoice.amount.toFixed(2)} <span className="text-zinc-500 font-normal">{invoice.currency}</span>
                      </td>
                      <td className="px-6 py-4">
                        {invoice.status === 'PAID' ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-max shadow-sm font-sans">
                            <CheckCircle2 size={12} /> Pagado
                          </span>
                        ) : invoice.status === 'OVERDUE' ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md w-max shadow-sm font-sans">
                            <Clock size={12} /> Vencido
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md w-max shadow-sm font-sans">
                            <Clock size={12} /> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-xs font-medium tabular-nums group-hover:text-zinc-300">
                        {new Date(invoice.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {invoice.status === 'PAID' && invoice.pdfUrl ? (
                          <div className="relative group flex justify-end">
                            {/* Tooltip */}
                            <div className="absolute -top-10 right-0 px-3 py-1.5 bg-[#0c0e12] border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-300 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl backdrop-blur-xl z-30 translate-y-2 group-hover:translate-y-0">
                              Descargar Recibo Fiscal
                              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-[#0c0e12] border-r border-b border-white/10 rotate-45" />
                            </div>
                            
                            <a 
                              href={invoice.pdfUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-cyan-400 transition-all duration-300 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/20 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-lg"
                            >
                              <FileText size={14} className="text-zinc-500 group-hover:text-cyan-400 transition-colors" /> 
                              PDF
                            </a>
                          </div>
                        ) : invoice.paymentLink && invoice.status !== 'PAID' ? (
                          <a href={invoice.paymentLink} className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-all duration-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] px-4 py-1.5 rounded-md">
                            Pagar Ahora <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
