'use client'

import React, { useState, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface ShowcaseProject {
  id: number
  rubro: string
  title: string
  description: string
  metrics: { value: string; label: string }[]
  tags: string[]
  color: string
  colorRgb: string
  icon: string
  size: 'large' | 'medium'
  status: 'producción' | 'en desarrollo'
}

// ─── DATA ────────────────────────────────────────────────────────────────────

function AtmosphereShowcase() {
  return (
    <>
      {[
        { top: '5%', left: '15%', color: '99,102,241', size: 400 },
        { top: '5%', right: '-5%', color: '123,47,255', size: 350 },
        { top: '60%', left: '-5%', color: '123,47,255', size: 350 },
        { top: '60%', right: '20%', color: '99,102,241', size: 300 },
      ].map((g, i) => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute',
          top: g.top, left: g.left,
          right: g.right,
          width: `${g.size}px`,
          height: `${g.size * 0.7}px`,
          background: `radial-gradient(ellipse, rgba(${g.color}, 0.05) 0%, transparent 60%)`,
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}
    </>
  )
}

const projects: ShowcaseProject[] = [
  {
    id: 0,
    size: 'large',
    rubro: 'Distribuidora',
    title: 'Sistema de Gestión de Pedidos',
    description: 'ERP completo para distribuidora de alimentos del NOA. Control de stock, pedidos, logística y facturación AFIP integrados.',
    metrics: [
      { value: '−80%', label: 'errores de stock' },
      { value: '3x', label: 'velocidad de despacho' },
      { value: '12', label: 'usuarios simultáneos' },
    ],
    tags: ['ERP', 'Stock', 'Logística', 'AFIP'],
    color: '#6366f1',
    colorRgb: '99,102,241',
    icon: '📦',
    status: 'producción',
  },
  {
    id: 1,
    size: 'medium',
    rubro: 'Clínica Médica',
    title: 'Portal de Turnos y Gestión Clínica',
    description: 'Sistema de gestión de turnos, historias clínicas y facturación médica. Integrado con obra social.',
    metrics: [
      { value: '−60%', label: 'ausencias' },
      { value: '40%', label: 'más turnos/día' },
    ],
    tags: ['Salud', 'Turnos', 'Historia Clínica'],
    color: '#7b2fff',
    colorRgb: '123,47,255',
    icon: '🏥',
    status: 'producción',
  },
  {
    id: 2,
    size: 'medium',
    rubro: 'Constructora',
    title: 'Sistema de Control de Obras',
    description: 'Seguimiento de avance de obras, control de materiales, gestión de subcontratistas y reportes para inversores.',
    metrics: [
      { value: '100%', label: 'trazabilidad' },
      { value: '−40%', label: 'costo admin' },
    ],
    tags: ['Construcción', 'Proyectos', 'RRHH'],
    color: '#6366f1',
    colorRgb: '99,102,241',
    icon: '🏗',
    status: 'producción',
  },
  {
    id: 3,
    size: 'medium',
    rubro: 'Comercio Mayorista',
    title: 'Plataforma B2B de Ventas',
    description: 'Portal de pedidos para clientes mayoristas. Catálogo con precios por lista, historial y pagos integrados.',
    metrics: [
      { value: '2x', label: 'pedidos mensuales' },
      { value: '0', label: 'pedidos por teléfono' },
    ],
    tags: ['B2B', 'E-commerce', 'Pagos'],
    color: '#7b2fff',
    colorRgb: '123,47,255',
    icon: '🏪',
    status: 'producción',
  },
  {
    id: 4,
    size: 'medium',
    rubro: 'Laboratorio',
    title: 'LIMS — Sistema de Gestión de Muestras',
    description: 'Sistema de trazabilidad de muestras, resultados y certificados. Integrado con equipos de análisis.',
    metrics: [
      { value: '−90%', label: 'tiempo de reporte' },
      { value: 'ISO', label: 'cumplimiento norma' },
    ],
    tags: ['Salud', 'Trazabilidad', 'Certificados'],
    color: '#6366f1',
    colorRgb: '99,102,241',
    icon: '🔬',
    status: 'en desarrollo',
  },
]

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Header({ isInView }: { isInView: boolean }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div style={{ marginBottom: 'clamp(40px, 6vh, 60px)' }}>
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(123,47,255,0.4)',
          borderRadius: '100px',
          padding: '4px 14px',
          marginBottom: '20px',
          background: 'rgba(123,47,255,0.05)',
        }}
      >
        <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#7b2fff', fontWeight: 700 }}>
          [ SISTEMAS EN PRODUCCIÓN ]
        </span>
      </motion.div>

      <motion.h2
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25 }}
        style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 16px' }}
      >
        Proyectos reales.<br />
        <span style={{ color: '#6366f1' }}>Resultados medibles.</span>
      </motion.h2>

      <motion.p
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.38 }}
        style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', margin: 0, maxWidth: '600px' }}
      >
        Sistemas funcionando hoy en empresas del NOA.
      </motion.p>
    </div>
  )
}

function ShowcaseCard({
  project, gridStyle, isInView, delay,
}: {
  project: ShowcaseProject
  gridStyle: React.CSSProperties
  isInView: boolean
  delay: number
}) {
  const [hovered, setHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      style={{
        ...gridStyle,
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: `linear-gradient(135deg, rgba(${project.colorRgb}, 0.07) 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid rgba(${project.colorRgb}, ${hovered ? 0.3 : 0.12})`,
        padding: 'clamp(20px, 2.5vw, 32px)',
        cursor: 'default',
        minHeight: project.size === 'large' ? '260px' : '220px',
        transition: 'border 250ms, box-shadow 250ms',
        boxShadow: hovered
          ? `0 0 40px rgba(${project.colorRgb}, 0.08), 0 20px 60px rgba(0,0,0,0.4)`
          : '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Borde superior */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, rgba(${project.colorRgb}, 0.7) 40%, rgba(${project.colorRgb}, 0.7) 60%, transparent)`,
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 250ms',
      }} />

      {/* Número decorativo */}
      <div style={{
        position: 'absolute',
        bottom: '-10px', right: '16px',
        fontSize: '88px',
        fontWeight: 900,
        color: `rgba(${project.colorRgb}, 0.04)`,
        lineHeight: 1,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        {String(project.id + 1).padStart(2, '0')}
      </div>

      {/* Spotlight hover */}
      {hovered && !shouldReduceMotion && (
        <div style={{
          position: 'absolute',
          top: '-100px', left: '-100px',
          width: '300px', height: '300px',
          background: `radial-gradient(circle, rgba(${project.colorRgb}, 0.1) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '14px',
              background: `rgba(${project.colorRgb}, 0.12)`,
              border: `1px solid rgba(${project.colorRgb}, 0.25)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              {project.icon}
            </div>
            <div>
              <p style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: `rgba(${project.colorRgb}, 0.7)`,
                margin: '0 0 2px',
              }}>
                {project.rubro.toUpperCase()}
              </p>
              <h3 style={{
                fontSize: project.size === 'large' ? 'clamp(17px, 2vw, 22px)' : '16px',
                fontWeight: 900,
                color: 'white',
                margin: 0,
                lineHeight: 1.2,
              }}>
                {project.title}
              </h3>
            </div>
          </div>

          {/* Status badge */}
          <span style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            background: project.status === 'producción' ? 'rgba(74,222,128,0.1)' : 'rgba(245,158,11,0.1)',
            color: project.status === 'producción' ? '#4ade80' : '#f59e0b',
            border: `1px solid ${project.status === 'producción' ? 'rgba(74,222,128,0.25)' : 'rgba(245,158,11,0.25)'}`,
            borderRadius: '100px',
            padding: '3px 10px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            ● {project.status}
          </span>
        </div>

        {/* Descripción */}
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.42)',
          lineHeight: 1.65,
          margin: '0 0 20px',
          maxWidth: project.size === 'large' ? '460px' : '100%',
        }}>
          {project.description}
        </p>

        {/* Métricas */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {project.metrics.map((m, i) => (
            <div key={i} style={{
              background: `rgba(${project.colorRgb}, 0.08)`,
              border: `1px solid rgba(${project.colorRgb}, 0.2)`,
              borderRadius: '10px',
              padding: '8px 14px',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '18px',
                fontWeight: 900,
                color: project.color,
                margin: '0 0 2px',
                fontFamily: 'monospace',
              }}>
                {m.value}
              </p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0, whiteSpace: 'nowrap' }}>
                {m.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ShowcaseSoftware() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)',
        background: '#06060f',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AtmosphereShowcase />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Header isInView={isInView} />
        <div 
          className="showcase-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {/* Card 0 (Large) */}
          <ShowcaseCard
            project={projects[0]}
            gridStyle={{ gridColumn: 'span 2', gridRow: 'span 1' }}
            isInView={isInView}
            delay={0.25}
          />
          {/* Card 3 (Medium) */}
          <ShowcaseCard
            project={projects[3]}
            gridStyle={{ gridColumn: 'span 1', gridRow: 'span 2' }}
            isInView={isInView}
            delay={0.3}
          />
          {/* Cards 1, 2, 4 (Medium) */}
          <ShowcaseCard
            project={projects[1]}
            gridStyle={{ gridColumn: 'span 1', gridRow: 'span 1' }}
            isInView={isInView}
            delay={0.35}
          />
          <ShowcaseCard
            project={projects[2]}
            gridStyle={{ gridColumn: 'span 1', gridRow: 'span 1' }}
            isInView={isInView}
            delay={0.42}
          />
          <div style={{ gridColumn: 'span 2' }}>
            <ShowcaseCard
              project={projects[4]}
              gridStyle={{ width: '100%' }}
              isInView={isInView}
              delay={0.49}
            />
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          style={{
            marginTop: 'clamp(32px, 5vh, 56px)',
            padding: 'clamp(24px, 3vw, 40px)',
            background: 'rgba(99,102,241,0.04)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer top */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, #6366f1 40%, #7b2fff 60%, transparent)',
          }} />

          <div>
            <p style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: 'rgba(99,102,241,0.6)',
              margin: '0 0 6px',
              fontWeight: 600,
            }}>
              ¿TU RUBRO NO ESTÁ ARRIBA?
            </p>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 22px)',
              fontWeight: 800,
              color: 'white',
              margin: 0,
              lineHeight: 1.3,
            }}>
              Trabajamos en cualquier industria.<br />
              Si tiene procesos, lo podemos sistematizar.
            </p>
          </div>

          <motion.a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20ver%20si%20pueden%20hacer%20un%20sistema%20para%20mi%20empresa`}
            target="_blank"
            whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              fontWeight: 800,
              fontSize: '14px',
              padding: '14px 28px',
              borderRadius: '100px',
              textDecoration: 'none',
              boxShadow: '0 0 32px rgba(99,102,241,0.3)',
              flexShrink: 0,
            }}
          >
            Consultá tu caso →
          </motion.a>
        </motion.div>

        {/* Final Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 1.0 }}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3) 30%, rgba(123,47,255,0.4) 50%, rgba(99,102,241,0.3) 70%, transparent)',
            transformOrigin: 'left center',
            marginTop: 'clamp(48px, 6vh, 72px)',
          }}
        />
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .showcase-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .showcase-grid {
            grid-template-columns: 1fr !important;
          }
          .showcase-grid > :global(*) {
            grid-column: span 1 !important;
            grid-row: auto !important;
          }
        }
      `}</style>
    </section>
  )
}
