"use client"
import React, { useRef } from 'react'
import { motion, Variants, useScroll, useTransform } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import HeroBackground from '@/components/canvas/HeroBackground'
import HeroTitle from '@/components/ui/HeroTitle'
import HeroMetrics from '@/components/ui/HeroMetrics'
import { WebDevelopmentBento } from '@/components/sections/WebDevelopmentBento'

import { WebDevelopmentSeo } from '@/components/sections/WebDevelopmentSeo'
import { WebDevelopmentSensory } from '@/components/sections/WebDevelopmentSensory'
import StatementSection from '@/components/sections/StatementSection'
import { VaultSection } from '@/components/sections/VaultSection'
import { WebDevelopmentTimeline } from '@/components/sections/WebDevelopmentTimeline'
import ShowcaseSection from '@/components/sections/ShowcaseSection'
import ComparadorSection from '@/components/sections/ComparadorSection'
import AiSection from '@/components/sections/AiSection'


export default function WebDevelopmentPage() {
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])

    return (
        <main className="relative min-h-screen w-full bg-[#030014] overflow-x-clip overflow-y-visible text-white">
            {/* Tarea 1: Textura de Grano y Ruido (Film Grain) */}
            <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

            {/* Construcción del Background Dinámico en R3F */}
            <div ref={heroRef} className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
                <HeroBackground />
            </div>

            {/* Tarea 2: Tipografía Cinética Masiva + Contenido Principal (Refactor Asimétrico 60/40) */}
            <motion.div
                style={{ opacity, scale }}
                className="relative z-10 w-full h-screen max-w-[1920px] mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between pt-24 lg:pt-0"
            >
                {/* COLUMNA IZQUIERDA (60%) */}
                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full lg:w-[var(--width-hero-left)] flex flex-col items-center lg:items-start text-center lg:text-left px-4 lg:pl-[clamp(48px,8vw,120px)] lg:pr-8 z-10"
                >
                    {/* Badge Corporativo */}
                    <div className="mb-6 lg:mb-8 bg-black/40 backdrop-blur-xl border border-cyan-500/30 px-5 py-2 rounded-full inline-flex shadow-[0_4px_20px_rgba(0,0,0,0.5)] items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-zinc-200 font-mono text-[9px] md:text-[10px] uppercase tracking-widest font-bold">
                            TU SUCURSAL MÁS RENTABLE
                        </span>
                    </div>

                    {/* H1 Backlight */}
                    <div className="absolute top-[30%] left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 w-[60%] lg:w-[40%] h-[30%] bg-cyan-400/20 blur-[120px] pointer-events-none z-0" />

                    {/* Hero Title (Forzando override a text-left en Desktop) */}
                    <div className="w-full max-w-6xl relative z-10 [&_div]:lg:items-start [&_div]:lg:justify-start [&_h1]:lg:text-left [&_h1]:lg:justify-start">
                        <HeroTitle text={["Tu negocio, abierto", "las 24 horas."]} />
                    </div>

                    {/* Subtítulo B2B Autoritario */}
                    <p className="text-base md:text-lg text-white font-medium max-w-[520px] mt-6 lg:mt-8 tracking-wide leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-4 lg:px-0">
                        Transformamos tu Instagram y WhatsApp en un ecosistema que atrae clientes, cotiza y vende solo.<br className="hidden md:block" /> <span className="text-cyan-400/80 font-bold">Sin que tengas que estar presente.</span>
                    </p>

                    {/* Botón de Cristal Sólido */}
                    <div className="mt-10 lg:mt-12">
                        <MagneticCta
                            onClick={() => document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-[#00e5ff] text-[#080810] px-12 py-5 md:px-14 md:py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] transition-all duration-700 shadow-[0_0_40px_rgba(0,229,255,0.4)] hover:shadow-cyan-400/60 hover:scale-105 group relative overflow-hidden z-10 cursor-pointer"
                        >
                            <span>🚀 CONSTRUIR MI SUCURSAL →</span>
                        </MagneticCta>
                    </div>
                </motion.div>

                {/* LÍNEA DIVISORA VERTICAL (Desktop Only) */}
                <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden lg:block absolute left-[var(--width-hero-left)] top-[20%] h-[60%] w-[1px] origin-top z-0"
                    style={{ background: "linear-gradient(transparent, #00e5ff40, transparent)" }}
                />

                {/* COLUMNA DERECHA (40% - Metrics) */}
                <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full lg:w-[var(--width-hero-right)] flex flex-col justify-center items-center lg:items-end mt-16 lg:mt-0 lg:pr-[clamp(32px,6vw,80px)] z-10"
                >
                    <HeroMetrics />
                </motion.div>
            </motion.div>

            {/* Trust Bar Compacta Anclada */}
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

            {/* Tech Stack Marquee (Infinite Scroll) */}
            <div className="relative z-10 w-full pt-20 pb-10 overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
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
                        {/* Repeat for seamless loop */}
                        <span>Ventas a la madrugada: todos los días //</span>
                        <span>Clientes nuevos generados: 4.200+ //</span>
                        <span>Posiciones en Google cada mes: 847+ //</span>
                        <span>Velocidad de carga: &lt; 2 segundos //</span>
                        <span>Negocios del NOA potenciados: 47+ //</span>
                        <span>Tu web: el activo más rentable //</span>
                    </div>
                </motion.div>
            </div>

            {/* Comparativa: Caos vs Control */}
            <ComparadorSection />

            {/* The Bento Grid Section */}
            <WebDevelopmentBento />


            {/* SEO Section */}
            <WebDevelopmentSeo />

            {/* Diseño que Cautiva Section */}
            <WebDevelopmentSensory />

            {/* IA Section */}
            <AiSection />

            {/* Timeline de Transformación */}
            <WebDevelopmentTimeline />

            {/* Showcase de proyectos reales */}
            <ShowcaseSection />

            {/* Cinematic Statement Pause */}
            <StatementSection />

            {/* Vault: FAQ + CTA + Footer */}
            <VaultSection />

        </main >
    )
}
