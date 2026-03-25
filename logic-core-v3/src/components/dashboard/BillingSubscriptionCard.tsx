'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck, Sparkles, Phone } from 'lucide-react'
import Link from 'next/link'

interface BillingSubscriptionCardProps {
  subscription: any
  statusColor: string
  statusText: string
  nextDueDate: Date | null
}

export function BillingSubscriptionCard({ 
  subscription, 
  statusColor, 
  statusText, 
  nextDueDate 
}: BillingSubscriptionCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="md:col-span-1 border border-white/10 bg-[#0c0e12]/80 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between"
    >
      {/* Subtle glow / Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl -ml-5 -mb-5" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-cyan-500 flex items-center gap-2">
            <ShieldCheck size={12} />
            Plan de Nivel
          </p>
          {subscription && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={12} />
            </div>
          )}
        </div>
        
        {subscription ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{subscription.planName}</h2>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">Suscripción B2B de Alto Rendimiento</p>
            </div>
            
            <div className="flex items-baseline gap-2 py-4 border-y border-white/5 font-mono">
              <span className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                ${subscription.price.toFixed(2)}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {subscription.currency} / MES
              </span>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[10px] font-medium tracking-wide">
                <span className="text-zinc-500 uppercase">Próximo vencimiento</span>
                <span className="text-zinc-300 font-mono">
                  {nextDueDate?.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-medium tracking-wide">
                <span className="text-zinc-500 uppercase">Método de pago</span>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <ShieldCheck size={12} className="text-cyan-500" />
                  <span className="font-mono">Visa **** 4242</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-medium tracking-wide">
                <span className="text-zinc-500 uppercase">Ciclo de facturación</span>
                <span className="text-zinc-300">Mensual</span>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider border ${statusColor}`}>
              <div className={`h-1.5 w-1.5 rounded-full ${subscription?.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {statusText}
            </div>
          </div>
        ) : (
          <div className="space-y-6 opacity-60">
            {/* Skeleton Structure */}
            <div className="space-y-3">
              <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
              <div className="h-6 w-1/2 rounded bg-white/5 animate-pulse" />
            </div>
            <div className="h-12 w-full rounded-xl bg-white/5 animate-pulse flex items-center px-4">
              <div className="h-2 w-1/3 rounded bg-white/10" />
            </div>
            <p className="text-[11px] text-zinc-600 font-medium italic">
              No hay un plan activo detectado. <br />
              Asigná un contrato para comenzar.
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="relative z-10 mt-10 space-y-3">
        <Link 
          href="/dashboard/services"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-white hover:border-white/20 group backdrop-blur-md"
        >
          <Sparkles size={14} className="text-amber-400 transition-transform group-hover:rotate-12" />
          Ver Catálogo
        </Link>
        
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-cyan-400 transition-all hover:bg-cyan-500/10 hover:border-cyan-500/40 group">
          <Phone size={14} className="transition-transform group-hover:-rotate-12" />
          Account Manager
        </button>
      </div>
    </motion.div>
  )
}
