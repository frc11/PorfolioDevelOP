'use client'

import type { StepProps, OnboardingState } from './types'

export function Step2BotIdentity({ state, update, onNext, onBack }: StepProps) {
  const canContinue = state.botName.length >= 2 && state.welcomeMessage.length >= 10

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">2. Identidad del Bot</h2>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Nombre del bot</label>
        <input
          type="text"
          value={state.botName}
          onChange={(e) => update({ botName: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
          placeholder="Ej: Asistente Virtual"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Mensaje de bienvenida</label>
        <textarea
          value={state.welcomeMessage}
          onChange={(e) => update({ welcomeMessage: e.target.value })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 resize-y"
          placeholder="Hola, ¿en qué puedo ayudarte hoy?"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Tono de conversación</label>
        <select
          value={state.tone}
          onChange={(e) => update({ tone: e.target.value as OnboardingState['tone'] })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
        >
          <option value="informal_rioplatense">Informal Rioplatense (vos)</option>
          <option value="formal">Formal (usted)</option>
          <option value="neutral">Neutral (tú)</option>
        </select>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-zinc-800 text-zinc-300 rounded font-medium hover:bg-zinc-700"
        >
          ← Volver
        </button>
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
