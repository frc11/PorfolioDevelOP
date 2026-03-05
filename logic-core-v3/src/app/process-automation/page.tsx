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

export default function ProcessAutomationPage() {
    return (
        <main className="relative min-h-screen w-full bg-void overflow-hidden text-white">
            {/* Interactive 3D Background */}
            <div className="absolute inset-0 z-0 opacity-35 pointer-events-auto">
                <Interactive3DNetwork renderCanvas={true} />
            </div>

            {/* Main Content Overlay */}
            <div className="relative z-10 flex flex-col justify-center items-center text-center !h-screen px-4 max-w-5xl mx-auto">
                {/* Hero Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6"
                >
                    <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        Conectamos todo tu software.
                    </span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                        Multiplicamos tu tiempo.
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-zinc-400 font-light max-w-4xl mb-12"
                >
                    Automatización de flujos de trabajo de grado empresarial con <span className="text-emerald-400 font-medium">n8n</span>. Eliminamos el error humano y las tareas repetitivas para que tu equipo se enfoque en crecer.
                </motion.p>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="px-10 py-5 text-sm md:text-base font-bold uppercase tracking-widest group">
                        <span className="relative z-10 flex items-center gap-2">
                            Auditar mis Procesos (Gratis)
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </MagneticCta>
                </motion.div>
            </div>

            {/* Scroll Indication (Optional, just for aesthetics) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
            >
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Descubrir</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-zinc-500 to-transparent" />
            </motion.div>

            {/* AI Data Pipeline Diagram Section */}
            <AIPipelineSection />

            {/* ROI Interactive Calculator */}
            <ROICalculator />

            {/* Metrics Grid */}
            <ProcessAutomationMetrics />

            {/* Massive Final CTA */}
            <ProcessAutomationCta />
        </main>
    )
}
