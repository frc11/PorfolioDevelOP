'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

const INVERSION_BASE_USD = 1500

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString('es-AR')} USD`
}

function useInstantGlow(isDesktopMode: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (isDesktopMode) {
      const rafId = window.requestAnimationFrame(() => setIsActive(false))
      return () => {
        window.cancelAnimationFrame(rafId)
      }
    }

    if (typeof window === 'undefined') {
      return
    }

    const node = ref.current
    if (!node) return

    let ticking = false

    const syncFromViewportCenter = () => {
      ticking = false
      const rect = node.getBoundingClientRect()
      if (rect.height <= 0) return
      const componentCenter = rect.top + rect.height / 2
      const viewportCenter = window.innerHeight / 2
      setIsActive(componentCenter <= viewportCenter)
    }

    const queueSync = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(syncFromViewportCenter)
    }

    queueSync()
    window.addEventListener('scroll', queueSync, { passive: true })
    window.addEventListener('resize', queueSync)

    return () => {
      window.removeEventListener('scroll', queueSync)
      window.removeEventListener('resize', queueSync)
    }
  }, [isDesktopMode])

  return { ref, isActive, setIsActive }
}

function TimelineRoi({
  mesesRepago,
  ahorroMensual,
  isInView,
  isDesktopMode,
}: {
  mesesRepago: number
  ahorroMensual: number
  isInView: boolean
  isDesktopMode: boolean
}) {
  const {
    ref: timelineGlowRef,
    isActive: timelineGlowActive,
    setIsActive: setTimelineGlowActive,
  } = useInstantGlow(isDesktopMode)
  const gananciaMes6 = ahorroMensual * 6 - INVERSION_BASE_USD
  const gananciaMes12 = ahorroMensual * 12 - INVERSION_BASE_USD

  const points = [
    {
      label: 'Mes 1',
      sublabel: 'Sistema operativo',
      value: `-${formatUsd(INVERSION_BASE_USD)}`,
      valueColor: 'rgba(255,255,255,0.5)',
      dot: '#6366f1',
    },
    {
      label: `Mes ${Math.ceil(mesesRepago)}`,
      sublabel: 'Inversión recuperada',
      value: gananciaMes6 > 0 ? `+${formatUsd(gananciaMes6)}` : formatUsd(0),
      valueColor: gananciaMes6 > 0 ? '#818cf8' : 'rgba(255,255,255,0.3)',
      dot: '#7b2fff',
    },
    {
      label: 'Mes 12',
      sublabel: 'Ganancia neta',
      value: gananciaMes12 > 0 ? `+${formatUsd(gananciaMes12)}` : formatUsd(0),
      valueColor: '#34d399',
      dot: '#34d399',
    },
  ]

  return (
    <div
      ref={timelineGlowRef}
      onMouseEnter={isDesktopMode ? () => setTimelineGlowActive(true) : undefined}
      onMouseLeave={isDesktopMode ? () => setTimelineGlowActive(false) : undefined}
      className="relative mt-5 mb-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
      style={{
        transition: 'none',
        boxShadow: timelineGlowActive
          ? '0 0 0 1px rgba(129,140,248,0.34), 0 0 34px rgba(99,102,241,0.22)'
          : 'none',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: timelineGlowActive ? 1 : 0,
          transition: 'none',
          background:
            'radial-gradient(120% 90% at 50% 0%, rgba(129,140,248,0.2) 0%, rgba(123,47,255,0.08) 44%, rgba(6,8,20,0) 74%)',
        }}
      />
      {/* Línea conectora */}
      <div
        className="absolute top-[52px] left-[10%] right-[10%] hidden h-[1px] lg:block"
        style={{
          background:
            'linear-gradient(90deg, rgba(99,102,241,0.3), rgba(123,47,255,0.5), rgba(52,211,153,0.6))',
        }}
      />
      <div
        className="absolute top-[52px] bottom-[52px] left-1/2 w-[1px] -translate-x-1/2 lg:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(99,102,241,0.3), rgba(123,47,255,0.5), rgba(52,211,153,0.6))',
        }}
      />

      {/* Punto animado que viaja por la línea */}
      <motion.div
        className="absolute top-[48px] hidden h-[9px] w-[9px] rounded-full lg:block"
        style={{ background: '#6366f1', boxShadow: '0 0 12px rgba(99,102,241,0.8)' }}
        initial={{ left: '10%' }}
        animate={isInView ? { left: ['10%', '55%', '90%'] } : { left: '10%' }}
        transition={{ duration: 2.4, delay: 0.8, ease: [0.16, 1, 0.3, 1], times: [0, 0.5, 1] }}
      />
      <motion.div
        className="absolute left-1/2 h-[9px] w-[9px] -translate-x-1/2 rounded-full lg:hidden"
        style={{ background: '#6366f1', boxShadow: '0 0 12px rgba(99,102,241,0.8)' }}
        initial={{ top: '52px' }}
        animate={isInView ? { top: ['52px', '50%', 'calc(100% - 52px)'] } : { top: '52px' }}
        transition={{ duration: 2.4, delay: 0.8, ease: [0.16, 1, 0.3, 1], times: [0, 0.5, 1] }}
      />

      <div className="relative grid grid-cols-3 gap-4">
        {points.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center gap-3"
          >
            {/* Dot */}
            <div
              className="relative z-10 w-4 h-4 rounded-full border-2 border-[#06060f]"
              style={{ background: point.dot, boxShadow: `0 0 12px ${point.dot}80` }}
            />
            {/* Valor */}
            <div
              className="text-lg font-black"
              style={{ color: point.valueColor, letterSpacing: '-0.02em' }}
            >
              {point.value}
            </div>
            {/* Labels */}
            <div>
              <div className="text-[11px] font-bold text-white/60 uppercase tracking-[0.12em]">
                {point.label}
              </div>
              <div className="text-[10px] text-white/30 mt-0.5">{point.sublabel}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function RoiSoftware() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isDesktopMode, setIsDesktopMode] = useState(true)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const reduceMotion = useReducedMotion()
  const {
    ref: inversionGlowRef,
    isActive: inversionGlowActive,
    setIsActive: setInversionGlowActive,
  } = useInstantGlow(isDesktopMode)
  const {
    ref: ahorroGlowRef,
    isActive: ahorroGlowActive,
    setIsActive: setAhorroGlowActive,
  } = useInstantGlow(isDesktopMode)
  const {
    ref: repagoGlowRef,
    isActive: repagoGlowActive,
    setIsActive: setRepagoGlowActive,
  } = useInstantGlow(isDesktopMode)
  const {
    ref: slidersGlowRef,
    isActive: slidersGlowActive,
    setIsActive: setSlidersGlowActive,
  } = useInstantGlow(isDesktopMode)

  useEffect(() => {
    const updateMode = () => {
      const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      setIsDesktopMode(window.innerWidth >= 1024 && hasFinePointer)
    }

    updateMode()
    window.addEventListener('resize', updateMode)

    return () => {
      window.removeEventListener('resize', updateMode)
    }
  }, [])

  const shouldReveal = (reduceMotion ?? false) || isInView

  const [personas, setPersonas] = useState(3)
  const [costoMensualPorPersona, setCostoMensualPorPersona] = useState(700)

  const ahorroMensual = useMemo(
    () => personas * costoMensualPorPersona,
    [personas, costoMensualPorPersona],
  )

  const mesesRepago = useMemo(() => {
    const months = INVERSION_BASE_USD / Math.max(ahorroMensual, 1)
    return Math.max(0.2, months)
  }, [ahorroMensual])

  const ahorroAnualNeto = useMemo(
    () => ahorroMensual * 12 - INVERSION_BASE_USD,
    [ahorroMensual],
  )

  return (
    <section
      id="roi-software"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#06060f] px-4 py-24"
    >
      <style>{`
        @keyframes roiGridDrift {
          from { background-position: 0 0, 0 0; }
          to { background-position: 0 52px, 52px 0; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(84% 64% at 72% 24%, rgba(147,51,234,0.22) 0%, rgba(12,14,44,0) 56%), radial-gradient(70% 58% at 16% 78%, rgba(56,189,248,0.14) 0%, rgba(6,8,20,0) 64%), linear-gradient(138deg, #03050f 0%, #060a23 46%, #040813 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.2]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(129,140,248,0.12) 0 1px, transparent 1px 52px), repeating-linear-gradient(180deg, rgba(139,92,246,0.1) 0 1px, transparent 1px 44px)',
          maskImage: 'radial-gradient(130% 92% at 50% 46%, black 0%, black 55%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(130% 92% at 50% 46%, black 0%, black 55%, transparent 100%)',
          animation: reduceMotion ? 'none' : 'roiGridDrift 34s linear infinite',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 z-0 h-[22rem] w-[22rem] rounded-full opacity-[0.5]"
        style={{
          background:
            'conic-gradient(from 210deg, rgba(129,140,248,0.24), rgba(99,102,241,0.04), rgba(139,92,246,0.22), rgba(129,140,248,0.24))',
          WebkitMask:
            'radial-gradient(circle, transparent 48%, black 50%, black 53%, transparent 55%, transparent 61%, black 63%, black 66%, transparent 68%)',
          mask:
            'radial-gradient(circle, transparent 48%, black 50%, black 53%, transparent 55%, transparent 61%, black 63%, black 66%, transparent 68%)',
          filter: 'blur(0.3px)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(3,5,14,0.32) 0%, rgba(4,6,14,0.16) 30%, rgba(4,6,14,0.22) 64%, rgba(3,5,12,0.4) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-400/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_8px_rgba(129,140,248,0.9)]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-indigo-200/90">
              ROI DEL SISTEMA
            </span>
          </div>

          <h2 className="text-[clamp(30px,4.8vw,56px)] font-black leading-[0.95] tracking-[-0.05em] text-white">
            Invertir en software no es gasto.
            <br />
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              Es recuperar caja todos los meses.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/52">
            Un sistema que elimina trabajo equivalente a {personas} personas administrativas se paga en{' '}
            <strong className="text-indigo-200">{mesesRepago.toFixed(1)} meses</strong>.
          </p>

          <motion.p
            key={`msg-${Math.ceil(mesesRepago)}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mt-3 max-w-xl text-sm font-semibold"
            style={{
              color:
                mesesRepago <= 1
                  ? 'rgba(52,211,153,0.8)'
                  : mesesRepago <= 3
                  ? 'rgba(129,140,248,0.8)'
                  : 'rgba(255,255,255,0.35)',
            }}
          >
            {mesesRepago <= 1
              ? '→ Se paga solo en menos de un mes.'
              : mesesRepago <= 3
              ? `→ Recuperás la inversión en ${Math.ceil(mesesRepago)} meses.`
              : `→ Ajustá los sliders para ver tu escenario real.`}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.div
            ref={inversionGlowRef}
            onMouseEnter={isDesktopMode ? () => setInversionGlowActive(true) : undefined}
            onMouseLeave={isDesktopMode ? () => setInversionGlowActive(false) : undefined}
            initial={{ opacity: 0, y: 18 }}
            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-indigo-400/[0.06] p-6"
            style={{
              transition: 'none',
              boxShadow: inversionGlowActive
                ? '0 0 0 1px rgba(129,140,248,0.42), 0 0 30px rgba(99,102,241,0.28)'
                : 'none',
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                opacity: inversionGlowActive ? 1 : 0,
                transition: 'none',
                background:
                  'radial-gradient(120% 90% at 50% -10%, rgba(129,140,248,0.24) 0%, rgba(99,102,241,0.08) 44%, rgba(0,0,0,0) 74%)',
              }}
            />
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200/70">Inversion base</p>
            <p className="text-2xl font-black text-white md:text-3xl">{formatUsd(INVERSION_BASE_USD)}</p>
            <p className="mt-2 text-sm text-white/50">Proyectos desde $1.500 USD · entrega por etapas.</p>
          </motion.div>

          <motion.div
            ref={ahorroGlowRef}
            onMouseEnter={isDesktopMode ? () => setAhorroGlowActive(true) : undefined}
            onMouseLeave={isDesktopMode ? () => setAhorroGlowActive(false) : undefined}
            initial={{ opacity: 0, y: 18 }}
            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-6"
            style={{
              transition: 'none',
              boxShadow: ahorroGlowActive
                ? '0 0 0 1px rgba(167,139,250,0.44), 0 0 30px rgba(123,47,255,0.3)'
                : 'none',
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                opacity: ahorroGlowActive ? 1 : 0,
                transition: 'none',
                background:
                  'radial-gradient(120% 90% at 50% -10%, rgba(167,139,250,0.24) 0%, rgba(123,47,255,0.08) 44%, rgba(0,0,0,0) 74%)',
              }}
            />
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200/70">Ahorro mensual estimado</p>
            <p className="text-2xl font-black text-white md:text-3xl">{formatUsd(ahorroMensual)}</p>
            <p className="mt-2 text-sm text-white/50">Trabajo administrativo manual que deja de pagarse todos los meses.</p>
          </motion.div>

          <motion.div
            ref={repagoGlowRef}
            onMouseEnter={isDesktopMode ? () => setRepagoGlowActive(true) : undefined}
            onMouseLeave={isDesktopMode ? () => setRepagoGlowActive(false) : undefined}
            initial={{ opacity: 0, y: 18 }}
            animate={
              shouldReveal
                ? {
                    opacity: 1,
                    y: 0,
                    boxShadow:
                      mesesRepago <= 1
                        ? [
                            '0 0 0 1px rgba(52,211,153,0.2), 0 0 20px rgba(52,211,153,0.08)',
                            '0 0 0 1px rgba(52,211,153,0.4), 0 0 40px rgba(52,211,153,0.18)',
                            '0 0 0 1px rgba(52,211,153,0.2), 0 0 20px rgba(52,211,153,0.08)',
                          ]
                        : '0 0 0 1px rgba(52,211,153,0.1)',
                  }
                : { opacity: 0, y: 18 }
            }
            transition={{
              opacity: { duration: 0.5, delay: 0.2 },
              y: { duration: 0.5, delay: 0.2 },
              boxShadow:
                mesesRepago <= 1
                  ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.3 },
            }}
            className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-6"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                opacity: repagoGlowActive ? 1 : 0,
                transition: 'none',
                background:
                  'radial-gradient(120% 90% at 50% -10%, rgba(52,211,153,0.24) 0%, rgba(16,185,129,0.08) 44%, rgba(0,0,0,0) 74%)',
                boxShadow: repagoGlowActive ? 'inset 0 0 0 1px rgba(110,231,183,0.45)' : 'none',
              }}
            />
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/70">Repago estimado</p>
            <p
              className="text-2xl font-black md:text-3xl"
              style={{
                color:
                  mesesRepago <= 1 ? '#34d399' : mesesRepago <= 3 ? '#a7f3d0' : 'white',
                textShadow:
                  mesesRepago <= 1 ? '0 0 20px rgba(52,211,153,0.5)' : 'none',
              }}
            >
              {mesesRepago.toFixed(1)} meses
            </p>
            <p className="mt-2 text-sm text-white/50">Ahorro neto anual estimado: {formatUsd(ahorroAnualNeto)}</p>
          </motion.div>
        </div>

        <TimelineRoi
          mesesRepago={mesesRepago}
          ahorroMensual={ahorroMensual}
          isInView={isInView}
          isDesktopMode={isDesktopMode}
        />

        <motion.div
          ref={slidersGlowRef}
          onMouseEnter={isDesktopMode ? () => setSlidersGlowActive(true) : undefined}
          onMouseLeave={isDesktopMode ? () => setSlidersGlowActive(false) : undefined}
          initial={{ opacity: 0, y: 18 }}
          animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.55, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7"
          style={{
            transition: 'none',
            boxShadow: slidersGlowActive
              ? '0 0 0 1px rgba(129,140,248,0.36), 0 0 28px rgba(99,102,241,0.2)'
              : 'none',
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              opacity: slidersGlowActive ? 1 : 0,
              transition: 'none',
              background:
                'radial-gradient(140% 110% at 50% 0%, rgba(129,140,248,0.16) 0%, rgba(123,47,255,0.08) 38%, rgba(0,0,0,0) 70%)',
            }}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/75">
                Personas administrativas equivalentes: {personas}
              </span>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={personas}
                onChange={(e) => setPersonas(Number(e.target.value))}
                className="w-full accent-indigo-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white/75">
                Costo mensual por persona: {formatUsd(costoMensualPorPersona)}
              </span>
              <input
                type="range"
                min={400}
                max={1800}
                step={50}
                value={costoMensualPorPersona}
                onChange={(e) => setCostoMensualPorPersona(Number(e.target.value))}
                className="w-full accent-violet-400"
              />
            </label>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
