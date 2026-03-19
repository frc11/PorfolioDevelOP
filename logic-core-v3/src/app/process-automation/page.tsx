"use client"
import React from 'react'
import { motion } from 'framer-motion'
import DataPacketsCanvas from '@/components/automation/DataPacketsCanvas'
import HeroAutomation from '@/components/automation/HeroAutomation'
import CalculadoraAutomation from '@/components/automation/CalculadoraAutomation'
import IntegracionesAutomation from '@/components/automation/IntegracionesAutomation'
import BentoAutomation from '@/components/automation/BentoAutomation'
import FlujoAutomation from '@/components/automation/FlujoAutomation'
import RubrosAutomation from '@/components/automation/RubrosAutomation'
import ProcesoAutomation from '@/components/automation/ProcesoAutomation'
import SocialProofAutomation from '@/components/automation/SocialProofAutomation'
import VaultAutomation from '@/components/automation/VaultAutomation'

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

// Thin gradient divider — amber/orange palette for automation
const SectionDivider = () => (
    <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
            height: "1px",
            background:
                "linear-gradient(90deg, transparent, rgba(245,158,11,0.12) 25%, rgba(249,115,22,0.30) 50%, rgba(245,158,11,0.12) 75%, transparent)",
            transformOrigin: "center",
        }}
    />
)

export default function ProcessAutomationPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#070709] overflow-x-clip overflow-y-visible text-white">
            {/* Film Grain Texture */}
            <div
                className="fixed inset-0 z-[1] opacity-[0.025] pointer-events-none brightness-100 contrast-150"
                style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
            />

            {/* Global top aurora — amber */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-20 z-0"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.18) 0%, rgba(249,115,22,0.08) 45%, transparent 70%)",
                }}
            />

            {/* Bottom ambient — orange */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] opacity-15 z-0"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.15) 0%, transparent 65%)",
                }}
            />

            {/* Interactive canvas background */}
            <DataPacketsCanvas />

            {/* Hero — no reveal, loads immediately */}
            <HeroAutomation />

            {/* Post-hero sections with staggered reveal animations */}
            <SectionReveal>
                <CalculadoraAutomation />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <IntegracionesAutomation />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <BentoAutomation />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <FlujoAutomation />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <RubrosAutomation />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <ProcesoAutomation />
            </SectionReveal>

            <SectionReveal delay={0.05}>
                <SocialProofAutomation />
            </SectionReveal>

            <VaultAutomation />
        </main>
    )
}
