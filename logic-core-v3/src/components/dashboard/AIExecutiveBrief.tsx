'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Sparkles, Volume2 } from 'lucide-react'

export function AIExecutiveBrief({
  summaryText = "Esta semana tus visitas subieron un 12%, lo que generó un estimado de $46,500 en valor de pipeline. Además, tienes 1 tarea pendiente que requiere tu revisión para que el equipo pueda continuar."
}: {
  summaryText?: string
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Simulated audio progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setIsPlaying(false)
            return 0
          }
          return p + 1
        })
      }, 300) // ~30 seconds mock audio
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const togglePlay = () => {
    if (progress >= 100) setProgress(0)
    setIsPlaying(!isPlaying)
  }

  // Generate 24 bars for the wave
  const bars = Array.from({ length: 24 })

  return (
    <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-violet-500/5 p-5 shadow-lg shadow-violet-500/5 transition-all hover:bg-violet-500/10 backdrop-blur-md">
      {/* Background glow */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
      
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        
        {/* Left side: Text Summary */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-400">
              <Sparkles size={14} />
            </div>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400">
              Resumen Ejecutivo IA (NeuroAvatar)
            </h2>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed pr-0 sm:pr-8">
            "{summaryText}"
          </p>
        </div>

        {/* Right side: Audio Player */}
        <div className="mt-4 flex w-full flex-col items-center justify-center sm:mt-0 sm:w-auto sm:items-end">
          <div className="flex w-full max-w-[240px] flex-col gap-3 rounded-lg border border-white/5 bg-black/20 p-3 shadow-inner">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={togglePlay}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                aria-label={isPlaying ? "Pause summary" : "Play summary"}
              >
                {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
              </button>

              {/* Audio Waves */}
              <div className="flex flex-1 items-center justify-between h-8 gap-[2px]">
                {bars.map((_, i) => {
                  // Some random base height variation
                  const isPassed = (i / bars.length) * 100 <= progress
                  const baseHeight = 20 + Math.sin(i * 0.5) * 40 + Math.cos(i * 1.2) * 20
                  const height = isPlaying
                    ? Math.max(15, baseHeight * Math.random()) // Animate randomly if playing
                    : baseHeight * 0.3 // static and low if stopped

                  return (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: `${height}%`,
                        backgroundColor: isPassed ? '#8b5cf6' : '#3f3f46' // violet-500 vs zinc-700
                      }}
                      transition={{ duration: 0.1 }}
                      className="w-1 rounded-full"
                    />
                  )
                })}
              </div>
            </div>

            {/* Simulated Time & Volume icon */}
            <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500">
              <span>0:00</span>
              <div className="flex items-center gap-1.5">
                <Volume2 size={12} className={isPlaying ? "text-violet-400" : "text-zinc-600"} />
                <span>0:30</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
