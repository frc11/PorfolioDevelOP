// P1.C — Hero del home: "Tu semana en números". Las 4 preguntas del dueño como
// piezas grandes y legibles. Server component (sin estado); el único tile
// interactivo (plata) es <MoneyEstimate> (client). Empty states honestos por
// tile — nunca ceros crudos ni reproche. Stagger con FadeIn (patrón canónico).

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Users, Flame, Clock, ArrowRight, Sparkles, Check } from 'lucide-react'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { MoneyEstimate } from './MoneyEstimate'
import { deltaPhrase, formatVelocity } from '@/lib/dashboard/home-metrics-logic'
import { formatRelativeAR } from '@/lib/dates-ar'
import { adminHoverCls } from '@/lib/hover'
import { cn } from '@/lib/utils'
import type { HomeBusinessMetrics, TopHotLead } from '@/lib/dashboard/home-metrics'

const TILE = 'h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5'
const LEADS_HREF = '/dashboard/chatbot/leads'

interface BusinessHeroProps {
  metrics: HomeBusinessMetrics
  averageTicketUsd: number | null
}

// Verbo en lenguaje de dueño para nombrar al lead más urgente del semáforo.
const INTENT_PHRASE: Record<string, string> = {
  quote: 'pidió una cotización',
  quote_request: 'pidió una cotización',
  purchase_ready: 'está listo para comprar',
  schedule_visit: 'quiere agendar una visita',
  human_request: 'pidió hablar con alguien',
  demo: 'pidió una demo',
  info: 'hizo una consulta',
  support: 'pidió soporte',
  other: 'dejó una consulta',
}

function urgentPhrase(top: TopHotLead): string {
  const verb = INTENT_PHRASE[top.intent ?? 'other'] ?? 'dejó una consulta'
  return `${top.name} ${verb}`
}

// P1.C-fix — Hover canónico del dashboard (adminHoverCls, igual que
// WeekResultsGrid / AttentionStack) en un wrapper NO-motion: su hover:scale no
// pelea con el transform de entrada de FadeIn (patrón split-wrapper). h-full
// encadena la altura para que los tiles del row queden parejos.
function HoverTile({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <div className={cn('h-full rounded-2xl', adminHoverCls)}>
      <FadeIn delay={delay} className="h-full">
        {children}
      </FadeIn>
    </div>
  )
}

export function BusinessHero({ metrics, averageTicketUsd }: BusinessHeroProps) {
  const { leads, velocity, funnel, semaforo } = metrics
  void funnel // el embudo se muestra en su propia sección (LeadFunnel)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Tu semana en números</h2>
        <p className="text-xs text-zinc-500">Lo que pasó con tu negocio esta semana</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 1 — ¿Cuántos leads entraron? */}
        <HoverTile delay={0}>
          <div className={TILE}>
            <div className="mb-3 flex items-start justify-between">
              <p className="text-xs tracking-tight text-zinc-500">Leads esta semana</p>
              <div className="rounded-md bg-cyan-400/10 p-1.5">
                <Users className="h-4 w-4 text-cyan-300" strokeWidth={1.5} aria-hidden />
              </div>
            </div>
            <p className="text-3xl font-semibold tracking-tight tabular-nums text-zinc-100">
              {leads.current}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {leads.current === 0 && leads.previous === 0
                ? 'Cuando alguien deje sus datos en tu web, los vas a ver acá'
                : (deltaPhrase(leads) ?? 'esta semana')}
            </p>
          </div>
        </HoverTile>

        {/* 2 — ¿A quién atender ya? Semáforo (Pro+). */}
        <HoverTile delay={0.05}>
          <div className={TILE}>
            <div className="mb-3 flex items-start justify-between">
              <p className="text-xs tracking-tight text-zinc-500">Para atender ahora</p>
              <div
                className={`rounded-md p-1.5 ${semaforo.enabled && semaforo.hotCount > 0 ? 'bg-rose-400/10' : 'bg-white/[0.04]'}`}
              >
                <Flame
                  className={`h-4 w-4 ${semaforo.enabled && semaforo.hotCount > 0 ? 'text-rose-300' : 'text-zinc-400'}`}
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
            </div>

            {!semaforo.enabled ? (
              // Teaser para planes sin clasificación.
              <>
                <p className="text-sm font-medium text-zinc-300">
                  Sabé a quién llamar primero
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Con el plan Pro marcamos qué leads están calientes y listos para comprar.
                </p>
                <Link
                  href="/dashboard/plan"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Ver plan Pro
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </>
            ) : semaforo.hotCount === 0 ? (
              // Pro+ sin calientes pendientes: tono positivo, no vacío crudo.
              <>
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300">
                  <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  Estás al día
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Ningún lead caliente sin contactar ahora mismo.
                </p>
              </>
            ) : (
              // Pro+ con calientes: oportunidad, jamás reproche.
              <>
                <p className="text-2xl font-semibold tracking-tight text-rose-300">
                  {semaforo.hotCount} {semaforo.hotCount === 1 ? 'lead caliente' : 'leads calientes'}
                </p>
                <p className="text-xs text-zinc-500">esperándote</p>
                {semaforo.top && (
                  <Link
                    href={`${LEADS_HREF}/${semaforo.top.id}`}
                    className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-rose-400/20 bg-rose-400/5 px-3 py-2 transition-colors hover:bg-rose-400/10"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-zinc-200">
                        {urgentPhrase(semaforo.top)}
                      </span>
                      <span className="block text-[11px] text-zinc-500">
                        {formatRelativeAR(semaforo.top.capturedAt)}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-rose-300">
                      Contactar
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                    </span>
                  </Link>
                )}
              </>
            )}
          </div>
        </HoverTile>

        {/* 3 — ¿Qué tan rápido los atendí? */}
        <HoverTile delay={0.1}>
          <div className={TILE}>
            <div className="mb-3 flex items-start justify-between">
              <p className="text-xs tracking-tight text-zinc-500">Qué tan rápido respondés</p>
              <div className="rounded-md bg-white/[0.04] p-1.5">
                <Clock className="h-4 w-4 text-zinc-400" strokeWidth={1.5} aria-hidden />
              </div>
            </div>

            {velocity.avgMinutes == null ? (
              <p className="text-sm leading-relaxed text-zinc-400">
                Marcá <span className="font-medium text-zinc-200">&ldquo;Lo contacté&rdquo;</span> en
                tus leads y acá vas a ver qué tan rápido respondés — los negocios que responden en
                menos de una hora venden más.
              </p>
            ) : (
              <>
                <p className="text-3xl font-semibold tracking-tight text-zinc-100">
                  {formatVelocity(velocity.avgMinutes)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  promedio en contactar ({velocity.sampleSize}{' '}
                  {velocity.sampleSize === 1 ? 'lead' : 'leads'})
                </p>
              </>
            )}
          </div>
        </HoverTile>

        {/* 4 — ¿Cuánta plata representan? (interactivo) */}
        <FadeIn delay={0.15}>
          <MoneyEstimate leadCount={leads.current} initialTicketUsd={averageTicketUsd} />
        </FadeIn>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <Sparkles className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
        Tus leads en un solo lugar:{' '}
        <Link href={LEADS_HREF} className="text-zinc-400 underline-offset-2 hover:underline">
          ver Mis contactos
        </Link>
      </p>
    </section>
  )
}
