'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const MUTE_STORAGE_KEY = 'chatbot:muted'

export interface UseChatbotSoundsReturn {
  /** Current mute state. Read by ChatHeader to render the right icon. */
  muted: boolean
  /** Flip mute state. Persisted in localStorage. */
  toggleMute: () => void
  /**
   * Mark that the user has interacted with the widget. This unlocks
   * `playMessage()`. `playOpen()` and `toggleMute()` already call this
   * implicitly. Use directly from the embed where the panel is auto-opened
   * on mount (no gesture to attach `playOpen` to) — call from the first
   * real user gesture instead (form submit, quick reply tap).
   */
  markInteraction: () => void
  /**
   * Play the "widget opened" chime. Marks the user as having interacted, so
   * subsequent `playMessage()` calls are allowed by the autoplay policy.
   * Safe to call before any user gesture: AudioContext creation will succeed
   * but `start()` will be a no-op until the gesture resumes it.
   */
  playOpen: () => void
  /**
   * Play the "new bot message" chime. No-op if the user has not interacted
   * with the widget yet (autoplay policy) or if muted.
   */
  playMessage: () => void
}

interface ToneOptions {
  freq: number
  durationMs: number
  /** Peak gain. 0–1. Keep ≤ 0.08 to stay subtle. */
  gain?: number
}

/**
 * Web Audio chime generator for the chatbot widget.
 *
 * Why generated (not asset files): the only sounds we need are a 90–120ms
 * sine ping. Bundling an MP3 for that is wasteful (network + decode), and a
 * generated tone is byte-zero. Trade-off: less character than a designed
 * sample — fine for the target (sobrio, profesional, concesionaria).
 *
 * Autoplay policy: browsers block AudioContext.start() until the user
 * performs a gesture. We handle this by:
 *  1. Creating the context lazily on first call.
 *  2. Calling `ctx.resume()` defensively (no-op if already running).
 *  3. `playMessage()` checks the interaction flag and bails silently if the
 *     user hasn't opened/typed yet. This prevents the "AudioContext was not
 *     allowed to start" console warning we saw in B8.1 visual-qa.
 *
 * Every failure path is silent (try/catch with no rethrow). Audio never
 * breaks the widget.
 */
export function useChatbotSounds(): UseChatbotSoundsReturn {
  const [muted, setMuted] = useState<boolean>(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const interactedRef = useRef<boolean>(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(MUTE_STORAGE_KEY)
      if (stored === '1') setMuted(true)
    } catch {
      // localStorage may be disabled (Safari private, embedded contexts).
      // Default to unmuted.
    }
  }, [])

  const markInteraction = useCallback(() => {
    interactedRef.current = true
  }, [])

  const toggleMute = useCallback(() => {
    // Clicking the mute button is itself a user gesture — treat it as
    // interaction so playMessage can start firing right after.
    interactedRef.current = true
    setMuted((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(MUTE_STORAGE_KEY, next ? '1' : '0')
      } catch {
        // Ignore — preference reverts to default next session.
      }
      return next
    })
  }, [])

  const ensureContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null
    if (ctxRef.current) return ctxRef.current
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!AC) return null
      ctxRef.current = new AC()
      return ctxRef.current
    } catch {
      return null
    }
  }, [])

  const playTone = useCallback(
    (opts: ToneOptions) => {
      if (muted) return
      const ctx = ensureContext()
      if (!ctx) return
      try {
        if (ctx.state === 'suspended') {
          // Returns a promise; swallow rejection — if resume fails the
          // start() below will simply produce no sound.
          ctx.resume().catch(() => {})
        }

        const now = ctx.currentTime
        const dur = opts.durationMs / 1000
        const peak = opts.gain ?? 0.06

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = opts.freq

        // 10ms attack, exponential decay to ~silence by `dur`.
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(peak, now + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + dur)
      } catch {
        // Silent fail — audio is best-effort.
      }
    },
    [muted, ensureContext]
  )

  const playOpen = useCallback(() => {
    interactedRef.current = true
    // Two-note ascending chime: warm but brief.
    playTone({ freq: 660, durationMs: 90, gain: 0.05 })
    window.setTimeout(() => {
      playTone({ freq: 880, durationMs: 110, gain: 0.05 })
    }, 70)
  }, [playTone])

  const playMessage = useCallback(() => {
    if (!interactedRef.current) return
    playTone({ freq: 880, durationMs: 100, gain: 0.045 })
  }, [playTone])

  return { muted, toggleMute, markInteraction, playOpen, playMessage }
}
