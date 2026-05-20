'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cambiarPasswordAction } from './actions'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { toast } from 'sonner'

interface Props {
  forceChange: boolean
  userEmail: string
}

export function CambiarPasswordForm({ forceChange, userEmail }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!oldPassword) e.oldPassword = 'Requerido'
    if (newPassword.length < 8) e.newPassword = 'Mínimo 8 caracteres'
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      e.newPassword = 'Debe tener letras y números'
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

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
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
          <Input
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            invalid={Boolean(errors.oldPassword)}
            autoFocus
            autoComplete="current-password"
          />
        </Field>

        <Field
          label="Nueva contraseña"
          hint="Mínimo 8 caracteres con letras y números"
          error={errors.newPassword}
          required
        >
          <Input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            invalid={Boolean(errors.newPassword)}
            autoComplete="new-password"
          />
        </Field>

        <Field label="Confirmar nueva contraseña" error={errors.confirmPassword} required>
          <Input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            invalid={Boolean(errors.confirmPassword)}
            autoComplete="new-password"
          />
        </Field>

        <Button type="submit" loading={pending} className="w-full">
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
