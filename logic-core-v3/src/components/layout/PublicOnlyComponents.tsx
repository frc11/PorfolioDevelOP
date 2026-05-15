'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const LogicCompanion = dynamic(
  () => import('@/modules/chatbot').then((m) => ({ default: m.LogicCompanion })),
  { ssr: false }
)

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
  return (
    <>
      {children}
      <LogicCompanion slug="develop" />
    </>
  )
}
