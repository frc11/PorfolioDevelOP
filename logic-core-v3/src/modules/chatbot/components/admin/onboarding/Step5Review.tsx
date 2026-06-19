'use client'

import { useState } from 'react'
import { CheckCircle2, Copy, Check, Mail, AlertTriangle } from 'lucide-react'
import type { OnboardingState } from './types'
import { createClientWithBot } from '../../../server/admin/createClientWithBot'
import { createClientOnly } from '../../../server/admin/createClientOnly'
import { INDUSTRIES_LABELS } from './industries'
import { slugify } from '@/lib/slugify'
import { useTransitionContext } from '@/context/TransitionContext'

interface Step5Props {
  state: OnboardingState
  onBack?: () => void
  onCreated: () => void
}

interface CreatedResult {
  withBot: boolean
  tempPassword: string
  botId: string | null
  orgSlug: string
  userName: string
  userEmail: string
  orgName: string
  emailSent: boolean
}

const TONE_LABELS: Record<OnboardingState['tone'], string> = {
  informal_rioplatense: 'Informal Rioplatense (vos)',
  formal: 'Formal (usted)',
  neutral: 'Neutral (tú)',
}

const AVATAR_LABELS: Record<OnboardingState['avatarStyle'], string> = {
  neuro: 'Neuro (Esfera de partículas)',
  legacy_neuro: 'Legacy Neuro (Avatar 3D)',
  image: 'Imagen',
  emoji: 'Emoji',
}

const POSITION_LABELS: Record<OnboardingState['position'], string> = {
  bottom_right: 'Abajo a la derecha',
  bottom_left: 'Abajo a la izquierda',
}

const KB_SECTIONS = [
  { key: 'businessInfo' as const, label: 'Sobre el negocio' },
  { key: 'servicesOrProducts' as const, label: 'Productos / Servicios' },
  { key: 'faq' as const, label: 'Preguntas frecuentes' },
  { key: 'policies' as const, label: 'Políticas' },
  { key: 'salesGuidance' as const, label: 'Guía de ventas' },
  { key: 'toneExamples' as const, label: 'Ejemplos de tono' },
  { key: 'forbiddenStatements' as const, label: 'No decir' },
]

export function Step5Review({ state, onBack, onCreated }: Step5Props) {
  const { triggerTransition } = useTransitionContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<CreatedResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      if (state.withBot) {
        const result = await createClientWithBot({
          ...state,
          position: state.position as 'bottom_right' | 'bottom_left',
        })
        onCreated()
        setCreated({
          withBot: true,
          tempPassword: result.tempPassword,
          botId: result.botId,
          orgSlug: result.orgSlug,
          userName: result.userName,
          userEmail: result.userEmail,
          orgName: result.orgName,
          emailSent: result.emailSent,
        })
      } else {
        const result = await createClientOnly({
          orgName: state.orgName,
          city: state.city,
          websiteUrl: state.websiteUrl,
          userEmail: state.userEmail,
          userName: state.userName,
          userPhone: state.userPhone || null,
        })
        onCreated()
        setCreated({
          withBot: false,
          tempPassword: result.tempPassword,
          botId: null,
          orgSlug: result.orgSlug,
          userName: result.userName,
          userEmail: result.userEmail,
          orgName: result.orgName,
          emailSent: result.emailSent,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el cliente.')
      setIsSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!created) return
    await navigator.clipboard.writeText(created.tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (created) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" strokeWidth={1.5} />
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">Cliente creado: {created.userName}</h2>
            <p className="text-sm text-zinc-400">
              {created.orgName} · {created.userEmail}
              {created.withBot && ` · bot: ${created.orgSlug}`}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5 space-y-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
              Password temporal — cópiala ahora, no se vuelve a mostrar
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-lg text-zinc-100 tracking-widest">
                {created.tempPassword}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" strokeWidth={1.5} />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-amber-300/70">
            El cliente va a tener que cambiarla al primer login.
          </p>
        </div>

        {created.emailSent ? (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>Email con credenciales enviado a {created.userEmail}</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>El email no pudo enviarse — copiá las credenciales y mandáselas manualmente al cliente.</span>
          </div>
        )}

        <button
          onClick={() =>
            triggerTransition(
              created.withBot && created.botId
                ? `/admin/chatbots/${created.botId}?tab=overview`
                : '/admin/clients',
            )
          }
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-medium text-zinc-950 hover:bg-cyan-300 transition-colors"
        >
          {created.withBot ? 'Ir al panel del cliente →' : 'Ir a la lista de clientes →'}
        </button>
      </div>
    )
  }

  const derivedSlug = slugify(state.orgName)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100 mb-1">
          Revisá todo antes de crear
        </h2>
        <p className="text-sm text-zinc-400">
          Una vez creado, podés seguir editando desde el panel del cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReviewSection title="Empresa">
          <ReviewRow label="Nombre" value={state.orgName} />
          {state.withBot && (
            <ReviewRow label="Industria" value={INDUSTRIES_LABELS[state.industry] ?? state.industry} />
          )}
          <ReviewRow label="Ciudad" value={state.city} />
          <ReviewRow label="Website" value={state.websiteUrl || '—'} />
          {state.withBot && <ReviewRow label="Slug del bot" value={derivedSlug} mono />}
        </ReviewSection>

        <ReviewSection title="Usuario administrador">
          <ReviewRow label="Nombre" value={state.userName || '—'} />
          <ReviewRow label="Email" value={state.userEmail || '—'} />
          <ReviewRow label="Teléfono" value={state.userPhone || '—'} />
        </ReviewSection>

        {state.withBot && (
          <>
        <ReviewSection title="Identidad del bot">
          <ReviewRow label="Nombre" value={state.botName} />
          <ReviewRow label="Tono" value={TONE_LABELS[state.tone]} />
          <ReviewRow label="Avatar" value={AVATAR_LABELS[state.avatarStyle]} />
          <ReviewRow
            label="Color"
            value={
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded-full border border-white/10"
                  style={{ backgroundColor: state.accentColor }}
                />
                <span className="font-mono text-xs">{state.accentColor}</span>
              </span>
            }
          />
          <ReviewRow label="Posición" value={POSITION_LABELS[state.position]} />
        </ReviewSection>

        <ReviewSection title="WhatsApp" full={false}>
          <ReviewRow label="Número" value={state.whatsappNumber || '—'} mono />
          <ReviewRow
            label="Quick replies"
            value={state.quickReplies.length > 0 ? `${state.quickReplies.length} configurados` : '—'}
          />
        </ReviewSection>

        <ReviewSection title="Mensaje de bienvenida" full>
          <p className="text-sm text-zinc-300 leading-relaxed bg-white/[0.02] rounded-xl p-4 border border-white/5">
            {state.welcomeMessage}
          </p>
        </ReviewSection>

        <ReviewSection title="Knowledge Base" full>
          <div className="space-y-2 text-sm">
            {KB_SECTIONS.map((s) => {
              const content = state[s.key]
              const length = content?.length ?? 0
              const hasContent = length >= 10
              return (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${hasContent ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {s.label}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    {length} chars
                  </span>
                </div>
              )
            })}
          </div>
        </ReviewSection>

        <ReviewSection title="LLM" full>
          <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-3">
            <ReviewRow label="Provider" value="Google (Vertex AI)" />
            <ReviewRow label="Modelo" value="gemini-2.5-flash" />
            <ReviewRow label="Quota" value="1000 conv/mes" mono />
          </div>
        </ReviewSection>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-medium mb-1">No se pudo crear el cliente</p>
          <p className="text-red-300/80 text-xs">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-medium hover:bg-zinc-700 disabled:opacity-40 transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-medium text-zinc-950 hover:bg-cyan-300 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" className="opacity-75" />
              </svg>
              Creando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
              {state.withBot ? 'Crear cliente y activar bot' : 'Crear cliente'}
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-zinc-500 text-center">
        {state.withBot
          ? 'El cliente se creará y el bot quedará activo inmediatamente.'
          : 'El cliente se creará y recibirá sus credenciales por email.'}
      </p>
    </div>
  )
}

function ReviewSection({
  title,
  children,
  full = false,
}: {
  title: string
  children: React.ReactNode
  full?: boolean
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-5 ${full ? 'lg:col-span-2' : ''}`}>
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-3">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={`text-zinc-200 ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  )
}
