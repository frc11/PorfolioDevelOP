"use client"
import React from 'react'
import { motion } from 'framer-motion'
import HeroSoftware from '@/components/software/HeroSoftware'
import PainBentoSoftware from '@/components/software/PainBentoSoftware'
import DiagnosticoSoftware from '@/components/software/DiagnosticoSoftware'
import ProcesoSoftware from '@/components/software/ProcesoSoftware'
import DashboardMockupSoftware from '@/components/software/DashboardMockupSoftware'
import ArchitectureSoftware from '@/components/software/ArchitectureSoftware'
import PipelineSoftware from '@/components/software/PipelineSoftware'
import ShowcaseSoftware from '@/components/software/ShowcaseSoftware'
import StatementSoftware from '@/components/software/StatementSoftware'
import SocialProofSoftware from '@/components/software/SocialProofSoftware'
import FaqSoftware from '@/components/software/FaqSoftware'
import { SoftwareDevelopmentCta } from '@/components/sections/software-development/SoftwareDevelopmentCta'
import VaultSoftware from '@/components/software/VaultSoftware'

// ─── CASOS DE USO REALES — Software ──────────────────────────────────────────
const CASOS_SOFTWARE = [
    {
        industry: "Distribución",
        client: "Distribuidora Andina · Tucumán",
        icon: "📦",
        color: "#6366f1",
        rgb: "99,102,241",
        before: "7 planillas Excel desconectadas. Vendedores sin stock real. 3-4 hs/día de carga manual.",
        after: "ERP + CRM integrado: stock en tiempo real, pedidos automáticos y rutas de reparto optimizadas.",
        m1: { v: "−40hs", l: "semanales liberadas" },
        m2: { v: "+28%", l: "ventas en 6 meses" },
    },
    {
        industry: "Salud",
        client: "Clínica Vélez · Tucumán",
        icon: "🏥",
        color: "#10b981",
        rgb: "16,185,129",
        before: "Agenda en papel. 35% de ausencias sin aviso. Historia clínica dispersa.",
        after: "Turnos online con recordatorios WhatsApp. Historia clínica digital unificada. Panel de facturación.",
        m1: { v: "−62%", l: "ausencias sin aviso" },
        m2: { v: "8 min", l: "por turno (antes: 22)" },
    },
    {
        industry: "Construcción",
        client: "Constructora NOA · Tucumán",
        icon: "🏗",
        color: "#f59e0b",
        rgb: "245,158,11",
        before: "Costos de obra dispersos en múltiples personas. Sin visibilidad de avance ni rentabilidad real.",
        after: "Panel de control de obra: costos, materiales, avance y equipo en una pantalla actualizada.",
        m1: { v: "+19%", l: "margen recuperado" },
        m2: { v: "0", l: "planillas manuales activas" },
    },
]

const CasosUsoSoftware = () => (
    <section className="relative py-24 px-4 lg:px-8 overflow-hidden">
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)" }}
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
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.22)" }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#6366f1", boxShadow: "0 0 6px rgba(99,102,241,0.8)" }}
                    />
                    <span
                        className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                        style={{ color: "rgba(99,102,241,0.85)" }}
                    >
                        CASOS REALES
                    </span>
                </div>
                <h2
                    className="font-black leading-[1.05] tracking-[-0.04em] mb-4"
                    style={{ fontSize: "clamp(28px,4vw,48px)" }}
                >
                    <span className="text-white block">Empresas que ya transformaron</span>
                    <span
                        style={{
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        su operación.
                    </span>
                </h2>
                <p
                    className="text-sm max-w-lg mx-auto leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                >
                    Números reales, clientes reales. Sin promedios de industria.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CASOS_SOFTWARE.map((c, i) => (
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
                <PainBentoSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <DiagnosticoSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <DashboardMockupSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <ProcesoSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <ArchitectureSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <PipelineSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <ShowcaseSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <CasosUsoSoftware />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <StatementSoftware />
            </SectionReveal>

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

            <VaultSoftware />
        </main>
    )
}
