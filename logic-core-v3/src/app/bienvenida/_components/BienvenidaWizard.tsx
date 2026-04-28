'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Step1Empresa } from './Step1Empresa'
import { Step2Conexiones } from './Step2Conexiones'
import { Step3Tour } from './Step3Tour'
import { completeOnboardingAction } from '../_actions/complete-onboarding'

type WizardData = {
  companyName: string
  contactEmail: string
  whatsapp: string
  ga4MeasurementId?: string
  rubro?: 'automotive' | 'health' | 'fitness' | 'beauty' | 'gastronomy' | 'retail' | 'real-estate' | 'other'
}

interface BienvenidaWizardProps {
  organizationId: string
  initialData: Pick<WizardData, 'companyName' | 'contactEmail' | 'whatsapp'>
}

export function BienvenidaWizard({ organizationId, initialData }: BienvenidaWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [data, setData] = useState<WizardData>(initialData)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeOnboardingAction(data)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/dashboard')
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      {/* Header con progress */}
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          Paso {step} de 3
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                s <= step ? 'bg-cyan-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Step1Empresa
              data={data}
              onChange={setData}
              onNext={() => {
                if (!data.companyName.trim()) {
                  setError('El nombre de la empresa es obligatorio')
                  return
                }
                setError(null)
                setStep(2)
              }}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Step2Conexiones
              data={data}
              onChange={(newData) => setData({ ...data, ...newData })}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              onSkip={() => setStep(3)}
            />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Step3Tour
              onBack={() => setStep(2)}
              onComplete={handleComplete}
              isPending={isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}
