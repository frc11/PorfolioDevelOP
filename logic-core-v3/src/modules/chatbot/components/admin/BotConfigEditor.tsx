'use client'

import { useMemo, useState } from 'react'
import { Mail, RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { saveBotConfig, type BotConfigInput } from '../../server/admin/saveBotConfig'
import { saveBotConfigByOrgSlug } from '../../server/admin/saveBotConfigByOrgSlug'
import { runPreflightChecks, type PreflightCheck } from '../../server/admin/preflightChecks'
import { sendTestNotification } from '../../server/admin/sendTestNotification'
import { ActivationModal } from './activation/ActivationModal'
import { BotConfigDiffModal } from './config/BotConfigDiffModal'
import { BotConfigPreview, type BotPreviewState } from '../preview'
import { ConfigTabs, type ConfigTab } from './config/ConfigTabs'
import { AdvancedTab } from './config/tabs/AdvancedTab'
import { AppearanceTab } from './config/tabs/AppearanceTab'
import { BehaviorTab } from './config/tabs/BehaviorTab'
import { IdentityTab } from './config/tabs/IdentityTab'
import { StyleTab } from './config/tabs/StyleTab'
import type { BotConfigEditorState } from './config/types'

type BotConfigEditorInitial = BotConfigInput & {
  slug?: string
}

interface BotConfigEditorProps {
  initial: BotConfigEditorInitial
  orgSlug?: string
  onSave?: (input: BotConfigInput) => Promise<{ ok: boolean; error?: string }>
}

const DEFAULTS = {
  accentColor: '#06b6d4',
  borderRadius: 'medium',
  surfaceStyle: 'glass',
  position: 'bottom_right',
  fontStyle: 'sans',
  bubbleStyle: 'rounded',
  intensityLevel: 'medium',
  tone: 'informal_rioplatense',
  llmProvider: 'google',
  llmModel: 'gemini-2.5-flash',
  temperature: 0.7,
  maxOutputTokens: 800,
  monthlyQuota: 1000,
  industry: 'generic',
  leadNotificationMode: 'DISABLED',
} as const

export function BotConfigEditor({ initial, orgSlug, onSave }: BotConfigEditorProps) {
  const [initialState, setInitialState] = useState<BotConfigEditorState>(() => normalizeInitial(initial))
  const [state, setState] = useState<BotConfigEditorState>(() => normalizeInitial(initial))
  const [activeTab, setActiveTab] = useState<ConfigTab>('identity')
  const [activationChecks, setActivationChecks] = useState<PreflightCheck[]>([])
  const [showActivationModal, setShowActivationModal] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [saving, setSaving] = useState(false)
  const slug = initial.slug ?? orgSlug ?? 'sin-slug'

  const exposedCount = useMemo(() => countExposedEditableFields(state), [state])
  const hasChanges = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(initialState),
    [state, initialState],
  )

  function update<K extends keyof BotConfigEditorState>(key: K, value: BotConfigEditorState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  async function saveState(nextState: BotConfigEditorState) {
    if (onSave) {
      const result = await onSave(nextState)
      if (!result.ok) throw new Error(result.error ?? 'Error guardando')
      return result
    }

    const { botConfigId, ...restData } = nextState
    const result = orgSlug
      ? await saveBotConfigByOrgSlug({ orgSlug, ...restData })
      : await saveBotConfig({ ...nextState, botConfigId })

    if (!result.success) throw new Error(result.error ?? 'Error guardando')
    return result
  }

  async function handleConfirmSave() {
    setSaving(true)
    const savedState = { ...state }

    const promise = saveState(savedState).then(result => {
      setInitialState(savedState)
      setShowDiff(false)
      return result
    })

    toast.promise(promise, {
      loading: 'Guardando configuracion...',
      success: 'Cambios guardados',
      error: (error: Error) => `Error: ${error.message}`,
    })

    try {
      await promise
    } catch {
      // toast.promise muestra el error.
    } finally {
      setSaving(false)
    }
  }

  async function handleRequestActivation() {
    setSaving(true)
    try {
      const checks = await runPreflightChecks(state.botConfigId)
      setActivationChecks(checks)
      setShowActivationModal(true)
    } catch (error) {
      toast.error(`No se pudieron correr los checks: ${String(error)}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmActivation() {
    const nextState = { ...state, isActive: true }
    setSaving(true)

    const promise = saveState(nextState).then((result) => {
      setState(nextState)
      setInitialState(nextState)
      setShowActivationModal(false)
      return result
    })

    toast.promise(promise, {
      loading: 'Activando bot...',
      success: 'Bot activado',
      error: (error: Error) => `Error: ${error.message}`,
    })

    try {
      await promise
    } catch {
      // toast.promise muestra el error.
    } finally {
      setSaving(false)
    }
  }

  async function handleSendTest() {
    if (!state.leadNotificationEmail) {
      toast.error('Configura un email primero')
      return
    }

    const promise = sendTestNotification({
      orgSlug: orgSlug ?? 'develop',
      email: state.leadNotificationEmail,
    }).then((result) => {
      if (!result.success) throw new Error(result.error ?? 'No se pudo enviar')
      return result
    })

    toast.promise(promise, {
      loading: 'Enviando email de prueba...',
      success: 'Email enviado',
      error: (error: Error) => `Error: ${error.message}`,
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-100">
                Configuracion del bot
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Slug: <span className="font-mono text-cyan-400">{slug}</span>
                <span className="ml-3 text-xs text-zinc-600">{exposedCount} campos editables expuestos</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Barra de cambios sin guardar — inline en el header. Antes era `fixed bottom-6`,
                  pero el <main> de AdminLayoutClient tiene backdrop-filter y atrapa el position:fixed. */}
              {hasChanges && (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.06] px-3 py-2">
                  <p className="text-sm text-cyan-300">Tenés cambios sin guardar</p>
                  <button
                    type="button"
                    onClick={() => setState(initialState)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/[0.06] disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDiff(true)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-1.5 text-sm font-medium text-zinc-950 hover:bg-cyan-300 disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Revisar y guardar
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={handleSendTest}
                disabled={saving || !state.leadNotificationEmail}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] disabled:opacity-50"
              >
                <Mail className="h-4 w-4" strokeWidth={1.5} />
                Test email
              </button>
            </div>
          </div>

          <ConfigTabs active={activeTab} onChange={setActiveTab} />

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            {activeTab === 'identity' && (
              <IdentityTab
                state={state}
                update={update}
                onRequestActivation={handleRequestActivation}
              />
            )}
            {activeTab === 'appearance' && <AppearanceTab state={state} update={update} />}
            {activeTab === 'style' && <StyleTab state={state} update={update} />}
            {activeTab === 'behavior' && <BehaviorTab state={state} update={update} />}
            {activeTab === 'advanced' && <AdvancedTab state={state} update={update} />}
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <BotConfigPreview state={adminStateToPreview(state)} />
        </aside>
      </div>

      <ActivationModal
        open={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onConfirm={handleConfirmActivation}
        checks={activationChecks}
        loading={saving}
        botName={state.botName}
        botSlug={slug}
      />

      <BotConfigDiffModal
        open={showDiff}
        onClose={() => setShowDiff(false)}
        onConfirm={handleConfirmSave}
        before={initialState}
        after={state}
        loading={saving}
      />
    </>
  )
}

function normalizeInitial(initial: BotConfigEditorInitial): BotConfigEditorState {
  return {
    botConfigId: initial.botConfigId,
    botName: initial.botName ?? 'Asistente',
    isActive: Boolean(initial.isActive),
    industry: initial.industry ?? DEFAULTS.industry,
    tone: initial.tone ?? DEFAULTS.tone,
    welcomeMessage: initial.welcomeMessage ?? '',
    accentColor: initial.accentColor ?? DEFAULTS.accentColor,
    accentSecondary: initial.accentSecondary ?? null,
    chatSurfaceTint: initial.chatSurfaceTint ?? null,
    avatarStyle: initial.avatarStyle ?? 'neuro',
    avatarImageUrl: initial.avatarImageUrl ?? null,
    avatarEmoji: initial.avatarEmoji ?? null,
    borderRadius: initial.borderRadius ?? DEFAULTS.borderRadius,
    surfaceStyle: initial.surfaceStyle ?? DEFAULTS.surfaceStyle,
    position: initial.position ?? DEFAULTS.position,
    fontStyle: initial.fontStyle ?? DEFAULTS.fontStyle,
    bubbleStyle: initial.bubbleStyle ?? DEFAULTS.bubbleStyle,
    intensityLevel: initial.intensityLevel ?? DEFAULTS.intensityLevel,
    whatsappNumber: initial.whatsappNumber ?? null,
    whatsappMessage: initial.whatsappMessage ?? null,
    llmProvider: initial.llmProvider ?? DEFAULTS.llmProvider,
    llmModel: initial.llmModel ?? DEFAULTS.llmModel,
    temperature: Number(initial.temperature ?? DEFAULTS.temperature),
    maxOutputTokens: Number(initial.maxOutputTokens ?? DEFAULTS.maxOutputTokens),
    monthlyQuota: Number(initial.monthlyQuota ?? DEFAULTS.monthlyQuota),
    quickReplies: normalizeQuickReplies(initial.quickReplies),
    proactivePrompts: normalizeProactivePrompts(initial.proactivePrompts),
    routeColorMap: normalizeRouteColorMap(initial.routeColorMap),
    leadNotificationEmail: initial.leadNotificationEmail ?? null,
    leadNotificationMode: initial.leadNotificationMode ?? DEFAULTS.leadNotificationMode,
    allowedDomains: Array.isArray(initial.allowedDomains) ? initial.allowedDomains : [],
  }
}

function normalizeQuickReplies(value: unknown): BotConfigEditorState['quickReplies'] {
  if (!Array.isArray(value)) return []
  const out: BotConfigEditorState['quickReplies'] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const label = typeof record.label === 'string' ? record.label : ''
    const promptToSend =
      typeof record.promptToSend === 'string'
        ? record.promptToSend
        : typeof record.prompt === 'string'
          ? record.prompt
          : ''
    out.push({
      id: typeof record.id === 'string' ? record.id : crypto.randomUUID(),
      emoji: typeof record.emoji === 'string' ? record.emoji : '',
      label,
      promptToSend,
    })
    if (out.length >= 8) break
  }
  return out
}

function normalizeProactivePrompts(value: unknown): BotConfigEditorState['proactivePrompts'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: BotConfigEditorState['proactivePrompts'] = {}
  for (const [route, prompts] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(prompts)) continue
    out[route] = prompts.filter((prompt): prompt is string => typeof prompt === 'string').slice(0, 8)
  }
  return out
}

function normalizeRouteColorMap(value: unknown): BotConfigEditorState['routeColorMap'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: BotConfigEditorState['routeColorMap'] = {}
  for (const [route, color] of Object.entries(value as Record<string, unknown>)) {
    if (typeof color === 'string') out[route] = color
  }
  return out
}

function countExposedEditableFields(_state: BotConfigEditorState): number {
  return 28
}

/** CC.4 — Adapta el state del editor admin al subset que consume el preview compartido. */
function adminStateToPreview(state: BotConfigEditorState): BotPreviewState {
  return {
    botName: state.botName,
    isActive: state.isActive,
    accentColor: state.accentColor,
    chatSurfaceTint: state.chatSurfaceTint,
    position: state.position,
    avatarStyle: state.avatarStyle,
    avatarImageUrl: state.avatarImageUrl,
    avatarEmoji: state.avatarEmoji,
    borderRadius: state.borderRadius,
    bubbleStyle: state.bubbleStyle,
    surfaceStyle: state.surfaceStyle,
    intensityLevel: state.intensityLevel,
    fontStyle: state.fontStyle,
    welcomeMessage: state.welcomeMessage,
    quickReplies: state.quickReplies.map((reply) => ({
      id: reply.id,
      emoji: reply.emoji,
      label: reply.label,
    })),
  }
}
