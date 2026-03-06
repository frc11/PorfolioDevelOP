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

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full rounded-2xl bg-zinc-900/40 border border-violet-500/20 p-12 md:p-24 text-center relative overflow-hidden group shadow-[0_0_50px_rgba(139,92,246,0.05)] backdrop-blur-xl"
                >
                    {/* Internal subtle glow for the container */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-50" />

                    <h2 className="relative z-10 text-3xl md:text-5xl lg:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
                        ¿Listo para dar el salto <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                            tecnológico en tu industria?
                        </span>
                    </h2>

                    <p className="relative z-10 text-lg md:text-xl text-zinc-400 font-light mb-12 max-w-3xl mx-auto">
                        Desarrollamos una sola vez, para que dure años. ¿Hablamos de tu próximo SaaS o plataforma corporativa?
                    </p>

                    <div className="relative z-10 flex justify-center mt-10">
                        {/* Custom wrapper without Animated gradient to allow the Sweep effect inside MagneticCta properly */}
                        <MagneticCta variant="primary" className="!p-0 !bg-transparent !border-none !rounded-full hover:!shadow-none flex items-center justify-center">
                            <div className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 bg-violet-600 text-white font-black uppercase tracking-widest rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] cursor-pointer">
                                {/* Liquid Neon Shine Effect */}
                                <div className="absolute top-0 -left-[100%] w-12 h-24 bg-white/30 skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out z-20" />

                                <span className="relative z-30 flex items-center gap-3">
                                    DISEÑAR MI SISTEMA
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                                        <svg className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </span>
                            </div>
                        </MagneticCta>
                        <p className="absolute -bottom-10 z-10 text-[10px] md:text-xs text-zinc-500 font-mono uppercase tracking-widest w-full text-center">
                            Soporte cercano y desarrollo con estándares globales.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
