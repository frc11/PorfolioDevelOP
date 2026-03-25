'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const PROGRESS_MESSAGES = [
  { threshold: 0, text: '¡Motor en marcha! Próximo hito: Definición' },
  { threshold: 25, text: '¡Estamos en ritmo! Próximo hito: Integración' },
  { threshold: 50, text: '¡Dominando el core! Próximo hito: Optimización' },
  { threshold: 75, text: '¡Recta final! Próximo hito: Control de Calidad' },
  { threshold: 100, text: '¡Proyecto completado con éxito! 🚀' },
]

export function AnimatedProgressBar({ progressPct }: { progressPct: number }) {
  const [value, setValue] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Slight delay for the "Wow" spring effect on mount
    const timer = setTimeout(() => setValue(progressPct), 100)
    
    // Find the appropriate message
    const currentMessage = [...PROGRESS_MESSAGES]
      .reverse()
      .find(m => progressPct >= m.threshold)?.text || ''
    setMessage(currentMessage)

    return () => clearTimeout(timer)
  }, [progressPct])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-900 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
        {/* Background Pulse Glow */}
        <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
        
        <motion.div
          className="relative h-full rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          initial={{ width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 15, mass: 1 }}
        >
          {/* Animated Shine/Sweep Overlay */}
          <motion.div 
            className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '400%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>
      
      <motion.p 
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="min-w-[240px] text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 leading-tight"
      >
        <span className={progressPct >= 100 ? 'text-emerald-400' : 'text-cyan-500/80'}>
          {message}
        </span>
      </motion.p>
    </div>
  )
}
