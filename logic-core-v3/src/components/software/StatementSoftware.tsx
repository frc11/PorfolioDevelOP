'use client'
import React, { useEffect, useRef, useState, useMemo } from "react"
import { motion, useReducedMotion } from 'motion/react'

/**
 * STATEMENT SOFTWARE: "Tu empresa no necesita más Excel."
 * Componente de alto impacto con scroll-reveal.
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Word {
  text: string
  s: number
  e: number
  color?: 'white' | 'indigo' | 'gradient'
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const words: Word[] = [
  { text: 'Tu', s: 0.05, e: 0.11, color: 'white' },
  { text: 'empresa', s: 0.09, e: 0.15, color: 'white' },
  { text: 'no', s: 0.13, e: 0.19, color: 'white' },
  { text: 'necesita', s: 0.17, e: 0.23, color: 'white' },
  { text: 'más', s: 0.21, e: 0.27, color: 'white' },
  { text: 'Excel.', s: 0.25, e: 0.32, color: 'white' },
  
  { text: 'Necesita', s: 0.40, e: 0.44, color: 'white' },
  { text: 'un', s: 0.42, e: 0.46, color: 'white' },
  { text: 'sistema', s: 0.44, e: 0.48, color: 'white' },
  { text: 'que', s: 0.46, e: 0.50, color: 'white' },
  { text: 'trabaje', s: 0.48, e: 0.52, color: 'white' },
  { text: 'por', s: 0.50, e: 0.54, color: 'white' },
  { text: 'vos.', s: 0.52, e: 0.58, color: 'indigo' },
  
  { text: 'Eso', s: 0.66, e: 0.71, color: 'white' },
  { text: 'construimos.', s: 0.69, e: 0.74, color: 'white' },
  { text: 'Nada', s: 0.72, e: 0.77, color: 'white' },
  { text: 'más.', s: 0.75, e: 0.80, color: 'white' },
  { text: 'Nada', s: 0.78, e: 0.83, color: 'white' },
  { text: 'menos.', s: 0.81, e: 0.85, color: 'gradient' },
]

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function PrimeAtmosphere({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div 
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `
            linear-gradient(to right, rgba(99,102,241,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99,102,241,0.05) 1px, transparent 1px)
          `,
          backgroundSize: 'clamp(40px, 5vw, 80px) clamp(40px, 5vw, 80px)',
          transform: `perspective(1000px) rotateX(${60 - progress * 10}deg) translateY(${progress * 50}px)`,
          opacity: Math.min(progress * 4, 0.4),
          transition: 'transform 800ms cubic-bezier(0.16, 1, 0.3, 1)'
        }} 
      />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)',
        backgroundSize: '100% 4px',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '120%', height: '120%',
        background: `radial-gradient(circle at ${50 + Math.sin(progress * 10) * 20}% ${50 + Math.cos(progress * 10) * 10}%, rgba(99,102,241,0.08) 0%, transparent 60%)`,
        filter: 'blur(100px)',
      }} />
    </div>
  )
}

function DataClusters({ progress }: { progress: number }) {
  const clusters = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 200,
      type: Math.floor(Math.random() * 3),
      speed: 0.1 + Math.random() * 0.4
    }))
  }, [])

  const contents = ["0xFA2", "{ ... }", "</>"]

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {clusters.map(c => {
        const depth = Math.max(0, 1 - (c.z / 200))
        return (
          <div 
            key={c.id}
            style={{
              position: 'absolute',
              left: `${c.x}%`,
              top: `${c.y - (progress * 100 * c.speed)}%`,
              fontSize: '10px',
              fontFamily: 'monospace',
              color: 'rgba(99,102,241,0.15)',
              filter: `blur(${c.z / 40}px)`,
              opacity: depth * Math.min(progress * 2, 0.5),
              transform: `scale(${0.5 + depth})`,
              letterSpacing: '0.1em'
            }}
          >
            {contents[c.type]}
          </div>
        )
      })}
    </div>
  )
}

function StatementContent({ progress, shouldReduceMotion }: { progress: number, shouldReduceMotion: boolean }) {
  const isInView = progress > 0.01 && progress < 0.99
  
  const getOpacity = (start: number, end: number) => {
    if (shouldReduceMotion) return 1
    if (progress <= start) return 0
    if (progress >= end) return 1
    return (progress - start) / (end - start)
  }

  const renderWord = (w: Word, i: number) => {
    const op = getOpacity(w.s, w.e)
    const translate = shouldReduceMotion ? 0 : (1 - op) * 12
    const rotate = shouldReduceMotion ? 0 : (1 - op) * -5
    const scale = shouldReduceMotion ? 1 : 0.9 + (op * 0.1)

    return (
      <span key={i} style={{
        display: 'inline-block',
        marginRight: '0.28em',
        position: 'relative',
        whiteSpace: 'nowrap',
        verticalAlign: 'top',
      }}>
        <span style={{ visibility: 'hidden', opacity: 0 }}>
          {w.text}
        </span>

        <span
          style={{
            position: 'absolute',
            inset: 0,
            opacity: op,
            filter: shouldReduceMotion ? 'none' : `blur(${(1 - op) * 10}px)`,
            transform: `translateY(${translate}px) rotate(${rotate}deg) scale(${scale})`,
            transformOrigin: 'left center',
            transition: 'none',
            willChange: 'opacity, transform, filter',
            color: w.color === 'indigo' ? '#6366f1' : 'white',
            letterSpacing: shouldReduceMotion ? 'normal' : `${(1 - op) * 0.4}em`,
          }}
        >
          {w.color === 'gradient' ? (
            <span className="relative">
              <span className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-50 z-[-1]" />
              <span style={{
                background: 'linear-gradient(135deg, #fff 0%, #6366f1 40%, #7b2fff 60%, #fff 100%)',
                backgroundSize: '200% auto',
                backgroundPosition: `${-progress * 100}% center`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 900
              }}>
                {w.text}
              </span>
            </span>
          ) : (
            <>
              {w.text}
              {op > 0.3 && op < 0.9 && !shouldReduceMotion && (
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-1"
                  style={{
                    transform: `translateX(${(op - 0.5) * 200}%) skew(-20deg)`
                  }}
                />
              )}
            </>
          )}
        </span>
      </span>
    )
  }

  const badgeOpacity = Math.min(Math.max((progress - 0.85) / 0.10, 0), 1)
  const examplesOpacity = Math.min(Math.max((progress - 0.77) / 0.12, 0), 1)

  return (
    <div className="relative z-10 text-center px-6 w-full max-w-7xl mx-auto">
      <h2 className="font-black leading-[1.05] tracking-tighter cursor-default">
        <div className="text-[clamp(32px,5.5vw,84px)] mb-4">
          {words.slice(0, 6).map((w, i) => renderWord(w, i))}
        </div>
        <div className="text-[clamp(32px,5.5vw,84px)] mb-4">
          {words.slice(6, 13).map((w, i) => renderWord(w, i + 6))}
        </div>
        <div className="text-[clamp(32px,5.5vw,84px)]">
          {words.slice(13).map((w, i) => renderWord(w, i + 13))}
        </div>
      </h2>

      {/* Owner examples */}
      <p
        style={{
          fontSize: 'clamp(14px, 1.6vw, 18px)',
          color: 'rgba(255,255,255,0.28)',
          fontStyle: 'italic',
          fontWeight: 400,
          textAlign: 'center',
          marginTop: '28px',
          lineHeight: 1.7,
          opacity: examplesOpacity,
          transform: `translateY(${(1 - examplesOpacity) * 16}px)`,
          transition: 'none',
          pointerEvents: 'none',
          maxWidth: '560px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Restaurante que llena mesas sin contestar el teléfono.{' '}
        Clínica que confirma turnos sola.{' '}
        Ferretería con stock sin Excel.
      </p>

      <div
        className="absolute left-1/2 -translate-x-1/2 mt-12 flex flex-col items-center gap-6"
        style={{
          opacity: badgeOpacity,
          transform: `translate(-50%, ${(1 - badgeOpacity) * 40}px)`,
          pointerEvents: 'none'
        }}
      >
        <div className="relative p-1">
          <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute inset-[-4px] border border-violet-500/10 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
          
          <div className="relative px-8 py-3 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center p-1.5 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-black tracking-widest text-white uppercase">DevelOP PRIME</div>
              <div className="text-[9px] font-mono text-indigo-400 font-bold tracking-[0.3em] uppercase opacity-60">Verified Architecture</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full max-w-sm">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          <span className="text-[10px] font-mono tracking-[0.4em] text-white/20 uppercase whitespace-nowrap">Engineered Excellence</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-indigo-500/40 to-transparent" />
        </div>
      </div>
    </div>
  )
}

export default function StatementSoftware() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const windowH = window.innerHeight
      const total = section.offsetHeight - windowH
      const scrolled = -rect.top
      const p = Math.max(0, Math.min(scrolled / total, 1))
      setProgress(p)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative h-[350vh] bg-[#06060f] z-0">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-[#06060f]"
        style={{
          opacity: progress < 0.03 ? progress / 0.03 : 1
        }}
      >
        <PrimeAtmosphere progress={progress} />
        <DataClusters progress={progress} />
        <StatementContent 
          progress={progress} 
          shouldReduceMotion={shouldReduceMotion ?? false} 
        />
      </div>
    </section>
  )
}
