"use client"
import React from 'react'
import { motion } from 'framer-motion'

export function SoftwareArchitecture() {
    return (
        <section className="w-full relative z-10 py-24 px-4 bg-[#050505]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-20 text-center relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4"
                    >
                        Construido para no fallar jamás.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-zinc-400 font-light max-w-3xl mx-auto"
                    >
                        Utilizamos la misma tecnología que los bancos y las empresas de Silicon Valley para garantizar que tu negocio opere 24/7 sin caídas.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                    {/* Item 1 */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0 }}
                        className="border-l border-white/10 pl-6 py-4"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">PostgreSQL</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">Bases de datos relacionales blindadas. Tu información comercial, 100% segura.</p>
                    </motion.div>

                    {/* Item 2 */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="border-l border-white/10 pl-6 py-4"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Node.js & C#</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">Motores de alto rendimiento para procesar miles de transacciones por segundo.</p>
                    </motion.div>

                    {/* Item 3 */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="border-l border-white/10 pl-6 py-4"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Next.js / React</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">Interfaces modernas y veloces. Tus empleados amarán usar el sistema.</p>
                    </motion.div>

                    {/* Item 4 */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="border-l border-white/10 pl-6 py-4"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Python AI Core</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">Preparado desde el día 1 para integrar algoritmos predictivos e Inteligencia Artificial.</p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
