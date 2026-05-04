import Link from 'next/link'
import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  PackageCheck,
  Sparkles,
} from 'lucide-react'
import type { CurrentPlan } from '@/lib/billing/get-current-plan'

function formatDate(date: Date | null) {
  if (!date) return 'Sin fecha'
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

function StatusBadge({ empty }: { empty?: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider',
        empty
          ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400'
          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      ].join(' ')}
    >
      <span
        className={[
          'h-1.5 w-1.5 rounded-full',
          empty ? 'bg-cyan-400' : 'bg-emerald-400',
        ].join(' ')}
      />
      {empty ? 'Configurando' : 'Activo'}
    </span>
  )
}

export function CurrentPlanCard({ plan }: { plan: CurrentPlan }) {
  const hasPlan = plan.hasActiveServices || plan.hasActiveModules

  if (!hasPlan) {
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12]/80 shadow-2xl backdrop-blur-xl lg:col-span-1">
        <div className="relative flex flex-1 flex-col gap-6 overflow-hidden p-6">
          <div className="relative z-10 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">
              Tu plan se está configurando
            </p>
            <StatusBadge empty />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/15 bg-cyan-500/10 text-cyan-400">
              <PackageCheck size={22} strokeWidth={1.5} />
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              Tu equipo de develOP está preparando tu cuenta. En las próximas horas vas a
              ver acá los servicios que contrataste.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 p-6">
          <Link
            href="/dashboard/messages?context=default"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-cyan-400 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/10 active:scale-95"
          >
            <MessageCircle size={13} />
            Hablar con mi equipo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12]/80 shadow-2xl backdrop-blur-xl lg:col-span-1">
      <div className="relative flex flex-1 flex-col gap-5 overflow-hidden p-6">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">
            <CheckCircle2 size={12} />
            Tu plan actual
          </p>
          <StatusBadge />
        </div>

        {plan.services.length > 0 && (
          <section className="relative z-10 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
              Servicios contratados
            </p>
            <div className="space-y-2">
              {plan.services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-white/5 bg-white/[0.025] px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-zinc-200">{service.name}</p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                        {service.type}
                      </p>
                    </div>
                    <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      {service.status === 'PAUSED' ? 'Pausado' : 'Activo'}
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] text-zinc-600">
                    Inicio: {formatDate(service.startedAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {plan.premiumModules.length > 0 ? (
          <section className="relative z-10 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
              Módulos premium activos
            </p>
            <div className="space-y-2">
              {plan.premiumModules.map((moduleData) => (
                <div
                  key={moduleData.slug}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-200">
                      {moduleData.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-600">
                      Activo desde {formatDate(moduleData.activatedAt)}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-sm font-black tabular-nums text-cyan-300">
                    {formatUsd(moduleData.priceMonthlyUsd)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="relative z-10 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-4">
            <p className="text-xs leading-relaxed text-zinc-500">
              Sin módulos premium activos. Podés explorar el catálogo en Mis Servicios.
            </p>
            <Link
              href="/dashboard/services"
              className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-400 transition-colors hover:text-cyan-300"
            >
              <Sparkles size={12} />
              Ver catálogo
            </Link>
          </div>
        )}
      </div>

      {plan.hasActiveModules && (
        <div className="space-y-4 border-t border-white/5 p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                Total mensual
              </p>
              <p className="mt-1 font-mono text-3xl font-black tabular-nums text-white">
                {formatUsd(plan.monthlyTotal)}
              </p>
            </div>
            <CreditCard size={22} className="text-zinc-700" />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3">
            <CalendarClock size={16} className="shrink-0 text-cyan-500/70" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                Próxima facturación
              </p>
              <p className="mt-0.5 text-xs font-bold capitalize text-zinc-300">
                {formatDate(plan.nextBillingAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
