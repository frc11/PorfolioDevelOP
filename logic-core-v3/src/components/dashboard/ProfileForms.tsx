'use client'

import { useActionState } from 'react'
import {
  updateProfileAction,
  updatePasswordAction,
  type ProfileActionState,
} from '@/lib/actions/profile'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Feedback({ state }: { state: ProfileActionState }) {
  if (!state) return null
  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400">
        <CheckCircle size={14} className="flex-shrink-0" />
        Cambios guardados correctamente.
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
      <AlertCircle size={14} className="flex-shrink-0" />
      {state.error}
    </div>
  )
}

function InputField({
  label,
  name,
  type = 'text',
  defaultValue,
  readOnly,
  placeholder,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  readOnly?: boolean
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        readOnly={readOnly}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={[
          'rounded-md border px-3 py-2 text-sm outline-none transition-colors',
          readOnly
            ? 'cursor-not-allowed border-zinc-800 bg-zinc-800/50 text-zinc-500'
            : 'border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30',
        ].join(' ')}
      />
      {readOnly && (
        <p className="text-[10px] text-zinc-600">Este campo no es editable.</p>
      )}
    </div>
  )
}

function SubmitButton({
  isPending,
  label,
}: {
  isPending: boolean
  label: string
}) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="flex items-center gap-2 self-start rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
    >
      {isPending && <Loader2 size={13} className="animate-spin" />}
      {label}
    </button>
  )
}

// ─── Profile form ─────────────────────────────────────────────────────────────

interface ProfileFormProps {
  name: string
  email: string
  companyName: string
  logoUrl: string | null
}

export function ProfileForm({
  name,
  email,
  companyName,
  logoUrl,
}: ProfileFormProps) {
  const [state, action, isPending] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    null
  )

  return (
    <form action={action} className="flex flex-col gap-4">
      <Feedback state={state} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Nombre de empresa *"
          name="companyName"
          defaultValue={companyName}
          placeholder="Acme Corp"
        />
        <InputField
          label="URL del logo"
          name="logoUrl"
          defaultValue={logoUrl ?? ''}
          placeholder="https://..."
        />
        <InputField
          label="Nombre de contacto *"
          name="name"
          defaultValue={name}
          placeholder="Juan García"
          autoComplete="name"
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          defaultValue={email}
          readOnly
        />
      </div>

      <SubmitButton isPending={isPending} label="Guardar cambios" />
    </form>
  )
}

// ─── Password form ────────────────────────────────────────────────────────────

export function PasswordForm() {
  const [state, action, isPending] = useActionState<ProfileActionState, FormData>(
    updatePasswordAction,
    null
  )

  return (
    <form action={action} className="flex flex-col gap-4">
      <Feedback state={state} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputField
          label="Contraseña actual *"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
        />
        <InputField
          label="Nueva contraseña *"
          name="newPassword"
          type="password"
          autoComplete="new-password"
        />
        <InputField
          label="Confirmar nueva contraseña *"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
        />
      </div>

      <p className="text-xs text-zinc-600">Mínimo 8 caracteres.</p>

      <SubmitButton isPending={isPending} label="Cambiar contraseña" />
    </form>
  )
}
