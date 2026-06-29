/**
 * B4.6 — Medidor de consumo del cliente.
 *
 * Server component. Lee `OrgUsageSnapshot` (que ya consultó `QuotaUsage`
 * real) y muestra:
 *  - "Atendiste X de Y clientes este mes"
 *  - Barra de progreso con tono según uso (calm / busy / crowded / full).
 *  - Mensaje positivo del nivel actual.
 *  - Invitación a upgrade SOLO si el uso lo justifica (≥85%) y el plan no
 *    es BUSINESS — anclada como "celebración", nunca alarma.
 *
 * Sin jerga: nada de "conversaciones", "cuota", "tokens" o "LLM". El
 * cliente lee de "clientes atendidos" y "tope mensual".
 *
 * Mobile: el header usa `flex-col` en xs y `flex-row` en sm+. La barra y
 * los números son siempre full-width en mobile.
 */
import Link from 'next/link'
import { Sparkles, ArrowUpRight, Users, Bot } from 'lucide-react'
import type { OrgUsageSnapshot } from '@/lib/plan/get-org-usage'
import {
  formatNumberEs,
  getNextPlan,
  getUsageMessage,
  type UsageMessage,
} from '@/lib/plan/plan-presentation'
import { UpgradeCtaButton } from './UpgradeCtaButton'

interface UsageMeterProps {
  snapshot: OrgUsageSnapshot
  /** Si `true`, oculta la invitación a upgrade incluso cuando el uso la habilita.
   *  Útil cuando la página YA está mostrando la presentación de planes debajo. */
  hideUpgradeHint?: boolean
}

interface ToneStyles {
  bar: string
  glow: string
  badge: string
  iconWrap: string
  textTint: string
}

const TONE_STYLES: Record<UsageMessage['tone'], ToneStyles> = {
  calm: {
    bar: 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-500',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.35)]',
    badge: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    iconWrap: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    textTint: 'text-cyan-400',
  },
  busy: {
    bar: 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-500',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    iconWrap: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    textTint: 'text-emerald-400',
  },
  crowded: {
    bar: 'bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    iconWrap: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    textTint: 'text-amber-400',
  },
  full: {
    bar: 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500',
    glow: 'shadow-[0_0_18px_rgba(245,158,11,0.55)]',
    badge: 'border-amber-400/30 bg-amber-500/15 text-amber-300',
    iconWrap: 'border-amber-400/30 bg-amber-500/15 text-amber-300',
    textTint: 'text-amber-300',
  },
}

export function UsageMeter({ snapshot, hideUpgradeHint = false }: UsageMeterProps) {
  // Sin bot configurado todavía: no hay consumo que medir. Mostramos un estado
  // vacío de onboarding en vez de un "0 / tope" que confunde (no atendió a
  // nadie porque el vendedor virtual ni siquiera está activo).
  if (!snapshot.hasBotConfigured) {
    return (
      <section
        aria-labelledby="usage-meter-title"
        className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl transition-colors hover:border-white/20"
      >
        <div className="flex flex-col gap-4 p-5 sm:gap-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <Bot size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h2
                id="usage-meter-title"
                className="text-base font-bold tracking-tight text-zinc-100 sm:text-lg"
              >
                Tu vendedor virtual todavía no está activo
              </h2>
              <p className="mt-0.5 text-xs capitalize text-zinc-500">
                Período: {snapshot.periodLabel}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-start gap-3">
              <Sparkles size={16} strokeWidth={1.5} className="mt-0.5 flex-shrink-0 text-cyan-400" />
              <p className="text-sm leading-relaxed text-zinc-300">
                Configurá tu bot para empezar a atender clientes este mes. Cuando esté activo, vas a
                ver acá cuántos clientes atendiste y cuánto te queda de tu plan.
              </p>
            </div>
          </div>

          {/* CTA de activación: reusa requestUpsellAction (vía UpgradeCtaButton)
              con featureKey/featureName propios del bot — registra el lead y
              lleva a /dashboard/messages, igual flujo que el upsell de plan.
              Acento CYAN (no es upsell de plan). Visible SIEMPRE en el empty:
              no lo gobierna hideUpgradeHint. */}
          <UpgradeCtaButton
            featureKey="bot-activation"
            featureName="Activación de tu vendedor virtual"
            label="Activá tu vendedor virtual"
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-cyan-300 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/20 disabled:cursor-wait disabled:opacity-60"
          />
        </div>
      </section>
    )
  }

  const message = getUsageMessage(snapshot.percentage, snapshot.plan.key, snapshot.plan.isFallback)
  const tone = TONE_STYLES[message.tone]
  const nextPlan = getNextPlan(snapshot.plan.key)
  const shouldShowUpgrade =
    !hideUpgradeHint && message.showUpgradeHint && nextPlan !== null

  return (
    <section
      aria-labelledby="usage-meter-title"
      className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl transition-colors hover:border-white/20"
    >
      <div className="flex flex-col gap-5 p-5 sm:gap-6 sm:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border ${tone.iconWrap}`}
            >
              <Users size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h2
                id="usage-meter-title"
                className="text-base font-bold tracking-tight text-zinc-100 sm:text-lg"
              >
                Clientes atendidos este mes
              </h2>
              <p className="mt-0.5 text-xs capitalize text-zinc-500">
                Período: {snapshot.periodLabel}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${tone.badge}`}
          >
            Plan {snapshot.plan.name}
          </span>
        </header>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-3xl font-black tabular-nums text-white sm:text-4xl">
              {formatNumberEs(snapshot.conversationsUsed)}
              <span className="ml-2 text-base font-bold text-zinc-500 sm:text-lg">
                / {formatNumberEs(snapshot.conversationsLimit)}
              </span>
            </p>
            <p className={`text-xs font-black uppercase tracking-widest ${tone.textTint}`}>
              {snapshot.percentage}%
            </p>
          </div>

          <div
            role="progressbar"
            aria-valuenow={snapshot.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Atendiste ${snapshot.conversationsUsed} de ${snapshot.conversationsLimit} clientes este mes`}
            className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-900 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]"
          >
            <div
              className={`relative h-full rounded-full transition-[width] duration-700 ease-out ${tone.bar} ${tone.glow}`}
              style={{ width: `${Math.max(snapshot.percentage, snapshot.percentage > 0 ? 2 : 0)}%` }}
            >
              <div className="pointer-events-none absolute inset-0 -skew-x-12 animate-[shine_3s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={16} strokeWidth={1.5} className={`mt-0.5 flex-shrink-0 ${tone.textTint}`} />
            <div className="space-y-1">
              <p className="text-sm font-bold text-zinc-100">{message.headline}</p>
              <p className="text-xs leading-relaxed text-zinc-400">{message.detail}</p>
            </div>
          </div>
        </div>

        {shouldShowUpgrade && nextPlan && (
          <Link
            href="/dashboard/plan"
            className="group flex items-center justify-between gap-3 rounded-[24px] border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.12] via-amber-500/[0.04] to-transparent p-4 transition-all hover:border-amber-400/40 hover:from-amber-500/[0.18]"
          >
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Una buena señal
              </p>
              <p className="text-sm font-bold text-zinc-100">
                Mirá cómo se ve el plan {nextPlan.name}
              </p>
              <p className="text-xs text-zinc-400">
                {formatNumberEs(nextPlan.customersPerMonth)} clientes por mes y más funciones — sin compromiso, podés cambiar cuando quieras.
              </p>
            </div>
            <ArrowUpRight
              size={20}
              strokeWidth={1.5}
              className="flex-shrink-0 text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        )}
      </div>
    </section>
  )
}
