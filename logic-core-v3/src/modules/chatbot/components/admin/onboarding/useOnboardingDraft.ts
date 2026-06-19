'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { OnboardingState } from './types'

const DRAFT_KEY = 'develop:onboarding:draft'
const DRAFT_VERSION = 1
const MAX_DRAFT_AGE_DAYS = 7
const DEBOUNCE_MS = 1000

interface OnboardingDraft {
  version: number
  savedAt: string
  step: number
  state: OnboardingState
}

export function useOnboardingDraft(initialState: OnboardingState) {
  const [state, setState] = useState<OnboardingState>(initialState)
  const [step, setStep] = useState(0)
  const [hasDraft, setHasDraft] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null)
  const didRestore = useRef(false)

  // Restore draft on mount (once)
  useEffect(() => {
    if (didRestore.current) return
    didRestore.current = true

    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return

      const draft = JSON.parse(raw) as OnboardingDraft
      if (draft.version !== DRAFT_VERSION) {
        localStorage.removeItem(DRAFT_KEY)
        return
      }

      const savedAt = new Date(draft.savedAt)
      const daysOld = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysOld > MAX_DRAFT_AGE_DAYS) {
        localStorage.removeItem(DRAFT_KEY)
        return
      }

      // Merge sobre initialState: drafts viejos pueden carecer de campos nuevos
      // (withBot, apariencia rica) → caen al default en vez de quedar undefined.
      setState({ ...initialState, ...draft.state })
      setStep(draft.step)
      setDraftSavedAt(savedAt)
      setHasDraft(true)
    } catch {
      // Silent fail — localStorage may be unavailable
    }
  }, [])

  // Auto-save with debounce
  useEffect(() => {
    if (!didRestore.current) return

    const timeoutId = setTimeout(() => {
      try {
        const draft: OnboardingDraft = {
          version: DRAFT_VERSION,
          savedAt: new Date().toISOString(),
          step,
          state,
        }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        setDraftSavedAt(new Date())
      } catch {
        // Silent fail
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [state, step])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    setDraftSavedAt(null)
  }, [])

  const discardDraft = useCallback(() => {
    setState(initialState)
    setStep(0)
    clearDraft()
  }, [initialState, clearDraft])

  const dismissDraftBanner = useCallback(() => {
    setHasDraft(false)
  }, [])

  return {
    state,
    setState,
    step,
    setStep,
    hasDraft,
    draftSavedAt,
    clearDraft,
    discardDraft,
    dismissDraftBanner,
  }
}
