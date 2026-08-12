'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/context/PreloaderContext'
import { isMarketingIntroDone, shouldRunMarketingIntro } from '@/lib/marketing-routes'

/**
 * `true` once the page "chrome" (chat widget + dock) should appear:
 *  - home `/`         → when the preloader intro finishes (`phase === 'done'`).
 *  - marketing routes → when their local intro finishes (`markMarketingIntroDone`,
 *                       delivered via the `'chrome:revealed'` window event).
 *  - any other route  → immediately (no intro runs there).
 *
 * Only CONSUMES PreloaderContext (never mutates its phase). Shared by
 * `ChatWidgetMount` and `DynamicDock` so the widget and the dock reveal together.
 */
export function useChromeRevealed(): boolean {
  const pathname = usePathname() ?? '/'
  const { phase } = usePreloader()
  const marketingPending = shouldRunMarketingIntro(pathname)
  const [marketingRevealed, setMarketingRevealed] = useState(() =>
    isMarketingIntroDone()
  )

  useEffect(() => {
    if (!marketingPending || marketingRevealed) return
    const onRevealed = () => setMarketingRevealed(true)
    window.addEventListener('chrome:revealed', onRevealed)
    // The marking may have fired between this render and the listener attaching
    // (the synchronous automation skip). Reconcile from the sticky flag on a
    // microtask — after every consumer in this commit has attached its listener.
    queueMicrotask(() => {
      if (isMarketingIntroDone()) setMarketingRevealed(true)
    })
    return () => window.removeEventListener('chrome:revealed', onRevealed)
  }, [marketingPending, marketingRevealed])

  if (pathname === '/') return phase === 'done'
  if (marketingPending) return marketingRevealed
  return true
}
