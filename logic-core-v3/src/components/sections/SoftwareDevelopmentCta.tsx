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
                    className="text-xl md:text-3xl text-zinc-400 font-light mb-12 max-w-4xl leading-relaxed"
                >
                    Desarrollamos una sola vez, para que dure años. ¿Hablamos de tu próximo SaaS o plataforma corporativa?
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="text-sm md:text-base font-mono text-blue-400 tracking-widest uppercase mb-6"
                >
                    Ready to scale your infrastructure?
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="relative"
                >
                    <MagneticCta variant="primary" className="group relative px-12 md:px-20 py-6 md:py-8 rounded-full overflow-hidden bg-white/5 backdrop-blur-xl border border-violet-500/50 hover:bg-white/10 transition-all duration-500 hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] !text-white !font-bold">

                        {/* Sweeping Light Effect (Premium Glass Reflection) */}
                        <motion.div
                            className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-30deg]"
                            animate={{ left: ["-100%", "200%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                        />

                        {/* Persistent inner violet glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-indigo-500/0 opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <span className="relative z-10 text-white uppercase tracking-widest text-lg md:text-xl flex items-center justify-center gap-4 w-full">
                            Engineer Solution

                            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/40 transition-colors duration-300 border border-violet-400/30">
                                <svg className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
