"use client"

import React from 'react'
import { motion } from 'motion/react'
import HeroIA from '@/components/ia/HeroIA'
import DemoIA from '@/components/ia/DemoIA'
import PipelineIA from '@/components/ia/PipelineIA'
import RubrosIA from '@/components/ia/RubrosIA'
import ComparadorIA from '@/components/ia/ComparadorIA'
import LiveChatIA from '@/components/ia/LiveChatIA'
import TestimoniosIA from '@/components/ia/TestimoniosIA'
import GarantiaIA from '@/components/ia/GarantiaIA'
import FaqIA from '@/components/ia/FaqIA'
import CtaIA from '@/components/ia/CtaIA'

const CostAnchorIA = () => (
    <section id="cost-anchor" className="relative overflow-hidden bg-[#080810] px-4 py-24 lg:px-8">
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.09) 0%, transparent 65%)" }}
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mb-10 text-center"
            >
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-emerald-100/90">
                        COSTO DE NO AUTOMATIZAR
                    </span>
                </div>

                <h2 className="text-[clamp(30px,5vw,56px)] font-black leading-[0.95] tracking-[-0.05em]">
                    <span className="block text-white">Atender WhatsApp a mano</span>
                    <span className="block text-emerald-300">te cuesta todos los meses.</span>
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <motion.article
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[20px] border p-6 md:p-7"
                    style={{
                        borderColor: "rgba(148,163,184,0.28)",
                        background: "linear-gradient(145deg, rgba(148,163,184,0.08), rgba(255,255,255,0.02))",
                    }}
                >
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Modelo tradicional</p>
                    <h3 className="mb-2 text-2xl font-black text-white md:text-3xl">USD 450-700 / mes</h3>
                    <p className="text-sm leading-7 text-white/58">
                        Un perfil para responder consultas en horario comercial, mas supervision, ausencias y curva de entrenamiento.
                    </p>
                </motion.article>

                <motion.article
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[20px] border p-6 md:p-7"
                    style={{
                        borderColor: "rgba(34,197,94,0.32)",
                        background: "linear-gradient(145deg, rgba(34,197,94,0.14), rgba(255,255,255,0.02))",
                    }}
                >
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/88">Implementacion IA develOP</p>
                    <h3 className="mb-2 text-2xl font-black text-emerald-200 md:text-3xl">Desde USD 300 inicial</h3>
                    <p className="text-sm leading-7 text-white/68">
                        Setup base de agente IA para vender, calificar y responder 24/7. Pago inicial, con mantenimiento opcional.
                    </p>
                </motion.article>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 rounded-[18px] border px-5 py-4 text-center"
                style={{ borderColor: "rgba(34,197,94,0.24)", background: "rgba(34,197,94,0.08)" }}
            >
                <p className="m-0 text-sm leading-7 text-emerald-100/88 md:text-base">
                    En muchos negocios, 1 mes de atencion manual ya cuesta mas que implementar IA.
                </p>
            </motion.div>
        </div>
    </section>
)

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

const SectionDivider = () => (
    <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
            height: "1px",
            background:
                "linear-gradient(90deg, transparent, rgba(34,197,94,0.12) 25%, rgba(22,163,74,0.30) 50%, rgba(34,197,94,0.12) 75%, transparent)",
            transformOrigin: "center",
        }}
    />
)

export default function AIImplementationsPage() {
    return (
        <main className="ai-impl-page relative min-h-screen w-full overflow-x-hidden scroll-smooth bg-[#080810] text-white">
            <div className="fixed inset-0 z-[100] pointer-events-none" aria-hidden="true">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#080810] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#080810] to-transparent" />
            </div>

            <HeroIA />

            <SectionReveal>
                <DemoIA />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <GarantiaIA />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <PipelineIA />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <LiveChatIA />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <RubrosIA />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <ComparadorIA />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <CostAnchorIA />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <TestimoniosIA />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <FaqIA />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <CtaIA />
            </SectionReveal>

            <style>{`
                .ai-impl-page,
                .ai-impl-page * {
                    cursor: none !important;
                }
            `}</style>
        </main>
    )
}

