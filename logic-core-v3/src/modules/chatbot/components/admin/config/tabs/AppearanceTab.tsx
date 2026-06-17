'use client'

import { ColorPicker } from '../ColorPicker'
import { EmojiPickerField } from '../EmojiPickerField'
import { Field } from '../Field'
import { Input } from '../Input'
import { AvatarUploader } from './AvatarUploader'
import { AvatarPicker } from '@/modules/chatbot/components/avatar'
import { deriveBusinessInitials } from '@/modules/chatbot/shared/businessInitials'
import type { BotConfigTabProps } from '../types'

export function AppearanceTab({ state, update }: BotConfigTabProps) {
  const initials = deriveBusinessInitials(state.botName)

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

      <Field
        label="Estilo del avatar"
        hint="Hover sobre una opción para verla en estado activo. La elección se aplica al guardar."
      >
        <AvatarPicker
          value={state.avatarStyle}
          onChange={(id) => update('avatarStyle', id)}
          accentColor={state.accentColor}
          businessInitials={initials}
          includeEscapeHatches
          avatarImageUrl={state.avatarImageUrl}
          avatarEmoji={state.avatarEmoji}
        />
      </Field>

      {state.avatarStyle === 'image' && (
        <Field
          label="Imagen del avatar"
          hint="Subí una imagen cuadrada (256×256+) en JPG, PNG o WebP, o pegá una URL pública. El preview se ve arriba, en el avatar."
        >
          <div className="space-y-3">
            <AvatarUploader onUploaded={(url) => update('avatarImageUrl', url)} />
            <div>
              <Input
                value={state.avatarImageUrl ?? ''}
                onChange={(event) => update('avatarImageUrl', event.target.value || null)}
                placeholder="https://..."
              />
              {state.avatarImageUrl && !/^https?:\/\/.+/i.test(state.avatarImageUrl) && (
                <p className="mt-1 text-xs text-amber-400">
                  Debe ser una URL absoluta que empiece con http:// o https://
                </p>
              )}
            </div>
          </div>
        </Field>
      )}

      {state.avatarStyle === 'emoji' && (
        <Field label="Emoji del avatar" hint="Un solo emoji">
          <EmojiPickerField
            value={state.avatarEmoji}
            onChange={(value) => update('avatarEmoji', value)}
          />
        </Field>
      )}
    </div>
  )
}

