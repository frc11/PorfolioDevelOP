'use client'

import { Field } from '../Field'
import { Input } from '../Input'
import { Select } from '@/components/ui'
import { INDUSTRIES_LABELS } from '../../onboarding/industries'
import type { BotConfigTabProps } from '../types'

// Vocabulario canónico compartido con onboarding/creación/templates — el
// Select de edición debe emitir EXACTAMENTE los valores que esperan
// KB_TEMPLATES y los flujos de creación (un solo vocabulario en el sistema).
const INDUSTRIES = Object.entries(INDUSTRIES_LABELS).map(([value, label]) => ({ value, label }))

const TONES = [
  { value: 'informal_rioplatense', label: 'Informal rioplatense' },
  { value: 'formal', label: 'Formal' },
  { value: 'neutral', label: 'Neutral' },
]

export function IdentityTab({ state, update }: BotConfigTabProps) {
  return (
    <div className="space-y-6">
      <Field label="Nombre del bot" required hint="Como se presenta al usuario">
        <Input
          value={state.botName}
          onChange={(event) => update('botName', event.target.value)}
          placeholder="Lucia, Marcus, Asistente Legal..."
          maxLength={50}
        />
      </Field>

      <Field label="Industria" hint="Se usó para preparar el bot al crearlo. Cambiarla no regenera la KB.">
        <Select
          value={state.industry}
          onChange={(event) => update('industry', event.target.value)}
          options={INDUSTRIES}
        />
      </Field>

      <Field label="Tono" hint="Como habla el bot">
        <Select
          value={state.tone}
          onChange={(event) => update('tone', event.target.value)}
          options={TONES}
        />
      </Field>
    </div>
  )
}
