"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export const AILargeCta = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section className="relative z-10 w-full py-40 md:py-48 flex items-center justify-center overflow-hidden">
            {/* Radial background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.08)_0%,transparent_60%)]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 text-center flex flex-col items-center">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1]"
                >
                    ¿Tu competencia ya <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                        integró IA? ¿Y tú?
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-xl md:text-3xl text-zinc-400 font-light mb-16 max-w-3xl"
                >
                    El momento de integrar IA no es el año que viene. Es hoy.
                </motion.p>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="group relative px-8 py-4 md:px-12 md:py-6 bg-transparent border border-emerald-500 overflow-hidden"
                >
                    {/* Ignition Fill Effect */}
                    <div className="absolute inset-0 bg-emerald-500 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-0" />

                    <span className="relative z-10 text-emerald-400 group-hover:text-black font-black tracking-[0.1em] lg:tracking-[0.2em] text-lg md:text-2xl flex items-center justify-center gap-4 transition-colors duration-300 uppercase">
                        DEPLOY YOUR DIGITAL BRAIN

                        <div className="relative w-10 h-10 flex items-center justify-center transition-colors duration-300 ml-2">
                            <ArrowRight className="w-6 h-6 text-emerald-400 group-hover:text-black transition-colors duration-300" />
                        </div>
                    </span>
                </motion.button>
            </div>
        </section>
    )
}
