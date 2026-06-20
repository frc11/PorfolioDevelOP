'use client'

import { useState } from 'react'
import { AlertTriangle, ArrowLeft, Loader2, Save } from 'lucide-react'
import { Card, Field, Input } from '@/components/ui'
import { useTransitionContext } from '@/context/TransitionContext'
import { updateClient } from '@/modules/chatbot/server/admin/updateClient'
import { normalizeWebsiteUrl, isValidWebsiteUrl } from '@/modules/chatbot/shared/field-normalize'
import { TEXTAREA_CLASS } from '@/modules/chatbot/components/admin/onboarding/field-styles'
import {
  ClientAvatarField,
  type ClientAvatarValue,
} from '@/modules/chatbot/components/admin/client-avatar/ClientAvatarField'

const INTERNAL_NOTES_MAX = 5000

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface EditClientFormProps {
  clientId: string
  hasAdminUser: boolean
  initial: {
    orgName: string
    city: string
    internalNotes: string
    avatarImageUrl: string | null
    avatarEmoji: string | null
    avatarInitials: string | null
    websiteUrl: string | null
    userEmail: string
    userName: string
    userPhone: string
  }
}

// Editor de UNA pantalla (sin wizard, sin bot): empresa + usuario admin. Estética
// del creador (Field/Input del sistema, full-width en 2 columnas). Validación
// inline por campo; el submit llama a updateClient y vuelve al detalle.
export function EditClientForm({ clientId, hasAdminUser, initial }: EditClientFormProps) {
  const { triggerTransition } = useTransitionContext()
  const [orgName, setOrgName] = useState(initial.orgName)
  const [city, setCity] = useState(initial.city)
  const [internalNotes, setInternalNotes] = useState(initial.internalNotes)
  const [avatar, setAvatar] = useState<ClientAvatarValue>({
    avatarImageUrl: initial.avatarImageUrl,
    avatarEmoji: initial.avatarEmoji,
    avatarInitials: initial.avatarInitials,
  })
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl ?? '')
  const [userEmail, setUserEmail] = useState(initial.userEmail)
  const [userName, setUserName] = useState(initial.userName)
  const [userPhone, setUserPhone] = useState(initial.userPhone)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detailHref = `/admin/clients/${clientId}`

  const emailValid = EMAIL_RE.test(userEmail)
  const websiteNormalized = normalizeWebsiteUrl(websiteUrl)
  const websiteValid =
    websiteUrl.trim() === '' || (websiteNormalized !== null && isValidWebsiteUrl(websiteNormalized))
  const cityValid = city.trim() === '' || city.trim().length >= 2

  const canSubmit =
    hasAdminUser &&
    orgName.trim().length >= 2 &&
    userName.trim().length >= 2 &&
    emailValid &&
    websiteValid &&
    cityValid &&
    !submitting

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await updateClient({
        organizationId: clientId,
        orgName: orgName.trim(),
        city: city.trim() || null,
        internalNotes: internalNotes.trim() || null,
        avatarImageUrl: avatar.avatarImageUrl,
        avatarEmoji: avatar.avatarEmoji,
        avatarInitials: avatar.avatarInitials,
        websiteUrl: websiteNormalized,
        userEmail: userEmail.trim(),
        userName: userName.trim(),
        userPhone: userPhone.trim() || null,
      })
      triggerTransition(detailHref)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!hasAdminUser && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>Este cliente no tiene un usuario administrador; no se pueden editar sus datos.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card variant="elevated" padding="lg">
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-zinc-100">Empresa</h2>
            <Field label="Nombre de la empresa" required>
              <Input
                value={orgName}
                onChange={(event) => setOrgName(event.target.value)}
                placeholder="Ej: Concesionaria San Miguel"
              />
            </Field>
            <Field
              label="Ciudad"
              hint="Opcional"
              error={city.trim() !== '' && !cityValid ? 'La ciudad debe tener al menos 2 caracteres.' : undefined}
            >
              <Input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                invalid={city.trim() !== '' && !cityValid}
                placeholder="Ej: Tucumán"
              />
            </Field>
            <Field
              label="URL del sitio web"
              hint="Opcional. Podés escribir el dominio solo; le agregamos https:// automáticamente."
              error={websiteUrl.trim() !== '' && !websiteValid ? 'URL inválida. Ej: empresa.com.ar' : undefined}
            >
              <Input
                type="url"
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                onBlur={() => setWebsiteUrl(normalizeWebsiteUrl(websiteUrl) ?? '')}
                invalid={websiteUrl.trim() !== '' && !websiteValid}
                placeholder="empresa.com.ar"
              />
            </Field>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-zinc-100">Usuario administrador</h2>
            <Field
              label="Email"
              required
              error={userEmail.length > 0 && !emailValid ? 'Email inválido' : undefined}
            >
              <Input
                type="email"
                value={userEmail}
                onChange={(event) => setUserEmail(event.target.value)}
                invalid={userEmail.length > 0 && !emailValid}
                disabled={!hasAdminUser}
                placeholder="cliente@empresa.com"
              />
            </Field>
            <Field label="Nombre completo" required>
              <Input
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                disabled={!hasAdminUser}
                placeholder="Ej: Lucía Pereyra"
              />
            </Field>
            <Field label="Teléfono" hint="Opcional">
              <Input
                type="tel"
                value={userPhone}
                onChange={(event) => setUserPhone(event.target.value)}
                disabled={!hasAdminUser}
                placeholder="+54 9 11 1234-5678"
              />
            </Field>
          </div>
        </Card>
      </div>

      <Card variant="elevated" padding="lg">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">Avatar del cliente</h2>
          <ClientAvatarField
            value={avatar}
            onChange={setAvatar}
            companyName={orgName}
          />
        </div>
      </Card>

      <Card variant="elevated" padding="lg">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-100">Notas internas</h2>
          <Field
            label="Notas del equipo develOP"
            hint="Solo visibles para el equipo. El cliente no las ve."
          >
            <textarea
              value={internalNotes}
              onChange={(event) => setInternalNotes(event.target.value)}
              className={TEXTAREA_CLASS}
              rows={4}
              maxLength={INTERNAL_NOTES_MAX}
              placeholder="Contexto, acuerdos o recordatorios internos sobre este cliente..."
            />
          </Field>
          <p className="text-right text-xs text-zinc-600">
            {internalNotes.length}/{INTERNAL_NOTES_MAX}
          </p>
        </div>
      </Card>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
          <div>
            <p className="font-medium">No se pudo guardar</p>
            <p className="text-xs text-red-300/80">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => triggerTransition(detailHref)}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.05] disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-cyan-300 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.5} />
          )}
          Guardar cambios
        </button>
      </div>
    </form>
  )
}
