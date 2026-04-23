'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Users } from 'lucide-react'

/**
 * DASHBOARD MOCKUP SOFTWARE: Visualización de sistema de gestión.
 * 4 widgets principales + mini gráfico de barras.
 * Paleta indigo/violet coherente con software-development.
 */

const widgets = [
  {
    label: 'Ventas del mes',
    value: 847600,
    prev: 748200,
    prefix: '$',
    suffix: '',
    formatDisplay: (v: number) =>
      v >= 1000000
        ? `$${(v / 1000000).toFixed(2)}M`
        : `$${Math.round(v / 1000).toLocaleString('es-AR')}K`,
    change: '+13.3%',
    positive: true,
    color: '#6366f1',
    colorRgb: '99,102,241',
    icon: '💰',
  },
  {
    label: 'Clientes activos',
    value: 2847,
    prev: 2631,
    prefix: '',
    suffix: '',
    formatDisplay: (v: number) => v.toLocaleString('es-AR'),
    change: '+8.2%',
    positive: true,
    color: '#7b2fff',
    colorRgb: '123,47,255',
    icon: '👥',
  },
  {
    label: 'Facturación neta',
    value: 124300,
    prev: 100200,
    prefix: '$',
    suffix: '',
    formatDisplay: (v: number) => `$${Math.round(v / 1000).toLocaleString('es-AR')}K`,
    change: '+24.1%',
    positive: true,
    color: '#818cf8',
    colorRgb: '129,140,248',
    icon: '📈',
  },
  {
    label: 'Uptime del sistema',
    value: 99.8,
    prev: 99.5,
    prefix: '',
    suffix: '%',
    formatDisplay: (v: number) => `${v.toFixed(1)}%`,
    change: '+0.3pp',
    positive: true,
    color: '#34d399',
    colorRgb: '52,211,153',
    icon: '⚡',
  },
]

const barData = [62, 78, 55, 91, 84, 69, 95, 73, 88, 100, 76, 83]
const barLabels = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

const activityItems = [
  { text: 'Pedido #4821 confirmado', time: 'hace 2 min', dot: '#6366f1' },
  { text: 'Stock actualizado — Producto A', time: 'hace 8 min', dot: '#7b2fff' },
  { text: 'Factura emitida — Cliente Torres', time: 'hace 15 min', dot: '#818cf8' },
  { text: 'Nuevo cliente registrado', time: 'hace 23 min', dot: '#34d399' },
]

function CountUp({ to, formatDisplay, delay = 0 }: { to: number; formatDisplay: (v: number) => string; delay?: number }) {
  const [val, setVal] = useState(0)
  const isReduced = useReducedMotion()

  useEffect(() => {
    if (isReduced) return

    let rafId = 0
    const timer = setTimeout(() => {
      const dur = 900
      const start = performance.now()
      const raf = (now: number) => {
        const t = Math.min((now - start) / dur, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        setVal(to * ease)
        if (t < 1) rafId = requestAnimationFrame(raf)
        else setVal(to)
      }
      rafId = requestAnimationFrame(raf)
    }, delay * 1000)

    return () => {
      clearTimeout(timer)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [to, delay, isReduced])

  return <span>{formatDisplay(isReduced ? to : val)}</span>
}

export default function DashboardMockupSoftware() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const reducedMotion = useReducedMotion()

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 md:py-32 px-6 sm:px-12 bg-[#06060f] overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, rgba(123,47,255,0.04) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Header */}
        <motion.div
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <span className="text-[10px] font-mono tracking-[0.2em] text-indigo-400 font-bold uppercase">
              [ TU EMPRESA EN TIEMPO REAL ]
            </span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-black text-white mb-4"
            style={{ letterSpacing: '-0.03em' }}
          >
            Todos los datos,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #7b2fff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              una sola pantalla.
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            Esto es lo que ven tus equipos cada mañana. Sin planillas. Sin llamados. Sin esperas.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          whileHover={{
            y: -2,
            boxShadow:
              '0 0 0 1px rgba(123,47,255,0.18), 0 36px 88px rgba(0,0,0,0.52), 0 0 70px rgba(123,47,255,0.12)',
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
            y: { duration: 0.08, ease: 'linear' },
            boxShadow: { duration: 0.08, ease: 'linear' },
          }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(15,15,30,0.95)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.05), 0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.06)',
          }}
        >
          {/* Top shine */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6) 40%, rgba(123,47,255,0.6) 60%, transparent)',
            }}
          />

          {/* Window bar */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
          >
            <div className="flex gap-1.5">
              {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
              ))}
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-md text-[11px] text-white/30 font-mono"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-indigo-400/60">⬡</span>
              <span>sistema.develop.app/dashboard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
              <span className="text-[10px] text-white/25 font-mono">ACTIVO</span>
            </div>
          </div>

          <div className="p-5 md:p-6">
            {/* Top nav sim */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="text-sm font-black tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #7b2fff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  DevelOP Sistema
                </div>
                <span className="text-white/15 text-xs">|</span>
                <span className="text-white/30 text-xs">Panel de Control</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="text-[10px] font-mono text-white/30 px-2 py-1 rounded"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  Dic 2025
                </div>
              </div>
            </div>

            {/* 4 Widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {widgets.map((w, idx) => (
                <motion.div
                  key={w.label}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  whileHover={{
                    y: -2,
                    scale: 1.008,
                    borderColor: `rgba(${w.colorRgb},0.38)`,
                    boxShadow: `0 0 0 1px rgba(${w.colorRgb},0.24), 0 12px 26px rgba(${w.colorRgb},0.15)`,
                    background: `linear-gradient(135deg, rgba(${w.colorRgb},0.13) 0%, rgba(255,255,255,0.03) 100%)`,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.35 + idx * 0.08,
                    y: { duration: 0.07, ease: 'linear' },
                    scale: { duration: 0.07, ease: 'linear' },
                    borderColor: { duration: 0.07, ease: 'linear' },
                    boxShadow: { duration: 0.08, ease: 'linear' },
                    background: { duration: 0.08, ease: 'linear' },
                  }}
                  className="rounded-xl p-4 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, rgba(${w.colorRgb},0.08) 0%, rgba(255,255,255,0.02) 100%)`,
                    border: `1px solid rgba(${w.colorRgb},0.15)`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[1px]"
                    style={{ background: `linear-gradient(90deg, transparent, rgba(${w.colorRgb},0.5), transparent)` }}
                  />
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">{w.icon}</span>
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                      style={{ color: w.positive ? '#34d399' : '#ef4444', background: w.positive ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)' }}
                    >
                      {w.change}
                    </span>
                  </div>
                  <div className="text-xl font-black text-white mb-0.5" style={{ letterSpacing: '-0.02em' }}>
                    {isInView ? <CountUp to={w.value} formatDisplay={w.formatDisplay} delay={0.4 + idx * 0.08} /> : w.formatDisplay(0)}
                  </div>
                  <div className="text-[11px] text-white/35">{w.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Bottom row: Chart + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
              {/* Bar chart */}
              <motion.div
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                whileHover={{
                  y: -2,
                  borderColor: 'rgba(123,47,255,0.26)',
                  boxShadow: '0 0 0 1px rgba(123,47,255,0.16), 0 12px 24px rgba(123,47,255,0.12)',
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.55,
                  y: { duration: 0.07, ease: 'linear' },
                  borderColor: { duration: 0.07, ease: 'linear' },
                  boxShadow: { duration: 0.08, ease: 'linear' },
                }}
                className="rounded-xl p-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-white/60 text-xs font-medium">Ventas mensuales</span>
                  <span className="text-[10px] font-mono text-indigo-400/70 px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    2025
                  </span>
                </div>
                <div className="flex items-end gap-1.5 h-[80px]">
                  {barData.map((pct, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t-sm relative group"
                      initial={reducedMotion ? {} : { height: 0 }}
                      animate={isInView ? { height: `${pct}%` } : { height: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{
                        scaleY: 1.08,
                        filter: 'brightness(1.16)',
                      }}
                      style={{
                        transformOrigin: 'bottom center',
                        background: i === 9
                          ? 'linear-gradient(to top, rgba(99,102,241,0.8), rgba(123,47,255,0.9))'
                          : `rgba(99,102,241,0.${Math.round(pct / 20 + 1)})`,
                        boxShadow: i === 9 ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                        transition: 'transform 70ms linear, filter 70ms linear',
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5 mt-2">
                  {barLabels.map((l, i) => (
                    <div key={`${l}-${i}`} className="flex-1 text-center text-[9px] text-white/20 font-mono">{l}</div>
                  ))}
                </div>
              </motion.div>

              {/* Activity feed */}
              <motion.div
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                whileHover={{
                  y: -2,
                  borderColor: 'rgba(123,47,255,0.24)',
                  boxShadow: '0 0 0 1px rgba(123,47,255,0.14), 0 12px 24px rgba(123,47,255,0.1)',
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.65,
                  y: { duration: 0.07, ease: 'linear' },
                  borderColor: { duration: 0.07, ease: 'linear' },
                  boxShadow: { duration: 0.08, ease: 'linear' },
                }}
                className="rounded-xl p-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60 text-xs font-medium">Actividad reciente</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] text-green-400/70 font-mono">EN VIVO</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {activityItems.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.7 + i * 0.07 }}
                      whileHover={{
                        x: 2,
                        background: 'rgba(123,47,255,0.08)',
                        borderColor: 'rgba(123,47,255,0.26)',
                      }}
                      className="flex items-start gap-3"
                      style={{
                        border: '1px solid transparent',
                        borderRadius: '10px',
                        padding: '6px 8px',
                        margin: '-2px -4px',
                        transition: 'all 70ms linear',
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: item.dot, boxShadow: `0 0 6px ${item.dot}60` }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white/60 text-[12px] leading-snug truncate">{item.text}</div>
                        <div className="text-white/20 text-[10px] mt-0.5 font-mono">{item.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Caption */}
        <motion.p
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-white/20 text-xs mt-5 font-mono tracking-wider"
        >
          MOCKUP REPRESENTATIVO · SISTEMA REAL ADAPTADO A TU EMPRESA
        </motion.p>
      </div>
    </section>
  )
}
