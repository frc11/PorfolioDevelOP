'use client'

import React, { useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

const INVERSION_BASE_USD = 1500

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString('es-AR')} USD`
}

export default function RoiSoftware() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const reduceMotion = useReducedMotion()
  const shouldReveal = reduceMotion || isInView

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
            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-6"
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/70">Repago estimado</p>
            <p className="text-2xl font-black text-white md:text-3xl">{mesesRepago.toFixed(1)} meses</p>
            <p className="mt-2 text-sm text-white/50">Ahorro neto anual estimado: {formatUsd(ahorroAnualNeto)}</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.55, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7"
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

