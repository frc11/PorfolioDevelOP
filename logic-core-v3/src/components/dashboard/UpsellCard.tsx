'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, Bot, Rocket } from 'lucide-react'
import Link from 'next/link'

const ICON_MAP = {
  bot: Bot,
  rocket: Rocket,
} as const

type IconType = keyof typeof ICON_MAP

interface UpsellCardProps {
  title: string
  subtitle: string
  description: string
  ROI: {
    icon: string
    text: string
  }
  iconType: IconType
  href: string
  themeColor: 'amber' | 'violet'
}

export function UpsellCard({ 
  title, 
  subtitle, 
  description, 
  ROI, 
  iconType, 
  href, 
  themeColor 
}: UpsellCardProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [shake, setShake] = useState(false)

  const Icon = ICON_MAP[iconType]

  const isAmber = themeColor === 'amber'
  
  const glowBorder = isAmber 
    ? 'rgba(245,158,11,0.4)' 
    : 'rgba(139,92,246,0.4)'
  
  const hoverShadow = isAmber 
    ? 'hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]' 
    : 'hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]'

  const handleAction = (e: React.MouseEvent) => {
    // Prevent immediate navigation to show animation
    e.preventDefault()
    setShake(true)
    setIsRequesting(true)
    
    // Reset after 2 seconds
    setTimeout(() => {
      setShake(false)
      setIsRequesting(false)
      // Optional: window.location.href = href
    }, 2500)
  }

  return (
    <div className={`group relative rounded-[1.25rem] p-[1px] overflow-hidden transition-all duration-500 hover:scale-[1.02] ${hoverShadow}`}>
      {/* Animated Conic Border */}
      <div 
        className={`absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-60 pointer-events-none`}
        style={{ 
          background: `conic-gradient(from_0deg,transparent_0deg,${glowBorder}_90deg,transparent_180deg)` 
        }} 
      />
      
      <div className="relative h-full w-full rounded-[1.2rem] bg-[#0c0e12]/80 p-6 backdrop-blur-xl bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)]">
        <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-opacity group-hover:opacity-100 opacity-30 ${isAmber ? 'bg-amber-500/10' : 'bg-violet-500/10'}`}></div>
        
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 shadow-2xl ${
              isAmber 
                ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                : 'bg-gradient-to-br from-violet-500/20 to-purple-600/20 text-violet-500 border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
            }`}>
              <Icon size={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-black tracking-tight text-white uppercase italic">{title}</h3>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-70 ${isAmber ? 'text-amber-500' : 'text-violet-500'}`}>
                {subtitle}
              </span>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 rounded-full border border-white/5 bg-black/40 backdrop-blur-md px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-colors ${isAmber ? 'text-amber-400/80 group-hover:text-amber-400' : 'text-violet-400/80 group-hover:text-violet-400'}`}>
            <Lock size={10} className="animate-pulse" />
            Locked
          </span>
        </div>
        
        <p className="mt-4 text-xs text-zinc-400 leading-relaxed relative z-10 font-medium h-[3rem] line-clamp-2">
          {description}
        </p>

        {/* ROI Benefit Label */}
        <div className="mt-4 relative z-10 flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-bold shadow-sm transition-all ${
            isAmber 
              ? 'border-amber-500/20 bg-amber-500/10 text-amber-200/90 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
              : 'border-violet-500/20 bg-violet-500/10 text-violet-200/90 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
          }`}>
            <span className="text-[10px]">{ROI.icon}</span>
            {ROI.text}
          </div>
        </div>
        
        <div className="mt-6 relative z-10">
          <motion.div
            animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={handleAction}
              disabled={isRequesting}
              className={`group/btn relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-80 ${
                isAmber 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black hover:border-amber-500' 
                  : 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500 hover:text-white hover:border-violet-500'
              }`}
            >
              <AnimatePresence mode="wait">
                {isRequesting ? (
                  <motion.span
                    key="requesting"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-2 font-bold"
                  >
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className={`h-3 w-3 rounded-full border-2 border-current border-t-transparent`}
                    />
                    Solicitando...
                  </motion.span>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-2.5"
                  >
                    <Unlock size={14} className="transition-transform group-hover/btn:scale-110" />
                    <span>Desbloquear Módulo</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Periodic Shine Sweep */}
              <div className="absolute inset-x-0 h-full w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-[35deg] animate-[shine_3s_infinite] -translate-x-[150%] pointer-events-none" />
            </button>
          </motion.div>
          
          <AnimatePresence>
            {isRequesting && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -bottom-8 left-0 right-0 text-center text-[9px] font-bold uppercase tracking-widest text-[#06b6d4] drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
              >
                Solicitando acceso a DevelOP...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
