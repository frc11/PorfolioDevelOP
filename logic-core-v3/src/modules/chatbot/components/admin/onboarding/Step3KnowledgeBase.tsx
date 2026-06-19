'use client'

import { useEffect } from 'react'
import type { StepProps } from './types'
import { getTemplate } from './kb-templates'
import { TEXTAREA_CLASS } from './field-styles'

export function Step3KnowledgeBase({ state, update, onNext, onBack }: StepProps) {
  useEffect(() => {
    if (!state.businessInfo) {
      const template = getTemplate(state.industry)
      update({
        businessInfo: template.businessInfo,
        servicesOrProducts: template.servicesOrProducts,
        faq: template.faq,
        policies: template.policies,
        salesGuidance: template.salesGuidance,
        toneExamples: template.toneExamples,
        forbiddenStatements: template.forbiddenStatements,
        quickReplies: template.quickReplies,
      })
    }
  }, [state.industry]) // Only run if industry changes or on mount (if empty)

  const canContinue =
    state.businessInfo.length >= 20 &&
    state.servicesOrProducts.length >= 20 &&
    state.faq.length >= 10 &&
    state.policies.length >= 10 &&
    state.salesGuidance.length >= 10 &&
    state.toneExamples.length >= 10 &&
    state.forbiddenStatements.length >= 10

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">3. Base de Conocimiento</h2>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Información de negocio</label>
        <textarea
          value={state.businessInfo}
          onChange={(e) => update({ businessInfo: e.target.value })}
          className={TEXTAREA_CLASS}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Servicios o Productos</label>
        <textarea
          value={state.servicesOrProducts}
          onChange={(e) => update({ servicesOrProducts: e.target.value })}
          className={TEXTAREA_CLASS}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Preguntas Frecuentes (FAQ)</label>
        <textarea
          value={state.faq}
          onChange={(e) => update({ faq: e.target.value })}
          className={TEXTAREA_CLASS}
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Políticas</label>
        <textarea
          value={state.policies}
          onChange={(e) => update({ policies: e.target.value })}
          className={TEXTAREA_CLASS}
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Guía de Ventas (Derivación)</label>
        <textarea
          value={state.salesGuidance}
          onChange={(e) => update({ salesGuidance: e.target.value })}
          className={TEXTAREA_CLASS}
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Ejemplos de Tono</label>
        <textarea
          value={state.toneExamples}
          onChange={(e) => update({ toneExamples: e.target.value })}
          className={TEXTAREA_CLASS}
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Frases Prohibidas</label>
        <textarea
          value={state.forbiddenStatements}
          onChange={(e) => update({ forbiddenStatements: e.target.value })}
          className={TEXTAREA_CLASS}
          rows={2}
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-medium hover:bg-zinc-700"
        >
          ← Volver
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="px-6 py-2 bg-cyan-500 text-zinc-950 rounded-xl font-medium disabled:opacity-40"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
