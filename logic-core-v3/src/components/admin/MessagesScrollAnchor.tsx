'use client'

import { useEffect, useRef } from 'react'

export function MessagesScrollAnchor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return <div ref={ref} />
}
