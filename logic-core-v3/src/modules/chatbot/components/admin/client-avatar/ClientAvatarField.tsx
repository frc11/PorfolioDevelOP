'use client'

import { Field, Input } from '@/components/ui'
import { AvatarUploader } from '@/modules/chatbot/components/admin/config/tabs/AvatarUploader'
import { EmojiPickerField } from '@/modules/chatbot/components/admin/config/EmojiPickerField'
import { ClientAvatar } from './ClientAvatar'

export interface ClientAvatarValue {
  avatarImageUrl: string | null
  avatarEmoji: string | null
  avatarInitials: string | null
}

interface ClientAvatarFieldProps {
  value: ClientAvatarValue
  onChange: (next: ClientAvatarValue) => void
  companyName: string
}

// Control del avatar del cliente: imagen (subida + comprimida en el browser,
// reusa AvatarUploader del bot → data URL base64), emoji (EmojiPickerField
// compartido) e iniciales a mano (máx 2, NO derivadas del nombre). El preview
// refleja el fallback real (imagen > emoji > iniciales > ícono neutro).
export function ClientAvatarField({
  value,
  onChange,
  companyName,
}: ClientAvatarFieldProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ClientAvatar
          companyName={companyName || 'Cliente'}
          avatarImageUrl={value.avatarImageUrl}
          avatarEmoji={value.avatarEmoji}
          avatarInitials={value.avatarInitials}
          size={56}
          className="border border-white/10"
        />
        <div className="flex flex-col gap-1.5">
          <AvatarUploader
            onUploaded={(dataUrl) =>
              onChange({ ...value, avatarImageUrl: dataUrl })
            }
          />
          {value.avatarImageUrl && (
            <button
              type="button"
              onClick={() => onChange({ ...value, avatarImageUrl: null })}
              className="self-start text-xs text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Quitar imagen
            </button>
          )}
        </div>
      </div>

      <Field label="Emoji" hint="Opcional. Se usa si no hay imagen.">
        <EmojiPickerField
          value={value.avatarEmoji}
          onChange={(emoji) => onChange({ ...value, avatarEmoji: emoji })}
        />
      </Field>

      <Field
        label="Iniciales"
        hint="Opcional, máx 2 caracteres a mano. Se usan si no hay imagen ni emoji."
      >
        <Input
          value={value.avatarInitials ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              avatarInitials: event.target.value.toUpperCase().slice(0, 2) || null,
            })
          }
          maxLength={2}
          placeholder="Ej: SM"
          className="w-24 uppercase"
        />
      </Field>
    </div>
  )
}
