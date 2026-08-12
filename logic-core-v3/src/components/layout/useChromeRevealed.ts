'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isMarketingIntroDone, shouldRunMarketingIntro } from '@/lib/marketing-routes'

/**
 * `true` once the page "chrome" (chat widget + dock) should appear:
 *  - marketing routes → when their local intro finishes (`markMarketingIntroDone`,
 *                       delivered via the `'chrome:revealed'` window event).
 *  - any other route  → immediately (no intro runs there).
 *
 * El home entra en "any other route" desde B2-S1. Antes esperaba
 * `PreloaderContext.phase === 'done'`, porque el intro del home escondía el
 * contenido hasta terminar; ese intro ya no existe, así que el dock y el widget
 * aparecen con la página, como en `/login` o `/bienvenida`. De haber dejado la
 * condición vieja, `phase` se habría quedado en `'drawing'` para siempre —
 * nadie la escribe ya — y el chrome del home no habría aparecido nunca.
 *
 * Con eso, este hook dejó de depender de `PreloaderContext`: ya no llama a
 * `usePreloader()`. Es un requisito MENOS, no uno nuevo — sus dos consumidores
 * (`ChatWidgetMount` y `DynamicDock`) siguen montándose bajo el
 * `PreloaderProvider` del layout raíz, que no se tocó.
 */
export function useChromeRevealed(): boolean {
  const pathname = usePathname() ?? '/'
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

  if (marketingPending) return marketingRevealed
  return true
}
