'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { cambiarPasswordAction } from './actions'
import { Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { toast } from 'sonner'

interface Props {
  forceChange: boolean
  userEmail: string
}

// Regla de password única en todo el producto (espejo de checkStrength del
// PasswordForm de Mi Cuenta): 8 caracteres + una mayúscula + un número.
function checkStrength(pw: string) {
  const hasLength = pw.length >= 8
  const hasUpper = /[A-Z]/.test(pw)
  const hasNumber = /[0-9]/.test(pw)
  const score = [hasLength, hasUpper, hasNumber].filter(Boolean).length
  return { score, hasLength, hasUpper, hasNumber }
}

// Campo de password con visor. ui/Input es frozen y no tiene slot de adorno, así
// que acá se usa el input directo dentro del <Field> con el botón Eye/EyeOff al
// lado (mismo patrón que PasswordForm: tabIndex={-1}, ojo abierto = muestra).
function PasswordInput({
  value,
  onChange,
  invalid,
  autoComplete,
  autoFocus,
  show,
  onToggle,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  invalid?: boolean
  autoComplete: string
  autoFocus?: boolean
  show: boolean
  onToggle: () => void
  ariaLabel: string
}) {
  return (
    <div
      className={`flex overflow-hidden rounded-xl border bg-white/[0.02] transition-colors ${
        invalid
          ? 'border-red-400/40 focus-within:border-red-400/60'
          : 'border-white/10 focus-within:border-cyan-400/30'
      }`}
    >
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-200 outline-none"
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        aria-label={ariaLabel}
        className="flex items-center px-3 text-zinc-500 transition-colors hover:text-zinc-300"
      >
        {show ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
      </button>
    </div>
  )
}

export function CambiarPasswordForm({ forceChange, userEmail }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const strength = checkStrength(newPassword)
  const missing = [
    !strength.hasLength && '8+ caracteres',
    !strength.hasUpper && 'una mayúscula',
    !strength.hasNumber && 'un número',
  ].filter(Boolean) as string[]
  const canSubmit = strength.score === 3

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!oldPassword) e.oldPassword = 'Requerido'
    if (newPassword.length < 8) e.newPassword = 'Mínimo 8 caracteres'
    else if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      e.newPassword = 'Debe tener una mayúscula y un número'
    }
    if (newPassword !== confirmPassword) {
      e.confirmPassword = 'Las contraseñas no coinciden'
    }
    if (oldPassword && oldPassword === newPassword) {
      e.newPassword = 'La nueva debe ser distinta a la actual'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Mecanismo intacto (ya es seguro): invocación directa + await + navegación DESPUÉS
  // del await, con el cookie ya en sessionVersion N+1. No se toca auth.ts.
  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (pending || !canSubmit) return
    if (!validate()) return

    startTransition(async () => {
      const result = await cambiarPasswordAction({ oldPassword, newPassword })

      if (result.ok) {
        toast.success('Contraseña cambiada correctamente')
        router.push('/dashboard')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-zinc-500">
          Cuenta: <span className="text-zinc-300">{userEmail}</span>
        </p>

        <Field label="Contraseña actual" error={errors.oldPassword} required>
          <PasswordInput
            value={oldPassword}
            onChange={setOldPassword}
            invalid={Boolean(errors.oldPassword)}
            autoComplete="current-password"
            autoFocus
            show={showOld}
            onToggle={() => setShowOld((v) => !v)}
            ariaLabel={showOld ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
          />
        </Field>

        <Field
          label="Nueva contraseña"
          hint="Mínimo 8 caracteres con una mayúscula y un número"
          error={errors.newPassword}
          required
        >
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            invalid={Boolean(errors.newPassword)}
            autoComplete="new-password"
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
            ariaLabel={showNew ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
          />
        </Field>

        <Field label="Confirmar nueva contraseña" error={errors.confirmPassword} required>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            invalid={Boolean(errors.confirmPassword)}
            autoComplete="new-password"
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            ariaLabel={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
          />
        </Field>

        {/* Requisitos — resumen de lo que falta + chips por requisito (espejo PasswordForm). */}
        {newPassword.length > 0 && missing.length > 0 && (
          <p className="text-[11px] font-medium text-amber-400">Falta: {missing.join(', ')}.</p>
        )}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {[
            { ok: strength.hasLength, label: '8+ caracteres' },
            { ok: strength.hasUpper, label: 'Una mayúscula' },
            { ok: strength.hasNumber, label: 'Un número' },
          ].map((req) => (
            <div key={req.label} className="flex items-center gap-1.5 text-[11px]">
              {req.ok ? (
                <Check size={11} className="text-green-400" />
              ) : (
                <X size={11} className="text-zinc-600" />
              )}
              <span className={req.ok ? 'text-green-400' : 'text-zinc-600'}>{req.label}</span>
            </div>
          ))}
        </div>

        <Button type="submit" loading={pending} disabled={!canSubmit} className="w-full">
          Cambiar contraseña
        </Button>

        {!forceChange && (
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Cancelar
          </button>
        )}
      </form>
    </Card>
  )
}
