'use client'
import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'motion/react'

// ── Types ──────────────────────────────────────────────────────────
interface Stat { value: string; label: string }
interface StackTag { label: string }

const ease = [0.16, 1, 0.3, 1] as const

// ── Shared atoms ───────────────────────────────────────────────────
function BrowserDots() {
    return (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,95,87,0.6)' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,189,46,0.6)' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(39,201,63,0.6)' }} />
        </div>
    )
}

function BrowserBar({ url }: { url: string }) {
    return (
        <div style={{
            height: '32px', background: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px',
        }}>
            <BrowserDots />
            <div style={{
                flex: 1, maxWidth: '200px', margin: '0 auto', height: '18px',
                background: 'rgba(255,255,255,0.06)', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{url}</span>
            </div>
        </div>
    )
}

function StatItem({ value, label }: Stat) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#00e5ff', lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{label}</span>
        </div>
    )
}

function StackPill({ label }: StackTag) {
    return (
        <span style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '100px', padding: '4px 12px', fontSize: '11px', color: 'rgba(255,255,255,0.5)',
        }}>
            {label}
        </span>
    )
}

// ── Browser mocks (accept inView + prefersReduced + isMobile) ──────
function BrowserMockEcommerce({
    inView, prefersReduced, isMobile,
}: { inView: boolean; prefersReduced: boolean | null; isMobile: boolean }) {
    const animate = inView && !prefersReduced && !isMobile

    const item = (delay: number, children: React.ReactNode) => (
        <motion.div
            initial={animate ? { opacity: 0, y: 4 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )

    return (
        <div style={{ height: '280px', background: '#0a0a14', position: 'relative', overflow: 'hidden' }}>
            {item(0.3,
                <div style={{
                    height: '44px', background: 'rgba(0,229,255,0.08)',
                    borderBottom: '1px solid rgba(0,229,255,0.1)',
                    display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px',
                }}>
                    <div style={{ width: '40px', height: '16px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }} />
                    <div style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: '40px', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px' }} />
                        ))}
                    </div>
                </div>
            )}
            {item(0.38,
                <div style={{ padding: '20px' }}>
                    <div style={{ width: '60%', height: '20px', background: 'linear-gradient(90deg, white, rgba(0,229,255,0.8))', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ width: '40%', height: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }} />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                flex: 1, height: '80px', background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px',
                                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                            }}>
                                <div style={{ height: '50%', background: 'rgba(0,229,255,0.06)' }} />
                                <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                                    <div style={{ height: '6px', width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(to bottom, transparent 60%, #0a0a14 100%)',
            }} />
        </div>
    )
}

function BrowserMockTemplates({
    inView, prefersReduced, isMobile,
}: { inView: boolean; prefersReduced: boolean | null; isMobile: boolean }) {
    const animate = inView && !prefersReduced && !isMobile
    const tileColors = [
        'rgba(123,47,255,0.15)', 'rgba(0,229,255,0.1)',
        'rgba(255,100,80,0.1)', 'rgba(0,200,120,0.1)',
    ]

    const item = (delay: number, children: React.ReactNode) => (
        <motion.div
            initial={animate ? { opacity: 0, y: 4 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )

    return (
        <div style={{ height: '280px', background: '#0a0a14', position: 'relative', overflow: 'hidden' }}>
            {item(0.3,
                <div style={{
                    height: '44px', background: 'rgba(123,47,255,0.08)',
                    borderBottom: '1px solid rgba(123,47,255,0.12)',
                    display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px',
                }}>
                    <div style={{ width: '40px', height: '16px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }} />
                    <div style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: '40px', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px' }} />
                        ))}
                    </div>
                </div>
            )}
            {item(0.38,
                <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {tileColors.map((bg, i) => (
                        <div key={i} style={{
                            height: '88px', background: bg,
                            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px',
                            overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '8px', gap: '6px',
                        }}>
                            <div style={{ height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.12)', borderRadius: '4px' }} />
                            <div style={{ height: '6px', width: '55%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
                        </div>
                    ))}
                </div>
            )}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(to bottom, transparent 55%, #0a0a14 100%)',
            }} />
        </div>
    )
}

// ── Project rows ───────────────────────────────────────────────────
function ProjectCorralon({
    prefersReduced, isMobile,
}: { prefersReduced: boolean | null; isMobile: boolean }) {
    const rowRef = useRef<HTMLDivElement>(null)
    const inView = useInView(rowRef, { once: true, amount: 0.2 })

    const stats: Stat[] = [
        { value: '#1', label: 'Google local' },
        { value: '500+', label: 'Productos online' },
        { value: '<1s', label: 'Tiempo de carga' },
    ]
    const tags: StackTag[] = [
        { label: 'Next.js' }, { label: 'SEO Local' }, { label: 'E-Commerce' }, { label: 'WhatsApp API' },
    ]

    const skip = !!prefersReduced

    return (
        <motion.div
            ref={rowRef}
            whileHover={skip ? {} : { scale: 1.005 }}
            transition={{ duration: 0.3 }}
            style={{
                display: 'grid',
                gridTemplateColumns: 'var(--showcase-cols, 1fr)',
                gap: 'clamp(32px, 4vw, 64px)',
                alignItems: 'center',
                marginBottom: 'clamp(60px, 8vh, 100px)',
                padding: 'clamp(32px, 4vw, 52px)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Vertical accent */}
            <div aria-hidden="true" style={{
                position: 'absolute', left: 0, top: '10%', bottom: '10%', width: '2px',
                background: 'linear-gradient(to bottom, transparent, #00e5ff, transparent)',
            }} />

            {/* TEXT column */}
            <motion.div
                initial={skip ? {} : { opacity: 0, x: -40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, ease }}
                style={{ paddingLeft: '16px' }}
            >
                <div style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#00e5ff', marginBottom: '16px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                    E-COMMERCE · MATERIALES
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', marginBottom: '8px', fontFamily: 'monospace' }}>
                    01
                </div>
                <h3 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '16px' }}>
                    Corralón El Amigo
                </h3>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '440px', marginBottom: '24px' }}>
                    De vender por WhatsApp a un catálogo online con más de 500 productos, pedidos automáticos y posicionamiento #1 en Google Yerba Buena.
                </p>
                {/* Stats with stagger */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={skip ? {} : { opacity: 0, y: 16 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease }}
                        >
                            <StatItem {...s} />
                        </motion.div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {tags.map(t => <StackPill key={t.label} {...t} />)}
                </div>
            </motion.div>

            {/* VISUAL column */}
            <motion.div
                initial={skip ? {} : { opacity: 0, x: 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1, ease }}
                style={{ position: 'relative' }}
            >
                <motion.div
                    whileHover={skip ? {} : { boxShadow: '0 24px 80px rgba(0,0,0,0.65), 0 0 60px rgba(0,229,255,0.12)' }}
                    transition={{ duration: 0.3 }}
                    style={{
                        borderRadius: '12px', overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,229,255,0.06)',
                    }}
                >
                    <BrowserBar url="corralonelam..." />
                    <BrowserMockEcommerce inView={inView} prefersReduced={prefersReduced} isMobile={isMobile} />
                </motion.div>
                {/* LIVE badge */}
                <div style={{
                    position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0,229,255,0.25)', borderRadius: '100px',
                    padding: '4px 10px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.08em',
                }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00e5ff', animation: 'showcase-pulse 2s ease-in-out infinite' }} />
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>EN PRODUCCIÓN</span>
                </div>
            </motion.div>
        </motion.div>
    )
}

function ProjectTemplates({
    prefersReduced, isMobile,
}: { prefersReduced: boolean | null; isMobile: boolean }) {
    const rowRef = useRef<HTMLDivElement>(null)
    const inView = useInView(rowRef, { once: true, amount: 0.2 })

    const stats: Stat[] = [
        { value: '5+', label: 'Industries' },
        { value: '100', label: 'Lighthouse' },
        { value: '72h', label: 'Deploy' },
    ]
    const tags: StackTag[] = [
        { label: 'Next.js' }, { label: 'Tailwind v4' }, { label: 'TypeScript' }, { label: 'SEO Ready' },
    ]

    const skip = !!prefersReduced

    return (
        <motion.div
            ref={rowRef}
            whileHover={skip ? {} : { scale: 1.005 }}
            transition={{ duration: 0.3 }}
            style={{
                display: 'grid',
                gridTemplateColumns: 'var(--showcase-cols, 1fr)',
                gap: 'clamp(32px, 4vw, 64px)',
                alignItems: 'center',
                marginBottom: 'clamp(60px, 8vh, 100px)',
                padding: 'clamp(32px, 4vw, 52px)',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(123,47,255,0.12)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Vertical accent — violet */}
            <div aria-hidden="true" style={{
                position: 'absolute', left: 0, top: '10%', bottom: '10%', width: '2px',
                background: 'linear-gradient(to bottom, transparent, #7b2fff, transparent)',
            }} />

            {/* VISUAL column — first in DOM = left on desktop */}
            <motion.div
                initial={skip ? {} : { opacity: 0, x: -40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, ease }}
                style={{ position: 'relative' }}
            >
                <motion.div
                    whileHover={skip ? {} : { boxShadow: '0 24px 80px rgba(0,0,0,0.65), 0 0 60px rgba(123,47,255,0.12)' }}
                    transition={{ duration: 0.3 }}
                    style={{
                        borderRadius: '12px', overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(123,47,255,0.06)',
                    }}
                >
                    <BrowserBar url="templates.dev..." />
                    <BrowserMockTemplates inView={inView} prefersReduced={prefersReduced} isMobile={isMobile} />
                </motion.div>
                {/* Badge */}
                <div style={{
                    position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(123,47,255,0.35)', borderRadius: '100px',
                    padding: '4px 10px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.08em',
                }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7b2fff', animation: 'showcase-pulse 2s ease-in-out infinite' }} />
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>EN VIVO</span>
                </div>
            </motion.div>

            {/* TEXT column — second in DOM = right on desktop */}
            <motion.div
                initial={skip ? {} : { opacity: 0, x: 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1, ease }}
                style={{ paddingLeft: '16px' }}
            >
                <div style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#7b2fff', marginBottom: '16px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                    TEMPLATES · MULTI-INDUSTRIA
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', marginBottom: '8px', fontFamily: 'monospace' }}>
                    02
                </div>
                <h3 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '16px' }}>
                    Templates de Clase Mundial
                </h3>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '440px', marginBottom: '24px' }}>
                    Bases de proyecto optimizadas para los rubros más demandantes del NOA. Cada template viene con SEO local, velocidad Lighthouse 100 y diseño que convierte desde el primer día.
                </p>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={skip ? {} : { opacity: 0, y: 16 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease }}
                        >
                            <StatItem {...s} />
                        </motion.div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {tags.map(t => <StackPill key={t.label} {...t} />)}
                </div>
            </motion.div>
        </motion.div>
    )
}

// ── Main export ────────────────────────────────────────────────────
export default function ShowcaseSection() {
    const prefersReduced = useReducedMotion()

    // mobile detection (client-only, safe for 'use client')
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    const skip = !!prefersReduced

    // Header
    const headerRef = useRef<HTMLDivElement>(null)
    const headerInView = useInView(headerRef, { once: true, amount: 0.3 })

    // CTA
    const ctaRef = useRef<HTMLDivElement>(null)
    const ctaInView = useInView(ctaRef, { once: true, amount: 0.4 })

    return (
        <section
            id="showcase-section"
            className="relative w-full py-32 px-4 bg-[#030014] overflow-hidden"
        >
            <style>{`
                @keyframes showcase-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.85); }
                }
                @media (min-width: 1024px) {
                    .showcase-row-1 { --showcase-cols: 1fr 1fr; }
                    .showcase-row-2 { --showcase-cols: 1fr 1fr; }
                }
            `}</style>

            {/* Glows */}
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse at center top, rgba(0,229,255,0.07) 0%, transparent 65%)', filter: 'blur(100px)', zIndex: 0 }} />
            <div aria-hidden="true" className="absolute pointer-events-none" style={{ bottom: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(123,47,255,0.06) 0%, transparent 60%)', filter: 'blur(100px)', zIndex: 0 }} />

            <div className="max-w-6xl mx-auto relative" style={{ zIndex: 1 }}>

                {/* ── Header ── */}
                <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 'clamp(60px, 8vh, 100px)' }}>
                    {/* Badge */}
                    <motion.div
                        initial={skip ? {} : { opacity: 0, y: -10 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                            display: 'inline-block', fontSize: '11px', letterSpacing: '0.35em', color: '#00e5ff',
                            background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)',
                            borderRadius: '100px', padding: '5px 14px', marginBottom: '24px',
                            fontFamily: 'monospace', textTransform: 'uppercase',
                        }}
                    >
                        [ TRABAJOS QUE LO DEMUESTRAN ]
                    </motion.div>

                    <h2 style={{ lineHeight: 1.05, marginBottom: '20px', overflow: 'hidden' }}>
                        {/* Line 1 — clip reveal */}
                        <motion.span
                            initial={skip ? {} : { clipPath: 'inset(0 100% 0 0)' }}
                            animate={headerInView ? { clipPath: 'inset(0 0% 0 0)' } : {}}
                            transition={{ duration: 0.7, delay: 0.1, ease }}
                            style={{ display: 'block', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 900, color: '#ffffff' }}
                        >
                            Lo que
                        </motion.span>
                        {/* Line 2 — clip reveal */}
                        <motion.span
                            initial={skip ? {} : { clipPath: 'inset(0 100% 0 0)' }}
                            animate={headerInView ? { clipPath: 'inset(0 0% 0 0)' } : {}}
                            transition={{ duration: 0.7, delay: 0.22, ease }}
                            style={{
                                display: 'block', fontSize: 'clamp(42px, 6vw, 80px)', fontWeight: 900,
                                background: 'linear-gradient(135deg, #ffffff 0%, #00e5ff 60%, #7b2fff 100%)',
                                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent', color: 'transparent',
                            }}
                        >
                            construimos.
                        </motion.span>
                    </h2>

                    <motion.p
                        initial={skip ? {} : { opacity: 0, y: 10 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
                        style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}
                    >
                        Cada proyecto es un activo de negocio diseñado para dominar su mercado local.
                    </motion.p>
                </div>

                {/* ── Projects ── */}
                <div className="showcase-row-1">
                    <ProjectCorralon prefersReduced={prefersReduced} isMobile={isMobile} />
                </div>
                <div className="showcase-row-2">
                    <ProjectTemplates prefersReduced={prefersReduced} isMobile={isMobile} />
                </div>

                {/* ── CTA block ── */}
                <div ref={ctaRef} style={{ marginTop: 'clamp(48px, 6vh, 80px)' }}>
                    <div aria-hidden="true" style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                        marginBottom: 'clamp(40px, 5vh, 64px)',
                    }} />

                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontSize: '12px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                            ¿LISTO PARA SER EL SIGUIENTE?
                        </span>

                        <motion.h3
                            initial={skip ? {} : { opacity: 0, y: 20 }}
                            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, lineHeight: 1.1, textAlign: 'center' }}
                        >
                            <span style={{ color: '#ffffff' }}>Tu negocio merece<br /></span>
                            <span style={{
                                background: 'linear-gradient(135deg, #00e5ff, #7b2fff)',
                                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent', color: 'transparent',
                            }}>
                                estar en este listado.
                            </span>
                        </motion.h3>

                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', maxWidth: '440px', lineHeight: 1.7, textAlign: 'center' }}>
                            Agendá una consultoría gratuita y en 30 minutos te mostramos el potencial de tu Sucursal Digital.
                        </p>

                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
                            {/* Primary CTA */}
                            <motion.div
                                initial={skip ? {} : { opacity: 0, y: 12 }}
                                animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    opacity: { duration: 0.5, delay: 0.3, ease: 'easeOut' },
                                    y: { duration: 0.5, delay: 0.3, ease: 'easeOut' },
                                    scale: { type: 'spring', stiffness: 300, damping: 15 },
                                    boxShadow: { duration: 0.3 }
                                }}
                                whileHover={skip ? {} : { scale: 1.04, boxShadow: '0 0 50px rgba(0,229,255,0.45)' }}
                            >
                                <Link href="/contacto" style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    background: 'linear-gradient(135deg, #00e5ff, #0099cc)',
                                    color: '#080810', fontWeight: 700, borderRadius: '100px',
                                    padding: '16px 36px', fontSize: '14px', letterSpacing: '0.05em',
                                    boxShadow: '0 0 30px rgba(0,229,255,0.25)',
                                    textDecoration: 'none', whiteSpace: 'nowrap',
                                }}>
                                    Quiero mi Sucursal Digital →
                                </Link>
                            </motion.div>

                            {/* Secondary CTA */}
                            <motion.div
                                initial={skip ? {} : { opacity: 0, y: 12 }}
                                animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                            >
                                <Link href="/ai-implementations" style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                                    color: 'rgba(255,255,255,0.7)', borderRadius: '100px',
                                    padding: '16px 36px', fontSize: '14px',
                                    textDecoration: 'none', whiteSpace: 'nowrap',
                                }}>
                                    Ver todas las implementaciones IA
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
