'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

// ─── HELPERS ────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r},${g},${b}`
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Particle {
    id: number
    x: number
    y: number
    vx: number
    vy: number
    life: number
    color: string
}

interface BentoCard {
    id: number
    size: 'large' | 'medium' | 'small'
    label: string
    title: string
    description: string
    color: string
    colorRgb: string
    icon: React.ReactNode
    stat: string
    statLabel: string
    tags: string[]
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

function AgentIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20v-2a6 6 0 0112 0v2" />
            <path d="M12 12v4M9 15h6" />
        </svg>
    )
}

function MemoryIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01" />
            <path d="M6 14h12" />
        </svg>
    )
}

function VisionIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

function IntegrationIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="6" r="2" />
            <circle cx="18" cy="6" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
            <path d="M8 6h8M6 8v8M18 8v8M8 18h8" />
        </svg>
    )
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const cards: BentoCard[] = [
    {
        id: 0,
        size: 'large',
        label: 'RESULTADO 01',
        title: 'Tu mejor vendedor, 24/7',
        description: 'Responde consultas de precio, stock y disponibilidad por WhatsApp e Instagram. Igual que tu mejor empleado — pero a las 3AM sin quejarse.',
        color: '#00ff88',
        colorRgb: '0,255,136',
        icon: <AgentIcon />,
        stat: '24/7',
        statLabel: 'sin descanso, sin vacaciones',
        tags: ['WhatsApp', 'Instagram', 'En vivo'],
    },
    {
        id: 1,
        size: 'medium',
        label: 'RESULTADO 02',
        title: 'Atención sin esperas',
        description: 'Consultas respondidas en menos de 3 segundos. Precios, turnos, disponibilidad — todo al instante, sin que nadie toque el celular.',
        color: '#7b2fff',
        colorRgb: '123,47,255',
        icon: <MemoryIcon />,
        stat: '< 3s',
        statLabel: 'por consulta respondida',
        tags: ['Al instante', 'Automático', 'Preciso'],
    },
    {
        id: 2,
        size: 'medium',
        label: 'RESULTADO 03',
        title: 'Tu empresa, organizada',
        description: 'Toda la información de tu negocio en un solo lugar. Tu equipo pregunta, la IA responde con datos actualizados al segundo.',
        color: '#7b2fff',
        colorRgb: '123,47,255',
        icon: <VisionIcon />,
        stat: '100%',
        statLabel: 'datos en tiempo real',
        tags: ['Control', 'Reportes', 'Gestión'],
    },
    {
        id: 3,
        size: 'small',
        label: 'RESULTADO 04',
        title: 'Reservas mientras dormís',
        description: 'Coordina turnos, manda recordatorios y gestiona cancelaciones por WhatsApp. Vos solo aparecés a trabajar.',
        color: '#7b2fff',
        colorRgb: '123,47,255',
        icon: <IntegrationIcon />,
        stat: '×3',
        statLabel: 'más ventas cerradas',
        tags: ['Turnos', 'Agenda', 'Ventas'],
    },
]

// ─── STAGGER DELAYS ──────────────────────────────────────────────────────────

// Delays in grid render order: [large, small, medium1, medium2]
// cards[0]=large, cards[3]=small, cards[1]=medium, cards[2]=medium
const CARD_DELAYS: Record<number, number> = {
    0: 0.25,  // large
    1: 0.35,  // medium
    2: 0.42,  // medium
    3: 0.30,  // small
}

// ─── CARD COMPONENT ──────────────────────────────────────────────────────────

function BentoCardComponent({
    card,
    style,
    className,
    isInView,
    delay,
    reducedMotion,
}: {
    card: BentoCard
    style?: React.CSSProperties
    className?: string
    isInView: boolean
    delay: number
    reducedMotion: boolean | null
}) {
    const [hovered, setHovered] = useState(false)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [particles, setParticles] = useState<Particle[]>([])
    const cardRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = cardRef.current?.getBoundingClientRect()
        if (!rect) return
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    useEffect(() => {
        if (!hovered || reducedMotion) return
        const iconRect = cardRef.current
            ?.querySelector('[data-icon]')
            ?.getBoundingClientRect()
        const cardRect = cardRef.current?.getBoundingClientRect()
        if (!iconRect || !cardRect) return

        const cx = iconRect.left - cardRect.left + iconRect.width / 2
        const cy = iconRect.top - cardRect.top + iconRect.height / 2

        const newParticles: Particle[] = Array.from(
            { length: 6 }, (_, i) => ({
                id: Date.now() + i,
                x: cx,
                y: cy,
                vx: (Math.random() - 0.5) * 120,
                vy: -40 - Math.random() * 80,
                life: 1,
                color: card.color,
            })
        )
        setParticles(newParticles)

        let raf: number
        const start = performance.now()

        function animateParticles(now: number) {
            const elapsed = (now - start) / 1000
            setParticles(prev =>
                prev
                    .map(p => ({
                        ...p,
                        x: p.x + p.vx * elapsed * 0.016,
                        y: p.y + p.vy * elapsed * 0.016,
                        vy: p.vy + 120 * 0.016,
                        life: Math.max(0, 1 - elapsed / 0.8),
                    }))
                    .filter(p => p.life > 0)
            )
            if (elapsed < 0.8) raf = requestAnimationFrame(animateParticles)
        }
        raf = requestAnimationFrame(animateParticles)
        return () => cancelAnimationFrame(raf)
    }, [hovered, card.color, reducedMotion])

    return (
        <motion.div
            ref={cardRef}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={handleMouseMove}
            // Entry animation
            initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 30, scale: reducedMotion ? 1 : 0.97 }}
            animate={(isInView || reducedMotion)
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{
                y: -4,
                boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.1),
                    inset 0 -1px 0 rgba(0,0,0,0.2),
                    0 20px 60px rgba(0,0,0,0.5),
                    0 0 0 1px rgba(${card.colorRgb}, 0.2),
                    0 0 40px rgba(${card.colorRgb}, 0.08)
                `,
                transition: { duration: 0.25, ease: 'easeOut' },
            }}
            className={className}
            style={{
                ...style,
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: 'clamp(20px,2.5vw,32px)',
                minHeight: card.size === 'large' ? '240px'
                    : card.size === 'small' ? '100%' : '200px',
                boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.08),
                    inset 0 -1px 0 rgba(0,0,0,0.2),
                    0 8px 32px rgba(0,0,0,0.4)
                `,
            }}
        >
            {/* Spotlight */}
            {hovered && !reducedMotion && (
                <div style={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(${card.colorRgb}, 0.12) 0%, transparent 70%)`,
                    left: mousePos.x - 150,
                    top: mousePos.y - 150,
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'none',
                }} />
            )}

            {/* Laser Scan */}
            {hovered && !reducedMotion && (
                <div key={hovered.toString()} style={{
                    position: 'absolute',
                    left: 0, right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, rgba(${card.colorRgb}, 0.8) 30%, rgba(255,255,255,0.9) 50%, rgba(${card.colorRgb}, 0.8) 70%, transparent)`,
                    animation: 'laserScan 1.2s ease-in-out',
                    pointerEvents: 'none',
                    zIndex: 3,
                    boxShadow: `0 0 12px rgba(${card.colorRgb}, 0.6)`,
                    top: 0,
                }} />
            )}

            {/* Particles */}
            {particles.map(p => (
                <div key={p.id} style={{
                    position: 'absolute',
                    left: p.x,
                    top: p.y,
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: p.color,
                    opacity: p.life,
                    boxShadow: `0 0 6px ${p.color}`,
                    pointerEvents: 'none',
                    zIndex: 5,
                    transform: 'translate(-50%, -50%)',
                }} />
            ))}

            {/* Top accent border */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '2px',
                background: `linear-gradient(90deg, transparent, rgba(${card.colorRgb}, 0.7) 40%, rgba(${card.colorRgb}, 0.7) 60%, transparent)`,
                opacity: hovered ? 1 : 0.5,
                boxShadow: hovered ? `0 0 16px rgba(${card.colorRgb}, 0.5)` : 'none',
                transition: 'opacity 300ms, box-shadow 300ms',
            }} />

            {/* Internal top glow */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '80px',
                background: `linear-gradient(to bottom, rgba(${card.colorRgb}, 0.05), transparent)`,
                pointerEvents: 'none',
            }} />

            {/* Decorative number */}
            <div style={{
                position: 'absolute',
                bottom: '-10px', right: '16px',
                fontSize: '96px',
                fontWeight: 900,
                lineHeight: 1,
                color: `rgba(${card.colorRgb}, 0.04)`,
                userSelect: 'none',
                pointerEvents: 'none',
                fontVariantNumeric: 'tabular-nums',
            }}>
                {String(card.id + 1).padStart(2, '0')}
            </div>

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                <div>
                    {/* Header: icon + label */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '20px',
                    }}>
                        <div data-icon style={{
                            width: '48px', height: '48px',
                            borderRadius: '12px',
                            background: `rgba(${card.colorRgb}, 0.12)`,
                            border: `1px solid rgba(${card.colorRgb}, 0.25)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: card.color,
                        }}>
                            {card.icon}
                        </div>

                        <span style={{
                            fontSize: '10px',
                            letterSpacing: '0.2em',
                            color: `rgba(${card.colorRgb}, 0.6)`,
                            fontWeight: 600,
                        }}>
                            {card.label}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                        fontSize: card.size === 'large' ? 'clamp(22px,2.5vw,32px)' : '20px',
                        fontWeight: 900,
                        color: 'white',
                        margin: '0 0 10px',
                        lineHeight: 1.2,
                    }}>
                        {card.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.45)',
                        lineHeight: 1.65,
                        margin: '0 0 20px',
                        maxWidth: card.size === 'large' ? '480px' : '100%',
                    }}>
                        {card.description}
                    </p>

                    {/* ── LARGE card extra: "Thinking" progress bars ── */}
                    {card.id === 0 && (
                        <div style={{
                            marginTop: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                        }}>
                            {[
                                { label: 'Analizando consulta', width: 92 },
                                { label: 'Buscando en tu base', width: 78 },
                                { label: 'Ejecutando respuesta', width: 65 },
                            ].map((bar, i) => (
                                <div key={i}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '3px',
                                    }}>
                                        <span style={{
                                            fontSize: '10px',
                                            color: 'rgba(255,255,255,0.3)',
                                            letterSpacing: '0.05em',
                                        }}>
                                            {bar.label}
                                        </span>
                                        <span style={{
                                            fontSize: '10px',
                                            color: 'rgba(0,255,136,0.5)',
                                        }}>
                                            {bar.width}%
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '3px',
                                        background: 'rgba(255,255,255,0.06)',
                                        borderRadius: '100px',
                                        overflow: 'hidden',
                                    }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={(isInView || reducedMotion)
                                                ? { width: `${bar.width}%` }
                                                : { width: reducedMotion ? `${bar.width}%` : 0 }}
                                            transition={reducedMotion
                                                ? { duration: 0 }
                                                : { duration: 1.2, delay: 0.6 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                                            style={{
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #00ff88, #7b2fff)',
                                                borderRadius: '100px',
                                                boxShadow: '0 0 8px rgba(0,255,136,0.4)',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── SMALL card extra: integration logos grid ── */}
                    {card.id === 3 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '6px',
                            marginTop: '16px',
                        }}>
                            {[
                                { name: 'WhatsApp', color: '#25d366' },
                                { name: 'Gmail', color: '#ea4335' },
                                { name: 'Notion', color: '#ffffff' },
                                { name: 'Sheets', color: '#34a853' },
                                { name: 'Slack', color: '#e01e5a' },
                                { name: 'CRM', color: '#f59e0b' },
                            ].map((app, i) => (
                                <motion.div
                                    key={app.name}
                                    initial={{ opacity: reducedMotion ? 1 : 0, scale: reducedMotion ? 1 : 0.8 }}
                                    animate={(isInView || reducedMotion)
                                        ? { opacity: 1, scale: 1 }
                                        : { opacity: 0, scale: 0.8 }}
                                    transition={reducedMotion
                                        ? { duration: 0 }
                                        : { delay: 0.5 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    style={{
                                        background: `rgba(${hexToRgb(app.color)}, 0.1)`,
                                        border: `1px solid rgba(${hexToRgb(app.color)}, 0.25)`,
                                        borderRadius: '8px',
                                        padding: '6px 8px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: app.color === '#ffffff' ? 'rgba(255,255,255,0.7)' : app.color,
                                        textAlign: 'center',
                                    }}
                                >
                                    {app.name}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    {/* Stat */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px',
                        marginBottom: '16px',
                        marginTop: '20px',
                    }}>
                        <span style={{
                            fontSize: card.size === 'large' ? '36px' : '28px',
                            fontWeight: 900,
                            color: card.color,
                            lineHeight: 1,
                        }}>
                            {card.stat}
                        </span>
                        <span style={{
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.35)',
                        }}>
                            {card.statLabel}
                        </span>
                    </div>

                    {/* Tags */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                    }}>
                        {card.tags.map(tag => (
                            <span key={tag} style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: `rgba(${card.colorRgb}, 0.8)`,
                                background: `rgba(${card.colorRgb}, 0.08)`,
                                border: `1px solid rgba(${card.colorRgb}, 0.18)`,
                                borderRadius: '100px',
                                padding: '3px 10px',
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

            </div>
        </motion.div>
    )
}

// ─── HEADER ──────────────────────────────────────────────────────────────────

function Header({ isInView, reducedMotion }: { isInView: boolean, reducedMotion: boolean | null }) {
    const initial = { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -20 }
    const show = { opacity: 1, y: 0 }

    return (
        <motion.div
            initial={initial}
            animate={(isInView || reducedMotion) ? show : initial}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vh,64px)' }}
        >
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid rgba(0,255,136,0.3)',
                color: '#00ff88',
                padding: '6px 16px',
                borderRadius: '100px',
                fontSize: '11px',
                letterSpacing: '0.25em',
                fontWeight: 600,
                marginBottom: '24px',
                background: 'rgba(0,255,136,0.06)'
            }}>
                [ TU NEGOCIO A OTRO NIVEL ]
            </div>
            <h2 style={{
                fontSize: 'clamp(30px,4vw,52px)',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 16px 0',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
            }}>
                La arquitectura detrás de tu IA.
            </h2>
            <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
            }}>
                Cuatro módulos que trabajan en conjunto.
            </p>
        </motion.div>
    )
}

// ─── ATMOSPHERIC GLOWS ───────────────────────────────────────────────────────

const atmosphericGlows = [
    { top: '10%', left: '20%', right: undefined, color: '0,255,136' },    // card 0
    { top: '60%', left: '12%', right: undefined, color: '123,47,255' },   // card 1
    { top: '60%', left: '45%', right: undefined, color: '123,47,255' },    // card 2
    { top: '30%', left: undefined, right: '8%', color: '123,47,255' },    // card 3
]

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function BentoIA() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.1,
    })
    const reducedMotion = useReducedMotion()

    return (
        <section
            ref={sectionRef}
            style={{
                padding: 'clamp(80px,12vh,140px) clamp(20px,5vw,80px)',
                background: '#080810',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Atmospheric glows */}
            {atmosphericGlows.map((g, i) => (
                <div key={i} aria-hidden="true" style={{
                    position: 'absolute',
                    top: g.top,
                    left: g.left,
                    right: g.right,
                    width: '300px',
                    height: '200px',
                    background: `radial-gradient(ellipse, rgba(${g.color}, 0.05) 0%, transparent 65%)`,
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />
            ))}

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1,
            }}>
                <Header isInView={isInView} reducedMotion={reducedMotion} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:grid-rows-2">
                    {/* Card LARGE — cols 1-2, row 1 */}
                    <BentoCardComponent
                        card={cards[0]}
                        className="md:col-span-2 md:row-span-1"
                        isInView={isInView}
                        delay={CARD_DELAYS[0]}
                        reducedMotion={reducedMotion}
                    />

                    {/* Card SMALL — col 3, rows 1-2 */}
                    <BentoCardComponent
                        card={cards[3]}
                        className="md:col-span-1 md:row-span-2"
                        isInView={isInView}
                        delay={CARD_DELAYS[3]}
                        reducedMotion={reducedMotion}
                    />

                    {/* Card MEDIUM — col 1, row 2 */}
                    <BentoCardComponent
                        card={cards[1]}
                        className="md:col-span-1 md:row-span-1"
                        isInView={isInView}
                        delay={CARD_DELAYS[1]}
                        reducedMotion={reducedMotion}
                    />

                    {/* Card MEDIUM — col 2, row 2 */}
                    <BentoCardComponent
                        card={cards[2]}
                        className="md:col-span-1 md:row-span-1"
                        isInView={isInView}
                        delay={CARD_DELAYS[2]}
                        reducedMotion={reducedMotion}
                    />
                </div>
            </div>

            <style>{`
                @keyframes laserScan {
                    0%   { top: 0%; opacity: 1; }
                    80%  { top: 100%; opacity: 0.8; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </section>
    )
}
