'use client'

import { ArrowRight, ArrowLeft, BarChart3, MessageCircle } from 'lucide-react'

interface Step2ConexionesProps {
  data: {
    ga4MeasurementId?: string
  }
  onChange: (data: { ga4MeasurementId?: string }) => void
  onBack: () => void
  onNext: () => void
  onSkip: () => void
}

export function Step2Conexiones({ data, onChange, onBack, onNext, onSkip }: Step2ConexionesProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          Conectá tus herramientas
        </h1>
        <p className="text-zinc-500">
          Para que veas datos reales en tu dashboard. Podés saltear este paso y conectar después.
        </p>
      </div>

      <div className="space-y-4">
        {/* GA4 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-cyan-500/10 p-2.5 text-cyan-400">
              <BarChart3 size={20} />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold text-white">Google Analytics 4</h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  ID de medición (formato G-XXXXXXX)
                </p>
              </div>
              <input
                type="text"
                value={data.ga4MeasurementId ?? ''}
                onChange={(e) => onChange({ ga4MeasurementId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Business — placeholder, lo conectamos después */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 opacity-60">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">WhatsApp Business</h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                Próximamente — lo configuramos juntos en tu primera reunión.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-zinc-400 hover:border-white/20"
        >
          <ArrowLeft size={14} />
          Atrás
        </button>
        <button
          onClick={onSkip}
          className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm text-zinc-400 hover:border-white/20"
        >
          Saltear por ahora
        </button>
        <button
          onClick={onNext}
          className="group flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-cyan-400"
        >
          Continuar
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
