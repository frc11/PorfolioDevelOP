import { prisma } from '@/lib/prisma'
import { AlertTriangle, Lock, ArrowRight, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface LeakMeterProps {
  organizationId: string
}

export async function LeakMeter({ organizationId }: LeakMeterProps) {
  // Contamos las visitas del mes actual con duration < 5
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalViews, leakCount] = await Promise.all([
    prisma.pageView.count({
      where: { 
        clientId: organizationId,
        createdAt: { gte: firstDayOfMonth }
      }
    }),
    prisma.pageView.count({
      where: { 
        clientId: organizationId,
        duration: { lt: 5 },
        createdAt: { gte: firstDayOfMonth }
      }
    })
  ])

  // State: No data yet (Pixel not active or no views)
  if (totalViews === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-t border-l border-white/10 bg-zinc-950/20 p-8 text-center transition-all duration-500 hover:border-red-500/30 backdrop-blur-3xl group">
        {/* Subtle red ambient glow */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-red-500/5 blur-[100px] pointer-events-none" />
        
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          {/* Pulsing red glow behind the lock */}
          <div className="absolute inset-0 animate-pulse rounded-full bg-red-600/10 blur-xl duration-[3000ms]" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl transition-transform duration-500 group-hover:scale-110">
            <Lock size={28} className="text-zinc-500 group-hover:text-red-400 transition-colors duration-500" />
          </div>
        </div>

        <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-red-400">Medidor de Fugas Bloqueado</h2>
        <p className="mt-2 text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Estás perdiendo visibilidad sobre los clientes que abandonan tu web. <span className="text-red-400/80 font-medium italic">Activa el Píxel para detener la pérdida de capital hoy.</span>
        </p>
        
        <Link 
          href="/dashboard/services"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] active:scale-95"
        >
          Configurar Píxel de Rastreo
          <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  const hasHighLeaks = leakCount > 0

  return (
    <div className={`relative overflow-hidden rounded-2xl border-t border-l border-white/10 backdrop-blur-2xl transition-all duration-500 hover:scale-[1.01] ${
      hasHighLeaks 
        ? 'bg-red-950/5 shadow-[0_0_40px_rgba(239,68,68,0.05)]' 
        : 'bg-emerald-950/5'
    } p-7`}>
      {/* Dynamic Background Glow */}
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-[80px] pointer-events-none ${
        hasHighLeaks ? 'bg-red-500' : 'bg-emerald-500'
      }`} />
      
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-5">
          <div className={`mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl backdrop-blur-md shadow-2xl ${
            hasHighLeaks 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse-slow' 
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            <TrendingDown size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`text-[10px] font-medium uppercase tracking-[0.2em] ${hasHighLeaks ? 'text-red-400' : 'text-emerald-400'}`}>
                Fuga de Capital Detectada
              </h2>
              {hasHighLeaks && (
                <span className="animate-bounce flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
            </div>
            <p className="text-[15px] text-zinc-300 leading-relaxed max-w-lg">
              Este mes, <strong className="text-white text-lg">{leakCount}</strong> prospectos calificados abandonaron tu embudo al instante. <span className="text-red-400/90 font-semibold underline decoration-red-500/30 underline-offset-4">Estás dejando dinero sobre la mesa.</span>
            </p>
          </div>
        </div>

        <Link 
          href="/dashboard/soporte"
          className={`group relative flex w-full shrink-0 items-center justify-center gap-3 overflow-hidden rounded-xl px-8 py-4 text-sm font-black uppercase tracking-widest transition-all duration-300 sm:w-auto active:scale-95 ${
            hasHighLeaks 
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_10px_30px_rgba(239,68,68,0.3)]' 
              : 'bg-emerald-500 text-black hover:bg-emerald-400'
          }`}
        >
          {/* Shine effect for high urgency */}
          {hasHighLeaks && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
          )}
          <span className="relative z-10">Tapar Fuga con IA</span>
          <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
