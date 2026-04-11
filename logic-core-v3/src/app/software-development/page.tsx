"use client"
import React from 'react'
import { motion } from 'framer-motion'
import HeroSoftware from '@/components/software/HeroSoftware'
import PainBentoSoftware from '@/components/software/PainBentoSoftware'
import DiagnosticoSoftware from '@/components/software/DiagnosticoSoftware'
import RoiSoftware from '@/components/software/RoiSoftware'
import DashboardMockupSoftware from '@/components/software/DashboardMockupSoftware'
import ArchitectureSoftware from '@/components/software/ArchitectureSoftware'
import PipelineSoftware from '@/components/software/PipelineSoftware'
import StatementSoftware from '@/components/software/StatementSoftware'
import SocialProofSoftware from '@/components/software/SocialProofSoftware'
import FaqSoftware from '@/components/software/FaqSoftware'
import { SoftwareDevelopmentCta } from '@/components/sections/software-development/SoftwareDevelopmentCta'

// Section reveal with scroll-triggered fade + slide
const SectionReveal = ({
    children,
    delay = 0,
}: {
    children: React.ReactNode
    delay?: number
}) => (
    <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        {children}
    </motion.div>
)

// Thin gradient divider — indigo/violet palette for software
const SectionDivider = () => (
    <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
            height: "1px",
            background:
                "linear-gradient(90deg, transparent, rgba(99,102,241,0.15) 25%, rgba(139,92,246,0.35) 50%, rgba(99,102,241,0.15) 75%, transparent)",
            transformOrigin: "center",
        }}
    />
)

export default function SoftwareDevelopmentPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#06060f] overflow-x-clip overflow-y-visible text-white">
            {/* Film Grain Texture */}
            <div
                className="fixed inset-0 z-[1] opacity-[0.025] pointer-events-none brightness-100 contrast-150"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            />

            {/* Global top glow — indigo aurora */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] opacity-25 z-0"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.22) 0%, rgba(123,47,255,0.10) 40%, transparent 70%)",
                }}
            />

            {/* Bottom ambient glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-15 z-0"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 100%, rgba(79,70,229,0.18) 0%, transparent 65%)",
                }}
            />

            {/* The Cinematic Hero Section — no reveal, loads immediately */}
            <HeroSoftware />

            {/* Post-hero sections with staggered reveal animations */}
            <SectionReveal>
                <DashboardMockupSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <ArchitectureSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <StatementSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <PainBentoSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <RoiSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <DiagnosticoSoftware />
            </SectionReveal>

            <SectionDivider />

            <PipelineSoftware />

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <SocialProofSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <FaqSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <SoftwareDevelopmentCta />
            </SectionReveal>

        </main>
    )
}

