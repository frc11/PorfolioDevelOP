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
      title: 'El lead se enfría en WhatsApp',
      description: 'Un cliente escribe interesado. Pasan 2 horas hasta que alguien lo ve. Para ese entonces, ya le compró a tu competencia.',
      steps: [
        { icon: '📣', label: 'Lead llega' },
        { icon: '⌛', label: 'Espera horas', arrow: true },
        { icon: '✍️', label: 'Carga manual', arrow: true },
        { icon: '❌', label: 'Venta perdida', arrow: true },
      ],
      pain: '3 de cada 10 leads se pierden por demora',
    },
    despues: {
      title: 'Respuesta en segundos, 24/7',
      description: 'El sistema detecta el interés, lo registra y le responde al cliente al instante. El vendedor solo entra a cerrar.',
      steps: [
        { icon: '📣', label: 'Lead entra' },
        { icon: '💬', label: 'Respuesta auto', arrow: true },
        { icon: '📊', label: 'CRM al día', arrow: true },
        { icon: '💰', label: 'Cierre rápido', arrow: true },
      ],
      gain: 'Ventas que antes se perdían por demora',
    },
    color: '#f59e0b', colorRgb: '245,158,11',
  },
  {
    id: 1, size: 'medium',
    category: 'FACTURACIÓN',
    antes: {
      title: 'Cargar facturas a mano en AFIP',
      description: 'Recibís un pago y alguien tiene que entrar a la web de AFIP, cargar los datos uno a uno y después mandar el PDF.',
      steps: [
        { icon: '💳', label: 'Pago recibido' },
        { icon: '🖥️', label: 'Web AFIP', arrow: true },
        { icon: '⌨️', label: 'Carga manual', arrow: true },
        { icon: '📧', label: 'Mandar mail', arrow: true },
      ],
      pain: 'Errores de carga y clientes esperando',
    },
    despues: {
      title: 'Cobro recibido, factura enviada',
      description: 'MercadoPago confirma el cobro. El sistema genera la factura oficial de AFIP y le manda el PDF al cliente solo.',
      steps: [
        { icon: '💳', label: 'Pago confirmado' },
        { icon: '🧾', label: 'AFIP auto', arrow: true },
        { icon: '📧', label: 'PDF enviado', arrow: true },
      ],
      gain: '0 errores de carga y PDF al instante',
    },
    color: '#f97316', colorRgb: '249,115,22',
  },
  {
    id: 2, size: 'medium',
    category: 'STOCK',
    antes: {
      title: 'Prometer stock que no tenés',
      description: 'Vendes por WhatsApp pero no descontás de la planilla. Descubrís que no hay stock cuando ya lo cobraste.',
      steps: [
        { icon: '📦', label: 'Stock irreal' },
        { icon: '😤', label: 'Error humano', arrow: true },
        { icon: '❌', label: 'Falta entrega', arrow: true },
      ],
      pain: 'Promesas rotas y clientes enojados',
    },
    despues: {
      title: 'Sincronización total e inteligente',
      description: 'Cada venta en cualquier canal descuenta el stock real. Si baja del mínimo, el sistema te avisa por Slack.',
      steps: [
        { icon: '📉', label: 'Stock crítico' },
        { icon: '🔔', label: 'Aviso Slack', arrow: true },
        { icon: '📋', label: 'Orden compra', arrow: true },
      ],
      gain: 'Nunca más vendés lo que no hay',
    },
    color: '#f59e0b', colorRgb: '245,158,11',
  },
  {
    id: 3, size: 'small',
    category: 'REPORTES',
    antes: {
      title: 'Perder el domingo armando Excels',
      description: 'Para saber cuánto vendiste tenés que juntar datos de 3 sistemas distintos y cruzarlos a mano un domingo.',
      steps: [
        { icon: '📊', label: 'Juntar datos' },
        { icon: '✍️', label: 'Cruzar manual', arrow: true },
        { icon: '📧', label: 'Reporte tarde', arrow: true },
      ],
      pain: 'Vivir en el caos sin números claros',
    },
    despues: {
      title: 'Tu negocio, en un solo vistazo',
      description: 'Todos los lunes a las 8 AM recibís un mensaje con lo facturado, lo vendido y el rendimiento de tu equipo.',
      steps: [
        { icon: '🤖', label: 'Cruce auto' },
        { icon: '📈', label: 'Gráficos solos', arrow: true },
        { icon: '📧', label: 'Reporte listo', arrow: true },
      ],
      gain: 'Reportes consolidados cada mañana',
    },
    color: '#f97316', colorRgb: '249,115,22',
  },
  {
    id: 4, size: 'medium',
    category: 'ATENCIÓN',
    antes: {
      title: 'Tu equipo atrapado en dudas básicas',
      description: 'Precios, horarios, dónde están. Tus empleados pierden el 80% del tiempo respondiendo lo mismo por milésima vez.',
      steps: [
        { icon: '💬', label: 'Pregunta básica' },
        { icon: '⏰', label: 'Tu gente ocupa', arrow: true },
        { icon: '✍️', label: 'Resp. repetida', arrow: true },
      ],
      pain: 'Empleados robots haciendo tareas simples',
    },
    despues: {
      title: 'Tu gente, solo donde genera valor',
      description: 'El sistema resuelve lo básico automáticamente. Tu equipo solo interviene en problemas reales o grandes ventas.',
      steps: [
        { icon: '💬', label: 'Pregunta entra' },
        { icon: '🤖', label: 'Resp. instantánea', arrow: true },
        { icon: '✅', label: 'Tu equipo libre', arrow: true },
      ],
      gain: '90% de consultas resueltas por el sistema',
    },
    color: '#f59e0b', colorRgb: '245,158,11',
  },
  {
    id: 5, size: 'medium',
    category: 'COBRANZAS',
    antes: {
      title: 'Cobros vencidos sin seguimiento',
      description: 'Las facturas se vencen y nadie hace seguimiento constante. Terminás cobrando tarde y con flujo de caja desordenado.',
      steps: [
        { icon: '📄', label: 'Factura emitida' },
        { icon: '⏳', label: 'Vence sin aviso', arrow: true },
        { icon: '📞', label: 'Seguimiento manual', arrow: true },
      ],
      pain: 'Caja inestable por cobranzas tardías',
    },
    despues: {
      title: 'Recordatorios automáticos y cobro ágil',
      description: 'El sistema detecta vencimientos, envía recordatorios por WhatsApp y email, y notifica al equipo solo si requiere intervención.',
      steps: [
        { icon: '📄', label: 'Factura emitida' },
        { icon: '🤖', label: 'Recordatorio auto', arrow: true },
        { icon: '✅', label: 'Cobro confirmado', arrow: true },
      ],
      gain: 'Menos mora y caja más predecible',
    },
    color: '#f97316', colorRgb: '249,115,22',
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
        <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="40" cy="40" r="27" fill="none" stroke={color} strokeWidth="1"/>
        <circle cx="40" cy="40" r="18" fill="none" stroke={color} strokeWidth="1"/>
        <circle cx="40" cy="40" r="7" fill={color} opacity="0.35"/>
        {[0,45,90,135,180,225,270,315].map((a) => {
          const r = (a * Math.PI) / 180
          return <line key={a} x1={40+31*Math.cos(r)} y1={40+31*Math.sin(r)} x2={40+36*Math.cos(r)} y2={40+36*Math.sin(r)} stroke={color} strokeWidth="2"/>
        })}
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
        <circle cx="20" cy="20" r="17" fill="none" stroke={`rgba(${colorRgb},0.7)`} strokeWidth="1.5"/>
        <circle cx="20" cy="20" r="11" fill="none" stroke={`rgba(${colorRgb},0.5)`} strokeWidth="1"/>
        <circle cx="20" cy="20" r="5" fill={`rgba(${colorRgb},0.4)`}/>
        {[0,60,120,180,240,300].map((a) => {
          const r = (a * Math.PI) / 180
          return <line key={a} x1={20+14*Math.cos(r)} y1={20+14*Math.sin(r)} x2={20+17*Math.cos(r)} y2={20+17*Math.sin(r)} stroke={`rgba(${colorRgb},0.7)`} strokeWidth="1.5"/>
        })}
      </svg>
    </div>
  )
}

function BentoFlipCard({
  workflow, gridStyle, cardClass, isInView, delay, onFirstFlip,
}: {
  workflow: BentoWorkflow
  gridStyle: React.CSSProperties
  cardClass?: string
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
      className={cardClass}
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
          minHeight: workflow.size === 'large' ? '300px' : workflow.size === 'small' ? '260px' : '260px',
          transformStyle: 'preserve-3d',
          cursor: 'none',
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
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(239,68,68,0.06), 0 0 0 1px rgba(239,68,68,0.05), 0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',
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
                    <span className="text-[8px] text-white/30 text-center leading-none max-w-[56px]">{step.label}</span>
                  </div>
                  {step.arrow && <span className="text-red-500/30 text-xs mb-4">→</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Contador de Pérdida Dramático (Card 0) */}
            {workflow.id === 0 && counting && !flipped && (
              <div style={{
                marginBottom: '10px',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.07)',
                border: '1px solid rgba(239, 68, 68, 0.22)',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5) 50%, transparent)' }} />
                <p style={{
                  fontSize: '8px',
                  color: 'rgba(239, 68, 68, 0.55)',
                  margin: '0 0 4px',
                  letterSpacing: '0.18em',
                  fontFamily: 'ui-monospace, monospace',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}>
                  COSTO DEL CAOS — EN VIVO
                </p>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#ef4444',
                  margin: 0,
                  fontFamily: 'ui-monospace, monospace',
                  letterSpacing: '-0.04em',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                  textShadow: '0 0 20px rgba(239,68,68,0.4)',
                }}>
                  ${loss.toLocaleString('es-AR')}
                </p>
              </div>
            )}

            <div className="inline-flex max-w-full items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] font-bold text-red-500/90">{workflow.antes.pain}</span>
            </div>

            {!everFlipped && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                <div className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500/50 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500/40" />
                </div>
                <span className="text-[8px] font-mono text-white/20 tracking-[0.1em]">HOVER</span>
              </div>
            )}
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
          padding: 'clamp(20px, 2.5vw, 30px)',
          background: `linear-gradient(145deg, rgba(${workflow.colorRgb}, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)`,
          border: `1px solid rgba(${workflow.colorRgb}, 0.28)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(${workflow.colorRgb},0.08), 0 0 0 1px rgba(${workflow.colorRgb},0.08), 0 0 60px rgba(${workflow.colorRgb},0.14), 0 4px 16px rgba(${workflow.colorRgb},0.1), 0 12px 40px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.4)`,
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
                    <span className="text-[8px] text-white/40 text-center leading-none max-w-[56px]">{step.label}</span>
                  </div>
                  {step.arrow && <span className="text-xs mb-4" style={{ color: `rgba(${workflow.colorRgb}, 0.6)` }}>→</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="inline-flex max-w-full items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: `rgba(${workflow.colorRgb}, 0.1)`, border: `1px solid rgba(${workflow.colorRgb}, 0.3)` }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ flexShrink: 0 }}>
                <path d="M1 4L3.8 7 9 1" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-4"
        style={{ letterSpacing: '-0.03em' }}
      >
        Tus procesos, en piloto automático.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-white/40 text-sm md:text-base max-w-xl mx-auto"
      >
        Elegí el proceso que hoy te quita el sueño y mirá cómo lo resolvemos para siempre.
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
      data-cursor="off"
      className="relative w-full py-20 md:py-32 lg:py-40 px-6 sm:px-12 bg-[#080810] overflow-hidden z-[1]"
    >
      <AtmosphereBento />

      <div className="relative max-w-6xl mx-auto z-10">
        <Header isInView={isInView} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {/* Fila 1 */}
          <BentoFlipCard
            workflow={workflows[0]}
            gridStyle={{}}
            cardClass="md:col-span-2"
            isInView={isInView} delay={0.25}
            onFirstFlip={onFirstFlip}
          />
          <BentoFlipCard
            workflow={workflows[3]}
            gridStyle={{}}
            cardClass="md:col-span-1"
            isInView={isInView} delay={0.30}
            onFirstFlip={onFirstFlip}
          />

          {/* Fila 2 */}
          <BentoFlipCard
            workflow={workflows[1]}
            gridStyle={{}}
            cardClass="md:col-span-1"
            isInView={isInView} delay={0.35}
            onFirstFlip={onFirstFlip}
          />
          <BentoFlipCard
            workflow={workflows[2]}
            gridStyle={{}}
            cardClass="md:col-span-1"
            isInView={isInView} delay={0.40}
            onFirstFlip={onFirstFlip}
          />
          <BentoFlipCard
            workflow={workflows[4]}
            gridStyle={{}}
            cardClass="md:col-span-1"
            isInView={isInView} delay={0.45}
            onFirstFlip={onFirstFlip}
          />

          {/* Fila 3 */}
          <BentoFlipCard
            workflow={workflows[5]}
            gridStyle={{}}
            cardClass="md:col-span-3"
            isInView={isInView} delay={0.5}
            onFirstFlip={onFirstFlip}
          />
        </div>

        {/* Badge Conversion Tracker */}
        {flipCount >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden mt-12 text-center p-7 bg-amber-500/[0.05] border border-amber-500/20 rounded-2xl max-w-2xl mx-auto"
            style={{ boxShadow: '0 0 40px rgba(245,158,11,0.06), 0 8px 24px rgba(0,0,0,0.3)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <p className="text-white/60 text-sm md:text-base mb-3 leading-relaxed">
              ¿Reconocés tu operación en estos casos?
            </p>
            <a
              href="#calculadora"
              className="inline-flex items-center gap-2 text-amber-500 font-bold text-sm tracking-wide hover:text-amber-400 transition-colors"
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
