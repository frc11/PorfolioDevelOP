"use client"
import React from 'react'
import { motion } from 'framer-motion'

export const AIBentoGrid = () => {
    return (
        <section className="max-w-7xl mx-auto py-32 px-4 relative z-10 w-full">
            <div className="mb-16 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
                >
                    El Cerebro detrás de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Operación</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-zinc-400 max-w-2xl mx-auto text-lg"
                >
                    Sistemas que piensan, analizan y deciden en tiempo real mediante arquitecturas de IA avanzadas.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[300px] lg:auto-rows-[250px]">
                {/* --- Tarjeta 1: Agentes Autónomos --- */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="lg:col-span-2 lg:row-span-2 bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-8 flex flex-col relative overflow-hidden group"
                >
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all duration-700 group-hover:bg-cyan-500/20" />

                    <div className="relative z-10 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Agentes Autónomos</h3>
                        </div>
                        <p className="text-zinc-400 text-sm max-w-md">Flujos de trabajo que operan 24/7 de forma independiente tomando decisiones lógicas complejas.</p>
                    </div>

                    <div className="mt-auto relative z-10 flex-1 flex flex-col justify-end gap-3 w-full max-w-lg mx-auto lg:mx-0">
                        {/* Chat bubbles animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: -20 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 w-11/12 backdrop-blur-md"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="text-xs font-mono text-cyan-400">Agent.EXE</span>
                            </div>
                            <p className="text-sm text-zinc-300">Analizando 10,000 filas de Excel de ventas mensuales...</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 1.5 }}
                            className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl rounded-tr-sm p-4 w-11/12 self-end backdrop-blur-md"
                        >
                            <div className="flex items-center gap-2 mb-2 justify-end">
                                <span className="text-xs font-mono text-cyan-300">Status: Complete</span>
                                <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm text-white font-medium">Reporte generado. Anomalías detectadas: 3. <span className="text-green-400">ROI Proyectado: +15%</span></p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* --- Tarjeta 2: RAG & Bases de Datos --- */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-8 flex flex-col relative overflow-hidden group"
                >
                    <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-violet-500/20" />

                    <div className="relative z-10 mb-4">
                        <h3 className="text-xl font-bold text-white mb-2">Tu Propio Cerebro Corporativo</h3>
                        <p className="text-zinc-400 text-sm">Arquitecturas RAG. Consulta toda la documentación de tu empresa al instante.</p>
                    </div>

                    <div className="mt-auto relative z-10 flex-1 flex items-center justify-center">
                        <div className="relative w-full h-full min-h-[120px] flex items-center justify-center">
                            {/* Document to Nodes Animation SVG */}
                            <svg viewBox="0 0 200 150" className="w-full max-w-[150px] overflow-visible">
                                <motion.path
                                    d="M60 20 H140 V130 H60 Z"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="2"
                                    strokeDasharray="10 5"
                                    initial={{ opacity: 1, pathLength: 1 }}
                                    whileInView={{ opacity: 0.2, scale: 0.9 }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                />
                                {/* Nodes */}
                                <motion.circle cx="100" cy="75" r="8" fill="#8b5cf6"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    whileInView={{ scale: [1, 1.2, 1], opacity: 1 }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <motion.circle cx="60" cy="40" r="5" fill="#a78bfa"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 0.8 }}
                                    transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, repeatType: "reverse" }}
                                />
                                <motion.circle cx="140" cy="110" r="6" fill="#c4b5fd"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 0.9 }}
                                    transition={{ duration: 1.8, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
                                />
                                {/* Connecting Lines */}
                                <motion.path
                                    d="M60 40 L100 75 L140 110"
                                    fill="none"
                                    stroke="#8b5cf6"
                                    strokeWidth="1.5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    whileInView={{ pathLength: 1, opacity: 0.5 }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                {/* --- Tarjeta 3: Análisis Predictivo --- */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                    className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl p-8 flex flex-col relative overflow-hidden group"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/10 rounded-full blur-2xl pointer-events-none transition-all duration-700 group-hover:bg-green-500/20" />

                    <div className="relative z-10 mb-4">
                        <h3 className="text-xl font-bold text-white mb-2">Análisis Predictivo</h3>
                        <p className="text-zinc-400 text-sm">Modelos de visión y series temporales para anticipar tendencias y anomalías.</p>
                    </div>

                    <div className="mt-auto relative z-10 flex-1 flex items-end justify-center pt-8">
                        {/* Animated Line Chart SVG */}
                        <div className="w-full relative h-[100px] border-b border-l border-white/10 p-2 flex items-end">
                            <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                {/* Grid lines */}
                                <line x1="0" y1="33" x2="200" y2="33" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                <line x1="0" y1="66" x2="200" y2="66" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                                {/* Line Chart Rising */}
                                <motion.path
                                    d="M 0 90 Q 20 85, 40 70 T 80 50 T 120 40 T 160 15 T 200 5"
                                    fill="none"
                                    stroke="#22c55e"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    whileInView={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                                />

                                {/* Glow under line */}
                                <motion.path
                                    d="M 0 90 Q 20 85, 40 70 T 80 50 T 120 40 T 160 15 T 200 5 L 200 100 L 0 100 Z"
                                    fill="url(#greenGradient)"
                                    opacity="0.2"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 0.2 }}
                                    transition={{ duration: 2, delay: 0.2 }}
                                />
                                <defs>
                                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Point at end */}
                                <motion.circle
                                    cx="200" cy="5" r="4"
                                    fill="#fff"
                                    className="drop-shadow-[0_0_8px_rgba(34,197,94,1)]"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 2.1 }}
                                />
                            </svg>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    )
}
