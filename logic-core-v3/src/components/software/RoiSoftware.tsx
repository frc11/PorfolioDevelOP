'use client'

import React, { useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

const INVERSION_BASE_USD = 1500

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString('es-AR')} USD`
}

function TimelineRoi({
  mesesRepago,
  ahorroMensual,
  isInView,
}: {
  mesesRepago: number
  ahorroMensual: number
  isInView: boolean
}) {
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
    <div className="relative mt-5 mb-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      {/* Línea conectora */}
      <div
        className="absolute top-[52px] left-[10%] right-[10%] h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, rgba(99,102,241,0.3), rgba(123,47,255,0.5), rgba(52,211,153,0.6))',
        }}
      />

      {/* Punto animado que viaja por la línea */}
      <motion.div
        className="absolute top-[48px] h-[9px] w-[9px] rounded-full"
        style={{ background: '#6366f1', boxShadow: '0 0 12px rgba(99,102,241,0.8)' }}
        initial={{ left: '10%' }}
        animate={isInView ? { left: ['10%', '55%', '90%'] } : { left: '10%' }}
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
  const [mounted, setMounted] = useState(false)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const reduceMotion = useReducedMotion()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const shouldReveal = mounted ? (reduceMotion || isInView) : isInView

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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 blur-[100px]"
        style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.14) 0%, transparent 68%)' }}
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
            initial={{ opacity: 0, y: 18 }}
            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-indigo-400/20 bg-indigo-400/[0.06] p-6"
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200/70">Inversion base</p>
            <p className="text-2xl font-black text-white md:text-3xl">{formatUsd(INVERSION_BASE_USD)}</p>
            <p className="mt-2 text-sm text-white/50">Proyectos desde $1.500 USD · entrega por etapas.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-6"
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200/70">Ahorro mensual estimado</p>
            <p className="text-2xl font-black text-white md:text-3xl">{formatUsd(ahorroMensual)}</p>
            <p className="mt-2 text-sm text-white/50">Trabajo administrativo manual que deja de pagarse todos los meses.</p>
          </motion.div>

          <motion.div
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
            className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-6"
          >
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

        <TimelineRoi mesesRepago={mesesRepago} ahorroMensual={ahorroMensual} isInView={isInView} />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.55, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7"
        >
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
