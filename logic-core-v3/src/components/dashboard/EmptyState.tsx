'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  subtext?: string
  className?: string
  iconColor?: string
  titleColor?: string
  showRadar?: boolean
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  subtext,
  className = '',
  iconColor = 'text-cyan-500',
  titleColor = 'text-white',
  showRadar = false
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="relative mb-6 flex items-center justify-center">
        {/* Radar Effect */}
        {showRadar && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`absolute h-24 w-24 animate-ping rounded-full opacity-20 ${iconColor.replace('text-', 'bg-')}`} />
            <div className={`absolute h-32 w-32 animate-[ping_3s_linear_infinite] rounded-full opacity-10 ${iconColor.replace('text-', 'bg-')}`} />
          </div>
        )}
        
        {/* Glow effect */}
        <div className={`absolute h-20 w-20 rounded-full opacity-20 blur-2xl ${iconColor.replace('text-', 'bg-')}`} />
        <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-md transition-all duration-300 ${iconColor}`}>
          {icon}
        </div>
      </div>
      
      <h3 className={`mb-2 text-xl font-black tracking-tight uppercase italic ${titleColor}`}>
        {title}
      </h3>
      
      <div className="max-w-[320px] space-y-2">
        <p className="text-[14px] font-bold text-zinc-300 leading-relaxed">
          {description}
        </p>
        {subtext && (
          <p className="text-[12px] font-medium text-zinc-500 italic">
            {subtext}
          </p>
        )}
      </div>

      {showRadar && (
        <div className="mt-8 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Monitoreo 24/7 Activo
        </div>
      )}
    </motion.div>
  )
}
