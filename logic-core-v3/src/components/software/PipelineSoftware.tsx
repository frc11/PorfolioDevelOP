'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
    motion,
    useInView,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
} from 'framer-motion'
import { Code2, FlaskConical, Rocket, Search } from 'lucide-react'

type Stage = {
    id: string
    stage: string
    title: string
    subtitle: string
    description: string
    output: string
    accent: string
    accentRgb: string
    iconComponent: React.ReactNode
}

const stages: Stage[] = [
    {
        id: 'analysis',
        stage: 'STAGE 01',
        title: 'Análisis',
        subtitle: '[ discovery / requirements / scope ]',
        description:
            'Traducimos operación, restricciones y objetivos de negocio en un sistema viable, medible y listo para escalar.',
        output: 'Mapa de módulos, riesgos y prioridades del producto',
        accent: '#a855f7',
        accentRgb: '168,85,247',
        iconComponent: <Search size={22} strokeWidth={1.5} />,
    },
    {
        id: 'development',
        stage: 'STAGE 02',
        title: 'Desarrollo',
        subtitle: '[ backend / frontend / architecture ]',
        description:
            'Construimos el núcleo técnico con una base clara: APIs, reglas de negocio, estados y superficies listas para operación real.',
        output: 'Servicios desacoplados y flujos críticos ya productivos',
        accent: '#22d3ee',
        accentRgb: '34,211,238',
        iconComponent: <Code2 size={22} strokeWidth={1.5} />,
    },
    {
        id: 'testing',
        stage: 'STAGE 03',
        title: 'Testing',
        subtitle: '[ qa / edge cases / resilience ]',
        description:
            'Probamos comportamiento, errores y escenarios límite para que la operación no dependa de “tener suerte” en producción.',
        output: 'Cobertura de riesgos, validaciones y calidad perceptible',
        accent: '#14b8a6',
        accentRgb: '20,184,166',
        iconComponent: <FlaskConical size={22} strokeWidth={1.5} />,
    },
    {
        id: 'deploy',
        stage: 'STAGE 04',
        title: 'Deploy',
        subtitle: '[ release / observability / scale ]',
        description:
            'Lanzamos con métricas, monitoreo y visibilidad para que cada release sea controlado, trazable y sostenible.',
        output: 'Sistema online, medido y listo para iterar sin fricción',
        accent: '#34d399',
        accentRgb: '52,211,153',
        iconComponent: <Rocket size={22} strokeWidth={1.5} />,
    },
] as const

const ease = [0.16, 1, 0.3, 1] as const
const STAGE_SCROLL_WEIGHTS = [1.05, 1.45, 1.05] as const

function clamp01(value: number) {
    if (value < 0) return 0
    if (value > 1) return 1
    return value
}

function getInterpolatedTrackX(progress: number, anchors: number[]) {
    if (!anchors.length) return 0
    if (anchors.length === 1) return anchors[0]

    const transitions = anchors.length - 1
    const weights = Array.from({ length: transitions }, (_, index) => STAGE_SCROLL_WEIGHTS[index] ?? 1)
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let cursor = clamp01(progress) * totalWeight

    for (let index = 0; index < transitions; index += 1) {
        const segmentWeight = weights[index]
        const from = anchors[index]
        const to = anchors[index + 1]

        if (cursor <= segmentWeight || index === transitions - 1) {
            const local = segmentWeight <= 0 ? 0 : cursor / segmentWeight
            return from + (to - from) * local
        }

        cursor -= segmentWeight
    }

    return anchors[anchors.length - 1]
}

function getNearestAnchorIndex(trackXValue: number, anchors: number[]) {
    if (!anchors.length) return 0

    let nearestIndex = 0
    let nearestDistance = Math.abs(anchors[0] - trackXValue)

    for (let index = 1; index < anchors.length; index += 1) {
        const distance = Math.abs(anchors[index] - trackXValue)
        if (distance < nearestDistance) {
            nearestDistance = distance
            nearestIndex = index
        }
    }

    return nearestIndex
}

export default function PipelineSoftware() {
    const sectionRef = useRef<HTMLElement>(null)
    const stickyRef = useRef<HTMLDivElement>(null)
    const viewportRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const stageRefs = useRef<(HTMLElement | null)[]>([])
    const isInView = useInView(sectionRef, { once: true, amount: 0.08 })
    const reducedMotion = useReducedMotion()
    const effectiveReducedMotion = reducedMotion ?? false
    const [activeIndex, setActiveIndex] = useState(0)
    const [isCompactViewport, setIsCompactViewport] = useState(false)
    const [isMobileViewport, setIsMobileViewport] = useState(false)
    const [isTinyViewport, setIsTinyViewport] = useState(false)
    const stageAnchorsRef = useRef<number[]>([])
    const trackX = useMotionValue(0)

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    })

    useEffect(() => {
        if (typeof window === 'undefined') return

        const syncViewportMode = () => {
            const width = window.innerWidth
            const height = window.innerHeight
            setIsCompactViewport(width <= 1200 || height <= 820)
            setIsMobileViewport(width <= 640)
            setIsTinyViewport(width <= 380 || height <= 700)
        }

        syncViewportMode()
        window.addEventListener('resize', syncViewportMode)
        return () => window.removeEventListener('resize', syncViewportMode)
    }, [])

    const gridPaddingY = isMobileViewport
        ? 'clamp(16px,3svh,24px)'
        : isCompactViewport
            ? 'clamp(18px,3.2vh,34px)'
            : 'clamp(28px,4.2vh,48px)'
    const gridPaddingBottom = isMobileViewport
        ? 'clamp(18px,4svh,34px)'
        : 'clamp(88px,11svh,116px)'
    const viewportMinHeight = isMobileViewport
        ? '15rem'
        : isCompactViewport
            ? '18rem'
            : '24rem'

    useEffect(() => {
        const sectionElement = sectionRef.current
        if (!sectionElement) return

        if (effectiveReducedMotion) {
            stageAnchorsRef.current = []
            trackX.set(0)
            sectionElement.style.height = 'auto'
            return
        }

        const measure = () => {
            const viewportWidth = viewportRef.current?.clientWidth ?? 0
            if (!viewportWidth) return

            const anchors = stageRefs.current
                .map((stageElement) => {
                    if (!stageElement) return null
                    const centerX = stageElement.offsetLeft + stageElement.offsetWidth / 2
                    return viewportWidth / 2 - centerX
                })
                .filter((value): value is number => value !== null)

            if (!anchors.length) return

            stageAnchorsRef.current = anchors

            const travelDistance = Math.abs(anchors[anchors.length - 1] - anchors[0])
            sectionElement.style.height = `calc(100svh + ${Math.ceil(travelDistance)}px)`

            const nextTrackX = getInterpolatedTrackX(scrollYProgress.get(), anchors)
            trackX.set(nextTrackX)
        }

        const firstMeasure = requestAnimationFrame(measure)

        const resizeObserver = new ResizeObserver(measure)
        if (viewportRef.current) resizeObserver.observe(viewportRef.current)
        if (trackRef.current) resizeObserver.observe(trackRef.current)
        stageRefs.current.forEach((stageElement) => {
            if (stageElement) resizeObserver.observe(stageElement)
        })

        window.addEventListener('resize', measure)
        return () => {
            cancelAnimationFrame(firstMeasure)
            resizeObserver.disconnect()
            window.removeEventListener('resize', measure)
        }
    }, [effectiveReducedMotion, scrollYProgress, trackX])

    useMotionValueEvent(scrollYProgress, 'change', (value) => {
        if (!effectiveReducedMotion) {
            const anchors = stageAnchorsRef.current
            if (!anchors.length) return

            const nextTrackX = getInterpolatedTrackX(value, anchors)
            trackX.set(nextTrackX)
        }
    })

    useMotionValueEvent(trackX, 'change', (value) => {
        const anchors = stageAnchorsRef.current
        if (!anchors.length) return

        const nextIndex = getNearestAnchorIndex(value, anchors)
        setActiveIndex((previous) => (previous === nextIndex ? previous : nextIndex))
    })

    const renderPipelineControls = (placement: 'top' | 'bottom') => {
        const isTopPlacement = placement === 'top'

        return (
            <motion.div
                initial={{ opacity: 0, y: isTopPlacement ? 8 : 14 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: effectiveReducedMotion ? 0 : 0.55, delay: 0.2, ease }}
                className={
                    isTopPlacement
                        ? 'relative z-20 mt-4 flex items-center justify-between gap-3'
                        : 'relative z-20 mt-1 flex items-center justify-between gap-4'
                }
            >
                <div className={isMobileViewport ? 'flex items-center gap-2' : isCompactViewport ? 'flex items-center gap-2.5' : 'flex items-center gap-3'}>
                    {stages.map((stage, index) => (
                        <motion.div
                            key={stage.id}
                            className={isMobileViewport ? 'flex items-center gap-1.5' : isCompactViewport ? 'flex items-center gap-1.5' : 'flex items-center gap-2'}
                            animate={{ opacity: activeIndex === index ? 1 : 0.3 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="rounded-full"
                                animate={{
                                    width: activeIndex === index ? (isMobileViewport ? '22px' : '24px') : (isMobileViewport ? '5px' : '6px'),
                                    height: isMobileViewport ? '5px' : '6px',
                                    background: activeIndex === index
                                        ? stage.accent
                                        : 'rgba(255,255,255,0.2)',
                                    boxShadow: activeIndex === index
                                        ? `0 0 10px rgba(${stage.accentRgb},0.7)`
                                        : 'none',
                                }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            />
                            <motion.span
                                className={isMobileViewport
                                    ? 'font-mono text-[9px] uppercase tracking-[0.16em]'
                                    : 'font-mono text-[10px] uppercase tracking-[0.2em]'}
                                animate={{
                                    color: activeIndex === index
                                        ? `rgba(${stage.accentRgb},0.92)`
                                        : 'rgba(255,255,255,0.2)',
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                {activeIndex === index ? stage.title : ''}
                            </motion.span>
                        </motion.div>
                    ))}
                </div>

                <span className={isMobileViewport
                    ? 'shrink-0 text-[9px] uppercase tracking-[0.16em] text-white/34 font-mono'
                    : 'shrink-0 text-[11px] uppercase tracking-[0.24em] text-white/26 font-mono'}
                >
                    {activeIndex < stages.length - 1
                        ? 'Scroll para continuar'
                        : 'Pipeline completo'}
                </span>
            </motion.div>
        )
    }

    return (
        <section
            id="pipeline"
            ref={sectionRef}
            className="relative h-[100svh] bg-[#070b1f]"
        >
            <style>{`
                @keyframes terminal-glow {
                    0%, 100% { opacity: 0.55; }
                    50% { opacity: 1; }
                }
                @keyframes pipeline-aura-pulse {
                    0%, 100% { opacity: 0.72; transform: scale(0.98); }
                    50% { opacity: 1; transform: scale(1.03); }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(110% 76% at 84% 18%, rgba(139,92,246,0.22) 0%, rgba(8,12,34,0) 62%), radial-gradient(76% 64% at 16% 80%, rgba(56,189,248,0.16) 0%, rgba(7,10,28,0) 66%), linear-gradient(140deg, #040817 0%, #08102c 46%, #060a1b 100%)',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.14]"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(90deg, rgba(129,140,248,0.12) 0 1px, transparent 1px 56px), repeating-linear-gradient(180deg, rgba(56,189,248,0.1) 0 1px, transparent 1px 48px)',
                    maskImage: 'radial-gradient(120% 84% at 50% 52%, black 0%, black 56%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(120% 84% at 50% 52%, black 0%, black 56%, transparent 100%)',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[50%] top-[-8%] h-[38rem] w-[70rem] -translate-x-1/2 blur-[120px]"
                style={{
                    background:
                        'radial-gradient(ellipse at center, rgba(56,189,248,0.2) 0%, rgba(129,140,248,0.14) 32%, rgba(139,92,246,0.18) 52%, transparent 78%)',
                    animation: effectiveReducedMotion ? 'none' : 'pipeline-aura-pulse 6.8s ease-in-out infinite',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-[-8%] top-[34%] h-[20rem] w-[20rem] rounded-full blur-[86px]"
                style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.24) 0%, rgba(7,10,28,0) 70%)' }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-10%] top-[38%] h-[22rem] w-[22rem] rounded-full blur-[94px]"
                style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.22) 0%, rgba(7,10,28,0) 72%)' }}
            />

            <div
                ref={stickyRef}
                className="relative"
                style={{
                    position: effectiveReducedMotion ? 'relative' : 'sticky',
                    top: 0,
                    height: effectiveReducedMotion ? 'auto' : '100svh',
                }}
            >
                <div
                    className={`mx-auto grid h-full max-w-[1600px] px-[clamp(20px,5vw,80px)] ${isMobileViewport ? 'grid-rows-[auto_minmax(0,1fr)]' : 'grid-rows-[auto_minmax(0,1fr)_auto]'}`}
                    style={{
                        gap: isMobileViewport ? '12px' : isCompactViewport ? '14px' : '24px',
                        paddingTop: gridPaddingY,
                        paddingBottom: gridPaddingBottom,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: effectiveReducedMotion ? 0 : 0.65, ease }}
                        className={isMobileViewport ? 'max-w-none' : isCompactViewport ? 'max-w-[62rem]' : 'max-w-3xl'}
                    >
                        <div className={isMobileViewport
                            ? 'mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/35 bg-indigo-300/[0.14] px-3 py-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.3)]'
                            : isCompactViewport
                            ? 'mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-300/35 bg-indigo-300/[0.14] px-3.5 py-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.3)]'
                            : 'mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-300/35 bg-indigo-300/[0.14] px-4 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.3)]'}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(129,140,248,0.85)]" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-300">
                                [ El pipeline de entrega ]
                            </span>
                        </div>

                        <h2
                            className="font-black leading-[0.9] tracking-[-0.06em] text-white"
                            style={{
                                fontSize: isMobileViewport
                                    ? isTinyViewport
                                        ? 'clamp(1.9rem,9.4vw,2.3rem)'
                                        : 'clamp(2.05rem,9.4vw,2.7rem)'
                                    : isCompactViewport
                                        ? 'clamp(2.1rem,6vw,3.8rem)'
                                        : 'clamp(2.3rem,5.2vw,5rem)',
                            }}
                        >
                            Un proceso técnico
                            <br />
                            <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                                pensado para avanzar sin ruido.
                            </span>
                        </h2>

                        <p className={isMobileViewport
                            ? 'mt-4 max-w-none text-[14px] leading-7 text-white/62'
                            : isCompactViewport
                            ? 'mt-4 max-w-[48rem] text-[15px] leading-7 text-white/62 md:text-base'
                            : 'mt-6 max-w-2xl text-base leading-8 text-white/62 md:text-lg'}
                        >
                            En vez de apilar etapas verticales, mostramos el proceso como una línea de ejecución: cada bloque entra en foco cuando llega al centro y deja claro qué produce antes de pasar al siguiente.
                        </p>

                        {isMobileViewport && renderPipelineControls('top')}
                    </motion.div>

                    <div
                        ref={viewportRef}
                        className={isTinyViewport
                            ? 'relative overflow-hidden rounded-[1.5rem] border border-white/[0.12] bg-white/[0.05] backdrop-blur-xl'
                            : 'relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-white/[0.05] backdrop-blur-xl'}
                        style={{
                            height: '100%',
                            minHeight: viewportMinHeight,
                        }}
                    >
                        <div className={isMobileViewport
                            ? 'pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(90deg,rgba(7,11,31,0.88),rgba(7,11,31,0))]'
                            : 'pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-[linear-gradient(90deg,rgba(7,11,31,0.88),rgba(7,11,31,0))]'}
                        />
                        <div className={isMobileViewport
                            ? 'pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-[linear-gradient(270deg,rgba(7,11,31,0.88),rgba(7,11,31,0))]'
                            : 'pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-[linear-gradient(270deg,rgba(7,11,31,0.88),rgba(7,11,31,0))]'}
                        />
                        <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(168,85,247,0.34)_18%,rgba(34,211,238,0.56)_48%,rgba(20,184,166,0.44)_72%,rgba(52,211,153,0.36)_86%,transparent)]" />

                        <motion.div
                            ref={trackRef}
                            style={{ x: trackX }}
                            className={isMobileViewport
                                ? 'relative flex h-full w-max items-stretch gap-4 px-3.5 py-3.5'
                                : isCompactViewport
                                    ? 'relative flex h-full w-max items-stretch gap-5 px-[clamp(16px,3.4vw,46px)] py-4'
                                    : 'relative flex h-full w-max items-stretch gap-6 px-[clamp(18px,4vw,64px)] py-5 md:gap-7 md:py-6'}
                        >
                            {stages.map((stage, index) => {
                                const isActive = activeIndex === index
                                const isMuted = activeIndex !== index
                                const accent = stage.accent
                                const accentRgb = stage.accentRgb

                                return (
                                    <motion.article
                                        key={stage.id}
                                        ref={(element) => {
                                            stageRefs.current[index] = element
                                        }}
                                        animate={{
                                            opacity: effectiveReducedMotion ? 1 : isActive ? 1 : 0.46,
                                            scale: effectiveReducedMotion ? 1 : isActive ? 1 : 0.95,
                                            filter: effectiveReducedMotion ? 'blur(0px)' : isActive ? 'blur(0px)' : 'blur(0.6px)',
                                            y: effectiveReducedMotion ? 0 : isActive ? -6 : 12,
                                        }}
                                        transition={{ duration: 0.45, ease }}
                                        className={isMobileViewport
                                            ? 'relative flex h-full min-h-0 w-[min(calc(100vw-56px),22rem)] shrink-0 flex-col justify-start gap-3 overflow-hidden rounded-[1.45rem] border p-3.5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]'
                                            : isCompactViewport
                                                ? 'relative flex h-full min-h-0 w-[min(86vw,26rem)] shrink-0 flex-col justify-between overflow-hidden rounded-[1.7rem] border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]'
                                                : 'relative flex h-full min-h-0 w-[min(84vw,30rem)] shrink-0 flex-col justify-between overflow-hidden rounded-[1.9rem] border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:w-[32rem] md:p-7'}
                                        style={{
                                            borderColor: isActive
                                                ? `rgba(${accentRgb},0.54)`
                                                : `rgba(${accentRgb},0.26)`,
                                            background: isActive
                                                ? `linear-gradient(140deg, rgba(${accentRgb},0.2) 0%, rgba(10,14,36,0.82) 36%, rgba(9,13,34,0.72) 100%)`
                                                : `linear-gradient(140deg, rgba(${accentRgb},0.08) 0%, rgba(7,10,28,0.72) 45%, rgba(7,10,28,0.62) 100%)`,
                                            boxShadow: isActive
                                                ? `0 0 0 1px rgba(${accentRgb},0.22), 0 0 56px rgba(${accentRgb},0.24), 0 0 120px rgba(${accentRgb},0.08), 0 24px 80px rgba(0,0,0,0.4)`
                                                : '0 24px 80px rgba(0,0,0,0.24)',
                                        }}
                                    >
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: `linear-gradient(145deg, rgba(255,255,255,0.08), transparent 34%, transparent 72%, rgba(${accentRgb},0.14))`,
                                            }}
                                        />
                                        <motion.div
                                            className="pointer-events-none absolute inset-0"
                                            animate={{
                                                opacity: isActive ? 1 : 0,
                                                background: isActive
                                                    ? `radial-gradient(circle at 50% 30%, rgba(${accentRgb},0.22) 0%, rgba(${accentRgb},0.08) 40%, transparent 65%)`
                                                    : 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)',
                                            }}
                                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                                        />
                                        <div
                                            className="absolute inset-x-0 top-0 h-px"
                                            style={{
                                                background: `linear-gradient(90deg, transparent, rgba(${accentRgb},0.76), transparent)`,
                                                opacity: isActive ? 1 : 0.45,
                                            }}
                                        />

                                        <div className="relative z-10">
                                            <div className={isMobileViewport ? 'mb-3 flex items-start justify-between gap-2.5' : isCompactViewport ? 'mb-4 flex items-start justify-between gap-3' : 'mb-6 flex items-start justify-between gap-4'}>
                                                <div>
                                                    <div
                                                        className={isMobileViewport ? 'font-mono text-[10px] font-bold uppercase tracking-[0.24em]' : 'font-mono text-[11px] font-bold uppercase tracking-[0.28em]'}
                                                        style={{ color: isActive ? `rgba(${accentRgb},0.92)` : 'rgba(255,255,255,0.42)' }}
                                                    >
                                                        [{stage.stage}]
                                                    </div>
                                                    <h3
                                                        className="font-black leading-[0.92] tracking-[-0.05em] text-white"
                                                        style={{
                                                            marginTop: isMobileViewport ? '8px' : isCompactViewport ? '10px' : '16px',
                                                            fontSize: isMobileViewport
                                                                ? 'clamp(1.8rem,8.8vw,2.25rem)'
                                                                : isCompactViewport
                                                                    ? 'clamp(2.1rem,4.2vw,2.8rem)'
                                                                    : 'clamp(2rem,4vw,3.2rem)',
                                                        }}
                                                    >
                                                        {stage.title}
                                                    </h3>
                                                </div>

                                                <motion.div
                                                    animate={{
                                                        background: isActive
                                                            ? `rgba(${accentRgb},0.18)`
                                                            : 'rgba(255,255,255,0.03)',
                                                        borderColor: isActive
                                                            ? `rgba(${accentRgb},0.52)`
                                                            : 'rgba(255,255,255,0.08)',
                                                        boxShadow: isActive
                                                            ? `0 0 24px rgba(${accentRgb},0.36)`
                                                            : 'none',
                                                    }}
                                                    transition={{ duration: 0.4 }}
                                                    className={isMobileViewport
                                                        ? 'grid h-11 w-11 shrink-0 place-items-center rounded-[0.85rem] border'
                                                        : isCompactViewport
                                                        ? 'grid h-12 w-12 place-items-center rounded-[0.9rem] border'
                                                        : 'grid h-14 w-14 place-items-center rounded-[1rem] border'}
                                                    style={{
                                                        color: isActive ? accent : 'rgba(255,255,255,0.3)',
                                                        animation: isActive ? 'terminal-glow 2.4s ease-in-out infinite' : 'none',
                                                    }}
                                                >
                                                    {stage.iconComponent}
                                                </motion.div>
                                            </div>

                                            <div
                                                className={isMobileViewport
                                                    ? 'rounded-xl border px-3 py-2 font-mono text-[9px] uppercase leading-5 tracking-[0.16em]'
                                                    : isCompactViewport
                                                    ? 'rounded-xl border px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em]'
                                                    : 'rounded-xl border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em]'}
                                                style={{
                                                    borderColor: `rgba(${accentRgb},0.3)`,
                                                    background: `linear-gradient(90deg, rgba(${accentRgb},0.14), rgba(255,255,255,0.04))`,
                                                    color: `rgba(${accentRgb},0.96)`,
                                                }}
                                            >
                                                {stage.subtitle}
                                            </div>

                                            <p
                                                className={isMobileViewport
                                                    ? 'mt-3 max-w-[26rem] text-[12.5px] leading-[1.7] text-white/66'
                                                    : isCompactViewport
                                                    ? 'mt-3 max-w-[26rem] text-[13px] leading-6 text-white/66 md:text-sm'
                                                    : 'mt-5 max-w-[26rem] text-sm leading-7 text-white/66 md:text-[15px]'}
                                                style={isMobileViewport
                                                    ? {
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }
                                                    : isCompactViewport
                                                    ? {
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: isTinyViewport ? 3 : 4,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }
                                                    : undefined}
                                            >
                                                {stage.description}
                                            </p>
                                        </div>

                                        <div className={isMobileViewport ? 'relative z-10 mt-1' : 'relative z-10'}>
                                            <div className={isMobileViewport ? 'border-t border-white/10 pt-3' : isCompactViewport ? 'border-t border-white/10 pt-3.5' : 'border-t border-white/10 pt-5'}>
                                                <div className={isMobileViewport ? 'font-mono text-[9px] uppercase tracking-[0.18em] text-white/36' : 'font-mono text-[10px] uppercase tracking-[0.22em] text-white/36'}>
                                                    Output
                                                </div>
                                                <div
                                                    className={isMobileViewport
                                                        ? 'mt-2 text-[12.5px] font-semibold leading-snug text-white/82'
                                                        : isCompactViewport
                                                        ? 'mt-2 text-[14px] font-semibold leading-snug text-white/82 md:text-[15px]'
                                                        : 'mt-3 text-sm font-semibold leading-relaxed text-white/82 md:text-base'}
                                                    style={isMobileViewport
                                                        ? {
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }
                                                        : isCompactViewport
                                                        ? {
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: isTinyViewport ? 2 : 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }
                                                        : undefined}
                                                >
                                                    {stage.output}
                                                </div>
                                            </div>

                                            <div className={isMobileViewport ? 'mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-white/26' : isCompactViewport ? 'mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/26' : 'mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/26'}>
                                                <span>{String(index + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}</span>
                                                {!isMobileViewport && !isTinyViewport && (
                                                    <span style={{ color: isMuted ? 'rgba(255,255,255,0.24)' : `rgba(${accentRgb},0.9)` }}>
                                                        active window
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.article>
                                )
                            })}
                        </motion.div>
                    </div>

                    {!isMobileViewport && renderPipelineControls('bottom')}
                </div>
            </div>
        </section>
    )
}
