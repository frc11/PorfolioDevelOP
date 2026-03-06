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
import { SoftwareDevelopmentCta } from '@/components/sections/SoftwareDevelopmentCta'

const CHARS = "!<>-_\\/[]{}—=+*^?#________";
const scrambleText = (text: string, progress: number) => {
    return text.split('').map((char, index) => {
        if (char === ' ') return ' ';
        const charProgress = index / text.length;
        if (progress >= charProgress) {
            return char;
        }
        return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
};

export default function SoftwareDevelopmentPage() {
    const finalHeroText = "SOFTWARE_A_MEDIDA";
    const [scrambledHero, setScrambledHero] = useState("");

    useEffect(() => {
        let frame: number;
        const duration = 2000; // 2 seconds to fully decode
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setScrambledHero(scrambleText(finalHeroText, progress));

            if (progress < 1) {
                frame = requestAnimationFrame(animate);
            }
        };

        frame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frame);
    }, []);
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
                    className="mb-8 px-5 py-2 rounded-full border border-violet-500/30 bg-black/50 backdrop-blur-md flex items-center gap-3"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <span className="text-xs md:text-sm font-mono text-zinc-300 tracking-[0.2em] uppercase">
                        [ MODERNIZACIÓN_DIGITAL // ESTADO: ACTIVO ]
                    </span>
                </motion.div>

                {/* Hero Title with Tech/Glitch Effect */}
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter font-mono leading-[1.1] mb-6 flex flex-wrap justify-center text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    {scrambledHero || "___"}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-zinc-400 font-light max-w-3xl mb-12 mt-4 leading-relaxed"
                >
                    <span className="text-white font-medium">Modernizamos tu empresa.</span> Desarrollamos sistemas de gestión a medida e integraciones inteligentes que eliminan el papel, los errores en Excel y conectan toda tu operación en un solo lugar.
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

            {/* Final Heavy CTA */}
            <SoftwareDevelopmentCta />
        </main>
    )
}
