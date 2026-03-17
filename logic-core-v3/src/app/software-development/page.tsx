"use client"
import React from 'react'
import { motion } from 'framer-motion'
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

            {/* Social Proof (NOA Testimonials) */}
            <SocialProofSoftware />

            {/* Final Conversion Vault (FAQ & ROI) */}
            <VaultSoftware />
        </main>
    )
}
