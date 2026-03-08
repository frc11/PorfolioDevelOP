"use client"
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'

// Dynamically import DotMatrix with No SSR to prevent hydration errors with Canvas
const DotMatrix = dynamic(
    () => import('@/components/canvas/DotMatrix').then((mod: any) => mod.DotMatrix),
    { ssr: false }
)
import { EnterpriseStandards } from '@/components/sections/EnterpriseStandards'
import { SoftwareArchitecture } from '@/components/sections/SoftwareArchitecture'
import { SoftwareDevelopmentCta } from '@/components/sections/SoftwareDevelopmentCta'

export default function SoftwareDevelopmentPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#050505] overflow-hidden text-white">
            {/* The Cinematic Background Video */}
            <div className="absolute inset-0 z-0 pointer-events-none fixed">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-20 mix-blend-luminosity grayscale-[80%]"
                    src="/business-owner-dashboard.mp4"
                />
            </div>

            {/* Subtle Gradient Overlays for readability over the video */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none" />

            {/* Main Content Overlay */}
            <div className="relative z-10 flex flex-col justify-center items-center text-center !h-screen px-4 max-w-5xl mx-auto">
                {/* Top Badge (Terminal Style) */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 px-5 py-2 rounded-full border border-violet-500/30 bg-black/50 backdrop-blur-md flex items-center gap-3"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <span className="text-xs md:text-sm font-mono text-zinc-300 tracking-[0.2em] uppercase">
                        [ MODERNIZACIÓN_DIGITAL // ESTADO: ACTIVO ]
                    </span>
                </motion.div>

                {/* Hero Title with Boutique Consulting Style */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.05]"
                >
                    Sistemas que dirigen tu empresa.
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light tracking-wide mb-12 mt-4 leading-relaxed"
                >
                    Modernizamos operaciones tradicionales. Reemplazamos Excels interminables y software obsoleto con paneles de control a medida. Escalabilidad global, soporte local.
                </motion.p>

                {/* Direct Action Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-colors">
                        <span className="relative z-10 flex items-center gap-3">
                            AUDITAR MIS PROCESOS
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

            {/* Tech Stack Marquee (Infinite Scroll) */}
            <div className="relative z-10 w-full py-10 mt-12 overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <div className="flex gap-8 px-4 items-center font-mono text-violet-500/40 tracking-[0.2em] text-sm md:text-base">
                        <span>NEXT.JS //</span>
                        <span>NODE.JS //</span>
                        <span>POSTGRESQL //</span>
                        <span>PYTHON //</span>
                        <span>C# .NET //</span>
                        <span>REACT //</span>
                        <span>TAILWIND //</span>
                        <span>TYPESCRIPT //</span>
                        <span>FASTAPI //</span>
                        <span>NEXT.JS //</span>
                        {/* Repeat for seamless loop */}
                        <span>NEXT.JS //</span>
                        <span>NODE.JS //</span>
                        <span>POSTGRESQL //</span>
                        <span>PYTHON //</span>
                        <span>C# .NET //</span>
                        <span>REACT //</span>
                        <span>TAILWIND //</span>
                        <span>TYPESCRIPT //</span>
                        <span>FASTAPI //</span>
                        <span>NEXT.JS //</span>
                    </div>
                </motion.div>
            </div>

            {/* Enterprise Standards Grid */}
            <EnterpriseStandards />

            {/* Secure Architecture Section */}
            <SoftwareArchitecture />

            {/* Final Heavy CTA */}
            <SoftwareDevelopmentCta />
        </main>
    )
}
