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
    const [mounted, setMounted] = useState(false)
    const isInView = useInView(sectionRef, { once: true, amount: 0.08 })
    const reducedMotion = useReducedMotion()

    useEffect(() => {
        setMounted(true)
    }, [])

    const effectiveReducedMotion = mounted ? (reducedMotion ?? false) : false
    const [activeIndex, setActiveIndex] = useState(0)
    const stageAnchorsRef = useRef<number[]>([])
    const trackX = useMotionValue(0)

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    })

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

    return (
        <section
            id="pipeline"
            ref={sectionRef}
            className="relative h-[100svh] bg-[#080810]"
        >
            <style>{`
                @keyframes terminal-glow {
                    0%, 100% { opacity: 0.55; }
                    50% { opacity: 1; }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[64rem] -translate-x-1/2 blur-[120px]"
                style={{ background: 'radial-gradient(ellipse at center top, rgba(99,102,241,0.08) 0%, rgba(123,47,255,0.08) 38%, transparent 72%)' }}
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
                <div className="mx-auto grid h-full max-w-[1600px] grid-rows-[auto_minmax(0,1fr)_auto] gap-6 px-[clamp(20px,5vw,80px)] py-[clamp(28px,4.2vh,48px)]">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: effectiveReducedMotion ? 0 : 0.65, ease }}
                        className="max-w-3xl"
                    >
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.06] px-4 py-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(129,140,248,0.85)]" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-300">
                                [ El pipeline de entrega ]
                            </span>
                        </div>

                        <h2 className="text-[clamp(2.3rem,5.2vw,5rem)] font-black leading-[0.9] tracking-[-0.06em] text-white">
                            Un proceso técnico
                            <br />
                            <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                                pensado para avanzar sin ruido.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-white/44 md:text-lg">
                            En vez de apilar etapas verticales, mostramos el proceso como una línea de ejecución: cada bloque entra en foco cuando llega al centro y deja claro qué produce antes de pasar al siguiente.
                        </p>
                    </motion.div>

                    <div
                        ref={viewportRef}
                        className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl"
                    >
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-[linear-gradient(90deg,#080810,rgba(8,8,16,0))]" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-[linear-gradient(270deg,#080810,rgba(8,8,16,0))]" />
                        <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(34,211,238,0.34)_20%,rgba(34,211,238,0.52)_50%,rgba(34,211,238,0.34)_80%,transparent)]" />

                        <motion.div
                            ref={trackRef}
                            style={{ x: trackX }}
                            className="relative flex h-full w-max items-stretch gap-6 px-[clamp(18px,4vw,64px)] py-5 md:gap-7 md:py-6"
                        >
                            {stages.map((stage, index) => {
                                const isActive = activeIndex === index
                                const isMuted = activeIndex !== index

                                return (
                                    <motion.article
                                        key={stage.id}
                                        ref={(element) => {
                                            stageRefs.current[index] = element
                                        }}
                                        animate={{
                                            opacity: effectiveReducedMotion ? 1 : isActive ? 1 : 0.34,
                                            scale: effectiveReducedMotion ? 1 : isActive ? 1 : 0.94,
                                            filter: effectiveReducedMotion ? 'blur(0px)' : isActive ? 'blur(0px)' : 'blur(0.6px)',
                                            y: effectiveReducedMotion ? 0 : isActive ? -6 : 12,
                                        }}
                                        transition={{ duration: 0.45, ease }}
                                        className="relative flex h-full min-h-0 w-[min(84vw,30rem)] shrink-0 flex-col justify-between overflow-hidden rounded-[1.9rem] border border-white/10 bg-black/40 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:w-[32rem] md:p-7"
                                        style={{
                                            boxShadow: isActive
                                                ? '0 0 0 1px rgba(34,211,238,0.22), 0 0 60px rgba(34,211,238,0.18), 0 0 120px rgba(99,102,241,0.08), 0 24px 80px rgba(0,0,0,0.4)'
                                                : '0 24px 80px rgba(0,0,0,0.24)',
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),transparent_34%,transparent_72%,rgba(34,211,238,0.05))]" />
                                        <motion.div
                                            className="pointer-events-none absolute inset-0"
                                            animate={{
                                                opacity: isActive ? 1 : 0,
                                                background: isActive
                                                    ? 'radial-gradient(circle at 50% 30%, rgba(34,211,238,0.15) 0%, rgba(99,102,241,0.06) 40%, transparent 65%)'
                                                    : 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)',
                                            }}
                                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                                        />
                                        <div
                                            className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.24),transparent)]"
                                            style={{ opacity: isActive ? 1 : 0.35 }}
                                        />

                                        <div className="relative z-10">
                                            <div className="mb-6 flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-white/42">
                                                        [{stage.stage}]
                                                    </div>
                                                    <h3 className="mt-4 text-[clamp(2rem,4vw,3.2rem)] font-black leading-[0.92] tracking-[-0.05em] text-white">
                                                        {stage.title}
                                                    </h3>
                                                </div>

                                                <motion.div
                                                    animate={{
                                                        background: isActive
                                                            ? 'rgba(34,211,238,0.12)'
                                                            : 'rgba(255,255,255,0.03)',
                                                        borderColor: isActive
                                                            ? 'rgba(34,211,238,0.3)'
                                                            : 'rgba(255,255,255,0.08)',
                                                        boxShadow: isActive
                                                            ? '0 0 20px rgba(34,211,238,0.2)'
                                                            : 'none',
                                                    }}
                                                    transition={{ duration: 0.4 }}
                                                    className="grid h-14 w-14 place-items-center rounded-[1rem] border"
                                                    style={{
                                                        color: isActive ? '#22d3ee' : 'rgba(255,255,255,0.3)',
                                                        animation: isActive ? 'terminal-glow 2.4s ease-in-out infinite' : 'none',
                                                    }}
                                                >
                                                    {stage.iconComponent}
                                                </motion.div>
                                            </div>

                                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200/78">
                                                {stage.subtitle}
                                            </div>

                                            <p className="mt-5 max-w-[26rem] text-sm leading-7 text-white/56 md:text-[15px]">
                                                {stage.description}
                                            </p>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="border-t border-white/10 pt-5">
                                                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">
                                                    Output
                                                </div>
                                                <div className="mt-3 text-sm font-semibold leading-relaxed text-white/82 md:text-base">
                                                    {stage.output}
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/26">
                                                <span>{String(index + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}</span>
                                                <span className={isMuted ? 'text-white/18' : 'text-cyan-200/70'}>active window</span>
                                            </div>
                                        </div>
                                    </motion.article>
                                )
                            })}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: effectiveReducedMotion ? 0 : 0.55, delay: 0.2, ease }}
                        className="mt-2 flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            {stages.map((stage, index) => (
                                <motion.div
                                    key={stage.id}
                                    className="flex items-center gap-2"
                                    animate={{ opacity: activeIndex === index ? 1 : 0.3 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        className="rounded-full"
                                        animate={{
                                            width: activeIndex === index ? '24px' : '6px',
                                            height: '6px',
                                            background: activeIndex === index
                                                ? '#22d3ee'
                                                : 'rgba(255,255,255,0.2)',
                                            boxShadow: activeIndex === index
                                                ? '0 0 8px rgba(34,211,238,0.6)'
                                                : 'none',
                                        }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                    <motion.span
                                        className="font-mono text-[10px] uppercase tracking-[0.2em]"
                                        animate={{
                                            color: activeIndex === index
                                                ? 'rgba(34,211,238,0.8)'
                                                : 'rgba(255,255,255,0.2)',
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {activeIndex === index ? stage.title : ''}
                                    </motion.span>
                                </motion.div>
                            ))}
                        </div>

                        <span className="text-[11px] uppercase tracking-[0.24em] text-white/26 font-mono">
                            {activeIndex < stages.length - 1
                                ? 'Scroll para continuar'
                                : 'Pipeline completo'}
                        </span>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
