'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function AnimatedProgressBar({ progressPct }: { progressPct: number }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    // Slight delay for the "Wow" spring effect on mount
    const timer = setTimeout(() => setValue(progressPct), 100)
    return () => clearTimeout(timer)
  }, [progressPct])

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/40 shadow-inner">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
        initial={{ width: '0%' }}
        animate={{ width: `${value}%` }}
        transition={{ type: 'spring', stiffness: 60, damping: 15, mass: 1 }}
      />
    </div>
  )
}
