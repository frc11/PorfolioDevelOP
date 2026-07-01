'use client'

/**
 * P5.1 — Sección "Ideas para crecer" del home del cliente.
 *
 * Presentacional: recibe las recomendaciones ya construidas por el motor de
 * reglas (server) y las muestra en tarjetas B13. El cierre en un tap reusa
 * `requestUpsellAction` (org-scoped por sesión — el cliente no pasa orgId) y
 * lleva a /dashboard/messages con el mensaje pre-llenado. Si no dispara ninguna
 * recomendación → estado vacío honesto, nunca un consejo inventado.
 */
import { useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Flame,
  Loader2,
  MapPin,
  Sparkles,
  Star,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { requestUpsellAction } from '@/lib/actions/upsell'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { EmptyStateMuted } from '@/components/ui/EmptyStateMuted'
import { cn } from '@/lib/utils'
import type {
  Recommendation,
  RecommendationAccent,
  RecommendationIconKey,
} from '@/lib/recommendations/types'

const ICONS: Record<RecommendationIconKey, LucideIcon> = {
  star: Star,
  mapPin: MapPin,
  fileText: FileText,
  flame: Flame,
  sparkles: Sparkles,
}

const ACCENT: Record<RecommendationAccent, { icon: string; iconBox: string; cta: string }> = {
  cyan: {
    icon: 'text-cyan-300',
    iconBox: 'border-cyan-400/20 bg-cyan-400/10',
    cta: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15',
  },
  emerald: {
    icon: 'text-emerald-300',
    iconBox: 'border-emerald-400/20 bg-emerald-400/10',
    cta: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15',
  },
  amber: {
    icon: 'text-amber-300',
    iconBox: 'border-amber-400/20 bg-amber-400/10',
    cta: 'border-amber-400/25 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15',
  },
  violet: {
    icon: 'text-violet-300',
    iconBox: 'border-violet-400/20 bg-violet-400/10',
    cta: 'border-violet-400/25 bg-violet-400/10 text-violet-200 hover:bg-violet-400/15',
  },
}

type ReqStatus = 'idle' | 'success' | 'error'

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [status, setStatus] = useState<ReqStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const Icon = ICONS[rec.icon]
  const accent = ACCENT[rec.accent]
  const isSuccess = status === 'success'

  const handleClick = () => {
    if (isPending || isSuccess) return
    setErrorMsg(null)
    startTransition(async () => {
      const result = await requestUpsellAction(rec.cta.featureKey, rec.cta.featureName)

      if (result.success) {
        setStatus('success')
        const params = new URLSearchParams({ context: rec.cta.messageContext })
        if (rec.cta.moduleName) params.set('moduleName', rec.cta.moduleName)
        // Navegación imperativa post-submit (portal — sin Shutter). `assign` es
        // inmune a la carrera con el revalidatePath('/dashboard') que hace la
        // acción; mismo patrón probado que UpgradeCtaButton.
        window.location.assign(`/dashboard/messages?${params.toString()}`)
        return
      }

      setStatus('error')
      setErrorMsg(result.error ?? 'No se pudo enviar la solicitud.')
      setTimeout(() => {
        setStatus('idle')
        setErrorMsg(null)
      }, 3500)
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-start">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
          accent.iconBox,
        )}
      >
        <Icon className={accent.icon} size={18} strokeWidth={1.5} aria-hidden="true" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-sm font-medium text-zinc-100">{rec.title}</h3>
        <p className="text-sm leading-relaxed text-zinc-400">{rec.body}</p>
        {status === 'error' && errorMsg && (
          <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-red-400">
            <AlertCircle size={11} strokeWidth={1.5} />
            {errorMsg}
          </p>
        )}
      </div>

      <div className="shrink-0 sm:pt-0.5">
        <motion.button
          type="button"
          onClick={handleClick}
          disabled={isPending || isSuccess}
          whileTap={!isPending && !isSuccess ? { scale: 0.97 } : undefined}
          className={cn(
            'inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition sm:w-auto motion-reduce:transition-none',
            isSuccess
              ? 'cursor-default border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
              : `${accent.cta} disabled:cursor-not-allowed disabled:opacity-50`,
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isPending ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2"
              >
                <Loader2 size={13} strokeWidth={1.5} className="animate-spin" />
                Enviando…
              </motion.span>
            ) : isSuccess ? (
              <motion.span
                key="success"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={13} strokeWidth={1.5} />
                Solicitud enviada
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2"
              >
                {rec.cta.label}
                <ArrowRight size={13} strokeWidth={1.5} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
}

export function Recommendations({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Ideas para crecer
      </h2>

      {recommendations.length === 0 ? (
        <EmptyStateMuted
          icon={Sparkles}
          title="Todavía no hay sugerencias para vos"
          description="Cuando tu asistente sume más actividad, acá van a aparecer ideas concretas para aprovechar mejor tus consultas. Solo cuando los números lo justifican, nunca inventadas."
          className="py-10"
        />
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <FadeIn key={rec.id} delay={index * 0.06}>
              <RecommendationCard rec={rec} />
            </FadeIn>
          ))}
        </div>
      )}
    </section>
  )
}
