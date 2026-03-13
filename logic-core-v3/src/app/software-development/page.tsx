"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { EnterpriseStandards } from '@/components/sections/EnterpriseStandards'
import { SoftwareArchitecture } from '@/components/sections/SoftwareArchitecture'
import { SoftwareDevelopmentCta } from '@/components/sections/SoftwareDevelopmentCta'
import HeroSoftware from '@/components/software/HeroSoftware'
import PainBentoSoftware from '@/components/software/PainBentoSoftware'
import DiagnosticoSoftware from '@/components/software/DiagnosticoSoftware'

export default function SoftwareDevelopmentPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#06060f] overflow-hidden text-white">
            {/* The Cinematic Hero Section */}
            <HeroSoftware />

            {/* Del Caos al Orden Section */}
            <PainBentoSoftware />

            {/* Personalized Diagnostic Tool */}
            <DiagnosticoSoftware />

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
