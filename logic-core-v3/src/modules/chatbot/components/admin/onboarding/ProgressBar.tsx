'use client'

import { motion } from 'motion/react'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  stepNames: readonly string[]
}

export function ProgressBar({ currentStep, totalSteps, stepNames }: ProgressBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs">
        {stepNames.map((name, i) => (
          <span
            key={name}
            className={i <= currentStep ? 'text-cyan-400' : 'text-zinc-600'}
          >
            {i + 1}. {name}
          </span>
        ))}
      </div>
      <div className="h-1 w-full bg-zinc-800 rounded overflow-hidden">
        <motion.div
          className="h-full bg-cyan-500"
          initial={false}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />
      </div>
    </div>
  )
}
