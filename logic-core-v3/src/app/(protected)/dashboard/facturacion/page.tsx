import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CreditCard, CheckCircle2, Clock, Receipt, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/dashboard/EmptyState'

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
        
        {/* Main Subscription Card */}
        <div className="md:col-span-1 border border-white/10 bg-[#0c0e12]/80 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          
          <p className="text-[10px] font-semibold tracking-widest uppercase text-cyan-500 mb-4">Plan Actual</p>
          
          {subscription ? (
            <>
              <h2 className="text-xl font-bold text-white mb-1">{subscription.planName}</h2>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-extrabold text-white">${subscription.price}</span>
                <span className="text-sm text-zinc-500 uppercase">{subscription.currency} / mes</span>
              </div>
              
              <div className={`mt-4 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold border ${statusColor}`}>
                Estado: {statusText}
              </div>
            </>
          ) : (
            <div className="text-zinc-500 text-sm italic">
              Aún no tienes un plan de subscripción activo asignado.
            </div>
          )}
        </div>

        {/* Invoice History */}
        <div className="md:col-span-2 border border-white/10 bg-[#0c0e12]/80 backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Historial de Pagos</h3>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {invoices.length === 0 ? (
              <EmptyState 
                icon={Receipt} 
                title="Historial al día" 
                description="No hay facturas registradas en este período."
                iconColor="text-cyan-500" 
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
                    <tr key={invoice.id} className="group hover:bg-white/[0.04] transition-all duration-300 cursor-default">
                      <td className="px-6 py-4 font-semibold text-zinc-200 group-hover:text-white transition-colors">
                        ${invoice.amount} <span className="text-zinc-500 font-normal">{invoice.currency}</span>
                      </td>
                      <td className="px-6 py-4">
                        {invoice.status === 'PAID' ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-max shadow-sm">
                            <CheckCircle2 size={12} /> Pagado
                          </span>
                        ) : invoice.status === 'OVERDUE' ? (
                          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md w-max shadow-sm">
                            <Clock size={12} /> Vencido
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md w-max shadow-sm">
                            <Clock size={12} /> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-xs font-medium tabular-nums group-hover:text-zinc-300">
                        {new Date(invoice.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {invoice.status === 'PAID' && invoice.pdfUrl ? (
                          <a href={invoice.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-cyan-400 transition-colors bg-white/5 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 px-3 py-1.5 rounded-md">
                            <FileText size={14} /> PDF
                          </a>
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
