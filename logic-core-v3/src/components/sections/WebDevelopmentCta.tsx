"use client"

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

function MagneticButton({
    href,
    children,
}: {
    href: string
    children: React.ReactNode
}) {
    const buttonRef = useRef<HTMLAnchorElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.5 })
    const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.5 })
    const rotate = useTransform(springX, [-18, 18], [-3, 3])

    const handleMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const bounds = buttonRef.current?.getBoundingClientRect()
        if (!bounds) return

        const offsetX = event.clientX - (bounds.left + bounds.width / 2)
        const offsetY = event.clientY - (bounds.top + bounds.height / 2)
        const maxPull = 18

        x.set(Math.max(Math.min(offsetX * 0.22, maxPull), -maxPull))
        y.set(Math.max(Math.min(offsetY * 0.22, maxPull), -maxPull))
    }

    const reset = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.a
            ref={buttonRef}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMove}
            onMouseLeave={reset}
            onBlur={reset}
            style={{ x: springX, y: springY, rotate }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-[linear-gradient(135deg,#25d366,#128c7e)] px-8 py-4 text-[13px] font-extrabold uppercase tracking-[0.24em] text-white shadow-[0_18px_40px_rgba(37,211,102,0.18)]"
        >
            {children}
        </motion.a>
    )
}

export const WebDevelopmentCta = () => {
    const [showForm, setShowForm] = useState(false)

    return (
        <section className="relative z-10 w-full pb-32">
            <style>{`
                @keyframes pulse-live {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.55; transform: scale(0.88); }
                }
                @keyframes breathe-radial {
                    0%, 100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0.72;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.16);
                        opacity: 1;
                    }
                }
            `}</style>

            <div
                className="mx-auto my-[clamp(48px,7vh,80px)] h-px max-w-6xl"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
            />

            <div className="mx-auto w-full max-w-5xl px-4">
                <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-white/[0.02] px-[clamp(24px,5vw,80px)] py-[clamp(48px,7vh,92px)] text-center backdrop-blur-xl">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[44rem] w-[44rem]"
                        style={{
                            background: 'radial-gradient(circle, rgba(0,229,255,0.14) 0%, rgba(123,47,255,0.12) 34%, rgba(5,8,20,0.08) 58%, transparent 74%)',
                            filter: 'blur(80px)',
                            animation: 'breathe-radial 9s ease-in-out infinite',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),transparent_36%,transparent_72%,rgba(34,211,238,0.08))]"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#00e5ff_30%,#7b2fff_70%,transparent)]"
                    />

                    <div className="relative z-10">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/[0.08] px-4 py-2">
                            <span
                                className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]"
                                style={{ animation: 'pulse-live 2s ease-in-out infinite' }}
                            />
                            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-200">
                                Cupos limitados · 2 disponibles en las próximas 2 semanas
                            </span>
                        </div>

                        <div className="mb-5 text-[11px] uppercase tracking-[0.34em] text-white/28">
                            ¿SEGUÍS PERDIENDO CLIENTES A LAS 2AM?
                        </div>

                        <h2 className="mx-auto max-w-4xl text-[clamp(3rem,9vw,7rem)] font-black leading-[0.88] tracking-[-0.07em] text-white">
                            Tu competencia
                            <br />
                            <span className="bg-gradient-to-r from-white via-cyan-200 to-violet-200 bg-clip-text text-transparent">
                                ya se está actualizando.
                            </span>
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/48 md:text-lg">
                            Entrá ahora con una presencia digital que vende, posiciona y ordena la percepción de tu negocio antes de que el mercado lo haga por vos.
                        </p>

                        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#22c55e" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span className="text-[12px] text-white/62">
                                Consulta inicial gratuita · Sin compromiso
                            </span>
                        </div>

                        <div className="mt-10 flex flex-col items-center gap-4">
                            <MagneticButton
                                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493816223508'}?text=Hola%20DevelOP%2C%20quiero%20agendar%20un%20diagn%C3%B3stico%20para%20mi%20negocio`}
                            >
                                Agendar Diagnóstico →
                            </MagneticButton>

                            <button
                                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-transparent px-6 py-3 text-sm text-white/68 transition-all duration-200 hover:border-white/25 hover:text-white"
                                onClick={() => {
                                    setShowForm(true)
                                    setTimeout(() => {
                                        document.getElementById('contacto-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                                    }, 100)
                                }}
                            >
                                Completar formulario de contacto
                            </button>

                            <div className="mt-2 text-[11px] tracking-[0.05em] text-white/25">
                                Respondemos en menos de 2 horas en horario comercial
                            </div>

                            <div
                                id="contacto-form"
                                style={{
                                    maxHeight: showForm ? 640 : 0,
                                    opacity: showForm ? 1 : 0,
                                    marginTop: showForm ? 24 : 0,
                                }}
                                className="w-full max-w-[420px] overflow-hidden transition-all duration-500 ease-out"
                            >
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                    }}
                                    className="flex flex-col gap-3"
                                >
                                    <input
                                        type="text"
                                        placeholder="Tu nombre"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Tu WhatsApp"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
                                    />
                                    <select
                                        required
                                        defaultValue=""
                                        className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
                                    >
                                        <option value="" disabled hidden style={{ color: '#080810' }}>
                                            Mi rubro...
                                        </option>
                                        <option value="gastronomia" style={{ color: '#080810' }}>Gastronomía</option>
                                        <option value="comercio" style={{ color: '#080810' }}>Comercio</option>
                                        <option value="servicios" style={{ color: '#080810' }}>Servicios</option>
                                        <option value="salud" style={{ color: '#080810' }}>Salud</option>
                                        <option value="inmobiliaria" style={{ color: '#080810' }}>Inmobiliaria</option>
                                        <option value="otro" style={{ color: '#080810' }}>Otro</option>
                                    </select>
                                    <textarea
                                        rows={3}
                                        placeholder="Contanos brevemente tu negocio (opcional)"
                                        className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-300/40"
                                    />

                                    <button
                                        type="submit"
                                        className="mt-2 w-full rounded-xl border-0 bg-[linear-gradient(135deg,#00e5ff,#7b2fff)] px-4 py-3 text-sm font-bold text-[#080810]"
                                    >
                                        Enviar mensaje →
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
