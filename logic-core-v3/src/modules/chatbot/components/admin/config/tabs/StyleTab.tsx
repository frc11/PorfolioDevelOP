'use client'

import { Field } from '../Field'
import { Select } from '../Select'
import type { BotConfigTabProps } from '../types'

export function StyleTab({ state, update }: BotConfigTabProps) {
  return (
    <div className="space-y-6">
      <Field label="Border radius">
        <Select
          value={state.borderRadius}
          onChange={(event) => update('borderRadius', event.target.value as typeof state.borderRadius)}
          options={[
            { value: 'small', label: 'Pequeno' },
            { value: 'medium', label: 'Medio' },
            { value: 'large', label: 'Grande' },
          ]}
        />
      </Field>

      <Field label="Surface style">
        <Select
          value={state.surfaceStyle}
          onChange={(event) => update('surfaceStyle', event.target.value as typeof state.surfaceStyle)}
          options={[
            { value: 'glass', label: 'Glass' },
            { value: 'solid', label: 'Solido' },
            { value: 'minimal', label: 'Minimal' },
          ]}
        />
      </Field>

      <Field label="Posicion">
        <Select
          value={state.position}
          onChange={(event) => update('position', event.target.value as typeof state.position)}
          options={[
            { value: 'bottom_right', label: 'Inferior derecha' },
            { value: 'bottom_left', label: 'Inferior izquierda' },
          ]}
        />
      </Field>

      <Field label="Fuente">
        <Select
          value={state.fontStyle}
          onChange={(event) => update('fontStyle', event.target.value as typeof state.fontStyle)}
          options={[
            { value: 'sans', label: 'Sans' },
            { value: 'serif', label: 'Serif' },
            { value: 'mono', label: 'Mono' },
          ]}
        />
      </Field>

      <Field label="Estilo de burbujas">
        <Select
          value={state.bubbleStyle}
          onChange={(event) => update('bubbleStyle', event.target.value as typeof state.bubbleStyle)}
          options={[
            { value: 'sharp', label: 'Sharp' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'pill', label: 'Pill' },
          ]}
        />
      </Field>

      <Field label="Intensidad visual">
        <Select
          value={state.intensityLevel}
          onChange={(event) => update('intensityLevel', event.target.value as typeof state.intensityLevel)}
          options={[
            { value: 'low', label: 'Baja' },
            { value: 'medium', label: 'Media' },
            { value: 'high', label: 'Alta' },
          ]}
        />
      </Field>
    </div>
  )
}
