'use client'

import React, { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

// TODO: reemplazar con testimonios reales
const testimonies = [
  {
    initials: 'MA',
    color: '#00ff88',
    colorRgb: '0,255,136',
    name: 'María Álvarez',
    role: 'Dueña',
    company: 'Restaurante El Fogón',
    rubro: 'Gastronomía · Tucumán',
    quote: 'Antes perdía reservas a las 2AM porque nadie atendía. Ahora el sistema las confirma solo y el lunes encuentro todo organizado.',
    result: 'reservas perdidas',
    resultValue: '0',
  },
  {
    initials: 'CP',
    color: '#7b2fff',
    colorRgb: '123,47,255',
    name: 'Carlos Pereyra',
    role: 'Gerente',
    company: 'Distribuidora Pereyra',
    rubro: 'Comercio · Salta',
    quote: 'Mi equipo respondía las mismas preguntas de precio y stock todo el día. Ahora la IA las responde sola y ellos se enfocan en vender.',
    result: 'consultas manuales',
    resultValue: '−80%',
  },
  {
    initials: 'SR',
    color: '#00ff88',
    colorRgb: '0,255,136',
    name: 'Dra. Sofía Ramos',
    role: 'Directora',
    company: 'Centro Médico Ramos',
    rubro: 'Salud · Tucumán',
    quote: 'Los turnos se agendan solos por WhatsApp. Los pacientes reciben recordatorio automático. Las ausencias bajaron a la mitad.',
    result: 'ausencias a turnos',
    resultValue: '−60%',
  },
]

function TestimonialCard({ t, index }: { t: typeof testimonies[0]; index: number }) {
  const cardRef = useRef(null)
  const isInView = useInView(cardRef, { once: true, amount: 0.1 })
  const reduced = useReducedMotion()

  return (
    <motion.div
      ref={cardRef}
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.25 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: `linear-gradient(135deg, rgba(${t.colorRgb}, 0.06), rgba(255, 255, 255, 0.02))`,
        border: `1px solid rgba(${t.colorRgb}, 0.15)`,
        borderRadius: '24px',
        padding: 'clamp(24px, 3vw, 36px)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflow: 'hidden',
        boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(${t.colorRgb},0.05)`
      }}
    >
      {/* Decorative Quotes */}
      <span style={{
        position: 'absolute', top: '-10px', left: '10px',
        fontSize: '80px', color: `rgba(${t.colorRgb}, 0.06)`,
        fontFamily: 'serif', pointerEvents: 'none', userSelect: 'none', lineHeight: 1
      }} aria-hidden="true">“</span>

      {/* Quote */}
      <p style={{
        fontSize: '16px', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.65)',
        lineHeight: 1.6, margin: 0, position: 'relative', zIndex: 1
      }}>
        {t.quote}
      </p>

      {/* Result Pill */}
      <div style={{
        background: `rgba(${t.colorRgb}, 0.1)`,
        padding: '16px',
        borderRadius: '16px',
        border: `1px solid rgba(${t.colorRgb}, 0.1)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: '32px', fontWeight: 900, color: t.color, lineHeight: 1 }}>{t.resultValue}</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{t.result}</span>
      </div>

      {/* Separator */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', width: '100%' }} />

      {/* Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${t.color}, rgba(${t.colorRgb},0.4))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 900, color: 'white', flexShrink: 0,
          boxShadow: `0 4px 12px rgba(${t.colorRgb},0.3)`
        }}>
          {t.initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t.name}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {t.role} · {t.company}
          </p>
          <p style={{ fontSize: '10px', color: t.color, fontWeight: 600, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.rubro}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function TestimoniosIA() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const reduced = useReducedMotion()

  return (
    <section
      id="testimonios"
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)',
        background: '#080810',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ATMOSPHERE GLOW */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '10%', right: '0%', width: '500px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(0, 255, 136, 0.05) 0%, transparent 60%)',
        filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <motion.div
           initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
           style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vh,64px)' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: '1px solid rgba(123,47,255,0.4)', color: '#7b2fff',
            padding: '6px 16px', borderRadius: '100px', fontSize: '11px',
            letterSpacing: '0.25em', fontWeight: 600, marginBottom: '24px',
            background: 'rgba(123,47,255,0.06)',
          }}>
             [ CASOS DE ÉXITO ]
          </div>
          <h2 style={{ fontSize: 'clamp(30px,4.5vw,52px)', fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: 1.1 }}>
            Empresas que ya<br />
            <span style={{ color: '#00ff88' }}>venden más con IA.</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {testimonies.map((t, i) => (
            <TestimonialCard key={i} t={t} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
