'use client'

import { ArrowRight, Building2 } from 'lucide-react'

interface Step1EmpresaProps {
  data: {
    companyName: string
    contactEmail: string
    whatsapp: string
    rubro?: 'automotive' | 'health' | 'fitness' | 'beauty' | 'gastronomy' | 'retail' | 'real-estate' | 'other'
  }
  onChange: (data: Step1EmpresaProps['data']) => void
  onNext: () => void
}

const RUBROS = [
  { value: 'automotive', label: 'Concesionaria / Automotor' },
  { value: 'health', label: 'Salud / Consultorio' },
  { value: 'fitness', label: 'Gimnasio / Fitness' },
  { value: 'beauty', label: 'Estética / Peluquería' },
  { value: 'gastronomy', label: 'Gastronomía / Restaurante' },
  { value: 'retail', label: 'Comercio / Retail' },
  { value: 'real-estate', label: 'Inmobiliaria' },
  { value: 'other', label: 'Otro' },
] as const

export function Step1Empresa({ data, onChange, onNext }: Step1EmpresaProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          Bienvenido a <span className="text-cyan-400">develOP</span>
        </h1>
        <p className="text-zinc-500">
          Empezamos por conocer un poco tu negocio.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Nombre del negocio *
          </label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => onChange({ ...data, companyName: e.target.value })}
            placeholder="Concesionaria San Miguel"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Email de contacto
          </label>
          <input
            type="email"
            value={data.contactEmail}
            onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
            placeholder="contacto@tunegocio.com"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            WhatsApp
          </label>
          <input
            type="tel"
            value={data.whatsapp}
            onChange={(e) => onChange({ ...data, whatsapp: e.target.value })}
            placeholder="+54 9 381 ..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            ¿A qué se dedica tu negocio?
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RUBROS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => onChange({ ...data, rubro: r.value })}
                className={`rounded-lg border px-3 py-2.5 text-left text-xs transition ${
                  data.rubro === r.value
                    ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                    : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!data.companyName.trim()}
        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continuar
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  )
}
