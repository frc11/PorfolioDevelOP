"use client"
import React, { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

const MILESTONES = [
    {
        number: "Semana 01",
        title: "Auditoría UX",
        description: "Mapeamos cómo compra tu cliente local para optimizar cada punto de contacto y maximizar la retención."
    },
    {
        number: "Semana 02",
        title: "Diseño UI",
        description: "Creamos la interfaz visual en Figma con estética premium, enfocada en la identidad de tu marca."
    },
    {
        number: "Semana 03",
        title: "Código Next.js",
        description: "Desarrollamos el motor ultrarrápido con las mejores prácticas de SEO y rendimiento del mercado."
    }
]

export function WebDevelopmentTimeline() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    })

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return (
        <section ref={containerRef} className="relative w-full py-32 px-4 bg-[#030014] z-10 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                {/* Tarea 1: La Línea Láser */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-6xl font-black text-white text-center mb-32 tracking-tighter"
                >
                    4 Semanas para tu <span className="text-cyan-500 text-glow-cyan">Evolución Digital</span>
                </motion.h2>

                <div className="relative">
                    {/* Línea Base */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/10 -translate-x-1/2 hidden md:block" />

                    {/* Línea Láser Cyan Animada */}
                    <motion.div
                        className="absolute left-1/2 top-0 w-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] -translate-x-1/2 hidden md:block origin-top"
                        style={{ scaleY }}
                    />

                    <div className="space-y-24 relative z-10">
                        {/* Tarea 2: Nodos 1, 2 y 3 (Tarjetas Glassmorphism) */}
                        {MILESTONES.map((milestone, index) => (
                            <div key={index} className={`flex flex-col md:flex-row items-center justify-between w-full ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                <motion.div
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    className="w-full md:w-[45%] bg-white/[0.05] backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/[0.08] transition-all hover:border-cyan-400/50 group"
                                >
                                    <div className="text-cyan-500 font-mono text-xs tracking-[0.3em] mb-4 uppercase">{milestone.number}</div>
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-100 transition-colors">{milestone.title}</h3>
                                    <p className="text-zinc-400 leading-relaxed font-light">{milestone.description}</p>
                                </motion.div>
                                <div className="hidden md:block w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20" />
                                <div className="hidden md:block w-[45%]" />
                            </div>
                        ))}

                        {/* Tarea 3: Nodo 4 - El Remate Audiovisual (INYECCIÓN DE VIDEO) */}
                        <div className="flex flex-col items-center w-full">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="w-full max-w-4xl bg-white/[0.05] backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] hover:border-cyan-400/30 transition-all shadow-2xl"
                            >
                                <div className="text-center space-y-6 mb-10">
                                    <div className="text-cyan-500 font-mono text-xs tracking-[0.3em] uppercase">Semana 04</div>
                                    <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                        Lanzamiento y Ventas Automáticas
                                    </h3>
                                    <p className="text-zinc-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
                                        Tu plataforma entra en órbita. Estabilidad total, conversiones fluidas y la tranquilidad de tener un activo digital que trabaja por vos.
                                    </p>
                                </div>

                                <div className="rounded-2xl overflow-hidden border border-white/20 relative aspect-video group">
                                    <video
                                        src="/video/Man_sips_coffee_scrolls_phone_delpmaspu_.mp4"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Sutil Overlay Cyan */}
                                    <div className="absolute inset-0 bg-cyan-900/10 mix-blend-color pointer-events-none" />
                                    {/* Vignette for depth */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#030014]/60 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
