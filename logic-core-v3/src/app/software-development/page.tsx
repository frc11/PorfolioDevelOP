"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { EnterpriseStandards } from '@/components/sections/EnterpriseStandards'
import { SoftwareDevelopmentCta } from '@/components/sections/SoftwareDevelopmentCta'

export default function SoftwareDevelopmentPage() {
    return (
        <main className="relative min-h-screen w-full bg-void overflow-hidden text-white">
            {/* The Blueprint Background (Perspective Grid) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center [perspective:1000px] pointer-events-none opacity-40">
                <motion.div
                    initial={{ opacity: 0, rotateX: 60, translateY: -100 }}
                    animate={{ opacity: 1, rotateX: 70, translateY: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute w-[200vw] h-[200vh] origin-top"
                    style={{
                        backgroundSize: '100px 100px',
                        backgroundImage: `
                            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                        `,
                        boxShadow: 'inset 0 0 150px #030712'
                    }}
                >
                    {/* Animated moving lines imitating data/scans */}
                    <div className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent blur-[1px] -translate-x-1/2 animate-pulse" />
                    <div className="absolute top-0 bottom-0 right-1/4 w-[1px] bg-gradient-to-b from-transparent via-violet-500/50 to-transparent blur-[1px] translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
                </motion.div>

                {/* Fade to bottom gradient */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-void to-transparent z-10" />
                {/* Fade to top gradient */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-void to-transparent z-10" />
            </div>

            {/* Main Content Overlay */}
            <div className="relative z-10 flex flex-col justify-center items-center text-center !h-screen px-4 max-w-5xl mx-auto">
                {/* Top Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm"
                >
                    <span className="text-xs md:text-sm font-mono text-zinc-400 tracking-[0.2em] uppercase">
                        [ ENTERPRISE_GRADE_SOFTWARE ]
                    </span>
                </motion.div>

                {/* Hero Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6"
                >
                    <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        Construimos software que
                    </span>
                    <br />
                    <span className="relative inline-block mt-2">
                        <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                            no se rompe cuando escalas.
                        </span>
                        {/* Subrayado Brillante */}
                        <motion.span
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                            className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-1 md:h-2 bg-gradient-to-r from-blue-500/0 via-blue-500 to-indigo-500/0 rounded-full blur-[2px] origin-left"
                        />
                        <motion.span
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                            className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-[1px] md:h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent rounded-full origin-left opacity-80"
                        />
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-zinc-400 font-light max-w-3xl mb-12 mt-4 leading-relaxed"
                >
                    Desarrollo <span className="text-white font-medium">Full-Stack</span>, arquitecturas <span className="text-white font-medium">serverless</span> y bases de datos distribuidas. Tu visión, convertida en un ecosistema digital sólido.
                </motion.p>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="px-10 py-5 text-sm md:text-base font-bold uppercase tracking-widest group bg-white text-black hover:bg-zinc-200">
                        <span className="relative z-10 flex items-center gap-3">
                            Planificar Arquitectura
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </MagneticCta>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 pointer-events-none"
            >
                <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-zinc-500 font-mono">Arquitectura</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-zinc-500 to-transparent" />
            </motion.div>

            {/* Enterprise Standards Grid */}
            <EnterpriseStandards />

            {/* Final Heavy CTA */}
            <SoftwareDevelopmentCta />
        </main>
    )
}
