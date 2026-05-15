"use client"

import { motion } from 'motion/react'
import { useTheme } from '@/hooks/useThemeObserver'

export function HomeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const bgColor = theme === 'light' ? '#fafafa' : '#000000'
  const textColor = theme === 'light' ? '#18181b' : '#ffffff'

  return (
    <motion.main
      className="w-full relative font-sans"
      animate={{ backgroundColor: bgColor, color: textColor }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.main>
  )
}
