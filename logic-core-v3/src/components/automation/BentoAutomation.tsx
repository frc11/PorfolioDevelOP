'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

/**
 * BENTO AUTOMATION: "El Fin del Trabajo Robótico."
 * Cards con efecto flip 3D que muestran procesos manuales vs automáticos.
 */

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface WorkflowStep {
  icon: string
  label: string
  arrow?: boolean
}

interface BentoWorkflow {
  id: number
  size: 'large' | 'medium' | 'small'
  category: string
  antes: {
    title: string
    description: string
    steps: WorkflowStep[]
    pain: string       // p.ej. "4 horas/semana"
  }
  despues: {
    title: string
    description: string
    steps: WorkflowStep[]
    gain: string       // p.ej. "0 minutos"
  }
  color: string
  colorRgb: string
}

// ─── DATA ───────────────────────────────────────────────────────────────────

const workflows: BentoWorkflow[] = [
  {
    id: 0, size: 'large',
    category: 'VENTAS',
    antes: {
      title: 'El lead se pierde entre mensajes',
      description: 'Un cliente escribe por Meta Ads. Alguien lo copia a la planilla. Otro lo llama. Nadie sabe en qué paso está.',
      steps: [
        { icon: '📣', label: 'Lead llega' },
        { icon: '✍️', label: 'Se copia manual', arrow: true },
        { icon: '📊', label: 'Se anota en Excel', arrow: true },
        { icon: '⏰', label: 'Alguien llama', arrow: true },
      ],
      pain: '3 de cada 10 leads nunca contactados',
    },
    despues: {
      title: 'El lead entra, el sistema actúa',
      description: 'Llega el lead, el sistema lo registra, manda WhatsApp en segundos y avisa al vendedor. Sin intervención.',
      steps: [
        { icon: '📣', label: 'Lead entra' },
        { icon: '💬', label: 'WhatsApp auto', arrow: true },
        { icon: '📊', label: 'CRM actualizado', arrow: true },
        { icon: '🔔', label: 'Vendedor avisado', arrow: true },
      ],
      gain: '100% leads contactados en < 2 min',
    },
    color: '#f59e0b', colorRgb: '245,158,11',
  },
  {
    id: 1, size: 'medium',
    category: 'FACTURACIÓN',
    antes: {
      title: 'La factura llega tarde o no llega',
      description: 'Pago recibido. Alguien tiene que entrar a AFIP, facturar y mandar el PDF. Si está ocupado, el cliente espera.',
      steps: [
        { icon: '💳', label: 'Pago recibido' },
        { icon: '⏳', label: 'Esperar admin', arrow: true },
        { icon: '🧾', label: 'Facturar AFIP', arrow: true },
        { icon: '📧', label: 'Mandar PDF', arrow: true },
      ],
      pain: '2-24 hs de demora en facturación',
    },
    despues: {
      title: 'Pago recibido, factura enviada',
      description: 'MercadoPago confirma el pago. El sistema factura en AFIP y manda el PDF al cliente. En 30 segundos.',
      steps: [
        { icon: '💳', label: 'Pago confirmado' },
        { icon: '🧾', label: 'AFIP automático', arrow: true },
        { icon: '📧', label: 'PDF enviado', arrow: true },
      ],
      gain: 'Factura en < 30 segundos. Siempre.',
    },
    color: '#f97316', colorRgb: '249,115,22',
  },
  {
    id: 2, size: 'medium',
    category: 'STOCK',
    antes: {
      title: 'Te enterás del quiebre de stock tarde',
      description: 'El depósito llega a cero. El vendedor se da cuenta cuando ya prometió la entrega.',
      steps: [
        { icon: '📦', label: 'Stock se agota' },
        { icon: '😤', label: 'Vendedor sabe', arrow: true },
        { icon: '❌', label: 'Cliente decepcionado', arrow: true },
      ],
      pain: 'Promesas rotas y clientes perdidos',
    },
    despues: {
      title: 'El sistema alerta antes del quiebre',
      description: 'Cuando el stock baja del mínimo, el sistema avisa por Slack y manda la orden de compra sola.',
      steps: [
        { icon: '📉', label: 'Stock bajo mínimo' },
        { icon: '🔔', label: 'Alerta Slack', arrow: true },
        { icon: '📋', label: 'Orden automática', arrow: true },
      ],
      gain: '0 quiebres de stock sorpresivos',
    },
    color: '#f59e0b', colorRgb: '245,158,11',
  },
  {
    id: 3, size: 'small',
    category: 'REPORTES',
    antes: {
      title: 'El reporte del lunes lo arma alguien',
      description: 'Cada semana alguien junta datos de 3 sistemas distintos y arma la planilla de forma manual.',
      steps: [
        { icon: '📊', label: 'Juntar datos' },
        { icon: '✍️', label: 'Armar planilla', arrow: true },
        { icon: '📧', label: 'Mandar mail', arrow: true },
      ],
      pain: '3-4 hs semanales en reportes',
    },
    despues: {
      title: 'El reporte llega solo al mail',
      description: 'El lunes a las 8AM el reporte consolidado de la semana llega al mail sin intervención humana.',
      steps: [
        { icon: '🤖', label: 'Recolección auto' },
        { icon: '📊', label: 'Graficado solo', arrow: true },
        { icon: '📧', label: 'Enviado 8AM', arrow: true },
      ],
      gain: '0 horas en reportes manuales',
    },
    color: '#f97316', colorRgb: '249,115,22',
  },
  {
    id: 4, size: 'medium',
    category: 'ATENCIÓN AL CLIENTE',
    antes: {
      title: 'Las mismas preguntas, mil veces',
      description: 'Precio, horario, disponibilidad. Tu equipo responde lo mismo todo el día por WhatsApp.',
      steps: [
        { icon: '💬', label: 'Consulta entra' },
        { icon: '⏰', label: 'Esperar horario', arrow: true },
        { icon: '✍️', label: 'Respuesta manual', arrow: true },
      ],
      pain: '80% de consultas son repetitivas',
    },
    despues: {
      title: 'Respuestas automáticas, 24/7',
      description: 'El sistema responde precio, horario y disponibilidad solo. Tu equipo atiende casos complejos.',
      steps: [
        { icon: '💬', label: 'Consulta entra' },
        { icon: '🤖', label: 'Resp. instantánea', arrow: true },
        { icon: '✅', label: 'Cliente feliz', arrow: true },
      ],
      gain: 'Respuesta en < 5 segundos. 24/7.',
    },
    color: '#f59e0b', colorRgb: '245,158,11',
  },
]

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function AtmosphereBento() {
  return (
    <>
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '10%', left: '-8%',
          width: '500px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(239, 68, 68, 0.04) 0%, transparent 60%)',
          filter: 'blur(90px)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '10%', right: '-8%',
          width: '600px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(245, 158, 11, 0.06) 0%, transparent 60%)',
          filter: 'blur(100px)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '5%', left: '50%',
          transform: 'translateX(-50%)',
          width: '700px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(249, 115, 22, 0.04) 0%, transparent 65%)',
          filter: 'blur(80px)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
    </>
  )
}

function GearDecoration({
  gearSpeed, color, colorRgb,
}: {
  gearSpeed: number
  color: string
  colorRgb: string
}) {
  const rotationRef = useRef(0)
  const rafRef = useRef<number>(0)
  const gear1Ref = useRef<SVGSVGElement>(null)
  const gear2Ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    function animate() {
      rotationRef.current += gearSpeed * 2
      if (gear1Ref.current) {
        gear1Ref.current.style.transform = `rotate(${rotationRef.current}deg)`
      }
      if (gear2Ref.current) {
        gear2Ref.current.style.transform = `rotate(${-rotationRef.current}deg)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [gearSpeed])

  return (
    <div 
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: '-10px', right: '-10px',
        opacity: 0.12 + gearSpeed * 0.15,
        transition: 'opacity 300ms',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg
        ref={gear1Ref}
        width="80" height="80"
        viewBox="0 0 80 80"
        style={{
          position: 'absolute',
          bottom: 0, right: 0,
          transformOrigin: '40px 40px',
        }}
      >
        <text x="40" y="40" fontSize="60" textAnchor="middle" dominantBaseline="central" fill={color}>⚙</text>
      </svg>
      <svg
        ref={gear2Ref}
        width="40" height="40"
        viewBox="0 0 40 40"
        style={{
          position: 'absolute',
          bottom: '48px', right: '48px',
          transformOrigin: '20px 20px',
        }}
      >
        <text x="20" y="20" fontSize="30" textAnchor="middle" dominantBaseline="central" fill={`rgba(${colorRgb}, 0.7)`}>⚙</text>
      </svg>
    </div>
  )
}

function BentoFlipCard({
  workflow, gridStyle, isInView, delay, onFirstFlip,
}: {
  workflow: BentoWorkflow
  gridStyle: React.CSSProperties
  isInView: boolean
  delay: number
  onFirstFlip: (id: number) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [hasTriggeredFlip, setHasTriggeredFlip] = useState(false)
  const [everFlipped, setEverFlipped] = useState(false)
  const [gearSpeed, setGearSpeed] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  // Estados para el contador de pérdida (id:0)
  const [loss, setLoss] = useState(0)
  const [counting, setCounting] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (flipped && !hasTriggeredFlip) {
      setHasTriggeredFlip(true)
      onFirstFlip(workflow.id)
    }
  }, [flipped, hasTriggeredFlip, onFirstFlip, workflow.id])

  useEffect(() => {
    if (flipped && !shouldReduceMotion) {
      setGearSpeed(1)
      setEverFlipped(true)
    } else {
      const interval = setInterval(() => {
        setGearSpeed(prev => {
          if (prev <= 0) {
            clearInterval(interval)
            return 0
          }
          return prev - 0.05
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [flipped, shouldReduceMotion])

  // Lógica del contador de pérdida para la card 0
  useEffect(() => {
    if (workflow.id !== 0) return

    if (!counting || flipped) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setLoss(prev => prev + 80)
    }, 80)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [counting, flipped, workflow.id])

  const handleMouseEnter = () => {
    if (!shouldReduceMotion) {
      setFlipped(true)
    }
    setCounting(true)
  }

  const handleMouseLeave = () => {
    if (!shouldReduceMotion) {
      setFlipped(false)
    }
    setCounting(false)
    setLoss(0)
  }

  // Si Reduced Motion está activo, mostramos directamente la cara DESPUES
  const isActuallyFlipped = shouldReduceMotion ? true : flipped

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, y: 24, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        ...gridStyle,
        perspective: '1200px',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{ rotateY: isActuallyFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: workflow.size === 'large' ? '260px' : workflow.size === 'small' ? '100%' : '220px',
          transformStyle: 'preserve-3d',
          cursor: shouldReduceMotion ? 'default' : 'pointer',
        }}
      >
        {/* CARA FRENTE — ANTES (No visible si Reduced Motion está activo) */}
        {!shouldReduceMotion && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '20px',
            overflow: 'hidden',
            padding: 'clamp(18px, 2.5vw, 28px)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 8px 32px rgba(0, 0, 0, 0.4)',
          }}>
            {/* Dekor Line */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.6) 40%, rgba(239, 68, 68, 0.6) 60%, transparent)',
            }}/>

            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-bold tracking-[0.2em] text-red-500/70 font-mono">{workflow.category}</span>
              <span className="text-[9px] font-bold bg-red-500/10 border border-red-500/20 text-red-500/80 px-2 py-0.5 rounded-full tracking-wider">HOY</span>
            </div>

            <h3 className="text-lg md:text-xl font-black text-white mb-2 leading-tight">{workflow.antes.title}</h3>
            <p className="text-xs text-white/40 mb-5 leading-relaxed">{workflow.antes.description}</p>

            <div className="flex items-center gap-1.5 flex-wrap mb-5">
              {workflow.antes.steps.map((step, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm">{step.icon}</div>
                    <span className="text-[8px] text-white/30 text-center leading-none max-w-[40px]">{step.label}</span>
                  </div>
                  {step.arrow && <span className="text-red-500/30 text-xs mb-4">→</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Contador de Pérdida Dramático (Card 0) */}
            {workflow.id === 0 && counting && !flipped && (
              <div style={{
                marginBottom: '10px',
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
              }}>
                <p style={{
                  fontSize: '9px',
                  color: 'rgba(239, 68, 68, 0.6)',
                  margin: '0 0 2px',
                  letterSpacing: '0.1em',
                  fontFamily: 'monospace',
                }}>
                  COSTO DEL CAOS — HOY
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#ef4444',
                  margin: 0,
                  fontFamily: 'monospace',
                }}>
                  ${loss.toLocaleString('es-AR')}
                </p>
              </div>
            )}

            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5">
              <span className="text-xs">⚠</span>
              <span className="text-[11px] font-bold text-red-500/90">{workflow.antes.pain}</span>
            </div>

            {!everFlipped && <div className="absolute bottom-3 right-4 text-[10px] text-white/10 font-mono">hover →</div>}
          </div>
        )}

        {/* CARA REVERSO — DESPUES */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: shouldReduceMotion ? 'none' : 'rotateY(180deg)',
          borderRadius: '20px',
          overflow: 'hidden',
          padding: 'clamp(18px, 2.5vw, 28px)',
          background: `linear-gradient(135deg, rgba(${workflow.colorRgb}, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)`,
          border: `1px solid rgba(${workflow.colorRgb}, 0.25)`,
          boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 40px rgba(${workflow.colorRgb}, 0.08), 0 8px 32px rgba(0, 0, 0, 0.5)`,
        }}>
          {/* Dekor Line */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, rgba(${workflow.colorRgb}, 0.8) 40%, rgba(${workflow.colorRgb}, 0.8) 60%, transparent)`,
          }}/>

          {!shouldReduceMotion && <GearDecoration gearSpeed={gearSpeed} color={workflow.color} colorRgb={workflow.colorRgb} />}

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-bold tracking-[0.2em] text-amber-500/70 font-mono" style={{ color: `rgba(${workflow.colorRgb}, 0.7)` }}>{workflow.category}</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider" style={{ background: `rgba(${workflow.colorRgb}, 0.1)`, border: `1px solid rgba(${workflow.colorRgb}, 0.3)`, color: workflow.color }}>CON DEVELOP</span>
            </div>

            <h3 className="text-lg md:text-xl font-black text-white mb-2 leading-tight">{workflow.despues.title}</h3>
            <p className="text-xs text-white/50 mb-5 leading-relaxed">{workflow.despues.description}</p>

            <div className="flex items-center gap-1.5 flex-wrap mb-5">
              {workflow.despues.steps.map((step, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `rgba(${workflow.colorRgb}, 0.12)`, border: `1px solid rgba(${workflow.colorRgb}, 0.25)`, boxShadow: `0 0 8px rgba(${workflow.colorRgb}, 0.2)` }}>{step.icon}</div>
                    <span className="text-[8px] text-white/40 text-center leading-none max-w-[40px]">{step.label}</span>
                  </div>
                  {step.arrow && <span className="text-xs mb-4" style={{ color: `rgba(${workflow.colorRgb}, 0.6)` }}>→</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: `rgba(${workflow.colorRgb}, 0.1)`, border: `1px solid rgba(${workflow.colorRgb}, 0.3)` }}>
              <span className="text-emerald-400 text-xs">✓</span>
              <span className="text-[11px] font-bold" style={{ color: workflow.color }}>{workflow.despues.gain}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  return (
    <div className="text-center mb-12 md:mb-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="inline-flex items-center gap-2 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6 bg-amber-500/5"
      >
        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-amber-500 font-bold">
          [ EL FIN DEL TRABAJO ROBÓTICO ]
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
      >
        Tus procesos, en piloto automático.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-white/40 text-sm md:text-base max-w-xl mx-auto"
      >
        Pasá el mouse sobre cada caso para ver cómo transformamos el caos manual en eficiencia pura.
      </motion.p>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function BentoAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const shouldReduceMotion = useReducedMotion()

  const [flippedIds, setFlippedIds] = useState<Set<number>>(new Set())

  const onFirstFlip = useCallback((id: number) => {
    setFlippedIds(prev => new Set(prev).add(id))
  }, [])

  const flipCount = flippedIds.size

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 md:py-32 lg:py-40 px-6 sm:px-12 bg-[#080810] overflow-hidden z-[1]"
    >
      <AtmosphereBento />

      <div className="relative max-w-6xl mx-auto z-10">
        <Header isInView={isInView} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {/* Fila 1 */}
          <BentoFlipCard
            workflow={workflows[0]}
            gridStyle={{ gridColumn: 'md:span 2' }}
            isInView={isInView} delay={0.25}
            onFirstFlip={onFirstFlip}
          />
          <BentoFlipCard
            workflow={workflows[3]}
            gridStyle={{ gridRow: 'md:span 2' }}
            isInView={isInView} delay={0.30}
            onFirstFlip={onFirstFlip}
          />

          {/* Fila 2 */}
          <BentoFlipCard
            workflow={workflows[1]}
            gridStyle={{ gridColumn: 'md:span 1' }}
            isInView={isInView} delay={0.35}
            onFirstFlip={onFirstFlip}
          />
          <BentoFlipCard
            workflow={workflows[2]}
            gridStyle={{ gridColumn: 'md:span 1' }}
            isInView={isInView} delay={0.40}
            onFirstFlip={onFirstFlip}
          />

          {/* Fila 3 */}
          <BentoFlipCard
            workflow={workflows[4]}
            gridStyle={{ gridColumn: 'md:span 3' }}
            isInView={isInView} delay={0.45}
            onFirstFlip={onFirstFlip}
          />
        </div>

        {/* Badge Conversion Tracker */}
        {flipCount >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl max-w-2xl mx-auto"
          >
            <p className="text-white/60 text-sm md:text-base mb-2">
              ¿Reconocés tu operación en estos casos?
            </p>
            <a 
              href="#calculadora" 
              className="text-amber-500 font-bold hover:underline transition-all"
            >
              Mirá cómo lo automatizamos →
            </a>
          </motion.div>
        )}

        {/* Separador Final */}
        <motion.div
          initial={shouldReduceMotion ? { scaleX:1 } : { scaleX:0 }}
          animate={isInView ? { scaleX:1 } : {}}
          transition={{ duration:1.2, delay:0.8 }}
          style={{
            height:'1px',
            background:'linear-gradient(90deg, rgba(239,68,68,0.2), transparent 25%, rgba(245,158,11,0.4) 50%, transparent 75%, rgba(249,115,22,0.2))',
            transformOrigin:'left center',
            marginTop:'clamp(40px,6vh,64px)',
          }}
        />
      </div>
    </section>
  )
}
