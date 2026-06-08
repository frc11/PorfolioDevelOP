'use client'

import { usePathname } from 'next/navigation'
import { isPortalRoute } from './publicRoute'

/**
 * Gates public-only marketing chrome (Navbar, Shutter, Preloader) off the
 * portal routes. The public chatbot widget is no longer rendered here — it is
 * mounted exactly once via `ChatWidgetMount` in app/layout.tsx (this wrapper is
 * used 3× for the chrome, which previously produced 3 chatbot launchers).
 */
export function PublicOnlyComponents({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() ?? '/'
  if (isPortalRoute(pathname)) return null
  return <>{children}</>
}
