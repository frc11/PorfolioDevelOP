"use client"
import React from 'react'
import { motion } from 'motion/react'
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
import GarantiaIA from '@/components/ia/GarantiaIA'
import FaqIA from '@/components/ia/FaqIA'
import CtaIA from '@/components/ia/CtaIA'

// ─── CASOS DE USO REALES — IA ────────────────────────────────────────────────
const CASOS_IA = [
    {
        industry: "Restaurante",
        client: "La Esquina Parrilla · Tucumán",
        icon: "🍽",
        color: "#f97316",
        rgb: "249,115,22",
        before: "Dueño respondiendo WhatsApp a las 2AM para confirmar reservas. Domingos colapsados de llamadas.",
        after: "Agente IA gestiona reservas, confirma por WhatsApp y envía recordatorio el día anterior.",
        m1: { v: "+47%", l: "ocupación mensual" },
        m2: { v: "0hs", l: "del dueño en reservas" },
    },
    {
        industry: "Consultorio",
        client: "Dra. López · Psicología · Tucumán",
        icon: "🧠",
        color: "#8b5cf6",
        rgb: "139,92,246",
        before: "35% de pacientes no se presentaban sin avisar. Agenda llena de huecos no productivos.",
        after: "IA envía recordatorio 48hs y 2hs antes. Si el paciente cancela, reofrece el turno automáticamente.",
        m1: { v: "−68%", l: "ausencias sin aviso" },
        m2: { v: "+22%", l: "ingresos sin nuevos pacientes" },
    },
    {
        industry: "Inmobiliaria",
        client: "Grupo Propiedades NOA · Salta",
        icon: "🏠",
        color: "#22c55e",
        rgb: "34,197,94",
        before: "Agentes respondiendo consultas repetitivas de Instagram todo el día. 60% de leads no calificados.",
        after: "Agente IA filtra leads por intención real, califica por presupuesto y coordina visitas al agente adecuado.",
        m1: { v: "×3", l: "leads calificados/semana" },
        m2: { v: "−5hs", l: "diarias del equipo liberadas" },
    },
]

const CasosUsoIA = () => (
    <section className="relative py-24 px-4 lg:px-8 overflow-hidden bg-[#080810]">
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 60%)",
            }}
        />
        <div className="relative z-10 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-12 text-center"
            >
                <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                    style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.22)" }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#8b5cf6", boxShadow: "0 0 6px rgba(139,92,246,0.8)" }}
                    />
                    <span
                        className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                        style={{ color: "rgba(139,92,246,0.85)" }}
                    >
                        CASOS REALES
                    </span>
                </div>
                <h2
                    className="font-black leading-[1.05] tracking-[-0.04em] mb-4"
                    style={{ fontSize: "clamp(28px,4vw,48px)" }}
                >
                    <span className="text-white block">La IA que ya trabaja</span>
                    <span
                        style={{
                            background: "linear-gradient(135deg,#8b5cf6,#a78bfa,#c4b5fd)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        en estos negocios.
                    </span>
                </h2>
                <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Resultados reales. No demos. No simulaciones. Sistemas en producción hoy.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CASOS_IA.map((c, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{
                            y: -6,
                            boxShadow: `0 24px 48px rgba(${c.rgb},0.18)`,
                        }}
                        style={{
                            background: `linear-gradient(135deg, rgba(${c.rgb},0.07) 0%, rgba(255,255,255,0.02) 100%)`,
                            border: `1px solid rgba(${c.rgb},0.2)`,
                            borderRadius: "20px",
                            padding: "clamp(20px,2.5vw,28px)",
                            transition: "border-color 300ms",
                            cursor: "default",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "12px",
                                    background: `rgba(${c.rgb},0.12)`,
                                    border: `1px solid rgba(${c.rgb},0.25)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "22px",
                                    flexShrink: 0,
                                }}
                            >
                                {c.icon}
                            </div>
                            <div>
                                <p
                                    style={{
                                        fontSize: "10px",
                                        color: c.color,
                                        fontWeight: 700,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        margin: "0 0 2px",
                                    }}
                                >
                                    {c.industry}
                                </p>
                                <p style={{ fontSize: "12px", color: "white", fontWeight: 600, margin: 0 }}>
                                    {c.client}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-5">
                            <div
                                style={{
                                    background: "rgba(239,68,68,0.05)",
                                    border: "1px solid rgba(239,68,68,0.14)",
                                    borderRadius: "10px",
                                    padding: "10px 12px",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "9px",
                                        color: "rgba(239,68,68,0.7)",
                                        fontWeight: 700,
                                        letterSpacing: "0.15em",
                                        margin: "0 0 4px",
                                    }}
                                >
                                    ANTES
                                </p>
                                <p
                                    style={{
                                        fontSize: "12px",
                                        color: "rgba(255,255,255,0.45)",
                                        lineHeight: 1.6,
                                        margin: 0,
                                    }}
                                >
                                    {c.before}
                                </p>
                            </div>
                            <div
                                style={{
                                    background: `rgba(${c.rgb},0.05)`,
                                    border: `1px solid rgba(${c.rgb},0.14)`,
                                    borderRadius: "10px",
                                    padding: "10px 12px",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "9px",
                                        color: c.color,
                                        fontWeight: 700,
                                        letterSpacing: "0.15em",
                                        margin: "0 0 4px",
                                    }}
                                >
                                    DESPUÉS
                                </p>
                                <p
                                    style={{
                                        fontSize: "12px",
                                        color: "rgba(255,255,255,0.55)",
                                        lineHeight: 1.6,
                                        margin: 0,
                                    }}
                                >
                                    {c.after}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {[c.m1, c.m2].map((m, j) => (
                                <div
                                    key={j}
                                    style={{
                                        background: `rgba(${c.rgb},0.08)`,
                                        border: `1px solid rgba(${c.rgb},0.18)`,
                                        borderRadius: "10px",
                                        padding: "10px 8px",
                                        textAlign: "center",
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: "clamp(16px,2vw,20px)",
                                            fontWeight: 900,
                                            color: c.color,
                                            margin: 0,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {m.v}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "9px",
                                            color: "rgba(255,255,255,0.4)",
                                            margin: "4px 0 0",
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {m.l}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
)

// Section reveal wrapper
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

// Thin gradient divider — purple palette for IA
const SectionDivider = () => (
    <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
            height: "1px",
            background:
                "linear-gradient(90deg, transparent, rgba(139,92,246,0.12) 25%, rgba(168,85,247,0.30) 50%, rgba(139,92,246,0.12) 75%, transparent)",
            transformOrigin: "center",
        }}
    />
)

export default function AIImplementationsPage() {
    return (
        <main className="relative min-h-screen w-full bg-[#080810] overflow-x-hidden text-white scroll-smooth">
            {/* Global atmosphere overlays */}
            <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true">
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#080810] to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#080810] to-transparent" />
            </div>

            {/* 1. Hero */}
            <HeroIA />

            {/* 2. Bento Grid */}
            <SectionReveal>
                <BentoIA />
            </SectionReveal>

            <SectionDivider />

            {/* 3. Live Chat Demo */}
            <SectionReveal delay={0.05}>
                <LiveChatIA />
            </SectionReveal>

            <SectionDivider />

            {/* 4. Garantía / Trust */}
            <SectionReveal delay={0.05}>
                <GarantiaIA />
            </SectionReveal>

            <SectionDivider />

            {/* 4b. Casos de uso reales */}
            <SectionReveal delay={0.05}>
                <CasosUsoIA />
            </SectionReveal>

            <SectionDivider />

            {/* 5. Rubros (Vertical focus) */}
            <SectionReveal delay={0.05}>
                <RubrosIA />
            </SectionReveal>

            <SectionDivider />

            {/* 6. Pipeline */}
            <SectionReveal delay={0.05}>
                <PipelineIA />
            </SectionReveal>

            <SectionDivider />

            {/* 7. Demo interactivo */}
            <SectionReveal delay={0.05}>
                <DemoIA />
            </SectionReveal>

            <SectionDivider />

            {/* 8. Comparador ROI */}
            <SectionReveal delay={0.05}>
                <ComparadorIA />
            </SectionReveal>

            <SectionDivider />

            {/* 9. Calculador */}
            <SectionReveal delay={0.05}>
                <CalculadorIA />
            </SectionReveal>

            <SectionDivider />

            {/* 10. Testimonios */}
            <SectionReveal delay={0.05}>
                <TestimoniosIA />
            </SectionReveal>

            <SectionDivider />

            {/* 11. FAQ */}
            <SectionReveal delay={0.05}>
                <FaqIA />
            </SectionReveal>

            <SectionDivider />

            {/* 12. CTA con urgencia */}
            <SectionReveal delay={0.05}>
                <CtaIA />
            </SectionReveal>

            {/* 13. Vault closure */}
            <VaultIA />
        </main>
    )
}
