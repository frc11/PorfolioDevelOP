'use client'

import type { StepProps, OnboardingState } from './types'

export function Step4Appearance({ state, update, onNext, onBack }: StepProps) {
  const canContinue = /^#[0-9a-fA-F]{6}$/.test(state.accentColor)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">4. Apariencia y Operativo</h2>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Color de Acento (Hex)</label>
        <input
          type="color"
          value={state.accentColor}
          onChange={(e) => update({ accentColor: e.target.value })}
          className="w-full h-10 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Estilo de Avatar</label>
        <select
          value={state.avatarStyle}
          onChange={(e) => update({ avatarStyle: e.target.value as OnboardingState['avatarStyle'] })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
        >
          <option value="neuro">Neuro (Esfera de partículas)</option>
          <option value="legacy_neuro">Legacy Neuro (Avatar 3D)</option>
          <option value="image">Imagen</option>
          <option value="emoji">Emoji</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Posición en la pantalla</label>
        <select
          value={state.position}
          onChange={(e) => update({ position: e.target.value as OnboardingState['position'] })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
        >
          <option value="bottom_right">Abajo a la derecha</option>
          <option value="bottom_left">Abajo a la izquierda</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Número de WhatsApp (opcional)</label>
        <input
          type="text"
          value={state.whatsappNumber ?? ''}
          onChange={(e) => update({ whatsappNumber: e.target.value || null })}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
          placeholder="Ej: 5493815555555"
        />
        <p className="text-xs text-zinc-500 mt-1">Con código de país, sin el +.</p>
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
