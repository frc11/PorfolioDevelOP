'use client'

import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Target, Sparkles } from 'lucide-react'

interface CurrentMilestoneProps {
  title: string
  dueDate: string
  description?: string
}

export function CurrentMilestone({ title, dueDate, description }: CurrentMilestoneProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] border-t border-l border-white/10 bg-[#07080a]/60 p-8 shadow-2xl backdrop-blur-3xl group transition-all duration-500 hover:border-cyan-500/30"
    >
      {/* Ambient Perspective Glows */}
      <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-700" />
      <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Target size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/80">
              Próximo Hito Crítico
            </span>
          </div>
          
          <div>
            <div className="relative inline-block">
              {/* Neon Glow Layer */}
              <span className="absolute inset-0 blur-lg opacity-30 bg-cyan-400 pointer-events-none group-hover:opacity-50 transition-opacity duration-500" />
              <h3 className="relative text-2xl font-black tracking-tight text-white sm:text-3xl uppercase italic drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                {title}
              </h3>
            </div>
            {description && (
              <p className="mt-2 text-sm text-zinc-400 max-w-lg leading-relaxed font-medium">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <Calendar size={14} className="text-zinc-600" />
              <span>Entrega estimada: <span className="text-zinc-200">{dueDate}</span></span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <Sparkles size={14} className="animate-pulse" />
              <span className="drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">Prioridad Máxima</span>
            </div>
          </div>
        </div>
        
        <button className="relative group/btn overflow-hidden rounded-xl bg-white px-6 py-3.5 text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <span className="relative z-10 flex items-center gap-2">
            Ver detalles del hito
            <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
          </span>
          {/* Button Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
        </button>
      </div>
    </motion.div>
  )
}
