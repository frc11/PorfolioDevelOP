'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

type NodePoint = {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    brightness: number
    pulseSpeed: number
    pulseOffset: number
    isHub: boolean
    label?: string
}

type SignalParticle = {
    fromNode: number
    toNode: number
    progress: number
    speed: number
    color: 'green' | 'teal'
    size: number
}

function NeuralCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: -9999, y: -9999 })
    const animationRef = useRef<number>(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        const getSafeZone = () => {
            const zoneWidth = Math.min(canvas.width * 0.66, 820)
            const zoneHeight = Math.min(canvas.height * 0.5, 450)
            const left = (canvas.width - zoneWidth) / 2
            const top = (canvas.height - zoneHeight) / 2 - 8

            return {
                left,
                right: left + zoneWidth,
                top,
                bottom: top + zoneHeight,
            }
        }

        const isInsideSafeZone = (x: number, y: number, padding = 0) => {
            const zone = getSafeZone()
            return (
                x >= zone.left - padding &&
                x <= zone.right + padding &&
                y >= zone.top - padding &&
                y <= zone.bottom + padding
            )
        }

        const NODE_COUNT = 70
        const nodes: NodePoint[] = Array.from({ length: NODE_COUNT }, () => {
            let x = Math.random() * canvas.width
            let y = Math.random() * canvas.height
            let attempts = 0

            while (isInsideSafeZone(x, y, 28) && attempts < 30) {
                x = Math.random() * canvas.width
                y = Math.random() * canvas.height
                attempts++
            }

            return {
                x,
                y,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: 2 + Math.random() * 2.5,
                brightness: Math.random(),
                pulseSpeed: 0.005 + Math.random() * 0.015,
                pulseOffset: Math.random() * Math.PI * 2,
                isHub: false,
            }
        })

        const hubLabels = ['DATOS', 'HISTORIAL', 'VENTAS', 'TURNO', 'PRECIOS', 'STOCK']
        const hubPositions = [
            [0.2, 0.3],
            [0.5, 0.2],
            [0.8, 0.3],
            [0.2, 0.7],
            [0.5, 0.8],
            [0.8, 0.7],
        ]

        nodes.forEach((node, i) => {
            if (i < 6) {
                node.isHub = true
                node.label = hubLabels[i]
                node.radius = 5 + Math.random() * 3
                node.x = hubPositions[i][0] * canvas.width
                node.y = hubPositions[i][1] * canvas.height
                node.vx *= 0.3
                node.vy *= 0.3
            }
        })

        const particles: SignalParticle[] = []
        const MAX_PARTICLES = 25
        const CONNECTION_DIST = 160
        const MOUSE_REPEL_DIST = 140
        let frame = 0

        const draw = () => {
            frame++
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = 'rgba(3, 3, 8, 0.18)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            const mouse = mouseRef.current

            for (const node of nodes) {
                node.brightness = 0.4 + 0.6 * Math.abs(Math.sin(frame * node.pulseSpeed + node.pulseOffset))

                const dx = node.x - mouse.x
                const dy = node.y - mouse.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < MOUSE_REPEL_DIST && dist > 0) {
                    const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST
                    node.vx += (dx / dist) * force * 0.6
                    node.vy += (dy / dist) * force * 0.6
                }

                node.vx *= 0.98
                node.vy *= 0.98

                const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
                if (speed > 2) {
                    node.vx = (node.vx / speed) * 2
                    node.vy = (node.vy / speed) * 2
                }

                node.x += node.vx
                node.y += node.vy

                if (isInsideSafeZone(node.x, node.y, 36)) {
                    const zone = getSafeZone()
                    const centerX = (zone.left + zone.right) / 2
                    const centerY = (zone.top + zone.bottom) / 2
                    const offsetX = node.x - centerX
                    const offsetY = node.y - centerY

                    if (Math.abs(offsetX) > Math.abs(offsetY)) {
                        node.vx += (offsetX >= 0 ? 1 : -1) * 0.22
                    } else {
                        node.vy += (offsetY >= 0 ? 1 : -1) * 0.22
                    }
                }

                if (node.x < 0 || node.x > canvas.width) node.vx *= -1
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1
                node.x = Math.max(0, Math.min(canvas.width, node.x))
                node.y = Math.max(0, Math.min(canvas.height, node.y))
            }

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i]
                    const b = nodes[j]
                    const dx = a.x - b.x
                    const dy = a.y - b.y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const midX = (a.x + b.x) / 2
                    const midY = (a.y + b.y) / 2

                    if (dist < CONNECTION_DIST && !isInsideSafeZone(midX, midY, 24)) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.35
                        const brightness = (a.brightness + b.brightness) / 2
                        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
                        grad.addColorStop(0, `rgba(0, 255, 136, ${alpha * brightness})`)
                        grad.addColorStop(0.5, `rgba(15, 191, 115, ${alpha * brightness * 0.6})`)
                        grad.addColorStop(1, `rgba(0, 255, 136, ${alpha * brightness})`)

                        ctx.beginPath()
                        ctx.moveTo(a.x, a.y)
                        ctx.lineTo(b.x, b.y)
                        ctx.strokeStyle = grad
                        ctx.lineWidth = 0.8
                        ctx.stroke()
                    }
                }
            }

            for (const node of nodes) {
                const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 6)
                glow.addColorStop(0, `rgba(0, 255, 136, ${0.9 * node.brightness})`)
                glow.addColorStop(0.4, `rgba(0, 255, 136, ${0.3 * node.brightness})`)
                glow.addColorStop(1, 'rgba(0, 255, 136, 0)')

                ctx.beginPath()
                ctx.arc(node.x, node.y, node.radius * 6, 0, Math.PI * 2)
                ctx.fillStyle = glow
                ctx.fill()

                ctx.beginPath()
                ctx.arc(node.x, node.y, node.radius * node.brightness, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(200, 255, 230, ${0.8 * node.brightness})`
                ctx.fill()

                if (node.isHub) {
                    const ringRadius = node.radius * 10 * node.brightness
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2)
                    ctx.strokeStyle = `rgba(0, 255, 136, ${0.15 * node.brightness})`
                    ctx.lineWidth = 1
                    ctx.stroke()

                    ctx.beginPath()
                    ctx.arc(node.x, node.y, node.radius * 5, 0, Math.PI * 2)
                    ctx.strokeStyle = `rgba(0, 255, 136, ${0.3 * node.brightness})`
                    ctx.lineWidth = 1
                    ctx.stroke()

                    if (node.label) {
                        ctx.font = '9px monospace'
                        ctx.fillStyle = `rgba(0, 255, 136, ${0.5 * node.brightness})`
                        ctx.textAlign = 'center'
                        ctx.fillText(node.label, node.x, node.y + node.radius * 12)
                    }
                }
            }

            if (frame % 8 === 0 && particles.length < MAX_PARTICLES) {
                const i = Math.floor(Math.random() * nodes.length)
                const n = nodes[i]
                let best = -1
                let bestDist = CONNECTION_DIST

                nodes.forEach((m, j) => {
                    if (j === i) return
                    const d = Math.hypot(m.x - n.x, m.y - n.y)
                    if (d < bestDist) {
                        bestDist = d
                        best = j
                    }
                })

                if (best !== -1) {
                    particles.push({
                        fromNode: i,
                        toNode: best,
                        progress: 0,
                        speed: 0.008 + Math.random() * 0.012,
                        color: Math.random() > 0.3 ? 'green' : 'teal',
                        size: 1.5 + Math.random() * 1.5,
                    })
                }
            }

            for (let pi = particles.length - 1; pi >= 0; pi--) {
                const p = particles[pi]
                p.progress += p.speed

                if (p.progress >= 1) {
                    particles.splice(pi, 1)
                    continue
                }

                const from = nodes[p.fromNode]
                const to = nodes[p.toNode]
                const x = from.x + (to.x - from.x) * p.progress
                const y = from.y + (to.y - from.y) * p.progress

                const trailLen = 0.06
                const trailProgress = Math.max(0, p.progress - trailLen)
                const trailX = from.x + (to.x - from.x) * trailProgress
                const trailY = from.y + (to.y - from.y) * trailProgress

                const trailGrad = ctx.createLinearGradient(trailX, trailY, x, y)
                const col = p.color === 'green' ? '0, 255, 136' : '15, 191, 115'
                trailGrad.addColorStop(0, `rgba(${col}, 0)`)
                trailGrad.addColorStop(1, `rgba(${col}, 0.8)`)

                ctx.beginPath()
                ctx.moveTo(trailX, trailY)
                ctx.lineTo(x, y)
                ctx.strokeStyle = trailGrad
                ctx.lineWidth = p.size * 0.8
                ctx.stroke()

                const pGlow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4)
                pGlow.addColorStop(0, `rgba(${col}, 1)`)
                pGlow.addColorStop(0.4, `rgba(${col}, 0.4)`)
                pGlow.addColorStop(1, `rgba(${col}, 0)`)

                ctx.beginPath()
                ctx.arc(x, y, p.size * 4, 0, Math.PI * 2)
                ctx.fillStyle = pGlow
                ctx.fill()
            }

            const scanY1 = ((frame * 0.4) % (canvas.height + 200)) - 100
            const scanY2 = ((frame * 0.4 + canvas.height * 0.5) % (canvas.height + 200)) - 100

            for (const scanY of [scanY1, scanY2]) {
                const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2)
                scanGrad.addColorStop(0, 'rgba(0, 255, 136, 0)')
                scanGrad.addColorStop(0.5, 'rgba(0, 255, 136, 0.06)')
                scanGrad.addColorStop(1, 'rgba(0, 255, 136, 0)')
                ctx.fillStyle = scanGrad
                ctx.fillRect(0, scanY - 2, canvas.width, 4)
            }

            animationRef.current = requestAnimationFrame(draw)
        }

        draw()

        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }

        window.addEventListener('mousemove', onMouseMove)

        return () => {
            cancelAnimationFrame(animationRef.current)
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMouseMove)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
            }}
        />
    )
}

type StatItem = {
    value: string
    label: string
    pos: {
        left?: string
        right?: string
        top?: string
        bottom?: string
    }
}

type StatOffset = {
    x: number
    y: number
    vx: number
    vy: number
}

const HERO_STATS: StatItem[] = [
    { value: '+42%', label: 'LEADS CALIFICADOS', pos: { left: '-16%', top: '16%' } },
    { value: '24/7', label: 'SIN DESCANSO', pos: { left: '-8%', top: '36%' } },
    { value: '99.9%', label: 'UPTIME', pos: { left: '-15%', top: '58%' } },
    { value: '5x', label: 'ESCALA SIMULTANEA', pos: { right: '-16%', top: '16%' } },
    { value: '< 3s', label: 'TIEMPO DE RESPUESTA', pos: { right: '-8%', top: '36%' } },
    { value: '-80%', label: 'CONSULTAS MANUALES', pos: { right: '-15%', top: '55%' } },
]

export default function HeroIA() {
    const prefersReduced = useReducedMotion()
    const mouseRef = useRef({ x: -9999, y: -9999 })
    const statRefs = useRef<Array<HTMLDivElement | null>>([])
    const statCentersRef = useRef<Array<{ x: number; y: number }>>([])
    const statOffsetsRef = useRef<StatOffset[]>(HERO_STATS.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 })))
    const [statOffsets, setStatOffsets] = useState<Array<{ x: number; y: number }>>(
        HERO_STATS.map(() => ({ x: 0, y: 0 })),
    )

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }
        const onMouseLeave = () => {
            mouseRef.current = { x: -9999, y: -9999 }
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseout', onMouseLeave)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseout', onMouseLeave)
        }
    }, [])

    useEffect(() => {
        if (prefersReduced) {
            statOffsetsRef.current = HERO_STATS.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }))
            return
        }

        const REPEL_RADIUS = 260
        const REPEL_ACCEL = 2
        const RETURN_FORCE = 0.016
        const DAMPING = 0.88
        const MAX_SPEED = 18
        const MAX_OFFSET_X = 140
        const MAX_OFFSET_Y = 110

        const recalcCenters = () => {
            statCentersRef.current = HERO_STATS.map((_, index) => {
                const el = statRefs.current[index]
                if (!el) return { x: -9999, y: -9999 }
                const rect = el.getBoundingClientRect()
                return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
            })
        }

        recalcCenters()
        const bootFrames = [
            requestAnimationFrame(recalcCenters),
            window.setTimeout(recalcCenters, 260),
            window.setTimeout(recalcCenters, 900),
        ]
        window.addEventListener('resize', recalcCenters)

        let rafId = 0
        const animate = () => {
            const mouse = mouseRef.current
            let changed = false

            for (let i = 0; i < HERO_STATS.length; i++) {
                const center = statCentersRef.current[i]
                const offset = statOffsetsRef.current[i]
                if (!center || !offset) continue

                const currentX = center.x + offset.x
                const currentY = center.y + offset.y
                const dx = currentX - mouse.x
                const dy = currentY - mouse.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < REPEL_RADIUS && dist > 0.01) {
                    const force = (REPEL_RADIUS - dist) / REPEL_RADIUS
                    offset.vx += (dx / dist) * force * REPEL_ACCEL
                    offset.vy += (dy / dist) * force * REPEL_ACCEL
                }

                offset.vx += -offset.x * RETURN_FORCE
                offset.vy += -offset.y * RETURN_FORCE

                offset.vx *= DAMPING
                offset.vy *= DAMPING

                const speed = Math.sqrt(offset.vx * offset.vx + offset.vy * offset.vy)
                if (speed > MAX_SPEED) {
                    offset.vx = (offset.vx / speed) * MAX_SPEED
                    offset.vy = (offset.vy / speed) * MAX_SPEED
                }

                offset.x += offset.vx
                offset.y += offset.vy

                if (offset.x > MAX_OFFSET_X) {
                    offset.x = MAX_OFFSET_X
                    offset.vx *= -0.26
                } else if (offset.x < -MAX_OFFSET_X) {
                    offset.x = -MAX_OFFSET_X
                    offset.vx *= -0.26
                }

                if (offset.y > MAX_OFFSET_Y) {
                    offset.y = MAX_OFFSET_Y
                    offset.vy *= -0.26
                } else if (offset.y < -MAX_OFFSET_Y) {
                    offset.y = -MAX_OFFSET_Y
                    offset.vy *= -0.26
                }

                if (Math.abs(offset.vx) > 0.01 || Math.abs(offset.vy) > 0.01 || Math.abs(offset.x) > 0.01 || Math.abs(offset.y) > 0.01) {
                    changed = true
                }
            }

            if (changed) {
                setStatOffsets(statOffsetsRef.current.map((item) => ({ x: item.x, y: item.y })))
            }

            rafId = requestAnimationFrame(animate)
        }

        rafId = requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(rafId)
            cancelAnimationFrame(bootFrames[0] as number)
            window.clearTimeout(bootFrames[1] as number)
            window.clearTimeout(bootFrames[2] as number)
            window.removeEventListener('resize', recalcCenters)
        }
    }, [prefersReduced])

    const getReactiveCardStyle = (index: number) => {
        const baseStyle: React.CSSProperties = {
            transform: 'translate3d(0px, 0px, 0px) scale(1)',
            border: '1px solid rgba(0,255,136,0.15)',
            boxShadow: '0 0 0 rgba(0,255,136,0)',
            transition: 'transform 18ms linear, border-color 40ms linear, box-shadow 40ms linear, background 40ms linear',
            background: 'rgba(0,255,136,0.06)',
        }

        if (prefersReduced) return baseStyle

        const offset = statOffsets[index] ?? { x: 0, y: 0 }
        const intensity = Math.min(1, Math.hypot(offset.x, offset.y) / 72)

        return {
            ...baseStyle,
            transform: `translate3d(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px, 0) scale(${(1 + intensity * 0.08).toFixed(3)})`,
            border: `1px solid rgba(0,255,136,${(0.18 + intensity * 0.44).toFixed(3)})`,
            boxShadow: `0 0 0 1px rgba(0,255,136,${(0.1 + intensity * 0.2).toFixed(3)}), 0 0 ${Math.round(28 + intensity * 38)}px rgba(0,255,136,${(0.18 + intensity * 0.34).toFixed(3)})`,
            background: `rgba(0,255,136,${(0.06 + intensity * 0.16).toFixed(3)})`,
        }
    }

    return (
        <section
            className="hero-ia-root"
            style={{
                position: 'relative',
                width: '100%',
                height: '100svh',
                minHeight: '100svh',
                background: '#030308',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <NeuralCanvas />

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 5,
                        pointerEvents: 'none',
                        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(3,3,8,0.4) 65%, rgba(3,3,8,0.85) 100%)',
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        textAlign: 'center',
                        padding: '0 clamp(20px, 5vw, 60px)',
                        maxWidth: '900px',
                        pointerEvents: 'none',
                    }}
                >
                <div className="hidden sm:block">
                    {HERO_STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            ref={(el) => {
                                statRefs.current[i] = el
                            }}
                            initial={{ opacity: 0, y: i % 2 === 0 ? 15 : -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.0 + i * 0.1 }}
                            style={{
                                position: 'absolute',
                                pointerEvents: 'none',
                                ...stat.pos,
                            }}
                        >
                            <div
                                style={{
                                    borderRadius: '12px',
                                    padding: '10px 16px',
                                    minWidth: '132px',
                                    textAlign: 'center',
                                    ...getReactiveCardStyle(i),
                                }}
                            >
                                <motion.div
                                    animate={prefersReduced ? {} : { y: [0, -6, 0] }}
                                    transition={
                                        prefersReduced
                                            ? {}
                                            : {
                                                duration: 3 + (i % 3) * 0.55,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }
                                    }
                                >
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#00ff88', lineHeight: 1 }}>
                                        {stat.value}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '10px',
                                            color: 'rgba(255,255,255,0.42)',
                                            letterSpacing: '0.1em',
                                            marginTop: '3px',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {stat.label}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid rgba(0,255,136,0.3)',
                        borderRadius: '100px',
                        padding: '6px 16px',
                        marginBottom: '28px',
                        background: 'rgba(0,255,136,0.06)',
                        pointerEvents: 'auto',
                    }}
                >
                    <span
                        style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#00ff88',
                            boxShadow: '0 0 8px rgba(0,255,136,0.8)',
                            display: 'inline-block',
                        }}
                        className="animate-pulse-ia"
                    />
                    <span
                        style={{
                            fontSize: '11px',
                            letterSpacing: '0.25em',
                            color: '#00ff88',
                            fontWeight: 600,
                        }}
                    >
                        TU EMPRESA, EN PILOTO AUTOMATICO
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        fontSize: 'clamp(44px, 7.2vw, 102px)',
                        fontWeight: 900,
                        lineHeight: 0.97,
                        letterSpacing: '-0.032em',
                        margin: '0 0 clamp(18px,2.6vh,30px)',
                        pointerEvents: 'none',
                        filter: 'drop-shadow(0 10px 34px rgba(0, 0, 0, 0.5))',
                    }}
                >
                    <span
                        style={{
                            display: 'block',
                            color: '#f2fbff',
                            textShadow: '0 0 10px rgba(201, 255, 230, 0.08)',
                        }}
                    >
                        Tu empresa trabaja
                    </span>
                    <span style={{ display: 'block', marginTop: '0.04em' }}>
                        <span
                            style={{
                                background: prefersReduced
                                    ? 'none'
                                    : 'linear-gradient(135deg, #7deee0 0%, #34f5c5 36%, #10b981 68%, #7deee0 100%)',
                                backgroundSize: '300% 100%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: prefersReduced ? '#7deee0' : 'transparent',
                                backgroundClip: 'text',
                                filter: 'brightness(1.04) saturate(1.08)',
                                animation: prefersReduced ? 'none' : 'iaTitleShift 5s ease-in-out infinite, pulseTitleIA 3.4s ease-in-out infinite',
                                color: prefersReduced ? '#7deee0' : 'inherit',
                            }}
                        >
                            mientras{' '}
                        </span>
                        <span
                            style={{
                                background: prefersReduced
                                    ? 'none'
                                    : 'linear-gradient(135deg, #00f2a3 0%, #34f5c5 35%, #10b981 65%, #00f2a3 100%)',
                                backgroundSize: '300% 100%',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: prefersReduced ? '#00f2a3' : 'transparent',
                                backgroundClip: 'text',
                                filter: 'brightness(1.04) saturate(1.08)',
                                animation: prefersReduced ? 'none' : 'iaTitleShift 5s ease-in-out infinite, pulseTitleIA 3.4s ease-in-out infinite',
                                color: prefersReduced ? '#00f2a3' : 'inherit',
                            }}
                        >
                            dormis.
                        </span>
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        fontSize: 'clamp(15px, 1.8vw, 19px)',
                        color: 'rgba(255,255,255,0.45)',
                        lineHeight: 1.7,
                        maxWidth: '580px',
                        margin: '0 auto clamp(32px,5vh,52px)',
                    }}
                >
                    Sistemas de IA que responden consultas,
                    cotizan y cierran ventas por WhatsApp.
                    <br />
                    <span style={{ color: 'rgba(0,255,136,0.75)' }}>
                        Sin empleados extra. Sin horarios.
                        Sin que tengas que estar presente.
                    </span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.85 }}
                    style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        pointerEvents: 'auto',
                    }}
                >
                    <motion.a
                        href="#live-chat"
                        whileHover={prefersReduced ? {} : { scale: 1.04 }}
                        whileTap={prefersReduced ? {} : { scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                            color: '#030308',
                            fontWeight: 800,
                            fontSize: '14px',
                            letterSpacing: '0.06em',
                            padding: '14px 32px',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            boxShadow: '0 0 40px rgba(0,255,136,0.3), 0 8px 24px rgba(0,0,0,0.4)',
                            cursor: 'default',
                        }}
                    >
                        Proba la IA ahora {'->'}
                    </motion.a>
                </motion.div>
                </div>

                <style>{`
                    @keyframes pulse-ia {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.4; transform: scale(0.8); }
                    }
                    .animate-pulse-ia {
                        animation: pulse-ia 1.5s ease-in-out infinite;
                    }
                    @keyframes iaTitleShift {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }
                    @keyframes pulseTitleIA {
                        0%, 100% { filter: brightness(1) saturate(1.05); }
                        50% { filter: brightness(1.14) saturate(1.24); }
                    }
                `}</style>
        </section>
    )
}
