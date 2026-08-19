'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/context/PreloaderContext'
import { isMarketingIntroDone, shouldRunMarketingIntro } from '@/lib/marketing-routes'
import {
  HOME_INTRO_ATTR,
  HOME_INTRO_FINISHED_EVENT,
} from '@/components/layout/HomeIntro'

/**
 * `true` once the page "chrome" (chat widget + dock) should appear:
 *  - home `/`         → `phase === 'done'` Y el overlay del intro nuevo ya se
 *                       levantó (S3: la fase salta a 'done' al montar — libera
 *                       scroll/contenido al instante — así que sola ya no
 *                       significa "intro terminado"; sin el segundo gate el
 *                       widget/dock montan DEBAJO del overlay y el teaser del
 *                       chat apila ENCIMA — verificado en Bloque 1).
 *  - marketing routes → when their local intro finishes (`markMarketingIntroDone`,
 *                       delivered via the `'chrome:revealed'` window event).
 *  - any other route  → immediately (no intro runs there).
 *
 * Only CONSUMES PreloaderContext (never mutates its phase). Shared by
 * `ChatWidgetMount` and `DynamicDock` so the widget and the dock reveal together.
 */
function isHomeIntroActive(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.hasAttribute(HOME_INTRO_ATTR)
}

export function useChromeRevealed(): boolean {
  const pathname = usePathname() ?? '/'
  const { phase } = usePreloader()
  const marketingPending = shouldRunMarketingIntro(pathname)
  const [marketingRevealed, setMarketingRevealed] = useState(() =>
    isMarketingIntroDone()
  )
  // La verdad viva es el atributo del <html> (puesto pre-paint por el script
  // de HomeIntroBoot, sacado por markIntroPlayed); el evento solo notifica.
  const [homeIntroActive, setHomeIntroActive] = useState(isHomeIntroActive)

  useEffect(() => {
    if (!homeIntroActive) return
    const onFinished = () => setHomeIntroActive(false)
    window.addEventListener(HOME_INTRO_FINISHED_EVENT, onFinished)
    // Reconciliar por si el intro terminó entre el render y el attach del
    // listener (mismo patrón que la rama marketing de abajo).
    queueMicrotask(() => {
      if (!isHomeIntroActive()) setHomeIntroActive(false)
    })
    return () => window.removeEventListener(HOME_INTRO_FINISHED_EVENT, onFinished)
  }, [homeIntroActive])

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

  if (pathname === '/') return phase === 'done' && !homeIntroActive
  if (marketingPending) return marketingRevealed
  return true
}
