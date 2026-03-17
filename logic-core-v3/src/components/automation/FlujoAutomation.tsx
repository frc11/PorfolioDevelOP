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
}: {
  activeNodes: Set<string>
  particles: FlowParticle[]
  completedOutputs: Set<string>
}) {
  return (
    <div className="relative bg-[#ffffff]/[0.02] border border-white/[0.07] rounded-[20px] p-6 lg:p-10 overflow-hidden">
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
          const from = flowNodes.find(n => n.id === edge.from)!
          const to = flowNodes.find(n => n.id === edge.to)!
          const isActive = activeNodes.has(edge.from) && activeNodes.has(edge.to)

          return (
            <line
              key={edge.id}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={isActive ? `rgba(${from.colorRgb}, 0.4)` : 'rgba(255, 255, 255, 0.07)'}
              strokeWidth={isActive ? 2 : 1.5}
              strokeDasharray={isActive ? 'none' : '5 7'}
              className="transition-all duration-500"
            />
          )
        })}

        {/* PARTÍCULAS */}
        {particles.map(p => {
          const edge = flowEdges.find(e => e.id === p.edgeId)!
          const from = flowNodes.find(n => n.id === edge.from)!
          const to = flowNodes.find(n => n.id === edge.to)!

          const x = from.x + (to.x - from.x) * p.progress
          const y = from.y + (to.y - from.y) * p.progress
          const tx = from.x + (to.x - from.x) * Math.max(0, p.progress - 0.12)
          const ty = from.y + (to.y - from.y) * Math.max(0, p.progress - 0.12)

          return (
            <g key={p.id}>
              <line
                x1={tx} y1={ty}
                x2={x} y2={y}
                stroke={`rgba(${p.colorRgb}, 0.6)`}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx={x} cy={y} r="5"
                fill={`rgb(${p.colorRgb})`}
                filter="url(#flowGlow)"
              />
            </g>
          )
        })}

        {/* NODOS */}
        {flowNodes.map(node => {
          const isActive = activeNodes.has(node.id)
          const isCompleted = completedOutputs.has(node.id)
          const R = node.id === 'dispatch' ? 36 : node.type === 'trigger' ? 34 : 28

          return (
            <g 
              key={node.id} 
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-default"
            >
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
    <div className="mt-6 bg-[#ffffff]/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header Log */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            {isSimulating && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-amber-500' : 'bg-white/20'}`}></span>
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] text-white/50 font-mono">
            SISTEMA LOG
          </span>
        </div>
        <span className="text-[10px] text-white/20 font-mono font-bold">
          {logEntries.length} EVENTOS
        </span>
      </div>

      {/* Log Body */}
      <div className="p-3 max-h-[160px] overflow-y-auto font-mono text-[11px] space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {logEntries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 border-l-2 border-amber-500/40 pl-3 py-1 bg-white/[0.01]"
            >
              <span className="text-white/20 shrink-0">{entry.timestamp}</span>
              <span className="text-white/65 leading-relaxed">{entry.message}</span>
            </motion.div>
          ))}
          {logEntries.length === 0 && (
            <div className="text-white/10 text-center py-4">Inicie la simulación para ver registros...</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  return (
    <div className="mb-10 md:mb-14">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-500 font-mono text-[11px] font-bold tracking-[0.2em]">
          [ LA ANATOMÍA DE UN WORKFLOW ]
        </span>
      </div>

      <motion.h2 
        initial={{ opacity:0, y:20 }}
        animate={isInView ? { opacity:1, y:0 } : {}}
        transition={{ duration:0.6 }}
        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1]"
      >
        Un lead entra.
        <br />
        <span className="text-amber-500">Tres cosas pasan a la vez.</span>
      </motion.h2>

      <motion.p 
        initial={{ opacity:0 }}
        animate={isInView ? { opacity:1 } : {}}
        transition={{ duration:0.6, delay:0.2 }}
        className="text-white/40 text-sm md:text-base mt-6 max-w-xl"
      >
        Así se ve tu empresa cuando la conectamos. Apretá el botón de simulación
        y mirá cómo todos tus sistemas trabajan en perfecta armonía.
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
  const [isSimulating, setIsSimulating] = useState(false)
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set())
  const [particles, setParticles] = useState<FlowParticle[]>([])
  const [completedOutputs, setCompletedOutputs] = useState<Set<string>>(new Set())
  const [simCount, setSimCount] = useState(0)
  const [eventLog, setEventLog] = useState<LogEntry[]>([])

  // Refs para loop de partículas
  const particlesRef = useRef<FlowParticle[]>([])
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)
  const activeNodesRef = useRef<Set<string>>(new Set())

  // Sincronizar ref de nodos activos para evitar stale closure en RAF
  useEffect(() => {
    activeNodesRef.current = activeNodes
  }, [activeNodes])

  // Cleanup cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const startParticleLoop = useCallback(() => {
    if (shouldReduceMotion) return // Skip particles on reduced motion

    cancelAnimationFrame(animRef.current)
    frameRef.current = 0

    function tick() {
      frameRef.current++
      const f = frameRef.current

      // Spawn partículas en edges activos
      if (f % 18 === 0 && particlesRef.current.length < 15) {
        const activeEdges = flowEdges.filter(e =>
          activeNodesRef.current.has(e.from) && activeNodesRef.current.has(e.to)
        )

        if (activeEdges.length > 0) {
          const edge = activeEdges[Math.floor(Math.random() * activeEdges.length)]
          const fromNode = flowNodes.find(n => n.id === edge.from)!

          particlesRef.current.push({
            id: Date.now() + Math.random(),
            edgeId: edge.id,
            progress: 0,
            speed: 0.012 + Math.random() * 0.007,
            colorRgb: fromNode.colorRgb,
            phase: Math.random(),
          })
        }
      }

      // Mover partículas
      particlesRef.current = particlesRef.current
        .map(p => ({ ...p, progress: p.progress + p.speed }))
        .filter(p => p.progress < 1)

      setParticles([...particlesRef.current])

      // El loop dura mientras dure la simulación aproximada (300 frames ≈ 5-10s dependiendo de FPS)
      if (frameRef.current < 300) {
        animRef.current = requestAnimationFrame(tick)
      }
    }

    animRef.current = requestAnimationFrame(tick)
  }, [shouldReduceMotion])

  const handleSimular = () => {
    if (isSimulating) return

    setIsSimulating(true)
    setActiveNodes(new Set())
    setParticles([])
    setCompletedOutputs(new Set())
    setEventLog([])
    particlesRef.current = []
    frameRef.current = 0
    setSimCount(prev => prev + 1)

    // Secuencia de activación de nodos
    const sequence = [
      { nodeId: 'lead', delay: 0 },
      { nodeId: 'calificar', delay: 600 },
      { nodeId: 'registrar', delay: 800 },
      { nodeId: 'dispatch', delay: 1400 },
      { nodeId: 'whatsapp_out', delay: 2200 },
      { nodeId: 'vendedor_out', delay: 2400 },
      { nodeId: 'sheets_out', delay: 2600 },
    ]

    const logMessages = [
      { msg: '💳 Pago detectado en MercadoPago', delay: 100 },
      { msg: '⚙️ Validando datos del cliente...', delay: 700 },
      { msg: '🧾 Factura AFIP generada con éxito', delay: 900 },
      { msg: '⚡ Orquestador disparando acciones...', delay: 1500 },
      { msg: '💬 WhatsApp de confirmación enviado', delay: 2300 },
      { msg: '📨 Slack: Alerta de nuevo pedido', delay: 2500 },
      { msg: '📊 Excel: Venta registrada', delay: 2700 },
      { msg: '🚀 Ciclo completado sin errores', delay: 3000 },
    ]

    const timeouts: ReturnType<typeof setTimeout>[] = []

    sequence.forEach(({ nodeId, delay }) => {
      // If reduced motion, we still allow the delay to show the sequence, but it feels SNAPPY
      const actualDelay = shouldReduceMotion ? delay / 4 : delay

      const t = setTimeout(() => {
        setActiveNodes(prev => {
          const next = new Set(prev)
          next.add(nodeId)
          return next
        })
        
        // Marcar outputs como completados
        if (['whatsapp_out', 'vendedor_out', 'sheets_out'].includes(nodeId)) {
          setTimeout(() => {
            setCompletedOutputs(prev => {
              const next = new Set(prev)
              next.add(nodeId)
              return next
            })
          }, shouldReduceMotion ? 100 : 400)
        }
      }, actualDelay)
      timeouts.push(t)
    })

    logMessages.forEach(({ msg, delay }) => {
      const actualDelay = shouldReduceMotion ? delay / 4 : delay
      const t = setTimeout(() => {
        setEventLog(prev => [
          {
            id: Date.now() + Math.random(),
            message: msg,
            timestamp: new Date().toLocaleTimeString('es-AR', {
              hour: '2-digit', minute: '2-digit', second: '2-digit',
            })
          },
          ...prev
        ].slice(0, 8))
      }, actualDelay)
      timeouts.push(t)
    })

    // Fin de simulación
    const endTimeout = setTimeout(() => {
      setIsSimulating(false)
    }, shouldReduceMotion ? 1000 : 3500)
    timeouts.push(endTimeout)

    // Iniciar RAF loop (only if motion is NOT reduced)
    if (!shouldReduceMotion) {
      startParticleLoop()
    }

    // Cleanup local si se vuelve a llamar (aunque el guard if(isSimulating) previene esto)
    return () => timeouts.forEach(clearTimeout)
  }

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
        />

        {/* Botones y Log */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Columna Botón */}
          <div className="flex flex-col items-center md:items-start justify-center gap-6">
            {!isSimulating ? (
              <motion.button
                onClick={handleSimular}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-4 bg-gradient-to-br from-[#f59e0b] to-[#f97316] text-[#070709] px-10 py-5 rounded-full font-black font-mono tracking-wider shadow-[0_0_50px_rgba(245,158,11,0.3)]"
              >
                <span className="text-xl">▶</span>
                SIMULAR VENTA
              </motion.button>
            ) : (
              <div className="inline-flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 px-10 py-5 rounded-full font-mono text-amber-500/80">
                <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                Sincronizando...
              </div>
            )}

            {simCount > 0 && (
              <motion.p 
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                className="text-[11px] font-mono text-white/20 tracking-[0.15em]"
              >
                {simCount === 1 ? '1 SIMULACIÓN' : `${simCount} SIMULACIONES`} · TIEMPO REAL: ~2.8s
              </motion.p>
            )}
          </div>

          {/* Columna Log */}
          <EventLog logEntries={eventLog} isSimulating={isSimulating} />
        </div>

        {/* MÉTRICAS DE IMPACTO */}
        <div className="flex flex-wrap gap-3 md:gap-4 mt-12 md:mt-16">
          {performanceMetrics.map((m, i) => (
            <motion.div 
              key={i}
              initial={shouldReduceMotion ? { opacity:1 } : { opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              className="flex-1 min-w-[200px] bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 lg:p-8 text-center"
              style={{ borderColor: `rgba(${m.colorRgb}, 0.12)` }}
            >
              <span className="text-2xl block mb-2">{m.icon}</span>
              <p 
                className="text-2xl md:text-3xl lg:text-4xl font-black mb-1.5 font-mono"
                style={{ color: `rgb(${m.colorRgb})` }}
              >
                {m.value}
              </p>
              <p className="text-[11px] md:text-xs text-white/30 leading-relaxed uppercase tracking-wider">
                {m.label}
              </p>
            </motion.div>
          ))}
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
