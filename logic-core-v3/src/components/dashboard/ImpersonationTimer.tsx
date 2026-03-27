'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes <= 0) {
    return `${seconds}s`
  }

  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

export function ImpersonationTimer({ expiresAt }: { expiresAt: string }) {
  const router = useRouter()
  const [remaining, setRemaining] = useState(() => new Date(expiresAt).getTime() - Date.now())

  useEffect(() => {
    const target = new Date(expiresAt).getTime()

    const tick = () => {
      const nextRemaining = target - Date.now()
      setRemaining(nextRemaining)

      if (nextRemaining <= 0) {
        router.replace('/admin/clients')
      }
    }

    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [expiresAt, router])

  return <>{formatRemaining(remaining)}</>
}
