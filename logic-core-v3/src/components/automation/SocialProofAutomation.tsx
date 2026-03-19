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
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.22em',
          color: '#f59e0b',
          marginBottom: '20px',
          textTransform: 'uppercase',
          background: 'rgba(245,158,11,0.07)',
          padding: '6px 18px',
          borderRadius: '100px',
          border: '1px solid rgba(245,158,11,0.25)',
          fontFamily: 'ui-monospace, monospace',
          boxShadow: '0 0 20px rgba(245,158,11,0.06)',
        }}
      >
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px rgba(245,158,11,0.9)', flexShrink: 0 }} />
        EMPRESARIOS DEL NOA
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontSize: 'clamp(34px, 5.5vw, 60px)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          margin: '0 0 18px',
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
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.018'/%3E%3C/svg%3E"), linear-gradient(135deg, rgba(${t.colorRgb},0.06) 0%, rgba(255,255,255,0.02) 100%)`,
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

      {/* Comillas decorativas SVG */}
      <div style={{ position: 'absolute', top: '16px', right: '20px', pointerEvents: 'none', userSelect: 'none' }}>
        <svg width="48" height="36" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <path d="M0 36V22.5C0 10.1 7.8 3.1 23.4 0l2.1 3.6C17.2 5.4 12.6 9 11.4 14.4H18V36H0zm27 0V22.5C27 10.1 34.8 3.1 50.4 0l2.1 3.6C44.2 5.4 39.6 9 38.4 14.4H45V36H27z" fill={`rgba(${t.colorRgb},0.07)`}/>
        </svg>
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
          fontSize: '26px',
          fontWeight: 900,
          color: t.color,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
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
        <motion.div
          whileHover={{ scale: 1.08, boxShadow: `0 0 0 3px rgba(${t.colorRgb},0.4), 0 0 16px rgba(${t.colorRgb},0.25)` }}
          transition={{ duration: 0.2 }}
          style={{
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
            boxShadow: `0 0 0 2px rgba(${t.colorRgb},0.25)`,
            cursor: 'default',
          }}
        >
          {t.initials}
        </motion.div>
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
            padding: 'clamp(24px, 3.5vw, 36px)',
            background: 'rgba(255,255,255,0.018)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E"), linear-gradient(rgba(255,255,255,0.018), rgba(255,255,255,0.018))`,
          }}
        >
          {/* Estrellas */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0,1,2,3,4].map((i) => (
                <motion.svg
                  key={i}
                  width="22" height="22" viewBox="0 0 24 24"
                  initial={{ opacity: 0, scale: 0.5, y: 4 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.75 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <path d="M12 2l2.9 6.26L22 9.27l-5.5 5.14 1.3 7.59L12 18.77l-5.8 3.23 1.3-7.59L2 9.27l7.1-1.01L12 2z" fill="#f59e0b" stroke="rgba(245,158,11,0.3)" strokeWidth="0.5" />
                </motion.svg>
              ))}
            </div>
            <span style={{ fontSize: '28px', fontWeight: 900, color: 'white', lineHeight: 1 }}>5.0</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>SATISFACCIÓN PROMEDIO</span>
          </div>

          <div className="stat-divider" style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)' }}/>

          {/* Proyectos */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '38px', fontWeight: 900, color: '#f59e0b', lineHeight: 1, fontFamily: 'ui-monospace, monospace', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>89+</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>Flujos en producción</span>
          </div>

          <div className="stat-divider" style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)' }}/>

          {/* Integraciones */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '38px', fontWeight: 900, color: '#f97316', lineHeight: 1, fontFamily: 'ui-monospace, monospace', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>400+</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>Integraciones disponibles</span>
          </div>

          <div className="stat-divider" style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)' }}/>

          {/* Time to first */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '38px', fontWeight: 900, color: '#f59e0b', lineHeight: 1, fontFamily: 'ui-monospace, monospace', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>1hs</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>Promedio time to first</span>
          </div>

          <div className="stat-divider" style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)' }}/>

          {/* Uptime */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '38px', fontWeight: 900, color: '#f97316', lineHeight: 1, fontFamily: 'ui-monospace, monospace', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>99.9%</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>Uptime de flujos</span>
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
