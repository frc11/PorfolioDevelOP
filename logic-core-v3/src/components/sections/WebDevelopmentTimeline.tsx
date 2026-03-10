'use client'
import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useInView, useReducedMotion } from 'framer-motion'
import { VideoClimax } from './VideoClimax'

// ── Data ──────────────────────────────────────────────────────────
const MILESTONES = [
    {
        number: 'Semana 01',
        title: 'Auditoría UX',
        description: 'Mapeamos cómo compra tu cliente local para optimizar cada punto de contacto y maximizar la retención.',
        side: 'left' as const,
        accentGradient: 'linear-gradient(90deg, #00e5ff, transparent)',
        decorNumber: '01',
        deliverable: 'Mapa de experiencia entregado',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
            </svg>
        ),
    },
    {
        number: 'Semana 02',
        title: 'Diseño UI',
        description: 'Creamos la interfaz visual en Figma con estética premium, enfocada en la identidad de tu marca.',
        side: 'right' as const,
        accentGradient: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
        decorNumber: '02',
        deliverable: 'Diseño en Figma aprobado',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" />
            </svg>
        ),
    },
    {
        number: 'Semana 03',
        title: 'Código Next.js',
        description: 'Desarrollamos el motor ultrarrápido con las mejores prácticas de SEO y rendimiento del mercado.',
        side: 'left' as const,
        accentGradient: 'linear-gradient(90deg, transparent, #7b2fff)',
        decorNumber: '03',
        deliverable: 'Plataforma en staging lista',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        ),
    },
]

const week4Checks = [
    'Deploy con zero-downtime',
    'Google Analytics + Search Console',
    'Soporte técnico 30 días',
]

const ease = [0.16, 1, 0.3, 1] as const

// ── MilestoneCard ─────────────────────────────────────────────────
function MilestoneCard({
    milestone,
    prefersReduced,
}: {
    milestone: (typeof MILESTONES)[0]
    prefersReduced: boolean | null
}) {
    const cardRef = useRef<HTMLDivElement>(null)
    const dotRef = useRef<HTMLDivElement>(null)
    const cardInView = useInView(cardRef, { once: true, amount: 0.5 })
    const dotInView = useInView(dotRef, { once: true, amount: 0.8 })

    const fromLeft = milestone.side === 'left'
    // On mobile use y:30 to avoid horizontal overflow; md+ use x:±50
    const initDesktop = fromLeft ? -50 : 50

    return (
        <div className={`flex flex-col md:flex-row items-center justify-between w-full ${fromLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

            {/* Card */}
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, x: prefersReduced ? 0 : initDesktop, y: 0 }}
                animate={cardInView ? { opacity: 1, x: 0, y: 0 } : {}}
                whileHover={prefersReduced ? {} : { scale: 1.02 }}
                transition={{ duration: prefersReduced ? 0 : 0.7, ease }}
                className="timeline-card w-full md:w-[45%] group"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    padding: 'clamp(24px, 3vw, 36px)',
                    cursor: 'default',
                    transition: 'border-color 200ms ease',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Accent top border */}
                <div aria-hidden="true" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    borderRadius: '2px 2px 0 0',
                    background: milestone.accentGradient,
                }} />

                {/* Decorative background number */}
                <div aria-hidden="true" style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '12px',
                    fontSize: '96px',
                    fontWeight: 900,
                    lineHeight: 1,
                    color: 'rgba(255,255,255,0.025)',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}>
                    {milestone.decorNumber}
                </div>

                {/* All card content above decorative layer */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Icon wrapper */}
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: 'rgba(0,229,255,0.1)',
                        border: '1px solid rgba(0,229,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        transition: 'background 200ms ease',
                    }}>
                        {milestone.icon}
                    </div>

                    {/* Label */}
                    <div style={{ fontSize: '10px', letterSpacing: '0.35em', color: '#00e5ff', marginBottom: '8px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                        {milestone.number}
                    </div>
                    <h3 style={{ fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: 700, color: 'white', marginBottom: '10px' }}>
                        {milestone.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
                        {milestone.description}
                    </p>

                    {/* Deliverable chip */}
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(0,229,255,0.07)',
                            border: '1px solid rgba(0,229,255,0.18)',
                            borderRadius: '100px',
                            padding: '6px 14px',
                            fontSize: '11px',
                            color: 'rgba(0,229,255,0.8)',
                        }}>
                            <span style={{ fontSize: '10px', color: '#00e5ff' }}>✓</span>
                            {milestone.deliverable}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Horizontal connector — hidden on mobile */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={cardInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 }}
                aria-hidden="true"
                className="hidden md:block flex-1 self-center"
                style={{
                    height: '1px',
                    background: fromLeft
                        ? 'linear-gradient(90deg, rgba(0,229,255,0.2), rgba(0,229,255,0.05))'
                        : 'linear-gradient(270deg, rgba(0,229,255,0.2), rgba(0,229,255,0.05))',
                    maxWidth: '56px',
                    minWidth: '20px',
                }}
            />

            {/* Dot */}
            <motion.div
                ref={dotRef}
                initial={{ scale: 0, opacity: 0 }}
                animate={dotInView ? { scale: 1, opacity: 1 } : {}}
                whileHover={prefersReduced ? {} : { scale: 1.4 }}
                transition={dotInView
                    ? { type: 'spring', stiffness: 400, damping: 15 }
                    : { duration: 0.2 }}
                className="hidden md:block rounded-full z-20 flex-shrink-0"
                style={{
                    width: '14px',
                    height: '14px',
                    background: '#00e5ff',
                    boxShadow: '0 0 0 4px rgba(0,229,255,0.15), 0 0 0 8px rgba(0,229,255,0.05), 0 0 20px rgba(0,229,255,0.6)',
                    cursor: 'default',
                }}
            />

            {/* Connector right side (mirrored) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={cardInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 }}
                aria-hidden="true"
                className="hidden md:block flex-1 self-center"
                style={{
                    height: '1px',
                    background: fromLeft
                        ? 'linear-gradient(270deg, rgba(0,229,255,0.2), rgba(0,229,255,0.05))'
                        : 'linear-gradient(90deg, rgba(0,229,255,0.2), rgba(0,229,255,0.05))',
                    maxWidth: '56px',
                    minWidth: '20px',
                }}
            />

            <div className="hidden md:block w-[45%]" />
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────
export function WebDevelopmentTimeline() {
    const prefersReduced = useReducedMotion()

    const sectionRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start center', 'end center'],
    })
    const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

    const week4Ref = useRef<HTMLDivElement>(null)
    const week4InView = useInView(week4Ref, { once: true, amount: 0.3 })

    const week4ScrollRef = useRef<HTMLDivElement>(null)

    return (
        <section
            ref={sectionRef}
            className="relative w-full py-32 px-4 bg-[#030014] z-10 overflow-hidden"
        >
            {/* CSS keyframes */}
            <style>{`
                @keyframes timeline-bounce {
                    0%,100%{transform:translateY(0)}
                    50%{transform:translateY(6px)}
                }
                @keyframes shimmer {
                    0%   { left: -100% }
                    100% { left: 200% }
                }
                .timeline-scroll-cue { animation: timeline-bounce 1.5s ease-in-out infinite; }
                .timeline-card:hover { border-color: rgba(255,255,255,0.15) !important; }
                .week4-shimmer { animation: shimmer 2.5s ease-in-out 1s infinite; }
                .week4-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
                @media (max-width: 767px) {
                    .week4-grid { grid-template-columns: 1fr; }
                    .week4-video-col { height: 240px; position: relative; }
                }
            `}</style>

            {/* Glow 1 — Violet header */}
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse at center top, rgba(123,47,255,0.09) 0%, transparent 60%)', filter: 'blur(120px)', zIndex: 0 }} />
            {/* Glow 2 — Cyan left (weeks 01, 03) */}
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '25%', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)', filter: 'blur(100px)', zIndex: 0 }} />
            {/* Glow 3 — Cyan right (week 02) */}
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '40%', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)', filter: 'blur(100px)', zIndex: 0 }} />
            {/* Glow 4 — Cyan climax (week 04) */}
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ bottom: '5%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,229,255,0.08) 0%, transparent 60%)', filter: 'blur(90px)', zIndex: 0 }} />
            {/* Noise texture */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.015, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: '128px' }} />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: prefersReduced ? 0 : 0.6, ease: 'easeOut' }}
                    style={{ textAlign: 'center', marginBottom: 'clamp(48px,7vh,80px)' }}
                >
                    {/* Label superior */}
                    <div style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        letterSpacing: '0.35em',
                        color: '#00e5ff',
                        background: 'rgba(0,229,255,0.08)',
                        border: '1px solid rgba(0,229,255,0.2)',
                        borderRadius: '100px',
                        padding: '5px 14px',
                        marginBottom: '24px',
                        fontFamily: 'monospace',
                        textTransform: 'uppercase',
                    }}>
                        [ DE LA IDEA AL LANZAMIENTO ]
                    </div>
                    {/* H2 — 3 líneas */}
                    <h2 style={{ lineHeight: 1.05 }}>
                        <span style={{
                            display: 'block',
                            fontSize: 'clamp(38px, 5.5vw, 72px)',
                            fontWeight: 900,
                            color: '#ffffff',
                        }}>
                            Tu web, lista
                        </span>
                        <span style={{
                            display: 'block',
                            fontSize: 'clamp(38px, 5.5vw, 72px)',
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #00e5ff 0%, #7b2fff 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent',
                        }}>
                            en 4 semanas.
                        </span>
                        <span style={{
                            display: 'block',
                            fontSize: 'clamp(16px, 2vw, 22px)',
                            fontWeight: 400,
                            color: 'rgba(255,255,255,0.45)',
                            marginTop: '12px',
                        }}>
                            Sin vueltas. Sin sorpresas. Con resultados.
                        </span>
                    </h2>
                </motion.div>

                <div className="relative">
                    {/* Base line */}
                    <div
                        className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 hidden md:block"
                        style={{ width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(0,229,255,0.3) 15%, rgba(0,229,255,0.3) 85%, transparent)' }}
                    />
                    {/* Scroll-driven progress line */}
                    <motion.div
                        className="absolute left-1/2 top-0 w-[1px] bg-cyan-400 -translate-x-1/2 hidden md:block origin-top"
                        style={{
                            height: prefersReduced ? '100%' : lineHeight,
                            boxShadow: '0 0 10px rgba(34,211,238,0.8)',
                        }}
                    />

                    <div className="space-y-24 relative z-10">
                        {MILESTONES.map((milestone, index) => (
                            <MilestoneCard
                                key={index}
                                milestone={milestone}
                                prefersReduced={prefersReduced}
                            />
                        ))}

                        {/* Semana 04 — climax */}
                        <div ref={week4ScrollRef} className="w-full">
                            <motion.div
                                ref={week4Ref}
                                initial={{ opacity: 0, y: prefersReduced ? 0 : 60, scale: prefersReduced ? 1 : 0.95 }}
                                animate={week4InView ? { opacity: 1, y: 0, scale: 1 } : {}}
                                transition={{ duration: prefersReduced ? 0 : 0.9, ease }}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(123,47,255,0.03) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(0,229,255,0.18)',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}
                            >
                                {/* Shimmer border top — static gradient */}
                                <div
                                    aria-hidden="true"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        background:
                                            'linear-gradient(90deg, transparent, #00e5ff 30%, #7b2fff 70%, transparent)',
                                        zIndex: 2,
                                    }}
                                />
                                {/* Shimmer border top — animated sweep */}
                                <div
                                    aria-hidden="true"
                                    className="week4-shimmer"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        width: '40%',
                                        height: '2px',
                                        background:
                                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                                        zIndex: 3,
                                    }}
                                />

                                {/* 2-column grid */}
                                <div className="week4-grid">

                                    {/* ── LEFT: text column ── */}
                                    <div
                                        style={{
                                            padding: 'clamp(32px, 4vw, 52px)',
                                            position: 'relative',
                                            zIndex: 1,
                                        }}
                                    >
                                        {/* Label */}
                                        <div style={{
                                            fontSize: '10px',
                                            letterSpacing: '0.4em',
                                            color: '#00e5ff',
                                            marginBottom: '16px',
                                            fontFamily: 'monospace',
                                            textTransform: 'uppercase',
                                        }}>
                                            SEMANA 04 · LANZAMIENTO
                                        </div>

                                        {/* Title */}
                                        <h3 style={{ lineHeight: 1.1, marginBottom: '20px' }}>
                                            <span style={{
                                                display: 'block',
                                                fontSize: 'clamp(28px, 3.5vw, 42px)',
                                                fontWeight: 900,
                                                color: '#ffffff',
                                            }}>
                                                Lanzamiento
                                            </span>
                                            <span style={{
                                                display: 'block',
                                                fontSize: 'clamp(28px, 3.5vw, 42px)',
                                                fontWeight: 900,
                                                color: '#ffffff',
                                            }}>
                                                y Ventas
                                            </span>
                                            <span style={{
                                                display: 'block',
                                                fontSize: 'clamp(28px, 3.5vw, 42px)',
                                                fontWeight: 900,
                                                background: 'linear-gradient(135deg, #00e5ff, #7b2fff)',
                                                WebkitBackgroundClip: 'text',
                                                backgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                color: 'transparent',
                                            }}>
                                                Automáticas.
                                            </span>
                                        </h3>

                                        {/* Description */}
                                        <p style={{
                                            fontSize: '15px',
                                            color: 'rgba(255,255,255,0.55)',
                                            lineHeight: 1.7,
                                            maxWidth: '380px',
                                            marginBottom: '24px',
                                        }}>
                                            Tu plataforma entra en órbita. Estabilidad total, conversiones fluidas y la tranquilidad de tener un activo digital que trabaja por vos.
                                        </p>

                                        {/* Micro-checks */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                                            {week4Checks.map((check, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: prefersReduced ? 0 : -10 }}
                                                    animate={week4InView ? { opacity: 1, x: 0 } : {}}
                                                    transition={{ delay: prefersReduced ? 0 : 0.3 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                                                >
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        background: 'rgba(0,229,255,0.1)',
                                                        border: '1px solid rgba(0,229,255,0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}>
                                                        <span style={{ fontSize: '9px', color: '#00e5ff' }}>✓</span>
                                                    </div>
                                                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{check}</span>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* CTA ghost button */}
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('showcase-section')?.scrollIntoView({ behavior: 'smooth' })}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                border: '1px solid rgba(0,229,255,0.35)',
                                                borderRadius: '100px',
                                                padding: '12px 28px',
                                                fontSize: '13px',
                                                letterSpacing: '0.05em',
                                                color: '#00e5ff',
                                                cursor: 'pointer',
                                                background: 'transparent',
                                                transition: 'all 250ms ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,255,0.1)'
                                                    ; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,229,255,0.6)'
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                                                    ; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,229,255,0.35)'
                                            }}
                                        >
                                            Iniciar mi transformación →
                                        </button>
                                    </div>

                                    {/* ── RIGHT: video column ── */}
                                    <div className="week4-video-col">
                                        <VideoClimax />
                                    </div>

                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Scroll cue */}
                <div
                    style={{ marginTop: 'clamp(48px, 8vh, 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}
                >
                    <div
                        aria-hidden="true"
                        style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)', marginBottom: '32px' }}
                    />
                    <button
                        type="button"
                        onClick={() => document.getElementById('showcase-section')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        }}
                        aria-label="Ver trabajos"
                    >
                        <span style={{ fontSize: '12px', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                            TRABAJOS QUE LO DEMUESTRAN
                        </span>
                        <span
                            className="timeline-scroll-cue"
                            style={{ color: '#00e5ff', opacity: 0.5, fontSize: '20px', lineHeight: 1 }}
                            aria-hidden="true"
                        >
                            ⌄⌄
                        </span>
                    </button>
                </div>
            </div>
        </section>
    )
}
