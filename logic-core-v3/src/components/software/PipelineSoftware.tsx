'use client'

import React, { useRef, useState } from 'react'
import {
    motion,
    useInView,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'framer-motion'

type Stage = {
    id: string
    stage: string
    title: string
    subtitle: string
    description: string
    output: string
    icon: string
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
        icon: '◌',
    },
    {
        id: 'development',
        stage: 'STAGE 02',
        title: 'Desarrollo',
        subtitle: '[ backend / frontend / architecture ]',
        description:
            'Construimos el núcleo técnico con una base clara: APIs, reglas de negocio, estados y superficies listas para operación real.',
        output: 'Servicios desacoplados y flujos críticos ya productivos',
        icon: '⌘',
    },
    {
        id: 'testing',
        stage: 'STAGE 03',
        title: 'Testing',
        subtitle: '[ qa / edge cases / resilience ]',
        description:
            'Probamos comportamiento, errores y escenarios límite para que la operación no dependa de “tener suerte” en producción.',
        output: 'Cobertura de riesgos, validaciones y calidad perceptible',
        icon: '△',
    },
    {
        id: 'deploy',
        stage: 'STAGE 04',
        title: 'Deploy',
        subtitle: '[ release / observability / scale ]',
        description:
            'Lanzamos con métricas, monitoreo y visibilidad para que cada release sea controlado, trazable y sostenible.',
        output: 'Sistema online, medido y listo para iterar sin fricción',
        icon: '↗',
    },
] as const

const ease = [0.16, 1, 0.3, 1] as const

export default function PipelineSoftware() {
    const sectionRef = useRef<HTMLElement>(null)
    const stickyRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.08 })
    const reducedMotion = useReducedMotion()
    const [activeIndex, setActiveIndex] = useState(0)

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    })

    const trackX = useTransform(
        scrollYProgress,
        [0, 1],
        reducedMotion ? ['0%', '0%'] : ['0%', '-61.5%']
    )

    useMotionValueEvent(scrollYProgress, 'change', (value) => {
        const next = Math.min(stages.length - 1, Math.max(0, Math.round(value * (stages.length - 1))))
        setActiveIndex(next)
    })

    return (
        <section
            id="pipeline"
            ref={sectionRef}
            className="relative overflow-hidden bg-[#080810]"
            style={{ height: reducedMotion ? 'auto' : '420vh' }}
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
                    position: reducedMotion ? 'relative' : 'sticky',
                    top: 0,
                    height: reducedMotion ? 'auto' : '100vh',
                }}
            >
                <div className="mx-auto flex h-full max-w-[1600px] flex-col px-[clamp(20px,5vw,80px)] py-[clamp(32px,5vh,52px)]">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: reducedMotion ? 0 : 0.65, ease }}
                        className="mb-10 max-w-3xl"
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

                    <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-[linear-gradient(90deg,#080810,rgba(8,8,16,0))]" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-[linear-gradient(270deg,#080810,rgba(8,8,16,0))]" />
                        <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(34,211,238,0.34)_20%,rgba(34,211,238,0.52)_50%,rgba(34,211,238,0.34)_80%,transparent)]" />

                        <motion.div
                            style={{ x: trackX }}
                            className="relative flex h-full w-max items-center gap-8 px-[8vw] py-8"
                        >
                            {stages.map((stage, index) => {
                                const isActive = activeIndex === index
                                const isMuted = activeIndex !== index

                                return (
                                    <motion.article
                                        key={stage.id}
                                        animate={{
                                            opacity: reducedMotion ? 1 : isActive ? 1 : 0.34,
                                            scale: reducedMotion ? 1 : isActive ? 1 : 0.94,
                                            filter: reducedMotion ? 'blur(0px)' : isActive ? 'blur(0px)' : 'blur(0.6px)',
                                            y: reducedMotion ? 0 : isActive ? -6 : 12,
                                        }}
                                        transition={{ duration: 0.45, ease }}
                                        className="relative flex h-[min(70vh,34rem)] w-[min(78vw,31rem)] shrink-0 flex-col justify-between overflow-hidden rounded-[1.9rem] border border-white/10 bg-black/40 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:w-[34rem] md:p-8"
                                        style={{
                                            boxShadow: isActive
                                                ? '0 0 0 1px rgba(34,211,238,0.18), 0 0 40px rgba(34,211,238,0.16), 0 24px 80px rgba(0,0,0,0.4)'
                                                : '0 24px 80px rgba(0,0,0,0.24)',
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),transparent_34%,transparent_72%,rgba(34,211,238,0.05))]" />
                                        <div
                                            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                                            style={{
                                                opacity: isActive ? 1 : 0,
                                                background: 'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.12) 0%, transparent 62%)',
                                            }}
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

                                                <div
                                                    className="grid h-14 w-14 place-items-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-2xl text-cyan-200"
                                                    style={{
                                                        animation: isActive ? 'terminal-glow 2.4s ease-in-out infinite' : 'none',
                                                    }}
                                                >
                                                    {stage.icon}
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200/78">
                                                {stage.subtitle}
                                            </div>

                                            <p className="mt-6 max-w-[26rem] text-sm leading-8 text-white/56 md:text-[15px]">
                                                {stage.description}
                                            </p>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="border-t border-white/10 pt-5">
                                                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/28">
                                                    Output
                                                </div>
                                                <div className="mt-3 text-base font-semibold leading-relaxed text-white/82">
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
                        transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.2, ease }}
                        className="mt-8 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.24em] text-white/26"
                    >
                        <span>Scroll para recorrer el pipeline</span>
                        <span>{stages[activeIndex].stage} en foco</span>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
