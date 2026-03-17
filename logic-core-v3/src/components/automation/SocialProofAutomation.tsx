'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'motion/react'

/**
 * SOCIAL PROOF AUTOMATION: "Lo que cambió en sus empresas."
 * Reutiliza la arquitectura de SocialProofSoftware pero adaptada a la paleta
 * y testimonios de automatización (Ámbar/Naranja).
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  rubro: string
  quote: string
  result: string      // el resultado concreto
  resultValue: string // el número
  color: string
  colorRgb: string
  initials: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const testimonials: Testimonial[] = [
  {
    id: 0,
    name: 'Lucía Fernández',
    role: 'Dueña',
    company: 'Fer Indumentaria',
    rubro: 'Comercio · Tucumán',
    quote: 'Antes pasaba 2 horas al día respondiendo las mismas preguntas por WhatsApp. Ahora el sistema las responde solo y yo solo atiendo a los que están listos para comprar.',
    result: 'tiempo en atención al cliente',
    resultValue: '−85%',
    color: '#f59e0b',
    colorRgb: '245,158,11',
    initials: 'LF',
  },
  {
    id: 1,
    name: 'Ariel Moyano',
    role: 'Gerente Comercial',
    company: 'Distribuidora Moyano',
    rubro: 'Distribuidora · Salta',
    quote: 'Teníamos un empleado que todos los lunes armaba el reporte de ventas. Ahora llega solo al mail a las 8AM. Ese empleado ahora hace cosas que realmente importan.',
    result: 'horas en reportes manuales',
    resultValue: '0',
    color: '#f97316',
    colorRgb: '249,115,22',
    initials: 'AM',
  },
  {
    id: 2,
    name: 'Dra. Patricia Ruiz',
    role: 'Directora',
    company: 'Centro Salud Integral',
    rubro: 'Clínica · Tucumán',
    quote: 'Las ausencias a turnos bajaron un 60% desde que el sistema manda el recordatorio 48 horas antes. Solo eso ya pagó la automatización.',
    result: 'ausencias a turnos',
    resultValue: '−60%',
    color: '#f59e0b',
    colorRgb: '245,158,11',
    initials: 'PR',
  },
]

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function AtmosphereProof() {
  return (
    <>
      <div style={{
        position: 'absolute',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '700px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 65%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0,
      }}/>
      <div style={{
        position: 'absolute',
        top: '30%', left: '-10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.04) 0%, transparent 60%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
      }}/>
      <div style={{
        position: 'absolute',
        top: '30%', right: '-10%',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.04) 0%, transparent 60%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
      }}/>
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  return (
    <div style={{
      textAlign: 'center',
      marginBottom: 'clamp(40px, 5vh, 56px)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.25em',
          color: '#f59e0b',
          marginBottom: '16px',
          textTransform: 'uppercase',
          background: 'rgba(245,158,11,0.1)',
          padding: '4px 12px',
          borderRadius: '4px',
          border: '1px solid rgba(245,158,11,0.2)'
        }}
      >
        [ EMPRESARIOS DEL NOA ]
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 0 16px',
          color: 'white',
        }}
      >
        Lo que cambió en sus empresas.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontSize: 'clamp(15px, 1.8vw, 19px)',
          color: 'rgba(255,255,255,0.42)',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        No son demos. Son flujos corriendo hoy mismo en negocios reales.
      </motion.p>
    </div>
  )
}

function TestimonialCard({
  t, isInView, delay,
}: {
  t: Testimonial
  isInView: boolean
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      style={{
        background: `linear-gradient(135deg, rgba(${t.colorRgb},0.06) 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid rgba(${t.colorRgb},0.15)`,
        borderRadius: '20px',
        padding: 'clamp(24px, 3vw, 36px)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Borde superior acento */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, rgba(${t.colorRgb},0.7) 40%, rgba(${t.colorRgb},0.7) 60%, transparent)`,
      }}/>

      {/* Comillas decorativas */}
      <div style={{
        position: 'absolute',
        top: '16px', right: '20px',
        fontSize: '80px',
        lineHeight: 1,
        color: `rgba(${t.colorRgb},0.06)`,
        fontFamily: 'Georgia, serif',
        fontWeight: 900,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        "
      </div>

      {/* Quote */}
      <p style={{
        fontSize: 'clamp(14px, 1.5vw, 16px)',
        lineHeight: 1.75,
        color: 'rgba(255,255,255,0.65)',
        margin: 0,
        fontStyle: 'italic',
        position: 'relative',
        zIndex: 1,
      }}>
        "{t.quote}"
      </p>

      {/* Resultado destacado */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        background: `rgba(${t.colorRgb},0.08)`,
        border: `1px solid rgba(${t.colorRgb},0.2)`,
        borderRadius: '12px',
        padding: '10px 16px',
        alignSelf: 'flex-start',
      }}>
        <span style={{
          fontSize: '24px',
          fontWeight: 900,
          color: t.color,
          fontFamily: 'monospace',
        }}>
          {t.resultValue}
        </span>
        <span style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.45)',
        }}>
          {t.result}
        </span>
      </div>

      {/* Autor */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingTop: '16px',
        marginTop: 'auto',
        borderTop: `1px solid rgba(${t.colorRgb},0.1)`,
      }}>
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, rgb(${t.colorRgb}), rgba(${t.colorRgb},0.5))`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 800,
          color: 'white',
          flexShrink: 0,
          letterSpacing: '0.05em',
        }}>
          {t.initials}
        </div>
        <div>
          <p style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'white',
            margin: '0 0 2px',
          }}>
            {t.name}
          </p>
          <p style={{
            fontSize: '12px',
            color: `rgba(${t.colorRgb},0.7)`,
            margin: '0 0 1px',
          }}>
            {t.role} · {t.company}
          </p>
          <p style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.25)',
            margin: 0,
          }}>
            {t.rubro}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function SocialProofAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, {
    once: true, amount: 0.1,
  })

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)',
        background: '#080810',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AtmosphereProof />
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        <Header isInView={isInView} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(14px, 2vw, 20px)',
        }}>
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.id}
              t={t}
              isInView={isInView}
              delay={0.25 + i * 0.12}
            />
          ))}
        </div>

        {/* RATING GLOBAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="rating-global-container"
          style={{
            marginTop: 'clamp(32px, 5vh, 52px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(24px, 4vw, 48px)',
            padding: 'clamp(20px, 3vw, 32px)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Estrellas */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {'★★★★★'.split('').map((s, i) => (
                <span key={i} style={{ fontSize: '24px', color: '#f59e0b' }}>{s}</span>
              ))}
            </div>
            <span style={{ fontSize: '28px', fontWeight: 900, color: 'white', lineHeight: 1 }}>5.0</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>SATISFACCIÓN PROMEDIO</span>
          </div>

          <div className="stat-divider" style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.08)' }}/>

          {/* Proyectos */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#f59e0b', lineHeight: 1, fontFamily: 'monospace' }}>89+</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>FLUJOS EN PRODUCCIÓN</span>
          </div>

          <div className="stat-divider" style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.08)' }}/>

          {/* Integraciones */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#f97316', lineHeight: 1, fontFamily: 'monospace' }}>400+</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>INTEGRACIONES DISPONIBLES</span>
          </div>

          <div className="stat-divider" style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.08)' }}/>

          {/* Time to first */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#f59e0b', lineHeight: 1, fontFamily: 'monospace' }}>1hs</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>PROMEDIO TIME TO FIRST</span>
          </div>

          <div className="stat-divider" style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.08)' }}/>

          {/* Uptime */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#f97316', lineHeight: 1, fontFamily: 'monospace' }}>99.9%</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>UPTIME DE FLUJOS</span>
          </div>
        </motion.div>

        {/* SEPARADOR FINAL */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.9 }}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3) 30%, rgba(249,115,22,0.4) 50%, rgba(245,158,11,0.3) 70%, transparent)',
            transformOrigin: 'left center',
            marginTop: 'clamp(48px, 6vh, 72px)',
          }}
        />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .rating-global-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 24px !important;
          }
          .stat-divider {
            display: none !important;
          }
        }
      `}</style>
    </section>
  )
}
