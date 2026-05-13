'use client'

import { useEffect, useState, useRef } from 'react'
import type { TooltipTrigger } from './types'

interface UseTooltipTriggersOptions {
  enabled: boolean
  mountDelayMs?: number
  idleAfterMs?: number
  scrollPercentTrigger?: number  // 0..1
}

/**
 * Fires once per mount cycle: returns the trigger that fired,
 * or null if no trigger has fired yet.
 *
 * Once a trigger fires and is acknowledged (via reset()), the hook
 * waits before firing the next one (idle reset, scroll happens once).
 */
export function useTooltipTriggers({
  enabled,
  mountDelayMs = 3000,
  idleAfterMs = 25000,
  scrollPercentTrigger = 0.82,
}: UseTooltipTriggersOptions): {
  trigger: TooltipTrigger | null
  reset: () => void
} {
  const [trigger, setTrigger] = useState<TooltipTrigger | null>(null)
  const firedRef = useRef<Set<TooltipTrigger>>(new Set())
  const lastActivityRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!enabled) return

    let mountTimer: ReturnType<typeof setTimeout> | null = null
    let idleTimer: ReturnType<typeof setInterval> | null = null

    // Mount trigger
    if (!firedRef.current.has('mount')) {
      mountTimer = setTimeout(() => {
        if (!firedRef.current.has('mount')) {
          firedRef.current.add('mount')
          setTrigger('mount')
        }
      }, mountDelayMs)
    }

    // Idle trigger — checks every 5s if no activity for `idleAfterMs`
    const trackActivity = () => {
      lastActivityRef.current = Date.now()
    }
    window.addEventListener('mousemove', trackActivity, { passive: true })
    window.addEventListener('keydown', trackActivity, { passive: true })
    window.addEventListener('scroll', trackActivity, { passive: true })

    idleTimer = setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current
      if (idleFor >= idleAfterMs && !firedRef.current.has('idle')) {
        firedRef.current.add('idle')
        setTrigger('idle')
      }
    }, 5000)

    // Scroll trigger
    const handleScroll = () => {
      if (firedRef.current.has('scroll')) return
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const percent = window.scrollY / docHeight
      if (percent >= scrollPercentTrigger) {
        firedRef.current.add('scroll')
        setTrigger('scroll')
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (mountTimer) clearTimeout(mountTimer)
      if (idleTimer) clearInterval(idleTimer)
      window.removeEventListener('mousemove', trackActivity)
      window.removeEventListener('keydown', trackActivity)
      window.removeEventListener('scroll', trackActivity)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [enabled, mountDelayMs, idleAfterMs, scrollPercentTrigger])

  const reset = () => setTrigger(null)

  return { trigger, reset }
}
