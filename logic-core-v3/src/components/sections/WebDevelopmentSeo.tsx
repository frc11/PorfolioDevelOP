"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Check, Search, MapPin } from 'lucide-react'

export function WebDevelopmentSeo() {
    return (
        <section className="bg-[#030014] relative overflow-hidden py-24 px-4">
            {/* Emerald Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Columna Izquierda: Copy B2B Dominio Local */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-6">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                            [ SEO TÉCNICO & GEO-POSICIONAMIENTO ]
                        </span>
                    </div>

                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-8">
                        Si no estás en la cima, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">eres invisible.</span>
                    </h2>

                    <div className="space-y-6 text-zinc-400 text-lg font-light leading-relaxed">
                        <p>
                            Tener una web no sirve de nada si tus clientes no te encuentran. Optimizamos la arquitectura de tu plataforma para que el algoritmo de Google te posicione por encima de tu competencia.
                        </p>
                        <p className="border-l-2 border-emerald-500/30 pl-6 italic">
                            Implementamos <span className="text-white font-medium italic">micro-datos geolocalizados</span>. Cuando alguien busque tu servicio en tu ciudad, tu empresa aparecerá como la opción número uno.
                        </p>
                    </div>

                    <ul className="mt-10 space-y-4">
                        {[
                            "Arquitectura Next.js (Indexación instantánea).",
                            "LocalBusiness Schema Markup.",
                            "Rendimiento Lighthouse 100/100."
                        ].map((check, i) => (
                            <li key={i} className="flex items-center gap-3 text-zinc-200">
                                <div className="bg-emerald-500/20 p-1 rounded-full border border-emerald-500/30">
                                    <Check size={14} className="text-emerald-400" />
                                </div>
                                <span className="text-sm md:text-base font-medium">{check}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Columna Derecha: Visual Radar/Búsqueda */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative"
                >
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">

                        {/* Search Bar Simulation */}
                        <div className="flex items-center gap-4 bg-[#0a0a0a]/80 border border-white/5 rounded-2xl px-6 py-4 mb-8 shadow-inner ring-1 ring-white/5">
                            <Search size={18} className="text-zinc-500" />
                            <span className="text-zinc-400 font-light italic">"Tus servicios en tu ciudad"</span>
                        </div>

                        {/* Search Results */}
                        <div className="space-y-6">
                            {/* #1 Result - Tu Empresa */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="border border-emerald-500/50 bg-emerald-500/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                        <span className="text-emerald-400 font-mono text-[10px] tracking-widest uppercase">Puesto #1 Adquirido</span>
                                    </div>
                                    <MapPin size={14} className="text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-3/4 bg-white/20 rounded-md" />
                                    <div className="h-3 w-1/2 bg-white/10 rounded-md" />
                                </div>
                                <div className="mt-4 text-emerald-300 font-black text-lg tracking-tight">Tu Empresa</div>
                            </motion.div>

                            {/* #2 Result - Competencia */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7 }}
                                className="border border-white/5 bg-white/[0.02] rounded-2xl p-6 opacity-40 grayscale"
                            >
                                <div className="space-y-2">
                                    <div className="h-3 w-2/3 bg-white/10 rounded-md" />
                                    <div className="h-2 w-1/3 bg-white/5 rounded-md" />
                                </div>
                                <div className="mt-4 text-zinc-500 font-bold text-sm">Empresa Competidora</div>
                            </motion.div>
                        </div>

                        {/* Visual Eye Candy */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 blur-[50px] rounded-full" />
                    </div>
                </motion.div>

            </div>
        </section>
    )
}
