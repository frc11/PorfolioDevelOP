'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useInView } from 'framer-motion'

export function AnimatedCounter({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { damping: 50, stiffness: 200 })
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) motionValue.set(value)
  }, [isInView, motionValue, value])

  useEffect(() => {
    return springValue.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = Math.round(v).toString()
      }
    })
  }, [springValue])

  return (
    <span ref={ref} className={className}>
      0
    </span>
  )
}
