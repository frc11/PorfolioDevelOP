'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import type { ProactiveTooltipProps } from './types'
import { useTooltipTriggers } from './useTooltipTriggers'

const AUTO_DISMISS_MS = 8000

function pickPromptForPath(
  proactivePrompts: Record<string, string[]>,
  currentPath: string
): string | null {
  // Try exact match
  if (proactivePrompts[currentPath]?.length) {
    const list = proactivePrompts[currentPath]
    return list[Math.floor(Math.random() * list.length)]
  }
  // Fallback to default key
  if (proactivePrompts['default']?.length) {
    const list = proactivePrompts['default']
    return list[Math.floor(Math.random() * list.length)]
  }
  return null
}

export function ProactiveTooltip({
  config,
  currentPath,
  onAccept,
  onDismiss,
}: ProactiveTooltipProps) {
  const { trigger, reset } = useTooltipTriggers({ enabled: true })
  const [visible, setVisible] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null)

  const handleDismiss = useCallback(() => {
    setVisible(false)
    reset()
    onDismiss()
  }, [reset, onDismiss])

  // When a trigger fires, pick a prompt and show
  useEffect(() => {
    if (!trigger) return
    const prompt = pickPromptForPath(
      config.proactivePrompts as Record<string, string[]>,
      currentPath
    )
    if (!prompt) {
      reset()
      return
    }
    setCurrentPrompt(prompt)
    setVisible(true)

    const dismissTimer = setTimeout(() => {
      handleDismiss()
    }, AUTO_DISMISS_MS)

    return () => clearTimeout(dismissTimer)
  }, [trigger, config.proactivePrompts, currentPath, handleDismiss, reset])

  return (
    <AnimatePresence>
      {visible && currentPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
          }}
          exit={{ opacity: 0, y: 8, scale: 0.95, transition: { duration: 0.2 } }}
          className="absolute bottom-full right-0 mb-3 max-w-[280px]"
        >
          <div
            className="rounded-2xl border px-4 py-3 shadow-lg flex flex-col gap-2 cursor-pointer relative"
            style={{
              background: 'rgba(15,15,18,0.96)',
              borderColor: `${config.accentColor}40`,
              backdropFilter: 'blur(20px)',
            }}
            onClick={() => {
              setVisible(false)
              onAccept(currentPrompt)
            }}
          >
            <div className="text-xs text-white/90 leading-relaxed pr-4">
              {currentPrompt}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleDismiss()
              }}
              className="absolute top-1.5 right-1.5 p-1 rounded text-white/40 hover:text-white/80"
              aria-label="Cerrar"
            >
              <X size={12} strokeWidth={1.5} />
            </button>
          </div>
          {/* Caret pointing down */}
          <div
            className="w-3 h-3 rotate-45 absolute -bottom-1.5 right-6"
            style={{
              background: 'rgba(15,15,18,0.96)',
              borderRight: `1px solid ${config.accentColor}40`,
              borderBottom: `1px solid ${config.accentColor}40`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
