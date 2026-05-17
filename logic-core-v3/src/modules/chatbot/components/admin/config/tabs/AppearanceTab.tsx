'use client'

import { ColorPicker } from '../ColorPicker'
import { Field } from '../Field'
import { Input } from '../Input'
import { Select } from '../Select'
import type { BotConfigTabProps } from '../types'

const AVATAR_STYLES = [
  { value: 'neuro', label: 'Neuro (particle sphere)' },
  { value: 'legacy_neuro', label: 'Legacy Neuro (3D face)' },
  { value: 'simple', label: 'Simple' },
  { value: 'emoji', label: 'Emoji' },
  { value: 'image', label: 'Imagen custom' },
]

export function AppearanceTab({ state, update }: BotConfigTabProps) {
  return (
    <div className="space-y-6">
      <Field label="Color de acento" required>
        <ColorPicker value={state.accentColor} onChange={(value) => update('accentColor', value)} />
      </Field>

      <Field label="Color secundario" hint="Opcional, para gradientes y acentos secundarios">
        <ColorPicker
          value={state.accentSecondary ?? ''}
          onChange={(value) => update('accentSecondary', value || null)}
          nullable
        />
      </Field>

      <Field label="Tinte del chat surface" hint="Color sutil del fondo del chat, opcional">
        <ColorPicker
          value={state.chatSurfaceTint ?? ''}
          onChange={(value) => update('chatSurfaceTint', value || null)}
          nullable
        />
      </Field>

      <Field label="Estilo del avatar">
        <Select
          value={state.avatarStyle}
          onChange={(event) => update('avatarStyle', event.target.value as typeof state.avatarStyle)}
          options={AVATAR_STYLES}
        />
      </Field>

      {state.avatarStyle === 'image' && (
        <Field label="URL de imagen del avatar" hint="Imagen cuadrada recomendada, 256x256+">
          <Input
            value={state.avatarImageUrl ?? ''}
            onChange={(event) => update('avatarImageUrl', event.target.value || null)}
            placeholder="https://..."
          />
        </Field>
      )}

      {state.avatarStyle === 'emoji' && (
        <Field label="Emoji del avatar" hint="Un solo emoji">
          <Input
            value={state.avatarEmoji ?? ''}
            onChange={(event) => update('avatarEmoji', event.target.value || null)}
            placeholder="Bot"
            maxLength={8}
          />
        </Field>
      )}
    </div>
  )
}
