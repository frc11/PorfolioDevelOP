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
                        className="bg-white/[0.02] border border-white/10 hover:border-orange-500/30 backdrop-blur-xl rounded-3xl p-10 flex flex-col items-center justify-center text-center overflow-hidden relative group transition-colors duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-transparent to-amber-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                            <h3 className="text-6xl lg:text-7xl font-mono font-black text-orange-400 mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                                100%
                            </h3>
                            <p className="text-zinc-400 text-sm md:text-base font-medium uppercase tracking-widest max-w-[250px] mx-auto leading-relaxed">
                                Eliminación de tareas de Data Entry manual.
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
                        className="bg-white/[0.02] border border-white/10 hover:border-orange-500/30 backdrop-blur-xl rounded-3xl p-10 flex flex-col items-center justify-center text-center overflow-hidden relative group transition-colors duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-orange-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                            <h3 className="text-6xl lg:text-7xl font-mono font-black text-orange-400 mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                                40h+
                            </h3>
                            <p className="text-zinc-400 text-sm md:text-base font-medium uppercase tracking-widest max-w-[250px] mx-auto leading-relaxed">
                                Tiempo promedio recuperado por empleado al mes.
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
                        className="bg-white/[0.02] border border-white/10 hover:border-orange-500/30 backdrop-blur-xl rounded-3xl p-10 flex flex-col items-center justify-center text-center overflow-hidden relative group transition-colors duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-transparent to-orange-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                            <h3 className="text-6xl lg:text-7xl font-mono font-black text-orange-400 mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                                24/7
                            </h3>
                            <p className="text-zinc-400 text-sm md:text-base font-medium uppercase tracking-widest max-w-[250px] mx-auto leading-relaxed">
                                Tus procesos ejecutándose de fondo, sin pausas ni errores.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
