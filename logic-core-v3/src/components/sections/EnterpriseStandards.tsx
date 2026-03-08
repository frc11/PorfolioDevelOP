"use client"
import React from 'react'
import { motion } from 'framer-motion'

export const EnterpriseStandards = () => {
    return (
        <section className="w-full relative z-10 py-24 px-4 bg-[#050505]">
            <div className="max-w-6xl mx-auto">

                {/* Section Header */}
                <div className="mb-20 text-center relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                    >
                        ¿Por qué tu empresa está frenada?
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Tarjeta 1 (Gestión) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col p-10 md:p-12 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-white/10 transition-colors duration-300"
                    >
                        <span className="text-zinc-500 font-mono text-xs font-bold tracking-widest uppercase mb-6">
                            EL PROBLEMA DEL EXCEL
                        </span>

                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
                            Datos descentralizados y errores humanos.
                        </h3>

                        <div className="mt-auto pt-8 border-t border-white/5">
                            <p className="text-zinc-400 leading-relaxed font-light">
                                Desarrollamos un <strong className="text-emerald-400/90 font-medium">ERP Centralizado</strong> donde controlas stock, ventas y personal en tiempo real, desde tu celular.
                            </p>
                        </div>
                    </motion.div>

                    {/* Tarjeta 2 (Integración) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="flex flex-col p-10 md:p-12 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-white/10 transition-colors duration-300"
                    >
                        <span className="text-zinc-500 font-mono text-xs font-bold tracking-widest uppercase mb-6">
                            EL PROBLEMA DEL SOFTWARE VIEJO
                        </span>

                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
                            Sistemas que no se comunican entre sí.
                        </h3>

                        <div className="mt-auto pt-8 border-t border-white/5">
                            <p className="text-zinc-400 leading-relaxed font-light">
                                Construimos <strong className="text-indigo-400/90 font-medium">APIs e Integraciones</strong> que conectan tu facturación, tu CRM y tu logística automáticamente.
                            </p>
                        </div>
                    </motion.div>

                </div>

            </div>
        </section>
    )
}
