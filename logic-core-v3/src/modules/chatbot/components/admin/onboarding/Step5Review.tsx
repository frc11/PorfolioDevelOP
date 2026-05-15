'use client'

import { useState } from 'react'
import type { StepProps } from './types'
import { createClientWithBot } from '../../../server/admin/createClientWithBot'

type Step5Props = Omit<StepProps, 'onNext' | 'update'>

export function Step5Review({ state, onBack }: Step5Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await createClientWithBot({
        ...state,
        // Enforce specific position type for z.enum mapping
        position: state.position as 'bottom_right' | 'bottom_left'
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el cliente y bot.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">5. Revisión Final</h2>
      <p className="text-sm text-zinc-400">Verificá los datos antes de crear la organización y el chatbot.</p>

      <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-4 text-sm text-zinc-300">
        <div>
          <span className="font-semibold text-zinc-100">Empresa:</span> {state.orgName} ({state.industry}) - {state.city}
        </div>
        <div>
          <span className="font-semibold text-zinc-100">Bot:</span> {state.botName}
        </div>
        <div>
          <span className="font-semibold text-zinc-100">Tono:</span> {state.tone}
        </div>
        <div>
          <span className="font-semibold text-zinc-100">Acento Visual:</span>{' '}
          <span className="inline-block w-4 h-4 rounded-full border border-zinc-700 align-middle" style={{ backgroundColor: state.accentColor }} />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-2 bg-zinc-800 text-zinc-300 rounded font-medium hover:bg-zinc-700 disabled:opacity-40"
        >
          ← Volver
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-cyan-500 text-zinc-950 rounded font-medium disabled:opacity-40 flex items-center gap-2"
        >
          {isSubmitting ? 'Creando...' : 'Crear cliente y bot'}
        </button>
      </div>
    </div>
  )
}
