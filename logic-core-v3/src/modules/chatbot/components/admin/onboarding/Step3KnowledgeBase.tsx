'use client'

import { useEffect } from 'react'
import type { StepProps } from './types'
import { getTemplate } from './kb-templates'
import { ExpandableTextField } from './ExpandableTextField'

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

      <ExpandableTextField
        label="Información de negocio"
        value={state.businessInfo}
        onChange={(value) => update({ businessInfo: value })}
        rows={4}
      />

      <ExpandableTextField
        label="Servicios o Productos"
        value={state.servicesOrProducts}
        onChange={(value) => update({ servicesOrProducts: value })}
        rows={4}
      />

      <ExpandableTextField
        label="Preguntas Frecuentes (FAQ)"
        value={state.faq}
        onChange={(value) => update({ faq: value })}
        rows={3}
      />

      <ExpandableTextField
        label="Políticas"
        value={state.policies}
        onChange={(value) => update({ policies: value })}
        rows={2}
      />

      <ExpandableTextField
        label="Guía de Ventas (Derivación)"
        value={state.salesGuidance}
        onChange={(value) => update({ salesGuidance: value })}
        rows={2}
      />

      <ExpandableTextField
        label="Ejemplos de Tono"
        value={state.toneExamples}
        onChange={(value) => update({ toneExamples: value })}
        rows={2}
      />

      <ExpandableTextField
        label="Frases Prohibidas"
        value={state.forbiddenStatements}
        onChange={(value) => update({ forbiddenStatements: value })}
        rows={2}
      />

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
