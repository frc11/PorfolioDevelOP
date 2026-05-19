'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Step1Company } from './Step1Company'
import { Step2BotIdentity } from './Step2BotIdentity'
import { Step3KnowledgeBase } from './Step3KnowledgeBase'
import { Step4Appearance } from './Step4Appearance'
import { Step5Review } from './Step5Review'
import { ProgressBar } from './ProgressBar'
import { BotPreview } from './BotPreview'
import { DraftBanner } from './DraftBanner'
import { useOnboardingDraft } from './useOnboardingDraft'
import type { OnboardingState } from './types'

const STEPS = ['Empresa', 'Bot', 'KB', 'Apariencia', 'Review'] as const

const INITIAL_STATE: OnboardingState = {
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
  avatarStyle: 'legacy_neuro',
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

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
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

      <ProgressBar currentStep={step} totalSteps={STEPS.length} stepNames={STEPS} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Steps */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={STEPS[step]}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && <Step1Company state={state} update={updateState} onNext={next} />}
              {step === 1 && <Step2BotIdentity state={state} update={updateState} onNext={next} onBack={back} />}
              {step === 2 && <Step3KnowledgeBase state={state} update={updateState} onNext={next} onBack={back} />}
              {step === 3 && <Step4Appearance state={state} update={updateState} onNext={next} onBack={back} />}
              {step === 4 && <Step5Review state={state} onBack={back} onCreated={clearDraft} />}
            </motion.div>
          </AnimatePresence>

          {/* Auto-save indicator */}
          {draftSavedAt && !hasDraft && (
            <p className="text-[10px] text-zinc-600 mt-4 text-right">
              Borrador guardado automáticamente
            </p>
          )}
        </div>

        {/* Live preview — desktop only */}
        <aside className="hidden lg:block">
          <BotPreview state={state} />
        </aside>
      </div>
    </div>
  )
}
