'use client'

import React, { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

/**
 * PORTFOLIO WEB CASES: "Casos de éxito reales."
 * 3 casos con métricas concretas. Paleta cyan/blue coherente con web-development.
 */

const cases = [
  {
    client: 'Concesionaria Torres',
    industry: 'Automotriz',
    location: 'Tucumán, NOA',
    description:
      'Rediseño completo del sitio y sistema de consultas online. Antes recibían consultas solo por teléfono. Ahora el 60% de las consultas entran por el formulario web, fuera del horario comercial.',
    metrics: [
      { label: 'Consultas online', value: '+60%' },
      { label: 'Tiempo de respuesta', value: '−45 min' },
      { label: 'Leads calificados/mes', value: '+38' },
    ],
    tech: ['Next.js', 'Tailwind', 'WhatsApp API'],
    accentColor: '#00e5ff',
    accentRgb: '0,229,255',
    icon: '🚗',
    timeline: '4 semanas',
  },
  {
    client: 'Clínica Dental Ríos',
    industry: 'Salud',
    location: 'Salta',
    description:
      'Web con sistema de turnos online integrado. Los pacientes reservan su turno en 2 minutos sin llamar. El equipo dejó de atender el teléfono para confirmar turnos — se dedica 100% a los pacientes.',
    metrics: [
      { label: 'Turnos online', value: '+70%' },
      { label: 'Llamadas entrantes', value: '−80%' },
      { label: 'Pacientes nuevos/mes', value: '+22' },
    ],
    tech: ['Next.js', 'Google Calendar API', 'SEO Local'],
    accentColor: '#7b2fff',
    accentRgb: '123,47,255',
    icon: '🦷',
    timeline: '5 semanas',
  },
  {
    client: 'Distribuidora NOA Mayorista',
    industry: 'Distribución',
    location: 'Jujuy',
    description:
      'Catálogo digital con pedidos online para clientes mayoristas. Antes, los vendedores tomaban pedidos por WhatsApp y los cargaban manualmente. Ahora el cliente lo hace solo y el vendedor solo confirma.',
    metrics: [
      { label: 'Pedidos digitales', value: '+55%' },
      { label: 'Tiempo por pedido', value: '30 min → 3 min' },
      { label: 'Errores de carga', value: '−95%' },
    ],
    tech: ['Next.js', 'TypeScript', 'Catálogo dinámico'],
    accentColor: '#00e5ff',
    accentRgb: '0,229,255',
    icon: '📦',
    timeline: '6 semanas',
  },
]

export default function PortfolioWebCases() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const reducedMotion = useReducedMotion()

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 md:py-32 px-6 sm:px-12 bg-[#030014] overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse, rgba(0,229,255,0.05) 0%, rgba(123,47,255,0.03) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative max-w-6xl mx-auto z-10">
        {/* Header */}
        <motion.div
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
            style={{
              background: 'rgba(0,229,255,0.06)',
              border: '1px solid rgba(0,229,255,0.2)',
            }}
          >
            <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-400 font-bold uppercase">
              [ CASOS DE ÉXITO ]
            </span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-black text-white mb-4"
            style={{ letterSpacing: '-0.03em' }}
          >
            Resultados que se miden.
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            Cada número es real. Son negocios del NOA que ya tienen su sucursal digital activa.
          </p>
        </motion.div>

        {/* Cases Grid */}
        <div className="flex flex-col gap-6">
          {cases.map((c, idx) => (
            <motion.div
              key={c.client}
              initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.1 + idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(${c.accentRgb},0.05) 0%, rgba(255,255,255,0.015) 100%)`,
                border: `1px solid rgba(${c.accentRgb},0.15)`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(${c.accentRgb},0.04)`,
              }}
            >
              {/* Top line */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(${c.accentRgb},0.5) 50%, transparent)`,
                }}
              />

              <div className="p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-8 items-start">
                {/* Left: Info */}
                <div>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-3xl">{c.icon}</span>
                    <div>
                      <h3 className="text-white font-black text-xl" style={{ letterSpacing: '-0.01em' }}>
                        {c.client}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/30 text-xs font-mono">{c.industry}</span>
                        <span className="text-white/15">·</span>
                        <span className="text-white/30 text-xs">{c.location}</span>
                        <span className="text-white/15">·</span>
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                          style={{
                            color: c.accentColor,
                            background: `rgba(${c.accentRgb},0.1)`,
                            border: `1px solid rgba(${c.accentRgb},0.2)`,
                          }}
                        >
                          {c.timeline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/45 text-sm leading-relaxed mb-5 max-w-xl">
                    {c.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex gap-2 flex-wrap">
                    {c.tech.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-lg text-white/40"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="flex flex-col gap-3 min-w-[180px]">
                  {c.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl p-4 text-center"
                      style={{
                        background: `rgba(${c.accentRgb},0.06)`,
                        border: `1px solid rgba(${c.accentRgb},0.15)`,
                      }}
                    >
                      <div
                        className="text-2xl font-black mb-1"
                        style={{ color: c.accentColor, letterSpacing: '-0.02em' }}
                      >
                        {m.value}
                      </div>
                      <div className="text-[11px] text-white/35 font-medium leading-tight">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA hint */}
        <motion.p
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-white/25 text-sm mt-10"
        >
          ¿Tu negocio podría ser el próximo caso?{' '}
          <span
            className="text-cyan-400/60 cursor-pointer hover:text-cyan-400 transition-colors"
            onClick={() => document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Conversemos →
          </span>
        </motion.p>
      </div>
    </section>
  )
}
