"use client"
import React from 'react'
import { motion } from 'framer-motion'

export default function CtaAutomation() {
    return (
        <section className="relative py-32 w-full overflow-hidden">
            {/* Amber radial glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center z-0"
            >
                <div
                    className="w-[700px] h-[700px]"
                    style={{
                        background:
                            "radial-gradient(circle at center, rgba(245,158,11,0.06) 0%, transparent 60%)",
                    }}
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden rounded-2xl backdrop-blur-xl"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(249,115,22,0.03) 100%)",
                        border: "1px solid rgba(245,158,11,0.18)",
                        padding: "clamp(48px,7vh,80px) clamp(24px,6vw,80px)",
                        boxShadow:
                            "0 0 60px rgba(245,158,11,0.05), 0 20px 40px rgba(0,0,0,0.3)",
                    }}
                >
                    {/* Top shimmer */}
                    <div
                        className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(245,158,11,0.6) 30%, rgba(249,115,22,0.9) 50%, rgba(245,158,11,0.6) 70%, transparent)",
                        }}
                    />

                    {/* Urgency badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                        style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.22)",
                        }}
                    >
                        <span
                            className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                            style={{ boxShadow: "0 0 8px rgba(239,68,68,0.7)" }}
                        />
                        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-red-400">
                            Capacidad limitada — solo 3 implementaciones por mes
                        </span>
                    </motion.div>

                    <h2
                        className="font-black leading-[1.05] tracking-[-0.04em] text-white mb-4"
                        style={{ fontSize: "clamp(32px, 5vw, 62px)" }}
                    >
                        Tu empresa, en piloto automático{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            esta semana.
                        </span>
                    </h2>

                    <p
                        className="max-w-xl mx-auto text-base leading-relaxed mb-4"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                        Empezamos con un mapeo gratuito de tus procesos: identificamos las 3 automatizaciones
                        con mayor impacto en tu operación y te presentamos una propuesta técnica en 48 horas.
                    </p>

                    <p
                        className="max-w-xl mx-auto text-sm leading-relaxed mb-12"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                        Sin compromiso. Sin tecnicismos. Solo resultados concretos.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5493816223508'}?text=Hola%20develOP%2C%20quiero%20mapear%20mis%20procesos%20para%20automatizaci%C3%B3n`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm transition-all duration-300 hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                color: "#0a0800",
                                boxShadow:
                                    "0 0 30px rgba(245,158,11,0.3), 0 8px 20px rgba(0,0,0,0.3)",
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.547a.5.5 0 00.609.61l5.765-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-5.032-1.384l-.361-.214-3.718.941.972-3.634-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                            </svg>
                            Mapeo gratuito ahora
                        </a>

                        <a
                            href="/contact"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.6)",
                            }}
                        >
                            Ver casos reales →
                        </a>
                    </div>

                    <p
                        className="text-[11px] font-mono uppercase tracking-widest mt-8"
                        style={{ color: "rgba(255,255,255,0.22)" }}
                    >
                        Tucumán · Argentina · n8n · Make · APIs · IA
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
