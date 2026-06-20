'use client'

import { Input, Select } from '@/components/ui'
import { ClientAvatarField } from '@/modules/chatbot/components/admin/client-avatar/ClientAvatarField'
import type { StepProps } from './types'
import type { Industry } from '../../../server/admin/createClientWithBot'
import { INDUSTRIES_LABELS } from './industries'
import { normalizeWebsiteUrl, isValidWebsiteUrl } from '@/modules/chatbot/shared/field-normalize'
import { slugify } from '@/lib/slugify'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Step1Company({ state, update, onNext }: StepProps) {
  const emailValid = EMAIL_RE.test(state.userEmail)
  const emailTouched = state.userEmail.length > 0

  // Web opcional: se acepta el dominio pelado (le agregamos https:// al normalizar).
  const websiteRaw = state.websiteUrl ?? ''
  const websiteNormalized = normalizeWebsiteUrl(websiteRaw)
  const websiteValid =
    websiteRaw.trim() === '' || (websiteNormalized !== null && isValidWebsiteUrl(websiteNormalized))

  const canContinue =
    state.orgName.length >= 2 &&
    state.city.length >= 2 &&
    emailValid &&
    state.userName.length >= 2 &&
    websiteValid

  const handleOrgNameChange = (value: string) => {
    update({ orgName: value })
  }

  const derivedSlug = slugify(state.orgName)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-100">1. Datos de la empresa</h2>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm font-medium text-zinc-200 mb-1">¿Este cliente va a tener chatbot?</p>
        <p className="text-xs text-zinc-500 mb-3">
          Con chatbot configurás identidad, conocimiento y apariencia. Sin chatbot creás solo la cuenta del cliente.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={state.withBot}
            onClick={() => update({ withBot: true })}
            className={`rounded-lg border px-4 py-2.5 text-sm transition-colors ${
              state.withBot
                ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'
                : 'border-white/10 text-zinc-400 hover:border-white/20'
            }`}
          >
            Con chatbot
          </button>
          <button
            type="button"
            aria-pressed={!state.withBot}
            onClick={() => update({ withBot: false })}
            className={`rounded-lg border px-4 py-2.5 text-sm transition-colors ${
              !state.withBot
                ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'
                : 'border-white/10 text-zinc-400 hover:border-white/20'
            }`}
          >
            Sin chatbot
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Nombre de la empresa</label>
        <Input
          type="text"
          value={state.orgName}
          onChange={(e) => handleOrgNameChange(e.target.value)}
          placeholder="Ej: Concesionaria San Miguel"
        />
        {state.withBot && state.orgName.length >= 2 && (
          <p className="text-xs text-zinc-500 mt-1.5">
            URL del bot:{' '}
            <span className="font-mono text-cyan-400/80">/api/chatbot/{derivedSlug}</span>
          </p>
        )}
      </div>

      {state.withBot && (
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Industria</label>
          <Select
            value={state.industry}
            onChange={(e) => update({ industry: e.target.value as Industry })}
            aria-label="Industria"
          >
            {Object.entries(INDUSTRIES_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
      )}

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Ciudad</label>
        <Input
          type="text"
          value={state.city}
          onChange={(e) => update({ city: e.target.value })}
          placeholder="Ej: Tucumán"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">URL del sitio web (opcional)</label>
        <Input
          type="url"
          value={state.websiteUrl ?? ''}
          onChange={(e) => update({ websiteUrl: e.target.value || null })}
          onBlur={() => update({ websiteUrl: normalizeWebsiteUrl(state.websiteUrl) })}
          invalid={websiteRaw.trim() !== '' && !websiteValid}
          placeholder="empresa.com.ar"
        />
        {websiteRaw.trim() !== '' && !websiteValid ? (
          <p className="text-xs text-red-400 mt-1">URL inválida. Ej: empresa.com.ar</p>
        ) : (
          <p className="text-xs text-zinc-500 mt-1">Podés escribir el dominio solo; le agregamos https:// automáticamente.</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-2">Avatar del cliente (opcional)</label>
        <ClientAvatarField
          value={{
            avatarImageUrl: state.clientAvatarImageUrl,
            avatarEmoji: state.clientAvatarEmoji,
            avatarInitials: state.clientAvatarInitials,
          }}
          onChange={(next) =>
            update({
              clientAvatarImageUrl: next.avatarImageUrl,
              clientAvatarEmoji: next.avatarEmoji,
              clientAvatarInitials: next.avatarInitials,
            })
          }
          companyName={state.orgName}
        />
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Usuario administrador</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Nombre completo del cliente</label>
            <Input
              type="text"
              value={state.userName}
              onChange={(e) => update({ userName: e.target.value })}
              placeholder="Ej: Lucía Pereyra"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email del cliente</label>
            <Input
              type="email"
              value={state.userEmail}
              onChange={(e) => update({ userEmail: e.target.value })}
              invalid={emailTouched && !emailValid}
              placeholder="cliente@empresa.com"
            />
            {emailTouched && !emailValid && (
              <p className="text-xs text-red-400 mt-1">Email inválido</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Teléfono de contacto{' '}
              <span className="text-zinc-600">(opcional)</span>
            </label>
            <Input
              type="tel"
              value={state.userPhone}
              onChange={(e) => update({ userPhone: e.target.value })}
              placeholder="+54 9 11 1234-5678"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
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
