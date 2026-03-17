"use client"
import React from 'react'
import { motion } from 'motion/react'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { AITechMarquee } from '@/components/sections/AITechMarquee'

// New IA Components
import HeroIA from '@/components/ia/HeroIA'
import BentoIA from '@/components/ia/BentoIA'
import DemoIA from '@/components/ia/DemoIA'
import PipelineIA from '@/components/ia/PipelineIA'
import RubrosIA from '@/components/ia/RubrosIA'
import ComparadorIA from '@/components/ia/ComparadorIA'
import CalculadorIA from '@/components/ia/CalculadorIA'
import LiveChatIA from '@/components/ia/LiveChatIA'
import VaultIA from '@/components/ia/VaultIA'
import TestimoniosIA from '@/components/ia/TestimoniosIA'
import GarantiaIA from "@/components/ia/GarantiaIA"


export default function AIImplementationsPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#080810] overflow-x-hidden text-white scroll-smooth">
            {/* Content Flow */}
            <div className="relative z-10">
                {/* 1. Hero Content */}
                <HeroIA />

                {/* 2. Bento Grid */}
                <BentoIA />

                {/* 3. Live Chat (Interactive Demo) */}
                <LiveChatIA />

                {/* 4. Garantia (Trust & Assurance) */}
                <GarantiaIA />

                {/* 5. Rubros (Vertical Focus) */}
                <RubrosIA />

                {/* 6. Pipeline (How data flows) */}
                <PipelineIA />

                {/* 7. Comparador (ROI & Human vs AI) */}
                <ComparadorIA />

                {/* 7. Calculador (Industry-preset ROI calculator) */}
                <CalculadorIA />

                {/* 8. Testimonios (Social Proof) */}
                <TestimoniosIA />

                {/* 9. Vault (FAQ & trust closure) */}
                <VaultIA />
            </div>
            
            {/* Global Atmosphere Overlays */}
            <div className="fixed inset-0 pointer-events-none z-[100] aria-hidden:true">
                 <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#080810] to-transparent shrink-0" />
                 <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#080810] to-transparent shrink-0" />
            </div>
        </main>
    )
}
