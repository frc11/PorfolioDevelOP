'use client'

import type { StepProps } from './types'
import type { Industry } from '../../../server/admin/createClientWithBot'
import { INDUSTRIES_LABELS } from './industries'
import { slugify } from '@/lib/slugify'

export function Step1Company({ state, update, onNext }: StepProps) {
  const canContinue = state.orgName.length >= 2 && state.city.length >= 2

  const handleOrgNameChange = (value: string) => {
    update({ orgName: value })
  }

  const derivedSlug = slugify(state.orgName)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">1. Datos de la empresa</h2>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Nombre de la empresa</label>
        <input
          type="text"
          value={state.orgName}
          onChange={(e) => handleOrgNameChange(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
          placeholder="Ej: Concesionaria San Miguel"
        />
        {state.orgName.length >= 2 && (
          <p className="text-xs text-zinc-500 mt-1.5">
            URL del bot:{' '}
            <span className="font-mono text-cyan-400/80">/api/chatbot/{derivedSlug}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Industria</label>
        <select
          value={state.industry}
          onChange={(e) => update({ industry: e.target.value as Industry })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
        >
          {Object.entries(INDUSTRIES_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Ciudad</label>
        <input
          type="text"
          value={state.city}
          onChange={(e) => update({ city: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
          placeholder="Ej: Tucumán"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">URL del sitio web (opcional)</label>
        <input
          type="url"
          value={state.websiteUrl ?? ''}
          onChange={(e) => update({ websiteUrl: e.target.value || null })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
          placeholder="https://..."
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="px-6 py-2 bg-cyan-500 text-zinc-950 rounded font-medium disabled:opacity-40"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
