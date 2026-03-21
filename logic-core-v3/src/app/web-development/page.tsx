"use client"
import React, { useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
const HeroBackground = dynamic(() => import('@/components/canvas/HeroBackground'), { ssr: false })
import HeroTitle from '@/components/ui/HeroTitle'
import HeroMetrics from '@/components/ui/HeroMetrics'
import { WebDevelopmentBento } from '@/components/sections/WebDevelopmentBento'
import { WebDevelopmentFaq } from '@/components/sections/WebDevelopmentFaq'
import { WebDevelopmentCta } from '@/components/sections/WebDevelopmentCta'
import { WebDevelopmentSeo } from '@/components/sections/WebDevelopmentSeo'
import { WebDevelopmentSensory } from '@/components/sections/WebDevelopmentSensory'
import StatementSection from '@/components/sections/StatementSection'
import { VaultSection } from '@/components/sections/VaultSection'
import { WebDevelopmentTimeline } from '@/components/sections/WebDevelopmentTimeline'
import ShowcaseSection from '@/components/sections/ShowcaseSection'
import ComparadorSection from '@/components/sections/ComparadorSection'
import AiSection from '@/components/sections/AiSection'
import PortfolioWebCases from '@/components/sections/PortfolioWebCases'
import WebDevelopmentByRubro from '@/components/sections/WebDevelopmentByRubro'

// ─── CASOS DE USO REALES — Web Development ───────────────────────────────────
const CASOS_WEB = [
    {
        industry: "Gastronomía",
        client: "Bar El Portal · San Miguel de Tucumán",
        icon: "🍺",
        color: "#00e5ff",
        rgb: "0,229,255",
        before: "Sólo Instagram para comunicarse. Sin web, sin reservas, sin menú online. Perdían clientes en Google.",
        after: "Web en Next.js con carta digital, sistema de reservas y ficha completa en Google. Aparece en 847 búsquedas nuevas.",
        m1: { v: "+120%", l: "reservas digitales" },
        m2: { v: "Pos. #3", l: "en Google local" },
    },
    {
        industry: "Servicios",
        client: "Estudio Contable NOA · Salta",
        icon: "📊",
        color: "#7b2fff",
        rgb: "123,47,255",
        before: "Página web estática de 2018. Sin CTA, sin formulario, cargaba en 6 segundos. Cero leads por web.",
        after: "Rediseño completo: landing con score Lighthouse 100, formulario WhatsApp integrado, blog de contenido SEO.",
        m1: { v: "×4", l: "leads mensuales" },
        m2: { v: "1.4s", l: "carga (antes: 6s)" },
    },
    {
        industry: "Salud & Bienestar",
        client: "Centro Médico Integral · Tucumán",
        icon: "🏥",
        color: "#22c55e",
        rgb: "34,197,94",
        before: "No aparecía en Google para búsquedas locales. Pacientes nuevos llegaban solo por referidos.",
        after: "Web optimizada SEO local + Google My Business: 2.300 visitas/mes nuevas. Turno online integrado.",
        m1: { v: "+2.3k", l: "visitas/mes nuevas" },
        m2: { v: "+67%", l: "turnos nuevos en 90 días" },
    },
    {
        industry: "E-commerce",
        client: "Indumentaria Zona Norte · Tucumán",
        icon: "👗",
        color: "#f59e0b",
        rgb: "245,158,11",
        before: "Vendía solo por Instagram Stories. Pagos por transferencia manual. Sin historial de pedidos.",
        after: "Tienda online con carrito, pasarela de pagos, stock sincronizado y panel de pedidos en tiempo real.",
        m1: { v: "+340%", l: "ventas online en 3 meses" },
        m2: { v: "24/7", l: "ventas sin atención humana" },
    },
]

const CasosUsoWeb = () => (
    <section className="relative py-24 px-4 lg:px-8 overflow-hidden bg-[#030014]">
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 60%)" }}
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
                    style={{ background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.22)" }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#00e5ff", boxShadow: "0 0 6px rgba(0,229,255,0.8)" }}
                    />
                    <span
                        className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                        style={{ color: "rgba(0,229,255,0.85)" }}
                    >
                        CASOS REALES
                    </span>
                </div>
                <h2
                    className="font-black leading-[1.05] tracking-[-0.04em] mb-4"
                    style={{ fontSize: "clamp(28px,4vw,48px)" }}
                >
                    <span className="text-white block">Negocios que convirtieron su web</span>
                    <span style={{ color: "#00e5ff" }}>en su vendedor N°1.</span>
                </h2>
                <p
                    className="text-sm max-w-lg mx-auto leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                >
                    Resultados reales de los primeros 90 días. Sin retoque de marketing.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CASOS_WEB.map((c, i) => (
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

// Reusable section reveal wrapper
const SectionReveal = ({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode
    delay?: number
    className?: string
}) => (
    <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
    >
        {children}
    </motion.div>
)

// Thin gradient divider between sections
const SectionDivider = ({ color = "cyan" }: { color?: "cyan" | "violet" }) => {
    const gradient =
        color === "violet"
            ? "linear-gradient(90deg, transparent, rgba(139,92,246,0.25) 30%, rgba(99,102,241,0.35) 50%, rgba(139,92,246,0.25) 70%, transparent)"
            : "linear-gradient(90deg, transparent, rgba(0,229,255,0.12) 30%, rgba(6,182,212,0.25) 50%, rgba(0,229,255,0.12) 70%, transparent)"
    return (
        <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: "1px", background: gradient, transformOrigin: "center", margin: "0 auto" }}
        />
    )
}

export default function WebDevelopmentPage() {
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])

    return (
        <main className="relative min-h-screen w-full bg-[#030014] overflow-x-clip overflow-y-visible text-white">
            {/* Film Grain Texture */}
            <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

            {/* Global subtle radial glow — top center */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-30 z-0"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.18) 0%, transparent 65%)" }}
            />

            {/* Dynamic Background in R3F */}
            <div ref={heroRef} className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
                <HeroBackground />
            </div>

            {/* Hero — 60/40 Split */}
            <motion.div
                style={{ opacity, scale }}
                className="relative z-10 w-full h-screen max-w-[1920px] mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between pt-24 lg:pt-0"
            >
                {/* LEFT COL (60%) */}
                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full lg:w-[var(--width-hero-left)] flex flex-col items-center lg:items-start text-center lg:text-left px-4 lg:pl-[clamp(48px,8vw,120px)] lg:pr-8 z-10"
                >
                    {/* Corporate Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.7 }}
                        className="mb-6 lg:mb-8 bg-black/40 backdrop-blur-xl border border-cyan-500/30 px-5 py-2 rounded-full inline-flex shadow-[0_4px_20px_rgba(0,0,0,0.5)] items-center gap-2"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-zinc-200 font-mono text-[9px] md:text-[10px] uppercase tracking-widest font-bold">
                            TU SUCURSAL MÁS RENTABLE
                        </span>
                    </motion.div>

                    {/* Pricing / tech badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.7 }}
                        className="mb-4 flex flex-wrap gap-1.5 justify-center lg:justify-start"
                    >
                        {['Next.js', 'TypeScript', 'Lighthouse 100', 'Desde $800 USD', '4–6 semanas'].map((item) => (
                            <span
                                key={item}
                                className="text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                                style={{
                                    background: 'rgba(0,229,255,0.06)',
                                    border: '1px solid rgba(0,229,255,0.18)',
                                    color: 'rgba(0,229,255,0.7)',
                                }}
                            >
                                {item}
                            </span>
                        ))}
                    </motion.div>

                    {/* H1 Backlight */}
                    <div className="absolute top-[30%] left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 w-[60%] lg:w-[40%] h-[30%] bg-cyan-400/20 blur-[120px] pointer-events-none z-0" />

                    {/* Hero Title */}
                    <div className="w-full max-w-6xl relative z-10 [&_div]:lg:items-start [&_div]:lg:justify-start [&_h1]:lg:text-left [&_h1]:lg:justify-start">
                        <HeroTitle text={["Tu negocio, abierto", "las 24 horas."]} />
                    </div>

                    {/* Subtitle */}
                    <p className="text-base md:text-lg text-white font-medium max-w-[520px] mt-6 lg:mt-8 tracking-wide leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-4 lg:px-0">
                        Transformamos tu Instagram y WhatsApp en un ecosistema que atrae clientes, cotiza y vende solo.
                        <br className="hidden md:block" />
                        <span className="text-cyan-400/80 font-bold"> Sin que tengas que estar presente.</span>
                    </p>

                    {/* CTA */}
                    <div className="mt-10 lg:mt-12">
                        <MagneticCta
                            onClick={() => document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-[#00e5ff] text-[#080810] px-12 py-5 md:px-14 md:py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] transition-all duration-700 shadow-[0_0_40px_rgba(0,229,255,0.4)] hover:shadow-cyan-400/60 hover:scale-105 group relative overflow-hidden z-10 cursor-pointer"
                        >
                            <span>🚀 CONSTRUIR MI SUCURSAL →</span>
                        </MagneticCta>
                    </div>
                </motion.div>

                {/* VERTICAL DIVIDER (Desktop Only) */}
                <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden lg:block absolute left-[var(--width-hero-left)] top-[20%] h-[60%] w-[1px] origin-top z-0"
                    style={{ background: "linear-gradient(transparent, #00e5ff40, transparent)" }}
                />

                {/* RIGHT COL (40% — Metrics) */}
                <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full lg:w-[var(--width-hero-right)] flex flex-col justify-center items-center lg:items-end mt-16 lg:mt-0 lg:pr-[clamp(32px,6vw,80px)] z-10"
                >
                    <HeroMetrics />
                </motion.div>
            </motion.div>

            {/* Anchored Trust Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 1 }}
                className="absolute bottom-10 w-full flex justify-center z-20"
            >
                <div className="backdrop-blur-md bg-white/[0.03] border border-white/5 px-8 py-4 rounded-full flex gap-8 items-center text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    <span>NEXT.JS ARC</span>
                    <div className="w-1 h-1 rounded-full bg-cyan-700" />
                    <span>LIGHTHOUSE:100</span>
                    <div className="w-1 h-1 rounded-full bg-cyan-700" />
                    <span>SECURE_BY_DESIGN</span>
                </div>
            </motion.div>

            {/* Tech Stack Marquee */}
            <div
                className="relative z-10 w-full pt-20 pb-10 overflow-hidden"
                style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                }}
            >
                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                    <div className="flex gap-8 px-4 items-center font-mono text-zinc-600/50 tracking-[0.2em] text-sm md:text-base uppercase">
                        <span>Ventas a la madrugada: todos los días //</span>
                        <span>Clientes nuevos generados: 4.200+ //</span>
                        <span>Posiciones en Google cada mes: 847+ //</span>
                        <span>Velocidad de carga: &lt; 2 segundos //</span>
                        <span>Negocios del NOA potenciados: 47+ //</span>
                        <span>Tu web: el activo más rentable //</span>
                        <span>Ventas a la madrugada: todos los días //</span>
                        <span>Clientes nuevos generados: 4.200+ //</span>
                        <span>Posiciones en Google cada mes: 847+ //</span>
                        <span>Velocidad de carga: &lt; 2 segundos //</span>
                        <span>Negocios del NOA potenciados: 47+ //</span>
                        <span>Tu web: el activo más rentable //</span>
                    </div>
                </motion.div>
            </div>

            {/* — SECTIONS — */}

            <SectionReveal>
                <ComparadorSection />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <WebDevelopmentByRubro />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <WebDevelopmentBento />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <CasosUsoWeb />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <PortfolioWebCases />
            </SectionReveal>

            <SectionDivider color="violet" />

            <SectionReveal delay={0.05}>
                <WebDevelopmentSeo />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <WebDevelopmentSensory />
            </SectionReveal>

            <SectionDivider color="violet" />

            <SectionReveal delay={0.05}>
                <AiSection />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <WebDevelopmentTimeline />
            </SectionReveal>

            <SectionDivider color="violet" />

            <SectionReveal delay={0.05}>
                <ShowcaseSection />
            </SectionReveal>

            <SectionReveal delay={0.05}>
                <StatementSection />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <WebDevelopmentFaq />
            </SectionReveal>

            <SectionReveal delay={0.05}>
                <WebDevelopmentCta />
            </SectionReveal>

            <VaultSection />
        </main>
    )
}
