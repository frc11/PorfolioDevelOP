'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface PipelineNode {
    id: string
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
    from: string
    to: string
    active: boolean
}

interface DataPacket {
    id: number
    edgeId: string
    progress: number
    speed: number
    color: string
    colorRgb: string
    size: number
}

interface LogEvent {
    id: number
    timestamp: string
    message: string
    type: 'entrada' | 'proceso' | 'salida'
    color: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const nodes: PipelineNode[] = [
    {
        id: 'wa', x: 80, y: 160,
        label: 'WhatsApp', sublabel: 'Mensaje entrante',
        type: 'input', color: '#25d366', colorRgb: '37,211,102', icon: '💬',
    },
    {
        id: 'web', x: 80, y: 340,
        label: 'Web Chat', sublabel: 'Consulta online',
        type: 'input', color: '#00e5ff', colorRgb: '0,229,255', icon: '🌐',
    },
    {
        id: 'gateway', x: 300, y: 250,
        label: 'Gateway', sublabel: 'Enrutamiento',
        type: 'core', color: '#7b2fff', colorRgb: '123,47,255', icon: '⚡',
    },
    {
        id: 'ia', x: 520, y: 250,
        label: 'IA Core', sublabel: 'Procesamiento',
        type: 'core', color: '#00ff88', colorRgb: '0,255,136', icon: '🧠',
    },
    {
        id: 'crm', x: 820, y: 120,
        label: 'CRM', sublabel: 'Registro cliente',
        type: 'output', color: '#f59e0b', colorRgb: '245,158,11', icon: '📊',
    },
    {
        id: 'email', x: 820, y: 230,
        label: 'Email', sublabel: 'Respuesta auto',
        type: 'output', color: '#ea4335', colorRgb: '234,67,53', icon: '📧',
    },
    {
        id: 'slack', x: 820, y: 340,
        label: 'Slack', sublabel: 'Notificación',
        type: 'output', color: '#e01e5a', colorRgb: '224,30,90', icon: '📨',
    },
    {
        id: 'sheets', x: 820, y: 450,
        label: 'Sheets', sublabel: 'Log de datos',
        type: 'output', color: '#34a853', colorRgb: '52,168,83', icon: '📋',
    },
]

const edges: PipelineEdge[] = [
    { id: 'wa-gw', from: 'wa', to: 'gateway', active: false },
    { id: 'web-gw', from: 'web', to: 'gateway', active: false },
    { id: 'gw-ia', from: 'gateway', to: 'ia', active: false },
    { id: 'ia-crm', from: 'ia', to: 'crm', active: false },
    { id: 'ia-em', from: 'ia', to: 'email', active: false },
    { id: 'ia-sl', from: 'ia', to: 'slack', active: false },
    { id: 'ia-sh', from: 'ia', to: 'sheets', active: false },
]

const routes = [
    ['wa-gw', 'gw-ia', 'ia-crm'],
    ['wa-gw', 'gw-ia', 'ia-em'],
    ['web-gw', 'gw-ia', 'ia-sl'],
    ['web-gw', 'gw-ia', 'ia-sh'],
    ['wa-gw', 'gw-ia', 'ia-sl'],
]

const outputMessages: Record<string, string[]> = {
    crm: ['Cliente registrado en CRM', 'Perfil actualizado', 'Lead calificado'],
    email: ['Email enviado al cliente', 'Respuesta automática OK', 'Confirmación enviada'],
    slack: ['Notificación a equipo', 'Alerta de nuevo lead', 'Resumen enviado'],
    sheets: ['Datos exportados', 'Fila agregada al log', 'Métricas actualizadas'],
}

const metrics = [
    { value: '< 200ms', label: 'Tiempo de respuesta promedio' },
    { value: '99.9%', label: 'Uptime garantizado' },
    { value: '∞', label: 'Mensajes procesados por día' },
]

// ─── PURE HELPERS ─────────────────────────────────────────────────────────────

function getPointOnEdge(edgeId: string, progress: number): { x: number; y: number } {
    const edge = edges.find(e => e.id === edgeId)
    if (!edge) return { x: 0, y: 0 }
    const from = nodes.find(n => n.id === edge.from)!
    const to = nodes.find(n => n.id === edge.to)!
    const mx = (from.x + to.x) / 2
    const t = progress, mt = 1 - t
    return {
        x: mt * mt * mt * from.x + 3 * mt * mt * t * mx + 3 * mt * t * t * mx + t * t * t * to.x,
        y: mt * mt * mt * from.y + 3 * mt * mt * t * from.y + 3 * mt * t * t * to.y + t * t * t * to.y,
    }
}

function getEdgeColor(edgeId: string): { color: string; colorRgb: string } {
    const fromId = edges.find(e => e.id === edgeId)?.from
    const node = nodes.find(n => n.id === fromId)
    return { color: node?.color ?? '#00ff88', colorRgb: node?.colorRgb ?? '0,255,136' }
}

// ─── NODE SHAPE ───────────────────────────────────────────────────────────────

function NodeShape({ node, isActive }: { node: PipelineNode; isActive: boolean }) {
    const R = node.type === 'core' ? 36 : 28
    return (
        <g transform={`translate(${node.x}, ${node.y})`}>
            <circle r={R + 20} fill={`rgba(${node.colorRgb}, ${isActive ? 0.15 : 0.04})`} />
            {isActive && (
                <circle
                    r={R + 6} fill="none"
                    stroke={`rgba(${node.colorRgb}, 0.6)`} strokeWidth="2"
                    style={{ transformOrigin: '0px 0px', animation: 'activePulse 0.6s ease-out forwards' }}
                />
            )}
            {node.type === 'core' && (
                <circle
                    r={R + 10} fill="none"
                    stroke={`rgba(${node.colorRgb}, ${isActive ? 0.4 : 0.12})`} strokeWidth="1"
                    style={{ animation: 'ringPulse 2s ease-in-out infinite' }}
                />
            )}
            <circle
                r={R}
                fill={`rgba(${node.colorRgb}, ${isActive ? 0.2 : 0.08})`}
                stroke={`rgba(${node.colorRgb}, ${isActive ? 0.8 : 0.3})`}
                strokeWidth={isActive ? 2 : 1}
                style={{ transition: 'fill 400ms, stroke 400ms' }}
            />
            <text textAnchor="middle" dominantBaseline="central"
                fontSize={node.type === 'core' ? 20 : 16} style={{ userSelect: 'none' }}>
                {node.icon}
            </text>
            <text y={R + 16} textAnchor="middle"
                fill={isActive ? node.color : 'rgba(255,255,255,0.5)'}
                fontSize="11" fontWeight={isActive ? '700' : '400'}
                style={{ transition: 'fill 400ms' }}>
                {node.label}
            </text>
            <text y={R + 29} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9">
                {node.sublabel}
            </text>
        </g>
    )
}

// ─── EDGE PATH ────────────────────────────────────────────────────────────────

function EdgePath({ edge, nodes: allNodes }: { edge: PipelineEdge; nodes: PipelineNode[] }) {
    const from = allNodes.find(n => n.id === edge.from)!
    const to = allNodes.find(n => n.id === edge.to)!
    const mx = (from.x + to.x) / 2
    const path = `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`
    return <path d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="4 4" />
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function PipelineIA() {
    const [packets, setPackets] = useState<DataPacket[]>([])
    const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set())
    const [eventLog, setEventLog] = useState<LogEvent[]>([])

    const packetsRef = useRef<DataPacket[]>([])
    const animRef = useRef<number>(0)
    const frameRef = useRef(0)

    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
    const reduced = useReducedMotion()

    // Generates a log entry for output nodes
    const addEvent = useCallback((nodeId: string) => {
        const messages = outputMessages[nodeId]
        if (!messages) return
        const node = nodes.find(n => n.id === nodeId)
        if (!node) return

        const newEvent: LogEvent = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toLocaleTimeString('es-AR', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            }),
            message: messages[Math.floor(Math.random() * messages.length)],
            type: 'salida',
            color: node.color,
        }
        setEventLog(prev => [newEvent, ...prev].slice(0, 8))
    }, [])

    // Activates a node for 800ms
    const activateNode = useCallback((nodeId: string) => {
        setActiveNodes(prev => new Set([...prev, nodeId]))
        setTimeout(() => {
            setActiveNodes(curr => {
                const next = new Set(curr)
                next.delete(nodeId)
                return next
            })
        }, 800)
    }, [])

    useEffect(() => {
        let routeIndex = 0
        let nextSpawnFrame = 60

        function tick() {
            frameRef.current++
            const f = frameRef.current

            // ── SPAWN ──────────────────────────────────────────
            if (f >= nextSpawnFrame) {
                const currentRoute = routes[routeIndex % routes.length]
                routeIndex++
                const edgeId = currentRoute[0]
                const { color, colorRgb } = getEdgeColor(edgeId)

                packetsRef.current = [...packetsRef.current, {
                    id: Date.now(),
                    edgeId,
                    progress: 0,
                    speed: 0.012 + Math.random() * 0.006,
                    color, colorRgb,
                    size: 5 + Math.random() * 3,
                }]
                nextSpawnFrame = f + 90
            }

            // ── MOVE ───────────────────────────────────────────
            const toRemove = new Set<number>()

            packetsRef.current = packetsRef.current.map(p => {
                const newProgress = p.progress + p.speed
                if (newProgress >= 1) {
                    toRemove.add(p.id)

                    const edge = edges.find(e => e.id === p.edgeId)
                    if (edge) {
                        activateNode(edge.to)
                        // fire addEvent only for output nodes
                        if (['crm', 'email', 'slack', 'sheets'].includes(edge.to)) {
                            addEvent(edge.to)
                        }
                    }

                    // Chain next segment
                    const routeForPacket = routes.find(r => r.includes(p.edgeId))
                    if (routeForPacket) {
                        const idx = routeForPacket.indexOf(p.edgeId)
                        if (idx < routeForPacket.length - 1) {
                            const nextEdgeId = routeForPacket[idx + 1]
                            const { color, colorRgb } = getEdgeColor(nextEdgeId)
                            packetsRef.current = [...packetsRef.current, {
                                id: Date.now() + Math.random(),
                                edgeId: nextEdgeId,
                                progress: 0,
                                speed: p.speed,
                                color, colorRgb,
                                size: p.size,
                            }]
                        }
                    }
                    return { ...p, progress: 1 }
                }
                return { ...p, progress: newProgress }
            }).filter(p => !toRemove.has(p.id))

            setPackets([...packetsRef.current])
            animRef.current = requestAnimationFrame(tick)
        }

        animRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(animRef.current)
    }, [activateNode, addEvent])

    // ─── Entry animation shorthands ─────────────────────────────────────────
    const show = (props: object) => (isInView || reduced) ? props : {}

    return (
        <section
            ref={sectionRef}
            style={{
                padding: 'clamp(80px,12vh,140px) clamp(20px,5vw,80px)',
                background: '#080810',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Atmospheric glows */}
            <div aria-hidden="true" style={{
                position: 'absolute', left: '-5%', top: '30%',
                width: '350px', height: '300px', pointerEvents: 'none', zIndex: 0,
                background: 'radial-gradient(ellipse, rgba(37,211,102,0.05) 0%, transparent 60%)',
                filter: 'blur(80px)',
            }} />
            <div aria-hidden="true" style={{
                position: 'absolute', left: '50%', top: '40%', transform: 'translateX(-50%)',
                width: '500px', height: '350px', pointerEvents: 'none', zIndex: 0,
                background: 'radial-gradient(ellipse, rgba(0,255,136,0.07) 0%, transparent 55%)',
                filter: 'blur(80px)',
            }} />
            <div aria-hidden="true" style={{
                position: 'absolute', right: '-5%', top: '30%',
                width: '350px', height: '350px', pointerEvents: 'none', zIndex: 0,
                background: 'radial-gradient(ellipse, rgba(123,47,255,0.05) 0%, transparent 60%)',
                filter: 'blur(80px)',
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -16 }}
                    animate={show({ opacity: 1, y: 0 })}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vh,64px)' }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88',
                        padding: '6px 16px', borderRadius: '100px', fontSize: '11px',
                        letterSpacing: '0.25em', fontWeight: 600, marginBottom: '24px',
                        background: 'rgba(0,255,136,0.06)',
                    }}>
                        [ DATA FLOW EN TIEMPO REAL ]
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(30px,4vw,52px)', fontWeight: 900, color: '#ffffff',
                        margin: '0 0 16px 0', lineHeight: 1.1, letterSpacing: '-0.02em',
                    }}>
                        Así fluye la inteligencia.
                    </h2>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        Cada mensaje de un cliente dispara una cadena de acciones automáticas.
                    </p>
                </motion.div>

                {/* SVG + Event Panel */}
                <div style={{
                    display: 'flex',
                    gap: 'clamp(16px,2vw,24px)',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                }}>
                    {/* SVG Pipeline */}
                    <motion.div
                        initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.97 }}
                        animate={show({ opacity: 1, scale: 1 })}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            flex: '1.4 1 0',
                            minWidth: '280px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '24px',
                            padding: 'clamp(12px,2.5vw,32px)',
                            overflow: 'hidden',
                        }}
                    >
                        <svg viewBox="0 0 1000 520" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                            <defs>
                                <filter id="pipeline-glow">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {edges.map(edge => (
                                <EdgePath key={edge.id} edge={edge} nodes={nodes} />
                            ))}

                            {nodes.map(node => (
                                <NodeShape key={node.id} node={node} isActive={activeNodes.has(node.id)} />
                            ))}

                            {packets.map(packet => {
                                const pos = getPointOnEdge(packet.edgeId, packet.progress)
                                const trailPos = getPointOnEdge(packet.edgeId, Math.max(0, packet.progress - 0.08))
                                return (
                                    <g key={packet.id}>
                                        <line
                                            x1={trailPos.x} y1={trailPos.y} x2={pos.x} y2={pos.y}
                                            stroke={`rgba(${packet.colorRgb}, 0.4)`}
                                            strokeWidth={packet.size * 0.5} strokeLinecap="round"
                                        />
                                        <circle cx={pos.x} cy={pos.y} r={packet.size * 2.5}
                                            fill={`rgba(${packet.colorRgb}, 0.15)`} />
                                        <circle cx={pos.x} cy={pos.y} r={packet.size * 0.8}
                                            fill={packet.color} filter="url(#pipeline-glow)" />
                                    </g>
                                )
                            })}
                        </svg>
                    </motion.div>

                    {/* Event log panel */}
                    <motion.div
                        initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : 20 }}
                        animate={show({ opacity: 1, x: 0 })}
                        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            flex: '1 1 0',
                            minWidth: '240px',
                            maxWidth: '320px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            maxHeight: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Panel header */}
                        <div style={{
                            padding: '14px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            background: 'rgba(255,255,255,0.02)',
                            flexShrink: 0,
                        }}>
                            <div style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: '#00ff88', flexShrink: 0,
                                boxShadow: '0 0 8px rgba(0,255,136,0.8)',
                                animation: 'blink 1.5s ease-in-out infinite',
                            }} />
                            <span style={{
                                fontSize: '11px', fontWeight: 600,
                                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em',
                            }}>
                                EVENTOS EN VIVO
                            </span>
                            <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
                                {eventLog.length} procesados
                            </span>
                        </div>

                        {/* Events list */}
                        <div style={{
                            padding: '8px', display: 'flex', flexDirection: 'column',
                            gap: '4px', overflowY: 'auto', flex: 1,
                        }}>
                            <AnimatePresence initial={false}>
                                {eventLog.map(event => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -16, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        style={{
                                            display: 'flex', gap: '10px', alignItems: 'flex-start',
                                            padding: '8px 10px', borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                        }}
                                    >
                                        <div style={{
                                            width: '3px', borderRadius: '100px',
                                            background: event.color, alignSelf: 'stretch',
                                            flexShrink: 0, minHeight: '32px',
                                            boxShadow: `0 0 6px ${event.color}`,
                                        }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                fontSize: '12px', fontWeight: 500,
                                                color: 'rgba(255,255,255,0.75)',
                                                margin: '0 0 2px',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                                {event.message}
                                            </p>
                                            <span style={{
                                                fontSize: '10px', color: 'rgba(255,255,255,0.2)',
                                                fontFamily: 'monospace',
                                            }}>
                                                {event.timestamp}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {eventLog.length === 0 && (
                                <div style={{
                                    padding: '32px 16px', textAlign: 'center',
                                    color: 'rgba(255,255,255,0.15)', fontSize: '12px',
                                }}>
                                    Esperando datos...
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Metrics row */}
                <div style={{
                    display: 'flex', gap: 'clamp(10px,2vw,16px)',
                    marginTop: 'clamp(20px,3vh,32px)',
                    flexWrap: 'wrap',
                }}>
                    {metrics.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 20 }}
                            animate={show({ opacity: 1, y: 0 })}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                flex: '1 1 140px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center',
                            }}
                        >
                            <p style={{
                                fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900,
                                color: '#00ff88', margin: '0 0 6px', fontFamily: 'monospace',
                            }}>
                                {m.value}
                            </p>
                            <p style={{
                                fontSize: '12px', color: 'rgba(255,255,255,0.35)',
                                margin: 0, lineHeight: 1.4,
                            }}>
                                {m.label}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>

            <style>{`
                @keyframes ringPulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.15); opacity: 0.8; }
                }
                @keyframes activePulse {
                    0%   { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(2);  opacity: 0; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50%      { opacity: 0.4; }
                }
            `}</style>
        </section>
    )
}
