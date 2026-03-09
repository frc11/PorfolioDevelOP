"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

export function WebDevelopmentComparison() {
    return (
        <section className="py-24 w-full bg-transparent relative z-10 px-4 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black text-white text-center mb-20 tracking-tighter"
                >
                    ¿Todavía vendés enviando <span className="text-red-500">PDFs</span> por WhatsApp?
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Columna Izquierda: El Caos */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-red-950/20 border border-red-500/20 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-md relative group"
                    >
                        <div className="mb-8">
                            <span className="text-red-500 font-mono text-xs tracking-widest uppercase mb-4 block">[ ESTADO_OBSOLETO ]</span>
                            <h3 className="text-3xl font-bold text-white tracking-tight">El Negocio Tradicional</h3>
                        </div>

                        <ul className="space-y-6">
                            {[
                                "Respondés los mismos precios 100 veces por día.",
                                "Dependés del algoritmo de Instagram para que te vean.",
                                "Tu catálogo en PDF está siempre desactualizado.",
                                "Perdés ventas a la madrugada porque estás durmiendo."
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                    <div className="mt-1 bg-red-500/10 p-1 rounded-full border border-red-500/20 flex-shrink-0">
                                        <X size={14} className="text-red-500" />
                                    </div>
                                    <span className="text-lg font-light leading-tight">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Columna Derecha: El Ecosistema DevelOP */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-cyan-950/30 border border-cyan-400/40 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.15)] relative overflow-hidden group"
                    >
                        {/* Glow Interno */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />

                        <div className="mb-8">
                            <span className="text-cyan-400 font-mono text-xs tracking-widest uppercase mb-4 block">[ SUCURSAL_DIGITAL_ACTIVA ]</span>
                            <h3 className="text-3xl font-bold text-white tracking-tight">La Sucursal Digital Automática</h3>
                        </div>

                        <ul className="space-y-6 relative z-10">
                            {[
                                "Tu catálogo online vende y cotiza 24/7.",
                                "Google te trae clientes locales que ya quieren comprar.",
                                "Integración directa: el cliente llega con el pedido armado.",
                                "Te posicionás como la empresa más profesional de tu rubro."
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-zinc-300 group-hover:text-white transition-colors">
                                    <div className="mt-1 bg-cyan-500/20 p-1 rounded-full border border-cyan-500/30 flex-shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                        <Check size={14} className="text-cyan-400" />
                                    </div>
                                    <span className="text-lg font-light leading-tight">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
