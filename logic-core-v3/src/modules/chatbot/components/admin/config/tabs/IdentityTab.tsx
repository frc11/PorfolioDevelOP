'use client'

import { Field } from '../Field'
import { Input } from '../Input'
import { Select } from '@/components/ui'
import type { BotConfigTabProps } from '../types'

const INDUSTRIES = [
  { value: 'generic', label: 'Generico' },
  { value: 'agency', label: 'Agencia' },
  { value: 'legal', label: 'Legal / Estudio juridico' },
  { value: 'medical', label: 'Medico / Consultorio' },
  { value: 'dental', label: 'Dental' },
  { value: 'automotive', label: 'Automotriz' },
  { value: 'gym', label: 'Gimnasio' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'real_estate', label: 'Inmobiliaria' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'beauty', label: 'Belleza' },
  { value: 'education', label: 'Educacion' },
  { value: 'concesionaria_autos', label: 'Concesionaria autos' },
  { value: 'clinica_medica', label: 'Clinica medica' },
  { value: 'odontologia', label: 'Odontologia' },
  { value: 'distribuidora', label: 'Distribuidora' },
  { value: 'constructora', label: 'Constructora' },
  { value: 'contable', label: 'Contable' },
]

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

      <Field label="Industria" hint="Define templates y comportamiento por defecto">
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
