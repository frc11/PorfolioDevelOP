"use client"
import React from 'react'
import { motion } from 'framer-motion'

export const EnterpriseStandards = () => {
    return (
        <section className="w-full relative z-10 py-24 px-4 bg-void">
            <div className="max-w-6xl mx-auto">

                {/* Section Header */}
                <div className="mb-16 text-center md:text-left flex flex-col md:flex-row items-end justify-between gap-6 relative z-10">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4"
                        >
                            <span className="text-zinc-500 font-mono text-sm md:text-base block mb-2 tracking-widest uppercase">// Arquitectura Base</span>
                            Estándares <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Enterprise</span>.
                        </motion.h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Código Limpio */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="bg-zinc-900/50 hover:bg-zinc-800/80 p-8 rounded-2xl border border-white/5 transition-colors duration-300 flex flex-col group relative overflow-hidden"
                    >
                        {/* Subtle top glow */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent group-hover:via-blue-400/50 transition-all duration-300" />

                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Código Limpio</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Mantenibilidad absoluta. Tipado estricto con TypeScript, arquitecturas modulares y pipelines CI/CD automatizados para despliegues sin fricción.
                        </p>
                    </motion.div>

                    {/* Card 2: Seguridad Bancaria */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                        className="bg-zinc-900/50 hover:bg-zinc-800/80 p-8 rounded-2xl border border-white/5 transition-colors duration-300 flex flex-col group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent group-hover:via-indigo-400/50 transition-all duration-300" />

                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Seguridad Bancaria</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Protección por diseño. Encriptación End-to-End, flujos de autenticación robustos (OAuth/SAML) y cumplimiento estricto de normativas de datos.
                        </p>
                    </motion.div>

                    {/* Card 3: Escalabilidad Cloud */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                        className="bg-zinc-900/50 hover:bg-zinc-800/80 p-8 rounded-2xl border border-white/5 transition-colors duration-300 flex flex-col group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent group-hover:via-violet-400/50 transition-all duration-300" />

                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-violet-400 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Escalabilidad Cloud</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Infraestructura elástica. Preparado para absorber picos de tráfico masivos, escalando de 10k a 1 Millón de usuarios concurrentes de forma transparente.
                        </p>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
