"use client"
import React, { useRef } from 'react'
import { motion, Variants, useScroll, useTransform } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { WebDevelopmentBento } from '@/components/sections/WebDevelopmentBento'
import { WebDevelopmentSensory } from '@/components/sections/WebDevelopmentSensory'
import { WebDevelopmentScrollReveal } from '@/components/sections/WebDevelopmentScrollReveal'
import { WebDevelopmentCta } from '@/components/sections/WebDevelopmentCta'
import { WebDevelopmentTimeline } from '@/components/sections/WebDevelopmentTimeline'
import { WebDesigns } from '@/components/sections/WebDesigns'
import { WebDevelopmentFaq } from '@/components/sections/WebDevelopmentFaq'

// Variants for animated letters
const letterVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { type: "spring", stiffness: 120, damping: 14 }
    }
}

export default function WebDevelopmentPage() {
    const textTitle = "DISEÑO_WEB_PREMIUM".split("")

    // Add scroll sync for the hero video opacity
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
    const videoOpacity = useTransform(scrollYProgress, [0, 1], [0.7, 0])

    return (
        <main className="relative min-h-screen w-full bg-[#030014] overflow-hidden text-white">
            {/* Colorful Hero Background */}
            <div ref={heroRef} className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none bg-[#030014]">
                {/* Base radial gradient for rich color even before video loads */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-[#030014] to-[#030014] z-0" />

                {/* Video layer - with very specific human impact styling (Full color rescue) */}
                <motion.video autoPlay loop muted playsInline preload="none" className="absolute inset-0 w-full h-full object-cover z-0 opacity-70 pointer-events-none" style={{ opacity: videoOpacity }} src="/Man_sips_coffee_scrolls_phone_delpmaspu_.mp4" />

                {/* Cinematic Vignette Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030014_85%)] z-[1] pointer-events-none" />

                {/* Ambient Color Glows (Cyan specific to match reflections) */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[20vw] bg-cyan-500/15 blur-[120px] rounded-[100%] z-[1] pointer-events-none" />
            </div>

            {/* Noise Overlay */}
            <div className="fixed inset-0 z-[3] pointer-events-none opacity-[0.03] bg-[url('/noise.svg')] mix-blend-overlay" />

            {/* Main Content Overlay */}
            <div className="relative z-10 flex flex-col justify-center items-center text-center !h-screen px-4 max-w-5xl mx-auto">
                {/* Top Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 px-5 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        <span className="text-xs md:text-sm font-mono text-white tracking-[0.2em] uppercase">
                            [ GOOGLE_LIGHTHOUSE_SCORE: 100/100 ]
                        </span>
                    </div>
                </motion.div>

                {/* Hero Title Minimalist */}
                <motion.h1
                    initial={{ y: 40, opacity: 0, filter: "blur(10px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-6xl md:text-[7rem] font-black tracking-tighter text-white leading-[0.9] text-center max-w-5xl mx-auto drop-shadow-2xl mb-6"
                >
                    Tu nueva sucursal digital.
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ y: 40, opacity: 0, filter: "blur(10px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="text-lg md:text-2xl text-zinc-300 font-light max-w-3xl mx-auto text-center mt-8 tracking-wide mb-12"
                >
                    El usuario actual no tiene paciencia para páginas lentas. Diseñamos plataformas premium en Next.js que cargan al instante, dominan tu región en Google y convierten visitantes en clientes.
                </motion.p>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="bg-white/5 backdrop-blur-2xl border border-white/10 hover:bg-white/10 text-white px-10 py-5 rounded-full font-bold tracking-[0.2em] text-sm md:text-base uppercase transition-all duration-500 shadow-[0_0_30px_rgba(6,182,212,0.15)] group mt-4">
                        <span className="relative z-10 flex items-center gap-3">
                            AUDITAR MI WEB ACTUAL
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse group-hover:scale-150 transition-transform" />
                        </span>
                    </MagneticCta>
                </motion.div>
            </div>

            {/* Trust Bar Anclada */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="absolute bottom-10 w-full flex justify-center z-20"
            >
                <div className="backdrop-blur-md bg-white/[0.02] border border-white/10 px-8 py-4 rounded-2xl flex md:flex-row flex-col gap-4 md:gap-8 items-center max-w-[90%] md:max-w-fit text-center">
                    <span className="text-[10px] md:text-xs font-mono tracking-widest text-zinc-400 uppercase">
                        DESARROLLO NEXT.JS
                    </span>
                    <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span className="text-[10px] md:text-xs font-mono tracking-widest text-zinc-400 uppercase">
                        LIGHTHOUSE 100/100
                    </span>
                    <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span className="text-[10px] md:text-xs font-mono tracking-widest text-zinc-400 uppercase">
                        SOPORTE LOCAL
                    </span>
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
