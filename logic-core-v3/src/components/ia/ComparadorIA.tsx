'use client'

import React, { useRef, useState, useEffect } from 'react'
<<<<<<< HEAD
import { motion, useInView, AnimatePresence } from 'motion/react'
import { User, Bot, X } from 'lucide-react'
=======
import { motion, useInView } from 'motion/react'
import {
    Bot,
    Calendar,
    CircleDollarSign,
    Clock3,
    FileCheck2,
    GaugeCircle,
    ShieldCheck,
    TrendingUp,
    UserRound,
    Users,
    type LucideIcon,
} from 'lucide-react'
>>>>>>> 375b3d5a179230b000c7f7bd76c99ca1c78ba0cf

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
    icon: LucideIcon
    highlight: boolean
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const rows: CompareRow[] = [
    {
        id: 0, icon: Clock3, attribute: 'Disponibilidad',
        human: 'Lun–Vie · 9 a 18hs', ai: '24 / 7 / 365',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 1, icon: CircleDollarSign, attribute: 'Costo mensual',
        human: '$180.000 – $350.000', ai: 'Desde $25.000',
        humanResult: 'lose', aiResult: 'win', highlight: true,
    },
    {
        id: 2, icon: GaugeCircle, attribute: 'Tiempo de respuesta',
        human: '2 – 24 horas', ai: '< 3 segundos',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 3, icon: Users, attribute: 'Capacidad simultánea',
        human: '1 conversación', ai: 'Ilimitadas',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 4, icon: ShieldCheck, attribute: 'Consistencia',
        human: 'Variable según humor', ai: 'Siempre igual',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 5, icon: TrendingUp, attribute: 'Escalabilidad',
        human: 'Contratar más personas', ai: 'Instantánea',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 6, icon: Calendar, attribute: 'Vacaciones / Licencias',
        human: 'Sí — el negocio para', ai: 'Nunca',
        humanResult: 'lose', aiResult: 'win', highlight: false,
    },
    {
        id: 7, icon: FileCheck2, attribute: 'Tiempo de onboarding',
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
    const RowIcon = row.icon

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            whileHover={{
                backgroundColor: 'rgba(0,255,136,0.055)',
                boxShadow: 'inset 0 0 0 1px rgba(0,255,136,0.2), 0 10px 24px rgba(0,0,0,0.28)',
                scale: 1.0015,
            }}
            transition={{
                duration: 0.5,
                delay: 0.3 + index * 0.07,
                ease: [0.16, 1, 0.3, 1],
                backgroundColor: { duration: 0.06, ease: 'linear' },
                boxShadow: { duration: 0.06, ease: 'linear' },
                scale: { duration: 0.06, ease: 'linear' },
            }}
            style={{
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: row.highlight ? 'rgba(0,255,136,0.03)' : 'transparent',
                borderRadius: 0,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <motion.div
                aria-hidden="true"
                initial={{ x: '-120%' }}
                whileHover={{ x: '120%' }}
                transition={{ duration: 0.2, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(100deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)',
                    pointerEvents: 'none',
                }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_1.5fr]">

                {/* Attribute */}
                <div style={{
                    padding: 'clamp(14px,2vh,20px) 0',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '7px',
                        border: '1px solid rgba(255,255,255,0.14)',
                        background: 'rgba(255,255,255,0.06)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        color: 'rgba(255,255,255,0.7)',
                        flexShrink: 0,
                    }}>
                        <RowIcon size={13} strokeWidth={2.2} />
                    </span>
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
                        style={{ fontSize: '14px', flexShrink: 0, color: '#ef4444', display: 'flex', alignItems: 'center' }}
                    >
                        <X size={16} strokeWidth={2} />
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
                    background: 'transparent',
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
                        style={{ fontSize: '14px', color: '#00ff88', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
                    >
                        <X size={16} strokeWidth={2} style={{ color: '#00ff88' }} />
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
                marginBottom: '0',
                paddingBottom: '0',
                borderBottom: 'none',
            }}
        >
            <div />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px' }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <UserRound size={14} strokeWidth={2.1} color="rgba(255,255,255,0.76)" />
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
                background: 'transparent',
                borderRadius: 0,
                border: 'none',
            }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #00ff88, #34f5c5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Bot size={14} strokeWidth={2.2} color="#04130b" />
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
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(52, 245, 197, 0.06) 100%)',
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
                background: 'linear-gradient(90deg, transparent, #00ff88 30%, #34f5c5 70%, transparent)',
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
                    color: '#34f5c5',
                    textShadow: '0 0 24px rgba(52,245,197,0.22)',
                    fontFamily: 'monospace',
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
                    Costo de no automatizar
                </p>
                <p
                    style={{
                        margin: 0,
                        fontSize: '13px',
                        lineHeight: 1.6,
                        color: 'rgba(255,255,255,0.52)',
                        maxWidth: '240px',
                    }}
                >
                    Cada mes con atencion manual suma sueldos, supervision y oportunidades perdidas por demora.
                </p>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(0,255,136,0.14)',
                        color: '#00ff88',
                        fontWeight: 700,
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                        padding: '8px 14px',
                        borderRadius: '100px',
                        border: '1px solid rgba(0,255,136,0.28)',
                    }}
                >
                    IMPLEMENTACION EN 7-14 DIAS
                </div>
            </div>
        </motion.div>
    )
}

function CostContextBlock({ isInView }: { isInView: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
            style={{
                marginTop: 'clamp(16px,2.5vh,24px)',
                borderRadius: '18px',
                border: '1px solid rgba(0,255,136,0.18)',
                background: 'linear-gradient(145deg, rgba(0,255,136,0.08), rgba(52,245,197,0.04))',
                padding: 'clamp(16px,2.4vw,26px)',
            }}
        >
            <div style={{ marginBottom: '14px' }}>
                <p
                    style={{
                        margin: '0 0 6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        color: 'rgba(167,243,208,0.86)',
                        textTransform: 'uppercase',
                    }}
                >
                    Costo de no automatizar en contexto
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.52)', lineHeight: 1.6 }}>
                    Esta comparativa muestra por que el modelo tradicional termina siendo mas caro en pocos meses.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div
                    style={{
                        borderRadius: '14px',
                        border: '1px solid rgba(148,163,184,0.28)',
                        background: 'linear-gradient(145deg, rgba(148,163,184,0.08), rgba(255,255,255,0.02))',
                        padding: '16px',
                    }}
                >
                    <p style={{ margin: '0 0 6px', fontSize: '10px', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Modelo tradicional
                    </p>
                    <p style={{ margin: '0 0 6px', fontSize: '32px', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                        USD 450-700 / mes
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.58)' }}>
                        Un perfil para responder en horario comercial, mas supervision, ausencias y curva de entrenamiento.
                    </p>
                </div>

                <div
                    style={{
                        borderRadius: '14px',
                        border: '1px solid rgba(0,255,136,0.3)',
                        background: 'linear-gradient(145deg, rgba(0,255,136,0.14), rgba(255,255,255,0.02))',
                        padding: '16px',
                    }}
                >
                    <p style={{ margin: '0 0 6px', fontSize: '10px', letterSpacing: '0.16em', color: 'rgba(167,243,208,0.9)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Implementacion IA develOP
                    </p>
                    <p style={{ margin: '0 0 6px', fontSize: '32px', fontWeight: 900, color: '#a7f3d0', lineHeight: 1 }}>
                        Desde USD 300 inicial
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.68)' }}>
                        Setup base de agente IA para vender, calificar y responder 24/7, con mantenimiento opcional.
                    </p>
                </div>
            </div>

            <div
                style={{
                    marginTop: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,255,136,0.24)',
                    background: 'rgba(0,255,136,0.08)',
                    padding: '10px 12px',
                    textAlign: 'center',
                    color: 'rgba(209,250,229,0.9)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                }}
            >
                En muchos negocios, 1 mes de atencion manual ya cuesta mas que implementar IA.
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
            <CostContextBlock isInView={isInView} />
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
                        color: '#34f5c5',
                        textShadow: '0 0 18px rgba(52,245,197,0.18)',
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
            id="comparador"
            ref={sectionRef}
            style={{
                padding: 'clamp(80px,12vh,140px) clamp(20px,5vw,80px)',
                background: 'transparent',
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
