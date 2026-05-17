'use client'

import { Field } from '../Field'
import { Input } from '../Input'
import { Select } from '../Select'
import { Toggle } from '../Toggle'
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
  { value: 'formal_neutral', label: 'Formal neutro' },
  { value: 'professional', label: 'Profesional' },
  { value: 'friendly', label: 'Amigable' },
  { value: 'casual', label: 'Casual' },
]

interface IdentityTabProps extends BotConfigTabProps {
  onRequestActivation: () => void
}

export function IdentityTab({ state, update, onRequestActivation }: IdentityTabProps) {
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

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-200">Bot activo</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Cuando esta activo, responde en produccion
            </p>
          </div>
          <Toggle
            checked={state.isActive}
            onChange={(value) => {
              if (value) {
                onRequestActivation()
              } else {
                update('isActive', false)
              }
            }}
            label="Bot activo"
          />
        </div>
      </div>
    </div>
  )
}
