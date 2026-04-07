"use client"
import React, { useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import { BriefcaseBusiness, HeartPulse, ShoppingBag, UtensilsCrossed, type LucideIcon } from 'lucide-react'
const HeroBackground = dynamic(() => import('@/components/canvas/HeroBackground'), { ssr: false })
import HeroMetrics from '@/components/ui/HeroMetrics'
import { WebDevelopmentBento } from '@/components/sections/web-development/WebDevelopmentBento'
import { WebDevelopmentFaq } from '@/components/sections/web-development/WebDevelopmentFaq'
import { WebDevelopmentCta } from '@/components/sections/web-development/WebDevelopmentCta'
import { WebDevelopmentSeo } from '@/components/sections/web-development/WebDevelopmentSeo'
import { WebDevelopmentSensory } from '@/components/sections/web-development/WebDevelopmentSensory'
import StatementSection from '@/components/sections/web-development/StatementSection'
import { VaultSection } from '@/components/sections/web-development/VaultSection'
import { WebDevelopmentTimeline } from '@/components/sections/web-development/WebDevelopmentTimeline'
import ShowcaseSection from '@/components/sections/web-development/ShowcaseSection'
import ComparadorSection from '@/components/sections/web-development/ComparadorSection'
import AiSection from '@/components/sections/web-development/AiSection'
import PortfolioWebCases from '@/components/sections/web-development/PortfolioWebCases'
import WebDevelopmentByRubro from '@/components/sections/web-development/WebDevelopmentByRubro'
import { WebDevelopmentObjections } from '@/components/sections/web-development/WebDevelopmentObjections'
import WebTemplatesImmersive from '@/components/sections/web-development/WebTemplatesImmersive'
import { ChargeTraceButton } from '@/components/ui/buttons/ChargeTraceButton'

// CASOS DE USO REALES - Web Development
type CasoWeb = {
    industry: string
    client: string
    icon: LucideIcon
    color: string
    rgb: string
    videoSrc: string
    videoLabel: string
    before: string
    after: string
    m1: { v: string; l: string }
    m2: { v: string; l: string }
}

const CASOS_WEB: CasoWeb[] = [
    {
        industry: "Gastronom\u00eda",
        client: "Bar El Portal - San Miguel de Tucum\u00e1n",
        icon: UtensilsCrossed,
        color: "#00e5ff",
        rgb: "0,229,255",
        videoSrc: "/video/Muestra-pagina-ejemplo.mp4",
        videoLabel: "Demo web gastronomía",
        before: "S\u00f3lo Instagram para comunicarse. Sin web, sin reservas, sin men\u00fa online. Perd\u00edan clientes en Google.",
        after: "Web en Next.js con carta digital, sistema de reservas y ficha completa en Google. Aparece en 847 b\u00fasquedas nuevas.",
        m1: { v: "+120%", l: "reservas digitales" },
        m2: { v: "Pos. #3", l: "en Google local" },
    },
    {
        industry: "Servicios",
        client: "Estudio Contable NOA - Salta",
        icon: BriefcaseBusiness,
        color: "#7b2fff",
        rgb: "123,47,255",
        videoSrc: "/video/Muestra-pagina-ejemplo.mp4",
        videoLabel: "Demo web servicios",
        before: "P\u00e1gina web est\u00e1tica de 2018. Sin CTA, sin formulario, cargaba en 6 segundos. Cero leads por web.",
        after: "Redise\u00f1o completo: landing con score Lighthouse 100, formulario WhatsApp integrado y blog de contenido SEO.",
        m1: { v: "x4", l: "leads mensuales" },
        m2: { v: "1.4s", l: "carga (antes: 6s)" },
    },
    {
        industry: "Salud y Bienestar",
        client: "Centro M\u00e9dico Integral - Tucum\u00e1n",
        icon: HeartPulse,
        color: "#22c55e",
        rgb: "34,197,94",
        videoSrc: "/video/Muestra-pagina-ejemplo.mp4",
        videoLabel: "Demo web salud",
        before: "No aparec\u00eda en Google para b\u00fasquedas locales. Pacientes nuevos llegaban s\u00f3lo por referidos.",
        after: "Web optimizada para SEO local + Google Business Profile: 2.300 visitas nuevas por mes. Turno online integrado.",
        m1: { v: "+2.3k", l: "visitas/mes nuevas" },
        m2: { v: "+67%", l: "turnos nuevos en 90 d\u00edas" },
    },
    {
        industry: "E-commerce",
        client: "Indumentaria Zona Norte - Tucum\u00e1n",
        icon: ShoppingBag,
        color: "#f59e0b",
        rgb: "245,158,11",
        videoSrc: "/video/Muestra-pagina-ejemplo.mp4",
        videoLabel: "Demo web e-commerce",
        before: "Vend\u00eda s\u00f3lo por Instagram Stories. Pagos por transferencia manual. Sin historial de pedidos.",
        after: "Tienda online con carrito, pasarela de pagos, stock sincronizado y panel de pedidos en tiempo real.",
        m1: { v: "+340%", l: "ventas online en 3 meses" },
        m2: { v: "24/7", l: "ventas sin atenci\u00f3n humana" },
    },
]

const CasosUsoWeb = () => (
    <section className="relative overflow-hidden bg-[#030014] px-4 py-24 lg:px-8">
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.06) 0%, transparent 62%)' }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-12 text-center"
            >
                <div
                    className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                    style={{ background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.22)' }}
                >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#00e5ff', boxShadow: '0 0 6px rgba(0,229,255,0.8)' }} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(0,229,255,0.85)' }}>
                        CASOS REALES
                    </span>
                </div>

                <h2 className="mb-4 font-black leading-[1.08] tracking-[-0.04em]" style={{ fontSize: 'clamp(28px,4vw,56px)' }}>
                    <span className="block text-white">Negocios que convirtieron su web</span>
                    <span style={{ color: '#00e5ff' }}>en su vendedor Nº1.</span>
                </h2>

                <p className="mx-auto max-w-xl text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Resultados reales de los primeros 90 días. Sin retoque de marketing.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {CASOS_WEB.map((c, i) => {
                    const Icon = c.icon
                    return (
                        <motion.article
                            key={c.client}
                            initial={{ opacity: 0, y: 32 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ y: -6, boxShadow: `0 20px 40px rgba(${c.rgb},0.2)` }}
                            className="flex h-full flex-col rounded-[20px] p-5 md:p-6"
                            style={{
                                background: `linear-gradient(135deg, rgba(${c.rgb},0.08) 0%, rgba(255,255,255,0.02) 100%)`,
                                border: `1px solid rgba(${c.rgb},0.2)`,
                                transition: 'border-color 300ms',
                                cursor: 'default',
                            }}
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                                    style={{ background: `rgba(${c.rgb},0.12)`, border: `1px solid rgba(${c.rgb},0.25)` }}
                                >
                                    <Icon className="h-5 w-5" style={{ color: c.color }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="mb-0.5 truncate text-[10px] font-bold uppercase" style={{ color: c.color, letterSpacing: '0.1em' }}>
                                        {c.industry}
                                    </p>
                                    <p className="m-0 text-[12px] font-semibold leading-[1.35] text-white/95">{c.client}</p>
                                </div>
                            </div>

                            <div
                                className="relative mb-4 overflow-hidden rounded-[12px] border"
                                style={{ borderColor: `rgba(${c.rgb},0.22)`, background: "rgba(6,10,24,0.72)" }}
                            >
                                <div
                                    className="flex items-center gap-1.5 border-b px-3 py-2"
                                    style={{ borderColor: `rgba(${c.rgb},0.18)`, background: `linear-gradient(90deg, rgba(${c.rgb},0.12), rgba(255,255,255,0.02))` }}
                                >
                                    <span className="h-2 w-2 rounded-full bg-white/40" />
                                    <span className="h-2 w-2 rounded-full bg-white/25" />
                                    <span className="h-2 w-2 rounded-full bg-white/15" />
                                    <span className="ml-2 text-[9px] font-mono uppercase tracking-[0.14em] text-white/55">
                                        {c.videoLabel}
                                    </span>
                                </div>

                                <div className="relative aspect-[16/9] w-full overflow-hidden">
                                    <video
                                        className="h-full w-full object-cover"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        aria-label={c.videoLabel}
                                    >
                                        <source src={c.videoSrc} type="video/mp4" />
                                    </video>
                                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(2,6,17,0.64)_100%)]" />
                                    <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
                                        Preview
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4 space-y-2">
                                <div className="rounded-[10px] border px-3 py-2.5" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.14)' }}>
                                    <p className="mb-1 text-[9px] font-bold tracking-[0.14em] text-red-400/80">ANTES</p>
                                    <p className="m-0 text-[12px] leading-[1.45] text-white/52">{c.before}</p>
                                </div>
                                <div className="rounded-[10px] border px-3 py-2.5" style={{ background: `rgba(${c.rgb},0.05)`, borderColor: `rgba(${c.rgb},0.14)` }}>
                                    <p className="mb-1 text-[9px] font-bold tracking-[0.14em]" style={{ color: c.color }}>
                                        DESPUÉS
                                    </p>
                                    <p className="m-0 text-[12px] leading-[1.45] text-white/62">{c.after}</p>
                                </div>
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-2">
                                {[c.m1, c.m2].map((m) => (
                                    <div
                                        key={`${c.client}-${m.v}`}
                                        className="rounded-[10px] border px-2 py-2 text-center"
                                        style={{ background: `rgba(${c.rgb},0.08)`, borderColor: `rgba(${c.rgb},0.18)` }}
                                    >
                                        <p className="m-0 text-[clamp(16px,2vw,22px)] font-black leading-none" style={{ color: c.color }}>
                                            {m.v}
                                        </p>
                                        <p className="m-0 mt-1 text-[9px] leading-[1.35] text-white/45">{m.l}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.article>
                    )
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="mt-12 flex justify-center"
            >
                <motion.button
                    type="button"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold tracking-wide"
                    style={{
                        color: '#00e5ff',
                        border: '1px solid rgba(0,229,255,0.42)',
                        background: 'rgba(0,229,255,0.06)',
                        boxShadow: '0 12px 28px rgba(0,229,255,0.12)',
                    }}
                    aria-label="¿Tu negocio es el siguiente? Hablemos"
                >
                    ¿Tu negocio es el siguiente? Hablemos →
                </motion.button>
            </motion.div>
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
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.965])

    return (
        <main className="relative min-h-screen w-full overflow-x-clip overflow-y-visible bg-[#020611] text-white">
            {/* Film Grain Texture */}
            <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

            {/* Global subtle radial glow Ã¢â‚¬â€ top center */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed top-0 left-1/2 z-0 h-[620px] w-[900px] -translate-x-1/2 opacity-20"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.12) 0%, transparent 68%)" }}
            />

            {/* Dynamic Background in R3F */}
            <div ref={heroRef} className="absolute top-0 left-0 z-0 h-screen w-full overflow-hidden pointer-events-none">
                <HeroBackground />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,17,0.38)_0%,rgba(2,6,17,0.58)_30%,rgba(2,6,17,0.76)_65%,rgba(2,6,17,0.92)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,6,17,0.08)_0%,rgba(2,6,17,0.28)_42%,rgba(2,6,17,0.76)_100%)]" />
            </div>

            {/* Hero Ã¢â‚¬â€ 60/40 Split */}
            <motion.div
                style={{ opacity, scale }}
                className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1920px] flex-col items-center justify-center px-4 pb-10 pt-24 lg:grid lg:grid-cols-[minmax(0,70%)_1px_minmax(0,30%)] lg:items-center lg:gap-8 lg:px-10 lg:pb-0 lg:pt-0"
            >
                <div className="pointer-events-none absolute inset-x-4 inset-y-[6vh] rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(6,12,24,0.66)_0%,rgba(5,10,20,0.78)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.26)] backdrop-blur-[5px] lg:inset-x-10 lg:inset-y-[7vh]" />

                {/* LEFT COL (60%) */}
                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10 flex w-full flex-col items-center px-4 text-center lg:items-start lg:pl-[clamp(44px,5vw,86px)] lg:pr-4 lg:text-left"
                >
                    {/* Corporate Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.7 }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/16 bg-black/28 px-5 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md lg:mb-8"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
                        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-zinc-100/90 md:text-[10px]">
                            TU SUCURSAL MAS RENTABLE
                        </span>
                    </motion.div>

                    {/* Pricing / tech badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.7 }}
                        className="mb-5 flex flex-wrap justify-center gap-2 lg:justify-start"
                    >
                        {['Next.js', 'TypeScript', 'Lighthouse 100', 'Desde $800 USD', '4-6 semanas'].map((item) => (
                            <span
                                key={item}
                                className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-100/80 backdrop-blur-sm"
                                style={{
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                                }}
                            >
                                {item}
                            </span>
                        ))}
                    </motion.div>

                    {/* H1 Backlight */}
                    <div className="pointer-events-none absolute left-1/2 top-[30%] z-0 h-[28%] w-[58%] -translate-x-1/2 bg-cyan-400/10 blur-[130px] lg:left-0 lg:w-[40%] lg:translate-x-0" />

                    {/* Hero Title */}
                    <div className="relative z-10 w-full max-w-[1120px]">
                        <h1 className="text-center text-[12.8vw] font-black uppercase leading-[0.88] tracking-[-0.055em] lg:text-left lg:text-[6.1vw] xl:text-[5.9vw] 2xl:text-[5.6vw]">
                            <span className="block bg-gradient-to-r from-white via-zinc-100 to-cyan-200 bg-clip-text text-transparent lg:whitespace-nowrap">
                                Tu negocio, abierto
                            </span>
                            <span className="block bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-300 bg-clip-text text-transparent">
                                Las 24 horas
                                <span className="ml-[0.06em] inline-block text-cyan-300 [text-shadow:0_0_16px_rgba(34,211,238,0.78)]">.</span>
                            </span>
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <p className="mt-6 max-w-[540px] px-4 text-base font-medium leading-relaxed tracking-wide text-zinc-100/92 drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] md:text-lg lg:mt-8 lg:px-0">
                        Transformamos tu Instagram y WhatsApp en un ecosistema que atrae clientes, cotiza y vende solo.
                        <br className="hidden md:block" />
                        <span className="font-bold text-cyan-300"> Sin que tengas que estar presente.</span>
                    </p>

                    {/* CTA */}
                    <div className="mt-10 lg:mt-12">
                        <ChargeTraceButton
                            label="CONSTRUIR MI SUCURSAL"
                            onClick={() => document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' })}
                        />
                    </div>
                </motion.div>

                {/* VERTICAL DIVIDER (Desktop Only) */}
                <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10 hidden h-[54%] w-[1px] origin-top justify-self-center lg:block"
                    style={{ background: "linear-gradient(transparent, rgba(103,232,249,0.2), transparent)" }}
                />

                {/* RIGHT COL (40% Ã¢â‚¬â€ Metrics) */}
                <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10 mt-14 flex w-full flex-col items-center justify-center lg:mt-0 lg:w-full lg:items-stretch lg:justify-self-stretch lg:pr-[clamp(44px,5vw,86px)]"
                >
                    <HeroMetrics />
                </motion.div>
            </motion.div>

            {/* Ã¢â‚¬â€ SECTIONS Ã¢â‚¬â€ */}

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

            <SectionDivider color="violet" />

            <SectionReveal delay={0.05}>
                <WebDevelopmentObjections />
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
                <WebDevelopmentTimeline />
            </SectionReveal>

            <SectionDivider color="violet" />

            <SectionReveal delay={0.05}>
                <ShowcaseSection />
            </SectionReveal>

            <SectionDivider color="violet" />

            <WebTemplatesImmersive />

            <StatementSection />

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <WebDevelopmentFaq />
            </SectionReveal>

            <SectionDivider color="violet" />

            <SectionReveal delay={0.05}>
                <AiSection />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <WebDevelopmentCta />
            </SectionReveal>

            <VaultSection />
        </main>
    )
}
