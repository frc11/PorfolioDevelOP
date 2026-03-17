"use client"
import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'

interface Query {
    text: string;
    rubro: string;
}

const queries: Query[] = [
    { text: 'Corralón en Yerba Buena', rubro: 'Corralón' },
    { text: 'Estética en Barrio Norte Tucumán', rubro: 'Estética' },
    { text: 'Clínica odontológica en Salta', rubro: 'Clínica' },
    { text: 'Distribuidora de alimentos Tucumán', rubro: 'Distribuidora' },
    { text: 'Restaurante en San Miguel Tucumán', rubro: 'Restaurante' },
]

function GoogleSimulator() {
    const [currentQuery, setCurrentQuery] = useState('')
    const [activeRubro, setActiveRubro] = useState(0)
    const [showResults, setShowResults] = useState(false)
    const [typing, setTyping] = useState(false)
    const prefersReduced = useReducedMotion()

    useEffect(() => {
        if (prefersReduced) {
            setCurrentQuery(queries[activeRubro].text)
            setShowResults(true)
            const timer = setTimeout(() => {
                setActiveRubro(prev => (prev + 1) % queries.length)
            }, 4000)
            return () => clearTimeout(timer)
        }

        const query = queries[activeRubro]
        let charIdx = 0
        setCurrentQuery('')
        setShowResults(false)
        setTyping(true)

        const typeInterval = setInterval(() => {
            if (charIdx < query.text.length) {
                setCurrentQuery(query.text.slice(0, charIdx + 1))
                charIdx++
            } else {
                clearInterval(typeInterval)
                setTyping(false)
                setTimeout(() => {
                    setShowResults(true)
                    setTimeout(() => {
                        setActiveRubro(prev => (prev + 1) % queries.length)
                    }, 3500)
                }, 400)
            }
        }, 60)

        return () => clearInterval(typeInterval)
    }, [activeRubro, prefersReduced])

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', width: '100%' }}>
            {/* Barra de búsqueda Google */}
            <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '28px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                boxShadow: '0 0 0 1px rgba(0,229,255,0.15), 0 4px 24px rgba(0,0,0,0.4)',
            }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>🔍</span>
                <div style={{
                    flex: 1,
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.85)',
                    fontFamily: 'ui-sans-serif, system-ui',
                    minHeight: '22px',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    {currentQuery}
                    {typing && (
                        <span style={{
                            display: 'inline-block',
                            width: '2px',
                            height: '18px',
                            background: 'rgba(0,229,255,0.8)',
                            marginLeft: '2px',
                            animation: 'cursorBlink 0.7s ease-in-out infinite',
                            verticalAlign: 'middle',
                        }} />
                    )}
                </div>
                <div style={{
                    background: 'rgba(0,229,255,0.1)',
                    border: '1px solid rgba(0,229,255,0.25)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    color: 'rgba(0,229,255,0.8)',
                    fontWeight: 600,
                    flexShrink: 0,
                }}>
                    Buscar
                </div>
            </div>

            {/* Resultados de búsqueda */}
            <AnimatePresence mode="wait">
                {showResults && (
                    <motion.div
                        key={activeRubro}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                    >
                        {/* RESULTADO 1 — TU NEGOCIO */}
                        <div style={{
                            background: 'rgba(0,229,255,0.07)',
                            border: '1px solid rgba(0,229,255,0.3)',
                            borderRadius: '12px',
                            padding: '14px 18px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 0 20px rgba(0,229,255,0.1)',
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0,
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent, #00e5ff 40%, #7b2fff 60%, transparent)',
                            }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span style={{
                                    fontSize: '9px', fontWeight: 700,
                                    background: 'rgba(0,229,255,0.15)',
                                    border: '1px solid rgba(0,229,255,0.3)',
                                    color: '#00e5ff',
                                    borderRadius: '4px',
                                    padding: '1px 6px',
                                    letterSpacing: '0.1em',
                                }}>#1</span>
                                <span style={{ fontSize: '11px', color: 'rgba(0,229,255,0.5)', fontFamily: 'monospace' }}>
                                    {queries[activeRubro].rubro.toLowerCase()}.com.ar
                                </span>
                            </div>
                            <p style={{ fontSize: '16px', fontWeight: 700, color: '#00e5ff', margin: '0 0 4px' }}>
                                {queries[activeRubro].rubro} — Tu Empresa · DevelOP
                            </p>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
                                El mejor {queries[activeRubro].rubro.toLowerCase()} en tu zona. Consultá precios, pedí presupuesto online. ⭐⭐⭐⭐⭐
                            </p>
                            <div style={{
                                position: 'absolute', top: '12px', right: '14px',
                                background: 'rgba(0,229,255,0.12)',
                                border: '1px solid rgba(0,229,255,0.3)',
                                borderRadius: '100px',
                                padding: '3px 10px',
                                fontSize: '9px',
                                fontWeight: 700,
                                color: '#00e5ff',
                                letterSpacing: '0.15em',
                            }}>TU EMPRESA</div>
                        </div>

                        {/* RESULTADO 2 — Competencia */}
                        {['Resultados de negocios similares...', 'Ver más resultados de tu zona'].map((text, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                opacity: 0.5 - i * 0.15,
                            }}>
                                <div style={{ height: '12px', width: `${70 - i * 15}%`, background: 'rgba(255,255,255,0.15)', borderRadius: '4px', marginBottom: '6px' }} />
                                <div style={{ height: '10px', width: `${85 - i * 10}%`, background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.p
                initial={{ opacity: 0 }}
                animate={showResults ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.5 }}
                style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}
            >
                Esto es lo que ven tus clientes cuando te buscan. ¿Aparecés o le regalás ese cliente a tu competencia?
            </motion.p>
        </div>
    )
}

const checks = [
    "Google te encuentra primero (Datos optimizados).",
    "Tu negocio en el mapa real (Posicionamiento NOA).",
    "Velocidad que Google premia (Prioridad en carga)."
]

export function WebDevelopmentSeo() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
    const prefersReduced = useReducedMotion()
    const shouldReveal = prefersReduced || isInView

    const ease = [0.16, 1, 0.3, 1] as const

    return (
        <section ref={sectionRef} className="bg-[#030014] relative overflow-hidden py-24 px-4 border-y border-white/5">
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '100%', background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.05) 0%, transparent 65%)', filter: 'blur(80px)', zIndex: 0 }} />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, delay: 0, ease: 'easeOut' }}
                        className="inline-flex items-center gap-2 mb-6"
                        style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '100px', padding: '5px 14px' }}
                    >
                        <span className="inline-block rounded-full" style={{ width: '6px', height: '6px', background: '#00e5ff', animation: 'pulse 2s ease-in-out infinite', flexShrink: 0 }} />
                        <span className="text-[10px] font-mono tracking-widest text-[#00e5ff] uppercase">
                            [ POSICIONAMIENTO LOCAL ]
                        </span>
                    </motion.div>

                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-8 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6, delay: 0.1, ease }}
                        >
                            Si no estás en Google,
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6, delay: 0.2, ease }}
                        >
                            <span className="text-[#00e5ff]">no existís.</span>
                        </motion.div>
                    </h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10"
                    >
                        Cada día, cientos de personas en tu ciudad buscan tu rubro en Google. ¿Las estás captando o se las estás regalando a tu competencia?
                    </motion.p>

                    <div className="flex flex-wrap justify-center gap-6 mb-12">
                        {checks.map((check, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={shouldReveal ? { opacity: 1, x: 0 } : {}}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-2 text-zinc-300 text-sm font-medium"
                            >
                                <div className="p-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                                    <Check size={12} className="text-cyan-400" />
                                </div>
                                {check}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, delay: 0.4, ease }}
                >
                    <GoogleSimulator />
                </motion.div>

                {/* CTA - QUIERO APARECER PRIMERO */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 w-full flex justify-center z-20"
                >
                    <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20aparecer%20primero%20en%20Google%20en%20mi%20ciudad`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-10 py-5 bg-gradient-to-br from-[#25d366] to-[#128c7e] text-white rounded-full font-extrabold text-[14px] uppercase tracking-wider shadow-[0_0_28px_rgba(37,211,102,0.2)] hover:scale(1.04) transition-transform active:scale(0.97) no-underline"
                    >
                        🚀 QUIERO APARECER PRIMERO →
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
