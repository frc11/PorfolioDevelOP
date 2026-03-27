'use client'

import React, { useActionState, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  AlertTriangle,
  CreditCard,
  Check,
  X,
} from 'lucide-react'
import {
  updateProfileAction,
  updateContactAction,
  updatePasswordAction,
  updateNotificationPrefsAction,
  requestAccountDeletionAction,
  type ProfileActionState,
  type NotificationPrefs,
} from '@/lib/actions/profile'

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Feedback({ state }: { state: ProfileActionState }) {
  if (!state) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        state.ok
          ? 'border-green-500/20 bg-green-500/10 text-green-400'
          : 'border-red-500/20 bg-red-500/10 text-red-400'
      }`}
    >
      {state.ok ? (
        <CheckCircle size={14} className="flex-shrink-0" />
      ) : (
        <AlertCircle size={14} className="flex-shrink-0" />
      )}
      {state.ok ? 'Cambios guardados correctamente.' : state.error}
    </motion.div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-zinc-400">{children}</label>
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-zinc-600">{children}</p>
}

const INPUT_BASE =
  'rounded-lg border border-zinc-700/80 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20'
const INPUT_READONLY =
  'rounded-lg border border-zinc-800 bg-zinc-800/40 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed outline-none'

function InputField({
  label,
  name,
  type = 'text',
  defaultValue,
  readOnly,
  placeholder,
  autoComplete,
  hint,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  readOnly?: boolean
  placeholder?: string
  autoComplete?: string
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        readOnly={readOnly}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={readOnly ? INPUT_READONLY : INPUT_BASE}
      />
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  )
}

function SaveButton({ isPending, label = 'Guardar cambios' }: { isPending: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="flex items-center gap-2 self-start rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-cyan-500 disabled:opacity-50"
    >
      {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      {label}
    </button>
  )
}

// ─── Profile Header ───────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

interface ProfileHeaderProps {
  companyName: string
  email: string
  logoUrl: string | null
  planName: string | null
}

export function ProfileHeader({ companyName, email, logoUrl, planName }: ProfileHeaderProps) {
  const initials = getInitials(companyName) || '?'

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      className="flex flex-col items-center gap-6 rounded-2xl px-6 py-8 sm:flex-row sm:items-center sm:gap-8"
      style={{
        border: '1px solid rgba(6,182,212,0.15)',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Avatar */}
      <div
        className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
        style={{
          border: '2px solid rgba(6,182,212,0.35)',
          background: logoUrl
            ? 'transparent'
            : 'linear-gradient(135deg, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.04) 100%)',
          boxShadow: '0 0 28px rgba(6,182,212,0.12)',
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={companyName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl font-bold tracking-tight text-cyan-400">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{companyName}</h2>
        <p className="text-sm text-zinc-400">{email}</p>
        {planName && (
          <motion.span
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            {planName}
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Company Data Form ────────────────────────────────────────────────────────

interface CompanyDataFormProps {
  name: string
  email: string
  companyName: string
  logoUrl: string | null
}

export function CompanyDataForm({ name, email, companyName, logoUrl }: CompanyDataFormProps) {
  const [state, action, isPending] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    null
  )
  const [previewUrl, setPreviewUrl] = useState(logoUrl ?? '')

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <Feedback state={state} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Nombre de empresa *"
          name="companyName"
          defaultValue={companyName}
          placeholder="Acme Corp"
        />

        {/* Logo URL with live preview */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>URL del logo</FieldLabel>
          <input
            type="text"
            name="logoUrl"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="https://ejemplo.com/logo.png"
            className={INPUT_BASE}
          />
          <AnimatePresence>
            {previewUrl && isValidUrl(previewUrl) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-1 flex items-center gap-2.5 rounded-lg border border-zinc-700/40 bg-zinc-800/40 p-2">
                  <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-zinc-700/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-xs text-zinc-500">Preview del logo</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
          hint="El email no es editable."
        />
      </div>

      <SaveButton isPending={isPending} />
    </form>
  )
}

// ─── Contact Section ──────────────────────────────────────────────────────────

export function ContactSection({
  email,
  whatsapp,
}: {
  email: string
  whatsapp: string | null
}) {
  const [state, action, isPending] = useActionState<ProfileActionState, FormData>(
    updateContactAction,
    null
  )

  return (
    <form action={action} className="flex flex-col gap-5">
      <Feedback state={state} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InputField
          label="Email"
          name="_email"
          type="email"
          defaultValue={email}
          readOnly
          hint="Gestionado por el proveedor de autenticación."
        />

        {/* WhatsApp */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>WhatsApp</FieldLabel>
          <div className="flex overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-800/60 transition-colors focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20">
            <span className="flex select-none items-center border-r border-zinc-700/60 bg-zinc-800/80 px-3 text-xs text-zinc-500">
              +
            </span>
            <input
              type="tel"
              name="whatsapp"
              defaultValue={whatsapp ?? ''}
              placeholder="5491123456789"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>
          <FieldHint>Código de país + número sin espacios</FieldHint>
        </div>

        <InputField
          label="Zona horaria"
          name="_tz"
          defaultValue="America/Argentina/Buenos_Aires"
          readOnly
          hint="No configurable en esta versión."
        />
      </div>

      <SaveButton isPending={isPending} label="Guardar contacto" />
    </form>
  )
}

// ─── Password strength helper ─────────────────────────────────────────────────

function checkStrength(pw: string): {
  score: number
  label: string
  hasLength: boolean
  hasUpper: boolean
  hasNumber: boolean
} {
  const hasLength = pw.length >= 8
  const hasUpper = /[A-Z]/.test(pw)
  const hasNumber = /[0-9]/.test(pw)
  const score = [hasLength, hasUpper, hasNumber].filter(Boolean).length
  const label = score === 0 ? '' : score === 1 ? 'Débil' : score === 2 ? 'Media' : 'Fuerte'
  return { score, label, hasLength, hasUpper, hasNumber }
}

const STRENGTH_BAR: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-amber-400',
  3: 'bg-green-500',
}
const STRENGTH_TEXT: Record<number, string> = {
  1: 'text-red-400',
  2: 'text-amber-400',
  3: 'text-green-400',
}

// ─── Password Form ────────────────────────────────────────────────────────────

export function PasswordForm() {
  const [state, action, isPending] = useActionState<ProfileActionState, FormData>(
    updatePasswordAction,
    null
  )
  const [newPw, setNewPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const strength = checkStrength(newPw)

  return (
    <form action={action} className="flex flex-col gap-5">
      <Feedback state={state} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Current password */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Contraseña actual *</FieldLabel>
          <div className="flex overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-800/60 transition-colors focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20">
            <input
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              autoComplete="current-password"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-100 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              tabIndex={-1}
              className="flex items-center px-3 text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* New password + strength */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Nueva contraseña *</FieldLabel>
          <div className="flex overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-800/60 transition-colors focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20">
            <input
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              autoComplete="new-password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-100 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              tabIndex={-1}
              className="flex items-center px-3 text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {/* Strength bars */}
          <AnimatePresence>
            {newPw.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength.score >= i
                          ? (STRENGTH_BAR[strength.score] ?? 'bg-zinc-700')
                          : 'bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p
                    className={`mt-1 text-[10px] font-medium ${
                      STRENGTH_TEXT[strength.score] ?? 'text-zinc-500'
                    }`}
                  >
                    {strength.label}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Confirmar contraseña *</FieldLabel>
          <div className="flex overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-800/60 transition-colors focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-100 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              className="flex items-center px-3 text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Requirements checklist */}
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

      <SaveButton isPending={isPending} label="Cambiar contraseña" />
    </form>
  )
}

// ─── Notification Prefs Form ──────────────────────────────────────────────────

const NOTIF_CONFIG: {
  key: keyof NotificationPrefs
  label: string
  desc: string
}[] = [
  {
    key: 'projectUpdates',
    label: 'Notificaciones de proyecto',
    desc: 'Avances, entregas y cambios en tu proyecto.',
  },
  {
    key: 'teamMessages',
    label: 'Mensajes del equipo',
    desc: 'Mensajes directos del equipo develOP.',
  },
  {
    key: 'metricAlerts',
    label: 'Alertas de métricas',
    desc: 'Cuando tus métricas clave cambien significativamente.',
  },
  {
    key: 'developNews',
    label: 'Novedades de develOP',
    desc: 'Nuevas funciones, actualizaciones y anuncios.',
  },
]

export function NotificationPrefsForm({ initialPrefs }: { initialPrefs: NotificationPrefs }) {
  const [state, action, isPending] = useActionState<ProfileActionState, FormData>(
    updateNotificationPrefsAction,
    null
  )
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs)

  const toggle = (key: keyof NotificationPrefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }))

  return (
    <form action={action} className="flex flex-col gap-5">
      <Feedback state={state} />

      {/* Hidden inputs carry the state on submit */}
      {NOTIF_CONFIG.map(({ key }) => (
        <input key={key} type="hidden" name={key} value={String(prefs[key])} />
      ))}

      <div className="flex flex-col gap-2">
        {NOTIF_CONFIG.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg border border-zinc-700/40 bg-zinc-800/30 px-4 py-3"
          >
            <div className="flex flex-col gap-0.5 pr-4">
              <span className="text-sm font-medium text-zinc-200">{label}</span>
              <span className="text-xs text-zinc-500">{desc}</span>
            </div>
            {/* Toggle switch */}
            <button
              type="button"
              onClick={() => toggle(key)}
              aria-label={`Toggle ${label}`}
              className={`relative flex-shrink-0 rounded-full transition-colors duration-200 ${
                prefs[key] ? 'bg-cyan-600' : 'bg-zinc-700'
              }`}
              style={{ width: 44, height: 24 }}
            >
              <motion.span
                animate={{ x: prefs[key] ? 22 : 3 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="absolute rounded-full bg-white shadow-sm"
                style={{ width: 18, height: 18, top: 3 }}
              />
            </button>
          </div>
        ))}
      </div>

      <SaveButton isPending={isPending} label="Guardar preferencias" />
    </form>
  )
}

// ─── Plan Info Section ────────────────────────────────────────────────────────

interface PlanInfo {
  planName: string
  price: number
  currency: string
  renewalDate: string | null
  status: string
}

export function PlanInfoSection({ plan }: { plan: PlanInfo | null }) {
  if (!plan) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-500">No hay información de plan disponible.</p>
        <Link
          href="/dashboard/facturacion"
          className="flex w-fit items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
        >
          <CreditCard size={12} />
          Ver facturación
          <ExternalLink size={11} className="opacity-60" />
        </Link>
      </div>
    )
  }

  const renewalLabel = plan.renewalDate
    ? new Date(plan.renewalDate).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Sin fecha definida'

  const statusMap: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'Activo', color: 'text-green-400' },
    PAST_DUE: { label: 'Pago pendiente', color: 'text-amber-400' },
    CANCELED: { label: 'Cancelado', color: 'text-red-400' },
  }
  const statusInfo = statusMap[plan.status] ?? { label: plan.status, color: 'text-zinc-400' }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Plan
          </span>
          <span className="text-sm font-semibold text-white">{plan.planName}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Precio / mes
          </span>
          <span className="text-sm font-semibold text-white">
            {plan.currency} {plan.price.toLocaleString('es-AR')}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Próximo vencimiento
          </span>
          <span className="text-sm text-zinc-300">{renewalLabel}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Estado
          </span>
          <span className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>
      </div>

      <Link
        href="/dashboard/facturacion"
        className="flex w-fit items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs text-zinc-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
      >
        <CreditCard size={12} />
        Ver facturación completa
        <ExternalLink size={11} className="opacity-60" />
      </Link>
    </div>
  )
}

// ─── Danger Zone ──────────────────────────────────────────────────────────────

export function DangerZone() {
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'idle' | 'confirm' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleRequest = () => {
    startTransition(async () => {
      const result = await requestAccountDeletionAction()
      if (result?.ok) {
        setStep('done')
      } else {
        setError(result && !result.ok ? result.error : 'Ocurrió un error inesperado.')
        setStep('idle')
      }
    })
  }

  if (step === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-green-400"
      >
        <CheckCircle size={15} className="flex-shrink-0" />
        Solicitud enviada. Nuestro equipo se comunicará con vos a la brevedad.
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Podés solicitar la eliminación de tu cuenta y todos los datos asociados. Se generará un
        ticket de soporte de alta prioridad y nuestro equipo procesará la solicitud.
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-red-400"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 'idle' ? (
          <motion.button
            key="idle-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={() => setStep('confirm')}
            className="flex w-fit items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            <Trash2 size={14} />
            Solicitar eliminación de cuenta
          </motion.button>
        ) : (
          <motion.div
            key="confirm-box"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3 rounded-lg border border-red-500/30 p-4"
            style={{ background: 'rgba(239,68,68,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="flex-shrink-0 text-red-400" />
              <p className="text-sm font-semibold text-red-300">¿Estás seguro?</p>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500">
              Esta acción creará un ticket de soporte de alta prioridad. Tu cuenta y todos los datos
              asociados serán eliminados de forma permanente e irreversible.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequest}
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {isPending && <Loader2 size={11} className="animate-spin" />}
                Confirmar solicitud
              </button>
              <button
                type="button"
                onClick={() => setStep('idle')}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
