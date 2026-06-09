'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { isPortalRoute } from './publicRoute'
import { useChromeRevealed } from './useChromeRevealed'
import { prefetchBotConfig } from '@/modules/chatbot/shared/configCache'

const WIDGET_SLUG = 'develop'

const LogicCompanion = dynamic(
  () => import('@/modules/chatbot').then((m) => ({ default: m.LogicCompanion })),
  { ssr: false }
)

/**
 * Single mount point for the public chatbot widget. Mounted ONCE at the layout
 * root (see app/layout.tsx) instead of being dragged along by the three
 * `PublicOnlyComponents` wrappers — which previously rendered three launchers,
 * three stacked proactive teasers and three heavy R3F canvases per public page.
 *
 * Gating mirrors `PublicOnlyComponents` via the shared `isPortalRoute()`: the
 * widget never renders on /admin, /dashboard or /embed.
 */
export function ChatWidgetMount() {
  const pathname = usePathname() ?? '/'
  const revealed = useChromeRevealed()
  const isPortal = isPortalRoute(pathname)

  // Warm the bot config DURING the intro/preloader — before the widget is even
  // revealed — so the launcher renders instantly at reveal instead of blocking on
  // a cold `/config` fetch. That post-reveal fetch was making the widget appear
  // AFTER the dock (worst on marketing: cold serverless). Public routes only;
  // dedup'd by slug in the shared cache, so useChatbot reuses this same promise.
  useEffect(() => {
    if (!isPortal) prefetchBotConfig(WIDGET_SLUG)
  }, [isPortal])

  if (isPortal || !revealed) return null
  return <LogicCompanion slug={WIDGET_SLUG} />
}
