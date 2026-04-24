"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'

export const SoftwareDevelopmentCta = () => {
    return (
        <section className="relative z-10 w-full py-40 md:py-56 flex items-center justify-center overflow-hidden">
            {/* Radial background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.07)_0%,transparent_60%)]" />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full rounded-2xl bg-zinc-900/40 border border-violet-500/20 p-12 md:p-24 text-center relative overflow-hidden group shadow-[0_0_50px_rgba(139,92,246,0.06)] backdrop-blur-xl"
                >
                    {/* Top shimmer line */}
                    <div
                        className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(99,102,241,0.6) 30%, rgba(139,92,246,0.8) 50%, rgba(99,102,241,0.6) 70%, transparent)",
                        }}
                    />

                    {/* Internal glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />

                    {/* Urgency badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 relative z-10"
                        style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.25)",
                        }}
                    >
                        <span
                            className="w-2 h-2 rounded-full bg-red-500"
                            style={{ boxShadow: "0 0 8px rgba(239,68,68,0.7)", animation: "pulse 2s infinite" }}
                        />
                        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-red-400">
                            Solo 3 proyectos por mes — 1 cupo disponible en Q2 2026
                        </span>
                    </motion.div>

                    <h2 className="relative z-10 text-3xl md:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
                        ¿Listo para dar el salto{" "}
                        <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                            tecnológico en tu empresa?
                        </span>
                    </h2>

                    <p className="relative z-10 text-lg md:text-xl text-zinc-400 font-light mb-4 max-w-2xl mx-auto">
                        Desarrollamos una sola vez, para que dure años. CRM, ERP y sistemas a medida
                        para empresas del NOA y toda Argentina.
                    </p>

                    <p className="relative z-10 text-sm text-zinc-500 mb-12 max-w-xl mx-auto">
                        La consulta inicial es gratuita y sin compromiso. Si decidís avanzar,
                        te enviamos una propuesta técnica en 48 horas.
                    </p>

                    <p className="relative z-10 text-sm font-semibold text-violet-200/90 mb-10 max-w-xl mx-auto">
                        Proyectos desde $1.500 USD · Entrega por etapas
                    </p>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.a
                            href="#diagnostico"
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            className="relative isolate inline-flex items-center gap-3 overflow-hidden rounded-xl px-10 py-5 text-white"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                boxShadow: '0 0 40px rgba(99,102,241,0.35), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                                fontSize: '14px',
                                fontWeight: 800,
                                letterSpacing: '0.08em',
                                textDecoration: 'none',
                                textTransform: 'uppercase',
                            }}
                        >
                            <motion.span
                                aria-hidden="true"
                                animate={{ x: ['-140%', '260%'] }}
                                transition={{
                                    duration: 1.05,
                                    repeat: Infinity,
                                    repeatDelay: 3.95,
                                    ease: 'easeInOut',
                                }}
                                className="pointer-events-none absolute inset-y-[-30%] left-[-45%] z-0 w-[42%] rotate-[18deg]"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
                                }}
                            />
                            <span className="relative z-10 flex items-center gap-3">
                                Reservar mi cupo
                                <ArrowRight size={16} strokeWidth={2.5} />
                            </span>
                        </motion.a>

                        <motion.a
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5493816223508'}?text=Hola%20develOP%2C%20quiero%20hablar%20sobre%20mi%20sistema%20a%20medida`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{
                                scale: 1.02,
                                borderColor: 'rgba(99,102,241,0.35)',
                                color: 'rgba(255,255,255,0.85)',
                            }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="inline-flex items-center gap-2.5 rounded-xl px-8 py-5 font-semibold text-sm"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.55)',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                textDecoration: 'none',
                                letterSpacing: '0.02em',
                            }}
                        >
                            <MessageCircle size={16} strokeWidth={1.5} />
                            WhatsApp directo
                        </motion.a>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="relative z-10 flex items-center justify-center gap-6 mt-8 flex-wrap"
                    >
                        {[
                            { label: 'Consulta gratuita' },
                            { label: 'Propuesta en 48hs' },
                            { label: 'Precio fijo, sin sorpresas' },
                            { label: 'El sistema es tuyo para siempre' },
                        ].map((badge, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2"
                                style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}
                            >
                                <div
                                    style={{
                                        width: '5px',
                                        height: '5px',
                                        borderRadius: '50%',
                                        background: '#6366f1',
                                        boxShadow: '0 0 6px rgba(99,102,241,0.6)',
                                        flexShrink: 0,
                                    }}
                                />
                                {badge.label}
                            </div>
                        ))}
                    </motion.div>

                    <p className="relative z-10 text-[11px] text-zinc-600 font-mono uppercase tracking-widest mt-8">
                        Tucumán · Argentina · Respondemos en &lt;4 horas hábiles
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
