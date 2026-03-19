'use client'

import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence, useReducedMotion } from 'motion/react'

/**
 * PROCESO AUTOMATION: "Nuestro Proceso de Trabajo."
 * Reutiliza la arquitectura de ProcesoSoftware pero adaptada a los tiempos
 * y paleta de automatización (Ámbar/Naranja).
 */

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface ProcesoStep {
  id: number
  phase: string        // "FASE 01"
  title: string
  summary: string      // texto corto visible siempre
  duration: string     // "3-5 días"
  color: string
  colorRgb: string
  icon: string
  develop: string[]    // qué hace DevelOP
  cliente: string[]    // qué necesita del cliente
  deliverable: string  // qué entrega al final
  badge: string        // "ANÁLISIS" / "DISEÑO" etc
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const pasos: ProcesoStep[] = [
  {
    id: 0,
    phase: 'FASE 01',
    title: 'Relevamiento de Procesos',
    summary: 'Mapeamos tus tareas actuales para identificar dónde perdés más tiempo.',
    duration: '1 a 2 días',
    color: '#f59e0b',
    colorRgb: '245,158,11',
    icon: '🔍',
    badge: 'DIAGNÓSTICO DEL CAOS',
    develop: [
      'Reunión de 1 hora para mapear tareas',
      'Identificar los 3 procesos que más duelen',
      'Calcular horas perdidas actuales',
      'Propuesta de flujos a automatizar',
    ],
    cliente: [
      '1 reunión de 1 hora',
      'Lista de tareas repetitivas del equipo',
    ],
    deliverable: 'Mapa de automatizaciones con ROI estimado por flujo',
  },
  {
    id: 1,
    phase: 'FASE 02',
    title: 'Diseño de Flujos',
    summary: 'Construimos la lógica central y conectamos todas tus herramientas.',
    duration: '3 a 5 días',
    color: '#f97316',
    colorRgb: '249,115,22',
    icon: '🗺',
    badge: 'MAPA DEL PILOTO AUTOMÁTICO',
    develop: [
      'Diseño de cada flujo de trabajo',
      'Conexión con las apps que ya usás',
      'Pruebas en ambiente controlado',
      'Revisión y ajustes contigo',
    ],
    cliente: [
      'Acceso a las herramientas actuales',
      '1 revisión de los flujos diseñados',
    ],
    deliverable: 'Flujos funcionando, listos para aprobación final',
  },
  {
    id: 2,
    phase: 'FASE 03',
    title: 'Activación & Testing',
    summary: 'Encendemos el sistema y monitoreamos que todo funcione perfecto.',
    duration: '2 a 3 días',
    color: '#f59e0b',
    colorRgb: '245,158,11',
    icon: '⚡',
    badge: 'ENCENDEMOS EL SISTEMA',
    develop: [
      'Lanzamiento en vivo',
      'Monitoreo con datos reales',
      'Ajustes finos de lógica',
      'Vigilancia activa las primeras 48 horas',
    ],
    cliente: [
      'Validar que los procesos corren bien',
      'Reportar cualquier ajuste necesario',
    ],
    deliverable: 'Sistema operando solo, monitoreo activo',
  },
  {
    id: 3,
    phase: 'FASE 04',
    title: 'Capacitación & Soporte',
    summary: 'Tu equipo aprende a delegar en el sistema y te acompañamos 30 días.',
    duration: '1 día + soporte',
    color: '#f97316',
    colorRgb: '249,115,22',
    icon: '🚀',
    badge: 'EMPRESA LIBERADA',
    develop: [
      'Capacitación del equipo (1 hora)',
      'Dashboard de control accesible',
      'Soporte por 30 días incluido',
      'Mantenimiento mensual disponible',
    ],
    cliente: [
      'Asistir a la capacitación corta',
      'Feedback de las primeras semanas',
    ],
    deliverable: 'Equipo liberado de tareas robóticas, soporte activo',
  },
]

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function AtmosphereProceso() {
  return (
    <>
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '10%', left: '-5%',
          width: '400px', height: '700px',
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 60%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%', right: '-8%',
          width: '450px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.05) 0%, transparent 60%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(245,158,11,0.07) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          zIndex: 0,
          maskImage: 'linear-gradient(to right, black 0%, transparent 15%)',
          WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 15%)',
        }}
      />
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  return (
    <div style={{ marginBottom: 'clamp(40px, 6vh, 60px)' }}>
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={isInView ? { opacity: 1, y: 0 } : {}} 
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '100px', padding: '4px 14px', marginBottom: '20px', background: 'rgba(245,158,11,0.05)' }}
      >
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
        <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#f59e0b', fontWeight: 700 }}>[ EL CAMINO AL ÉXITO ]</span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25 }}
        style={{ fontSize: 'clamp(30px, 4.8vw, 60px)', fontWeight: 900, color: 'white', lineHeight: 1.05, margin: '0 0 18px', letterSpacing: '-0.03em' }}
      >
        Del caos al orden<br />
        <span style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          en 15 días.
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.38 }}
        style={{ fontSize: '16px', color: 'rgba(255,255,255,0.42)', margin: 0, maxWidth: '600px', lineHeight: 1.7 }}
      >
        No necesitás meses de consultoría. Implementamos rápido para que veas el retorno hoy.
      </motion.p>
    </div>
  )
}

function StepRow({ paso, index, isActive, isInView, onClick, shouldReduceMotion }: { paso: ProcesoStep, index: number, isActive: boolean, isInView: boolean, onClick: () => void, shouldReduceMotion?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.3 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}
    >
      <div style={{ position: 'relative', flexShrink: 0, zIndex: 1 }}>
        <motion.div
          animate={{
            scale: isActive ? 1.15 : 1,
            boxShadow: isActive
              ? `0 0 0 3px rgba(${paso.colorRgb}, 0.25), 0 0 20px rgba(${paso.colorRgb}, 0.3)`
              : 'none',
          }}
          transition={{ duration: 0.3 }}
          style={{
            width: '56px', height: '56px',
            borderRadius: '16px',
            background: isActive
              ? `linear-gradient(135deg, rgb(${paso.colorRgb}), rgba(${paso.colorRgb}, 0.7))`
              : `rgba(${paso.colorRgb}, 0.1)`,
            border: `1px solid rgba(${paso.colorRgb}, ${isActive ? 0.6 : 0.2})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            cursor: 'pointer',
            transition: 'background 300ms, border 300ms',
          }}
          onClick={onClick}
        >
          {paso.icon}
        </motion.div>
      </div>

      <div
        style={{
          flex: 1,
          background: isActive ? `rgba(${paso.colorRgb}, 0.08)` : 'rgba(255,255,255,0.015)',
          border: `1px solid rgba(${paso.colorRgb}, ${isActive ? 0.3 : 0.08})`,
          borderRadius: '18px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 250ms ease',
          boxShadow: isActive
            ? `0 0 0 1px rgba(${paso.colorRgb}, 0.1), 0 0 30px rgba(${paso.colorRgb}, 0.08), 0 8px 28px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)`
            : '0 4px 12px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
        onClick={onClick}
      >
        {isActive && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, rgba(${paso.colorRgb}, 0.7) 50%, transparent)` }} />
        )}
        <div style={{ padding: 'clamp(16px, 2.2vh, 22px) clamp(18px, 2.2vw, 26px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: `rgba(${paso.colorRgb}, 0.7)` }}>
                {paso.phase}
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', background: `rgba(${paso.colorRgb}, 0.1)`, border: `1px solid rgba(${paso.colorRgb}, 0.25)`, color: paso.color, borderRadius: '100px', padding: '2px 8px' }}>
                {paso.badge}
              </span>
            </div>

            <h3 style={{ fontSize: 'clamp(15px, 1.8vw, 19px)', fontWeight: 800, color: 'white', margin: '0 0 4px' }}>
              {paso.title}
            </h3>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
              {paso.summary}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
            <div style={{ background: `rgba(${paso.colorRgb}, 0.08)`, border: `1px solid rgba(${paso.colorRgb}, 0.18)`, borderRadius: '8px', padding: '5px 10px', textAlign: 'center' }}>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', margin: '0 0 1px', letterSpacing: '0.1em' }}>
                DURACIÓN
              </p>
              <p style={{ fontSize: '12px', fontWeight: 800, color: paso.color, margin: 0, whiteSpace: 'nowrap' }}>
                {paso.duration}
              </p>
            </div>

            <motion.div
              animate={{ rotate: isActive ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              style={{ fontSize: '12px', color: `rgba(${paso.colorRgb}, 0.5)` }}
            >
              ▼
            </motion.div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 clamp(16px, 2vw, 24px) clamp(16px, 2vh, 24px)', borderTop: `1px solid rgba(${paso.colorRgb}, 0.1)` }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 mt-4">
                  <div>
                    <h4 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: `rgba(${paso.colorRgb}, 0.7)`, textTransform: 'uppercase', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="9" height="13" viewBox="0 0 9 13" fill={paso.color} style={{ flexShrink: 0 }}>
                        <path d="M5.5 0L0 7.5h3.5L2 13l7-8H5L5.5 0z"/>
                      </svg>
                      Nosotros hacemos
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {paso.develop.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
                          style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}
                        >
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: paso.color, marginTop: '6px', flexShrink: 0, boxShadow: `0 0 6px ${paso.color}` }} />
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="6" cy="4" r="2.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
                        <path d="M1 11c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      Vos ponés
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {paso.cliente.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                          style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}
                        >
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', marginTop: '6px', flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '16px 18px',
                    background: `rgba(${paso.colorRgb}, 0.07)`,
                    border: `1px solid rgba(${paso.colorRgb}, 0.22)`,
                    borderRadius: '14px',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                    boxShadow: `0 4px 16px rgba(0,0,0,0.2)`,
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, rgba(${paso.colorRgb}, 0.5) 50%, transparent)` }} />
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `linear-gradient(135deg, rgba(${paso.colorRgb}, 0.2), rgba(${paso.colorRgb}, 0.08))`,
                    border: `1px solid rgba(${paso.colorRgb}, 0.35)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: `0 0 12px rgba(${paso.colorRgb}, 0.2)`,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8.5L6 12.5L14 4" stroke={paso.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', color: `rgba(${paso.colorRgb}, 0.65)`, textTransform: 'uppercase', margin: 0, fontFamily: 'ui-monospace, monospace' }}>
                        Entregable
                      </p>
                      <div style={{ height: '1px', flex: 1, background: `rgba(${paso.colorRgb}, 0.15)` }} />
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: 0, lineHeight: 1.55 }}>
                      {paso.deliverable}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function StepperTimeline({ pasos, activeStep, setActiveStep, isInView }: { pasos: ProcesoStep[], activeStep: number | null, setActiveStep: (i: number) => void, isInView: boolean }) {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: '27px', top: '40px', bottom: '40px', width: '2px', background: 'rgba(255,255,255,0.04)', zIndex: 0 }}>
        <motion.div
          initial={{ height: '0%' }}
          animate={isInView ? { height: '100%' } : {}}
          transition={{ duration: shouldReduceMotion ? 0 : 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', background: 'linear-gradient(to bottom, #f59e0b, #f97316)', boxShadow: '0 0 12px rgba(245,158,11,0.6), 0 0 4px rgba(245,158,11,0.9)' }}
        />

        <AnimatePresence>
          {activeStep !== null && (
            <motion.div
              key={activeStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                left: '-3px',
                top: `${(activeStep / pasos.length) * 100}%`,
                width: '8px',
                height: `${(1 / pasos.length) * 100}%`,
                background: `radial-gradient(ellipse at center, rgba(245,158,11,0.8) 0%, transparent 70%)`,
                filter: 'blur(4px)',
                zIndex: 2,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
        {pasos.map((paso, i) => (
          <StepRow
            key={paso.id}
            paso={paso}
            index={i}
            isActive={activeStep === i}
            isInView={isInView}
            onClick={() => setActiveStep(i)}
            shouldReduceMotion={shouldReduceMotion ?? undefined}
          />
        ))}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ProcesoAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [everClicked, setEverClicked] = useState(false)
  
  return (
    <section 
      ref={sectionRef} 
      style={{ padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)', background: '#080810', position: 'relative', overflow: 'hidden' }}
    >
      <AtmosphereProceso />
      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Header isInView={isInView} />

        <AnimatePresence>
          {!everClicked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '12px', color: 'rgba(245,158,11,0.5)' }}
            >
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
                →
              </motion.span>
              Hacé clic en cada fase para expandirla
            </motion.div>
          )}
        </AnimatePresence>

        <StepperTimeline
          pasos={pasos}
          activeStep={activeStep}
          setActiveStep={(i) => {
            setActiveStep(activeStep === i ? null : i)
            setEverClicked(true)
          }}
          isInView={isInView}
        />

        {/* TOTAL DEL PROYECTO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 'clamp(32px, 4vh, 48px)',
            padding: 'clamp(22px, 2.8vw, 36px)',
            background: 'rgba(255,255,255,0.018)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}
        >
          {/* Línea de tiempo visual */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', flex: 1, minWidth: '280px' }}>
            {pasos.map((paso, i) => (
              <React.Fragment key={i}>
                <div style={{
                  flex: 1,
                  height: '4px',
                  background: `rgba(${paso.colorRgb}, 0.4)`,
                  borderRadius: i === 0 ? '100px 0 0 100px' : i === pasos.length - 1 ? '0 100px 100px 0' : '0',
                  position: 'relative',
                }}>
                  <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', color: `rgba(${paso.colorRgb}, 0.7)`, whiteSpace: 'nowrap', letterSpacing: '0.1em' }}>
                    {paso.badge}
                  </div>
                </div>
                {i < pasos.length - 1 && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Resumen */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: '0 0 5px', letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase' }}>Tiempo total · Según complejidad</p>
            <p style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>1 a 2 SEMANAS</p>
            <p style={{ fontSize: '11px', color: 'rgba(245,158,11,0.65)', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>Tu empresa en piloto automático</p>
          </div>
        </motion.div>

        {/* SEPARADOR FINAL */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3) 30%, rgba(249,115,22,0.4) 50%, rgba(245,158,11,0.3) 70%, transparent)',
            transformOrigin: 'left center',
            marginTop: 'clamp(48px, 7vh, 80px)',
          }}
        />
      </div>
    </section>
  )
}
