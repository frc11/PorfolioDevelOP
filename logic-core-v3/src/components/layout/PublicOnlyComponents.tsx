'use client'

import { usePathname } from 'next/navigation'

const PORTAL_PREFIXES = ['/admin', '/dashboard']

export function PublicOnlyComponents({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPortal = PORTAL_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (isPortal) return null
  return <>{children}</>
}
