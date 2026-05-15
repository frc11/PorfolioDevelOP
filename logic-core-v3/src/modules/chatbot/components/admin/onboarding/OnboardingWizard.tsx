'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Step1Company } from './Step1Company'
import { Step2BotIdentity } from './Step2BotIdentity'
import { Step3KnowledgeBase } from './Step3KnowledgeBase'
import { Step4Appearance } from './Step4Appearance'
import { Step5Review } from './Step5Review'
import { ProgressBar } from './ProgressBar'
import type { OnboardingState } from './types'

const STEPS = ['Empresa', 'Bot', 'KB', 'Apariencia', 'Review'] as const

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<OnboardingState>({
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
  })

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="space-y-8">
      <ProgressBar currentStep={step} totalSteps={STEPS.length} stepNames={STEPS} />

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
          {step === 4 && <Step5Review state={state} onBack={back} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
