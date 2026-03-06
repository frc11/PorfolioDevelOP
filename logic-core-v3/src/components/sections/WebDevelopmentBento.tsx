"use client"
import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView, useMotionValue, useMotionTemplate } from 'framer-motion'

// Reusable wrapper for Glassmorphism & Magnetic Border
const BentoCard = ({ className, children, delay = 0 }: { className: string, children: React.ReactNode, delay?: number }) => {
    const mouseX = useMotionValue(-1000)
    const mouseY = useMotionValue(-1000)

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const { left, top } = event.currentTarget.getBoundingClientRect()
        mouseX.set(event.clientX - left)
        mouseY.set(event.clientY - top)
    }

    function handleMouseLeave() {
        mouseX.set(-1000)
        mouseY.set(-1000)
    }

    // A large radial gradient mask following the mouse
    const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(6,182,212,0.1)] rounded-[2.5rem] hover:bg-white/[0.05] hover:shadow-[0_8px_32px_0_rgba(6,182,212,0.2)] transition-all duration-500 overflow-hidden relative group ${className}`}
        >
            {/* Dynamic magnetic border */}
            <motion.div
                className="absolute inset-0 pointer-events-none rounded-[2.5rem] z-50 transition-opacity duration-300"
                style={{ maskImage, WebkitMaskImage: maskImage }}
            >
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-cyan-400" />
            </motion.div>

            {children}
        </motion.div>
    )
}

export const WebDevelopmentBento = () => {

    // Counter Hook for Lighthouse
    const countRef = useRef(null)
    const isInView = useInView(countRef, { once: true, margin: "-50px" })
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (isInView) {
            let start = 0
            const end = 100
            const duration = 1500 // ms
            const incrementTime = duration / end

            const timer = setInterval(() => {
                start += 1
                setCount(start)
                if (start === end) clearInterval(timer)
            }, incrementTime)

            return () => clearInterval(timer)
        }
    }, [isInView])

    return (
        <section className="py-32 max-w-7xl mx-auto px-4 relative z-10 w-full">

            {/* Section Header */}
            <div className="mb-16 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
                >
                    El estándar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-500">DevelOP.</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-zinc-400 max-w-2xl mx-auto text-lg"
                >
                    No ensamblamos plantillas. Codificamos plataformas web desde cero enfocadas en rendimiento, posicionamiento SEO y conversión de ventas.
                </motion.p>
            </div>

            {/* The Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[400px] md:auto-rows-[350px]">

                {/* --- Tarjeta 1: Desarrollo a Medida (Ocupa 8 col en desktop) --- */}
                <BentoCard className="md:col-span-8 p-8 flex flex-col justify-between" delay={0}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-cyan-500/20 transition-all duration-700 pointer-events-none" />

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-2">Desarrollo a Medida (Next.js)</h3>
                        <p className="text-zinc-400 text-sm max-w-sm">
                            Adiós a las plantillas lentas y genéricas. Programamos tu web desde cero con la misma tecnología que usan las empresas más grandes del mundo, garantizando una carga instantánea que no frustra a tus clientes.
                        </p>
                    </div>

                    <motion.div
                        className="relative z-10 w-full h-full mt-8 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center pointer-events-none"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* Fake UI Button */}
                        <motion.div
                            className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm relative shadow-lg"
                            whileHover={{ scale: 1.05 }}
                        >
                            Completar Compra

                            {/* Animated Cursor */}
                            <motion.div
                                className="absolute pointer-events-none"
                                animate={{
                                    x: [150, 20, 10, 20, 150],
                                    y: [100, 10, 5, 10, 100],
                                    scale: [1, 1, 0.9, 1, 1] // click simulation
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    times: [0, 0.4, 0.5, 0.6, 1]
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] translate-x-2 translate-y-2">
                                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                                    <path d="M13 13l6 6" />
                                </svg>
                            </motion.div>
                        </motion.div>

                        {/* Decoration lines */}
                        <div className="absolute bottom-4 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="absolute -left-10 w-20 h-20 bg-white/5 rounded-full blur-xl" />
                    </motion.div>
                </BentoCard>

                {/* --- Tarjeta 2: Performance SEO (Ocupa 4 col en desktop) --- */}
                <BentoCard className="md:col-span-4 p-8 flex flex-col justify-between items-center text-center" delay={0.1}>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-cyan-500/10 blur-[60px] group-hover:bg-cyan-500/30 transition-all duration-700 pointer-events-none" />

                    <div className="relative z-10 w-full">
                        <h3 className="text-xl font-bold text-white mb-2">Dominio en Google (SEO)</h3>
                        <p className="text-zinc-400 text-sm">
                            De nada sirve una web linda si nadie la visita. Optimizamos el código y la estructura desde el día uno para que tu empresa aparezca en las primeras posiciones de búsqueda local.
                        </p>
                    </div>

                    <motion.div
                        className="relative z-10 w-48 h-48 flex items-center justify-center"
                        ref={countRef}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                        {/* Circular Progress SVG */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle
                                cx="96" cy="96" r="80"
                                className="stroke-white/5"
                                strokeWidth="8"
                                fill="none"
                            />
                            <motion.circle
                                cx="96" cy="96" r="80"
                                className="stroke-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 80}
                                initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                                animate={isInView ? { strokeDashoffset: 2 * Math.PI * 80 * (1 - count / 100) } : {}}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>

                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-black font-mono text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                {count}
                            </span>
                            <span className="text-xs font-bold text-cyan-400 mt-1 uppercase tracking-widest">
                                Score
                            </span>
                        </div>
                    </motion.div>
                </BentoCard>

                {/* --- Tarjeta 3: E-Commerce (Ocupa 4 col en desktop) --- */}
                <BentoCard className="md:col-span-4 p-8 flex flex-col justify-between items-start text-left" delay={0.15}>
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-cyan-500/10 blur-[60px] group-hover:bg-cyan-500/20 transition-all duration-700 pointer-events-none" />

                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none mb-6">
                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-cyan-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="relative z-10 w-full mt-auto">
                        <h3 className="text-xl font-bold text-white mb-2">E-Commerce y Catálogos</h3>
                        <p className="text-zinc-400 text-sm">
                            Sistemas de venta online propios. Desde carritos de compra integrados con pasarelas de pago, hasta catálogos corporativos que envían cotizaciones directas a tu WhatsApp.
                        </p>
                    </div>
                </BentoCard>

                {/* --- Tarjeta 4: UI/UX (Ocupa 8 col en desktop) --- */}
                <BentoCard className="md:col-span-8 md:row-span-1 p-8 flex flex-col md:flex-row items-center justify-between" delay={0.2}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] group-hover:bg-cyan-500/20 transition-all duration-700 pointer-events-none" />

                    <div className="relative z-10 md:w-1/2 mb-8 md:mb-0 md:pr-12 pointer-events-none">
                        <h3 className="text-3xl font-bold text-white mb-3">Diseño UI/UX y Retención</h3>
                        <p className="text-zinc-400 text-base leading-relaxed">
                            Interfaces limpias, modernas y fáciles de usar en cualquier celular. Hacemos que la experiencia de navegación sea tan fluida que el usuario confíe en la calidad de tu marca al instante.
                        </p>
                    </div>

                    <motion.div
                        className="relative z-10 md:w-1/2 h-full min-h-[200px] flex items-center justify-center w-full pointer-events-none perspective-1000"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    >
                        {/* Interactive floating geometric layout */}
                        <div className="relative w-full max-w-sm h-full flex items-center justify-center transform-style-3d group">

                            {/* Layer 1 - Background Card */}
                            <motion.div
                                className="absolute w-40 h-40 bg-gradient-to-br from-cyan-600/40 to-teal-600/40 rounded-2xl border border-white/10 backdrop-blur-md transition-transform duration-700 group-hover:rotate-x-12 group-hover:-rotate-y-12"
                            />

                            {/* Layer 2 - Mid Card */}
                            <motion.div
                                className="absolute w-32 h-32 bg-white/10 rounded-full border border-white/20 backdrop-blur-xl shadow-xl flex items-center justify-center transition-transform duration-700 translate-z-10 group-hover:translate-z-30 group-hover:-translate-x-4 group-hover:-translate-y-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-300 to-cyan-600 animate-pulse mix-blend-screen" />
                            </motion.div>

                            {/* Layer 3 - Foreground floating elements */}
                            <motion.div
                                className="absolute -right-4 -top-4 w-12 h-12 bg-cyan-500/80 rounded-lg rotate-12 backdrop-blur-md shadow-2xl border border-white/20 transition-transform duration-700 translate-z-20 group-hover:translate-z-40 group-hover:rotate-45 group-hover:scale-125"
                            />
                        </div>
                        <style jsx>{`
                            .perspective-1000 { perspective: 1000px; }
                            .transform-style-3d { transform-style: preserve-3d; }
                            .translate-z-10 { transform: translateZ(20px); }
                            .translate-z-20 { transform: translateZ(40px); }
                            .translate-z-30 { transform: translateZ(60px); }
                            .translate-z-40 { transform: translateZ(80px); }
                            .rotate-x-12 { transform: rotateX(15deg); }
                            .-rotate-y-12 { transform: rotateY(-15deg); }
                        `}</style>
                    </motion.div>
                </BentoCard>

            </div>
        </section>
    )
}
