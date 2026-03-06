"use client"
import React from 'react'
import { motion, Variants } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { WebDevelopmentBento } from '@/components/sections/WebDevelopmentBento'
import { WebDevelopmentSensory } from '@/components/sections/WebDevelopmentSensory'
import { WebDevelopmentScrollReveal } from '@/components/sections/WebDevelopmentScrollReveal'
import { WebDevelopmentCta } from '@/components/sections/WebDevelopmentCta'

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

    return (
        <main className="relative min-h-screen w-full bg-[#030014] overflow-hidden text-white">
            {/* Colorful Hero Background */}
            <div className="absolute top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none bg-[#030014]">
                {/* Base radial gradient for rich color even before video loads */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-[#030014] to-[#030014] z-0" />

                {/* Video layer - with very specific human impact styling and mix-blend-luminosity */}
                <video autoPlay loop muted playsInline preload="none" className="absolute inset-0 w-full h-full object-cover z-0 opacity-30 mix-blend-luminosity grayscale-[40%] pointer-events-none" src="/Man_sips_coffee_scrolls_phone_delpmaspu_.mp4" />

                {/* Contrast gradient matching the new deep aesthetic to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-[#030014]/60 to-[#030014] z-[1] pointer-events-none" />

                {/* Ambient Color Glows (Cyan specific to match reflections) */}
                <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] bg-cyan-600/30 blur-[130px] rounded-full z-[2] pointer-events-none mix-blend-screen opacity-60" />
                <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-cyan-400/20 blur-[120px] rounded-full z-[2] pointer-events-none mix-blend-screen opacity-50" />
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

                {/* Hero Title with Kinetic Typography */}
                <motion.h1
                    initial="hidden"
                    animate="visible"
                    transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
                    className="text-5xl md:text-7xl lg:text-[7rem] font-black tracking-tighter leading-[1.1] mb-6 flex items-center justify-center font-mono [text-shadow:0_4px_30px_rgba(0,0,0,0.8)]"
                >
                    <div className="flex flex-wrap justify-center relative">
                        {textTitle.map((letter, i) => (
                            <motion.span
                                key={i}
                                variants={letterVariants}
                                className={`inline-block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ${letter === '_' ? 'opacity-50' : ''}`}
                            >
                                {letter}
                            </motion.span>
                        ))}

                        {/* Decorative floating sparkle */}
                        <motion.span
                            initial={{ opacity: 0, scale: 0, rotate: -90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{
                                delay: 1.5,
                                duration: 1.2,
                                type: "spring",
                                stiffness: 200
                            }}
                            className="absolute -top-8 -right-12 md:-right-16 text-cyan-400 opacity-80"
                        >
                            <motion.svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" />
                            </motion.svg>
                        </motion.span>
                    </div>
                </motion.h1>

                {/* Subtitle */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    transition={{ staggerChildren: 0.03, delayChildren: 0.8 }}
                    className="text-lg md:text-2xl text-zinc-300/80 font-normal max-w-3xl mb-12 mt-4 leading-relaxed flex flex-wrap justify-start drop-shadow-md border-l-4 border-cyan-400 pl-6 text-left"
                >
                    {"Tu página web no debería ser un folleto digital abandonado. Diseñamos plataformas ultra-rápidas que capturan clientes, posicionan tu marca en Google y venden por ti las 24 horas.".split(" ").map((word, i) => (
                        <motion.span
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
                                visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: "easeOut" } }
                            }}
                            className={`inline-block mr-2 ${word.includes('Google') || word.includes('ultra-rápidas') ? 'text-cyan-400 font-bold' : word.includes('venden') ? 'text-white font-bold' : ''}`}
                        >
                            {word}
                        </motion.span>
                    ))}
                </motion.div>

                {/* Magnetic CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="px-10 py-5 text-sm md:text-base font-bold uppercase tracking-widest group bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/10 hover:border-violet-400 text-white transition-all duration-300 shadow-[0_0_30px_rgba(167,139,250,0.1)] hover:shadow-[0_0_40px_rgba(167,139,250,0.3)]">
                        <span className="relative z-10 flex items-center gap-3">
                            Crear mi Experiencia Web
                            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse group-hover:scale-150 transition-transform" />
                        </span>
                    </MagneticCta>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 pointer-events-none"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-pulse" />
            </motion.div>

            {/* Tech Stack Marquee (Infinite Scroll) */}
            <div className="relative z-10 w-full pt-10 pb-20 mt-12 overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                    <div className="flex gap-8 px-4 items-center font-mono text-cyan-500/40 tracking-[0.2em] text-sm md:text-base uppercase">
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

            {/* Scroll Reveal Phrase */}
            <WebDevelopmentScrollReveal />

            {/* Final Heavy CTA */}
            <WebDevelopmentCta />

        </main>
    )
}
