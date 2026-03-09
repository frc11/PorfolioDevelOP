"use client"
import React, { useRef } from 'react'
import { motion, Variants, useScroll, useTransform } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { WebDevelopmentBento } from '@/components/sections/WebDevelopmentBento'
import { WebDevelopmentComparison } from '@/components/sections/WebDevelopmentComparison'
import { WebDevelopmentSeo } from '@/components/sections/WebDevelopmentSeo'
import { WebDevelopmentSensory } from '@/components/sections/WebDevelopmentSensory'
import { WebDevelopmentScrollReveal } from '@/components/sections/WebDevelopmentScrollReveal'
import { WebDevelopmentCta } from '@/components/sections/WebDevelopmentCta'
import { WebDevelopmentTimeline } from '@/components/sections/WebDevelopmentTimeline'
import { WebDesigns } from '@/components/sections/WebDesigns'
import { WebDevelopmentFaq } from '@/components/sections/WebDevelopmentFaq'


export default function WebDevelopmentPage() {
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])

    return (
        <main className="relative min-h-screen w-full bg-[#030014] overflow-hidden text-white">
            {/* Tarea 1: Auroras Vibrantes y Profundas (Expansión) */}
            <div ref={heroRef} className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
                {/* Engineering Grid Texture */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

                {/* Aurora Superior Izquierda (Cyan) */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[70vw] h-[60vw] bg-cyan-500/25 blur-[130px] absolute -top-[10%] -left-[10%]"
                />

                {/* Aurora Derecha (Violeta) */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="w-[70vw] h-[60vw] bg-violet-600/25 blur-[130px] absolute top-[10%] -right-[10%]"
                />

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030014_90%)] z-[1]" />
            </div>

            {/* Noise Overlay */}
            <div className="fixed inset-0 z-[3] pointer-events-none opacity-[0.03] bg-[url('/noise.svg')] mix-blend-overlay" />

            {/* Tarea 2: Tipografía Cinética Masiva + Contenido Principal */}
            <motion.div
                style={{ opacity, scale }}
                className="relative z-10 flex flex-col justify-center items-center text-center h-screen px-4 max-w-7xl mx-auto"
            >
                {/* Tarea 3: Badge Corporativo (Lighthouse) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-8 bg-white/[0.03] backdrop-blur-md border border-white/10 px-5 py-2 rounded-full"
                >
                    <span className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
                        [ ESTATUS: GOOGLE_LIGHTHOUSE_OPTIMIZED ]
                    </span>
                </motion.div>

                {/* H1 Backlight (Crea separación y profundidad) */}
                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-cyan-400/15 blur-[120px] pointer-events-none z-0" />

                {/* Tarea 2: El H1 Masivo (Cromo / Alto Impacto) */}
                <motion.h1
                    initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-6xl md:text-[7.5rem] lg:text-[9rem] font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-50 to-cyan-900 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] text-center max-w-6xl mx-auto relative z-10"
                >
                    TU SUCURSAL DIGITAL.
                </motion.h1>

                {/* Subtítulo B2B Autoritario */}
                <motion.p
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                    className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto text-center mt-8 tracking-wide"
                >
                    Tener solo Instagram ya no alcanza. Construimos plataformas premium en <span className="text-white font-medium">Next.js</span> que cargan al instante, dominan Google en tu ciudad y venden en automático.
                </motion.p>

                {/* Tarea 3: Botón de Cristal Sólido */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-12"
                >
                    <MagneticCta
                        className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 backdrop-blur-2xl border border-cyan-400/40 text-white px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-sm transition-all duration-500 shadow-[0_0_40px_rgba(34,211,238,0.2)] hover:shadow-[0_0_80px_rgba(34,211,238,0.6)] hover:bg-cyan-500 hover:text-black hover:scale-105 group relative overflow-hidden z-10"
                    >
                        INICIAR TRANSFORMACIÓN
                    </MagneticCta>
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
                        <span>NEXT.JS //</span>
                        <span>REACT //</span>
                        <span>TAILWIND CSS //</span>
                        <span>FRAMER MOTION //</span>
                        <span>VERCEL //</span>
                        <span>FIGMA //</span>
                        <span>THREE.JS //</span>
                        <span>STRIPE //</span>
                        <span>NEXT.JS //</span>
                        {/* Repeat for seamless loop */}
                        <span>NEXT.JS //</span>
                        <span>REACT //</span>
                        <span>TAILWIND CSS //</span>
                        <span>FRAMER MOTION //</span>
                        <span>VERCEL //</span>
                        <span>FIGMA //</span>
                        <span>THREE.JS //</span>
                        <span>STRIPE //</span>
                        <span>NEXT.JS //</span>
                    </div>
                </motion.div>
            </div>

            {/* The Bento Grid Section */}
            <WebDevelopmentBento />

            {/* Comparison Section */}
            <WebDevelopmentComparison />

            {/* SEO Section */}
            <WebDevelopmentSeo />

            {/* Diseño que Cautiva Section */}
            <WebDevelopmentSensory />

            {/* Timeline de Transformación */}
            <WebDevelopmentTimeline />

            {/* Web Designs Showcase */}
            <WebDesigns />

            {/* Scroll Reveal Phrase */}
            <WebDevelopmentScrollReveal />

            {/* FAQ Acordeon */}
            <WebDevelopmentFaq />

            {/* Final Heavy CTA */}
            <WebDevelopmentCta />

        </main >
    )
}
