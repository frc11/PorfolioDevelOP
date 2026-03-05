"use client"
import React from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { AIBentoGrid } from '@/components/sections/AIBentoGrid'
import { AITechMarquee } from '@/components/sections/AITechMarquee'
import { AILargeCta } from '@/components/sections/AILargeCta'

// Import the NeuralNetwork canvas dynamically with SSR disabled
const NeuralNetwork = dynamic(
    () => import('@/components/canvas/NeuralNetwork').then(mod => mod.default || mod.NeuralNetwork),
    { ssr: false }
)

export default function AIImplementationsPage() {
    return (
        <main className="relative min-h-screen w-full bg-void overflow-hidden text-white">
            {/* Background Canvas: Interactive Neural Network */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-auto">
                <NeuralNetwork renderCanvas={true} />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 max-w-5xl mx-auto">
                {/* Hero Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
                        Inteligencia Artificial
                    </span>
                    <br />
                    <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        Aplicada a Resultados.
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-zinc-400 font-light max-w-3xl mb-12"
                >
                    Implementamos Agentes Autónomos y LLMs que transforman tu operación, reducen costos y escalan sin límites.
                </motion.p>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="px-10 py-5 text-sm md:text-base font-bold uppercase tracking-widest group">
                        <span className="relative z-10 flex items-center gap-2">
                            Diagnóstico de IA Gratuito
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </MagneticCta>
                </motion.div>
            </div>

            {/* AI Bento Grid Section */}
            <AIBentoGrid />

            {/* Infinite Tech Marquee */}
            <AITechMarquee />

            {/* Huge CTA Final Section */}
            <AILargeCta />
        </main>
    )
}
