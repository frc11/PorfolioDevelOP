'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'

type NodeId = 'wa' | 'web' | 'gateway' | 'ia' | 'crm' | 'slack' | 'sheets'
type EventKind = 'entrada' | 'proceso' | 'salida'
type FlowMilestone =
  | 'first_data_ready'
  | 'first_response_delivered'
  | 'client_confirmation_sent'
  | 'crm_saved'
  | 'slack_sent'
  | 'slack_ack_received'
  | 'final_response_delivered'

interface PipelineNode {
  id: NodeId
  x: number
  y: number
  label: string
  sublabel: string
  type: 'input' | 'core' | 'output'
  color: string
  colorRgb: string
  icon: string
}

interface PipelineEdge {
  id: string
  from: NodeId
  to: NodeId
}

interface DataPacket {
  id: number
  flowRun: number
  edgeId: string
  segmentIndex: number
  progress: number
  speed: number
  color: string
  colorRgb: string
  size: number
}

interface ChatMessage {
  from: 'client' | 'ai'
  text: string
}

interface FlowScenario {
  id: string
  sourceNode: 'wa' | 'web'
  query: string
  firstResponse: string
  confirmation: string
  finalResponse: string
  sheetsSummary: string
  crmSummary: string
  slackSummary: string
}

interface FlowSegment {
  edgeId: string
  kind: EventKind
  message: string
  milestone?: FlowMilestone
}

interface LogEvent {
  id: number
  kind: EventKind
  nodeLabel: string
  message: string
  timestamp: string
  color: string
}

const NODES: PipelineNode[] = [
  {
    id: 'wa',
    x: 78,
    y: 158,
    label: 'WhatsApp',
    sublabel: 'Canal cliente',
    type: 'input',
    color: '#22c55e',
    colorRgb: '34,197,94',
    icon: '\u{1F4AC}',
  },
  {
    id: 'web',
    x: 78,
    y: 338,
    label: 'Web Chat',
    sublabel: 'Canal cliente',
    type: 'input',
    color: '#2dd4bf',
    colorRgb: '45,212,191',
    icon: '\u{1F310}',
  },
  {
    id: 'gateway',
    x: 300,
    y: 248,
    label: 'Gateway',
    sublabel: 'Enrutamiento',
    type: 'core',
    color: '#10b981',
    colorRgb: '16,185,129',
    icon: '\u26A1',
  },
  {
    id: 'ia',
    x: 514,
    y: 248,
    label: 'IA Core',
    sublabel: 'Decision y reglas',
    type: 'core',
    color: '#34d399',
    colorRgb: '52,211,153',
    icon: '\u{1F9E0}',
  },
  {
    id: 'sheets',
    x: 810,
    y: 132,
    label: 'Sheets',
    sublabel: 'Base operativa',
    type: 'output',
    color: '#2dd4bf',
    colorRgb: '45,212,191',
    icon: '\u{1F4CB}',
  },
  {
    id: 'crm',
    x: 810,
    y: 248,
    label: 'CRM',
    sublabel: 'Registro lead',
    type: 'output',
    color: '#34d399',
    colorRgb: '52,211,153',
    icon: '\u{1F4CA}',
  },
  {
    id: 'slack',
    x: 810,
    y: 364,
    label: 'Slack',
    sublabel: 'Aviso a equipo',
    type: 'output',
    color: '#22c55e',
    colorRgb: '34,197,94',
    icon: '\u{1F4E8}',
  },
]

const EDGES: PipelineEdge[] = [
  { id: 'wa-gw', from: 'wa', to: 'gateway' },
  { id: 'web-gw', from: 'web', to: 'gateway' },
  { id: 'gw-ia', from: 'gateway', to: 'ia' },
  { id: 'ia-sh', from: 'ia', to: 'sheets' },
  { id: 'sh-ia', from: 'sheets', to: 'ia' },
  { id: 'ia-crm', from: 'ia', to: 'crm' },
  { id: 'crm-ia', from: 'crm', to: 'ia' },
  { id: 'ia-sl', from: 'ia', to: 'slack' },
  { id: 'sl-ia', from: 'slack', to: 'ia' },
  { id: 'ia-gw', from: 'ia', to: 'gateway' },
  { id: 'gw-wa', from: 'gateway', to: 'wa' },
  { id: 'gw-web', from: 'gateway', to: 'web' },
]

const FLOW_SCENARIOS: FlowScenario[] = [
  {
    id: 'medico-wa',
    sourceNode: 'wa',
    query: 'Tienen turno para el martes?',
    firstResponse: 'Si, tengo martes 15:00 disponible. Lo reservo a tu nombre?',
    confirmation: 'Si, para Gonzalez.',
    finalResponse: 'Perfecto. Turno confirmado para Gonzalez, martes 15:00.',
    sheetsSummary: 'Sheets devuelve disponibilidad y reglas de agenda al IA Core.',
    crmSummary: 'IA Core guarda la confirmacion del cliente en CRM.',
    slackSummary: 'IA Core notifica en Slack que entro un lead confirmado.',
  },
  {
    id: 'inmobiliaria-web',
    sourceNode: 'web',
    query: 'Busco depto 2 ambientes, presupuesto 120k.',
    firstResponse: 'Tengo 3 opciones compatibles. Te muestro primero las mas recientes?',
    confirmation: 'Si, mostrame esas opciones.',
    finalResponse: 'Listo. Ya te mande el detalle y avise al asesor comercial.',
    sheetsSummary: 'Sheets devuelve propiedades filtradas por presupuesto y zona.',
    crmSummary: 'IA Core registra la confirmacion y preferencia en CRM.',
    slackSummary: 'Slack recibe alerta para seguimiento del lead calificado.',
  },
  {
    id: 'ecommerce-wa',
    sourceNode: 'wa',
    query: 'Quiero cambiar la direccion de entrega del pedido 4812.',
    firstResponse: 'Perfecto, encontre tu pedido. Te confirmo el cambio ahora mismo.',
    confirmation: 'Dale, confirmalo por favor.',
    finalResponse: 'Cambio aplicado. Tu pedido 4812 ya figura con la nueva direccion.',
    sheetsSummary: 'Sheets devuelve datos del pedido y politicas de modificacion.',
    crmSummary: 'La confirmacion del cliente queda guardada en CRM.',
    slackSummary: 'Slack notifica al equipo operativo sobre el cambio aplicado.',
  },
]

const EXPLAIN_STEPS = [
  {
    title: '1. Consulta cliente',
    description: 'El cliente escribe por WhatsApp o Web Chat.',
  },
  {
    title: '2. Gateway -> IA',
    description: 'Gateway enruta la consulta al IA Core.',
  },
  {
    title: '3. IA -> Sheets -> IA',
    description: 'IA consulta datos guardados y recibe la informacion.',
  },
  {
    title: '4. IA responde cliente',
    description: 'IA devuelve primera respuesta por el mismo canal.',
  },
  {
    title: '5. CRM + Slack',
    description: 'Con la confirmacion, IA guarda en CRM y avisa por Slack.',
  },
  {
    title: '6. Cierre final',
    description: 'IA confirma al cliente y termina el flujo completo.',
  },
]

const STAGE_SEGMENTS: number[][] = [[0], [1], [2, 3], [4, 5], [6, 7, 8, 9, 10], [11, 12, 13]]

const METRICS = [
  { value: '< 280ms', label: 'Latencia promedio de decision' },
  { value: '99.9%', label: 'Disponibilidad del sistema' },
  { value: '24/7', label: 'Ejecucion ininterrumpida' },
]

const NODE_BY_ID: Record<NodeId, PipelineNode> = NODES.reduce((acc, node) => {
  acc[node.id] = node
  return acc
}, {} as Record<NodeId, PipelineNode>)

const EDGE_BY_ID: Record<string, PipelineEdge> = EDGES.reduce((acc, edge) => {
  acc[edge.id] = edge
  return acc
}, {} as Record<string, PipelineEdge>)

function getEdgePath(edge: PipelineEdge): string {
  const from = NODE_BY_ID[edge.from]
  const to = NODE_BY_ID[edge.to]
  const midX = (from.x + to.x) / 2
  return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`
}

function getPointOnEdge(edgeId: string, progress: number): { x: number; y: number } {
  const edge = EDGE_BY_ID[edgeId]
  if (!edge) return { x: 0, y: 0 }

  const from = NODE_BY_ID[edge.from]
  const to = NODE_BY_ID[edge.to]
  const midX = (from.x + to.x) / 2
  const t = progress
  const mt = 1 - t

  return {
    x: mt * mt * mt * from.x + 3 * mt * mt * t * midX + 3 * mt * t * t * midX + t * t * t * to.x,
    y: mt * mt * mt * from.y + 3 * mt * mt * t * from.y + 3 * mt * t * t * to.y + t * t * t * to.y,
  }
}

function buildFlowSegments(sourceNode: 'wa' | 'web', scenario: FlowScenario): FlowSegment[] {
  const inboundEdge = sourceNode === 'wa' ? 'wa-gw' : 'web-gw'
  const outboundEdge = sourceNode === 'wa' ? 'gw-wa' : 'gw-web'
  const channelLabel = sourceNode === 'wa' ? 'WhatsApp' : 'Web Chat'

  return [
    {
      edgeId: inboundEdge,
      kind: 'entrada',
      message: `Consulta del cliente entra por ${channelLabel} y llega al Gateway.`,
    },
    {
      edgeId: 'gw-ia',
      kind: 'proceso',
      message: 'Gateway enruta la consulta al IA Core.',
    },
    {
      edgeId: 'ia-sh',
      kind: 'proceso',
      message: 'IA Core consulta la base de datos operativa en Sheets.',
    },
    {
      edgeId: 'sh-ia',
      kind: 'proceso',
      message: scenario.sheetsSummary,
      milestone: 'first_data_ready',
    },
    {
      edgeId: 'ia-gw',
      kind: 'proceso',
      message: 'IA Core arma la primera respuesta y la envia al Gateway.',
    },
    {
      edgeId: outboundEdge,
      kind: 'salida',
      message: `Gateway responde al cliente por ${channelLabel}.`,
      milestone: 'first_response_delivered',
    },
    {
      edgeId: inboundEdge,
      kind: 'entrada',
      message: `Cliente envia su confirmacion por ${channelLabel}.`,
      milestone: 'client_confirmation_sent',
    },
    {
      edgeId: 'gw-ia',
      kind: 'proceso',
      message: 'Gateway reenvia la confirmacion del cliente al IA Core.',
    },
    {
      edgeId: 'ia-crm',
      kind: 'proceso',
      message: scenario.crmSummary,
      milestone: 'crm_saved',
    },
    {
      edgeId: 'crm-ia',
      kind: 'proceso',
      message: 'CRM confirma que el registro se guardo correctamente.',
    },
    {
      edgeId: 'ia-sl',
      kind: 'proceso',
      message: scenario.slackSummary,
      milestone: 'slack_sent',
    },
    {
      edgeId: 'sl-ia',
      kind: 'proceso',
      message: 'Slack confirma entrega del aviso al equipo comercial.',
      milestone: 'slack_ack_received',
    },
    {
      edgeId: 'ia-gw',
      kind: 'proceso',
      message: 'IA Core prepara confirmacion final para el cliente.',
    },
    {
      edgeId: outboundEdge,
      kind: 'salida',
      message: `Gateway entrega confirmacion final por ${channelLabel}.`,
      milestone: 'final_response_delivered',
    },
  ]
}

function NodeShape({ node, isActive }: { node: PipelineNode; isActive: boolean }) {
  const radius = node.type === 'core' ? 36 : 28

  return (
    <g transform={`translate(${node.x}, ${node.y})`}>
      <circle r={radius + 19} fill={`rgba(${node.colorRgb}, ${isActive ? 0.16 : 0.04})`} />
      {node.type === 'core' ? (
        <circle
          r={radius + 10}
          fill="none"
          stroke={`rgba(${node.colorRgb}, ${isActive ? 0.42 : 0.14})`}
          strokeWidth="1"
          style={{ animation: 'ringPulse 2s ease-in-out infinite' }}
        />
      ) : null}
      {isActive ? (
        <circle
          r={radius + 7}
          fill="none"
          stroke={`rgba(${node.colorRgb}, 0.68)`}
          strokeWidth="2"
          style={{ transformOrigin: '0px 0px', animation: 'activePulse 0.7s ease-out forwards' }}
        />
      ) : null}
      <circle
        r={radius}
        fill={`rgba(${node.colorRgb}, ${isActive ? 0.2 : 0.08})`}
        stroke={`rgba(${node.colorRgb}, ${isActive ? 0.84 : 0.32})`}
        strokeWidth={isActive ? 2 : 1}
      />
      <text textAnchor="middle" dominantBaseline="central" fontSize={node.type === 'core' ? 20 : 16}>
        {node.icon}
      </text>
      <text
        y={radius + 16}
        textAnchor="middle"
        fontSize="11"
        fontWeight={isActive ? '700' : '500'}
        fill={isActive ? node.color : 'rgba(255,255,255,0.53)'}
      >
        {node.label}
      </text>
      <text y={radius + 29} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.26)">
        {node.sublabel}
      </text>
    </g>
  )
}

function computeModuleProgress(lastCompletedSegment: number, activePacket: DataPacket | null): number[] {
  return STAGE_SEGMENTS.map((segments) => {
    const stageStart = segments[0]
    const stageEnd = segments[segments.length - 1]

    if (lastCompletedSegment >= stageEnd) return 1

    const completedWithinStage = segments.filter((segmentIndex) => segmentIndex <= lastCompletedSegment).length
    let progress = completedWithinStage / segments.length

    if (activePacket && segments.includes(activePacket.segmentIndex)) {
      const positionInStage = segments.indexOf(activePacket.segmentIndex)
      progress = (positionInStage + activePacket.progress) / segments.length
    }

    if (lastCompletedSegment < stageStart - 1 && (!activePacket || activePacket.segmentIndex < stageStart)) {
      return 0
    }

    return Math.max(0, Math.min(1, progress))
  })
}

function ProcessDiagram({ flowStep, moduleProgress }: { flowStep: number; moduleProgress: number[] }) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const moduleOrder = [0, 1, 2, 3, 4, 5]

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
          gap: '12px',
          rowGap: '16px',
          alignItems: 'stretch',
          height: '100%',
        }}
      >
        {moduleOrder.map((stepIndex) => {
          const step = EXPLAIN_STEPS[stepIndex]
          const progress = moduleProgress[stepIndex] ?? 0
          const active = flowStep >= stepIndex || progress > 0
          const isHovered = hoveredStep === stepIndex

          return (
            <motion.div
              key={step.title}
              onHoverStart={() => setHoveredStep(stepIndex)}
              onHoverEnd={() => setHoveredStep((current) => (current === stepIndex ? null : current))}
              whileHover={{
                y: -3,
                scale: 1.01,
              }}
              transition={{
                duration: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                position: 'relative',
                zIndex: 1,
                background: isHovered
                  ? 'linear-gradient(140deg, rgba(9,20,24,0.92), rgba(7,10,18,0.96))'
                  : 'linear-gradient(145deg, rgba(8,14,22,0.82), rgba(7,11,20,0.74))',
                border:
                  active || isHovered ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.14)',
                borderRadius: '12px',
                minHeight: '104px',
                padding: '12px 12px 11px',
                boxShadow: isHovered
                  ? '0 14px 32px rgba(0,0,0,0.46), 0 0 26px rgba(16,185,129,0.24), inset 0 1px 0 rgba(255,255,255,0.12)'
                  : active
                    ? '0 0 0 1px rgba(16,185,129,0.14), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.08)',
                transition: 'all 220ms ease',
                overflow: 'hidden',
                backdropFilter: 'blur(12px) saturate(130%)',
                WebkitBackdropFilter: 'blur(12px) saturate(130%)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(90deg, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0.11) 55%, rgba(45,212,191,0.16) 100%)',
                  transform: `scaleX(${progress})`,
                  transformOrigin: 'left center',
                  transition: 'transform 120ms linear',
                  willChange: 'transform',
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(100deg, rgba(52,211,153,0) 12%, rgba(45,212,191,0.16) 50%, rgba(52,211,153,0) 88%)',
                  opacity: active || isHovered ? 0.65 : 0,
                  transition: 'opacity 260ms ease',
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(120% 120% at 0% 0%, rgba(16,185,129,0.22) 0%, transparent 64%), radial-gradient(110% 120% at 100% 100%, rgba(45,212,191,0.14) 0%, transparent 68%)',
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 200ms ease',
                  pointerEvents: 'none',
                }}
              />
              <p
                style={{
                  position: 'relative',
                  zIndex: 1,
                  margin: '0 0 4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: active || isHovered ? '#34d399' : 'rgba(255,255,255,0.74)',
                  textTransform: 'uppercase',
                }}
              >
                {step.title}
              </p>
              <p
                style={{
                  position: 'relative',
                  zIndex: 1,
                  margin: 0,
                  fontSize: '11px',
                  lineHeight: 1.45,
                  color: isHovered ? 'rgba(220,252,231,0.92)' : 'rgba(255,255,255,0.74)',
                  transition: 'color 200ms ease',
                }}
              >
                {step.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function PipelineIA() {
  const [packets, setPackets] = useState<DataPacket[]>([])
  const [activeNodes, setActiveNodes] = useState<Set<NodeId>>(new Set())
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null)
  const [eventLog, setEventLog] = useState<LogEvent[]>([])
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState(false)
  const [flowStep, setFlowStep] = useState(0)
  const [lastCompletedSegment, setLastCompletedSegment] = useState(-1)

  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const reduced = useReducedMotion()

  const packetRef = useRef<DataPacket | null>(null)
  const flowRunRef = useRef(0)
  const scenarioIndexRef = useRef(0)
  const segmentsRef = useRef<FlowSegment[]>([])
  const rafRef = useRef<number>(0)
  const timersRef = useRef<number[]>([])
  const eventCounterRef = useRef(0)
  const packetCounterRef = useRef(0)

  const currentScenario = FLOW_SCENARIOS[scenarioIndex]

  const show = useCallback(
    <T,>(props: T) => (isInView || reduced ? props : undefined),
    [isInView, reduced],
  )

  const clearScheduled = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  const schedule = useCallback((fn: () => void, ms: number) => {
    const timerId = window.setTimeout(fn, ms)
    timersRef.current.push(timerId)
  }, [])

  const addEvent = useCallback((kind: EventKind, nodeId: NodeId, message: string) => {
    eventCounterRef.current += 1
    const node = NODE_BY_ID[nodeId]

    const event: LogEvent = {
      id: eventCounterRef.current,
      kind,
      nodeLabel: node.label,
      message,
      timestamp: new Date().toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      color: node.color,
    }

    setEventLog((prev) => [event, ...prev].slice(0, 18))
  }, [])

  const activateNode = useCallback(
    (nodeId: NodeId, duration = 760) => {
      setActiveNodes((prev) => new Set([...prev, nodeId]))
      schedule(() => {
        setActiveNodes((prev) => {
          const next = new Set(prev)
          next.delete(nodeId)
          return next
        })
      }, duration)
    },
    [schedule],
  )

  const appendChat = useCallback((runId: number, message: ChatMessage) => {
    if (flowRunRef.current !== runId) return
    setChatMessages((prev) => [...prev, message])
  }, [])

  const spawnSegment = useCallback(
    (segmentIndex: number, runId: number, speed: number) => {
      if (flowRunRef.current !== runId) return

      const segment = segmentsRef.current[segmentIndex]
      if (!segment) return

      const edge = EDGE_BY_ID[segment.edgeId]
      const sourceNode = NODE_BY_ID[edge.from]

      packetCounterRef.current += 1
      const packet: DataPacket = {
        id: packetCounterRef.current,
        flowRun: runId,
        edgeId: segment.edgeId,
        segmentIndex,
        progress: 0,
        speed,
        color: sourceNode.color,
        colorRgb: sourceNode.colorRgb,
        size: sourceNode.type === 'core' ? 6.2 : 5.2,
      }

      packetRef.current = packet
      setPackets([packet])
      setActiveEdgeId(segment.edgeId)
      activateNode(edge.from, 620)
    },
    [activateNode],
  )

  const startCycle = useCallback(
    (nextScenarioIndex: number) => {
      clearScheduled()

      const normalizedIndex = (nextScenarioIndex + FLOW_SCENARIOS.length) % FLOW_SCENARIOS.length
      const scenario = FLOW_SCENARIOS[normalizedIndex]
      const runId = flowRunRef.current + 1
      const travelSpeed = reduced ? 0.014 : 0.0086

      flowRunRef.current = runId
      scenarioIndexRef.current = normalizedIndex
      setScenarioIndex(normalizedIndex)
      segmentsRef.current = buildFlowSegments(scenario.sourceNode, scenario)

      packetRef.current = null
      setPackets([])
      setActiveEdgeId(null)
      setTyping(false)
      setFlowStep(0)
      setLastCompletedSegment(-1)
      setChatMessages([{ from: 'client', text: scenario.query }])

      addEvent('entrada', scenario.sourceNode, `Consulta recibida: ${scenario.query}`)
      activateNode(scenario.sourceNode, 840)

      schedule(() => {
        spawnSegment(0, runId, travelSpeed)
      }, 640)
    },
    [activateNode, addEvent, clearScheduled, reduced, schedule, spawnSegment],
  )

  const handleMilestone = useCallback(
    (milestone: FlowMilestone | undefined, runId: number, scenario: FlowScenario) => {
      if (!milestone || flowRunRef.current !== runId) return

      switch (milestone) {
        case 'first_data_ready':
          setFlowStep(2)
          setTyping(true)
          break
        case 'first_response_delivered':
          setFlowStep(3)
          setTyping(false)
          appendChat(runId, { from: 'ai', text: scenario.firstResponse })
          schedule(() => {
            appendChat(runId, { from: 'client', text: scenario.confirmation })
          }, 900)
          break
        case 'client_confirmation_sent':
          setFlowStep(4)
          break
        case 'crm_saved':
          setFlowStep(4)
          break
        case 'slack_sent':
          setFlowStep(4)
          break
        case 'slack_ack_received':
          setFlowStep(4)
          setTyping(true)
          break
        case 'final_response_delivered':
          setFlowStep(5)
          setTyping(false)
          appendChat(runId, { from: 'ai', text: scenario.finalResponse })
          schedule(() => {
            if (flowRunRef.current !== runId) return
            startCycle(scenarioIndexRef.current + 1)
          }, 8600)
          break
        default:
          break
      }
    },
    [appendChat, schedule, startCycle],
  )

  const onSegmentComplete = useCallback(
    (packet: DataPacket) => {
      const runId = packet.flowRun
      if (flowRunRef.current !== runId) return

      const scenario = FLOW_SCENARIOS[scenarioIndexRef.current]
      const segment = segmentsRef.current[packet.segmentIndex]
      if (!segment) return

      const edge = EDGE_BY_ID[segment.edgeId]
      const targetNode = edge.to

      activateNode(targetNode)
      addEvent(segment.kind, targetNode, segment.message)
      setLastCompletedSegment(packet.segmentIndex)

      if (packet.segmentIndex === 1) {
        setFlowStep(1)
      }

      handleMilestone(segment.milestone, runId, scenario)

      const nextIndex = packet.segmentIndex + 1
      const hasNext = nextIndex < segmentsRef.current.length
      if (!hasNext) return

      const travelSpeed = reduced ? 0.014 : 0.0086
      let delayToNext = 430

      if (segment.milestone === 'first_response_delivered') {
        delayToNext = 1500
      }
      if (segment.milestone === 'slack_sent') {
        delayToNext = 1500
      }

      schedule(() => {
        spawnSegment(nextIndex, runId, travelSpeed)
      }, delayToNext)
    },
    [activateNode, addEvent, handleMilestone, reduced, schedule, spawnSegment],
  )

  useEffect(() => {
    if (!isInView) return

    const tick = () => {
      const currentPacket = packetRef.current

      if (currentPacket) {
        const speedFactor = reduced ? 1.25 : 1
        const nextProgress = currentPacket.progress + currentPacket.speed * speedFactor

        if (nextProgress >= 1) {
          packetRef.current = null
          setPackets([])
          setActiveEdgeId(null)
          onSegmentComplete(currentPacket)
        } else {
          const updatedPacket: DataPacket = {
            ...currentPacket,
            progress: nextProgress,
          }
          packetRef.current = updatedPacket
          setPackets([updatedPacket])
        }
      }

      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafRef.current)
  }, [isInView, onSegmentComplete, reduced])

  useEffect(() => {
    if (!isInView) return
    startCycle(scenarioIndexRef.current)

    return () => {
      clearScheduled()
      packetRef.current = null
      setPackets([])
      setTyping(false)
      setActiveEdgeId(null)
    }
  }, [clearScheduled, isInView, startCycle])

  const renderedMessages = useMemo(() => chatMessages.slice(-4), [chatMessages])
  const moduleProgress = useMemo(
    () => computeModuleProgress(lastCompletedSegment, packets[0] ?? null),
    [lastCompletedSegment, packets],
  )

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(74px,10vh,112px) clamp(20px,5vw,80px)',
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-5%',
          top: '30%',
          width: '340px',
          height: '280px',
          pointerEvents: 'none',
          zIndex: 0,
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          transform: 'translateX(-50%)',
          width: '520px',
          height: '350px',
          pointerEvents: 'none',
          zIndex: 0,
          background: 'radial-gradient(ellipse, rgba(52,211,153,0.08) 0%, transparent 55%)',
          filter: 'blur(84px)',
        }}
      />

      <div style={{ maxWidth: '1220px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -16 }}
          animate={show({ opacity: 1, y: 0 })}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 'clamp(26px,4vh,38px)' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399',
              padding: '6px 16px',
              borderRadius: '100px',
              fontSize: '11px',
              letterSpacing: '0.25em',
              fontWeight: 600,
              marginBottom: '18px',
              background: 'rgba(16,185,129,0.07)',
            }}
          >
            [ DATA FLOW EN TIEMPO REAL ]
          </div>
          <h2
            style={{
              fontSize: 'clamp(30px,4vw,52px)',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 12px 0',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Asi fluye la inteligencia.
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.64)', margin: 0 }}>
            Consulta cliente {'\u2192'} IA responde {'\u2192'} cliente confirma {'\u2192'} IA cierra + CRM + Slack.
          </p>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: '12px',
              letterSpacing: '0.01em',
              color: 'rgba(52,211,153,0.78)',
            }}
          >
            Visualizacion didactica: este flujo esta ralentizado para mostrar cada etapa; en produccion corre mas rapido.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-4 items-stretch">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
            <motion.div
              initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.97 }}
              animate={show({ opacity: 1, scale: 1 })}
              transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'linear-gradient(150deg, rgba(7,14,22,0.9), rgba(6,11,19,0.82))',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '22px',
                padding: 'clamp(12px,2.5vw,24px)',
                overflow: 'hidden',
                boxShadow: '0 20px 42px rgba(0,0,0,0.44), 0 0 34px rgba(16,185,129,0.1)',
                backdropFilter: 'blur(14px) saturate(140%)',
                WebkitBackdropFilter: 'blur(14px) saturate(140%)',
              }}
            >
              <svg viewBox="0 0 980 500" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <defs>
                  <filter id="pipeline-glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {EDGES.map((edge) => {
                  const path = getEdgePath(edge)
                  const active = activeEdgeId === edge.id
                  const edgeSource = NODE_BY_ID[edge.from]
                  return (
                    <g key={edge.id}>
                      <path d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.4" strokeDasharray="4 4" />
                      {active ? (
                        <path
                          d={path}
                          fill="none"
                          stroke={`rgba(${edgeSource.colorRgb}, 0.65)`}
                          strokeWidth="2.5"
                          strokeDasharray="8 6"
                          filter="url(#pipeline-glow)"
                        />
                      ) : null}
                    </g>
                  )
                })}

                {NODES.map((node) => (
                  <NodeShape key={node.id} node={node} isActive={activeNodes.has(node.id)} />
                ))}

                {packets.map((packet) => {
                  const pos = getPointOnEdge(packet.edgeId, packet.progress)
                  const tail = getPointOnEdge(packet.edgeId, Math.max(0, packet.progress - 0.09))
                  return (
                    <g key={packet.id}>
                      <line
                        x1={tail.x}
                        y1={tail.y}
                        x2={pos.x}
                        y2={pos.y}
                        stroke={`rgba(${packet.colorRgb}, 0.42)`}
                        strokeWidth={packet.size * 0.58}
                        strokeLinecap="round"
                      />
                      <circle cx={pos.x} cy={pos.y} r={packet.size * 2.5} fill={`rgba(${packet.colorRgb}, 0.16)`} />
                      <circle cx={pos.x} cy={pos.y} r={packet.size * 0.84} fill={packet.color} filter="url(#pipeline-glow)" />
                    </g>
                  )
                })}
              </svg>
            </motion.div>

            <div style={{ flex: 1, display: 'flex' }}>
              <ProcessDiagram flowStep={flowStep} moduleProgress={moduleProgress} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <motion.div
              initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : 20 }}
              animate={show({ opacity: 1, x: 0 })}
              transition={{ duration: 0.7, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'linear-gradient(155deg, rgba(7,14,22,0.9), rgba(6,11,18,0.84))',
                border: '1px solid rgba(16,185,129,0.34)',
                borderRadius: '20px',
                overflow: 'hidden',
                width: '100%',
                boxShadow: '0 0 54px rgba(16,185,129,0.14), 0 22px 48px rgba(0,0,0,0.44)',
                backdropFilter: 'blur(16px) saturate(145%)',
                WebkitBackdropFilter: 'blur(16px) saturate(145%)',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(16,185,129,0.18)',
                  borderBottom: '1px solid rgba(16,185,129,0.24)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #34d399, #10b981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  {'\u{1F916}'}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-1px',
                      bottom: '-1px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      border: '2px solid rgba(0,0,0,0.45)',
                      background: '#34d399',
                      boxShadow: '0 0 6px rgba(52,211,153,0.9)',
                      animation: 'blink 1.8s ease-in-out infinite',
                    }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'white', fontWeight: 700 }}>IA DevelOP</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#34d399' }}>{'\u2022'} En linea ahora</p>
                </div>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'rgba(167,243,208,0.9)',
                    border: '1px solid rgba(16,185,129,0.28)',
                    borderRadius: '100px',
                    padding: '3px 8px',
                    background: 'rgba(16,185,129,0.1)',
                  }}
                >
                  {currentScenario.sourceNode === 'wa' ? 'WhatsApp' : 'Web Chat'}
                </span>
              </div>

              <div
                style={{
                  height: '258px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  overflow: 'hidden',
                }}
              >
                {renderedMessages.map((message, index) => {
                  const isAI = message.from === 'ai'
                  return (
                    <motion.div
                      key={`${message.text}-${index}`}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        display: 'flex',
                        justifyContent: isAI ? 'flex-start' : 'flex-end',
                        alignItems: 'flex-end',
                        gap: '6px',
                      }}
                    >
                      {isAI ? (
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #34d399, #10b981)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            flexShrink: 0,
                          }}
                        >
                          {'\u{1F916}'}
                        </div>
                      ) : null}
                      <div
                        style={{
                          maxWidth: '82%',
                          borderRadius: isAI ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                          padding: '9px 11px',
                          background: isAI ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.16)',
                          border: isAI ? '1px solid rgba(16,185,129,0.34)' : '1px solid rgba(255,255,255,0.2)',
                          fontSize: '12px',
                          lineHeight: 1.45,
                          color: 'rgba(255,255,255,0.96)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                        }}
                      >
                        {message.text}
                      </div>
                    </motion.div>
                  )
                })}

                {typing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div
                      style={{
                        padding: '8px 11px',
                        borderRadius: '14px 14px 14px 4px',
                        background: 'rgba(16,185,129,0.22)',
                        border: '1px solid rgba(16,185,129,0.32)',
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                      }}
                    >
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '999px',
                            background: '#34d399',
                            animation: `typingDot 1.2s ${dot * 0.18}s ease-in-out infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  borderTop: '1px solid rgba(16,185,129,0.22)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  background: 'rgba(7,12,20,0.72)',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '100px',
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.52)',
                  }}
                >
                  Escribi tu mensaje...
                </div>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #34d399, #10b981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(1,8,6,0.9)',
                    fontWeight: 900,
                    fontSize: '13px',
                  }}
                >
                  {'\u2191'}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : 20 }}
              animate={show({ opacity: 1, x: 0 })}
              transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'linear-gradient(155deg, rgba(7,14,22,0.9), rgba(6,11,18,0.82))',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '16px',
                overflow: 'hidden',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(14px) saturate(135%)',
                WebkitBackdropFilter: 'blur(14px) saturate(135%)',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(10,16,24,0.7)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#34d399',
                    boxShadow: '0 0 8px rgba(52,211,153,0.9)',
                    animation: 'blink 1.4s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    color: 'rgba(255,255,255,0.78)',
                  }}
                >
                  EVENTOS EN VIVO
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.48)' }}>
                  {eventLog.length} eventos
                </span>
              </div>

              <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
                <AnimatePresence initial={false}>
                  {eventLog.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.14)',
                        background: 'rgba(9,14,22,0.78)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '9px',
                            letterSpacing: '0.08em',
                            fontWeight: 700,
                            color: event.color,
                            border: `1px solid ${event.color}40`,
                            background: `${event.color}1A`,
                            borderRadius: '100px',
                            padding: '2px 6px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {event.kind}
                        </span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.86)', fontWeight: 600 }}>{event.nodeLabel}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.42)', fontFamily: 'monospace' }}>
                          {event.timestamp}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.45 }}>{event.message}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {eventLog.length === 0 ? (
                  <div
                    style={{
                      padding: '28px 12px',
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.44)',
                      fontSize: '12px',
                    }}
                  >
                    Esperando primera ejecucion del flujo...
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'clamp(10px,2vw,16px)',
            marginTop: 'clamp(14px,2.6vh,24px)',
            flexWrap: 'wrap',
          }}
        >
          {METRICS.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 20 }}
              animate={show({ opacity: 1, y: 0 })}
              whileHover={
                reduced
                  ? undefined
                  : {
                      y: -2,
                      scale: 1.006,
                      borderColor: 'rgba(52,211,153,0.28)',
                      boxShadow: '0 16px 30px rgba(5,12,18,0.52), 0 0 26px rgba(52,211,153,0.14)',
                    }
              }
              transition={{
                delay: 0.44 + index * 0.08,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                y: { duration: 0.08, ease: 'linear' },
                scale: { duration: 0.08, ease: 'linear' },
                borderColor: { duration: 0.08, ease: 'linear' },
                boxShadow: { duration: 0.08, ease: 'linear' },
              }}
              style={{
                flex: '1 1 160px',
                background: 'linear-gradient(140deg, rgba(9,15,24,0.84) 0%, rgba(16,185,129,0.14) 100%)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: '12px',
                padding: '14px 12px',
                textAlign: 'center',
                transition: 'box-shadow 260ms ease, border-color 260ms ease, background 260ms ease',
                cursor: 'default',
                backdropFilter: 'blur(12px) saturate(130%)',
                WebkitBackdropFilter: 'blur(12px) saturate(130%)',
              }}
            >
              <p
                style={{
                  fontSize: 'clamp(22px,3vw,30px)',
                  fontWeight: 900,
                  color: '#34d399',
                  margin: '0 0 4px',
                  fontFamily: 'monospace',
                }}
              >
                {metric.value}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.62)', lineHeight: 1.35 }}>{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.42; }
          50% { transform: scale(1.12); opacity: 0.85; }
        }
        @keyframes activePulse {
          0% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.42; }
        }
        @keyframes typingDot {
          0%, 100% { opacity: 0.35; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </section>
  )
}
