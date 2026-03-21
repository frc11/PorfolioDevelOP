'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence, useReducedMotion } from 'motion/react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface PipeNode {
  id: string
  x: number
  y: number
  label: string
  sublabel: string
  icon: string
  type: 'start' | 'process' | 'end'
  color: string
  colorRgb: string
}

interface PipeEdge {
  id: string
  from: string
  to: string
}

interface FlowParticle {
  id: number
  edgeId: string
  progress: number
  speed: number
  colorRgb: string
  isError: boolean
}

interface FlowEvent {
  id: number
  message: string
  type: 'normal' | 'error' | 'recovery'
  timestamp: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const pipeNodes: PipeNode[] = [
  {
    id: 'venta',
    x: 80, y: 130,
    label: 'Venta',
    sublabel: 'Pedido ingresado',
    icon: '🛒',
    type: 'start',
    color: '#6366f1',
    colorRgb: '99,102,241',
  },
  {
    id: 'stock',
    x: 260, y: 130,
    label: 'Stock',
    sublabel: 'Reserva automática',
    icon: '📦',
    type: 'process',
    color: '#7b2fff',
    colorRgb: '123,47,255',
  },
  {
    id: 'produccion',
    x: 440, y: 130,
    label: 'Producción',
    sublabel: 'Orden de preparado',
    icon: '⚙️',
    type: 'process',
    color: '#6366f1',
    colorRgb: '99,102,241',
  },
  {
    id: 'logistica',
    x: 620, y: 130,
    label: 'Logística',
    sublabel: 'Asignación de envío',
    icon: '🚚',
    type: 'process',
    color: '#7b2fff',
    colorRgb: '123,47,255',
  },
  {
    id: 'facturacion',
    x: 800, y: 130,
    label: 'Facturación',
    sublabel: 'AFIP automático',
    icon: '🧾',
    type: 'process',
    color: '#6366f1',
    colorRgb: '99,102,241',
  },
  {
    id: 'cliente',
    x: 940, y: 130,
    label: 'Cliente',
    sublabel: 'Notificación enviada',
    icon: '✅',
    type: 'end',
    color: '#7b2fff',
    colorRgb: '123,47,255',
  },
]

const pipeEdges: PipeEdge[] = [
  { id: 'v-s', from: 'venta', to: 'stock' },
  { id: 's-p', from: 'stock', to: 'produccion' },
  { id: 'p-l', from: 'produccion', to: 'logistica' },
  { id: 'l-f', from: 'logistica', to: 'facturacion' },
  { id: 'f-c', from: 'facturacion', to: 'cliente' },
]

// Mensajes del log de eventos:
const normalMessages = [
  'Pedido #4821 ingresado',
  'Stock reservado: 3 unidades',
  'Orden de preparado enviada',
  'Transporte asignado: Andreani',
  'Factura AFIP generada: FC-A 0001-00234',
  'Cliente notificado por WhatsApp ✓',
]

const errorMessages = [
  '⚠ Stock insuficiente detectado',
  '🔄 Buscando stock alternativo...',
  '✓ Stock alternativo encontrado',
  '✓ Flujo reanudado automáticamente',
]

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Header({ isInView }: { isInView: boolean }) {
  return (
    <div style={{ marginBottom: 'clamp(32px, 5vh, 52px)' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: '100px',
          padding: '4px 14px',
          marginBottom: '20px',
          background: 'rgba(99,102,241,0.05)',
        }}
      >
        <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#6366f1', fontWeight: 700 }}>
          [ EL PULSO DE LA EMPRESA ]
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25 }}
        style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 16px' }}
      >
        Un pedido. Cero intervención.<br />
        <span style={{ color: '#6366f1' }}>Tu empresa en piloto automático.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.38 }}
        style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', margin: 0, maxWidth: '600px' }}
      >
        Cada venta se procesa sola. Sin que nadie tenga que escribir en el Excel, llamar al depósito ni acordarse de facturar.
      </motion.p>
    </div>
  )
}

function AtmospherePipe() {
  return (
    <>
      {/* Glow del pipeline — horizontal */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '30%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '900px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 60%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Glow izquierda — inicio */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '20%', left: '-5%',
        width: '350px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 65%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Glow derecha — fin */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '20%', right: '-5%',
        width: '350px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(123,47,255,0.06) 0%, transparent 65%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
    </>
  )
}

function SVGPipeline({
  isRunning,
  hasError,
  isRecovering,
  activeNodes,
  particles,
  shouldReduceMotion,
}: {
  isRunning: boolean
  hasError: boolean
  isRecovering: boolean
  activeNodes: Set<string>
  particles: FlowParticle[]
  shouldReduceMotion?: boolean
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px',
      padding: 'clamp(16px, 2vw, 28px)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Scanline cuando hay error */}
      {hasError && !isRecovering && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(239,68,68,0.03)',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: '20px',
          pointerEvents: 'none',
          zIndex: 2,
          animation: 'errorPulse 1s ease-in-out infinite',
        }} />
      )}

      <svg
        viewBox="0 0 1000 260"
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <filter id="pipeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges — líneas base */}
        {pipeEdges.map(edge => {
          const from = pipeNodes.find(n => n.id === edge.from)!
          const to = pipeNodes.find(n => n.id === edge.to)!
          const isActive = activeNodes.has(edge.from) && activeNodes.has(edge.to)

          return (
            <line
              key={edge.id}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={isActive
                ? (hasError && !isRecovering ? 'rgba(239,68,68,0.4)' : `rgba(${from.colorRgb}, 0.5)`)
                : 'rgba(255,255,255,0.07)'}
              strokeWidth={isActive ? 2 : 1.5}
              strokeDasharray={isActive ? "none" : "6 6"}
              style={{ transition: shouldReduceMotion ? 'none' : 'stroke 400ms, stroke-width 300ms' }}
            />
          )
        })}

        {/* Partículas */}
        {particles.map(p => {
          const edge = pipeEdges.find(e => e.id === p.edgeId)!
          const from = pipeNodes.find(n => n.id === edge.from)!
          const to = pipeNodes.find(n => n.id === edge.to)!

          const x = from.x + (to.x - from.x) * p.progress
          const y = from.y + (to.y - from.y) * p.progress
          const tx = from.x + (to.x - from.x) * Math.max(0, p.progress - 0.1)
          const ty = from.y + (to.y - from.y) * Math.max(0, p.progress - 0.1)

          const col = p.isError ? '239, 68, 68' : p.colorRgb

          return (
            <g key={p.id}>
              <line
                x1={tx} y1={ty}
                x2={x} y2={y}
                stroke={`rgba(${col}, 0.5)`}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx={x} cy={y} r="5"
                fill={`rgba(${col}, 1)`}
                filter="url(#pipeGlow)"
              />
            </g>
          )
        })}

        {/* Nodos */}
        {pipeNodes.map(node => {
          const isActive = activeNodes.has(node.id)
          const isError = hasError && !isRecovering && isActive
          const R = node.type === 'start' || node.type === 'end' ? 32 : 28

          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              {/* Glow */}
              <circle
                r={R + 18}
                fill={isError ? 'rgba(239,68,68,0.12)' : `rgba(${node.colorRgb}, ${isActive ? 0.12 : 0.03})`}
                style={{ transition: 'fill 400ms' }}
              />

              {/* Anillo activo */}
              {isActive && (
                <circle
                  r={R + 8}
                  fill="none"
                  stroke={isError ? 'rgba(239,68,68,0.4)' : `rgba(${node.colorRgb}, 0.35)`}
                  strokeWidth="1.5"
                  style={{ animation: shouldReduceMotion ? 'none' : 'ringPulse 2s ease-in-out infinite' }}
                />
              )}

              {/* Círculo */}
              <circle
                r={R}
                fill={isError ? 'rgba(239,68,68,0.15)' : `rgba(${node.colorRgb}, ${isActive ? 0.18 : 0.06})`}
                stroke={isError ? 'rgba(239,68,68,0.7)' : `rgba(${node.colorRgb}, ${isActive ? 0.7 : 0.2})`}
                strokeWidth={isActive ? 2 : 1}
                style={{ transition: shouldReduceMotion ? 'none' : 'all 400ms' }}
              />

              {/* Ícono */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isActive ? "18" : "15"}
                style={{ userSelect: 'none' }}
              >
                {isError ? '⚠' : node.icon}
              </text>

              {/* Label */}
              <text
                y={R + 16}
                textAnchor="middle"
                fill={isActive ? (isError ? '#ef4444' : node.color) : 'rgba(255,255,255,0.35)'}
                fontSize="11"
                fontWeight={isActive ? "700" : "400"}
                style={{ transition: shouldReduceMotion ? 'none' : 'fill 300ms' }}
              >
                {node.label}
              </text>

              {/* Sublabel */}
              <text
                y={R + 30}
                textAnchor="middle"
                fill="rgba(255,255,255,0.2)"
                fontSize="9"
              >
                {node.sublabel}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function Controls({
  isRunning,
  hasError,
  isRecovering,
  onStart,
  onInjectError,
  onReset,
}: {
  isRunning: boolean
  hasError: boolean
  isRecovering: boolean
  onStart: () => void
  onInjectError: () => void
  onReset: () => void
}) {
  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
      {!isRunning ? (
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', border: 'none', borderRadius: '100px',
            padding: '13px 28px', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 0 28px rgba(99,102,241,0.35)',
          }}
        >
          ▶ Activar flujo
        </motion.button>
      ) : (
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px',
            padding: '13px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          ↺ Resetear
        </motion.button>
      )}

      {isRunning && !hasError && (
        <motion.button
          onClick={onInjectError}
          whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.8)',
            border: '1px solid rgba(239,68,68,0.25)', borderRadius: '100px',
            padding: '13px 24px', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 200ms',
          }}
        >
          ⚠ Inyectar error
        </motion.button>
      )}

      {isRecovering && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '100px', padding: '13px 24px', fontSize: '14px', color: 'rgba(245,158,11,0.8)',
        }}>
          <div style={{
            width: '12px', height: '12px', borderRadius: '50%',
            border: '2px solid rgba(245,158,11,0.3)', borderTop: '2px solid #f59e0b',
            animation: 'spin 0.8s linear infinite',
          }} />
          Recuperando sistema...
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function PipelineSoftware() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })

  const [isRunning, setIsRunning] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set())
  const [particles, setParticles] = useState<FlowParticle[]>([])
  const [eventLog, setEventLog] = useState<FlowEvent[]>([])

  const particlesRef = useRef<FlowParticle[]>([])
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  /* eslint-disable react-hooks/exhaustive-deps */
  const shouldReduceMotion = useReducedMotion()

  const addEvent = (message: string, type: FlowEvent['type']) => {
    const event: FlowEvent = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }
    setEventLog(prev => [event, ...prev].slice(0, 8))
  }

  const startRAF = () => {
    if (shouldReduceMotion) return

    const tick = () => {
      frameRef.current++
      const f = frameRef.current

      // Spawn partícula cada 25 frames
      if (f % 25 === 0 && particlesRef.current.length < 10) {
        const edgeIdx = Math.floor(Math.random() * pipeEdges.length)
        const edge = pipeEdges[edgeIdx]
        const fromNode = pipeNodes.find(n => n.id === edge.from)!

        particlesRef.current = [
          ...particlesRef.current,
          {
            id: Date.now() + Math.random(),
            edgeId: edge.id,
            progress: 0,
            speed: 0.01 + Math.random() * 0.008,
            colorRgb: fromNode.colorRgb,
            isError: false,
          },
        ]
      }

      // Mover partículas
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          progress: p.progress + p.speed,
        }))
        .filter(p => p.progress < 1)

      setParticles([...particlesRef.current])
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
  }

  function handleStart() {
    setIsRunning(true)
    setHasError(false)
    setIsRecovering(false)
    setParticles([])
    setActiveNodes(new Set())
    setEventLog([])
    particlesRef.current = []
    frameRef.current = 0

    // Activar nodos progresivamente
    pipeNodes.forEach((node, i) => {
      const t = setTimeout(() => {
        setActiveNodes(prev => {
          const next = new Set(prev)
          next.add(node.id)
          return next
        })
        addEvent(normalMessages[i] ?? `${node.label} procesado`, 'normal')
      }, i * 600)
      timeoutsRef.current.push(t)
    })

    if (!shouldReduceMotion) {
      const tStart = setTimeout(startRAF, 400)
      timeoutsRef.current.push(tStart)
    }
  }

  function handleInjectError() {
    cancelAnimationFrame(animRef.current)
    setHasError(true)
    setIsRecovering(false)

    const errorParticles = particlesRef.current.map(p => ({
      ...p,
      isError: true,
      speed: p.speed * 0.3,
    }))
    particlesRef.current = errorParticles
    setParticles([...errorParticles])

    errorMessages.forEach((msg, i) => {
      const t = setTimeout(() => {
        addEvent(msg, i === 0 ? 'error' : i < errorMessages.length - 1 ? 'error' : 'recovery')
      }, i * 700)
      timeoutsRef.current.push(t)
    })

    const tRecover = setTimeout(() => {
      setIsRecovering(true)
      setHasError(false)

      const tNormal = setTimeout(() => {
        setIsRecovering(false)
        particlesRef.current = particlesRef.current.map(p => ({
          ...p,
          isError: false,
          speed: 0.012,
        }))
        setParticles([...particlesRef.current])
        startRAF()
      }, 1500)
      timeoutsRef.current.push(tNormal)
    }, errorMessages.length * 700)
    timeoutsRef.current.push(tRecover)
  }

  function handleReset() {
    cancelAnimationFrame(animRef.current)
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setIsRunning(false)
    setHasError(false)
    setIsRecovering(false)
    setParticles([])
    setActiveNodes(new Set())
    setEventLog([])
    particlesRef.current = []
    frameRef.current = 0
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  return (
    <section
      id="pipeline"
      ref={sectionRef}
      style={{ padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)', background: '#080810', position: 'relative', overflow: 'hidden' }}
    >
      <AtmospherePipe />
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Header isInView={isInView} />
        <SVGPipeline
          isRunning={isRunning}
          hasError={hasError}
          isRecovering={isRecovering}
          activeNodes={activeNodes}
          particles={particles}
          shouldReduceMotion={shouldReduceMotion ?? undefined}
        />
        <Controls
          isRunning={isRunning}
          hasError={hasError}
          isRecovering={isRecovering}
          onStart={handleStart}
          onInjectError={handleInjectError}
          onReset={handleReset}
        />

        {/* Event Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            marginTop: '20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Header del log */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {isRunning && (
              <div style={{
                width: '8px', height: '8px',
                borderRadius: '50%',
                background: hasError ? '#ef4444' : isRecovering ? '#f59e0b' : '#6366f1',
                boxShadow: `0 0 8px ${hasError ? '#ef4444' : isRecovering ? '#f59e0b' : '#6366f1'}`,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            )}
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
              LOG DEL SISTEMA
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.18)' }}>
              {eventLog.length} eventos
            </span>
          </div>

          {/* Eventos */}
          <div style={{ padding: '8px', minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <AnimatePresence initial={false}>
              {eventLog.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -12, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'flex', gap: '10px', alignItems: 'center',
                    padding: '6px 10px', borderRadius: '8px',
                    background: event.type === 'error' ? 'rgba(239,68,68,0.06)' : event.type === 'recovery' ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{
                    width: '3px', height: '100%', minHeight: '20px', borderRadius: '100px',
                    background: event.type === 'error' ? '#ef4444' : event.type === 'recovery' ? '#f59e0b' : '#6366f1',
                    flexShrink: 0,
                  }} />
                  <p style={{
                    fontSize: '12px',
                    color: event.type === 'error' ? 'rgba(239,68,68,0.9)' : event.type === 'recovery' ? 'rgba(245,158,11,0.9)' : 'rgba(255,255,255,0.65)',
                    margin: 0, flex: 1,
                  }}>
                    {event.message}
                  </p>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace', flexShrink: 0 }}>
                    {event.timestamp}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {eventLog.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>
                Activá el flujo para ver el sistema en acción
              </div>
            )}
          </div>
        </motion.div>

        {/* Impact Metrics */}
        <div style={{
          display: 'flex', gap: '12px',
          flexWrap: 'wrap',
          marginTop: 'clamp(20px, 3vh, 32px)',
        }}>
          {[
            { value: '< 3s', label: 'De la venta a la factura', icon: '⚡', colorRgb: '99,102,241' },
            { value: '0', label: 'Intervenciones humanas requeridas', icon: '🤖', colorRgb: '123,47,255' },
            { value: '0', label: 'Errores de carga manual', icon: '🔍', colorRgb: '99,102,241' },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                flex: 1,
                minWidth: '240px',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid rgba(${m.colorRgb}, 0.12)`,
                borderRadius: '14px',
                padding: 'clamp(16px, 2vw, 24px)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{m.icon}</span>
              <p style={{
                fontSize: 'clamp(22px, 3vw, 32px)',
                fontWeight: 900,
                color: `rgb(${m.colorRgb})`,
                margin: '0 0 4px',
                fontFamily: 'monospace',
              }}>
                {m.value}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.4 }}>
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Final Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.8 }}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.35) 30%, rgba(123,47,255,0.4) 50%, rgba(99,102,241,0.35) 70%, transparent)',
            transformOrigin: 'left center',
            marginTop: 'clamp(48px, 7vh, 80px)',
          }}
        />
      </div>

    </section>
  )
}
