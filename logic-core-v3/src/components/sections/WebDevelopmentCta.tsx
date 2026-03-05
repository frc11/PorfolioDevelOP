"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'

export const WebDevelopmentCta = () => {
    return (
        <section className="relative z-10 w-full py-40 md:py-56 flex items-center justify-center overflow-hidden bg-void">
            {/* Radial background glow (Violet/Fuchsia specific) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.06)_0%,transparent_60%)]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1]"
                >
                    Es hora de destacar en <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500 drop-shadow-[0_0_20px_rgba(167,139,250,0.2)]">
                        tu industria.
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-xl md:text-3xl text-zinc-400 font-light mb-16 max-w-4xl leading-relaxed"
                >
                    Ya sea un SaaS, un e-commerce corporativo o un portfolio de estudio. Hacemos que tu marca sea imposible de ignorar.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                    <MagneticCta variant="primary" className="group relative px-10 md:px-16 py-5 md:py-7 rounded-full overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-violet-400/80 transition-all duration-500 hover:shadow-[0_0_50px_rgba(167,139,250,0.3)] !text-white !font-bold">
                        {/* Hover internal glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <span className="relative z-10 text-white uppercase tracking-widest text-base md:text-lg flex items-center gap-4">
                            Comenzar Proyecto Web
                            <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors duration-300">
                                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform text-white group-hover:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
