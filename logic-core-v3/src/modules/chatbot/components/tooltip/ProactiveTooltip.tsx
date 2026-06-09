'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import type { ProactiveTooltipProps } from './types'
import { useTooltipTriggers } from './useTooltipTriggers'
import { CHATBOT_Z_INDEX } from '../../shared/zIndex'

// Cada cuánto rota la pregunta del teaser si el visitante no la cierra ni responde
// (le da dinámica). En el rango 8–10s pedido.
const TEASER_ROTATE_MS = 9000

// Lista de prompts de la sección actual (o el fallback `default`). FUENTE: la
// config (DB) — por eso TODA pregunta mostrada o rotada es un prompt configurado y
// valida como `proactiveOpener` server-side (consistencia front↔server intacta).
function listForPath(
  proactivePrompts: Record<string, string[]>,
  currentPath: string
): string[] {
  if (proactivePrompts[currentPath]?.length) return proactivePrompts[currentPath]
  if (proactivePrompts['default']?.length) return proactivePrompts['default']
  return []
}

function pickPromptForPath(
  proactivePrompts: Record<string, string[]>,
  currentPath: string
): string | null {
  const list = listForPath(proactivePrompts, currentPath)
  return list.length ? list[Math.floor(Math.random() * list.length)] : null
}

// Elige una pregunta DISTINTA a la actual de la misma lista (para la rotación).
function pickNextPrompt(list: string[], current: string | null): string | null {
  if (!list.length) return current
  if (list.length === 1) return list[0]
  const others = current ? list.filter((p) => p !== current) : list
  const pool = others.length ? others : list
  return pool[Math.floor(Math.random() * pool.length)]
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
  const reducedMotion = useReducedMotion()

  const handleDismiss = useCallback(() => {
    setVisible(false)
    reset()
    onDismiss()
  }, [reset, onDismiss])

  // When a trigger fires, pick a prompt and show it.
  // Queue policy: max 1 visible at a time. If one is already showing, a new
  // trigger is ignored (its `firedRef` flag in useTooltipTriggers stays set,
  // so it won't refire — the user simply doesn't see overlapping prompts).
  // It no longer auto-dismisses after a few seconds; it ROTATES (effect below)
  // until the visitor dismisses (X), accepts it, or the panel opens.
  useEffect(() => {
    if (!trigger) return
    if (visible) return
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
  }, [trigger, visible, config.proactivePrompts, currentPath, reset])

  // Rotación: mientras el teaser está visible, cambia a otra pregunta de la MISMA
  // sección cada TEASER_ROTATE_MS. La nueva sale de `listForPath` (config) → sigue
  // siendo un opener válido server-side. Se PAUSA si el panel abre: este componente
  // se desmonta (LogicCompanion lo gatea con `!isOpen`) → el cleanup limpia el
  // interval. El fade del cambio respeta prefers-reduced-motion (ver el texto).
  useEffect(() => {
    if (!visible) return
    const list = listForPath(
      config.proactivePrompts as Record<string, string[]>,
      currentPath
    )
    if (list.length <= 1) return
    const id = setInterval(() => {
      setCurrentPrompt((cur) => pickNextPrompt(list, cur))
    }, TEASER_ROTATE_MS)
    return () => clearInterval(id)
  }, [visible, config.proactivePrompts, currentPath])

  const isLeftAligned = config.position === 'bottom_left'

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
          className={`absolute bottom-full mb-3 ${isLeftAligned ? 'left-0' : 'right-0'}`}
          style={{
            zIndex: CHATBOT_Z_INDEX.tooltip,
            // The tooltip is absolutely positioned inside the 56px launcher, so
            // its shrink-to-fit "available width" is only ~56px → with width:auto
            // it collapses to min-content (1–2 words per line). `width: max-content`
            // sizes it to the text instead; maxWidth then caps it so the prompt
            // wraps to a few comfortable lines.
            width: 'max-content',
            maxWidth: 'min(380px, calc(100vw - 32px))',
          }}
        >
          <div
            className="rounded-2xl border px-4 py-3 shadow-lg flex flex-col gap-2 relative"
            style={{
              background: 'rgba(15,15,18,0.96)',
              borderColor: `${config.accentColor}40`,
              backdropFilter: 'blur(20px)',
            }}
            onClick={(e) => {
              // Stop the click bubbling to the launcher's onClick (handleToggle):
              // acceptProactivePrompt already calls setIsOpen(true), but a bubbled
              // toggle() would flip it back closed in the SAME React batch, leaving
              // the panel shut while the bubble still injects. Stopping propagation
              // is what actually lets the panel open.
              e.stopPropagation()
              setVisible(false)
              onAccept(currentPrompt)
            }}
          >
            {/* Keyed por el texto: en cada rotación remonta y hace fade-in suave.
                Bajo reduced-motion el cambio es instantáneo (initial=false). */}
            <motion.div
              key={currentPrompt}
              className="text-xs text-white/90 leading-relaxed pr-4"
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {currentPrompt}
            </motion.div>
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
          {/* Caret pointing down towards the bubble */}
          <div
            className={`w-3 h-3 rotate-45 absolute -bottom-1.5 ${isLeftAligned ? 'left-6' : 'right-6'}`}
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
