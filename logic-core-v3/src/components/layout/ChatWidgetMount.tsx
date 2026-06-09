'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { isPortalRoute } from './publicRoute'
import { useChromeRevealed } from './useChromeRevealed'

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
  if (isPortalRoute(pathname) || !revealed) return null
  return <LogicCompanion slug="develop" />
}
