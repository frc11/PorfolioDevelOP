"use client"
import React from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { AIBentoGrid } from '@/components/sections/AIBentoGrid'
import { AITechMarquee } from '@/components/sections/AITechMarquee'
import { AILargeCta } from '@/components/sections/AILargeCta'
import { TypewriterText } from '@/components/ui/TypewriterText'

// Import the NeuralNetwork canvas dynamically with SSR disabled
const NeuralNetwork = dynamic(
    () => import('@/components/canvas/NeuralNetwork').then(mod => mod.default || mod.NeuralNetwork),
    { ssr: false }
)

function AiDesktop() {
    return (
        <div className="hidden md:flex flex-col relative z-10 w-full min-h-screen">
            {/* Desktop Content Overlay */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-6xl mx-auto w-full pt-32 pb-20">
                {/* Top Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-950/30 backdrop-blur-md flex items-center gap-3"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    <span className="text-sm font-mono text-emerald-300 tracking-[0.2em] uppercase">
                        [ QUANTUM_CORE // ONLINE ]
                    </span>
                </motion.div>

                {/* Hero Title */}
                <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6 font-mono flex items-center justify-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                        className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)] flex"
                    >
                        {"COGNITIVE_SYSTEMS".split("").map((char, index) => (
                            <motion.span
                                key={index}
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1 }
                                }}
                            >
                                {char}
                            </motion.span>
                        ))}
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block text-emerald-400 font-light ml-2"
                        >
                            _
                        </motion.span>
                    </motion.div>
                </h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                    className="text-xl lg:text-2xl text-zinc-300 font-light max-w-3xl mb-12 leading-relaxed"
                >
                    <span className="text-white font-medium">Arquitecturas Cuánticas para el Desarrollo de IA.</span> Implementamos Agentes Autónomos y Modelos Inteligentes que transforman tu operación.
                </motion.p>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="px-12 py-5 text-base font-bold uppercase tracking-widest group bg-emerald-500 text-white hover:bg-emerald-400 border-none shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                        <span className="relative z-10 flex items-center gap-3">
                            Iniciar Integración Neuronal
                            <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-500/70 font-mono">Expandir Subsistemas</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-emerald-500/50 to-transparent" />
            </motion.div>
        </div>
    )
}

function AiMobile() {
    return (
        <div className="flex md:hidden flex-col relative z-10 w-full min-h-screen">
            {/* Mobile Content Overlay */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full pt-24 pb-16">
                {/* Top Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-6 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/30 flex items-center gap-2 backdrop-blur-sm"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-xs font-mono text-emerald-300 tracking-[0.1em] uppercase">
                        [ QUANTUM_CORE ]
                    </span>
                </motion.div>

                {/* Hero Title */}
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[1.2] mb-5 font-mono min-h-[120px] flex items-center justify-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                        className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex"
                    >
                        {"COGNITIVE_SYSTEMS".split("").map((char, index) => (
                            <motion.span
                                key={index}
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1 }
                                }}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </motion.span>
                        ))}
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block text-emerald-400 font-light ml-1"
                        >
                            _
                        </motion.span>
                    </motion.div>
                </h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                    className="text-lg text-zinc-300 font-light mb-10 leading-relaxed"
                >
                    Agentes Autónomos y LLMs que escalan tu negocio.
                </motion.p>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
                    className="w-full max-w-xs"
                >
                    <MagneticCta variant="primary" className="w-full px-6 py-4 text-sm font-bold uppercase tracking-widest bg-emerald-500 text-white shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                        <span className="flex items-center justify-center gap-2">
                            Evaluar IA
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </MagneticCta>
                </motion.div>
            </div>
        </div>
    )
}

export default function AIImplementationsPage() {
    return (
        <main className="relative min-h-screen w-full bg-void overflow-hidden text-white">
            {/* Ambient Background: Interactive Neural Network */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-auto">
                <NeuralNetwork renderCanvas={true} />
            </div>

            {/* Deep Neural Overlay for Depth */}
            <div className="fixed inset-0 bg-gradient-to-b from-emerald-950/80 via-zinc-950/90 to-zinc-950 pointer-events-none z-0" />

            {/* Subtle Gradient Overlays for readability and Quantum Brain aesthetic */}
            <div className="fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-void via-emerald-900/10 to-transparent z-10 pointer-events-none" />
            <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-void to-transparent z-10 pointer-events-none" />

            {/* Split Views based on viewport */}
            <AiDesktop />
            <AiMobile />

            {/* Shared Content */}
            <div className="relative z-10 w-full bg-void">
                <AIBentoGrid />
                <AITechMarquee />
                <AILargeCta />
            </div>
        </main>
    )
}
