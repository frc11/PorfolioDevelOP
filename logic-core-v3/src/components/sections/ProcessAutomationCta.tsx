"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export const ProcessAutomationCta = () => {
    return (
        <section className="relative z-10 w-full py-40 md:py-56 flex items-center justify-center overflow-hidden">
            {/* Radial background glow (Orange specific for this page) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.06)_0%,transparent_60%)]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-16 leading-[1.2]"
                >
                    El trabajo repetitivo es para las máquinas.<br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                        La estrategia es para ti.
                    </span>
                </motion.h2>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-black tracking-widest px-10 py-5 rounded-full shadow-[0_0_30px_rgba(234,88,12,0.3)] hover:shadow-[0_0_50px_rgba(234,88,12,0.6)] transition-all scale-100 hover:scale-105 flex items-center justify-center gap-4 uppercase"
                >
                    AUDITAR MIS PROCESOS
                    <Zap className="w-5 h-5 fill-white" />
                </motion.button>
            </div>
        </section>
    )
}
