"use client"
import React, { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

const microStats = [
    { value: '3s', label: 'para cautivar' },
    { value: '73%', label: 'abandona si es lenta' },
    { value: '5x', label: 'más conversión' },
]

const ease = [0.16, 1, 0.3, 1] as const

export const WebDevelopmentSensory = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
    const prefersReduced = !!useReducedMotion()
    const shouldReveal = prefersReduced || isInView

    return (
        <section ref={sectionRef} className="py-24 relative z-10 w-full bg-[#030014] overflow-hidden">

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Columna Izquierda */}
                    <div className="flex flex-col justify-center max-w-xl mx-auto lg:mx-0">

                        {/* 1. Label badge */}
                        <motion.span
                            initial={{ opacity: 0, y: -8 }}
                            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                            transition={{ duration: 0.4, delay: 0, ease: 'easeOut' }}
                            className="inline-block font-mono uppercase mb-5"
                            style={{
                                fontSize: '11px',
                                letterSpacing: '0.35em',
                                color: 'rgba(255,255,255,0.72)',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '100px',
                                padding: '5px 14px',
                                alignSelf: 'flex-start',
                            }}
                        >
                            [ RETENCIÓN VISUAL &amp; UI PREMIUM ]
                        </motion.span>

                        {/* 2. Título — dos líneas con clipPath */}
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight overflow-hidden">
                            <motion.div
                                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                                animate={shouldReveal ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                                transition={{ duration: prefersReduced ? 0 : 0.7, delay: prefersReduced ? 0 : 0.1, ease }}
                            >
                                Como te ven,
                            </motion.div>
                            <motion.div
                                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                                animate={shouldReveal ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                                transition={{ duration: prefersReduced ? 0 : 0.7, delay: prefersReduced ? 0 : 0.2, ease }}
                            >
                                <span className="text-cyan-500">te compran.</span>
                            </motion.div>
                        </h2>

                        {/* Línea de acento */}
                        <div
                            style={{
                                width: 'clamp(40px, 8%, 60px)',
                                height: '2px',
                                background: 'rgba(255,255,255,0.16)',
                                borderRadius: '100px',
                                margin: '16px 0 24px',
                            }}
                        />

                        {/* 3. Párrafo */}
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                            transition={{ duration: 0.5, delay: prefersReduced ? 0 : 0.4, ease: 'easeOut' }}
                            className="font-light leading-relaxed"
                            style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', maxWidth: '480px' }}
                        >
                            En el mercado digital, el diseño de tu web es tu local comercial. Si tu página es genérica o lenta, el cliente asume que tu servicio también lo es. Diseñamos experiencias visuales de lujo que elevan el estatus de tu marca y generan confianza instantánea.
                        </motion.p>

                        {/* 4. Stat row con stagger */}
                        <div className="flex items-center gap-0 mt-8">
                            {microStats.map((stat, i) => (
                                <React.Fragment key={i}>
                                    <motion.div
                                        className="flex flex-col items-start px-4 first:pl-0"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                                        transition={{ duration: 0.4, delay: prefersReduced ? 0 : 0.6 + i * 0.1, ease: 'easeOut' }}
                                    >
                                        <span style={{ fontSize: '22px', fontWeight: 900, color: '#00e5ff', lineHeight: 1 }}>
                                            {stat.value}
                                        </span>
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                                            {stat.label}
                                        </span>
                                    </motion.div>
                                    {i < microStats.length - 1 && (
                                        <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* 5. Columna Derecha — Video */}
                    <motion.div
                        initial={{ opacity: 0, x: 30, scale: 0.96 }}
                        animate={shouldReveal ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 30, scale: 0.96 }}
                        transition={{ duration: prefersReduced ? 0 : 0.8, delay: prefersReduced ? 0 : 0.2, ease }}
                        className="relative w-full max-w-2xl mx-auto lg:mx-0 flex justify-center lg:justify-end"
                    >
                        <div className="relative w-full transition-all duration-300">
                            {/* Premium Video Capsule — no device frame */}
                            <div className="relative w-full overflow-hidden pointer-events-none rounded-2xl border border-white/10 bg-[#0A0A0A] aspect-[16/9]">
                                {/* Video — 112% scale crop to push watermark out of visible area */}
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    style={{
                                        width: '124%',
                                        height: '124%',
                                        objectFit: 'cover',
                                        objectPosition: 'center center',
                                        marginLeft: '0%',
                                        marginTop: '-12%',
                                        display: 'block',
                                    }}
                                    src="/video/Male_business_owner_opens_laptop_delpmaspu_.mp4"
                                />

                                {/* Overlay inferior */}
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 pointer-events-none"
                                    style={{ background: 'linear-gradient(to top, rgba(8,8,16,0.4) 0%, transparent 40%)' }}
                                />

                                {/* Badge "0.05 segundos" */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                                    transition={{ duration: 0.4, delay: prefersReduced ? 0 : 1.0, ease: 'easeOut' }}
                                    className="absolute pointer-events-none"
                                    style={{
                                        bottom: '16px', left: '16px', zIndex: 20,
                                        background: '#0A0A0A',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                    }}
                                >
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
                                        Primera impresión
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                                        3 segundos
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}

