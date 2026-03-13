'use client'
import React, { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView, useReducedMotion, useMotionValueEvent, type Variants } from 'framer-motion'
import { VideoClimax } from './VideoClimax'

// ── Data ──────────────────────────────────────────────────────────
type GlowStyle = React.CSSProperties

const MILESTONES = [
    {
        number: 'Semana 01',
        title: 'Auditoría UX',
        description: 'Mapeamos cómo compra tu cliente local para optimizar cada punto de contacto y maximizar la retención.',
        side: 'left' as const,
        accentGradient: 'linear-gradient(90deg, #00e5ff 0%, rgba(0,229,255,0.3) 60%, transparent 100%)',
        decorNumber: '01',
        deliverable: 'Mapa de experiencia entregado',
        glowStyle: { left: 0, top: 0, bottom: 0, width: '60px', background: 'linear-gradient(to right, rgba(0,229,255,0.06), transparent)' } as GlowStyle,
        iconWrapperBg: 'rgba(0,229,255,0.12)',
        iconWrapperBorder: '1px solid rgba(0,229,255,0.25)',
        iconColor: '#00e5ff',
        numberColor: 'rgba(0,229,255,0.04)',
        icon: (
            <svg className="group-hover:[filter:drop-shadow(0_0_8px_rgba(0,229,255,1))]" style={{ transition: 'filter 250ms' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
            </svg>
        ),
        triggerRange: [0.18, 0.22]
    },
    {
        number: 'Semana 02',
        title: 'Diseño UI',
        description: 'Creamos la interfaz visual en Figma con estética premium, enfocada en la identidad de tu marca.',
        side: 'right' as const,
        accentGradient: 'linear-gradient(90deg, transparent 0%, #7b2fff 50%, transparent 100%)',
        decorNumber: '02',
        deliverable: 'Diseño en Figma aprobado',
        glowStyle: { top: 0, left: '50%', transform: 'translateX(-50%)', height: '60px', width: '80%', background: 'linear-gradient(to bottom, rgba(123,47,255,0.08), transparent)' } as GlowStyle,
        iconWrapperBg: 'rgba(123,47,255,0.12)',
        iconWrapperBorder: '1px solid rgba(123,47,255,0.25)',
        iconColor: '#7b2fff',
        numberColor: 'rgba(123,47,255,0.04)',
        icon: (
            <svg className="group-hover:[filter:drop-shadow(0_0_8px_rgba(123,47,255,1))]" style={{ transition: 'filter 250ms' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7b2fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" />
            </svg>
        ),
        triggerRange: [0.42, 0.48]
    },
    {
        number: 'Semana 03',
        title: 'Código Next.js',
        description: 'Desarrollamos el motor ultrarrápido con las mejores prácticas de SEO y rendimiento del mercado.',
        side: 'left' as const,
        accentGradient: 'linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.3) 40%, #00e5ff 100%)',
        decorNumber: '03',
        deliverable: 'Plataforma en staging lista',
        glowStyle: { right: 0, top: 0, bottom: 0, width: '60px', background: 'linear-gradient(to left, rgba(0,229,255,0.06), transparent)' } as GlowStyle,
        iconWrapperBg: 'rgba(0,229,255,0.10)',
        iconWrapperBorder: '1px solid rgba(0,229,255,0.2)',
        iconColor: '#00e5ff',
        numberColor: 'rgba(0,229,255,0.04)',
        icon: (
            <svg className="group-hover:[filter:drop-shadow(0_0_8px_rgba(0,229,255,1))]" style={{ transition: 'filter 250ms' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        ),
        triggerRange: [0.68, 0.73]
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
    triggerProgress,
    isActive,
}: {
    milestone: (typeof MILESTONES)[0]
    prefersReduced: boolean | null
    triggerProgress: boolean
    isActive: boolean
}) {
    const cardRef = useRef<HTMLDivElement>(null)
    const dotRef = useRef<HTMLDivElement>(null)
    const cardInView = useInView(cardRef, { once: true, amount: 0.5 })
    const dotInView = useInView(dotRef, { once: true, amount: 0.8 })

    const fromLeft = milestone.side === 'left'
    const initDesktop = fromLeft ? -50 : 50

    return (
        <div className={`flex flex-col md:flex-row items-center justify-between w-full group relative ${fromLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            style={{ marginBottom: 'clamp(32px, 4vh, 52px)' }}>

            {/* Horizontal Connector (Punto -> Card) */}
            <div
                aria-hidden="true"
                className="hidden md:block"
                style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '1px',
                    width: '8%',
                    pointerEvents: 'none',
                    zIndex: 0,
                    ...(fromLeft ? {
                        right: '46%', // Desde el borde derecho de la card (45%) hacia el centro (50%)
                        background: 'linear-gradient(to right, transparent, rgba(0,229,255,0.35))'
                    } : {
                        left: '46%', // Desde el borde izquierdo de la card (45%) hacia el centro (50%)
                        background: 'linear-gradient(to left, transparent, rgba(0,229,255,0.35))'
                    })
                }}
            />

            {/* Card */}
            <motion.div
                ref={cardRef}
                layout="position"
                initial={{ opacity: 0, x: prefersReduced ? 0 : initDesktop, y: 0 }}
                animate={cardInView ? { opacity: 1, x: 0, y: 0 } : {}}
                whileHover={prefersReduced ? {} : {
                    y: -4,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.15)',
                    transition: { duration: 0.25, ease: 'easeOut' }
                }}
                transition={{ duration: prefersReduced ? 0 : 0.7, ease }}
                className="timeline-card w-full md:w-[45%] group flex-shrink-0"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '16px',
                    boxShadow: '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 -1px 0 0 rgba(0,0,0,0.3) inset, 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                    padding: 'clamp(24px, 3vw, 40px)',
                    cursor: 'default',
                    transition: 'border-color 200ms ease',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none', zIndex: 0, ...milestone.glowStyle }} />
                <div aria-hidden="true" className="opacity-70 group-hover:opacity-100" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', borderRadius: '2px 2px 0 0', background: milestone.accentGradient, transition: 'opacity 200ms', zIndex: 1 }} />
                <div aria-hidden="true" className="group-hover:opacity-[0.05]" style={{ position: 'absolute', bottom: '-16px', right: '16px', fontSize: '88px', fontWeight: 900, lineHeight: 1, color: milestone.numberColor || 'rgba(255,255,255,0.025)', userSelect: 'none', pointerEvents: 'none', zIndex: 0, transition: 'opacity 300ms' }}>
                    {milestone.decorNumber}
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="group-hover:scale-110 group-hover:brightness-125" style={{ width: '44px', height: '44px', borderRadius: '10px', background: milestone.iconWrapperBg, border: milestone.iconWrapperBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', transition: 'all 250ms', }}>
                        {milestone.icon}
                    </div>
                    <div style={{ fontSize: '10px', letterSpacing: '0.35em', color: milestone.iconColor, marginBottom: '8px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                        {milestone.number}
                    </div>
                    <h3 style={{ fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: 700, color: 'white', marginBottom: '10px' }}>
                        {milestone.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
                        {milestone.description}
                    </p>
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="group-hover:border-[rgba(0,229,255,0.4)] group-hover:bg-[rgba(0,229,255,0.12)]" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '100px', padding: '6px 14px', fontSize: '11px', color: '#00e5ff', fontWeight: 500, transition: 'all 200ms' }}>
                            <span style={{ fontSize: '10px', color: '#00e5ff' }}>✓</span>
                            {milestone.deliverable}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* DOT COMPONENT - Upgraded */}
            <div ref={dotRef} className="hidden md:flex flex-shrink-0 relative w-[28px] h-[28px] items-center justify-center z-10">
                {/* ANILLO EXTERIOR */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '-8px',
                        borderRadius: '50%',
                        border: `1px solid rgba(0,229,255, ${isActive ? 0.4 : 0.1})`,
                        animation: prefersReduced ? 'none' : (isActive ? 'ringPulse 2s ease-in-out infinite' : 'none'),
                        transition: 'border-color 400ms',
                    }}
                />
                {/* ANILLO MEDIO */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '-3px',
                        borderRadius: '50%',
                        background: `rgba(0,229,255, ${isActive ? 0.15 : 0.05})`,
                        border: `1px solid rgba(0,229,255, ${isActive ? 0.4 : 0.15})`,
                        transition: 'all 400ms',
                    }}
                />
                {/* NÚCLEO */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isActive
                            ? 'radial-gradient(circle, white 0%, #00e5ff 100%)'
                            : 'rgba(0,229,255,0.4)',
                        boxShadow: isActive
                            ? '0 0 0 2px rgba(0,229,255,0.3), 0 0 12px rgba(0,229,255,1), 0 0 24px rgba(0,229,255,0.5)'
                            : 'none',
                        transition: 'all 400ms',
                    }}
                />

                {/* Partículas de Energía (explotan cuando pasa el orbe) */}
                {!prefersReduced && triggerProgress && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                        {[...Array(4)].map((_, i) => {
                            const angle = (i * Math.PI) / 2 + Math.PI / 4;
                            const distance = 30;
                            const hX = Math.cos(angle) * distance;
                            const hY = Math.sin(angle) * distance;
                            return (
                                <motion.div
                                    key={`particle-${i}`}
                                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                    animate={{ x: hX, y: hY, opacity: 0, scale: 0 }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute',
                                        width: '4px', height: '4px',
                                        borderRadius: '50%',
                                        background: '#00e5ff',
                                        top: '-2px', left: '-2px',
                                    }}
                                />
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Empty balance card */}
            <div className="hidden md:block w-full md:w-[45%] flex-shrink-0" />
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────
export function WebDevelopmentTimeline() {
    const prefersReduced = useReducedMotion()

    const sectionRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start 85%', 'end 15%'],
    })

    const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
    const orbY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
    const trailY = useTransform(scrollYProgress, [0, 1], ['-3%', '97%'])

    // Particles trigger states
    const [triggered01, setTriggered01] = useState(false)
    const [triggered02, setTriggered02] = useState(false)
    const [triggered03, setTriggered03] = useState(false)

    // Active point based on orb location
    const [activePoint, setActivePoint] = useState<number>(0)

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        if (!prefersReduced) {
            // Particle triggers
            if (v > MILESTONES[0].triggerRange[0] && v < MILESTONES[0].triggerRange[1] && !triggered01) setTriggered01(true)
            if (v > MILESTONES[1].triggerRange[0] && v < MILESTONES[1].triggerRange[1] && !triggered02) setTriggered02(true)
            if (v > MILESTONES[2].triggerRange[0] && v < MILESTONES[2].triggerRange[1] && !triggered03) setTriggered03(true)
        }

        // Active point logic
        if (v >= 0.12) setActivePoint(1)
        if (v >= 0.37) setActivePoint(2)
        if (v >= 0.62) setActivePoint(3)
        if (v >= 0.87) setActivePoint(4)
        if (v < 0.12) setActivePoint(0)
    })

    const week4Ref = useRef<HTMLDivElement>(null)
    const week4InView = useInView(week4Ref, { once: true, amount: 0.3 })
    const [isHoveredFinal, setIsHoveredFinal] = useState(false)

    return (
        <section
            className="relative w-full py-32 px-4 bg-[#030014] z-10 overflow-hidden"
        >
            <style>{`
                @keyframes timeline-bounce {
                    0%,100%{transform:translateY(0)}
                    50%{transform:translateY(6px)}
                }
                @keyframes ringPulse {
                    0%, 100% { transform:translate(-50%,-50%) scale(1); opacity:0.4; }
                    50% { transform:translate(-50%,-50%) scale(1.3); opacity:0; }
                }
                @keyframes shimmer {
                    0%   { left: -100% }
                    100% { left: 200% }
                }
                @keyframes chevron {
                    0%,100% { opacity:0.3; transform:rotate(45deg) translateY(0); }
                    50% { opacity:1; transform:rotate(45deg) translateY(3px); }
                }
                .timeline-scroll-cue { animation: timeline-bounce 1.5s ease-in-out infinite; }
                .timeline-card:hover { border-color: rgba(255,255,255,0.15) !important; }
                .week4-shimmer { animation: shimmer 2.5s ease-in-out 1s infinite; }
                .week4-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
                @media (max-width: 767px) {
                    .week4-grid { grid-template-columns: 1fr; }
                    .week4-video-col { height: 220px; position: relative; }
                    .timeline-card:hover { transform: none !important; box-shadow: none !important; }
                }
            `}</style>

            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '-120px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse at center top, rgba(123,47,255,0.09) 0%, transparent 60%)', filter: 'blur(120px)', zIndex: 0 }} />
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '25%', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)', filter: 'blur(100px)', zIndex: 0 }} />
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '40%', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)', filter: 'blur(100px)', zIndex: 0 }} />
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ bottom: '5%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,229,255,0.08) 0%, transparent 60%)', filter: 'blur(90px)', zIndex: 0 }} />
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.015, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: '128px' }} />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: prefersReduced ? 0 : 0.6, ease: 'easeOut' }}
                    style={{ textAlign: 'center', marginBottom: 'clamp(48px,7vh,80px)' }}
                >
                    <div style={{ display: 'inline-block', fontSize: '11px', letterSpacing: '0.35em', color: '#00e5ff', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '100px', padding: '5px 14px', marginBottom: '24px', fontFamily: 'monospace', textTransform: 'uppercase', }}>
                        [ DE LA IDEA AL LANZAMIENTO ]
                    </div>
                    <h2 style={{ lineHeight: 1.05 }}>
                        <span style={{ display: 'block', fontSize: 'clamp(38px, 5.5vw, 72px)', fontWeight: 900, color: '#ffffff', }}>
                            Tu web, lista
                        </span>
                        <span style={{ display: 'block', fontSize: 'clamp(38px, 5.5vw, 72px)', fontWeight: 900, background: 'linear-gradient(135deg, #00e5ff 0%, #7b2fff 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', filter: 'drop-shadow(0 0 20px rgba(0,229,255,0.3))' }}>
                            en 4 semanas.
                        </span>
                        <span style={{ display: 'block', fontSize: 'clamp(16px, 2vw, 22px)', fontWeight: 400, marginTop: '12px', }}>
                            <span style={{ color: 'rgba(255,255,255,0.45)' }}>Sin vueltas</span>
                            <span style={{ color: 'rgba(0,229,255,0.3)' }}> · </span>
                            <span style={{ color: 'rgba(255,255,255,0.45)' }}>Sin sorpresas</span>
                            <span style={{ color: 'rgba(0,229,255,0.3)' }}> · </span>
                            <span style={{ color: 'rgba(255,255,255,0.65)' }}>Con resultados.</span>
                        </span>
                    </h2>
                </motion.div>

                <div ref={sectionRef} className="relative">
                    {/* ENVOLTURA CENTRAL DE LA LÍNEA VERTICAL */}
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top: 0, bottom: 0,
                        width: '2px',
                        pointerEvents: 'none',
                        zIndex: 1,
                    }}
                        className="hidden md:block"
                    >
                        {/* CAPA 1 — Base estática, siempre visible */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,229,255,0.08) 10%, rgba(0,229,255,0.08) 90%, transparent 100%)',
                        }} />

                        {/* CAPA 2 — Progreso scroll-driven */}
                        <motion.div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: prefersReduced ? '100%' : lineHeight,
                            background: 'linear-gradient(to bottom, #00e5ff 0%, #7b2fff 50%, #00e5ff 100%)',
                            boxShadow: '0 0 8px rgba(0,229,255,0.8), 0 0 20px rgba(0,229,255,0.3)',
                            willChange: 'transform',
                        }} />

                        {/* CAPA 3 — Orbe viajero */}
                        {!prefersReduced && (
                            <motion.div style={{
                                position: 'absolute',
                                left: '50%',
                                top: orbY,
                                transform: 'translate(-50%, -50%)',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, #ffffff 0%, #00e5ff 60%)',
                                boxShadow: '0 0 0 3px rgba(0,229,255,0.25), 0 0 14px rgba(0,229,255,1), 0 0 30px rgba(0,229,255,0.5)',
                                zIndex: 3,
                                willChange: 'transform',
                            }} />
                        )}

                        {/* CAPA 4 — Estela del orbe */}
                        {!prefersReduced && (
                            <motion.div style={{
                                position: 'absolute',
                                left: '50%',
                                top: trailY,
                                transform: 'translate(-50%, 0)',
                                width: '2px',
                                height: '28px',
                                borderRadius: '100px',
                                background: 'linear-gradient(to bottom, rgba(0,229,255,0.7), transparent)',
                                zIndex: 2,
                            }} />
                        )}
                    </div>

                    {/* Intermediate Ambient Glows — filling the void */}
                    <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '22%', right: '5%', width: '300px', height: '250px', background: 'radial-gradient(circle, rgba(0,229,255,0.03) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
                    <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '46%', left: '5%', width: '300px', height: '250px', background: 'radial-gradient(circle, rgba(123,47,255,0.03) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
                    <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '70%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(0,229,255,0.04) 0%, transparent 65%)', filter: 'blur(70px)', zIndex: 0 }} />

                    <div className="space-y-24 relative z-10 py-12">
                        {MILESTONES.map((milestone, index) => (
                            <MilestoneCard
                                key={index}
                                milestone={milestone}
                                prefersReduced={prefersReduced}
                                triggerProgress={index === 0 ? triggered01 : index === 1 ? triggered02 : triggered03}
                                isActive={prefersReduced ? true : activePoint >= index + 1}
                            />
                        ))}

                        {/* Semana 04 — climax */}
                        <div className="w-full">
                            <motion.div
                                ref={week4Ref}
                                layout="position"
                                initial={{ opacity: 0, y: prefersReduced ? 0 : 60, scale: prefersReduced ? 1 : 0.95 }}
                                animate={week4InView ? { opacity: 1, y: 0, scale: 1 } : {}}
                                whileHover={prefersReduced ? {} : {
                                    boxShadow: '0 0 0 1px rgba(0,229,255,0.25), 0 24px 64px rgba(0,0,0,0.5)',
                                }}
                                transition={{ duration: prefersReduced ? 0 : 0.9, ease }}
                                className="group"
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
                                <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #00e5ff 30%, #7b2fff 70%, transparent)', zIndex: 2, }} />
                                <div aria-hidden="true" className="week4-shimmer" style={{ position: 'absolute', top: 0, width: '40%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)', zIndex: 3 }} />

                                <div className="week4-grid">
                                    <div style={{ padding: 'clamp(32px, 4vw, 52px)', position: 'relative', zIndex: 1, }}>
                                        <div style={{ fontSize: '10px', letterSpacing: '0.4em', color: '#00e5ff', marginBottom: '16px', fontFamily: 'monospace', textTransform: 'uppercase', }}>
                                            SEMANA 04 · LANZAMIENTO
                                        </div>
                                        <h3 style={{ lineHeight: 1.1, marginBottom: '20px' }}>
                                            <span style={{ display: 'block', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, color: '#ffffff', }}>
                                                Lanzamiento
                                            </span>
                                            <span style={{ display: 'block', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, color: '#ffffff', }}>
                                                y Ventas
                                            </span>
                                            <span style={{ display: 'block', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, background: 'linear-gradient(135deg, #00e5ff, #7b2fff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', }}>
                                                Automáticas.
                                            </span>
                                        </h3>
                                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '380px', marginBottom: '24px', }}>
                                            Tu plataforma entra en órbita. Estabilidad total, conversiones fluidas y la tranquilidad de tener un activo digital que trabaja por vos.
                                        </p>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                                            {week4Checks.map((check, i) => (
                                                <motion.div key={i} initial={{ opacity: 0, x: prefersReduced ? 0 : -10 }} animate={week4InView ? { opacity: 1, x: 0 } : {}} transition={{ delay: prefersReduced ? 0 : 0.3 + i * 0.1, duration: 0.4, ease: 'easeOut' }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }} >
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, }}>
                                                        <span style={{ fontSize: '9px', color: '#00e5ff' }}>✓</span>
                                                    </div>
                                                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{check}</span>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <motion.button
                                            type="button"
                                            initial="rest"
                                            whileHover={prefersReduced ? {} : "hover"}
                                            whileTap={prefersReduced ? {} : { scale: 0.98 }}
                                            onClick={() => document.getElementById('showcase-section')?.scrollIntoView({ behavior: 'smooth' })}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(0,229,255,0.35)', borderRadius: '100px', padding: '12px 28px', fontSize: '13px', letterSpacing: '0.05em', color: '#00e5ff', cursor: 'pointer', background: 'transparent', transition: 'all 250ms ease', }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,255,0.1)'; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                            variants={{
                                                rest: { scale: 1, borderColor: 'rgba(0,229,255,0.35)' },
                                                hover: { scale: 1.03, borderColor: 'rgba(0,229,255,0.6)' }
                                            } as Variants}
                                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                        >
                                            Iniciar mi transformación
                                            <motion.span
                                                variants={{
                                                    rest: { x: 0 },
                                                    hover: { x: 4 }
                                                } as Variants}
                                                transition={{ duration: 0.2 }}
                                                style={{ display: 'inline-block' }}
                                            >
                                                →
                                            </motion.span>
                                        </motion.button>
                                    </div>

                                    <div className="week4-video-col">
                                        <VideoClimax />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '12px',
                    marginTop: 'clamp(48px,6vh,72px)',
                    opacity: 0.4,
                }}>
                    <div style={{
                        height: '1px', width: '100%', maxWidth: '600px',
                        background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)',
                    }} />
                    <span style={{
                        fontSize: '10px', letterSpacing: '0.35em',
                        color: 'rgba(255,255,255,0.3)',
                        textTransform: 'uppercase',
                    }}>
                        trabajos que lo demuestran
                    </span>
                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: '3px',
                    }}>
                        {[0, 1].map(i => (
                            <div key={i} style={{
                                width: '8px', height: '8px',
                                borderRight: '1px solid rgba(0,229,255,0.4)',
                                borderBottom: '1px solid rgba(0,229,255,0.4)',
                                transform: 'rotate(45deg)',
                                animation: `chevron 1.4s ease-in-out ${i * 0.15}s infinite`,
                            }} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
