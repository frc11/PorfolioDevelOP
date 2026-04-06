"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'

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

                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <MagneticCta>
                            <div className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 bg-violet-600 text-white font-black uppercase tracking-widest rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] cursor-none text-sm">
                                <div className="absolute top-0 -left-[100%] w-12 h-24 bg-white/30 skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out z-20" />
                                <span className="relative z-30 flex items-center gap-3">
                                    RESERVAR MI CUPO
                                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </div>
                        </MagneticCta>

                        <a
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5493816223508'}?text=Hola%20develOP%2C%20quiero%20hablar%20sobre%20mi%20sistema%20a%20medida`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105"
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.7)",
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.547a.5.5 0 00.609.61l5.765-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-5.032-1.384l-.361-.214-3.718.941.972-3.634-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                            </svg>
                            WhatsApp directo
                        </a>
                    </div>

                    <p className="relative z-10 text-[11px] text-zinc-600 font-mono uppercase tracking-widest mt-8">
                        Tucumán · Argentina · Respondemos en &lt;4 horas hábiles
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
