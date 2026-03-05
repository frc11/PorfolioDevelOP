"use client"
import React from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'

// Dynamically import DotMatrix with No SSR to prevent hydration errors with Canvas
const DotMatrix = dynamic(
    () => import('@/components/canvas/DotMatrix').then((mod: any) => mod.DotMatrix),
    { ssr: false }
)
import { EnterpriseStandards } from '@/components/sections/EnterpriseStandards'
import { SoftwareDevelopmentCta } from '@/components/sections/SoftwareDevelopmentCta'

export default function SoftwareDevelopmentPage() {
    return (
        <main className="relative min-h-screen w-full bg-void overflow-hidden text-white">
            {/* The 3D Interactive Background */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none fixed">
                <DotMatrix />
            </div>

            {/* Subtle Gradient Overlays for readability */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-void via-void/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-void to-transparent z-10 pointer-events-none" />

            {/* Main Content Overlay */}
            <div className="relative z-10 flex flex-col justify-center items-center text-center !h-screen px-4 max-w-5xl mx-auto">
                {/* Top Badge (Terminal Style) */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-md flex items-center gap-3"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-xs md:text-sm font-mono text-zinc-300 tracking-[0.2em] uppercase">
                        [ STATUS: ONLINE // ENTERPRISE_GRADE ]
                    </span>
                </motion.div>

                {/* Hero Title with Tech/Glitch Effect */}
                <motion.h1
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.08, delayChildren: 0.3 }
                        }
                    }}
                    initial="hidden"
                    animate="visible"
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter font-mono leading-[1.1] mb-6 flex flex-wrap justify-center"
                >
                    {"SYSTEM_ENGINEERING".split('').map((letter, index) => (
                        <motion.span
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: -40, filter: 'blur(10px)', color: '#a855f7', scale: 1.5 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    color: '#ffffff',
                                    scale: 1,
                                    transition: { type: "spring", stiffness: 300, damping: 15 }
                                }
                            }}
                            className="inline-block relative drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            {letter}
                            {/* Micro glitch ghost letter behind */}
                            <motion.span
                                className="absolute inset-0 text-cyan-400 mix-blend-screen opacity-0"
                                animate={{ opacity: [0, 0.5, 0], x: [-2, 2, -2] }}
                                transition={{ duration: 0.2, delay: 2 + index * 0.1, repeat: Infinity, repeatDelay: 5 }}
                            >
                                {letter}
                            </motion.span>
                        </motion.span>
                    ))}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-zinc-400 font-light max-w-3xl mb-12 mt-4 leading-relaxed"
                >
                    <span className="text-white font-medium">Construimos software que no se rompe cuando escalas.</span> Desarrollo Full-Stack, arquitecturas serverless y ecosistemas digitales sólidos.
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

            {/* Tech Stack Marquee */}
            <div className="relative z-10 w-full py-16 overflow-hidden border-y border-white/5 bg-void/50 mt-10 md:mt-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(3,7,18,1)_0%,transparent_10%,transparent_90%,rgba(3,7,18,1)_100%)] z-10 pointer-events-none" />
                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                    {/* Render text twice for seamless infinite loop */}
                    {[1, 2].map((i) => (
                        <div key={i} className="flex gap-8 px-4 items-center font-mono text-zinc-600 font-bold tracking-[0.3em] text-sm md:text-base lg:text-lg">
                            <span>AWS // </span>
                            <span>DOCKER // </span>
                            <span>KUBERNETES // </span>
                            <span>POSTGRESQL // </span>
                            <span>PYTHON // </span>
                            <span>NODE.JS // </span>
                            <span>GRAPHQL // </span>
                            <span>REDIS // </span>
                            <span>GO // </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Enterprise Standards Grid */}
            <EnterpriseStandards />

            {/* Final Heavy CTA */}
            <SoftwareDevelopmentCta />
        </main>
    )
}
