'use client'

import { Field, Input, Select } from '@/components/ui'
import { ColorPicker } from '../config/ColorPicker'
import { EmojiPickerField } from '../config/EmojiPickerField'
import { AvatarUploader } from '../config/tabs/AvatarUploader'
import { AvatarPicker } from '@/modules/chatbot/components/avatar'
import { deriveBusinessInitials } from '@/modules/chatbot/shared/businessInitials'
import { normalizeWhatsapp, isValidWhatsapp } from '@/modules/chatbot/shared/field-normalize'
import type { StepProps, OnboardingState } from './types'

const HEX_RE = /^#[0-9a-fA-F]{6}$/
// Los colores opcionales pueden quedar vacíos (null) o ser un hex completo. El
// ColorPicker emite cualquier texto tipeado, así que gateamos acá para no llegar
// al submit con un hex parcial (que Zod rechazaría).
const optHexValid = (color: string | null) => !color || HEX_RE.test(color)

export function Step4Appearance({ state, update, onNext, onBack }: StepProps) {
  // WhatsApp opcional: vacío vale; si hay valor, deben ser 10–15 dígitos (el
  // campo guarda solo dígitos). Sin prefill: '549' solo rompía la validación.
  const waDigits = state.whatsappNumber ?? ''
  const waValid = waDigits === '' || isValidWhatsapp(waDigits)

  const canContinue =
    HEX_RE.test(state.accentColor) &&
    optHexValid(state.accentSecondary) &&
    optHexValid(state.chatSurfaceTint) &&
    waValid

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">4. Apariencia y Operativo</h2>

      <Field label="Color de acento" required>
        <ColorPicker value={state.accentColor} onChange={(value) => update({ accentColor: value })} />
      </Field>

      <Field label="Color secundario" hint="Opcional, para gradientes y acentos secundarios">
        <ColorPicker
          value={state.accentSecondary ?? ''}
          onChange={(value) => update({ accentSecondary: value || null })}
          nullable
        />
      </Field>

      <Field label="Tinte del chat surface" hint="Color sutil del fondo del chat, opcional">
        <ColorPicker
          value={state.chatSurfaceTint ?? ''}
          onChange={(value) => update({ chatSurfaceTint: value || null })}
          nullable
        />
      </Field>

      <Field
        label="Estilo del avatar"
        hint="Pasá el mouse sobre una opción para verla en estado activo. Se aplica al crear."
      >
        <AvatarPicker
          value={state.avatarStyle}
          onChange={(id) => update({ avatarStyle: id })}
          accentColor={state.accentColor}
          businessInitials={deriveBusinessInitials(state.botName)}
          includeEscapeHatches
          avatarImageUrl={state.avatarImageUrl}
          avatarEmoji={state.avatarEmoji}
        />
      </Field>

      {state.avatarStyle === 'image' && (
        <Field
          label="Imagen del avatar"
          hint="Subí una imagen (JPG, PNG o WebP). Se recorta y comprime a 200×200 en tu navegador y se guarda con el bot."
        >
          <AvatarUploader onUploaded={(dataUrl) => update({ avatarImageUrl: dataUrl })} />
        </Field>
      )}

      {state.avatarStyle === 'emoji' && (
        <Field label="Emoji del avatar" hint="Un solo emoji">
          <EmojiPickerField
            value={state.avatarEmoji}
            onChange={(value) => update({ avatarEmoji: value })}
          />
        </Field>
      )}

      <Field label="Posición en la pantalla">
        <Select
          value={state.position}
          onChange={(e) => update({ position: e.target.value as OnboardingState['position'] })}
          aria-label="Posición en la pantalla"
        >
          <option value="bottom_right">Abajo a la derecha</option>
          <option value="bottom_left">Abajo a la izquierda</option>
        </Select>
      </Field>

      <Field
        label="Número de WhatsApp"
        hint="Solo números, con código de país, sin + ni espacios. Ej: 5491155551234. Dejalo vacío si no aplica."
        error={waDigits !== '' && !waValid ? 'Ingresá entre 10 y 15 dígitos (con código de país).' : undefined}
      >
        <Input
          type="tel"
          inputMode="numeric"
          value={state.whatsappNumber ?? ''}
          onChange={(e) => update({ whatsappNumber: normalizeWhatsapp(e.target.value) })}
          invalid={waDigits !== '' && !waValid}
          placeholder="Ej: 5491155551234"
        />
      </Field>

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
