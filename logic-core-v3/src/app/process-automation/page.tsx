"use client"
import React from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { AIPipelineSection } from '@/components/sections/AIPipelineSection'
import { ROICalculator } from '@/components/sections/ROICalculator'
import { ProcessAutomationMetrics } from '@/components/sections/ProcessAutomationMetrics'
import { ProcessAutomationCta } from '@/components/sections/ProcessAutomationCta'

// Dynamically import Interactive3DNetwork with SSR disabled
const Interactive3DNetwork = dynamic(
    () => import('@/components/canvas/Interactive3DNetwork').then(mod => mod.default || mod.Interactive3DNetwork),
    { ssr: false }
)

const AMBER_PALETTE = ['#f59e0b', '#d97706', '#f97316', '#fb923c', '#ea580c'];

function AutomationDesktop() {
    return (
        <div className="hidden md:flex flex-col relative z-10 w-full min-h-screen">
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto w-full pt-32 pb-20">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 px-5 py-2 rounded-full border border-amber-500/20 bg-amber-950/30 backdrop-blur-md flex items-center gap-3"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                    <span className="text-sm font-mono text-amber-500 tracking-[0.2em] uppercase">
                        [ N8N_ENGINE // ACTIVE_WORKFLOWS: 1,024 ]
                    </span>
                </motion.div>

                {/* Hero Title */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6 font-mono bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                >
                    WORKFLOW_AUTOMATION
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-xl lg:text-2xl text-zinc-300 font-light max-w-3xl mb-12 leading-relaxed"
                >
                    Conectamos tus herramientas. Eliminamos el trabajo manual. Multiplicamos tu rentabilidad.
                </motion.p>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="px-12 py-5 text-base font-bold uppercase tracking-widest group bg-amber-600 text-white hover:bg-amber-500 border-none shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                        <span className="relative z-10 flex items-center gap-3">
                            Auditar mis Procesos
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
                <span className="text-xs uppercase tracking-[0.3em] text-amber-500/70 font-mono">Expandir Infraestructura</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-amber-500/50 to-transparent" />
            </motion.div>
        </div>
    )
}

function AutomationMobile() {
    return (
        <div className="flex md:hidden flex-col relative z-10 w-full min-h-screen">
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full pt-24 pb-16">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-6 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-950/30 backdrop-blur-sm flex items-center gap-2"
                >
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    <span className="text-xs font-mono text-amber-500 tracking-[0.1em] uppercase">
                        [ N8N_ENGINE // ACTIVE_WORKFLOWS: 1,024 ]
                    </span>
                </motion.div>

                {/* Hero Title */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-4xl sm:text-5xl font-black tracking-tighter leading-[1.2] mb-5 font-mono bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500"
                >
                    WORKFLOW_<br />AUTOMATION
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg text-zinc-300 font-light mb-10 leading-relaxed"
                >
                    Conectamos tus herramientas. Eliminamos el trabajo manual. Multiplicamos tu rentabilidad.
                </motion.p>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="w-full max-w-xs"
                >
                    <MagneticCta variant="primary" className="w-full px-6 py-4 text-sm font-bold uppercase tracking-widest bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <span className="flex items-center justify-center gap-2">
                            Auditar Procesos
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

export default function ProcessAutomationPage() {
    return (
        <main className="relative min-h-screen w-full bg-zinc-950 overflow-hidden text-white">
            {/* Interactive 3D Background */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <Interactive3DNetwork renderCanvas={true} showOverlayText={false} palette={AMBER_PALETTE} />
            </div>

            {/* Gradient Overlay */}
            <div className="fixed inset-0 bg-gradient-to-b from-orange-950/20 via-zinc-950/80 to-zinc-950 z-0 pointer-events-none" />

            {/* Split Views based on viewport */}
            <AutomationDesktop />
            <AutomationMobile />

            {/* Shared Content */}
            <div className="relative z-10 w-full">
                <AIPipelineSection />
                <ROICalculator />
                <ProcessAutomationMetrics />
                <ProcessAutomationCta />
            </div>
        </main>
    )
}
