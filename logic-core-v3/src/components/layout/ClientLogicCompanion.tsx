'use client'

import dynamic from 'next/dynamic'

const LogicCompanion = dynamic(
  () => import('@/modules/ai-companion/components/LogicCompanion').then((mod) => mod.LogicCompanion),
  { ssr: false }
)

export function ClientLogicCompanion() {
  return <LogicCompanion />
}
