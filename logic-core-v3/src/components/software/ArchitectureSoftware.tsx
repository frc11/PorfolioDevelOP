'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'framer-motion'

const ease = [0.16, 1, 0.3, 1] as const

const copyLines = [
    'Arquitectura pensada para operar sin fricción.',
    'Cada módulo habla con el siguiente sin cuellos de botella,',
    'sin duplicación de datos y con visibilidad real para dirección.',
]

const features = [
    'Servicios desacoplados para crecer sin romper lo existente',
    'Flujo de datos auditado y trazable entre áreas críticas',
    'Seguridad, performance y observabilidad como base del sistema',
]

const nodes = {
    client: { x: 90, y: 130, label: 'Cliente', tone: '#67e8f9', rgb: '103,232,249' },
    api: { x: 280, y: 130, label: 'API Core', tone: '#818cf8', rgb: '129,140,248' },
    auth: { x: 475, y: 70, label: 'Auth', tone: '#c084fc', rgb: '192,132,252' },
    orchestrator: { x: 475, y: 190, label: 'Flows', tone: '#f97316', rgb: '249,115,22' },
    database: { x: 665, y: 78, label: 'Data', tone: '#34d399', rgb: '52,211,153' },
    analytics: { x: 665, y: 190, label: 'BI', tone: '#22d3ee', rgb: '34,211,238' },
    alerts: { x: 845, y: 130, label: 'Alerts', tone: '#f472b6', rgb: '244,114,182' },
} as const

const paths = [
    {
        id: 'client-api',
        d: 'M 132 130 C 185 130, 215 130, 238 130',
        color: '#67e8f9',
        duration: 1.1,
    },
    {
        id: 'api-auth',
        d: 'M 322 118 C 370 96, 410 82, 433 78',
        color: '#a78bfa',
        duration: 1.15,
    },
    {
        id: 'api-flows',
        d: 'M 322 142 C 370 164, 410 178, 433 182',
        color: '#f97316',
        duration: 1.15,
    },
    {
        id: 'auth-data',
        d: 'M 517 70 C 566 70, 598 72, 623 76',
        color: '#34d399',
        duration: 1,
    },
    {
        id: 'flows-bi',
        d: 'M 517 190 C 566 190, 598 192, 623 190',
        color: '#22d3ee',
        duration: 1,
    },
    {
        id: 'data-alerts',
        d: 'M 707 88 C 766 102, 790 116, 803 126',
        color: '#f472b6',
        duration: 1.05,
    },
    {
        id: 'bi-alerts',
        d: 'M 707 180 C 766 166, 790 150, 803 136',
        color: '#f59e0b',
        duration: 1.05,
    },
] as const

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
}

const lineVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.72, ease },
    },
}

function PathDots({
    d,
    color,
    trigger,
    reducedMotion,
}: {
    d: string
    color: string
    trigger: boolean
    reducedMotion: boolean | null
}) {
    const pathRef = useRef<SVGPathElement>(null)
    const [length, setLength] = useState(0)
    const [dotPositions, setDotPositions] = useState([0.18, 0.54, 0.82])
    const [dotCoords, setDotCoords] = useState<{ x: number; y: number; id: string }[]>([])

    useEffect(() => {
        if (!pathRef.current) return
        setLength(pathRef.current.getTotalLength())
    }, [d])

    useEffect(() => {
        if (!trigger || reducedMotion || !length || !pathRef.current) return

        let raf = 0

        const tick = () => {
            setDotPositions((prev) =>
                prev.map((value, index) => {
                    const speed = 0.0038 + index * 0.0016
                    const next = value + speed
                    return next > 1 ? next - 1 : next
                })
            )
            raf = requestAnimationFrame(tick)
        }

        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [trigger, reducedMotion, length])

    useEffect(() => {
        if (!pathRef.current || !length) return

        const nextCoords = dotPositions
            .map((progress, index) => {
                const point = pathRef.current?.getPointAtLength(progress * length)
                if (!point) return null
                return { x: point.x, y: point.y, id: `${index}-${progress}` }
            })
            .filter((value): value is { x: number; y: number; id: string } => value !== null)

        setDotCoords(nextCoords)
    }, [dotPositions, length])

    if (!length) {
        return <path ref={pathRef} d={d} fill="none" stroke="transparent" />
    }

    return (
        <>
            <path ref={pathRef} d={d} fill="none" stroke="transparent" />
            {!reducedMotion &&
                trigger &&
                dotCoords.map((point) => (
                        <g key={`${d}-${point.id}`}>
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="8"
                                fill={color}
                                opacity="0.14"
                            />
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="3.2"
                                fill={color}
                            />
                        </g>
                ))}
        </>
    )
}

export default function ArchitectureSoftware() {
    const sectionRef = useRef<HTMLElement>(null)
    const diagramRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.18 })
    const reducedMotion = useReducedMotion()
    const pulse = useMotionValue(0)

    useScroll({
        target: diagramRef,
        offset: ['start 78%', 'end 30%'],
    })
    const shouldDraw = reducedMotion ? true : isInView

    useEffect(() => {
        if (reducedMotion) return

        let direction = 1
        let value = 0
        let raf = 0

        const loop = () => {
            value += direction * 0.006
            if (value >= 1) {
                value = 1
                direction = -1
            }
            if (value <= 0) {
                value = 0
                direction = 1
            }
            pulse.set(value)
            raf = requestAnimationFrame(loop)
        }

        raf = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(raf)
    }, [pulse, reducedMotion])

    const pulseScale = useTransform(pulse, [0, 1], [0.96, 1.08])
    const pulseOpacity = useTransform(pulse, [0, 1], [0.48, 0.92])

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden bg-[#080810] px-[clamp(20px,5vw,80px)] py-[clamp(80px,12vh,140px)]"
        >
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.018]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                    backgroundSize: '128px',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-28 top-[24%] h-[26rem] w-[26rem] rounded-full blur-[120px]"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 72%)' }}
            />

            <div className="relative mx-auto max-w-7xl">
                <div className="grid items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.4 }}
                        className="relative z-10"
                    >
                        <motion.div
                            variants={lineVariants}
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.06] px-4 py-2"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(129,140,248,0.9)]" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-300">
                                [ Arquitectura B2B ]
                            </span>
                        </motion.div>

                        <div className="space-y-3">
                            {copyLines.map((line, index) => (
                                <div key={line} className="overflow-hidden">
                                    <motion.h2
                                        variants={lineVariants}
                                        className={`text-[clamp(2.25rem,5vw,4.6rem)] font-black leading-[0.9] tracking-[-0.06em] ${
                                            index === copyLines.length - 1
                                                ? 'bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent'
                                                : 'text-white'
                                        }`}
                                    >
                                        {line}
                                    </motion.h2>
                                </div>
                            ))}
                        </div>

                        <motion.p
                            variants={lineVariants}
                            className="mt-7 max-w-xl text-base leading-8 text-white/46 md:text-lg"
                        >
                            Diseñamos software que ordena el negocio desde adentro: entradas consistentes, procesamiento seguro y salidas listas para ejecutar, medir y escalar.
                        </motion.p>

                        <motion.div variants={lineVariants} className="mt-10 grid gap-3">
                            {features.map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-center gap-3 border-t border-white/10 pt-4 text-sm text-white/62 md:text-[15px]"
                                >
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-indigo-300/20 bg-indigo-300/[0.08] text-[11px] text-indigo-200">
                                        ✓
                                    </span>
                                    {feature}
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <div ref={diagramRef} className="relative z-10">
                        <motion.div
                            aria-hidden="true"
                            style={{ scale: pulseScale, opacity: pulseOpacity }}
                            className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
                        >
                            <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.16)_0%,rgba(34,211,238,0.1)_34%,rgba(123,47,255,0.07)_56%,transparent_74%)]" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 28, scale: 0.98 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{ duration: reducedMotion ? 0 : 0.9, ease }}
                            className="relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-6"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),transparent_30%,transparent_70%,rgba(34,211,238,0.06))]" />

                            <svg viewBox="0 0 940 260" className="relative z-10 w-full overflow-visible">
                                <defs>
                                    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {paths.map((path) => (
                                    <g key={path.id}>
                                        <path
                                            d={path.d}
                                            fill="none"
                                            stroke="rgba(255,255,255,0.08)"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeDasharray="6 8"
                                        />
                                        <motion.path
                                            d={path.d}
                                            fill="none"
                                            stroke={path.color}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            pathLength={1}
                                            initial={{ pathLength: reducedMotion ? 1 : 0, opacity: reducedMotion ? 1 : 0.4 }}
                                            whileInView={{ pathLength: 1, opacity: 1 }}
                                            viewport={{ once: true, amount: 0.45 }}
                                            transition={{ duration: reducedMotion ? 0 : path.duration, ease }}
                                            filter="url(#softGlow)"
                                        />
                                        <PathDots
                                            d={path.d}
                                            color={path.color}
                                            trigger={shouldDraw}
                                            reducedMotion={reducedMotion}
                                        />
                                    </g>
                                ))}

                                {Object.values(nodes).map((node) => (
                                    <g key={node.label} transform={`translate(${node.x} ${node.y})`}>
                                        <circle
                                            r="32"
                                            fill={`rgba(${node.rgb},0.1)`}
                                            stroke={`rgba(${node.rgb},0.28)`}
                                            strokeWidth="1.5"
                                        />
                                        <circle
                                            r="18"
                                            fill={`rgba(${node.rgb},0.22)`}
                                            filter="url(#softGlow)"
                                        />
                                        <circle r="5" fill={node.tone} />
                                        <text
                                            x="0"
                                            y="56"
                                            textAnchor="middle"
                                            className="fill-white/55 text-[11px] uppercase tracking-[0.24em]"
                                        >
                                            {node.label}
                                        </text>
                                    </g>
                                ))}
                            </svg>

                            <div className="relative z-10 mt-5 grid gap-3 border-t border-white/8 pt-5 md:grid-cols-3">
                                <div className="rounded-[1.1rem] border border-white/[0.05] bg-white/[0.02] p-4">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/28">Entrada</div>
                                    <div className="mt-2 text-sm font-semibold text-white">Requests validadas</div>
                                </div>
                                <div className="rounded-[1.1rem] border border-white/[0.05] bg-white/[0.02] p-4">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/28">Proceso</div>
                                    <div className="mt-2 text-sm font-semibold text-white">Reglas, permisos y flujos</div>
                                </div>
                                <div className="rounded-[1.1rem] border border-white/[0.05] bg-white/[0.02] p-4">
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/28">Salida</div>
                                    <div className="mt-2 text-sm font-semibold text-white">Datos, alertas y decisiones</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: reducedMotion ? 0 : 1.1, delay: 0.3, ease }}
                    className="mt-[clamp(48px,7vh,80px)] h-px origin-left bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.28)_20%,rgba(123,47,255,0.4)_50%,rgba(34,211,238,0.28)_80%,transparent)]"
                />
            </div>
        </section>
    )
}
