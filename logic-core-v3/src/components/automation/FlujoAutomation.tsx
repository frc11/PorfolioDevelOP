'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'
import { Target, Keyboard, Moon } from 'lucide-react'

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
  id: number | string
  message: string
  timestamp: string
}

// ─── DATA ───────────────────────────────────────────────────────────────────

const flowNodes: FlowNode[] = [
  // TRIGGER
  { 
    id: 'lead', x: 110, y: 200,
    label: 'Pago Recibido',
    sublabel: 'MercadoPago',
    icon: '💳',
    type: 'trigger',
    color: '#f59e0b', colorRgb: '245,158,11' 
  },

  // PROCESOS
  { 
    id: 'calificar', x: 320, y: 125,
    label: 'Validar Pago',
    sublabel: 'Proceso Automático',
    icon: '⚙️',
    type: 'process',
    color: '#f97316', colorRgb: '249,115,22' 
  },
  { 
    id: 'registrar', x: 320, y: 275,
    label: 'Emitir Factura',
    sublabel: 'AFIP On-line',
    icon: '🧾',
    type: 'process',
    color: '#f59e0b', colorRgb: '245,158,11' 
  },

  // DISTRIBUIDOR
  { 
    id: 'dispatch', x: 555, y: 200,
    label: 'Orquestador',
    sublabel: 'El cerebro',
    icon: '⚡',
    type: 'process',
    color: '#fbbf24', colorRgb: '251,191,36' 
  },

  // OUTPUTS (3 simultáneos)
  { 
    id: 'whatsapp_out', x: 835, y: 85,
    label: 'Notificar Cliente',
    sublabel: 'WhatsApp',
    icon: '💬',
    type: 'output',
    color: '#25d366', colorRgb: '37,211,102' 
  },
  { 
    id: 'vendedor_out', x: 835, y: 200,
    label: 'Aviso Logística',
    sublabel: 'Alerta en Slack',
    icon: '📨',
    type: 'output',
    color: '#e01e5a', colorRgb: '224,30,90' 
  },
  { 
    id: 'sheets_out', x: 835, y: 315,
    label: 'Libro Ventas',
    sublabel: 'Registro en Excel',
    icon: '📊',
    type: 'output',
    color: '#34a853', colorRgb: '52,168,83' 
  },
]

const mobileFlowNodes: FlowNode[] = flowNodes.map(node => {
  const positions: Record<string, { x: number, y: number }> = {
    lead: { x: 210, y: 70 },
    calificar: { x: 120, y: 200 },
    registrar: { x: 300, y: 200 },
    dispatch: { x: 210, y: 340 },
    whatsapp_out: { x: 92, y: 520 },
    vendedor_out: { x: 210, y: 570 },
    sheets_out: { x: 328, y: 520 },
  }

  return { ...node, ...positions[node.id] }
})

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
    icon: <Target size={20} strokeWidth={1.5} />, 
    colorRgb: '245,158,11' 
  },
  { 
    value: '0ms', 
    label: 'Error en transcripción', 
    icon: <Keyboard size={20} strokeWidth={1.5} />, 
    colorRgb: '249,115,22' 
  },
  { 
    value: '24/7', 
    label: 'Vigilancia constante', 
    icon: <Moon size={20} strokeWidth={1.5} />, 
    colorRgb: '245,158,11' 
  },
]

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const FLOW_CYCLE_MS = 7600
const svgNumber = (value: number) => Number(value.toFixed(3))

const flowSegments = [
  { edgeId: 'l-c', start: 420, end: 1620 },
  { edgeId: 'l-r', start: 420, end: 1620 },
  { edgeId: 'c-d', start: 1900, end: 3140 },
  { edgeId: 'r-d', start: 2020, end: 3260 },
  { edgeId: 'd-w', start: 3700, end: 5040 },
  { edgeId: 'd-v', start: 3820, end: 5160 },
  { edgeId: 'd-s', start: 3940, end: 5280 },
]

const nodeWindows = [
  { nodeId: 'lead', start: 0, end: 1280 },
  { nodeId: 'calificar', start: 1560, end: 2460 },
  { nodeId: 'registrar', start: 1560, end: 2460 },
  { nodeId: 'dispatch', start: 3120, end: 4280 },
  { nodeId: 'whatsapp_out', start: 5020, end: 6100 },
  { nodeId: 'vendedor_out', start: 5140, end: 6220 },
  { nodeId: 'sheets_out', start: 5260, end: 6340 },
]

const logSchedule = [
  { at: 120, nodeId: 'lead' },
  { at: 1740, nodeId: 'calificar' },
  { at: 1860, nodeId: 'registrar' },
  { at: 3340, nodeId: 'dispatch' },
  { at: 5120, nodeId: 'whatsapp_out' },
  { at: 5240, nodeId: 'vendedor_out' },
  { at: 5360, nodeId: 'sheets_out' },
]

function FlowNodeIcon({ node, isCompleted }: { node: FlowNode, isCompleted: boolean }) {
  const color = isCompleted ? 'rgba(255,255,255,0.95)' : node.color
  const muted = isCompleted ? 'rgba(255,255,255,0.58)' : `rgba(${node.colorRgb},0.42)`

  if (isCompleted) {
    return (
      <g>
        <rect x="-10" y="-10" width="20" height="20" rx="4" fill={`rgba(${node.colorRgb},0.72)`} />
        <path d="M-5 0.5L-1.4 4L6 -5" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )
  }

  switch (node.id) {
    case 'lead':
      return (
        <g>
          <rect x="-10" y="-7" width="20" height="14" rx="2.5" fill="none" stroke={color} strokeWidth="2" />
          <path d="M-7 -1H7M-7 4H1" stroke={muted} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="6" cy="3.8" r="1.6" fill={color} />
        </g>
      )
    case 'calificar':
      return (
        <g>
          <circle cx="0" cy="0" r="4.4" fill="none" stroke={color} strokeWidth="2" />
          <path d="M0 -10V-6.8M0 6.8V10M-10 0H-6.8M6.8 0H10M-7.1 -7.1L-4.8 -4.8M4.8 4.8L7.1 7.1M7.1 -7.1L4.8 -4.8M-4.8 4.8L-7.1 7.1" stroke={muted} strokeWidth="2" strokeLinecap="round" />
        </g>
      )
    case 'registrar':
      return (
        <g>
          <path d="M-7 -10H5L9 -6V10H-7Z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
          <path d="M5 -10V-6H9M-3 -3H4M-3 2H4M-3 7H2" stroke={muted} strokeWidth="1.7" strokeLinecap="round" />
        </g>
      )
    case 'dispatch':
      return (
        <g>
          <path d="M2 -13L-7 2H0L-2 13L8 -3H1Z" fill={color} />
        </g>
      )
    case 'whatsapp_out':
      return (
        <g>
          <path d="M-9 -3C-9 -8 -4.6 -11 0.8 -11C6.6 -11 10 -7.7 10 -3.1C10 1.7 5.9 5 0.5 5C-1 5 -2.4 4.8 -3.7 4.3L-8 7L-6.7 2.5C-8.2 1.1 -9 -0.8 -9 -3Z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-3 -3H4M-3 1H2" stroke={muted} strokeWidth="1.7" strokeLinecap="round" />
        </g>
      )
    case 'vendedor_out':
      return (
        <g>
          <path d="M-10 -6H10V7H-10Z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-10 -6L0 1.5L10 -6M-6 9H6" stroke={muted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )
    case 'sheets_out':
      return (
        <g>
          <rect x="-10" y="-10" width="20" height="20" rx="3" fill="none" stroke={color} strokeWidth="2" />
          <path d="M-5 5V0M0 5V-6M5 5V-3" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M-6 8H6" stroke={muted} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )
    default:
      return <circle r="6" fill={color} />
  }
}

function getMobileLabelPlacement(nodeId: string, radius: number) {
  const placements: Record<string, { x: number, y: number, anchor: 'start' | 'middle' | 'end' }> = {
    lead: { x: 0, y: -(radius + 17), anchor: 'middle' },
    calificar: { x: -(radius + 12), y: 1, anchor: 'end' },
    registrar: { x: radius + 12, y: 1, anchor: 'start' },
    dispatch: { x: 0, y: -(radius + 17), anchor: 'middle' },
    whatsapp_out: { x: 0, y: radius + 15, anchor: 'middle' },
    vendedor_out: { x: 0, y: radius + 15, anchor: 'middle' },
    sheets_out: { x: 0, y: radius + 15, anchor: 'middle' },
  }

  return placements[nodeId] ?? { x: 0, y: radius + 15, anchor: 'middle' as const }
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

function getFlowSnapshot(elapsedMs: number, cycleStartedAtClock: number) {
  const activeNodes = new Set<string>()
  const completedOutputs = new Set<string>()
  const edgeProgress: Record<string, number> = {}
  const particles: FlowParticle[] = []

  nodeWindows.forEach(({ nodeId, start, end }) => {
    if (elapsedMs >= start && elapsedMs <= end) activeNodes.add(nodeId)
  })

  flowSegments.forEach((segment, index) => {
    const progress = clamp01((elapsedMs - segment.start) / (segment.end - segment.start))

    if (progress > 0) edgeProgress[segment.edgeId] = progress

    if (progress > 0 && progress < 1) {
      const edge = flowEdgeById[segment.edgeId]
      const fromNode = flowNodeById[edge.from]

      particles.push({
        id: index,
        edgeId: segment.edgeId,
        progress,
        speed: 0,
        colorRgb: fromNode.colorRgb,
        phase: 0,
      })
    }

    if (progress >= 1) {
      const edge = flowEdgeById[segment.edgeId]
      if (outputNodeIds.has(edge.to)) completedOutputs.add(edge.to)
    }
  })

  const logEntries = logSchedule
    .filter(entry => elapsedMs >= entry.at)
    .map((entry) => ({
      id: entry.nodeId,
      message: arrivalMessageByNodeId[entry.nodeId],
      timestamp: new Date(cycleStartedAtClock + entry.at).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }))
    .reverse()

  return { activeNodes, completedOutputs, edgeProgress, particles, logEntries }
}

const backdropCircuitPaths = [
  'M-40 812H206L238 780H410L442 748H640L674 714H840',
  'M30 870H310L342 838H510L542 806H756L790 772H980',
  'M860 792H1048L1084 756H1210L1240 726H1510',
  'M1036 138H1160L1194 104H1286L1320 70H1510',
  'M1116 256H1238L1270 224H1378L1408 194H1510',
  'M72 690H214L250 654H340L376 618H506',
  'M1162 654V520H1218L1250 488H1306V380',
  'M1320 750V622H1362L1392 592H1430V456',
]

const backdropSignalPaths = [
  'M20 690C160 604 276 714 420 628C594 524 732 612 894 536C1062 456 1212 548 1428 438',
  'M-10 752C154 672 302 772 462 702C650 620 798 694 952 626C1118 552 1272 640 1460 558',
]

const backdropNodes = [
  { x: 128, y: 734, r: 4, delay: 0.1 },
  { x: 408, y: 780, r: 5, delay: 0.7 },
  { x: 694, y: 714, r: 3, delay: 1.2 },
  { x: 980, y: 772, r: 4, delay: 0.4 },
  { x: 1238, y: 726, r: 5, delay: 1.5 },
  { x: 1392, y: 592, r: 3, delay: 0.9 },
  { x: 1160, y: 104, r: 3, delay: 1.8 },
]

function GearOutline({
  cx,
  cy,
  radius,
  teeth,
  opacity,
  glow = false,
}: {
  cx: number
  cy: number
  radius: number
  teeth: number
  opacity: number
  glow?: boolean
}) {
  const marks = Array.from({ length: teeth }, (_, index) => {
    const angle = (Math.PI * 2 * index) / teeth
    const outer = radius + 10
    const inner = radius + 1

    return {
      x1: svgNumber(cx + Math.cos(angle) * inner),
      y1: svgNumber(cy + Math.sin(angle) * inner),
      x2: svgNumber(cx + Math.cos(angle) * outer),
      y2: svgNumber(cy + Math.sin(angle) * outer),
    }
  })

  const spokes = Array.from({ length: Math.max(3, Math.floor(teeth / 4)) }, (_, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(3, Math.floor(teeth / 4))

    return {
      x2: svgNumber(cx + Math.cos(angle) * (radius * 0.72)),
      y2: svgNumber(cy + Math.sin(angle) * (radius * 0.72)),
    }
  })

  return (
    <g opacity={opacity} filter={glow ? 'url(#flowBackdropGlow)' : undefined}>
      <circle cx={cx} cy={cy} r={radius + 13} fill="none" stroke="rgba(249,115,22,0.18)" strokeWidth="1" strokeDasharray="10 12" />
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(249,115,22,0.52)" strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r={radius * 0.58} fill="none" stroke="rgba(251,191,36,0.28)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={radius * 0.2} fill="none" stroke="rgba(249,115,22,0.42)" strokeWidth="1.2" />
      {marks.map((mark, index) => (
        <line
          key={`tooth-${cx}-${cy}-${index}`}
          x1={mark.x1}
          y1={mark.y1}
          x2={mark.x2}
          y2={mark.y2}
          stroke="rgba(249,115,22,0.54)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ))}
      {spokes.map((spoke, index) => (
        <line
          key={`spoke-${cx}-${cy}-${index}`}
          x1={cx}
          y1={cy}
          x2={spoke.x2}
          y2={spoke.y2}
          stroke="rgba(251,191,36,0.34)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}

function AtmosphereFlow() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(245,158,11,0.075)_0%,rgba(249,115,22,0.026)_32%,rgba(7,7,9,0)_66%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_7%_76%,rgba(249,115,22,0.12)_0%,transparent_25%),radial-gradient(circle_at_93%_80%,rgba(245,158,11,0.1)_0%,transparent_28%),radial-gradient(circle_at_20%_10%,rgba(249,115,22,0.06)_0%,transparent_22%)]" />
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(249,115,22,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,158,11,0.05) 1px, transparent 1px)',
          backgroundSize: '84px 84px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 72%)',
        }}
      />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 980" preserveAspectRatio="none" role="presentation">
        <defs>
          <linearGradient id="flowBackdropStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(249,115,22,0)" />
            <stop offset="18%" stopColor="rgba(249,115,22,0.4)" />
            <stop offset="52%" stopColor="rgba(251,191,36,0.32)" />
            <stop offset="100%" stopColor="rgba(249,115,22,0)" />
          </linearGradient>
          <radialGradient id="flowBackdropNode">
            <stop offset="0%" stopColor="rgba(251,191,36,0.98)" />
            <stop offset="45%" stopColor="rgba(249,115,22,0.45)" />
            <stop offset="100%" stopColor="rgba(249,115,22,0)" />
          </radialGradient>
          <filter id="flowBackdropGlow" x="-220" y="-220" width="1880" height="1420" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <mask id="flowBackdropFade">
            <radialGradient id="flowBackdropFadeGradient" cx="50%" cy="48%" r="68%">
              <stop offset="0%" stopColor="white" stopOpacity="0.34" />
              <stop offset="48%" stopColor="white" stopOpacity="0.62" />
              <stop offset="100%" stopColor="white" stopOpacity="0.18" />
            </radialGradient>
            <rect width="1440" height="980" fill="url(#flowBackdropFadeGradient)" />
          </mask>
        </defs>

        <g mask="url(#flowBackdropFade)">
          <g opacity="0.76">
            {backdropCircuitPaths.map((path, index) => (
              <g key={`flow-circuit-${index}`}>
                <path d={path} fill="none" stroke="url(#flowBackdropStroke)" strokeWidth="1.1" />
                <path d={path} fill="none" stroke="rgba(251,191,36,0.18)" strokeWidth="2.2" strokeDasharray="1 112" strokeLinecap="round" />
              </g>
            ))}
          </g>

          <g opacity="0.5">
            {backdropSignalPaths.map((path, index) => (
              <motion.path
                key={`flow-signal-${index}`}
                d={path}
                fill="none"
                stroke="rgba(249,115,22,0.32)"
                strokeWidth="1.3"
                strokeDasharray="2 156"
                strokeLinecap="round"
                animate={prefersReducedMotion ? {} : { strokeDashoffset: [0, -316] }}
                transition={{ duration: 10 + index * 2, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </g>

          <GearOutline cx={42} cy={730} radius={104} teeth={28} opacity={0.34} glow />
          <GearOutline cx={190} cy={514} radius={48} teeth={18} opacity={0.44} />
          <GearOutline cx={278} cy={610} radius={56} teeth={18} opacity={0.34} />
          <GearOutline cx={1170} cy={808} radius={42} teeth={18} opacity={0.32} />
          <GearOutline cx={1362} cy={714} radius={54} teeth={20} opacity={0.42} />

          {backdropNodes.map((node, index) => (
            <motion.g
              key={`flow-node-${index}`}
              animate={prefersReducedMotion ? {} : { opacity: [0.28, 0.95, 0.38] }}
              transition={{ duration: 3.8, repeat: Infinity, delay: node.delay, ease: 'easeInOut' }}
            >
              <circle cx={node.x} cy={node.y} r={node.r * 4.2} fill="url(#flowBackdropNode)" opacity="0.25" />
              <circle cx={node.x} cy={node.y} r={node.r} fill="rgba(251,191,36,0.86)" filter="url(#flowBackdropGlow)" />
            </motion.g>
          ))}
        </g>
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,7,9,0.18)_0%,rgba(7,7,9,0.72)_58%,rgba(7,7,9,0.96)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-[#070709] via-[#070709]/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#070709] via-[#070709]/78 to-transparent" />
    </div>
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
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const layoutNodes = isMobileLayout ? mobileFlowNodes : flowNodes
  const layoutNodeById = Object.fromEntries(layoutNodes.map(node => [node.id, node])) as Record<string, FlowNode>
  const viewBox = isMobileLayout ? '0 0 420 650' : '0 20 930 360'

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)')
    const syncLayout = () => setIsMobileLayout(mediaQuery.matches)

    syncLayout()
    mediaQuery.addEventListener('change', syncLayout)

    return () => mediaQuery.removeEventListener('change', syncLayout)
  }, [])

  const getNodeRadius = (nodeId: string) => {
    const node = layoutNodeById[nodeId]
    if (isMobileLayout) return node.id === 'dispatch' ? 34 : node.type === 'trigger' ? 32 : 27
    return node.id === 'dispatch' ? 36 : node.type === 'trigger' ? 34 : 28
  }

  const getEdgePoints = (edge: FlowEdge) => {
    const from = layoutNodeById[edge.from]
    const to = layoutNodeById[edge.to]
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
    <div className="relative bg-[#ffffff]/[0.02] border border-white/[0.07] rounded-[20px] p-4 sm:p-6 lg:p-10 overflow-hidden"
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.4)' }}
    >
      <span className="absolute top-0 left-0 w-[1px] h-[18px] bg-amber-500/30 rounded-tl-[20px]" />
      <span className="absolute top-0 left-0 h-[1px] w-[18px] bg-amber-500/30 rounded-tl-[20px]" />
      <span className="absolute top-0 right-0 w-[1px] h-[18px] bg-amber-500/30 rounded-tr-[20px]" />
      <span className="absolute top-0 right-0 h-[1px] w-[18px] bg-amber-500/30 rounded-tr-[20px]" />
      <span className="absolute bottom-0 left-0 w-[1px] h-[18px] bg-amber-500/30 rounded-bl-[20px]" />
      <span className="absolute bottom-0 left-0 h-[1px] w-[18px] bg-amber-500/30 rounded-bl-[20px]" />
      <span className="absolute bottom-0 right-0 w-[1px] h-[18px] bg-amber-500/30 rounded-br-[20px]" />
      <span className="absolute bottom-0 right-0 h-[1px] w-[18px] bg-amber-500/30 rounded-br-[20px]" />

      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
      <svg
        viewBox={viewBox}
        className="mx-auto h-auto w-full overflow-visible"
        style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
      >
        <defs>
          <filter id="flowGlow" x="-120" y="-140" width="1180" height="720" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* EDGES base */}
        {flowEdges.map(edge => {
          const from = layoutNodeById[edge.from]
          const isOutputEdge = edge.from === 'dispatch'
          const points = getEdgePoints(edge)
          const edgeParticles = particles.filter(p => p.edgeId === edge.id)
          const liveProgress = edgeParticles.length > 0
            ? edgeParticles.reduce((max, p) => Math.max(max, Math.min(1, p.progress)), 0)
            : 0
          const retainedProgress = edgeProgress[edge.id] ?? 0
          const furthestProgress = Math.max(liveProgress, retainedProgress)
          const hasFlow = furthestProgress > 0.001
          const visualProgress = furthestProgress
          const hx = svgNumber(points.x1 + (points.x2 - points.x1) * visualProgress)
          const hy = svgNumber(points.y1 + (points.y2 - points.y1) * visualProgress)
          const x1 = svgNumber(points.x1)
          const y1 = svgNumber(points.y1)
          const x2 = svgNumber(points.x2)
          const y2 = svgNumber(points.y2)
          const glowOpacity = isOutputEdge ? 0.22 : 0.14
          const coreOpacity = furthestProgress >= 0.999 ? 0.98 : isOutputEdge ? 0.9 : 0.72

          return (
            <g key={edge.id}>
              <line
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke="rgba(255, 255, 255, 0.07)"
                strokeWidth={1.5}
                strokeDasharray="4 8"
                strokeLinecap="round"
              />

              {hasFlow && (
                <>
                  <line
                    x1={x1} y1={y1}
                    x2={hx} y2={hy}
                    stroke={`rgba(${from.colorRgb}, ${glowOpacity})`}
                    strokeWidth={isOutputEdge ? 14 : 9}
                    strokeLinecap="round"
                  />
                  <line
                    x1={x1} y1={y1}
                    x2={hx} y2={hy}
                    stroke={`rgba(${from.colorRgb}, ${isOutputEdge ? 0.34 : 0.22})`}
                    strokeWidth={isOutputEdge ? 7 : 5}
                    strokeLinecap="round"
                  />
                  <line
                    x1={x1} y1={y1}
                    x2={hx} y2={hy}
                    stroke={`rgba(${from.colorRgb}, ${coreOpacity})`}
                    strokeWidth={isOutputEdge ? 3.2 : 2.35}
                    strokeLinecap="round"
                  />
                </>
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
        {layoutNodes.map(node => {
          const isActive = activeNodes.has(node.id)
          const isCompleted = completedOutputs.has(node.id)
          const R = node.id === 'dispatch' ? 36 : node.type === 'trigger' ? 34 : 28
          const labelPlacement = isMobileLayout
            ? getMobileLabelPlacement(node.id, R)
            : { x: 0, y: R + 15, anchor: 'middle' as const }
          const incoming = flowEdges.filter(edge => edge.to === node.id)
          const outgoing = flowEdges.filter(edge => edge.from === node.id)

          const portFromEdge = (otherNodeId: string) => {
            const other = layoutNodeById[otherNodeId]
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

              <g className="select-none">
                <FlowNodeIcon node={node} isCompleted={isCompleted} />
              </g>

              <text
                x={labelPlacement.x}
                y={labelPlacement.y}
                textAnchor={labelPlacement.anchor}
                fill={isActive || isCompleted ? node.color : 'rgba(255, 255, 255, 0.35)'}
                fontSize="11"
                fontWeight={isActive || isCompleted ? "700" : "400"}
                className="transition-colors duration-300 font-bold"
              >
                {node.label.toUpperCase()}
              </text>
              <text
                x={labelPlacement.x}
                y={labelPlacement.y + 13}
                textAnchor={labelPlacement.anchor}
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
    <div className="relative mt-6 h-[236px] overflow-hidden rounded-2xl border border-white/[0.07]"
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
      <div className="h-[188px] overflow-y-auto p-4 space-y-1.5" style={{ fontFamily: 'ui-monospace, monospace' }}>
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
            <div className="grid h-full place-items-center" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.12)', textAlign: 'center', letterSpacing: '0.12em' }}>
              SISTEMA LISTO
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="mb-10 text-center md:mb-14 lg:text-left">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="relative overflow-hidden inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/[0.05] px-4 py-1.5 mb-6"
      >
        <motion.span
          aria-hidden="true"
          animate={prefersReducedMotion ? {} : { x: ['-150%', '250%'] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 4.2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)',
            borderRadius: '100px',
            pointerEvents: 'none',
            display: prefersReducedMotion ? 'none' : 'block',
          }}
        />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" style={{ animation: prefersReducedMotion ? 'none' : 'pulse 1.8s ease-in-out infinite', boxShadow: '0 0 8px rgba(245,158,11,0.9)' }} />
        <span className="text-[10px] font-mono tracking-[0.22em] text-amber-500 font-bold relative z-10">
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
        <div className="relative inline-block mt-2">
            <span className="text-amber-500">Tres cosas pasan a la vez.</span>
            {!prefersReducedMotion && (
                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: '0%',
                        right: '0%',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, #f59e0b 40%, #f97316 60%, transparent)',
                        transformOrigin: 'left',
                        filter: 'blur(0.5px)',
                    }}
                />
            )}
        </div>
      </motion.h2>

      <motion.p
        initial={{ opacity:0 }}
        animate={isInView ? { opacity:1 } : {}}
        transition={{ duration:0.6, delay:0.3 }}
        className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/42 md:text-base lg:mx-0"
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
  const [centerMetricIndex, setCenterMetricIndex] = useState<number | 'all' | null>(null)

  // Refs para loop de partículas
  const cycleStartedAtRef = useRef<number | null>(null)
  const cycleStartedAtClockRef = useRef<number>(0)
  const animRef = useRef<number>(0)
  const metricsGroupRef = useRef<HTMLDivElement | null>(null)
  const metricRefs = useRef<Array<HTMLDivElement | null>>([])
  // Cleanup cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  useEffect(() => {
    if (!isInView) return

    cancelAnimationFrame(animRef.current)
    cycleStartedAtRef.current = null
    cycleStartedAtClockRef.current = Date.now()

    if (shouldReduceMotion) {
      const snapshot = getFlowSnapshot(5600, cycleStartedAtClockRef.current)
      setActiveNodes(snapshot.activeNodes)
      setParticles([])
      setCompletedOutputs(snapshot.completedOutputs)
      setEdgeProgress(snapshot.edgeProgress)
      setEventLog(snapshot.logEntries)
      return
    }

    const tick = (timestamp: number) => {
      if (cycleStartedAtRef.current === null) {
        cycleStartedAtRef.current = timestamp
        cycleStartedAtClockRef.current = Date.now()
      }

      let elapsedMs = timestamp - cycleStartedAtRef.current

      if (elapsedMs >= FLOW_CYCLE_MS) {
        cycleStartedAtRef.current = timestamp
        cycleStartedAtClockRef.current = Date.now()
        elapsedMs = 0
      }

      const snapshot = getFlowSnapshot(elapsedMs, cycleStartedAtClockRef.current)
      setActiveNodes(snapshot.activeNodes)
      setParticles(snapshot.particles)
      setCompletedOutputs(snapshot.completedOutputs)
      setEdgeProgress(snapshot.edgeProgress)
      setEventLog(snapshot.logEntries)
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animRef.current)
    }
  }, [isInView, shouldReduceMotion])

  useEffect(() => {
    if (!isInView) return

    const compactQuery = window.matchMedia('(max-width: 1023px)')
    const tabletQuery = window.matchMedia('(min-width: 640px) and (max-width: 1023px)')
    let frameId = 0

    const updateCenteredMetric = () => {
      if (!compactQuery.matches) {
        setCenterMetricIndex(null)
        return
      }

      const viewportCenter = window.innerHeight / 2

      if (tabletQuery.matches) {
        const groupRect = metricsGroupRef.current?.getBoundingClientRect()
        const isCenterCrossingGroup = groupRect
          ? groupRect.top <= viewportCenter && groupRect.bottom >= viewportCenter
          : false

        setCenterMetricIndex(isCenterCrossingGroup ? 'all' : null)
        return
      }

      let closestIndex: number | null = null
      let closestDistance = Number.POSITIVE_INFINITY

      metricRefs.current.forEach((element, index) => {
        if (!element) return

        const rect = element.getBoundingClientRect()
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight
        if (!isVisible) return

        const cardCenter = rect.top + rect.height / 2
        const distance = Math.abs(cardCenter - viewportCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      setCenterMetricIndex(closestIndex)
    }

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(updateCenteredMetric)
    }

    updateCenteredMetric()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    compactQuery.addEventListener('change', updateCenteredMetric)
    tabletQuery.addEventListener('change', updateCenteredMetric)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      compactQuery.removeEventListener('change', updateCenteredMetric)
      tabletQuery.removeEventListener('change', updateCenteredMetric)
    }
  }, [isInView])

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
        <div ref={metricsGroupRef} className="flex flex-wrap gap-3 md:gap-4 mt-12 md:mt-16 relative">
          {!shouldReduceMotion && (
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-y-1/2 hidden md:block pointer-events-none" />
          )}
          {performanceMetrics.map((m, i) => {
            const activeMetric = hoveredMetricIndex ?? centerMetricIndex
            const isHovered = activeMetric === 'all' || activeMetric === i
            return (
              <motion.div
                key={i}
                ref={(element) => {
                  metricRefs.current[i] = element
                }}
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
