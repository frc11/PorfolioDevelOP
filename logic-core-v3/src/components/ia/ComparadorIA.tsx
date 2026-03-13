'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function useCountUp(
    target: number,
    duration: number = 1500,
    active: boolean = false,
    decimals: number = 0,
): number {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!active) return
        const start = performance.now()

        function update(now: number) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            const value = parseFloat((eased * target).toFixed(decimals))
            setCurrent(value)
            if (progress < 1) requestAnimationFrame(update)
        }

        requestAnimationFrame(update)
    }, [active, target, duration, decimals])

    return current
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

type ResultType = 'win' | 'lose' | 'neutral'

interface CompareRow {
    id: number
    attribute: string
    human: string
    ai: string
    humanResult: ResultType
    aiResult: ResultType
    icon: string
    highlight: boolean
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const rows: CompareRow[] = [
    {
        id: 0, icon: '🕐', attribute: 'Disponibilidad',
        human: 'Lun–Vie · 9 a 18hs', ai: '24 / 7 / 365',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 1, icon: '💰', attribute: 'Costo mensual',
        human: '$180.000 – $350.000', ai: 'Desde $25.000',
        humanResult: 'lose', aiResult: 'win', highlight: true,
    },
    {
        id: 2, icon: '⚡', attribute: 'Tiempo de respuesta',
        human: '2 – 24 horas', ai: '< 3 segundos',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 3, icon: '📊', attribute: 'Capacidad simultánea',
        human: '1 conversación', ai: 'Ilimitadas',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 4, icon: '🎯', attribute: 'Consistencia',
        human: 'Variable según humor', ai: 'Siempre igual',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 5, icon: '📈', attribute: 'Escalabilidad',
        human: 'Contratar más personas', ai: 'Instantánea',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 6, icon: '🏖', attribute: 'Vacaciones / Licencias',
        human: 'Sí — el negocio para', ai: 'Nunca',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 7, icon: '📚', attribute: 'Tiempo de onboarding',
        human: '2 – 4 semanas', ai: '48 horas',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
]

// ─── ROW COMPONENT ────────────────────────────────────────────────────────────

function CompareRowItem({
    row,
    index,
    isInView,
}: {
    row: CompareRow
    index: number
    isInView: boolean
}) {
    // Costs for row id: 1
    const humanCost = useCountUp(180000, 1200, isInView && row.id === 1)
    const aiCost = useCountUp(25000, 900, isInView && row.id === 1)

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
            style={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: row.highlight ? 'rgba(0,255,136,0.03)' : 'transparent',
            }}
        >
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_1.5fr]">

                {/* Attribute */}
                <div style={{
                    padding: 'clamp(14px,2vh,20px) 0',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <span style={{ fontSize: '18px' }}>{row.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
                        {row.attribute}
                    </span>
                </div>

                {/* Human column */}
                <div style={{
                    padding: 'clamp(12px,2vh,20px) 16px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    borderLeft: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <span className="sm:hidden" style={{
                        fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
                        color: 'rgba(255,255,255,0.2)', minWidth: '52px',
                    }}>
                        HUMANO
                    </span>
                    <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 0.5 } : { scale: 0, opacity: 0 }}
                        transition={{ delay: 0.35 + index * 0.07, duration: 0.3 }}
                        style={{ fontSize: '14px', flexShrink: 0, color: '#ef4444' }}
                    >
                        ✗
                    </motion.span>
                    <span style={{
                        fontSize: '13px', color: 'rgba(255,255,255,0.35)',
                        textDecoration: row.highlight ? 'line-through' : 'none',
                    }}>
                        {row.id === 1 ? `$${humanCost.toLocaleString('es-AR')}` : row.human}
                    </span>
                </div>

                {/* IA column */}
                <div style={{
                    padding: 'clamp(12px,2vh,20px) 16px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'rgba(0,255,136,0.02)',
                    borderLeft: row.highlight
                        ? '2px solid rgba(0,255,136,0.4)'
                        : '1px solid rgba(0,255,136,0.1)',
                }}>
                    <span className="sm:hidden" style={{
                        fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
                        color: 'rgba(0,255,136,0.4)', minWidth: '36px',
                    }}>
                        IA
                    </span>
                    <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.4 + index * 0.07 }}
                        style={{ fontSize: '14px', color: '#00ff88', display: 'inline-block', flexShrink: 0 }}
                    >
                        ✓
                    </motion.span>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: row.highlight ? 700 : 500,
                        color: row.highlight ? '#00ff88' : 'rgba(255,255,255,0.8)',
                    }}>
                        {row.id === 1 ? `Desde $${aiCost.toLocaleString('es-AR')}` : row.ai}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

// ─── TABLE HEADER ─────────────────────────────────────────────────────────────

function TableHeader({ isInView }: { isInView: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden sm:grid"
            style={{
                gridTemplateColumns: '1fr 1.5fr 1.5fr',
                gap: '1px',
                marginBottom: '8px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <div />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                }}>
                    👤
                </div>
                <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                        Empleado humano
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                        Modelo tradicional
                    </p>
                </div>
            </div>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px',
                background: 'rgba(0,255,136,0.04)', borderRadius: '12px 12px 0 0',
                border: '1px solid rgba(0,255,136,0.15)', borderBottom: 'none',
            }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #00ff88, #7b2fff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                }}>
                    🤖
                </div>
                <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#00ff88', margin: 0 }}>
                        Agente IA
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(0,255,136,0.5)', margin: 0 }}>
                        DevelOP · Siempre activo
                    </p>
                </div>
                <span style={{
                    marginLeft: 'auto', fontSize: '9px', fontWeight: 700,
                    letterSpacing: '0.15em', whiteSpace: 'nowrap',
                    background: 'rgba(0,255,136,0.15)', color: '#00ff88',
                    border: '1px solid rgba(0,255,136,0.3)', borderRadius: '100px', padding: '3px 8px',
                }}>
                    RECOMENDADO
                </span>
            </div>
        </motion.div>
    )
}

// ─── ROI SUMMARY ──────────────────────────────────────────────────────────────

function ROISummary({ isInView }: { isInView: boolean }) {
    const saving = useCountUp(155000, 1800, isInView)
    const savingPct = useCountUp(86, 1400, isInView)

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
                marginTop: 'clamp(32px,4vh,48px)',
                background: 'linear-gradient(135deg, rgba(0,255,136,0.06) 0%, rgba(123,47,255,0.04) 100%)',
                border: '1px solid rgba(0,255,136,0.2)',
                borderRadius: '20px',
                padding: 'clamp(24px,3vw,40px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px',
                position: 'relative',
                overflow: 'hidden',
                flexDirection: 'row', // Default desktop
            }}
            className="flex-col sm:flex-row"
        >
            {/* Shimmer line */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(90deg, transparent, #00ff88 30%, #7b2fff 70%, transparent)',
            }} />

            {/* Savings Counter */}
            <div style={{ flex: '1 1 auto' }}>
                <p style={{
                    fontSize: '12px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)',
                    textTransform: 'uppercase', margin: '0 0 8px',
                }}>
                    Ahorro mensual estimado
                </p>
                <p style={{
                    fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, color: '#00ff88',
                    margin: 0, lineHeight: 1, fontFamily: 'monospace',
                }}>
                    ${saving.toLocaleString('es-AR')}
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: '6px 0 0' }}>
                    vs contratar un empleado administrativo
                </p>
            </div>

            {/* Divider */}
            <div className="hidden sm:block" style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(255,255,255,0.08)', minHeight: '60px' }} />
            <div className="sm:hidden" style={{ height: '1px', width: '100%', background: 'rgba(255,255,255,0.08)' }} />

            {/* Percentage */}
            <div style={{ textAlign: 'center', flex: '1 1 auto' }}>
                <p style={{
                    fontSize: 'clamp(40px,6vw,72px)', fontWeight: 900, margin: 0, lineHeight: 1,
                    background: 'linear-gradient(135deg, #00ff88, #7b2fff)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text', fontFamily: 'monospace',
                }}>
                    {Math.round(savingPct)}%
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: '6px 0 0' }}>
                    más económico
                </p>
            </div>

            {/* Divider */}
            <div className="hidden sm:block" style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(255,255,255,0.08)', minHeight: '60px' }} />
            <div className="sm:hidden" style={{ height: '1px', width: '100%', background: 'rgba(255,255,255,0.08)' }} />

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', flex: '1 1 auto' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0, maxWidth: '200px', lineHeight: 1.4 }}>
                    ¿Cuánto ahorrás en tu negocio?
                </p>
                <motion.a
                    href="#calculador"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                        color: '#080810', fontWeight: 800, fontSize: '13px',
                        letterSpacing: '0.04em', padding: '12px 24px', borderRadius: '100px',
                        textDecoration: 'none', boxShadow: '0 0 24px rgba(0,255,136,0.3)',
                    }}
                >
                    Calculá tu ahorro →
                </motion.a>
            </div>
        </motion.div>
    )
}

// ─── COMPARE TABLE ────────────────────────────────────────────────────────────

function CompareTable({
    rows,
    isInView,
}: {
    rows: CompareRow[]
    isInView: boolean
}) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: 'clamp(20px,3vw,40px)',
            overflow: 'hidden',
        }}>
            <TableHeader isInView={isInView} />
            <div>
                {rows.map((row, i) => (
                    <CompareRowItem key={row.id} row={row} index={i} isInView={isInView} />
                ))}
            </div>
            <ROISummary isInView={isInView} />
        </div>
    )
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

function SectionHeader({ isInView }: { isInView: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vh,64px)' }}
        >
            <div style={{
                display: 'inline-flex', alignItems: 'center',
                border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88',
                padding: '6px 16px', borderRadius: '100px',
                fontSize: '11px', letterSpacing: '0.25em', fontWeight: 600,
                marginBottom: '24px', background: 'rgba(0,255,136,0.06)',
            }}>
                [ LA COMPARACIÓN QUE NADIE HACE ]
            </div>

            <h2 style={{
                fontSize: 'clamp(30px,4.5vw,58px)', fontWeight: 900,
                lineHeight: 1.1, letterSpacing: '-0.02em',
                margin: '0 0 16px 0',
            }}>
                <span style={{ color: 'white', display: 'block' }}>Empleado vs IA.</span>
                <span style={{ display: 'block' }}>
                    <span style={{ color: 'white' }}>Los números </span>
                    <span style={{
                        background: 'linear-gradient(90deg, #00ff88, #7b2fff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        hablan.
                    </span>
                </span>
            </h2>

            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
                No es reemplazar personas. Es liberar a tu equipo de las tareas repetitivas.
            </p>
        </motion.div>
    )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function ComparadorIA() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView   = useInView(sectionRef, { once: true, amount: 0.15 })

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
            <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <SectionHeader isInView={isInView} />
                <CompareTable rows={rows} isInView={isInView} />
            </div>
        </section>
    )
}
