"use client"
import React from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { AIPipelineSection } from '@/components/sections/AIPipelineSection'
import { ROICalculator } from '@/components/sections/ROICalculator'
import { ProcessAutomationMetrics } from '@/components/sections/ProcessAutomationMetrics'
import { ProcessAutomationCta } from '@/components/sections/ProcessAutomationCta'

import DataPacketsCanvas from '@/components/automation/DataPacketsCanvas'
import HeroAutomation from '@/components/automation/HeroAutomation'
import CalculadoraAutomation from '@/components/automation/CalculadoraAutomation'
import IntegracionesAutomation from '@/components/automation/IntegracionesAutomation'
import BentoAutomation from '@/components/automation/BentoAutomation'
import FlujoAutomation from '@/components/automation/FlujoAutomation'
import RubrosAutomation from '@/components/automation/RubrosAutomation'

// Dynamically import Interactive3DNetwork with SSR disabled
const Interactive3DNetwork = dynamic(
    () => import('@/components/canvas/Interactive3DNetwork').then(mod => mod.default || mod.Interactive3DNetwork),
    { ssr: false }
)

const AMBER_PALETTE = ['#f59e0b', '#d97706', '#f97316', '#fb923c', '#ea580c'];

export default function ProcessAutomationPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#070709] overflow-hidden text-white">
            <DataPacketsCanvas />
            
            {/* Interactive 3D Background */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <Interactive3DNetwork renderCanvas={true} showOverlayText={false} palette={AMBER_PALETTE} />
            </div>

            {/* Gradient Overlay */}
            <div className="fixed inset-0 bg-gradient-to-b from-orange-950/20 via-zinc-950/80 to-zinc-950 z-0 pointer-events-none" />

            {/* Interactive Hero */}
            <HeroAutomation />
            <CalculadoraAutomation />
            <IntegracionesAutomation />
            <BentoAutomation />
            <FlujoAutomation />
            <RubrosAutomation />

            {/* Shared Content */}
            <div className="relative z-10 w-full">
                <AIPipelineSection />
                <ROICalculator />
                <ProcessAutomationMetrics />
                <ProcessAutomationCta />
            </div>
        </main>
    )
}
