"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
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

// CASOS DE USO REALES - Automatizacion
type CasoMetric = {
    v: string
    l: string
}

type FlowStep = {
    label: string
    icon: string
}

type CasoAutomation = {
    industry: string
    client: string
    icon: string
    color: string
    rgb: string
    before: string
    after: string
    m1: CasoMetric
    m2: CasoMetric
    flow: FlowStep[]
}

const CASOS_AUTOMATION: CasoAutomation[] = [
    {
        industry: "Logistica",
        client: "Distribuidora del NOA - Tucuman",
        icon: "\u{1F69A}",
        color: "#f59e0b",
        rgb: "245,158,11",
        before: "Coordinadora pasaba 4hs/dia llamando a repartidores para confirmar entregas. Errores de ruta constantes.",
        after: "N8n automatiza notificaciones de ruta por WhatsApp, confirma entregas con foto y actualiza el sistema automaticamente.",
        m1: { v: "-4hs", l: "diarias de coordinacion" },
        m2: { v: "-80%", l: "errores de entrega" },
        flow: [
            { label: "Pedido", icon: "\u{1F4E6}" },
            { label: "Ruta", icon: "\u{1F69A}" },
            { label: "Entrega", icon: "\u{1F4F8}" },
        ],
    },
    {
        industry: "Salud",
        client: "Red de Clinicas Andina - Salta",
        icon: "\u{1F48A}",
        color: "#10b981",
        rgb: "16,185,129",
        before: "Remitos de laboratorio llegaban en papel. Resultados tardaban 2 dias en estar cargados al sistema.",
        after: "API integrada: laboratorio envia resultados -> sistema los carga -> paciente recibe WhatsApp en 15 min.",
        m1: { v: "15 min", l: "vs 2 dias para resultados" },
        m2: { v: "0", l: "carga manual de resultados" },
        flow: [
            { label: "Muestra", icon: "\u{1F9EA}" },
            { label: "Sistema", icon: "\u{1F5A5}" },
            { label: "Paciente", icon: "\u{1F4AC}" },
        ],
    },
    {
        industry: "Retail",
        client: "Ferreteria Del Norte - Tucuman",
        icon: "\u{1F527}",
        color: "#f97316",
        rgb: "249,115,22",
        before: "Stock desactualizado. Vendedores prometian productos que no habia. Pedidos a proveedores manuales.",
        after: "Stock se actualiza en tiempo real. Al llegar al minimo, genera pedido automatico al proveedor por email.",
        m1: { v: "+31%", l: "precision de stock" },
        m2: { v: "-90%", l: "roturas de stock" },
        flow: [
            { label: "Venta", icon: "\u{1F6D2}" },
            { label: "Stock", icon: "\u{1F4CA}" },
            { label: "Proveedor", icon: "\u{1F4E7}" },
        ],
    },
    {
        industry: "Finanzas",
        client: "Estudio Contable Rojas - Tucuman",
        icon: "\u{1F4D1}",
        color: "#6366f1",
        rgb: "99,102,241",
        before: "22 horas mensuales armando reportes para clientes copiando datos de AFIP, Excel y sistema propio.",
        after: "Bot extrae datos de AFIP, procesa en Google Sheets y envia informe PDF automatico a cada cliente.",
        m1: { v: "-22hs", l: "mensuales en reportes" },
        m2: { v: "x4", l: "clientes gestionados" },
        flow: [
            { label: "AFIP", icon: "\u{1F9FE}" },
            { label: "Sheets", icon: "\u{1F4CA}" },
            { label: "Reporte", icon: "\u{1F4C4}" },
        ],
    },
]
const IndustryFlowMini = ({
    flow,
    color,
    rgb,
}: {
    flow: FlowStep[]
    color: string
    rgb: string
}) => {
    const rgbSeed = useMemo(
        () => rgb.split(',').map(v => Number(v.trim())).reduce((acc, n) => acc + n, 0),
        [rgb]
    )
    const startOffset = useMemo(
        () => ((rgbSeed * 11 + flow.length * 23) % 100) / 100,
        [flow.length, rgbSeed]
    )
    const [progress, setProgress] = useState(startOffset)
    const [nodeGlows, setNodeGlows] = useState<number[]>(() => Array.from({ length: flow.length }, () => 0))
    const [isHovering, setIsHovering] = useState(false)
    const progressRef = useRef(startOffset)
    const speedFactorRef = useRef(1)
    const nodeCount = Math.max(1, flow.length)
    const railInsetPercent = flow.length > 0 ? 50 / flow.length : 0

    // Base duration varies slightly per card so all cards are not perfectly synchronized.
    const baseCycleMs = useMemo(() => {
        const jitter = (rgbSeed % 17) * 45
        return 5200 + flow.length * 520 + jitter
    }, [flow.length, rgbSeed])

    const wobblePeriodMs = useMemo(() => {
        return 2100 + (rgbSeed % 11) * 170 + flow.length * 90
    }, [flow.length, rgbSeed])

    const wobblePhase = useMemo(() => {
        return ((rgbSeed % 29) / 29) * Math.PI * 2
    }, [rgbSeed])

    const nodeProgresses = useMemo(() => {
        return Array.from({ length: nodeCount }, (_, index) => {
            return nodeCount === 1 ? 0 : index / (nodeCount - 1)
        })
    }, [nodeCount])

    const nodeDecayMs = useMemo(() => {
        return Array.from({ length: nodeCount }, (_, index) => {
            const seed = (rgbSeed + index * 31 + flow.length * 19) % 100
            return 620 + seed * 9
        })
    }, [flow.length, nodeCount, rgbSeed])

    const nodeChargeRef = useRef<number[]>(nodeProgresses.map(() => 0))
    const holdAtEndMs = 1000
    const holdRemainingRef = useRef(0)

    useEffect(() => {
        let raf = 0
        let last = performance.now()
        const didCross = (from: number, to: number, target: number) =>
            target > from && target <= to

        const tick = (now: number) => {
            const dt = now - last
            last = now

            const targetSpeedFactor = isHovering ? 2.2 : 1
            // Smooth speed transitions to avoid visual jumps.
            speedFactorRef.current += (targetSpeedFactor - speedFactorRef.current) * Math.min(1, dt / 220)

            const previousProgress = progressRef.current
            let nextProgress = previousProgress
            let shouldRunCrossCheck = true

            if (holdRemainingRef.current > 0) {
                holdRemainingRef.current = Math.max(0, holdRemainingRef.current - dt)
                nextProgress = 1

                if (holdRemainingRef.current <= 0) {
                    // Restart cleanly after the hold to avoid simultaneous start/end glow.
                    nextProgress = 0
                    shouldRunCrossCheck = false
                    nodeChargeRef.current = nodeChargeRef.current.map(() => 0)
                }
            } else {
                const wobble = 1 + 0.055 * Math.sin((now / wobblePeriodMs) * Math.PI * 2 + wobblePhase)
                const cycleMs = baseCycleMs / (speedFactorRef.current * wobble)
                const delta = dt / cycleMs
                const rawProgress = previousProgress + delta

                if (rawProgress >= 1) {
                    nextProgress = 1
                    holdRemainingRef.current = holdAtEndMs
                } else {
                    nextProgress = rawProgress
                }
            }

            nodeProgresses.forEach((nodeProgress, index) => {
                if (shouldRunCrossCheck && didCross(previousProgress, nextProgress, nodeProgress)) {
                    nodeChargeRef.current[index] = 1
                }
                const decay = Math.exp(-dt / nodeDecayMs[index])
                nodeChargeRef.current[index] *= decay
                if (nodeChargeRef.current[index] < 0.015) {
                    nodeChargeRef.current[index] = 0
                }
            })

            const nextGlows = nodeProgresses.map((nodeProgress, index) => {
                const distance = Math.abs(nextProgress - nodeProgress)
                const spread = 0.11
                const rawDistanceGlow = Math.max(0, 1 - distance / spread)
                const distanceGlow = Math.pow(rawDistanceGlow, 0.62)
                const lingerGlow = Math.pow(nodeChargeRef.current[index] ?? 0, 0.82)
                const baseGlow = distanceGlow * 0.55 + lingerGlow * 0.95
                const asyncPulse = baseGlow > 0.05
                    ? 0.04 * Math.sin(nextProgress * Math.PI * 2 + index * 1.37 + wobblePhase)
                    : 0
                return Math.max(0, Math.min(1, baseGlow + asyncPulse))
            })

            progressRef.current = nextProgress
            setProgress(nextProgress)
            setNodeGlows(nextGlows)

            raf = requestAnimationFrame(tick)
        }

        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [baseCycleMs, isHovering, nodeDecayMs, nodeProgresses, wobblePeriodMs, wobblePhase])

    const dotLeftPercent = railInsetPercent + progress * (100 - railInsetPercent * 2)

    return (
        <div
            className="relative mb-4 rounded-xl px-2.5 pt-2 pb-2 overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
                background: `linear-gradient(120deg, rgba(${rgb},0.09) 0%, rgba(${rgb},0.02) 100%)`,
                border: `1px solid rgba(${rgb},0.2)`,
            }}
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 45%, rgba(${rgb},0.16), transparent 75%)` }}
            />

            <div className="relative">
                <div className="relative h-7 mx-1.5">
                    <div
                        className="absolute h-px z-0"
                        style={{
                            top: "18px",
                            left: `${railInsetPercent}%`,
                            right: `${railInsetPercent}%`,
                            background: `linear-gradient(90deg, rgba(${rgb},0.15), rgba(${rgb},0.5), rgba(${rgb},0.15))`,
                        }}
                    />

                    <motion.div
                        aria-hidden="true"
                        className="absolute h-2 w-2 rounded-full -translate-y-1/2 -translate-x-1/2 z-10"
                        style={{
                            top: "18px",
                            left: `${dotLeftPercent}%`,
                            background: color,
                            boxShadow: isHovering
                                ? `0 0 14px rgba(${rgb},1), 0 0 24px rgba(${rgb},0.45)`
                                : `0 0 10px rgba(${rgb},0.9)`,
                        }}
                        animate={{ scale: isHovering ? 1.08 : 1, opacity: isHovering ? 1 : 0.92 }}
                        transition={{ duration: 0.12, ease: "linear" }}
                    />

                    <div
                        className="absolute left-0 right-0 top-[6px] z-20"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${flow.length}, minmax(0, 1fr))`,
                            justifyItems: 'center',
                        }}
                    >
                        {flow.map((step, index) => {
                            const glow = nodeGlows[index] ?? 0
                            return (
                            <motion.div
                                key={`${step.label}-${index}`}
                                className="relative flex h-6 w-6 items-center justify-center rounded-full"
                                style={{
                                    background: "rgba(7,7,9,0.98)",
                                    border: `1px solid rgba(${rgb},${0.4 + glow * 0.35})`,
                                    boxShadow:
                                        `0 0 0 2px rgba(7,7,9,0.95), ` +
                                        `inset 0 0 ${8 + glow * 6}px rgba(${rgb},${0.16 + glow * 0.34}), ` +
                                        `0 0 ${6 + glow * 14}px rgba(${rgb},${0.12 + glow * 0.5})`,
                                }}
                                animate={{ scale: 1 + glow * 0.18 }}
                                transition={{ duration: 0.08, ease: "linear" }}
                            >
                                <span style={{ fontSize: "10px", lineHeight: 1 }}>{step.icon}</span>
                            </motion.div>
                            )
                        })}
                    </div>
                </div>

                <div
                    className="mt-1"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${flow.length}, minmax(0, 1fr))`,
                        justifyItems: 'center',
                    }}
                >
                    {flow.map((step, index) => (
                        <p
                            key={`${step.label}-label-${index}`}
                            className="text-center font-mono uppercase tracking-[0.08em]"
                            style={{
                                fontSize: "7px",
                                color: "rgba(255,255,255,0.48)",
                                lineHeight: 1.25,
                                width: '100%',
                            }}
                        >
                            {step.label}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
}
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
                    Horas recuperadas reales. ROI medible desde el dia 30.
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
                            transition: { duration: 0 },
                        }}
                        style={{
                            background: `linear-gradient(135deg, rgba(${c.rgb},0.07) 0%, rgba(255,255,255,0.02) 100%)`,
                            border: `1px solid rgba(${c.rgb},0.2)`,
                            borderRadius: "20px",
                            padding: "clamp(18px,2vw,24px)",
                            transition: "none",
                            cursor: "none",
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

                        <IndustryFlowMini flow={c.flow} color={c.color} rgb={c.rgb} />

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
                                    DESPUES
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

// Thin gradient divider - amber/orange palette for automation
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

            {/* Global top aurora - amber */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-20 z-0"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.18) 0%, rgba(249,115,22,0.08) 45%, transparent 70%)",
                }}
            />

            {/* Bottom ambient - orange */}
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

            {/* Hero - no reveal, loads immediately */}
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
