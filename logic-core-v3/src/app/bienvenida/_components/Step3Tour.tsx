'use client'

import { ArrowLeft, CheckCircle2, FileText, MessageSquare, BarChart3, Folder } from 'lucide-react'

interface Step3TourProps {
  onBack: () => void
  onComplete: () => void
  isPending: boolean
}

const FEATURES = [
  { icon: BarChart3, label: 'Métricas en tiempo real', description: 'Visitas, conversiones, leads' },
  { icon: Folder, label: 'Estado de tu proyecto', description: 'Avance, hitos, aprobaciones' },
  { icon: MessageSquare, label: 'Comunicación directa', description: 'Mensajes y soporte 24/7' },
  { icon: FileText, label: 'Reportes ejecutivos', description: 'PDF mensual con resultados' },
]

export function Step3Tour({ onBack, onComplete, isPending }: Step3TourProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          Listo. Esto es lo que vas a ver.
        </h1>
        <p className="text-zinc-500">
          Tu dashboard tiene 4 zonas principales. Cualquier duda, escribinos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, label, description }) => (
          <div
            key={label}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <Icon size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{label}</h4>
              <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-zinc-400 hover:border-white/20 disabled:opacity-40"
        >
          <ArrowLeft size={14} />
          Atrás
        </button>
        <button
          onClick={onComplete}
          disabled={isPending}
          className="group flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-cyan-400 disabled:opacity-40"
        >
          {isPending ? (
            <>Configurando...</>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Entrar al dashboard
            </>
          )}
        </button>
      </div>
    </div>
  )
}
