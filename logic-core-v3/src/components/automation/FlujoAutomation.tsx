'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

/**
 * FLUJO AUTOMATION: "La Anatomía de un Workflow."
 * Demostración visual de un proceso de venta automatizado usando SVG + RAF.
 */

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface FlowNode {
  id: string
  x: number
  y: number
  label: string
  sublabel: string
  icon: string
  type: 'trigger' | 'process' | 'output'
  color: string
  colorRgb: string
}

interface FlowEdge {
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
  phase: number
}

interface LogEntry {
  id: number
  message: string
  timestamp: string
}

// ─── DATA ───────────────────────────────────────────────────────────────────

const flowNodes: FlowNode[] = [
  // TRIGGER
  { 
    id: 'lead', x: 80, y: 200,
    label: 'Pago Recibido',
    sublabel: 'MercadoPago',
    icon: '💳',
    type: 'trigger',
    color: '#f59e0b', colorRgb: '245,158,11' 
  },

  // PROCESOS
  { 
    id: 'calificar', x: 280, y: 140,
    label: 'Validar Pago',
    sublabel: 'Proceso Automático',
    icon: '⚙️',
    type: 'process',
    color: '#f97316', colorRgb: '249,115,22' 
  },
  { 
    id: 'registrar', x: 280, y: 280,
    label: 'Emitir Factura',
    sublabel: 'AFIP On-line',
    icon: '🧾',
    type: 'process',
    color: '#f59e0b', colorRgb: '245,158,11' 
  },

  // DISTRIBUIDOR
  { 
    id: 'dispatch', x: 500, y: 200,
    label: 'Orquestador',
    sublabel: 'El cerebro',
    icon: '⚡',
    type: 'process',
    color: '#fbbf24', colorRgb: '251,191,36' 
  },

  // OUTPUTS (3 simultáneos)
  { 
    id: 'whatsapp_out', x: 760, y: 100,
    label: 'Notificar Cliente',
    sublabel: 'WhatsApp',
    icon: '💬',
    type: 'output',
    color: '#25d366', colorRgb: '37,211,102' 
  },
  { 
    id: 'vendedor_out', x: 760, y: 220,
    label: 'Aviso Logística',
    sublabel: 'Alerta en Slack',
    icon: '📨',
    type: 'output',
    color: '#e01e5a', colorRgb: '224,30,90' 
  },
  { 
    id: 'sheets_out', x: 760, y: 340,
    label: 'Libro Ventas',
    sublabel: 'Registro en Excel',
    icon: '📊',
    type: 'output',
    color: '#34a853', colorRgb: '52,168,83' 
  },
]

const flowEdges: FlowEdge[] = [
  { id: 'l-c', from: 'lead', to: 'calificar' },
  { id: 'l-r', from: 'lead', to: 'registrar' },
  { id: 'c-d', from: 'calificar', to: 'dispatch' },
  { id: 'r-d', from: 'registrar', to: 'dispatch' },
  { id: 'd-w', from: 'dispatch', to: 'whatsapp_out' },
  { id: 'd-v', from: 'dispatch', to: 'vendedor_out' },
  { id: 'd-s', from: 'dispatch', to: 'sheets_out' },
]

const flowNodeById = Object.fromEntries(flowNodes.map(node => [node.id, node])) as Record<string, FlowNode>
const flowEdgeById = Object.fromEntries(flowEdges.map(edge => [edge.id, edge])) as Record<string, FlowEdge>
const outputNodeIds = new Set(['whatsapp_out', 'vendedor_out', 'sheets_out'])
const arrivalMessageByNodeId: Record<string, string> = {
  lead: 'Pago detectado en MercadoPago',
  calificar: 'Validacion de pago completada',
  registrar: 'Factura AFIP generada con exito',
  dispatch: 'Orquestador disparando acciones',
  whatsapp_out: 'WhatsApp de confirmacion enviado',
  vendedor_out: 'Slack: alerta de nueva venta',
  sheets_out: 'Excel: venta registrada',
}

// ... (skipping connections)

const performanceMetrics = [
  { 
    value: '100%', 
    label: 'Efectividad en los datos', 
    icon: '🎯', 
    colorRgb: '245,158,11' 
  },
  { 
    value: '0ms', 
    label: 'Error en transcripción', 
    icon: '⌨️', 
    colorRgb: '249,115,22' 
  },
  { 
    value: '24/7', 
    label: 'Vigilancia constante', 
    icon: '🌙', 
    colorRgb: '245,158,11' 
  },
]

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function AtmosphereFlow() {
  return (
    <>
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(245, 158, 11, 0.06) 0%, transparent 80%)',
          filter: 'blur(80px)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20%', left: '5%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.04) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '20%', right: '5%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
    </>
  )
}

function FlowSVG({
  activeNodes,
  particles,
  completedOutputs,
  edgeProgress,
}: {
  activeNodes: Set<string>
  particles: FlowParticle[]
  completedOutputs: Set<string>
  edgeProgress: Record<string, number>
}) {
  const getNodeRadius = (nodeId: string) => {
    const node = flowNodeById[nodeId]
    return node.id === 'dispatch' ? 36 : node.type === 'trigger' ? 34 : 28
  }

  const getEdgePoints = (edge: FlowEdge) => {
    const from = flowNodeById[edge.from]
    const to = flowNodeById[edge.to]
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len
    const uy = dy / len

    const fromPortRadius = getNodeRadius(edge.from) + 3
    const toPortRadius = getNodeRadius(edge.to) + 3

    return {
      x1: from.x + ux * fromPortRadius,
      y1: from.y + uy * fromPortRadius,
      x2: to.x - ux * toPortRadius,
      y2: to.y - uy * toPortRadius,
    }
  }

  return (
    <div className="relative bg-[#ffffff]/[0.02] border border-white/[0.07] rounded-[20px] p-6 lg:p-10 overflow-hidden"
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.4)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
      <svg
        viewBox="0 0 1000 400"
        className="w-full h-auto overflow-visible"
        style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
      >
        <defs>
          <filter id="flowGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* EDGES base */}
        {flowEdges.map(edge => {
          const from = flowNodeById[edge.from]
          const points = getEdgePoints(edge)
          const edgeParticles = particles.filter(p => p.edgeId === edge.id)
          const liveProgress = edgeParticles.length > 0
            ? edgeParticles.reduce((max, p) => Math.max(max, Math.min(1, p.progress)), 0)
            : 0
          const retainedProgress = edgeProgress[edge.id] ?? 0
          const furthestProgress = Math.max(liveProgress, retainedProgress)
          const hasFlow = furthestProgress > 0.001
          const hx = points.x1 + (points.x2 - points.x1) * furthestProgress
          const hy = points.y1 + (points.y2 - points.y1) * furthestProgress

          return (
            <g key={edge.id}>
              <line
                x1={points.x1} y1={points.y1}
                x2={points.x2} y2={points.y2}
                stroke="rgba(255, 255, 255, 0.07)"
                strokeWidth={1.5}
                strokeDasharray="4 8"
              />

              {hasFlow && (
                <line
                  x1={points.x1} y1={points.y1}
                  x2={hx} y2={hy}
                  stroke={`rgba(${from.colorRgb}, 0.16)`}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              )}

              {hasFlow && (
                <line
                  x1={points.x1} y1={points.y1}
                  x2={hx} y2={hy}
                  stroke={`rgba(${from.colorRgb}, ${furthestProgress >= 0.999 ? 0.82 : 0.68})`}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  filter="url(#flowGlow)"
                />
              )}
            </g>
          )
        })}

        {/* PARTÍCULAS */}
        {particles.map(p => {
          const edge = flowEdgeById[p.edgeId]
          const points = getEdgePoints(edge)

          const x = points.x1 + (points.x2 - points.x1) * p.progress
          const y = points.y1 + (points.y2 - points.y1) * p.progress
          const tx = points.x1 + (points.x2 - points.x1) * Math.max(0, p.progress - 0.12)
          const ty = points.y1 + (points.y2 - points.y1) * Math.max(0, p.progress - 0.12)

          return (
            <g key={p.id}>
              {/* Trail */}
              <line
                x1={tx} y1={ty}
                x2={x} y2={y}
                stroke={`rgba(${p.colorRgb}, 0.58)`}
                strokeWidth="2.4"
                strokeLinecap="round"
                filter="url(#flowGlow)"
              />
              {/* Halo exterior */}
              <circle
                cx={x} cy={y} r="7"
                fill={`rgba(${p.colorRgb}, 0.1)`}
              />
              {/* Core brillante */}
              <circle
                cx={x} cy={y} r="3.2"
                fill={`rgb(${p.colorRgb})`}
                filter="url(#flowGlow)"
              />
              {/* Núcleo blanco */}
              <circle
                cx={x} cy={y} r="1.1"
                fill="rgba(255,255,255,0.85)"
              />
            </g>
          )
        })}

        {/* NODOS */}
        {flowNodes.map(node => {
          const isActive = activeNodes.has(node.id)
          const isCompleted = completedOutputs.has(node.id)
          const R = node.id === 'dispatch' ? 36 : node.type === 'trigger' ? 34 : 28
          const incoming = flowEdges.filter(edge => edge.to === node.id)
          const outgoing = flowEdges.filter(edge => edge.from === node.id)

          const portFromEdge = (otherNodeId: string) => {
            const other = flowNodeById[otherNodeId]
            const dx = other.x - node.x
            const dy = other.y - node.y
            const len = Math.hypot(dx, dy) || 1
            const ux = dx / len
            const uy = dy / len
            const portRadius = R + 3
            return {
              x: ux * portRadius,
              y: uy * portRadius,
            }
          }

          return (
            <g 
              key={node.id} 
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-none"
            >
              {/* Capa opaca para ocultar líneas detrás del nodo */}
              <circle
                r={R + 10}
                fill="rgba(7,7,9,0.96)"
              />

              <circle
                r={R + 18}
                fill={`rgba(${node.colorRgb}, ${isActive || isCompleted ? 0.1 : 0.02})`}
                className="transition-all duration-400"
              />

              {(isActive || isCompleted) && (
                <circle
                  r={R + 8}
                  fill="none"
                  stroke={`rgba(${node.colorRgb}, ${isCompleted ? 0.6 : 0.3})`}
                  strokeWidth="1.5"
                  style={{ animation: 'ringPulseAmber 2s ease-in-out infinite' }}
                />
              )}

              <circle
                r={R}
                fill={`rgba(${node.colorRgb}, ${isActive ? 0.18 : isCompleted ? 0.22 : 0.06})`}
                stroke={`rgba(${node.colorRgb}, ${isActive ? 0.7 : isCompleted ? 0.9 : 0.2})`}
                strokeWidth={isCompleted ? 2.5 : isActive ? 2 : 1}
                filter={isCompleted ? "url(#flowGlow)" : ""}
                className="transition-all duration-400"
              />

              {/* Puertos de entrada */}
              {incoming.map((edge, idx) => {
                const p = portFromEdge(edge.from)
                return (
                  <g key={`${node.id}-in-${idx}`}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="3.7"
                      fill="rgba(7,7,9,0.95)"
                      stroke="rgba(148,163,184,0.42)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="1.65"
                      fill="rgba(226,232,240,0.9)"
                    />
                  </g>
                )
              })}

              {/* Puertos de salida */}
              {outgoing.map((edge, idx) => {
                const p = portFromEdge(edge.to)
                return (
                  <g key={`${node.id}-out-${idx}`}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="3.7"
                      fill="rgba(7,7,9,0.95)"
                      stroke={`rgba(${node.colorRgb},0.55)`}
                      strokeWidth="1"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="1.7"
                      fill={`rgba(${node.colorRgb},0.96)`}
                      filter="url(#flowGlow)"
                    />
                  </g>
                )
              })}

              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={node.id === 'dispatch' ? "22" : "16"}
                className="select-none"
              >
                {isCompleted ? '✅' : node.icon}
              </text>

              <text
                y={R + 15}
                textAnchor="middle"
                fill={isActive || isCompleted ? node.color : 'rgba(255, 255, 255, 0.35)'}
                fontSize="11"
                fontWeight={isActive || isCompleted ? "700" : "400"}
                className="transition-colors duration-300 font-bold"
              >
                {node.label.toUpperCase()}
              </text>
              <text
                y={R + 28}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.2)"
                fontSize="9"
                className="font-mono tracking-wider"
              >
                {node.sublabel.toUpperCase()}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function EventLog({ logEntries, isSimulating }: { logEntries: LogEntry[], isSimulating: boolean }) {
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/[0.07]"
      style={{ background: 'rgba(8,8,16,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
      {/* Header Log */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.025] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            {isSimulating && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-amber-500' : 'bg-white/15'}`} />
          </div>
          <span className="text-[10px] font-black tracking-[0.22em] text-white/45 font-mono">
            SISTEMA LOG
          </span>
        </div>
        <span className="text-[10px] text-white/20 font-mono font-bold tracking-[0.1em]">
          {logEntries.length} EVENTOS
        </span>
      </div>

      {/* Log Body */}
      <div className="p-4 max-h-[160px] overflow-y-auto space-y-1.5" style={{ fontFamily: 'ui-monospace, monospace' }}>
        <AnimatePresence initial={false} mode="popLayout">
          {logEntries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ x: -14, opacity: 0, height: 0 }}
              animate={{ x: 0, opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 pl-3 py-1.5 overflow-hidden"
              style={{
                borderLeft: '2px solid rgba(245,158,11,0.45)',
                background: 'rgba(245,158,11,0.025)',
                borderRadius: '0 6px 6px 0',
              }}
            >
              <span style={{ fontSize: '9px', color: 'rgba(245,158,11,0.4)', flexShrink: 0, letterSpacing: '0.04em' }}>{entry.timestamp}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, letterSpacing: '0.01em' }}>{entry.message}</span>
            </motion.div>
          ))}
          {logEntries.length === 0 && (
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.12)', textAlign: 'center', padding: '20px 0', letterSpacing: '0.12em' }}>
              SISTEMA LISTO
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  return (
    <div className="mb-10 md:mb-14">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="inline-flex items-center gap-2 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6 bg-amber-500/5"
      >
        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-amber-500 font-bold">
          [ LA ANATOMÍA DE UN WORKFLOW ]
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity:0, y:20 }}
        animate={isInView ? { opacity:1, y:0 } : {}}
        transition={{ duration:0.6, delay: 0.15 }}
        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05]"
        style={{ letterSpacing: '-0.03em' }}
      >
        Un lead entra.
        <br />
        <span className="text-amber-500">Tres cosas pasan a la vez.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity:0 }}
        animate={isInView ? { opacity:1 } : {}}
        transition={{ duration:0.6, delay:0.3 }}
        className="text-white/42 text-sm md:text-base mt-6 max-w-xl leading-relaxed"
      >
        Así se ve tu empresa cuando la conectamos. El flujo se ejecuta en tiempo real
        y de forma continua para que veas cómo todos tus sistemas trabajan en armonía.
      </motion.p>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function FlujoAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion()

  // Estados
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set())
  const [particles, setParticles] = useState<FlowParticle[]>([])
  const [completedOutputs, setCompletedOutputs] = useState<Set<string>>(new Set())
  const [eventLog, setEventLog] = useState<LogEntry[]>([])
  const [edgeProgress, setEdgeProgress] = useState<Record<string, number>>({})
  const [hoveredMetricIndex, setHoveredMetricIndex] = useState<number | null>(null)

  // Refs para loop de partículas
  const particlesRef = useRef<FlowParticle[]>([])
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)
  const activeNodesRef = useRef<Set<string>>(new Set())
  const cycleTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const nodeTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({})
  const spawnCooldownRef = useRef<Record<string, number>>({})
  const loggedNodesRef = useRef<Set<string>>(new Set())
  const edgeProgressRef = useRef<Record<string, number>>({})

  // Sincronizar ref de nodos activos para evitar stale closure en RAF
  useEffect(() => {
    activeNodesRef.current = activeNodes
  }, [activeNodes])

  useEffect(() => {
    edgeProgressRef.current = edgeProgress
  }, [edgeProgress])

  // Cleanup cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const clearCycleTimeouts = useCallback(() => {
    cycleTimeoutsRef.current.forEach(clearTimeout)
    cycleTimeoutsRef.current = []
  }, [])

  const queueCycleTimeout = useCallback((fn: () => void, delay: number) => {
    const timeoutId = setTimeout(fn, delay)
    cycleTimeoutsRef.current.push(timeoutId)
  }, [])

  const clearNodeTimeouts = useCallback(() => {
    Object.values(nodeTimeoutsRef.current).forEach(timeoutId => {
      if (timeoutId) clearTimeout(timeoutId)
    })
    nodeTimeoutsRef.current = {}
  }, [])

  const getTimestamp = useCallback(
    () =>
      new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    []
  )

  const pushLog = useCallback((message: string) => {
    setEventLog(prev => [
      {
        id: Date.now() + Math.random(),
        message,
        timestamp: getTimestamp(),
      },
      ...prev,
    ].slice(0, 8))
  }, [getTimestamp])

  const activateNode = useCallback((nodeId: string, duration = 950) => {
    const nextActive = new Set(activeNodesRef.current)
    nextActive.add(nodeId)
    activeNodesRef.current = nextActive
    setActiveNodes(nextActive)

    const prevTimeout = nodeTimeoutsRef.current[nodeId]
    if (prevTimeout) clearTimeout(prevTimeout)

    nodeTimeoutsRef.current[nodeId] = setTimeout(() => {
      const updated = new Set(activeNodesRef.current)
      updated.delete(nodeId)
      activeNodesRef.current = updated
      setActiveNodes(updated)
    }, duration)
  }, [])

  const spawnParticle = useCallback((edgeId: string, speedBoost = 0) => {
    const edge = flowEdgeById[edgeId]
    if (!edge) return

    const fromNode = flowNodeById[edge.from]
    particlesRef.current.push({
      id: Date.now() + Math.random(),
      edgeId: edge.id,
      progress: 0,
      speed: 0.0046 + Math.random() * 0.0022 + speedBoost,
      colorRgb: fromNode.colorRgb,
      phase: Math.random(),
    })
  }, [])

  const startParticleLoop = useCallback(() => {
    if (shouldReduceMotion) return

    cancelAnimationFrame(animRef.current)
    frameRef.current = 0

    function tick() {
      frameRef.current++
      const f = frameRef.current

      // Emitir pocas particulas para mantener un look mas limpio y profesional.
      if (particlesRef.current.length < 8) {
        flowEdges.forEach(edge => {
          if (!activeNodesRef.current.has(edge.from)) return

          const hasEdgeParticle = particlesRef.current.some(p => p.edgeId === edge.id)
          if (hasEdgeParticle) return

          const minGap = edge.from === 'dispatch' ? 80 : 96
          const lastSpawnFrame = spawnCooldownRef.current[edge.id] ?? -10000
          if (f - lastSpawnFrame < minGap) return

          spawnParticle(edge.id, edge.from === 'dispatch' ? 0.0005 : 0)
          spawnCooldownRef.current[edge.id] = f
        })
      }

      // Avance y deteccion de llegada real.
      const reachedNodeIds: string[] = []
      particlesRef.current = particlesRef.current
        .map(p => {
          const progress = p.progress + p.speed
          const prevProgress = edgeProgressRef.current[p.edgeId] ?? 0
          if (progress > prevProgress) {
            edgeProgressRef.current = { ...edgeProgressRef.current, [p.edgeId]: Math.min(progress, 1) }
          }
          return { ...p, progress }
        })
        .filter(p => {
          if (p.progress < 1) return true

          const edge = flowEdgeById[p.edgeId]
          if (edge) reachedNodeIds.push(edge.to)

          return false
        })

      if (reachedNodeIds.length > 0) {
        const uniqueReached = Array.from(new Set(reachedNodeIds))

        uniqueReached.forEach(nodeId => {
          activateNode(nodeId, nodeId === 'dispatch' ? 1200 : 900)

          if (outputNodeIds.has(nodeId)) {
            setCompletedOutputs(prev => {
              const next = new Set(prev)
              next.add(nodeId)
              return next
            })
          }

          const msg = arrivalMessageByNodeId[nodeId]
          if (msg && !loggedNodesRef.current.has(nodeId)) {
            loggedNodesRef.current.add(nodeId)
            pushLog(msg)
          }
        })
      }

      setParticles([...particlesRef.current])
      setEdgeProgress(edgeProgressRef.current)
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
  }, [activateNode, pushLog, shouldReduceMotion, spawnParticle])

  const runSimulationCycle = useCallback(() => {
    clearNodeTimeouts()
    activeNodesRef.current = new Set()
    setActiveNodes(new Set())
    particlesRef.current = []
    setParticles([])
    setCompletedOutputs(new Set())
    edgeProgressRef.current = {}
    setEdgeProgress({})
    spawnCooldownRef.current = {}
    loggedNodesRef.current = new Set()

    activateNode('lead', shouldReduceMotion ? 500 : 1150)
    loggedNodesRef.current.add('lead')
    pushLog(arrivalMessageByNodeId.lead)

    if (shouldReduceMotion) {
      const reducedSequence = [
        { nodeId: 'calificar', delay: 280 },
        { nodeId: 'registrar', delay: 420 },
        { nodeId: 'dispatch', delay: 680 },
        { nodeId: 'whatsapp_out', delay: 940 },
        { nodeId: 'vendedor_out', delay: 1040 },
        { nodeId: 'sheets_out', delay: 1140 },
      ]

      reducedSequence.forEach(({ nodeId, delay }) => {
        queueCycleTimeout(() => {
          activateNode(nodeId, nodeId === 'dispatch' ? 700 : 550)
          const msg = arrivalMessageByNodeId[nodeId]
          if (msg && !loggedNodesRef.current.has(nodeId)) {
            loggedNodesRef.current.add(nodeId)
            pushLog(msg)
          }
          if (outputNodeIds.has(nodeId)) {
            setCompletedOutputs(prev => {
              const next = new Set(prev)
              next.add(nodeId)
              return next
            })
          }
        }, delay)
      })
      return
    }

    // Arranque real: el trigger dispara ambos caminos.
    spawnParticle('l-c', 0.0006)
    spawnParticle('l-r', 0.0006)
  }, [activateNode, clearNodeTimeouts, pushLog, queueCycleTimeout, shouldReduceMotion, spawnParticle])

  useEffect(() => {
    if (!isInView) return

    clearCycleTimeouts()
    clearNodeTimeouts()
    const bootstrapTimeout = setTimeout(() => {
      runSimulationCycle()
    }, 0)

    const cycleDuration = shouldReduceMotion ? 1700 : 7600
    const intervalId = setInterval(() => {
      clearCycleTimeouts()
      clearNodeTimeouts()
      runSimulationCycle()
    }, cycleDuration)

    if (!shouldReduceMotion) {
      startParticleLoop()
    }

    return () => {
      clearTimeout(bootstrapTimeout)
      clearInterval(intervalId)
      clearCycleTimeouts()
      clearNodeTimeouts()
      cancelAnimationFrame(animRef.current)
    }
  }, [clearCycleTimeouts, clearNodeTimeouts, isInView, runSimulationCycle, shouldReduceMotion, startParticleLoop])

  return (
    <section
      id="flujo"
      ref={sectionRef}
      className="relative w-full py-20 md:py-32 lg:py-40 px-6 sm:px-12 bg-[#070709] overflow-hidden z-[1]"
    >
      <AtmosphereFlow />

      <div className="relative max-w-6xl mx-auto z-10">
        <Header isInView={isInView} />
        
        <FlowSVG
          activeNodes={activeNodes}
          particles={particles}
          completedOutputs={completedOutputs}
          edgeProgress={edgeProgress}
        />

        {/* Log del sistema */}
        <div className="mt-12">
          <EventLog
            logEntries={eventLog}
            isSimulating={particles.length > 0 || activeNodes.size > 0}
          />
        </div>

        {/* MÉTRICAS DE IMPACTO */}
        <div className="flex flex-wrap gap-3 md:gap-4 mt-12 md:mt-16">
          {performanceMetrics.map((m, i) => {
            const isHovered = hoveredMetricIndex === i
            return (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? { opacity:1 } : { opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredMetricIndex(i)}
                onMouseLeave={() => setHoveredMetricIndex(null)}
                className="relative overflow-hidden flex-1 min-w-[200px] rounded-2xl p-6 lg:p-8 text-center"
                style={{
                  background: isHovered ? `rgba(${m.colorRgb}, 0.11)` : 'rgba(255,255,255,0.02)',
                  border: isHovered ? `1px solid rgba(${m.colorRgb}, 0.48)` : `1px solid rgba(${m.colorRgb}, 0.14)`,
                  boxShadow: isHovered
                    ? `0 0 0 1px rgba(${m.colorRgb}, 0.28), 0 0 28px rgba(${m.colorRgb}, 0.24), 0 10px 26px rgba(0,0,0,0.32)`
                    : `0 4px 20px rgba(0,0,0,0.2), 0 0 0 1px rgba(${m.colorRgb}, 0.05)`,
                  transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
                  transition: 'none',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[1px]"
                  style={{ background: `linear-gradient(90deg, transparent, rgba(${m.colorRgb}, 0.5), transparent)` }}
                />
                <div className="w-10 h-10 rounded-xl mb-3 mx-auto flex items-center justify-center text-xl"
                  style={{
                    background: isHovered ? `rgba(${m.colorRgb}, 0.18)` : `rgba(${m.colorRgb}, 0.1)`,
                    border: isHovered ? `1px solid rgba(${m.colorRgb}, 0.38)` : `1px solid rgba(${m.colorRgb}, 0.2)`,
                    boxShadow: isHovered
                      ? `0 0 0 1px rgba(${m.colorRgb},0.18), 0 0 18px rgba(${m.colorRgb},0.3)`
                      : `0 0 0 1px rgba(${m.colorRgb},0.08)`,
                    transition: 'none',
                  }}
                >
                  {m.icon}
                </div>
                <p
                  className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 font-mono"
                  style={{ color: `rgb(${m.colorRgb})`, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                >
                  {m.value}
                </p>
                <p className="text-[11px] md:text-xs text-white/30 leading-relaxed uppercase tracking-[0.12em]">
                  {m.label}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Separador Final Ámbar */}
        <motion.div
          initial={shouldReduceMotion ? { scaleX:1 } : { scaleX:0 }}
          animate={isInView ? { scaleX:1 } : {}}
          transition={{ duration:1.2, delay:0.2 }}
          className="h-[1px] w-full mt-16 md:mt-24"
          style={{
            background:'linear-gradient(90deg, transparent, rgba(245,158,11,0.5) 50%, transparent)',
            transformOrigin:'center',
          }}
        />
      </div>
    </section>
  )
}
