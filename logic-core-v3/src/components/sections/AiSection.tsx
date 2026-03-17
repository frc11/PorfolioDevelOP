'use client'
import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// ── Inline SVG Icons ──────────────────────────────────────────────
function ChatIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9v2m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}

function CalcIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M17.5 5.5L19 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    )
}

function TrendIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 7 22 7 22 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

// ── Data ──────────────────────────────────────────────────────────
interface AiCard {
    icon: React.ReactNode
    title: string
    copy: string
    tag: string
}

const cards: AiCard[] = [
    {
        icon: <ChatIcon />,
        title: 'Responde al instante',
        copy: 'Un asistente IA contesta preguntas de tus clientes las 24hs. Precios, horarios, disponibilidad — sin que vos toques el teléfono.',
        tag: 'ChatBot · IA Conversacional',
    },
    {
        icon: <CalcIcon />,
        title: 'Cotiza y agenda solo',
        copy: 'El cliente completa un formulario inteligente y recibe su presupuesto automático. Vos recibís el pedido listo para confirmar.',
        tag: 'Automatización · WhatsApp API',
    },
    {
        icon: <TrendIcon />,
        title: 'Se posiciona solo',
        copy: 'Contenido generado y optimizado por IA para que Google te encuentre en cada búsqueda local de tu rubro.',
        tag: 'SEO Automático · Contenido IA',
    },
]

const ease = [0.16, 1, 0.3, 1] as const

// ── Component ─────────────────────────────────────────────────────
export default function AiSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
    const prefersReduced = useReducedMotion()
    const shouldReveal = prefersReduced || isInView

    const [hoveredCard, setHoveredCard] = useState<number | null>(null)

    return (
        <section
            ref={sectionRef}
            id="ai-section"
            className="w-full relative overflow-hidden"
            style={{ background: '#080810', padding: 'clamp(80px, 10vh, 120px) 24px' }}
        >
            {/* GLOW 1 — Violet central */}
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse at center top, rgba(123,47,255,0.09) 0%, transparent 60%)', filter: 'blur(100px)', zIndex: 0 }} />
            {/* GLOW 2 — Cyan izquierda */}
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '40%', left: '-60px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 65%)', filter: 'blur(80px)', zIndex: 0 }} />
            {/* GLOW 3 — Cyan derecha */}
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '40%', right: '-60px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 65%)', filter: 'blur(80px)', zIndex: 0 }} />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Separador superior */}
                <div aria-hidden="true" style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)', marginBottom: 'clamp(40px, 6vh, 80px)' }} />

                {/* ── Bloque superior ── */}
                <div className="flex flex-col items-center text-center mb-16">

                    {/* 1. Label badge */}
                    <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, delay: 0, ease: 'easeOut' }}
                        className="inline-block font-mono uppercase mb-5"
                        style={{
                            fontSize: '11px', letterSpacing: '0.4em', color: '#00e5ff',
                            background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)',
                            borderRadius: '100px', padding: '5px 14px',
                        }}
                    >
                        [ INTELIGENCIA ARTIFICIAL APLICADA ]
                    </motion.span>

                    {/* 2. H2 — clipPath por línea */}
                    <h2
                        className="font-black tracking-tight leading-[1.05] flex flex-col items-center overflow-hidden"
                        style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}
                    >
                        <motion.span
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            animate={shouldReveal ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                            transition={{ duration: prefersReduced ? 0 : 0.7, delay: prefersReduced ? 0 : 0.1, ease }}
                            className="text-white"
                        >
                            Tu web que
                        </motion.span>
                        <motion.span
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            animate={shouldReveal ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                            transition={{ duration: prefersReduced ? 0 : 0.7, delay: prefersReduced ? 0 : 0.22, ease }}
                            className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(135deg, #00e5ff 0%, #7b2fff 100%)', WebkitBackgroundClip: 'text' }}
                        >
                            vende mientras dormís.
                        </motion.span>
                    </h2>

                    {/* 3. Subtítulo */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.5, delay: prefersReduced ? 0 : 0.4, ease: 'easeOut' }}
                        className="mt-5 text-center"
                        style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', maxWidth: '520px', lineHeight: 1.65 }}
                    >
                        No es ciencia ficción. Es lo que hace tu Sucursal Digital con IA integrada.
                    </motion.p>
                </div>

                {/* Demo Badge */}
                <div className="flex justify-center" style={{ marginBottom: '48px' }}>
                    <style>{`
                        @keyframes mascot-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.92)} }
                        @keyframes arrow-slide { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
                        .ai-demo-badge { transition: background 250ms ease, border-color 250ms ease; }
                        .ai-demo-badge:hover { background: rgba(123,47,255,0.14) !important; border-color: rgba(123,47,255,0.45) !important; }
                    `}</style>
                    <button
                        type="button"
                        aria-label="Probar asistente IA"
                        className="ai-demo-badge"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-mascot-chat'))}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'rgba(123,47,255,0.08)',
                            border: '1px solid rgba(123,47,255,0.25)',
                            borderRadius: '100px',
                            padding: '10px 20px 10px 12px',
                            cursor: 'pointer',
                        }}
                    >
                        {/* Avatar mascot */}
                        <div
                            style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #00e5ff, #7b2fff)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px', color: 'white', flexShrink: 0,
                                animation: 'mascot-pulse 2s ease-in-out infinite',
                            }}
                        >
                            ✦
                        </div>
                        {/* Text */}
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', lineHeight: 1.3 }}>
                                ¿Querés verlo en acción?
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                                Probá el asistente IA → hablá con la mascota
                            </div>
                        </div>
                        {/* Animated arrow */}
                        <span
                            aria-hidden="true"
                            style={{ color: '#7b2fff', fontSize: '16px', animation: 'arrow-slide 1.2s ease-in-out infinite' }}
                        >
                            →
                        </span>
                    </button>
                </div>

                {/* 4. Grid de 3 cards con stagger */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 24 }}
                            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                            transition={{ duration: prefersReduced ? 0 : 0.6, delay: prefersReduced ? 0 : 0.5 + i * 0.12, ease }}
                            whileHover={prefersReduced ? {} : { scale: 1.02 }}
                            onHoverStart={() => setHoveredCard(i)}
                            onHoverEnd={() => setHoveredCard(null)}
                            className="flex flex-col"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderTop: hoveredCard === i ? '2px solid rgba(0,229,255,0.5)' : '2px solid rgba(0,229,255,0.2)',
                                borderRadius: '16px',
                                padding: 'clamp(24px, 3vw, 36px)',
                                transition: 'border-color 200ms ease',
                                cursor: 'default',
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="flex items-center justify-center shrink-0"
                                style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', marginBottom: '16px', color: '#00e5ff' }}
                            >
                                {card.icon}
                            </div>

                            {/* Title */}
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                                {card.title}
                            </h3>

                            {/* Copy */}
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, flexGrow: 1 }}>
                                {card.copy}
                            </p>

                            {/* Tag chip */}
                            <div className="mt-5 inline-flex self-start" style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '100px', padding: '5px 12px' }}>
                                <span style={{ fontSize: '10px', color: '#00e5ff', fontWeight: 600, letterSpacing: '0.04em' }}>
                                    {card.tag}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA - CONSTRUIR MI SUCURSAL */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-12 w-full flex justify-center z-20"
                >
                    <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20construir%20mi%20sucursal%20digital`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-10 py-5 bg-gradient-to-br from-[#25d366] to-[#128c7e] text-white rounded-full font-extrabold text-[14px] uppercase tracking-wider shadow-[0_0_28px_rgba(37,211,102,0.2)] hover:scale(1.04) transition-transform active:scale(0.97) no-underline"
                    >
                        🚀 CONSTRUIR MI SUCURSAL →
                    </a>
                </motion.div>

                {/* 5. Ghost CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{ duration: 0.4, delay: prefersReduced ? 0 : 0.9, ease: 'easeOut' }}
                    className="flex justify-center mt-8"
                >
                    <Link
                        href="/ai-implementations"
                        style={{
                            display: 'inline-block',
                            border: '1px solid rgba(0,229,255,0.3)',
                            color: '#00e5ff',
                            borderRadius: '100px',
                            padding: '14px 32px',
                            fontSize: '14px',
                            letterSpacing: '0.05em',
                            textDecoration: 'none',
                            transition: 'background 250ms ease, border-color 250ms ease',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,229,255,0.08)';
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,229,255,0.6)'
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,229,255,0.3)'
                        }}
                    >
                        Ver todas las implementaciones de IA →
                    </Link>
                </motion.div>

                {/* Separador inferior */}
                <div aria-hidden="true" style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)', marginTop: 'clamp(40px, 6vh, 80px)' }} />

            </div>
        </section>
    )
}
