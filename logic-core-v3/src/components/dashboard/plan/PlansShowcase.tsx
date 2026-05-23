/**
 * B4.6 — Presentación de los 3 planes para el dashboard del cliente.
 *
 * Server component. Recibe el `PlanKey` actual y renderiza las 3 cards
 * (Starter / Pro / Business) con la card Pro destacada como "MÁS POPULAR"
 * (anclaje + decoy + Pro al medio).
 *
 * Reglas locked del bloque:
 *  - Cero jerga: nada de "conversaciones / tokens / LLM / CRM". Las
 *    traducciones viven en `plan-presentation.ts`.
 *  - Locked-as-celebration: para el plan actual, las features del próximo
 *    tier aparecen como "candado dorado" + frase positiva ("Cuando
 *    estés listo para crecer"). Nunca es alarma.
 *  - El CTA de upgrade NO está enchufado todavía a `requestUpsellAction`
 *    (eso es B10). Por ahora linkea a `messages?context=...` para que el
 *    cliente hable con su equipo develOP — el flujo manual que ya existe.
 *
 * Mobile: las 3 cards se stackean en col en xs/sm; cambian a grid-cols-3
 * en lg+. El badge "MÁS POPULAR" sigue visible en mobile (top-right de la
 * card Pro).
 */
import Link from 'next/link'
import { Check, Lock, Sparkles, Crown } from 'lucide-react'
import type { PlanKey } from '@prisma/client'
import {
  PLAN_PRESENTATIONS,
  compareTier,
  formatNumberEs,
  getNextPlan,
  type PlanBenefit,
  type PlanPresentation,
} from '@/lib/plan/plan-presentation'

interface PlansShowcaseProps {
  currentPlanKey: PlanKey
  isFallback: boolean
}

export function PlansShowcase({ currentPlanKey, isFallback }: PlansShowcaseProps) {
  return (
    <section
      aria-labelledby="plans-showcase-title"
      className="space-y-6"
    >
      <header className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">
          Planes disponibles
        </p>
        <h2
          id="plans-showcase-title"
          className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl"
        >
          Elegí cuánto querés crecer este mes
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Todos los planes incluyen el mismo vendedor virtual 24/7. La diferencia es cuántos clientes
          puede atender y qué herramientas le sumás encima.
        </p>
      </header>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3 lg:items-stretch">
        {PLAN_PRESENTATIONS.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            currentPlanKey={currentPlanKey}
            isFallback={isFallback}
          />
        ))}
      </div>

      <LockedCelebrationFooter currentPlanKey={currentPlanKey} />
    </section>
  )
}

interface PlanCardProps {
  plan: PlanPresentation
  currentPlanKey: PlanKey
  isFallback: boolean
}

function PlanCard({ plan, currentPlanKey, isFallback }: PlanCardProps) {
  const tier = compareTier(currentPlanKey, plan.key)
  const isCurrent = tier === 'current' && !isFallback
  const isUpgrade = tier === 'upgrade'
  const isDowngrade = tier === 'downgrade'
  const isHighlighted = plan.highlight

  const cardClasses = [
    'relative flex flex-col overflow-hidden rounded-2xl border bg-[#0c0e12]/80 p-6 shadow-2xl backdrop-blur-xl transition-all',
    isCurrent && 'border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    !isCurrent && isHighlighted &&
      'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.18)]',
    !isCurrent && !isHighlighted && 'border-white/10',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={cardClasses}>
      <div className="flex items-start justify-between gap-3">
        <header className="min-w-0 space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">{plan.name}</h3>
          <p className="text-xs leading-relaxed text-zinc-500">{plan.tagline}</p>
        </header>
        {isCurrent && (
          <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-300">
            <Check size={10} strokeWidth={2} />
            Tu plan
          </span>
        )}
        {isHighlighted && !isCurrent && (
          <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
            <Crown size={10} strokeWidth={1.5} />
            Más popular
          </span>
        )}
      </div>

      <div className="mt-5 space-y-1">
        <p className="font-mono text-3xl font-black tabular-nums text-white sm:text-4xl">
          ${plan.monthlyPriceUsd}
          <span className="ml-1.5 text-sm font-bold text-zinc-500">/mes</span>
        </p>
        <p className="text-xs font-bold text-zinc-400">
          Hasta {formatNumberEs(plan.customersPerMonth)} clientes atendidos por mes
        </p>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.benefits.map((benefit, idx) => (
          <BenefitItem key={idx} benefit={benefit} highlighted={isHighlighted} />
        ))}
      </ul>

      <div className="mt-6">
        <PlanCta
          plan={plan}
          isCurrent={isCurrent}
          isUpgrade={isUpgrade}
          isDowngrade={isDowngrade}
          isHighlighted={isHighlighted}
        />
      </div>
    </article>
  )
}

function BenefitItem({ benefit, highlighted }: { benefit: PlanBenefit; highlighted: boolean }) {
  const Icon = benefit.icon
  const iconTint = highlighted ? 'text-amber-300' : 'text-cyan-400'
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] ${iconTint}`}
        aria-hidden="true"
      >
        <Icon size={11} strokeWidth={2} />
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-zinc-100 leading-snug">{benefit.label}</p>
        {benefit.hint && (
          <p className="text-xs leading-relaxed text-zinc-500">{benefit.hint}</p>
        )}
      </div>
    </li>
  )
}

interface PlanCtaProps {
  plan: PlanPresentation
  isCurrent: boolean
  isUpgrade: boolean
  isDowngrade: boolean
  isHighlighted: boolean
}

function PlanCta({ plan, isCurrent, isUpgrade, isDowngrade, isHighlighted }: PlanCtaProps) {
  if (isCurrent) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-cyan-400">
        <Check size={13} strokeWidth={2} />
        {plan.ctaCurrent}
      </div>
    )
  }

  if (isDowngrade) {
    return (
      <Link
        href={`/dashboard/messages?context=plan-change-${plan.key.toLowerCase()}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:border-white/20 hover:bg-white/[0.06]"
      >
        Hablar con mi equipo
      </Link>
    )
  }

  // upgrade
  if (isHighlighted) {
    return (
      <Link
        href={`/dashboard/messages?context=plan-upgrade-${plan.key.toLowerCase()}`}
        className="group flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-amber-300 transition-all hover:border-amber-400/60 hover:from-amber-500/25 hover:to-amber-500/25"
      >
        <Sparkles size={13} strokeWidth={1.8} className="transition-transform group-hover:rotate-12" />
        {plan.ctaUpgrade}
      </Link>
    )
  }

  return (
    <Link
      href={`/dashboard/messages?context=plan-upgrade-${plan.key.toLowerCase()}`}
      className="group flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-cyan-300 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/20"
    >
      {plan.ctaUpgrade}
    </Link>
  )
}

/**
 * Locked-as-celebration: para el plan actual, mostramos las features del
 * próximo tier con candado dorado y una frase invitando a crecer.
 * Si ya está en BUSINESS, mostramos un "estás en el plan más alto" amable.
 */
function LockedCelebrationFooter({ currentPlanKey }: { currentPlanKey: PlanKey }) {
  const nextPlan = getNextPlan(currentPlanKey)
  const currentPresentation = PLAN_PRESENTATIONS.find((p) => p.key === currentPlanKey)
  const teaser = currentPresentation?.nextTierTeaser

  if (!nextPlan || !teaser || teaser.length === 0) {
    return (
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.08] via-white/[0.02] to-transparent p-5 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <Crown size={18} strokeWidth={1.5} className="mt-0.5 flex-shrink-0 text-cyan-300" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-zinc-100">
              Estás en el plan más completo
            </p>
            <p className="text-xs leading-relaxed text-zinc-400">
              Todas las funciones de develOP ya están disponibles para tu cuenta. Si necesitás algo
              más a medida, escribinos.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] via-white/[0.02] to-transparent p-5 backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <Sparkles size={18} strokeWidth={1.5} className="mt-0.5 flex-shrink-0 text-amber-300" />
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
              Cuando estés listo para crecer
            </p>
            <p className="text-sm font-bold text-zinc-100">
              Esto te espera en el plan {nextPlan.name}
            </p>
            <p className="text-xs leading-relaxed text-zinc-400">
              Tu cuenta ya está aprovechando todo lo del plan actual. Estas funciones se desbloquean
              cuando decidas dar el paso.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teaser.map((benefit, idx) => (
              <LockedTeaserItem key={idx} benefit={benefit} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function LockedTeaserItem({ benefit }: { benefit: PlanBenefit }) {
  const Icon = benefit.icon
  return (
    <li className="flex items-start gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-3">
      <span
        className="relative mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
        aria-hidden="true"
      >
        <Icon size={12} strokeWidth={1.8} />
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-amber-400/40 bg-zinc-950 text-amber-300">
          <Lock size={7} strokeWidth={2.5} />
        </span>
      </span>
      <p className="text-xs font-medium leading-snug text-amber-100/90">{benefit.label}</p>
    </li>
  )
}
