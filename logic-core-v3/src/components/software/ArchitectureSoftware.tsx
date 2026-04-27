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

const headlineMain = 'Tu sistema trabaja. Aunque vos no estés.'
const headlineSub = 'Cada área conectada. Cada dato trazado. Sin intervención manual.'

interface ArchitecturePillar {
    metric: string
    metricColor: string
    metricColorRgb: string
    title: string
    description: string
}

interface DiagramFlowCard {
    label: string
    description: string
}

const architecturePillars: ArchitecturePillar[] = [
    {
        metric: '99.9%',
        metricColor: '#34d399',
        metricColorRgb: '52,211,153',
        title: 'Uptime garantizado',
        description: 'Tu sistema disponible las 24hs, los 365 días. Sin caídas en horario comercial.',
    },
    {
        metric: '0',
        metricColor: '#818cf8',
        metricColorRgb: '129,140,248',
        title: 'Pérdida de datos',
        description: 'Backups automáticos cada hora. Todo lo que entrás, queda guardado para siempre.',
    },
    {
        metric: '<2s',
        metricColor: '#7b2fff',
        metricColorRgb: '123,47,255',
        title: 'Tiempo de respuesta',
        description: 'Cualquier consulta, reporte o operación responde en menos de 2 segundos.',
    },
]

const diagramFlowCards: DiagramFlowCard[] = [
    {
        label: 'Lo que pasa',
        description: 'Un pedido, una venta, un turno',
    },
    {
        label: 'Lo que hace el sistema',
        description: 'Procesa, actualiza y notifica',
    },
    {
        label: 'Lo que ves vos',
        description: 'Dashboard actualizado al segundo',
    },
]

const nodes = {
    client: { x: 90, y: 130, label: 'Pedido', tone: '#67e8f9', rgb: '103,232,249' },
    api: { x: 280, y: 130, label: 'Sistema', tone: '#818cf8', rgb: '129,140,248' },
    auth: { x: 475, y: 70, label: 'Seguridad', tone: '#c084fc', rgb: '192,132,252' },
    orchestrator: { x: 475, y: 190, label: 'Procesos', tone: '#f97316', rgb: '249,115,22' },
    database: { x: 665, y: 78, label: 'Datos', tone: '#34d399', rgb: '52,211,153' },
    analytics: { x: 665, y: 190, label: 'Reportes', tone: '#22d3ee', rgb: '34,211,238' },
    alerts: { x: 845, y: 130, label: 'Alertas', tone: '#f472b6', rgb: '244,114,182' },
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

const DOT_OFFSETS = [0.18, 0.54, 0.82] as const

const ENERGY_TRAILS = [
    'M -140 650 C 82 600, 260 546, 426 500 C 602 450, 782 386, 1004 308',
    'M -80 692 C 146 636, 324 556, 518 514 C 684 476, 826 412, 1010 314',
    'M -24 724 C 208 660, 382 582, 568 540 C 752 496, 866 434, 1016 320',
    'M 52 746 C 286 684, 438 616, 620 574 C 796 532, 904 468, 1022 326',
] as const

const TRAIL_SPARKS = [
    { x: 14, y: 73, size: 3.4, delay: 0.2 },
    { x: 21, y: 69, size: 2.6, delay: 0.7 },
    { x: 29, y: 66, size: 3.1, delay: 1.1 },
    { x: 37, y: 63, size: 2.5, delay: 1.4 },
    { x: 46, y: 60, size: 3.2, delay: 1.8 },
    { x: 56, y: 56, size: 2.7, delay: 2.1 },
    { x: 66, y: 52, size: 3.4, delay: 2.5 },
    { x: 76, y: 48, size: 2.6, delay: 2.8 },
    { x: 86, y: 43, size: 3.1, delay: 3.1 },
    { x: 93, y: 39, size: 3.8, delay: 3.4 },
] as const

function PathDots({
    d,
    color,
    trigger,
    reducedMotion,
    speedMultiplier,
}: {
    d: string
    color: string
    trigger: boolean
    reducedMotion: boolean | null
    speedMultiplier: number
}) {
    const pathRef = useRef<SVGPathElement>(null)
    const haloRefs = useRef<(SVGCircleElement | null)[]>([])
    const coreRefs = useRef<(SVGCircleElement | null)[]>([])
    const positionsRef = useRef<number[]>([...DOT_OFFSETS])
    const lastFrameRef = useRef(0)
    const speedMultiplierRef = useRef(speedMultiplier)
    const [length, setLength] = useState(0)

    useEffect(() => {
        speedMultiplierRef.current = speedMultiplier
    }, [speedMultiplier])

    useEffect(() => {
        if (!pathRef.current) return
        setLength(pathRef.current.getTotalLength())
    }, [d])

    useEffect(() => {
        if (!trigger || reducedMotion || !length || !pathRef.current) return

        let raf = 0

        const tick = (timestamp: number) => {
            if (!pathRef.current) return
            if (!lastFrameRef.current) lastFrameRef.current = timestamp

            const delta = Math.min(64, timestamp - lastFrameRef.current)
            lastFrameRef.current = timestamp
            const multiplier = speedMultiplierRef.current

            positionsRef.current = positionsRef.current.map((value, index) => {
                const speedPerMs = 0.00021 + index * 0.00009
                const next = value + speedPerMs * delta * multiplier
                return next > 1 ? next - 1 : next
            })

            positionsRef.current.forEach((progress, index) => {
                const point = pathRef.current?.getPointAtLength(progress * length)
                if (!point) return

                const halo = haloRefs.current[index]
                const core = coreRefs.current[index]
                if (!halo || !core) return

                const x = String(point.x)
                const y = String(point.y)
                halo.setAttribute('cx', x)
                halo.setAttribute('cy', y)
                core.setAttribute('cx', x)
                core.setAttribute('cy', y)
            })

            raf = requestAnimationFrame(tick)
        }

        raf = requestAnimationFrame(tick)
        return () => {
            cancelAnimationFrame(raf)
            lastFrameRef.current = 0
        }
    }, [trigger, reducedMotion, length, d])

    if (!length) {
        return <path ref={pathRef} d={d} fill="none" stroke="transparent" />
    }

    return (
        <>
            <path ref={pathRef} d={d} fill="none" stroke="transparent" />
            {!reducedMotion &&
                trigger &&
                DOT_OFFSETS.map((_, index) => (
                    <g key={`${d}-${index}`}>
                        <circle
                            ref={(element) => {
                                haloRefs.current[index] = element
                            }}
                            cx="0"
                            cy="0"
                            r="8"
                            fill={color}
                            opacity="0.14"
                        />
                        <circle
                            ref={(element) => {
                                coreRefs.current[index] = element
                            }}
                            cx="0"
                            cy="0"
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
    const diagramCardRef = useRef<HTMLDivElement>(null)
    const flowCardRefs = useRef<(HTMLDivElement | null)[]>([])
    const pillarRefs = useRef<(HTMLDivElement | null)[]>([])
    const isInView = useInView(sectionRef, { once: true, amount: 0.18 })
    const reducedMotion = useReducedMotion()
    const pulse = useMotionValue(0)
    const [diagramHovered, setDiagramHovered] = useState(false)
    const [isTouchViewport, setIsTouchViewport] = useState(false)
    const [isDiagramCentered, setIsDiagramCentered] = useState(false)
    const [centeredFlowCards, setCenteredFlowCards] = useState<boolean[]>(() =>
        diagramFlowCards.map(() => false)
    )
    const [centeredPillars, setCenteredPillars] = useState<boolean[]>(() =>
        architecturePillars.map(() => false)
    )

    useScroll({
        target: diagramRef,
        offset: ['start 78%', 'end 30%'],
    })
    const effectiveReducedMotion = reducedMotion ?? false
    const shouldDraw = effectiveReducedMotion ? true : isInView

    useEffect(() => {
        if (typeof window === 'undefined') return

        const mediaQuery = window.matchMedia('(max-width: 1024px)')
        const syncViewportMode = () => setIsTouchViewport(mediaQuery.matches)

        syncViewportMode()
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', syncViewportMode)
            return () => mediaQuery.removeEventListener('change', syncViewportMode)
        }

        mediaQuery.addListener(syncViewportMode)
        return () => mediaQuery.removeListener(syncViewportMode)
    }, [])

    useEffect(() => {
        if (!isTouchViewport) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const target = entry.target as HTMLElement
                    const role = target.dataset.centerRole
                    const rawIndex = target.dataset.centerIndex
                    const index = rawIndex ? Number(rawIndex) : -1
                    const isActive = entry.isIntersecting

                    if (role === 'diagram') {
                        setIsDiagramCentered((previous) => (previous === isActive ? previous : isActive))
                        return
                    }

                    if (role === 'flow' && index >= 0) {
                        setCenteredFlowCards((previous) => {
                            if (previous[index] === isActive) return previous
                            const next = [...previous]
                            next[index] = isActive
                            return next
                        })
                        return
                    }

                    if (role === 'pillar' && index >= 0) {
                        setCenteredPillars((previous) => {
                            if (previous[index] === isActive) return previous
                            const next = [...previous]
                            next[index] = isActive
                            return next
                        })
                    }
                })
            },
            {
                root: null,
                threshold: 0,
                rootMargin: '-45% 0px -45% 0px',
            }
        )

        const targets: HTMLElement[] = []
        if (diagramCardRef.current) {
            diagramCardRef.current.dataset.centerRole = 'diagram'
            targets.push(diagramCardRef.current)
        }

        flowCardRefs.current.forEach((element, index) => {
            if (!element) return
            element.dataset.centerRole = 'flow'
            element.dataset.centerIndex = String(index)
            targets.push(element)
        })

        pillarRefs.current.forEach((element, index) => {
            if (!element) return
            element.dataset.centerRole = 'pillar'
            element.dataset.centerIndex = String(index)
            targets.push(element)
        })

        targets.forEach((element) => observer.observe(element))

        return () => observer.disconnect()
    }, [isTouchViewport])

    useEffect(() => {
        if (effectiveReducedMotion) return

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
    }, [pulse, effectiveReducedMotion])

    const pulseScale = useTransform(pulse, [0, 1], [0.96, 1.08])
    const pulseOpacity = useTransform(pulse, [0, 1], [0.48, 0.92])
    const diagramInteractive = diagramHovered || (isTouchViewport && isDiagramCentered)

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden bg-[#080810] px-[clamp(20px,5vw,80px)] py-[clamp(80px,12vh,140px)]"
        >
            <style>{`
                @keyframes gridDrift {
                    from {
                        background-position: 0 0, 0 0;
                    }
                    to {
                        background-position: 0 72px, 72px 0;
                    }
                }

                @keyframes floorShift {
                    from {
                        background-position: 0 0, 0 0;
                    }
                    to {
                        background-position: 0 58px, 64px 0;
                    }
                }

                @keyframes portalSpin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes portalPulse {
                    0%, 100% {
                        opacity: 0.56;
                        transform: scale(0.97);
                    }
                    50% {
                        opacity: 0.88;
                        transform: scale(1.04);
                    }
                }

                @keyframes trailFlow {
                    from {
                        stroke-dashoffset: 0;
                    }
                    to {
                        stroke-dashoffset: -340;
                    }
                }

                @keyframes sparkPulse {
                    0%, 100% {
                        opacity: 0.28;
                        transform: scale(0.74);
                    }
                    40% {
                        opacity: 0.92;
                        transform: scale(1);
                    }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(120% 88% at 16% 18%, rgba(18,66,166,0.16) 0%, rgba(10,16,40,0) 62%), radial-gradient(98% 74% at 84% 34%, rgba(132,56,255,0.16) 0%, rgba(8,9,22,0) 68%), linear-gradient(128deg, #03050d 0%, #040816 46%, #050713 100%)',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.014]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                    backgroundSize: '128px',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(90deg, rgba(88,120,255,0.1) 0px, rgba(88,120,255,0.1) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(180deg, rgba(64,94,212,0.09) 0px, rgba(64,94,212,0.09) 1px, transparent 1px, transparent 56px)',
                    maskImage: 'radial-gradient(110% 86% at 50% 52%, black 0%, black 48%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(110% 86% at 50% 52%, black 0%, black 48%, transparent 100%)',
                    animation: effectiveReducedMotion ? undefined : 'gridDrift 34s linear infinite',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-[-2rem] h-[44%] opacity-[0.14]"
                style={{
                    backgroundImage:
                        'radial-gradient(84% 96% at 50% 116%, rgba(115,106,255,0.26) 0%, transparent 72%), repeating-linear-gradient(90deg, rgba(108,128,255,0.12) 0px, rgba(108,128,255,0.12) 1px, transparent 1px, transparent 70px), repeating-linear-gradient(180deg, rgba(117,78,255,0.1) 0px, rgba(117,78,255,0.1) 1px, transparent 1px, transparent 56px)',
                    transform: 'perspective(960px) rotateX(69deg) scale(1.08)',
                    transformOrigin: 'bottom center',
                    animation: effectiveReducedMotion ? undefined : 'floorShift 38s linear infinite',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-28 top-[20%] h-[26rem] w-[26rem] rounded-full opacity-[0.38] blur-[118px]"
                style={{ background: 'radial-gradient(circle, rgba(96,85,255,0.38) 0%, rgba(11,16,40,0) 72%)' }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-11rem] top-[7%] h-[35rem] w-[35rem] rounded-full opacity-[0.48] blur-[18px]"
                style={{
                    background:
                        'radial-gradient(circle at 50% 50%, rgba(153,92,255,0.42) 0%, rgba(104,73,255,0.24) 22%, rgba(34,211,238,0.1) 34%, rgba(8,12,30,0) 68%)',
                    animation: effectiveReducedMotion ? undefined : 'portalPulse 5.8s ease-in-out infinite',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-8rem] top-[13%] h-[29rem] w-[29rem] rounded-full opacity-[0.62]"
                style={{
                    background:
                        'conic-gradient(from 96deg, rgba(34,211,238,0.08), rgba(167,139,250,0.86), rgba(236,72,153,0.52), rgba(34,211,238,0.08))',
                    WebkitMask:
                        'radial-gradient(circle, transparent 47%, black 49%, black 56%, transparent 58%, transparent 62%, black 64%, black 67%, transparent 69%)',
                    mask:
                        'radial-gradient(circle, transparent 47%, black 49%, black 56%, transparent 58%, transparent 62%, black 64%, black 67%, transparent 69%)',
                    filter: 'drop-shadow(0 0 32px rgba(143,92,255,0.48))',
                    animation: effectiveReducedMotion ? undefined : 'portalSpin 24s linear infinite',
                }}
            />

            <svg
                aria-hidden="true"
                viewBox="0 0 1024 760"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-x-0 bottom-[-3%] h-[78%] w-full opacity-[0.42]"
            >
                {ENERGY_TRAILS.map((trail, index) => (
                    <g key={`energy-trail-${trail}`}>
                        <path
                            d={trail}
                            fill="none"
                            stroke={index % 2 === 0 ? 'rgba(168,85,247,0.22)' : 'rgba(34,211,238,0.2)'}
                            strokeWidth={index === 2 ? 6.5 : 5}
                            strokeLinecap="round"
                        />
                        <path
                            d={trail}
                            fill="none"
                            stroke={index % 2 === 0 ? '#a855f7' : '#22d3ee'}
                            strokeWidth={index === 1 ? 2.9 : 2.6}
                            strokeLinecap="round"
                            strokeDasharray="26 38"
                            style={{
                                filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.52))',
                                animation: effectiveReducedMotion ? undefined : `trailFlow ${10 + index * 1.9}s linear infinite`,
                            }}
                        />
                    </g>
                ))}
            </svg>

            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {TRAIL_SPARKS.map((spark) => (
                    <span
                        key={`spark-${spark.x}-${spark.y}`}
                        className="absolute rounded-full"
                        style={{
                            left: `${spark.x}%`,
                            top: `${spark.y}%`,
                            width: `${spark.size}px`,
                            height: `${spark.size}px`,
                            background: 'rgba(191,219,254,0.78)',
                            boxShadow: '0 0 8px rgba(139,92,246,0.45), 0 0 16px rgba(34,211,238,0.28)',
                            animation: effectiveReducedMotion
                                ? undefined
                                : `sparkPulse 3.2s ease-in-out ${spark.delay}s infinite`,
                        }}
                    />
                ))}
            </div>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(3,5,16,0.36) 0%, rgba(4,6,16,0.44) 56%, rgba(3,5,14,0.5) 100%)',
                }}
            />

            <div className="relative mx-auto max-w-7xl">
                <div className="grid items-start gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 xl:gap-14">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.4 }}
                        className="relative z-10 max-w-2xl lg:max-w-none"
                    >
                        <motion.div
                            variants={lineVariants}
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-300/35 bg-indigo-300/[0.14] px-4 py-2 shadow-[0_8px_26px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(129,140,248,0.9)]" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-300">
                                [ CONSTRUIDO PARA NO FALLAR ]
                            </span>
                        </motion.div>

                        <motion.h2
                            variants={lineVariants}
                            className="text-[clamp(2rem,3.6vw,3.55rem)] font-black leading-[0.96] tracking-[-0.04em] text-white"
                        >
                            {headlineMain}
                        </motion.h2>

                        <motion.h3
                            variants={lineVariants}
                            className="mt-2 bg-gradient-to-r from-indigo-100 via-indigo-200 to-cyan-200 bg-clip-text text-[clamp(1.2rem,2vw,1.6rem)] font-bold tracking-[-0.02em] text-transparent"
                        >
                            {headlineSub}
                        </motion.h3>

                        <motion.p variants={lineVariants} className="mt-6 max-w-xl text-base leading-8 text-white/60 md:text-lg">
                            No importa si son las 3AM o un feriado. Tu sistema procesa pedidos, actualiza stock, emite facturas y alerta a tu equipo — solo.
                        </motion.p>
                    </motion.div>

                    <div ref={diagramRef} className="relative z-10 lg:pt-2">
                        <motion.div
                            aria-hidden="true"
                            style={{ scale: pulseScale, opacity: pulseOpacity }}
                            className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
                        >
                            <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.16)_0%,rgba(34,211,238,0.1)_34%,rgba(123,47,255,0.07)_56%,transparent_74%)]" />
                        </motion.div>

                        <motion.div
                            ref={diagramCardRef}
                            initial={{ opacity: 0, y: 28, scale: 0.98 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{ duration: reducedMotion ? 0 : 0.9, ease }}
                            onHoverStart={() => setDiagramHovered(true)}
                            onHoverEnd={() => setDiagramHovered(false)}
                            onFocus={() => setDiagramHovered(true)}
                            onBlur={() => setDiagramHovered(false)}
                            whileHover={
                                effectiveReducedMotion
                                    ? undefined
                                    : {
                                        y: -3,
                                        scale: 1.008,
                                        borderColor: 'rgba(167,139,250,0.46)',
                                        boxShadow: '0 30px 90px rgba(56,189,248,0.2)',
                                    }
                            }
                            className="relative overflow-hidden rounded-[2rem] border border-white/[0.14] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-[18px] transition-all duration-300 md:p-6"
                            style={{
                                background:
                                    'linear-gradient(148deg, rgba(15,20,44,0.86) 0%, rgba(13,18,40,0.84) 44%, rgba(11,16,34,0.88) 100%)',
                                borderColor: isTouchViewport && isDiagramCentered
                                    ? 'rgba(167,139,250,0.46)'
                                    : 'rgba(255,255,255,0.14)',
                                boxShadow: isTouchViewport && isDiagramCentered
                                    ? '0 30px 90px rgba(56,189,248,0.2), inset 0 1px 0 rgba(255,255,255,0.14)'
                                    : '0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14)',
                            }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03)_28%,rgba(4,8,24,0.06)_56%,rgba(34,211,238,0.08)_100%)]" />

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
                                            reducedMotion={effectiveReducedMotion}
                                            speedMultiplier={diagramInteractive ? 2.6 : 1}
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
                                {diagramFlowCards.map((card, index) => {
                                    const centered = isTouchViewport && centeredFlowCards[index]
                                    return (
                                        <motion.div
                                            key={card.label}
                                            ref={(element) => {
                                                flowCardRefs.current[index] = element
                                            }}
                                            whileHover={
                                                effectiveReducedMotion
                                                    ? undefined
                                                    : {
                                                        y: -2,
                                                        borderColor: 'rgba(103,232,249,0.35)',
                                                        backgroundColor: 'rgba(255,255,255,0.12)',
                                                    }
                                            }
                                            animate={
                                                centered
                                                    ? {
                                                        y: -2,
                                                        borderColor: 'rgba(103,232,249,0.35)',
                                                        backgroundColor: 'rgba(255,255,255,0.12)',
                                                    }
                                                    : {
                                                        y: 0,
                                                        borderColor: 'rgba(255,255,255,0.14)',
                                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                                    }
                                            }
                                            transition={{ duration: 0.26, ease }}
                                            className="rounded-[1.1rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_24px_rgba(0,0,0,0.24)] backdrop-blur-md"
                                        >
                                            <div className="text-[10px] uppercase tracking-[0.22em] text-white/48">{card.label}</div>
                                            <div className="mt-2 text-sm font-semibold text-white">{card.description}</div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.25 }}
                        variants={containerVariants}
                        className="mt-4 grid gap-4 md:grid-cols-3 lg:col-span-2"
                    >
                        {architecturePillars.map((pillar, index) => (
                            <motion.div
                                key={pillar.title}
                                ref={(element) => {
                                    pillarRefs.current[index] = element
                                }}
                                variants={lineVariants}
                                whileHover={
                                    effectiveReducedMotion
                                        ? undefined
                                        : {
                                            y: -4,
                                            scale: 1.012,
                                            borderColor: 'rgba(129,140,248,0.34)',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            boxShadow: '0 18px 38px rgba(15,23,42,0.32)',
                                        }
                                }
                                transition={{ duration: 0.24, ease }}
                                className="rounded-2xl border border-white/[0.16] bg-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_14px_30px_rgba(0,0,0,0.26)] backdrop-blur-md transition-all duration-300"
                                style={
                                    isTouchViewport && centeredPillars[index]
                                        ? {
                                            borderColor: 'rgba(129,140,248,0.34)',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            boxShadow: '0 18px 38px rgba(15,23,42,0.32), inset 0 1px 0 rgba(255,255,255,0.14)',
                                        }
                                        : undefined
                                }
                            >
                                <div
                                    style={{
                                        fontSize: 'clamp(28px, 3vw, 36px)',
                                        fontWeight: 900,
                                        letterSpacing: '-0.03em',
                                        color: pillar.metricColor,
                                        lineHeight: 1,
                                        marginBottom: '8px',
                                        textShadow: `0 0 20px rgba(${pillar.metricColorRgb}, 0.4)`,
                                    }}
                                >
                                    {pillar.metric}
                                </div>
                                <div
                                    style={{
                                        height: '2px',
                                        width: '32px',
                                        background: `linear-gradient(90deg, rgba(${pillar.metricColorRgb},1), transparent)`,
                                        borderRadius: '100px',
                                        marginBottom: '12px',
                                    }}
                                />
                                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: `rgba(${pillar.metricColorRgb}, 0.85)`, marginBottom: '8px' }}>
                                    {pillar.title}
                                </p>
                                <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.62)' }}>
                                    {pillar.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
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
