"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'

export const SoftwareDevelopmentCta = () => {
    return (
        <section className="relative z-10 w-full py-40 md:py-56 flex items-center justify-center overflow-hidden bg-void">
            {/* Radial background glow (Blue/Indigo specific) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_60%)]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1]"
                >
                    El código barato <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        sale caro.
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-xl md:text-3xl text-zinc-400 font-light mb-16 max-w-4xl leading-relaxed"
                >
                    Desarrollamos una sola vez, para que dure años. ¿Hablamos de tu próximo SaaS o plataforma corporativa?
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="group relative px-10 md:px-16 py-5 md:py-7 rounded-full overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 hover:border-blue-400/80 transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] !text-white !font-bold">
                        {/* Hover internal glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <span className="relative z-10 text-white uppercase tracking-widest text-base md:text-lg flex items-center gap-4">
                            Cotizar Proyecto a Medida
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform text-zinc-300 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </span>
                    </MagneticCta>
                </motion.div>
            </div>
        </section>
    )
}
