"use client"
import React, { useRef, useEffect, useState } from 'react'
import { motion, useInView, useReducedMotion, useAnimate } from 'framer-motion'
import { Check, Search, MapPin } from 'lucide-react'

const searchTerms = [
    'corralón materiales Yerba Buena',
    'médico clínica San Miguel Tucumán',
    'restaurante delivery Yerba Buena',
]

function SearchBar() {
    const [index, setIndex] = useState(0)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false)
            setTimeout(() => {
                setIndex(prev => (prev + 1) % searchTerms.length)
                setVisible(true)
            }, 300)
        }, 2500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex items-center gap-4 bg-[#0a0a0a]/80 border border-white/5 rounded-2xl px-6 py-4 mb-6 shadow-inner ring-1 ring-white/5">
            <Search size={18} className="text-zinc-500 shrink-0" />
            <span
                className="text-zinc-400 font-light italic text-sm truncate"
                style={{ opacity: visible ? 1 : 0, transition: 'opacity 300ms ease' }}
            >
                {searchTerms[index]}
            </span>
        </div>
    )
}

const checks = [
    "Arquitectura Next.js (Indexación instantánea).",
    "LocalBusiness Schema Markup.",
    "Rendimiento Lighthouse 100/100."
]

export function WebDevelopmentSeo() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
    const prefersReduced = useReducedMotion()
    const shouldReveal = prefersReduced || isInView

    // useAnimate for the #1 result box-shadow highlight
    const [resultScope, animateResult] = useAnimate()

    useEffect(() => {
        if (!shouldReveal) return
        if (prefersReduced) return

        const timer = setTimeout(() => {
            animateResult(resultScope.current, {
                boxShadow: [
                    '0 0 0 1px rgba(0,229,255,0)',
                    '0 0 0 2px rgba(0,229,255,0.45)',
                    '0 0 0 1px rgba(0,229,255,0.15)'
                ]
            }, { duration: 0.8, ease: 'easeInOut' })
        }, 1200)

        return () => clearTimeout(timer)
    }, [shouldReveal, prefersReduced, animateResult, resultScope])

    const ease = [0.16, 1, 0.3, 1] as const

    return (
        <section ref={sectionRef} className="bg-[#030014] relative overflow-hidden py-24 px-4">
            {/* GLOW 1 — Cyan detrás del mock (derecha) */}
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: 0, right: '-100px', width: '600px', height: '100%', background: 'radial-gradient(ellipse at right center, rgba(0,229,255,0.07) 0%, transparent 65%)', filter: 'blur(80px)', zIndex: 0 }} />
            {/* GLOW 2 — Violet sutil detrás del título (izquierda/arriba) */}
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '-50px', left: '20%', width: '400px', height: '300px', background: 'radial-gradient(circle, rgba(123,47,255,0.05) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Columna Izquierda */}
                <div>
                    {/* 1. Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, delay: 0, ease: 'easeOut' }}
                        className="inline-flex items-center gap-2 mb-6"
                        style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '100px', padding: '5px 14px' }}
                    >
                        <span className="inline-block rounded-full" style={{ width: '6px', height: '6px', background: '#00e5ff', animation: 'pulse 2s ease-in-out infinite', flexShrink: 0 }} />
                        <span className="text-[10px] font-mono tracking-widest text-[#00e5ff] uppercase">
                            [ SEO TÉCNICO &amp; GEO-POSICIONAMIENTO ]
                        </span>
                    </motion.div>

                    {/* 2. H2 — two animated lines */}
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-8 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={shouldReveal ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                            transition={{ duration: 0.6, delay: 0.15, ease }}
                        >
                            Si no estás en la cima,
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={shouldReveal ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                            transition={{ duration: 0.6, delay: 0.25, ease }}
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">eres invisible.</span>
                        </motion.div>
                    </h2>

                    {/* 3. Paragraph + checks */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={shouldReveal ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                    >
                        <div className="space-y-6 text-zinc-400 text-lg font-light leading-relaxed">
                            <p>
                                Tener una web no sirve de nada si tus clientes no te encuentran. Optimizamos la arquitectura de tu plataforma para que el algoritmo de Google te posicione por encima de tu competencia.
                            </p>
                            <p className="border-l-2 border-emerald-500/30 pl-6 italic">
                                Implementamos <span className="text-white font-medium italic">micro-datos geolocalizados</span>. Cuando alguien busque tu servicio en tu ciudad, tu empresa aparecerá como la opción número uno.
                            </p>
                        </div>

                        {/* Separador gradiente */}
                        <div aria-hidden="true" style={{ height: '1px', margin: '20px 0', background: 'linear-gradient(90deg, rgba(0,229,255,0.2), transparent)', width: '60%' }} />

                        <ul className="mt-0 space-y-4">
                            {checks.map((check, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={shouldReveal ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4, delay: 0.4 + i * 0.08, ease: 'easeOut' }}
                                    className="flex items-center gap-3 text-zinc-200"
                                >
                                    <div className="p-1 rounded-full border shrink-0" style={{ background: 'rgba(0,229,255,0.12)', borderColor: 'rgba(0,229,255,0.3)' }}>
                                        <Check size={14} style={{ color: '#00e5ff' }} />
                                    </div>
                                    <span className="text-sm md:text-base font-medium">{check}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* 4. Columna Derecha: Mock Google */}
                <motion.div
                    initial={{ opacity: 0, x: 30, scale: 0.97 }}
                    animate={shouldReveal ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 30, scale: 0.97 }}
                    transition={{ duration: 0.7, delay: 0.3, ease }}
                    className="relative"
                >
                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group" aria-hidden="true" style={{ border: '1px solid rgba(0,229,255,0.15)' }}>

                        {/* Glow detrás del card */}
                        <div aria-hidden="true" style={{ position: 'absolute', inset: '-30px', background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.06) 0%, transparent 65%)', filter: 'blur(40px)', zIndex: -1, pointerEvents: 'none', borderRadius: 'inherit' }} />

                        {/* Google wordmark */}
                        <div className="mb-3" style={{ opacity: 0.7 }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#4285F4' }}>G</span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#EA4335' }}>o</span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#FBBC05' }}>o</span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#4285F4' }}>g</span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#34A853' }}>l</span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#EA4335' }}>e</span>
                        </div>

                        {/* Search Bar — rotating text */}
                        <SearchBar />

                        {/* Search Results */}
                        <div className="space-y-4">
                            {/* #1 Result — animated highlight via useAnimate */}
                            <div
                                ref={resultScope}
                                style={{ borderRadius: '6px', padding: '10px', background: 'rgba(0,229,255,0.04)', borderLeft: '2px solid #00e5ff', position: 'relative' }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#00e5ff', boxShadow: '0 0 8px rgba(0,229,255,0.8)' }} />
                                        <span className="text-[#00e5ff] font-mono text-[9px] tracking-widest uppercase">Puesto #1 Adquirido</span>
                                    </div>
                                    <MapPin size={12} className="text-[#00e5ff]" />
                                </div>
                                <div className="text-white font-black text-base tracking-tight mb-1">Tu Empresa</div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span style={{ fontSize: '9px', color: '#FBBC05' }}>★★★★★</span>
                                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>(124 reseñas)</span>
                                </div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>📍 Yerba Buena, Tucumán · Abierto ahora</div>
                            </div>

                            {/* #2 Result — Competencia */}
                            <div
                                className="rounded-2xl p-4 grayscale"
                                style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', opacity: 0.35 }}
                            >
                                <div className="text-zinc-500 font-bold text-sm mb-1">Empresa Competidora</div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>★★★☆☆</span>
                                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>(12 reseñas)</span>
                                </div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>📍 San Miguel de Tucumán</div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '12px', paddingTop: '8px', fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>
                            Página 1 de aproximadamente 4.230.000 resultados (0,42 seg.)
                        </div>

                        {/* Eye Candy */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 blur-[50px] rounded-full" style={{ background: 'rgba(0,229,255,0.05)' }} />
                    </div>
                </motion.div>

            </div>
        </section>
    )
}
