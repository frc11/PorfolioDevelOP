"use client"
import React from 'react'
import dynamic from 'next/dynamic'
import { motion, Variants } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { WebDevelopmentBento } from '@/components/sections/WebDevelopmentBento'
import { WebDevelopmentScrollReveal } from '@/components/sections/WebDevelopmentScrollReveal'
import { WebDevelopmentCta } from '@/components/sections/WebDevelopmentCta'

// Dynamically import Aurora with high priority but no SSR
const AuroraBackground = dynamic(
    () => import('@/components/canvas/AuroraBackground').then(mod => mod.AuroraBackground),
    { ssr: false }
)

// Variants for animated words
const wordVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 10 }
    }
}

export default function WebDevelopmentPage() {

    const textPart1 = "Tu web no debería ser un folleto.".split(" ")
    const textPart2 = "Debería ser una".split(" ")

    return (
        <main className="relative min-h-screen w-full bg-void overflow-hidden text-white">
            {/* The Aurora Background (Dark Premium Mode) */}
            <div className="absolute inset-0 z-0 opacity-60">
                {/* 
                    We are wrapping or using AuroraBackground here, but since the original 
                    AuroraBackground has hardcoded bg-zinc-50 and pastel colors, 
                    we will overlay CSS dark blend modes to force it into dark/premium mode.
                */}
                <div className="absolute inset-0 saturate-200 hue-rotate-15 mix-blend-screen opacity-50">
                    <AuroraBackground />
                </div>
                {/* Dark overlay to consume the white background from the original Aurora */}
                <div className="absolute inset-0 bg-void mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-transparent" />
                <div className="absolute inset-0 bg-void/50 backdrop-blur-[100px]" />

                {/* Additional floating dark neon blobs for that specific requirement */}
                <div className="absolute top-1/4 -left-1/4 w-[50vw] h-[50vw] bg-cyan-900/40 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-1/4 -right-1/4 w-[50vw] h-[50vw] bg-purple-900/40 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            {/* Main Content Overlay */}
            <div className="relative z-10 flex flex-col justify-center items-center text-center !h-screen px-4 max-w-5xl mx-auto">
                {/* Top Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 px-5 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                >
                    <span className="text-xs md:text-sm font-mono text-zinc-300 tracking-[0.2em] uppercase">
                        [ DIGITAL_EXPERIENCES ]
                    </span>
                </motion.div>

                {/* Hero Title with Kinetic Typography */}
                <motion.h1
                    initial="hidden"
                    animate="visible"
                    transition={{ staggerChildren: 0.08 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6 flex flex-col items-center gap-2"
                >
                    <div className="flex flex-wrap justify-center gap-[0.3em]">
                        {textPart1.map((word, i) => (
                            <motion.span key={`p1-${i}`} variants={wordVariants} className="inline-block text-white drop-shadow-md">
                                {word}
                            </motion.span>
                        ))}
                    </div>
                    <div className="flex flex-wrap justify-center gap-[0.3em] items-center">
                        {textPart2.map((word, i) => (
                            <motion.span key={`p2-${i}`} variants={wordVariants} className="inline-block text-white drop-shadow-md">
                                {word}
                            </motion.span>
                        ))}
                        <motion.span
                            variants={wordVariants}
                            className="inline-block relative"
                        >
                            <span className="italic font-serif font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 drop-shadow-[0_0_25px_rgba(192,132,252,0.5)]">
                                experiencia.
                            </span>
                            {/* Decorative sparkle */}
                            <motion.span
                                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ delay: 1.5, duration: 0.8, type: "spring" }}
                                className="absolute -top-6 -right-8 text-fuchsia-400 opacity-60 pointer-events-none"
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" />
                                </svg>
                            </motion.span>
                        </motion.span>
                    </div>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-zinc-400 font-light max-w-3xl mb-12 mt-4 leading-relaxed mix-blend-plus-lighter"
                >
                    Diseñamos y desarrollamos plataformas web inmersivas con <span className="text-cyan-400 font-medium">React</span> y <span className="text-white font-medium">Next.js</span> que capturan la atención y multiplican tus conversiones.
                </motion.p>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="px-10 py-5 text-sm md:text-base font-bold uppercase tracking-widest group bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/10 hover:border-violet-400 text-white transition-all duration-300 shadow-[0_0_30px_rgba(167,139,250,0.1)] hover:shadow-[0_0_40px_rgba(167,139,250,0.3)]">
                        <span className="relative z-10 flex items-center gap-3">
                            Crear mi Experiencia Web
                            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse group-hover:scale-150 transition-transform" />
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
                <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-violet-500 to-transparent animate-pulse" />
            </motion.div>

            {/* The Bento Grid Section */}
            <WebDevelopmentBento />

            {/* Scroll Reveal Phrase */}
            <WebDevelopmentScrollReveal />

            {/* Final Heavy CTA */}
            <WebDevelopmentCta />

        </main>
    )
}
