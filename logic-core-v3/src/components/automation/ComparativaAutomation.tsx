'use client'

import React, { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

/**
 * COMPARATIVA AUTOMATION: "n8n vs Make vs Zapier"
 * Tabla comparativa para ayudar a entender por qué usamos n8n.
 * Paleta amber/orange coherente con el resto de la página.
 */

const tools = [
  {
    name: 'n8n',
    badge: 'LO QUE USAMOS',
    badgeColor: '#f59e0b',
    badgeRgb: '245,158,11',
    icon: '⚡',
    priceMonthly: 'Gratis (self-hosted)',
    priceSub: '$20 USD/mes en cloud',
    features: [
      'Flujos y ejecuciones ilimitadas',
      'Código JS/Python personalizado',
      '400+ integraciones nativas',
      'Claude AI + OpenAI integrado',
      'Self-hostable (control total)',
    ],
    limitations: [
      'Setup técnico inicial (lo hacemos nosotros)',
      'Curva de aprendizaje para usuario final',
    ],
    bestFor: 'Empresas que quieren automatización sin límites y costo controlado',
    highlight: true,
  },
  {
    name: 'Make',
    badge: 'VISUAL',
    badgeColor: '#a855f7',
    badgeRgb: '168,85,247',
    icon: '🎨',
    priceMonthly: '$9–$29 USD/mes',
    priceSub: 'Se cobra por operación',
    features: [
      'Builder visual muy intuitivo',
      '1.000+ aplicaciones conectadas',
      'Buen manejo de datos complejos',
      'Sin código requerido',
    ],
    limitations: [
      'Precio escala con el volumen de uso',
      'Sin código custom avanzado',
      'Limitado para lógica compleja',
    ],
    bestFor: 'Equipos no-técnicos que necesitan flujos medianos',
    highlight: false,
  },
  {
    name: 'Zapier',
    badge: 'POPULAR',
    badgeColor: '#22c55e',
    badgeRgb: '34,197,94',
    icon: '🔌',
    priceMonthly: '$20–$69 USD/mes',
    priceSub: 'Sube rápido con cada Zap',
    features: [
      '6.000+ integraciones',
      'El más simple de configurar',
      'Ecosistema enorme',
      'Soporte extenso',
    ],
    limitations: [
      'El más caro a escala',
      'Flujos lineales únicamente',
      'Sin lógica condicional avanzada',
      'Sin código personalizado',
    ],
    bestFor: 'Automatizaciones simples plug & play sin configuración técnica',
    highlight: false,
  },
]

export default function ComparativaAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const reducedMotion = useReducedMotion()

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 md:py-28 px-6 sm:px-12 bg-[#080810] overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Header */}
        <motion.div
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6 bg-amber-500/5">
            <span className="text-[10px] font-mono tracking-[0.2em] text-amber-500 font-bold uppercase">
              [ HERRAMIENTAS DE AUTOMATIZACIÓN ]
            </span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-black text-white mb-4"
            style={{ letterSpacing: '-0.03em' }}
          >
            Por qué elegimos <span style={{ color: '#f59e0b' }}>n8n</span>.
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            No todas las herramientas son iguales. Esta es la comparativa honesta.
          </p>
        </motion.div>

        {/* Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.name}
              initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.1 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: tool.highlight
                  ? `linear-gradient(135deg, rgba(${tool.badgeRgb},0.08) 0%, rgba(255,255,255,0.02) 100%)`
                  : 'rgba(255,255,255,0.02)',
                border: tool.highlight
                  ? `1px solid rgba(${tool.badgeRgb},0.3)`
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: tool.highlight
                  ? `0 0 40px rgba(${tool.badgeRgb},0.1), 0 8px 32px rgba(0,0,0,0.3)`
                  : '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              {/* Top shimmer line */}
              {tool.highlight && (
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(${tool.badgeRgb},0.8) 50%, transparent)`,
                  }}
                />
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">{tool.icon}</span>
                      <span
                        className="text-2xl font-black text-white"
                        style={{ letterSpacing: '-0.02em' }}
                      >
                        {tool.name}
                      </span>
                    </div>
                    <div
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider"
                      style={{
                        background: `rgba(${tool.badgeRgb},0.12)`,
                        color: tool.badgeColor,
                        border: `1px solid rgba(${tool.badgeRgb},0.25)`,
                      }}
                    >
                      {tool.badge}
                    </div>
                  </div>
                </div>

                {/* Precio */}
                <div
                  className="rounded-xl p-4 mb-5"
                  style={{
                    background: `rgba(${tool.badgeRgb},0.06)`,
                    border: `1px solid rgba(${tool.badgeRgb},0.12)`,
                  }}
                >
                  <p className="text-[10px] font-mono tracking-wider text-white/30 mb-1 uppercase">Precio</p>
                  <p className="text-white font-bold text-base leading-tight">{tool.priceMonthly}</p>
                  <p className="text-white/40 text-xs mt-0.5">{tool.priceSub}</p>
                </div>

                {/* Features */}
                <div className="mb-4 flex-1">
                  <p className="text-[10px] font-mono tracking-wider text-white/30 mb-3 uppercase">Features clave</p>
                  <ul className="flex flex-col gap-2">
                    {tool.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span style={{ color: tool.badgeColor }} className="text-sm mt-0.5 shrink-0">✓</span>
                        <span className="text-white/60 text-[13px] leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitaciones */}
                <div className="mb-4">
                  <p className="text-[10px] font-mono tracking-wider text-white/30 mb-3 uppercase">Limitaciones</p>
                  <ul className="flex flex-col gap-2">
                    {tool.limitations.map((l, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400/60 text-sm mt-0.5 shrink-0">—</span>
                        <span className="text-white/35 text-[12px] leading-snug">{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mejor para */}
                <div
                  className="rounded-xl p-3 mt-auto"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="text-[9px] font-mono tracking-wider text-white/25 mb-1 uppercase">Mejor para</p>
                  <p className="text-white/55 text-[12px] leading-snug">{tool.bestFor}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-white/30 text-sm">
            Trabajamos con <span className="text-amber-500/80 font-semibold">n8n</span> porque nos da control total, costo predecible y la posibilidad de integrar{' '}
            <span className="text-amber-500/80 font-semibold">Claude AI</span> directamente en cada flujo.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
