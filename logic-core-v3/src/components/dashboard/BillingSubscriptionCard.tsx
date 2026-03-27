'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Phone,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED'

interface SubscriptionData {
  planName: string
  status: SubscriptionStatus
  price: number
  currency: string
}

interface BillingSubscriptionCardProps {
  subscription: SubscriptionData | null
  daysUntilRenewal: number | null
  renewalDateFormatted: string | null
}

type StatusCfg = {
  label: string
  pill: string
  dot: string
  pulse: boolean
  Icon: typeof CheckCircle2
}

const STATUS_CONFIG: Record<SubscriptionStatus, StatusCfg> = {
  ACTIVE: {
    label: 'Activa',
    pill: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    dot: 'bg-emerald-400',
    pulse: true,
    Icon: CheckCircle2,
  },
  PAST_DUE: {
    label: 'Pago vencido',
    pill: 'text-red-400 border-red-500/20 bg-red-500/10',
    dot: 'bg-red-400',
    pulse: false,
    Icon: ShieldAlert,
  },
  CANCELED: {
    label: 'Cancelada',
    pill: 'text-zinc-500 border-zinc-700/60 bg-zinc-800/60',
    dot: 'bg-zinc-500',
    pulse: false,
    Icon: ShieldOff,
  },
}

export function BillingSubscriptionCard({
  subscription,
  daysUntilRenewal,
  renewalDateFormatted,
}: BillingSubscriptionCardProps) {
  const status = subscription?.status ?? null
  const cfg = status ? STATUS_CONFIG[status] : null
  const isPastDue = status === 'PAST_DUE'

  const countdownLabel =
    daysUntilRenewal === null
      ? null
      : daysUntilRenewal > 0
      ? `Vence en ${daysUntilRenewal} ${daysUntilRenewal === 1 ? 'día' : 'días'}`
      : daysUntilRenewal === 0
      ? 'Vence hoy'
      : 'Vencida'

  const countdownColor =
    daysUntilRenewal !== null && daysUntilRenewal <= 3
      ? 'text-red-400'
      : daysUntilRenewal !== null && daysUntilRenewal <= 7
      ? 'text-amber-400'
      : 'text-zinc-300'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      className="lg:col-span-1 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e12]/80 backdrop-blur-xl shadow-2xl"
    >
      {/* ── PAST_DUE urgent banner ───────────────────────────────────────── */}
      {isPastDue && (
        <div className="flex items-start gap-2.5 border-b border-red-500/30 bg-red-500/[0.12] px-5 py-3.5">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-[11px] font-bold leading-snug text-red-300">
            Tu pago está vencido.{' '}
            <Link
              href="/dashboard/messages"
              className="underline underline-offset-2 transition-colors hover:text-red-200"
            >
              Contactanos para regularizar.
            </Link>
          </p>
        </div>
      )}

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col gap-5 overflow-hidden p-6">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-5 -left-5 h-24 w-24 rounded-full bg-blue-600/5 blur-2xl" />

        {subscription && cfg ? (
          <>
            {/* Label + status badge */}
            <div className="relative z-10 flex items-center justify-between">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">
                <ShieldCheck size={12} />
                Plan Actual
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${cfg.pill}`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  {cfg.pulse && (
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${cfg.dot}`}
                    />
                  )}
                  <span
                    className={`relative inline-flex h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                  />
                </span>
                {cfg.label}
              </span>
            </div>

            {/* Plan name */}
            <div className="relative z-10">
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                {subscription.planName}
              </h2>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Suscripción B2B
              </p>
            </div>

            {/* Price */}
            <div className="relative z-10 flex items-baseline gap-2 border-y border-white/5 py-4 font-mono">
              <span className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.08)]">
                ${subscription.price.toFixed(2)}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {subscription.currency} / mes
              </span>
            </div>

            {/* Renewal countdown */}
            {countdownLabel && (
              <div className="relative z-10 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <CalendarClock
                  size={16}
                  className={
                    daysUntilRenewal !== null && daysUntilRenewal <= 7
                      ? 'text-amber-400'
                      : 'text-cyan-500/60'
                  }
                />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                    Próximo vencimiento
                  </p>
                  <p className={`mt-0.5 text-xs font-bold ${countdownColor}`}>
                    {countdownLabel}
                  </p>
                  {renewalDateFormatted && (
                    <p className="font-mono text-[9px] text-zinc-600">
                      {renewalDateFormatted}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* No subscription skeleton */
          <div className="relative z-10 flex flex-col gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">
              Plan Actual
            </p>
            <div className="space-y-2 opacity-40">
              <div className="h-5 w-3/4 animate-pulse rounded bg-white/5" />
              <div className="h-8 w-1/2 animate-pulse rounded bg-white/5" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-white/5" />
            </div>
            <p className="text-[11px] italic text-zinc-600">
              No hay un plan activo asignado.
            </p>
          </div>
        )}
      </div>

      {/* ── CTAs ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-t border-white/5 p-6">
        <Link
          href="/dashboard/services"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white active:scale-95"
        >
          <Sparkles size={13} className="text-amber-400" />
          Ver catálogo de planes
        </Link>
        <Link
          href="/dashboard/messages"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-cyan-400 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/10 active:scale-95"
        >
          <Phone size={13} />
          Hablar con account manager
        </Link>
      </div>
    </motion.div>
  )
}
