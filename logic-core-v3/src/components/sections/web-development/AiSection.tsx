'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'

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

type AiCard = {
    icon: React.ReactNode
    title: string
    copy: string
    tag: string
    accentFrom: string
    accentTo: string
    accentRgb: string
}

const cards: AiCard[] = [
    {
        icon: <ChatIcon />,
        title: 'Responde al instante',
        copy: 'Un asistente IA contesta preguntas de tus clientes las 24hs. Precios, horarios y disponibilidad, sin que vos toques el telefono.',
        tag: 'ChatBot · IA conversacional',
        accentFrom: '#22d3ee',
        accentTo: '#38bdf8',
        accentRgb: '34,211,238',
    },
    {
        icon: <CalcIcon />,
        title: 'Cotiza y agenda solo',
        copy: 'El cliente completa un formulario inteligente y recibe su presupuesto automatico. Vos recibis el pedido listo para confirmar.',
        tag: 'Automatizacion · WhatsApp API',
        accentFrom: '#38bdf8',
        accentTo: '#a78bfa',
        accentRgb: '56,189,248',
    },
    {
        icon: <TrendIcon />,
        title: 'Se posiciona solo',
        copy: 'Contenido generado y optimizado por IA para que Google te encuentre en cada busqueda local de tu rubro.',
        tag: 'SEO automatico · Contenido IA',
        accentFrom: '#67e8f9',
        accentTo: '#8b5cf6',
        accentRgb: '139,92,246',
    },
]

const ease = [0.16, 1, 0.3, 1] as const

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
            className="relative w-full overflow-hidden"
            style={{ background: '#00010c', padding: 'clamp(86px, 10vh, 130px) 24px' }}
        >
            <style>{`
                @keyframes mascot-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.72;transform:scale(0.9)} }
                @keyframes arrow-slide { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
                @keyframes ai-shimmer { 0%{transform:translateX(-140%)} 100%{transform:translateX(170%)} }
                @keyframes ai-title-shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                @keyframes ai-orb-float { 0%,100% { transform: translateY(0px); opacity: 0.45; } 50% { transform: translateY(-10px); opacity: 0.78; } }

                .ai-demo-badge {
                    transition: border-color 260ms ease, transform 260ms ease, box-shadow 260ms ease, background 260ms ease;
                }

                .ai-demo-badge:hover {
                    transform: translateY(-2px) scale(1.01);
                    border-color: rgba(34,211,238,0.62) !important;
                    box-shadow: 0 0 0 1px rgba(34,211,238,0.26), 0 18px 42px rgba(0,0,0,0.4), 0 0 36px rgba(56,189,248,0.24) !important;
                    background: linear-gradient(120deg, rgba(8,47,73,0.52) 0%, rgba(30,41,59,0.72) 54%, rgba(76,29,149,0.44) 100%) !important;
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    background:
                        'radial-gradient(120% 86% at 50% 0%, rgba(30,64,175,0.24) 0%, rgba(0,1,12,0) 60%), radial-gradient(96% 74% at 86% 88%, rgba(76,29,149,0.18) 0%, rgba(0,1,12,0) 70%), radial-gradient(80% 62% at 8% 20%, rgba(14,116,144,0.14) 0%, rgba(0,1,12,0) 66%)',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.13]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(99,102,241,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,116,144,0.12) 1px, transparent 1px)',
                    backgroundSize: '8rem 8rem',
                    maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 35%, transparent 92%)',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-24 top-[28%] h-[300px] w-[300px] rounded-full blur-[95px]"
                style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-28 top-[16%] h-[360px] w-[360px] rounded-full blur-[110px]"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 72%)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[17%] h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-300/90 blur-[1px]"
                style={{ animation: prefersReduced ? 'none' : 'ai-orb-float 3.4s ease-in-out infinite' }}
            />

            <div className="relative z-10 mx-auto max-w-7xl">
                <div
                    aria-hidden="true"
                    style={{
                        width: '100%',
                        height: '1px',
                        background:
                            'linear-gradient(90deg, transparent, rgba(34,211,238,0.24) 26%, rgba(99,102,241,0.28) 50%, rgba(34,211,238,0.24) 74%, transparent)',
                        marginBottom: 'clamp(44px, 6vh, 86px)',
                    }}
                />

                <div className="mb-16 flex flex-col items-center text-center">
                    <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, delay: 0, ease: 'easeOut' }}
                        className="mb-5 inline-block font-mono uppercase"
                        style={{
                            fontSize: '11px',
                            letterSpacing: '0.36em',
                            color: '#67e8f9',
                            background: 'linear-gradient(120deg, rgba(8,47,73,0.45), rgba(15,23,42,0.68))',
                            border: '1px solid rgba(34,211,238,0.3)',
                            boxShadow: '0 0 0 1px rgba(34,211,238,0.12), 0 0 20px rgba(34,211,238,0.2)',
                            borderRadius: '100px',
                            padding: '6px 15px',
                        }}
                    >
                        [ QUERES MAS? ]
                    </motion.span>

                    <h2
                        className="flex flex-col items-center overflow-hidden font-black tracking-tight leading-[1.05]"
                        style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}
                    >
                        <motion.span
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            animate={shouldReveal ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                            transition={{ duration: prefersReduced ? 0 : 0.7, delay: prefersReduced ? 0 : 0.1, ease }}
                            className="text-white"
                        >
                            Sumale IA a tu web
                        </motion.span>
                        <motion.span
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            animate={shouldReveal ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                            transition={{ duration: prefersReduced ? 0 : 0.7, delay: prefersReduced ? 0 : 0.22, ease }}
                            className="bg-clip-text text-transparent"
                            style={{
                                backgroundImage:
                                    'linear-gradient(120deg, #67e8f9 0%, #38bdf8 30%, #8b5cf6 60%, #22d3ee 100%)',
                                backgroundSize: '220% 220%',
                                animation: prefersReduced ? 'none' : 'ai-title-shift 6.4s ease-in-out infinite',
                                WebkitBackgroundClip: 'text',
                            }}
                        >
                            cuando vos quieras.
                        </motion.span>
                    </h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.5, delay: prefersReduced ? 0 : 0.4, ease: 'easeOut' }}
                        className="mt-5 text-center"
                        style={{ fontSize: '16px', color: 'rgba(255,255,255,0.62)', maxWidth: '560px', lineHeight: 1.68 }}
                    >
                        Esto es opcional: una capa extra para escalar ventas, soporte y captacion sin tocar la base de tu web.
                    </motion.p>
                </div>

                <div className="flex justify-center" style={{ marginBottom: '48px' }}>
                    <button
                        type="button"
                        aria-label="Probar asistente IA"
                        className="ai-demo-badge group relative overflow-hidden"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-mascot-chat'))}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            background:
                                'linear-gradient(120deg, rgba(15,23,42,0.84) 0%, rgba(30,41,59,0.7) 55%, rgba(67,56,202,0.32) 100%)',
                            border: '1px solid rgba(99,102,241,0.36)',
                            borderRadius: '100px',
                            padding: '10px 20px 10px 12px',
                            cursor: 'pointer',
                            boxShadow: '0 12px 28px rgba(0,0,0,0.36)',
                        }}
                    >
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 left-0 w-[34%] skew-x-[-18deg] bg-gradient-to-r from-white/0 via-cyan-200/24 to-white/0 opacity-0 group-hover:opacity-100"
                            style={{ animation: prefersReduced ? 'none' : 'ai-shimmer 1.25s ease-out' }}
                        />
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #00e5ff, #7b2fff)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                color: 'white',
                                flexShrink: 0,
                                animation: 'mascot-pulse 2s ease-in-out infinite',
                                boxShadow: '0 0 24px rgba(56,189,248,0.45)',
                            }}
                        >
                            ?
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', lineHeight: 1.3 }}>
                                Queres verlo en accion?
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.56)', lineHeight: 1.4 }}>
                                Proba el asistente IA {'->'} habla con la mascota
                            </div>
                        </div>
                        <span
                            aria-hidden="true"
                            style={{ color: '#a78bfa', fontSize: '16px', animation: 'arrow-slide 1.2s ease-in-out infinite' }}
                        >
                            {'->'}
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {cards.map((card, i) => (
                        <motion.article
                            key={card.title}
                            initial={{ opacity: 0, y: 24 }}
                            animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                            transition={{ duration: prefersReduced ? 0 : 0.6, delay: prefersReduced ? 0 : 0.5 + i * 0.12, ease }}
                            whileHover={prefersReduced ? {} : { scale: 1.018, y: -6 }}
                            onHoverStart={() => setHoveredCard(i)}
                            onHoverEnd={() => setHoveredCard(null)}
                            className="group relative flex flex-col overflow-hidden rounded-[18px]"
                            style={{
                                background:
                                    'linear-gradient(150deg, rgba(6,10,24,0.88) 0%, rgba(5,9,20,0.82) 58%, rgba(10,16,30,0.88) 100%)',
                                backdropFilter: 'blur(14px)',
                                WebkitBackdropFilter: 'blur(14px)',
                                border:
                                    hoveredCard === i
                                        ? `1px solid rgba(${card.accentRgb},0.56)`
                                        : '1px solid rgba(255,255,255,0.1)',
                                padding: 'clamp(24px, 3vw, 36px)',
                                boxShadow:
                                    hoveredCard === i
                                        ? `0 0 0 1px rgba(${card.accentRgb},0.22), 0 22px 56px rgba(0,0,0,0.56), 0 0 42px rgba(${card.accentRgb},0.2)`
                                        : '0 16px 46px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.04)',
                                transition: 'border-color 220ms ease, box-shadow 220ms ease',
                                cursor: 'default',
                            }}
                        >
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 opacity-[0.22]"
                                style={{
                                    background:
                                        'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.01) 64%, rgba(255,255,255,0.06) 100%)',
                                }}
                            />
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                style={{
                                    background:
                                        `radial-gradient(80% 80% at 0% 0%, rgba(${card.accentRgb},0.24) 0%, transparent 65%), ` +
                                        `radial-gradient(76% 74% at 100% 100%, rgba(${card.accentRgb},0.2) 0%, transparent 68%)`,
                                }}
                            />
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute left-0 top-0 h-[2px] w-full"
                                style={{
                                    background:
                                        hoveredCard === i
                                            ? `linear-gradient(90deg, rgba(${card.accentRgb},0.18), ${card.accentFrom}, ${card.accentTo}, rgba(${card.accentRgb},0.18))`
                                            : 'linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))',
                                }}
                            />

                            <div
                                className="relative mb-4 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px]"
                                style={{
                                    background: `linear-gradient(135deg, rgba(${card.accentRgb},0.24), rgba(15,23,42,0.56))`,
                                    border: `1px solid rgba(${card.accentRgb},0.4)`,
                                    color: card.accentFrom,
                                    boxShadow:
                                        hoveredCard === i
                                            ? `0 0 28px rgba(${card.accentRgb},0.3), inset 0 0 20px rgba(${card.accentRgb},0.18)`
                                            : `0 0 20px rgba(${card.accentRgb},0.16)`,
                                }}
                            >
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-2 rounded-[8px] blur-[14px]"
                                    style={{ background: `radial-gradient(circle, rgba(${card.accentRgb},0.55) 0%, transparent 72%)` }}
                                />
                                {card.icon}
                            </div>

                            <h3
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: hoveredCard === i ? card.accentFrom : 'white',
                                    marginBottom: '8px',
                                    transition: 'color 220ms ease',
                                }}
                            >
                                {card.title}
                            </h3>

                            <p
                                style={{
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.62)',
                                    lineHeight: 1.66,
                                    flexGrow: 1,
                                }}
                            >
                                {card.copy}
                            </p>

                            <div
                                className="mt-5 inline-flex self-start rounded-full px-3 py-1.5"
                                style={{
                                    background: `linear-gradient(135deg, rgba(${card.accentRgb},0.16), rgba(15,23,42,0.52))`,
                                    border: `1px solid rgba(${card.accentRgb},0.36)`,
                                    boxShadow:
                                        hoveredCard === i
                                            ? `0 0 18px rgba(${card.accentRgb},0.28), inset 0 0 12px rgba(${card.accentRgb},0.18)`
                                            : 'none',
                                    transition: 'box-shadow 220ms ease',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '10px',
                                        color: card.accentFrom,
                                        fontWeight: 600,
                                        letterSpacing: '0.04em',
                                    }}
                                >
                                    {card.tag}
                                </span>
                            </div>
                        </motion.article>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{ duration: 0.4, delay: prefersReduced ? 0 : 0.9, ease: 'easeOut' }}
                    className="mt-8 flex justify-center"
                >
                    <Link
                        href="/ai-implementations"
                        className="group relative overflow-hidden"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(34,211,238,0.35)',
                            color: '#67e8f9',
                            borderRadius: '100px',
                            padding: '14px 32px',
                            fontSize: '14px',
                            letterSpacing: '0.05em',
                            textDecoration: 'none',
                            background:
                                'linear-gradient(120deg, rgba(8,47,73,0.2) 0%, rgba(15,23,42,0.42) 55%, rgba(76,29,149,0.26) 100%)',
                            boxShadow: '0 10px 26px rgba(0,0,0,0.28)',
                            transition: 'transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease, background 220ms ease',
                        }}
                        onMouseEnter={(e) => {
                            const target = e.currentTarget as HTMLAnchorElement
                            target.style.background =
                                'linear-gradient(120deg, rgba(8,47,73,0.46) 0%, rgba(15,23,42,0.66) 45%, rgba(76,29,149,0.42) 100%)'
                            target.style.borderColor = 'rgba(34,211,238,0.66)'
                            target.style.boxShadow =
                                '0 0 0 1px rgba(34,211,238,0.24), 0 16px 34px rgba(0,0,0,0.38), 0 0 28px rgba(34,211,238,0.22)'
                            target.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                            const target = e.currentTarget as HTMLAnchorElement
                            target.style.background =
                                'linear-gradient(120deg, rgba(8,47,73,0.2) 0%, rgba(15,23,42,0.42) 55%, rgba(76,29,149,0.26) 100%)'
                            target.style.borderColor = 'rgba(34,211,238,0.35)'
                            target.style.boxShadow = '0 10px 26px rgba(0,0,0,0.28)'
                            target.style.transform = 'translateY(0px)'
                        }}
                    >
                        Ver todas las implementaciones de IA {'->'}
                    </Link>
                </motion.div>

                <div
                    aria-hidden="true"
                    style={{
                        width: '100%',
                        height: '1px',
                        background:
                            'linear-gradient(90deg, transparent, rgba(34,211,238,0.24) 26%, rgba(99,102,241,0.28) 50%, rgba(34,211,238,0.24) 74%, transparent)',
                        marginTop: 'clamp(44px, 6vh, 86px)',
                    }}
                />
            </div>
        </section>
    )
}
