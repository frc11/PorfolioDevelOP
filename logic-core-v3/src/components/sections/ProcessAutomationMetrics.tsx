"use client"
import React from 'react'
import { motion } from 'framer-motion'

export const ProcessAutomationMetrics = () => {
    return (
        <section className="w-full relative z-10 py-24 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Metric 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-10 flex flex-col items-center justify-center text-center overflow-hidden relative group cursor-default"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-cyan-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                            <h3 className="text-6xl lg:text-7xl font-mono font-black text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all duration-300">
                                99.9<span className="text-emerald-400">%</span>
                            </h3>
                            <p className="text-zinc-400 text-sm md:text-base font-medium uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                                Reducción de errores manuales en carga de datos
                            </p>
                        </div>
                    </motion.div>

                    {/* Metric 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                        className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-10 flex flex-col items-center justify-center text-center overflow-hidden relative group cursor-default"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-emerald-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                            <h3 className="text-6xl lg:text-7xl font-mono font-black text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300">
                                40h<span className="text-cyan-400">+</span>
                            </h3>
                            <p className="text-zinc-400 text-sm md:text-base font-medium uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                                Horas promedio ahorradas por empleado al mes
                            </p>
                        </div>
                    </motion.div>

                    {/* Metric 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                        className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-10 flex flex-col items-center justify-center text-center overflow-hidden relative group cursor-default"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-emerald-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                            <h3 className="text-6xl lg:text-7xl font-mono font-black text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300">
                                24/7
                            </h3>
                            <p className="text-zinc-400 text-sm md:text-base font-medium uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                                Operación continua sin dependencias humanas
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
