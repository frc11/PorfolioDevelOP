'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Step1Company } from './Step1Company'
import { Step2BotIdentity } from './Step2BotIdentity'
import { Step3KnowledgeBase } from './Step3KnowledgeBase'
import { Step4Appearance } from './Step4Appearance'
import { Step5Review } from './Step5Review'
import { ProgressBar } from './ProgressBar'
import { DraftBanner } from './DraftBanner'
import { useOnboardingDraft } from './useOnboardingDraft'
import { BotConfigPreview, type BotPreviewState } from '@/modules/chatbot/components/preview'
import type { OnboardingState } from './types'

const STEP_LABELS = {
  company: 'Empresa',
  bot: 'Bot',
  kb: 'KB',
  appearance: 'Apariencia',
  review: 'Review',
} as const

type StepKey = keyof typeof STEP_LABELS

// La secuencia de pasos depende del toggle con/sin bot. Sin bot: solo empresa + review.
const WITH_BOT_STEPS: readonly StepKey[] = ['company', 'bot', 'kb', 'appearance', 'review']
const NO_BOT_STEPS: readonly StepKey[] = ['company', 'review']

// Mapea el estado del wizard al subset que consume el preview compartido del bot
// (mismo componente que la config). Los tokens que el wizard no edita
// (radio/burbuja/superficie/fuente/intensidad) usan los MISMOS defaults con que
// createClientWithBot crea el BotConfig → el preview es WYSIWYG con lo que se crea.
function onboardingToPreview(state: OnboardingState): BotPreviewState {
  return {
    botName: state.botName,
    isActive: true,
    accentColor: state.accentColor,
    accentSecondary: state.accentSecondary,
    chatSurfaceTint: state.chatSurfaceTint,
    position: state.position,
    avatarStyle: state.avatarStyle,
    avatarImageUrl: state.avatarImageUrl,
    avatarEmoji: state.avatarEmoji,
    borderRadius: 'medium',
    bubbleStyle: 'rounded',
    surfaceStyle: 'glass',
    intensityLevel: 'MEDIUM',
    fontStyle: 'sans',
    welcomeMessage: state.welcomeMessage,
    quickReplies: state.quickReplies.map((reply) => ({ id: reply.id, label: reply.label })),
  }
}

const INITIAL_STATE: OnboardingState = {
  withBot: true,
  orgName: '',
  industry: 'generico',
  city: '',
  websiteUrl: null,
  botName: '',
  welcomeMessage: '',
  tone: 'informal_rioplatense',
  businessInfo: '',
  servicesOrProducts: '',
  faq: '',
  policies: '',
  salesGuidance: '',
  toneExamples: '',
  forbiddenStatements: '',
  accentColor: '#06b6d4',
  accentSecondary: null,
  chatSurfaceTint: null,
  avatarStyle: 'legacy_neuro',
  avatarImageUrl: null,
  avatarEmoji: null,
  position: 'bottom_right',
  quickReplies: [],
  whatsappNumber: null,
  userEmail: '',
  userName: '',
  userPhone: '',
}

export function OnboardingWizard() {
  const {
    state,
    setState,
    step,
    setStep,
    hasDraft,
    draftSavedAt,
    clearDraft,
    discardDraft,
    dismissDraftBanner,
  } = useOnboardingDraft(INITIAL_STATE)

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const stepKeys = state.withBot ? WITH_BOT_STEPS : NO_BOT_STEPS
  const stepNames = stepKeys.map((key) => STEP_LABELS[key])
  // Clamp defensivo: si el toggle reduce los pasos estando en uno posterior.
  const safeStep = Math.min(step, stepKeys.length - 1)
  const currentKey = stepKeys[safeStep]

  const next = () => setStep((s) => Math.min(s + 1, stepKeys.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="space-y-6">
      {hasDraft && (
        <DraftBanner
          savedAt={draftSavedAt}
          onContinue={dismissDraftBanner}
          onDiscard={discardDraft}
        />
      )}

      <ProgressBar currentStep={safeStep} totalSteps={stepKeys.length} stepNames={stepNames} />

      <div className={state.withBot ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8' : ''}>
        {/* Steps */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {currentKey === 'company' && <Step1Company state={state} update={updateState} onNext={next} />}
              {currentKey === 'bot' && <Step2BotIdentity state={state} update={updateState} onNext={next} onBack={back} />}
              {currentKey === 'kb' && <Step3KnowledgeBase state={state} update={updateState} onNext={next} onBack={back} />}
              {currentKey === 'appearance' && <Step4Appearance state={state} update={updateState} onNext={next} onBack={back} />}
              {currentKey === 'review' && <Step5Review state={state} onBack={back} onCreated={clearDraft} />}
            </motion.div>
          </AnimatePresence>

          {/* Auto-save indicator */}
          {draftSavedAt && !hasDraft && (
            <p className="text-[10px] text-zinc-600 mt-4 text-right">
              Borrador guardado automáticamente
            </p>
          )}
        </div>

        {/* Live preview — solo con bot, desktop only */}
        {state.withBot && (
          <aside className="hidden lg:block lg:sticky lg:top-6 lg:self-start">
            <BotConfigPreview state={onboardingToPreview(state)} />
          </aside>
        )}
      </div>
    </div>
  )
}
