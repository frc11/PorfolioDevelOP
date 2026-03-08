"use client"
import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const MILESTONES = [
    {
        number: "Semana 01",
        title: "Auditoría de Conversión Local.",
        description: "Estudiamos a tu competencia local. Definimos la estructura exacta para que el usuario termine haciendo clic en el botón de WhatsApp."
    },
    {
        number: "Semana 02",
        title: "Diseño de Interfaces de Alta Gama.",
        description: "Diseñamos la interfaz visual (como la que estás viendo) y te la presentamos. No programamos nada hasta que estés 100% orgulloso del diseño."
    },
    {
        number: "Semana 03",
        title: "Arquitectura y Código en Next.js.",
        description: "Escribimos código limpio y a medida. Sin plantillas pesadas de WordPress, asegurando que Google te posicione primero por ser el más rápido."
    },
    {
        number: "Semana 04",
        title: "Despliegue y Conexión de Ventas.",
        description: "Lanzamos tu web en servidores de alta disponibilidad y conectamos tus herramientas de venta (CRM, Analytics, WhatsApp)."
    }
]

export function WebDevelopmentTimeline() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const yMove = useTransform(scrollYProgress, [0, 1], [50, -50])

    return (
        <section ref={containerRef} className="relative w-full py-24 md:py-32 px-4 bg-transparent md:bg-[#030014] z-10 overflow-hidden">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                            De la idea al código en 4 semanas.
                        </h2>
                    </motion.div>
                </div>

                <div className="relative">
                    {/* The subtle vertical line connecting the steps */}
                    <div className="absolute left-[27px] md:left-1/2 top-4 bottom-4 w-[1px] bg-white/[0.05] md:-translate-x-1/2" />
                    {/* Animated Progress Line */}
                    <motion.div
                        className="absolute left-[27px] md:left-1/2 top-4 w-[1px] bg-white md:-translate-x-1/2 origin-top shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        style={{ height: "calc(100% - 2rem)", scaleY: scrollYProgress }}
                    />

                    <div className="space-y-8 relative z-10">
                        {MILESTONES.map((milestone, index) => {
                            const isEven = index % 2 === 0

                            return (
                                <motion.div
                                    key={milestone.number}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 ${isEven ? 'md:flex-row-reverse' : ''}`}
                                >
                                    {/* Minimal Dot */}
                                    <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-black border border-white/20 md:-translate-x-1/2 z-20 mt-6 md:mt-0" />

                                    {/* Card Content */}
                                    <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                                        <div className="p-8 rounded-2xl bg-[#050505] border border-white/[0.05] hover:border-white/[0.1] transition-colors duration-300">
                                            <div className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-4 ${isEven ? 'md:justify-end' : 'justify-start'}`}>
                                                <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                                                    {milestone.number}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white tracking-tight mb-3">
                                                {milestone.title}
                                            </h3>
                                            <p className="text-zinc-400 leading-relaxed font-light text-sm md:text-base">
                                                {milestone.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Empty space for the other side of the timeline to balance flex */}
                                    <div className="hidden md:block md:w-1/2" />
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
