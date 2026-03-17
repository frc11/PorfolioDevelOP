'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface Node {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    baseRadius: number
    brightness: number
    pulseSpeed: number
    pulseOffset: number
    isHub: boolean
    label?: string
}

interface Particle {
    fromNode: number
    toNode: number
    progress: number
    speed: number
    color: 'green' | 'violet'
    size: number
}

function NeuralCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: -999, y: -999 })
    const animRef = useRef<number>(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // ── RESIZE ──────────────────────────────
        function resize() {
            if (!canvas) return
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        // ── NODOS ───────────────────────────────
        const NODE_COUNT = 70
        const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: 2 + Math.random() * 2.5,
            baseRadius: 2 + Math.random() * 2.5,
            brightness: Math.random(),
            pulseSpeed: 0.005 + Math.random() * 0.015,
            pulseOffset: Math.random() * Math.PI * 2,
            isHub: false,
        }))

        // ── HUBS ────────────────────────────────
        const HUB_LABELS = [
            'DATOS', 'HISTORIAL', 'VENTAS',
            'TURNO', 'PRECIOS', 'STOCK'
        ]

        nodes.forEach((n, i) => {
            if (i < 6) {
                n.isHub = true
                n.label = HUB_LABELS[i]
                n.baseRadius = 5 + Math.random() * 3
                n.radius = n.baseRadius
                const positions = [
                    [0.2, 0.3], [0.5, 0.2], [0.8, 0.3],
                    [0.2, 0.7], [0.5, 0.8], [0.8, 0.7]
                ]
                n.x = positions[i][0] * canvas.width
                n.y = positions[i][1] * canvas.height
                n.vx *= 0.3
                n.vy *= 0.3
            }
        })

        // ── PARTICULES ──────────────────────────
        const particles: Particle[] = []
        const MAX_PARTICLES = 25

        // ── RENDER LOOP ─────────────────────────
        let frame = 0

        function draw() {
            if (!canvas || !ctx) return
            frame++
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Fondo con trail effect
            ctx.fillStyle = 'rgba(3, 3, 8, 0.18)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            const mouse = mouseRef.current
            const CONNECTION_DIST = 160
            const MOUSE_REPEL_DIST = 140

            // ── MOVER NODOS ──────────────────────
            for (const n of nodes) {
                // Pulso de brillo
                n.brightness = 0.4 + 0.6 * Math.abs(Math.sin(frame * n.pulseSpeed + n.pulseOffset))

                // Repulsión del mouse
                const dx = n.x - mouse.x
                const dy = n.y - mouse.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < MOUSE_REPEL_DIST && dist > 0) {
                    const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST
                    n.vx += (dx / dist) * force * 0.6
                    n.vy += (dy / dist) * force * 0.6
                }

                // Fricción
                n.vx *= 0.98
                n.vy *= 0.98

                // Clamp velocidad
                const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
                if (speed > 2) {
                    n.vx = (n.vx / speed) * 2
                    n.vy = (n.vy / speed) * 2
                }

                // Mover
                n.x += n.vx
                n.y += n.vy

                // Bounce
                if (n.x < 0 || n.x > canvas.width) n.vx *= -1
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1
                n.x = Math.max(0, Math.min(canvas.width, n.x))
                n.y = Math.max(0, Math.min(canvas.height, n.y))
            }

            // ── DIBUJAR CONEXIONES ───────────────
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i], b = nodes[j]
                    const dx = a.x - b.x
                    const dy = a.y - b.y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.35
                        const brightness = (a.brightness + b.brightness) / 2

                        // Degradado en la línea
                        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
                        grad.addColorStop(0, `rgba(0, 255, 136, ${alpha * brightness})`)
                        grad.addColorStop(0.5, `rgba(123, 47, 255, ${alpha * brightness * 0.6})`)
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

            // ── DIBUJAR NODOS ────────────────────
            for (const n of nodes) {
                const glow = ctx.createRadialGradient(
                    n.x, n.y, 0,
                    n.x, n.y, n.radius * 6
                )
                glow.addColorStop(0, `rgba(0, 255, 136, ${0.9 * n.brightness})`)
                glow.addColorStop(0.4, `rgba(0, 255, 136, ${0.3 * n.brightness})`)
                glow.addColorStop(1, 'rgba(0, 255, 136, 0)')

                ctx.beginPath()
                ctx.arc(n.x, n.y, n.radius * 6, 0, Math.PI * 2)
                ctx.fillStyle = glow
                ctx.fill()

                // Núcleo del nodo
                ctx.beginPath()
                ctx.arc(n.x, n.y, n.radius * n.brightness, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(200, 255, 230, ${0.8 * n.brightness})`
                ctx.fill()

                if (n.isHub) {
                    // Anillo exterior pulsante
                    const ringRadius = n.radius * 10 * n.brightness
                    ctx.beginPath()
                    ctx.arc(n.x, n.y, ringRadius, 0, Math.PI * 2)
                    ctx.strokeStyle = `rgba(0, 255, 136, ${0.15 * n.brightness})`
                    ctx.lineWidth = 1
                    ctx.stroke()

                    // Anillo medio
                    ctx.beginPath()
                    ctx.arc(n.x, n.y, n.radius * 5, 0, Math.PI * 2)
                    ctx.strokeStyle = `rgba(0, 255, 136, ${0.3 * n.brightness})`
                    ctx.lineWidth = 1
                    ctx.stroke()

                    // Label del hub
                    if (n.label) {
                        ctx.font = '9px monospace'
                        ctx.fillStyle = `rgba(0, 255, 136, ${0.5 * n.brightness})`
                        ctx.textAlign = 'center'
                        ctx.fillText(n.label, n.x, n.y + n.radius * 12)
                    }
                }
            }

            // ── SPAWNER DE PARTÍCULAS ────────────
            if (frame % 8 === 0 && particles.length < MAX_PARTICLES) {
                const i = Math.floor(Math.random() * nodes.length)
                const n = nodes[i]
                let best = -1, bestDist = CONNECTION_DIST
                nodes.forEach((m, j) => {
                    if (j === i) return
                    const d = Math.hypot(m.x - n.x, m.y - n.y)
                    if (d < bestDist) { bestDist = d; best = j }
                })
                if (best !== -1) {
                    particles.push({
                        fromNode: i,
                        toNode: best,
                        progress: 0,
                        speed: 0.008 + Math.random() * 0.012,
                        color: Math.random() > 0.3 ? 'green' : 'violet',
                        size: 1.5 + Math.random() * 1.5,
                    })
                }
            }

            // ── DIBUJAR Y MOVER PARTÍCULAS ───────
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

                // Estela detrás de la partícula
                const trailLen = 0.06
                const trailProgress = Math.max(0, p.progress - trailLen)
                const trailX = from.x + (to.x - from.x) * trailProgress
                const trailY = from.y + (to.y - from.y) * trailProgress

                const trailGrad = ctx.createLinearGradient(trailX, trailY, x, y)
                const col = p.color === 'green' ? '0, 255, 136' : '123, 47, 255'
                trailGrad.addColorStop(0, `rgba(${col}, 0)`)
                trailGrad.addColorStop(1, `rgba(${col}, 0.8)`)

                ctx.beginPath()
                ctx.moveTo(trailX, trailY)
                ctx.lineTo(x, y)
                ctx.strokeStyle = trailGrad
                ctx.lineWidth = p.size * 0.8
                ctx.stroke()

                // Punto brillante (cabeza)
                const pGlow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4)
                pGlow.addColorStop(0, `rgba(${col}, 1)`)
                pGlow.addColorStop(0.4, `rgba(${col}, 0.4)`)
                pGlow.addColorStop(1, `rgba(${col}, 0)`)

                ctx.beginPath()
                ctx.arc(x, y, p.size * 4, 0, Math.PI * 2)
                ctx.fillStyle = pGlow
                ctx.fill()
            }

            // ── LÍNEAS DE ESCÁNER ────────────────
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

            animRef.current = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(animRef.current)
            window.removeEventListener('resize', resize)
        }
    }, [])

    // Mouse tracking en la sección padre
    useEffect(() => {
        function onMouseMove(e: MouseEvent) {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }
        window.addEventListener('mousemove', onMouseMove)
        return () => window.removeEventListener('mousemove', onMouseMove)
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

export default function HeroIA() {
    const prefersReduced = useReducedMotion()


    const stats = [
        { value: '24/7', label: 'sin descanso', icon: '🌙', pos: { left: '2%', top: '35%' } },
        { value: '< 3s', label: 'tiempo de respuesta', icon: '⚡', pos: { right: '2%', top: '35%' } },
        { value: '−80%', label: 'consultas manuales', icon: '📉', pos: { left: '50%', bottom: '18%', transform: 'translateX(-50%)' } },
    ]

    return (
        <section style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            minHeight: '700px',
            background: '#030308',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <NeuralCanvas />

            {/* VIGNETTE OVERLAY */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 5,
                    pointerEvents: 'none',
                    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(3,3,8,0.4) 65%, rgba(3,3,8,0.85) 100%)',
                }}
            />

            <div style={{
                position: 'relative',
                zIndex: 10,
                textAlign: 'center',
                padding: '0 clamp(20px, 5vw, 60px)',
                maxWidth: '900px',
                pointerEvents: 'none',
            }}>
                {/* ── ESTADÍSTICAS FLOTANTES (Solo Desktop) ── */}
                <div className="hidden sm:block">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: Math.random() > 0.5 ? 15 : -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.0 + i * 0.1 }}
                            style={{
                                position: 'absolute',
                                pointerEvents: 'none',
                                background: 'rgba(0,255,136,0.06)',
                                border: '1px solid rgba(0,255,136,0.15)',
                                borderRadius: '12px',
                                padding: '10px 16px',
                                textAlign: 'center',
                                ...stat.pos
                            }}
                        >
                            <motion.div
                                animate={prefersReduced ? {} : { y: [0, -6, 0] }}
                                transition={prefersReduced ? {} : {
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#00ff88', lineHeight: 1 }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginTop: '2px', textTransform: 'uppercase' }}>
                                    {stat.label}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* ── BadgeIA ── */}
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
                    <span style={{
                        width: '6px', height: '6px',
                        borderRadius: '50%',
                        background: '#00ff88',
                        boxShadow: '0 0 8px rgba(0,255,136,0.8)',
                        display: 'inline-block',
                    }} className="animate-pulse-ia" />
                    <span style={{
                        fontSize: '11px',
                        letterSpacing: '0.25em',
                        color: '#00ff88',
                        fontWeight: 600,
                    }}>
                        TU EMPRESA, EN PILOTO AUTOMÁTICO
                    </span>
                </motion.div>

                {/* ── TitleIA ── */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        fontSize: 'clamp(44px, 7.5vw, 108px)',
                        fontWeight: 900,
                        lineHeight: 1.0,
                        letterSpacing: '-0.03em',
                        margin: '0 0 clamp(16px,2.5vh,28px)',
                        pointerEvents: 'none',
                    }}
                >
                    <span style={{ color: 'white', display: 'block' }}>
                        Tu empresa trabaja
                    </span>
                    <span style={{ display: 'block' }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #00ff88 0%, #7b2fff 50%, #00ff88 100%)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: prefersReduced ? 'none' : 'gradientShift 4s ease-in-out infinite',
                        }}>
                            mientras dormís.
                        </span>
                    </span>
                </motion.h1>

                {/* ── SubtitleIA ── */}
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

                {/* ── CTAHero ── */}
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
                        }}
                    >
                        Probá la IA ahora →
                    </motion.a>

                    <motion.a
                        href="#casos"
                        whileHover={prefersReduced ? {} : {
                            scale: 1.02,
                            borderColor: 'rgba(0,255,136,0.5)',
                            color: '#00ff88',
                        }}
                        whileTap={prefersReduced ? {} : { scale: 0.97 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.6)',
                            fontWeight: 600,
                            fontSize: '14px',
                            padding: '14px 28px',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            transition: 'all 200ms',
                        }}
                    >
                        Ver casos de uso
                    </motion.a>
                </motion.div>
            </div>

            {/* ── ScrollCue ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                style={{
                    position: 'absolute',
                    bottom: 'clamp(24px,4vh,40px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 10,
                    pointerEvents: 'none',
                }}
            >
                <span style={{
                    fontSize: '9px',
                    letterSpacing: '0.35em',
                    color: 'rgba(0,255,136,0.35)',
                    textTransform: 'uppercase',
                }}>
                    explorar
                </span>
                {[0, 1].map(i => (
                    <div key={i} style={{
                        width: '8px', height: '8px',
                        borderRight: '1px solid rgba(0,255,136,0.4)',
                        borderBottom: '1px solid rgba(0,255,136,0.4)',
                        transform: 'rotate(45deg)',
                        animation: `chevronIA 1.4s ease-in-out ${i * 0.18}s infinite`,
                    }} />
                ))}
            </motion.div>

            <style>{`
                @keyframes pulse-ia {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.8); }
                }
                .animate-pulse-ia {
                    animation: pulse-ia 1.5s ease-in-out infinite;
                }
                @keyframes chevronIA {
                    0%, 100% { opacity: 0.3; transform: rotate(45deg) translateY(0); }
                    50% { opacity: 1; transform: rotate(45deg) translateY(4px); }
                }
                @keyframes liquidMetalIA {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </section>
    )
}
