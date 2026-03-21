"use client"
import React from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
const DataPacketsCanvas = dynamic(() => import('@/components/automation/DataPacketsCanvas'), { ssr: false })
import HeroAutomation from '@/components/automation/HeroAutomation'
import CalculadoraAutomation from '@/components/automation/CalculadoraAutomation'
import IntegracionesAutomation from '@/components/automation/IntegracionesAutomation'
import BentoAutomation from '@/components/automation/BentoAutomation'
import FlujoAutomation from '@/components/automation/FlujoAutomation'
import RubrosAutomation from '@/components/automation/RubrosAutomation'
import ComparativaAutomation from '@/components/automation/ComparativaAutomation'
import ProcesoAutomation from '@/components/automation/ProcesoAutomation'
import SocialProofAutomation from '@/components/automation/SocialProofAutomation'
import FaqAutomation from '@/components/automation/FaqAutomation'
import CtaAutomation from '@/components/automation/CtaAutomation'
import VaultAutomation from '@/components/automation/VaultAutomation'

// ─── CASOS DE USO REALES — Automatización ────────────────────────────────────
const CASOS_AUTOMATION = [
    {
        industry: "Logística",
        client: "Distribuidora del NOA · Tucumán",
        icon: "🚛",
        color: "#f59e0b",
        rgb: "245,158,11",
        before: "Coordinadora pasaba 4hs/día llamando a repartidores para confirmar entregas. Errores de ruta constantes.",
        after: "N8n automatiza notificaciones de ruta por WhatsApp, confirma entregas con foto y actualiza el sistema automáticamente.",
        m1: { v: "−4hs", l: "diarias de coordinación" },
        m2: { v: "−80%", l: "errores de entrega" },
    },
    {
        industry: "Salud",
        client: "Red de Clínicas Andina · Salta",
        icon: "💊",
        color: "#10b981",
        rgb: "16,185,129",
        before: "Remitos de laboratorio llegaban en papel. Resultados tardaban 2 días en estar cargados al sistema.",
        after: "API integrada: laboratorio envía resultados → sistema los carga → paciente recibe WhatsApp en 15 min.",
        m1: { v: "15 min", l: "vs 2 días para resultados" },
        m2: { v: "0", l: "carga manual de resultados" },
    },
    {
        industry: "Retail",
        client: "Ferretería Del Norte · Tucumán",
        icon: "🔧",
        color: "#f97316",
        rgb: "249,115,22",
        before: "Stock desactualizado. Vendedores prometían productos que no había. Pedidos a proveedores manuales.",
        after: "Stock se actualiza en tiempo real. Al llegar al mínimo, genera pedido automático al proveedor por email.",
        m1: { v: "+31%", l: "precisión de stock" },
        m2: { v: "−90%", l: "roturas de stock" },
    },
    {
        industry: "Finanzas",
        client: "Estudio Contable Rojas · Tucumán",
        icon: "📑",
        color: "#6366f1",
        rgb: "99,102,241",
        before: "22 horas mensuales armando reportes para clientes copiando datos de AFIP, Excel y sistema propio.",
        after: "Bot extrae datos de AFIP, procesa en Google Sheets y envía informe PDF automático a cada cliente.",
        m1: { v: "−22hs", l: "mensuales en reportes" },
        m2: { v: "×4", l: "clientes gestionados" },
    },
]

const CasosUsoAutomation = () => (
    <section className="relative py-24 px-4 lg:px-8 overflow-hidden">
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 60%)",
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
                    style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)" }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.8)" }}
                    />
                    <span
                        className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                        style={{ color: "rgba(245,158,11,0.85)" }}
                    >
                        CASOS REALES
                    </span>
                </div>
                <h2
                    className="font-black leading-[1.05] tracking-[-0.04em] mb-4"
                    style={{ fontSize: "clamp(28px,4vw,48px)" }}
                >
                    <span className="text-white block">Procesos que ya se automatizaron</span>
                    <span
                        style={{
                            background: "linear-gradient(135deg,#f59e0b,#f97316,#fb923c)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        en empresas reales.
                    </span>
                </h2>
                <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Horas recuperadas reales. ROI medible desde el día 30.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CASOS_AUTOMATION.map((c, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{
                            y: -6,
                            boxShadow: `0 20px 40px rgba(${c.rgb},0.2)`,
                        }}
                        style={{
                            background: `linear-gradient(135deg, rgba(${c.rgb},0.07) 0%, rgba(255,255,255,0.02) 100%)`,
                            border: `1px solid rgba(${c.rgb},0.2)`,
                            borderRadius: "20px",
                            padding: "clamp(18px,2vw,24px)",
                            transition: "border-color 300ms",
                            cursor: "default",
                        }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    background: `rgba(${c.rgb},0.12)`,
                                    border: `1px solid rgba(${c.rgb},0.25)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "20px",
                                    flexShrink: 0,
                                }}
                            >
                                {c.icon}
                            </div>
                            <div>
                                <p
                                    style={{
                                        fontSize: "9px",
                                        color: c.color,
                                        fontWeight: 700,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        margin: "0 0 2px",
                                    }}
                                >
                                    {c.industry}
                                </p>
                                <p style={{ fontSize: "11px", color: "white", fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                                    {c.client}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div
                                style={{
                                    background: "rgba(239,68,68,0.05)",
                                    border: "1px solid rgba(239,68,68,0.12)",
                                    borderRadius: "8px",
                                    padding: "8px 10px",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "8px",
                                        color: "rgba(239,68,68,0.7)",
                                        fontWeight: 700,
                                        letterSpacing: "0.15em",
                                        margin: "0 0 3px",
                                    }}
                                >
                                    ANTES
                                </p>
                                <p
                                    style={{
                                        fontSize: "11px",
                                        color: "rgba(255,255,255,0.42)",
                                        lineHeight: 1.5,
                                        margin: 0,
                                    }}
                                >
                                    {c.before}
                                </p>
                            </div>
                            <div
                                style={{
                                    background: `rgba(${c.rgb},0.05)`,
                                    border: `1px solid rgba(${c.rgb},0.12)`,
                                    borderRadius: "8px",
                                    padding: "8px 10px",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "8px",
                                        color: c.color,
                                        fontWeight: 700,
                                        letterSpacing: "0.15em",
                                        margin: "0 0 3px",
                                    }}
                                >
                                    DESPUÉS
                                </p>
                                <p
                                    style={{
                                        fontSize: "11px",
                                        color: "rgba(255,255,255,0.52)",
                                        lineHeight: 1.5,
                                        margin: 0,
                                    }}
                                >
                                    {c.after}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                            {[c.m1, c.m2].map((m, j) => (
                                <div
                                    key={j}
                                    style={{
                                        background: `rgba(${c.rgb},0.08)`,
                                        border: `1px solid rgba(${c.rgb},0.18)`,
                                        borderRadius: "8px",
                                        padding: "8px 6px",
                                        textAlign: "center",
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: "clamp(14px,1.8vw,18px)",
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
                                            fontSize: "8px",
                                            color: "rgba(255,255,255,0.38)",
                                            margin: "3px 0 0",
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
                <CasosUsoAutomation />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <FlujoAutomation />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <ComparativaAutomation />
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

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <FaqAutomation />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <CtaAutomation />
            </SectionReveal>

            <VaultAutomation />
        </main>
    )
}
