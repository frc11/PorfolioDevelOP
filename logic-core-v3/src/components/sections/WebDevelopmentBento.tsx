"use client"
import React, { useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

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
                    El estándar <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">DevelOP.</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-zinc-400 max-w-2xl mx-auto text-lg"
                >
                    No ensamblamos plantillas. Codificamos experiencias desde cero enfocadas en rendimiento, retención de usuario y conversión visual.
                </motion.p>
            </div>

            {/* The Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[400px] md:auto-rows-[350px]">

                {/* --- Tarjeta 1: UI/UX (Ocupa 8 col en desktop) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="md:col-span-8 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden relative group flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] group-hover:bg-violet-500/20 transition-all duration-700 pointer-events-none" />

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-2">Diseño Centrado en el Usuario</h3>
                        <p className="text-zinc-400 text-sm max-w-sm">
                            Interfaces que guían instintivamente al usuario hacia la conversión mediante micro-interacciones diseñadas milimétricamente.
                        </p>
                    </div>

                    <div className="relative z-10 w-full h-full mt-8 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center pointer-events-none">
                        {/* Fake UI Button */}
                        <motion.div
                            className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm relative"
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
                    </div>
                </motion.div>

                {/* --- Tarjeta 2: Performance (Ocupa 4 col en desktop) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="md:col-span-4 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden relative group flex flex-col justify-between items-center text-center"
                >
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-cyan-500/10 blur-[60px] group-hover:bg-cyan-500/20 transition-all duration-700 pointer-events-none" />

                    <div className="relative z-10 w-full">
                        <h3 className="text-xl font-bold text-white mb-2">Lighthouse Premium</h3>
                        <p className="text-zinc-400 text-sm">
                            Optimizadas para cargar en milisegundos y dominar el SEO.
                        </p>
                    </div>

                    <div className="relative z-10 w-48 h-48 flex items-center justify-center" ref={countRef}>
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
                    </div>
                </motion.div>

                {/* --- Tarjeta 3: Motion & 3D (Ocupa 12 col en desktop horizontales) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="md:col-span-12 md:row-span-1 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 overflow-hidden relative group flex flex-col md:flex-row items-center justify-between"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none" />

                    <div className="relative z-10 md:w-1/2 mb-8 md:mb-0 md:pr-12 pointer-events-none">
                        <h3 className="text-3xl font-bold text-white mb-3">Animaciones Fluidas y WebGL</h3>
                        <p className="text-zinc-400 text-base leading-relaxed">
                            Integramos Framer Motion, GSAP y Three.js para crear experiencias inmersivas que no comprometen el rendimiento del dispositivo. La física al servicio del diseño.
                        </p>
                    </div>

                    <div className="relative z-10 md:w-1/2 h-full min-h-[200px] flex items-center justify-center w-full pointer-events-none perspective-1000">
                        {/* Interactive floating geometric layout */}
                        <div className="relative w-full max-w-sm h-full flex items-center justify-center transform-style-3d">

                            {/* Layer 1 - Background Card */}
                            <motion.div
                                className="absolute w-40 h-40 bg-gradient-to-br from-violet-600/40 to-cyan-600/40 rounded-2xl border border-white/10 backdrop-blur-md"
                                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                variants={{
                                    rest: { rotateX: 0, rotateY: 0, z: 0 },
                                    hover: { rotateX: 15, rotateY: -15, z: -50 }
                                }}
                                initial="rest"
                                animate="rest"
                                whileHover="hover"
                            />

                            {/* Layer 2 - Mid Card */}
                            <motion.div
                                className="absolute w-32 h-32 bg-white/10 rounded-full border border-white/20 backdrop-blur-xl shadow-xl flex items-center justify-center"
                                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                variants={{
                                    rest: { rotateX: 0, rotateY: 0, z: 20 },
                                    hover: { rotateX: 25, rotateY: -25, z: 50 }
                                }}
                                initial="rest"
                                animate="rest"
                                whileHover="hover"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-400 animate-pulse mix-blend-screen" />
                            </motion.div>

                            {/* Layer 3 - Foreground floating elements */}
                            <motion.div
                                className="absolute -right-4 -top-4 w-12 h-12 bg-fuchsia-500/80 rounded-lg rotate-12 backdrop-blur-md shadow-2xl border border-white/20"
                                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                variants={{
                                    rest: { rotateX: 0, rotateY: 0, z: 40, x: 0, y: 0 },
                                    hover: { rotateX: 45, rotateY: -45, z: 100, x: 30, y: -20 }
                                }}
                                initial="rest"
                                animate="rest"
                                whileHover="hover"
                            />
                        </div>
                        <style jsx>{`
                            .perspective-1000 { perspective: 1000px; }
                            .transform-style-3d { transform-style: preserve-3d; }
                            
                            /* Ensure elements inside the third card group react to hover on the parent */
                            .group:hover .absolute {
                                animation-play-state: paused;
                            }
                        `}</style>

                        {/* We use standard motion values mapped to the group hover instead of variants logic for simplicity in Tailwind/Framer */}
                        <div className="absolute inset-0 flex items-center justify-center perspective-1000">
                            <div className="relative w-64 h-64 transform-style-3d transition-transform duration-700 group-hover:-rotate-y-12 group-hover:rotate-x-12">
                                <div className="absolute inset-4 bg-gradient-to-br from-violet-600/30 to-cyan-600/30 rounded-3xl border border-white/10 backdrop-blur-sm -translate-z-10 transition-transform duration-700 group-hover:-translate-z-20 group-hover:translate-x-8 group-hover:translate-y-8" />
                                <div className="absolute inset-8 bg-white/10 rounded-full border border-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-center translate-z-10 transition-transform duration-700 group-hover:translate-z-30 group-hover:-translate-x-4 group-hover:-translate-y-4">
                                    <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-400 animate-spin-slow mix-blend-screen" />
                                </div>
                                <div className="absolute -right-4 -top-4 w-16 h-16 bg-fuchsia-500/80 rounded-xl rotate-12 backdrop-blur-md shadow-2xl border border-white/20 translate-z-20 transition-transform duration-700 group-hover:translate-z-40 group-hover:scale-125 group-hover:rotate-45" />
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    )
}
