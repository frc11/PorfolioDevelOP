'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence, useReducedMotion } from 'motion/react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface CapacidadNode {
  id: string
  label: string        // "VELOCIDAD"
  title: string        // "Tu sistema, rápido"
  description: string
  metric: string       // "< 200ms"
  metricLabel: string  // "tiempo de respuesta"
  icon: string
  color: string
  colorRgb: string
  caseUse: string      // caso de uso real
  position: {          // % en el SVG
    x: number
    y: number
  }
}

interface NodeEdge {
  from: string
  to: string
}

interface ArchParticle {
  id: number
  edgeIndex: number
  progress: number  // 0→1
  speed: number
  colorRgb: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const nodes: CapacidadNode[] = [
  {
    id: 'velocidad',
    label: 'VELOCIDAD',
    title: 'Respuesta instantánea',
    description: 'Tu sistema responde en milisegundos. Sin tiempos de carga que frustran al equipo.',
    metric: '< 200ms',
    metricLabel: 'tiempo de respuesta promedio',
    icon: '⚡',
    color: '#6366f1',
    colorRgb: '99,102,241',
    caseUse: 'Un vendedor busca el stock de 200 productos en 0.2 segundos.',
    position: { x: 400, y: 100 },  // top center
  },
  {
    id: 'seguridad',
    label: 'SEGURIDAD',
    title: 'Datos blindados',
    description: 'Tus datos financieros y de clientes están protegidos. Solo accede quien vos autorizás. Backups automáticos diarios.',
    metric: '99.9%',
    metricLabel: 'uptime garantizado',
    icon: '🛡',
    color: '#7b2fff',
    colorRgb: '123,47,255',
    caseUse: 'Solo el gerente ve los costos. Solo ventas ve los clientes.',
    position: { x: 650, y: 200 },  // right top
  },
  {
    id: 'escalabilidad',
    label: 'ESCALABILIDAD',
    title: 'Crece con vos',
    description: 'El sistema soporta tu empresa hoy y cuando crezcas x10. Sin migraciones, sin caídas, sin empezar de cero.',
    metric: '∞',
    metricLabel: 'usuarios simultáneos',
    icon: '📈',
    color: '#6366f1',
    colorRgb: '99,102,241',
    caseUse: 'Abrís 3 sucursales nuevas. El sistema las absorbe sin tocar código.',
    position: { x: 650, y: 350 }, // right bottom
  },
  {
    id: 'integracion',
    label: 'INTEGRACIÓN',
    title: 'Todo conectado',
    description: 'WhatsApp, MercadoPago, AFIP, Gmail — todos integrados. Un dato actualizado en un lugar se refleja en todos.',
    metric: '+40',
    metricLabel: 'integraciones disponibles',
    icon: '🔗',
    color: '#7b2fff',
    colorRgb: '123,47,255',
    caseUse: 'Un pedido nuevo notifica al depósito, factura en AFIP y avisa al cliente automáticamente.',
    position: { x: 400, y: 420 }, // bottom center
  },
  {
    id: 'datos',
    label: 'DATOS',
    title: 'Inteligencia de negocio',
    description: 'Reportes en tiempo real. Tendencias, proyecciones y alertas automáticas cuando algo falla.',
    metric: '100%',
    metricLabel: 'datos en tiempo real',
    icon: '📊',
    color: '#6366f1',
    colorRgb: '99,102,241',
    caseUse: 'A las 8AM recibís el resumen del día anterior sin que nadie lo arme.',
    position: { x: 150, y: 350 }, // left bottom
  },
  {
    id: 'disponibilidad',
    label: 'DISPONIBILIDAD',
    title: 'Siempre online',
    description: '24/7 desde cualquier dispositivo. Tu vendedor en la calle consulta stock desde el celular en tiempo real. Sin instalaciones. Sin VPN.',
    metric: '24/7',
    metricLabel: 'disponibilidad garantizada',
    icon: '🌐',
    color: '#7b2fff',
    colorRgb: '123,47,255',
    caseUse: 'Tu vendedor en la calle consulta stock desde el celular en tiempo real.',
    position: { x: 150, y: 200 }, // left top
  },
]

const edges: NodeEdge[] = [
  { from: 'velocidad', to: 'seguridad' },
  { from: 'seguridad', to: 'escalabilidad' },
  { from: 'escalabilidad', to: 'integracion' },
  { from: 'integracion', to: 'datos' },
  { from: 'datos', to: 'disponibilidad' },
  { from: 'disponibilidad', to: 'velocidad' },
  // Conexiones cruzadas
  { from: 'velocidad', to: 'integracion' },
  { from: 'seguridad', to: 'datos' },
]

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function AtmosphereArch() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {/* Glow central — detrás del SVG */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '15%',
        width: '600px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 60%)',
        filter: 'blur(100px)',
      }} />

      {/* Glow InfoPanel — derecha */}
      <div style={{
        position: 'absolute',
        top: '25%', right: '-5%',
        width: '400px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(123,47,255,0.06) 0%, transparent 65%)',
        filter: 'blur(90px)',
      }} />

      {/* Líneas decorativas horizontales */}
      {[25, 50, 75].map((top, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${top}%`,
          left: 0, right: 0,
          height: '1px',
          background: 'rgba(255,255,255,0.018)',
        }} />
      ))}
    </div>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  return (
    <div style={{ marginBottom: 'clamp(40px, 5vh, 60px)' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '100px',
          padding: '4px 14px',
          marginBottom: '20px',
          background: 'rgba(99,102,241,0.05)',
        }}
      >
        <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#6366f1', fontWeight: 700 }}>
          [ TU SISTEMA, BLINDADO ]
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25 }}
        style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 16px' }}
      >
        Construido para<br />
        <span style={{ color: '#6366f1' }}>"no fallar."</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.38 }}
        style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', margin: 0, maxWidth: '600px' }}
      >
        Hacé clic en cada pilar para ver cómo protege tu operación.
      </motion.p>
    </div>
  )
}

function NodeDiagram({
  nodes,
  edges,
  activeNode,
  hoveredNode,
  setActiveNode,
  setHoveredNode,
  isInView,
  particles
}: {
  nodes: CapacidadNode[]
  edges: NodeEdge[]
  activeNode: string | null
  hoveredNode: string | null
  setActiveNode: (id: string | null) => void
  setHoveredNode: (id: string | null) => void
  isInView: boolean
  particles: ArchParticle[]
}) {
  // Función para obtener posición en edge:
  function getEdgePoint(edgeIdx: number, progress: number): { x: number, y: number } {
    const edge = edges[edgeIdx]
    const from = nodes.find(n => n.id === edge.from)!
    const to = nodes.find(n => n.id === edge.to)!
    return {
      x: from.position.x + (to.position.x - from.position.x) * progress,
      y: from.position.y + (to.position.y - from.position.y) * progress,
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'relative' }}
    >
      <svg
        viewBox="0 0 800 480"
        style={{
          width: '100%',
          height: 'auto',
          overflow: 'visible',
        }}
      >
        <defs>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from)!
          const toNode = nodes.find(n => n.id === edge.to)!
          const isHighlighted = activeNode === edge.from || activeNode === edge.to

          return (
            <line
              key={i}
              x1={fromNode.position.x}
              y1={fromNode.position.y}
              x2={toNode.position.x}
              y2={toNode.position.y}
              stroke={isHighlighted ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}
              strokeWidth={isHighlighted ? 1.5 : 1}
              strokeDasharray="4 6"
              style={{ transition: 'stroke 300ms, stroke-width 300ms' }}
            />
          )
        })}

        {/* Nodos */}
        {nodes.map((node) => {
          const isActive = activeNode === node.id
          const isHovered = hoveredNode === node.id
          const R = 36

          return (
            <g
              key={node.id}
              transform={`translate(${node.position.x}, ${node.position.y})`}
              onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow exterior */}
              <circle
                r={R + 20}
                fill={`rgba(${node.colorRgb}, ${isActive ? 0.15 : isHovered ? 0.08 : 0.03})`}
                style={{ transition: 'fill 300ms' }}
              />

              {/* Anillo pulsante activo */}
              {isActive && (
                <circle
                  r={R + 10}
                  fill="none"
                  stroke={`rgba(${node.colorRgb}, 0.4)`}
                  strokeWidth="1.5"
                  style={{ animation: 'ringPulse 2s ease-in-out infinite' }}
                />
              )}

              {/* Círculo principal */}
              <circle
                r={R}
                fill={`rgba(${node.colorRgb}, ${isActive ? 0.2 : isHovered ? 0.12 : 0.06})`}
                stroke={`rgba(${node.colorRgb}, ${isActive ? 0.8 : isHovered ? 0.5 : 0.25})`}
                strokeWidth={isActive ? 2 : 1}
                filter={isActive ? "url(#nodeGlow)" : ""}
                style={{ transition: 'fill 300ms, stroke 300ms' }}
              />

              {/* Ícono */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isActive ? "22" : "18"}
                style={{ userSelect: 'none', transition: 'font-size 200ms' }}
              >
                {node.icon}
              </text>

              {/* Label */}
              <text
                y={R + 18}
                textAnchor="middle"
                fill={isActive ? node.color : 'rgba(255,255,255,0.45)'}
                fontSize="10"
                fontWeight={isActive ? "700" : "500"}
                letterSpacing="1"
                style={{ transition: 'fill 300ms' }}
              >
                {node.label}
              </text>
            </g>
          )
        })}

        {/* Partículas viajando por las edges */}
        {particles.map(p => {
          const pos = getEdgePoint(p.edgeIndex, p.progress)
          const trailPos = getEdgePoint(p.edgeIndex, Math.max(0, p.progress - 0.08))

          return (
            <g key={p.id}>
              {/* Estela */}
              <line
                x1={trailPos.x} y1={trailPos.y}
                x2={pos.x} y2={pos.y}
                stroke={`rgba(${p.colorRgb}, 0.5)`}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Núcleo */}
              <circle
                cx={pos.x} cy={pos.y}
                r="3.5"
                fill={`rgba(${p.colorRgb}, 1)`}
                filter="url(#nodeGlow)"
              />
            </g>
          )
        })}
      </svg>
    </motion.div>
  )
}


function MetricDisplay({
  node,
}: {
  node: CapacidadNode
}) {
  // Detectar si la métrica es numérica
  const isNumeric =
    !isNaN(parseFloat(node.metric))
      && node.metric !== '∞'
      && node.metric !== '24/7'

  const [displayed, setDisplayed] = useState<number | null>(isNumeric ? 0 : null)

  useEffect(() => {
    if (!isNumeric) return

    const target = parseFloat(node.metric)
    const duration = 800
    const start = performance.now()

    function update(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(target * eased * 10) / 10)
      if (t < 1) requestAnimationFrame(update)
    }

    const frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [node.id, isNumeric, node.metric])

  const displayValue = isNumeric
    ? `${displayed}${
        node.metric.includes('%') ? '%'
        : node.metric.includes('ms') ? 'ms'
        : ''
      }`
    : node.metric

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
    }}>
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase',
          margin: '0 0 4px',
        }}>
          {node.metricLabel}
        </p>
        <p style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 900,
          color: node.color,
          margin: 0,
          lineHeight: 1,
          fontFamily: 'monospace',
        }}>
          {displayValue}
        </p>
      </div>

      {/* Mini gráfico de barra */}
      <div style={{
        width: '60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'flex-end',
      }}>
        {[90, 75, 95, 85, 100].map((h, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${h}%` }}
            transition={{
              delay: 0.1 + i * 0.05,
              duration: 0.4,
            }}
            style={{
              height: '4px',
              background: `rgba(${node.colorRgb}, ${0.3 + (h / 100) * 0.5})`,
              borderRadius: '100px',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function InfoPanel({ activeNode, isInView }: { activeNode: CapacidadNode | null, isInView: boolean }) {
  if (!activeNode) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          padding: 'clamp(28px, 3vw, 40px)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '300px',
          gap: '16px',
        }}
      >
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '20px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
        }}>
          💡
        </div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
          Hacé clic en una capacidad para ver cómo impacta en tu negocio
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
          {nodes.map(n => (
            <span key={n.id} style={{
              fontSize: '10px',
              padding: '3px 10px',
              borderRadius: '100px',
              background: `rgba(${n.colorRgb}, 0.06)`,
              border: `1px solid rgba(${n.colorRgb}, 0.15)`,
              color: `rgba(${n.colorRgb}, 0.6)`,
            }}>
              {n.label}
            </span>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeNode.id}
        initial={{ opacity: 0, x: 20, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          padding: 'clamp(24px, 3vw, 36px)',
          background: `linear-gradient(135deg, rgba(${activeNode.colorRgb}, 0.08) 0%, rgba(255,255,255, 0.02) 100%)`,
          border: `1px solid rgba(${activeNode.colorRgb}, 0.25)`,
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Borde superior */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, rgba(${activeNode.colorRgb}, 0.8) 40%, rgba(${activeNode.colorRgb}, 0.8) 60%, transparent)`,
        }} />

        {/* Header del panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '52px', height: '52px',
            borderRadius: '14px',
            background: `rgba(${activeNode.colorRgb}, 0.15)`,
            border: `1px solid rgba(${activeNode.colorRgb}, 0.3)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            flexShrink: 0,
            boxShadow: `0 0 24px rgba(${activeNode.colorRgb}, 0.2)`,
          }}>
            {activeNode.icon}
          </div>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', color: `rgba(${activeNode.colorRgb}, 0.7)`, fontWeight: 700, margin: '0 0 4px' }}>
              {activeNode.label}
            </p>
            <h3 style={{ fontSize: 'clamp(17px, 2vw, 22px)', fontWeight: 900, color: 'white', margin: 0 }}>
              {activeNode.title}
            </h3>
          </div>
        </div>

        {/* Descripción */}
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255, 0.55)', lineHeight: 1.7, margin: '0 0 24px' }}>
          {activeNode.description}
        </p>

        {/* Métrica animada */}
        <MetricDisplay node={activeNode} />

        {/* Caso de uso */}
        <div style={{
          marginTop: '20px',
          padding: '14px 16px',
          background: `rgba(${activeNode.colorRgb}, 0.06)`,
          border: `1px solid rgba(${activeNode.colorRgb}, 0.15)`,
          borderRadius: '12px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>💼</span>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.15em', color: `rgba(${activeNode.colorRgb}, 0.6)`, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase' }}>
              Caso real
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255, 0.6)', margin: 0, lineHeight: 1.55, fontStyle: 'italic' }}>
              "{activeNode.caseUse}"
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ArchitectureSoftware() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()

  // ─── PARTICLE ENGINE ───────────────────────────────────────────────────────
  const [archParticles, setArchParticles] = useState<ArchParticle[]>([])
  const particlesRef = useRef<ArchParticle[]>([])
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      if (archParticles.length > 0) setArchParticles([])
      return
    }

    function tick() {
      frameRef.current++
      const f = frameRef.current

      // Spawn cada 20 frames
      if (f % 20 === 0 && particlesRef.current.length < 12) {
        const edgeIdx = Math.floor(Math.random() * edges.length)
        const fromNode = nodes.find(n => n.id === edges[edgeIdx].from)!

        particlesRef.current = [
          ...particlesRef.current,
          {
            id: Date.now() + Math.random(),
            edgeIndex: edgeIdx,
            progress: 0,
            speed: 0.008 + Math.random() * 0.006,
            colorRgb: fromNode.colorRgb,
          }
        ]
      }

      // Mover partículas
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          progress: p.progress + p.speed,
        }))
        .filter(p => p.progress < 1)

      setArchParticles([...particlesRef.current])
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [isInView, shouldReduceMotion])

  return (
    <section 
      ref={sectionRef} 
      style={{ padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)', background: '#080810', position: 'relative', overflow: 'hidden' }}
    >
      <AtmosphereArch />
      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Header isInView={isInView} />
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-[clamp(24px,4vw,60px)] items-center">
          <NodeDiagram
            nodes={nodes}
            edges={edges}
            activeNode={activeNode}
            hoveredNode={hoveredNode}
            setActiveNode={setActiveNode}
            setHoveredNode={setHoveredNode}
            isInView={isInView}
            particles={archParticles}
          />
          <InfoPanel
            activeNode={activeNode ? nodes.find(n => n.id === activeNode)! : null}
            isInView={isInView}
          />
        </div>

        {/* Separador Final */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3) 20%, rgba(123,47,255,0.4) 50%, rgba(99,102,241,0.3) 80%, transparent)',
            transformOrigin: 'left center',
            marginTop: 'clamp(48px, 7vh, 80px)',
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes ringPulse {
          0% { transform: scale(0.8); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </section>
  )
}
