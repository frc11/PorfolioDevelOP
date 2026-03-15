"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { EnterpriseStandards } from '@/components/sections/EnterpriseStandards'
import { SoftwareArchitecture } from '@/components/sections/SoftwareArchitecture'
import { SoftwareDevelopmentCta } from '@/components/sections/SoftwareDevelopmentCta'
import HeroSoftware from '@/components/software/HeroSoftware'
import PainBentoSoftware from '@/components/software/PainBentoSoftware'
import DiagnosticoSoftware from '@/components/software/DiagnosticoSoftware'
import ProcesoSoftware from '@/components/software/ProcesoSoftware'
import ArchitectureSoftware from '@/components/software/ArchitectureSoftware'
import PipelineSoftware from '@/components/software/PipelineSoftware'
import ShowcaseSoftware from '@/components/software/ShowcaseSoftware'
import StatementSoftware from '@/components/software/StatementSoftware'
import SocialProofSoftware from '@/components/software/SocialProofSoftware'
import VaultSoftware from '@/components/software/VaultSoftware'

export default function SoftwareDevelopmentPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#06060f] overflow-x-clip overflow-y-visible text-white">
            {/* The Cinematic Hero Section */}
            <HeroSoftware />

            {/* Del Caos al Orden Section */}
            <PainBentoSoftware />

            {/* Personalized Diagnostic Tool */}
            <DiagnosticoSoftware />

            {/* Detailed Workflow Process */}
            <ProcesoSoftware />

            {/* System Architecture Capabilities */}
            <ArchitectureSoftware />

            {/* Business Flow Pipeline */}
            <PipelineSoftware />

            {/* Success Cases / Projects Showcase */}
            <ShowcaseSoftware />

            {/* Strategic Emotional Statement */}
            <StatementSoftware />

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

            {/* Social Proof (NOA Testimonials) */}
            <SocialProofSoftware />

            {/* Final Conversion Vault (FAQ & ROI) */}
            <VaultSoftware />

            {/* Final Heavy CTA */}
            <SoftwareDevelopmentCta />
        </main>
    )
}
