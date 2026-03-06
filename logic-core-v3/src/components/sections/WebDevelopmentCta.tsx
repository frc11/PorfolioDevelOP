"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'

export const WebDevelopmentCta = () => {
    return (
        <section className="relative z-10 w-full py-40 md:py-56 flex items-center justify-center overflow-hidden bg-transparent">
            {/* Radial background glow (Cyan specific) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0%,transparent_60%)]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-12 leading-[1.1] max-w-5xl"
                >
                    ¿Tu sitio web actual refleja la <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        verdadera calidad de tu empresa?
                    </span>
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="relative"
                >
                    {/* Pulsing Energy Rings */}
                    <div className="absolute inset-0 bg-cyan-500/40 rounded-full blur-md animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1s' }} />

                    {/* The Button */}
                    <MagneticCta variant="primary" className="group relative px-12 md:px-20 py-6 md:py-8 rounded-full overflow-hidden bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:shadow-[0_0_60px_rgba(34,211,238,0.8)] !text-black !font-black !w-full !h-full border-2 border-cyan-300">

                        <span className="relative z-10 text-black uppercase tracking-widest text-lg md:text-xl flex items-center justify-center gap-4">
                            CREAR MI WEB PREMIUM
                            <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors duration-300">
                                <svg className="w-6 h-6 transform group-hover:translate-x-1.5 transition-transform text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </span>
                    </MagneticCta>
                    <p className="absolute -bottom-10 z-10 text-[10px] md:text-xs text-zinc-500 font-mono uppercase tracking-widest w-full text-center">
                        Diseño de vanguardia, carga en milisegundos y optimización total para celulares.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
