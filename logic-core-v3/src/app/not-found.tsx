'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'

function DotCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animId: number
        let time = 0

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        resize()
        window.addEventListener('resize', resize)

        const COLS = 40
        const ROWS = 28
        const DOT_R = 1.2

        function draw() {
            if (!ctx || !canvas) return
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const cellW = canvas.width / COLS
            const cellH = canvas.height / ROWS

            for (let c = 0; c < COLS; c++) {
                for (let r = 0; r < ROWS; r++) {
                    const cx = c * cellW + cellW / 2
                    const cy = r * cellH + cellH / 2

                    // Wave distortion
                    const wave = Math.sin(c * 0.3 + r * 0.2 + time * 0.8) * 0.5 + 0.5
                    const dist = Math.hypot(cx - canvas.width / 2, cy - canvas.height / 2)
                    const pulse = Math.sin(dist * 0.012 - time * 1.2) * 0.5 + 0.5

                    const alpha = wave * pulse * 0.3

                    ctx.beginPath()
                    ctx.arc(cx, cy, DOT_R, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(245,158,11,${alpha})`
                    ctx.fill()
                }
            }

            time += 0.016
            animId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    )
}

export default function NotFound() {
    return (
        <main className="relative min-h-screen bg-[#070709] text-white overflow-hidden flex items-center justify-center">
            {/* Canvas background */}
            <DotCanvas />

            {/* Ambient glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">

                {/* 404 number */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mb-6"
                >
                    <span
                        className="text-[clamp(120px,22vw,200px)] font-black leading-none select-none"
                        style={{
                            color: 'transparent',
                            WebkitTextStroke: '1px rgba(245,158,11,0.15)',
                            letterSpacing: '-0.05em',
                        }}
                    >
                        404
                    </span>
                    <motion.span
                        className="absolute inset-0 flex items-center justify-center text-[clamp(120px,22vw,200px)] font-black leading-none select-none"
                        style={{
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.6) 0%, rgba(249,115,22,0.4) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.05em',
                        }}
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        404
                    </motion.span>
                </motion.div>

                {/* Label */}
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500/50 mb-4"
                >
                    Página no encontrada
                </motion.p>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4"
                    style={{ letterSpacing: '-0.03em' }}
                >
                    Este rincón del internet<br />no existe todavía.
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="text-sm text-zinc-500 leading-relaxed mb-10 max-w-sm"
                >
                    La página que buscás se fue de viaje, fue renombrada, o nunca existió.
                    Igual, gracias por explorar.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row gap-3"
                >
                    <Link
                        href="/"
                        className="px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300"
                        style={{
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.1))',
                            border: '1px solid rgba(245,158,11,0.25)',
                            color: '#fbbf24',
                        }}
                    >
                        Volver al inicio
                    </Link>
                    <Link
                        href="/contact"
                        className="px-8 py-3.5 rounded-2xl font-semibold text-sm tracking-wide text-zinc-500 hover:text-zinc-200 transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        Contactarnos
                    </Link>
                </motion.div>

                {/* Decorative bottom line */}
                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-16 w-32 h-px"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)',
                    }}
                />
            </div>
        </main>
    )
}
