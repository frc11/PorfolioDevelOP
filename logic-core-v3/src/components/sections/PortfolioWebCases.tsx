'use client'

import React, { useRef, useState } from 'react'
import {
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion'

const cases = [
    {
        client: 'Concesionaria Torres',
        industry: 'Automotriz',
        location: 'Tucumán, NOA',
        description:
            'Rediseño completo del sitio y sistema de consultas online. Antes recibían consultas solo por teléfono. Ahora el 60% de las consultas entran por el formulario web, fuera del horario comercial.',
        metrics: [
            { label: 'Consultas online', value: '+60%' },
            { label: 'Tiempo de respuesta', value: '−45 min' },
            { label: 'Leads calificados/mes', value: '+38' },
        ],
        tech: ['Next.js', 'Tailwind', 'WhatsApp API'],
        accentColor: '#00e5ff',
        accentRgb: '0,229,255',
        icon: '🚗',
        timeline: '4 semanas',
        visualTitle: 'Lead flow',
        visualStats: ['Stock vivo', 'Formularios activos', 'Mobile first'],
    },
    {
        client: 'Clínica Dental Ríos',
        industry: 'Salud',
        location: 'Salta',
        description:
            'Web con sistema de turnos online integrado. Los pacientes reservan su turno en 2 minutos sin llamar. El equipo dejó de atender el teléfono para confirmar turnos y ahora se dedica 100% a los pacientes.',
        metrics: [
            { label: 'Turnos online', value: '+70%' },
            { label: 'Llamadas entrantes', value: '−80%' },
            { label: 'Pacientes nuevos/mes', value: '+22' },
        ],
        tech: ['Next.js', 'Google Calendar API', 'SEO Local'],
        accentColor: '#7b2fff',
        accentRgb: '123,47,255',
        icon: '🦷',
        timeline: '5 semanas',
        visualTitle: 'Turnos online',
        visualStats: ['Agenda 24/7', 'Confianza visual', 'SEO local'],
    },
    {
        client: 'Distribuidora NOA Mayorista',
        industry: 'Distribución',
        location: 'Jujuy',
        description:
            'Catálogo digital con pedidos online para clientes mayoristas. Antes, los vendedores tomaban pedidos por WhatsApp y los cargaban manualmente. Ahora el cliente lo hace solo y el vendedor solo confirma.',
        metrics: [
            { label: 'Pedidos digitales', value: '+55%' },
            { label: 'Tiempo por pedido', value: '30 min → 3 min' },
            { label: 'Errores de carga', value: '−95%' },
        ],
        tech: ['Next.js', 'TypeScript', 'Catálogo dinámico'],
        accentColor: '#00e5ff',
        accentRgb: '0,229,255',
        icon: '📦',
        timeline: '6 semanas',
        visualTitle: 'Pedidos ágiles',
        visualStats: ['B2B ready', 'Catálogo fluido', 'Menos errores'],
    },
]

const ease = [0.16, 1, 0.3, 1] as const

function CaseVisual({
    item,
    isHovered,
}: {
    item: (typeof cases)[number]
    isHovered: boolean
}) {
    const visualRef = useRef<HTMLDivElement>(null)
    const prefersReduced = useReducedMotion()
    const { scrollYProgress } = useScroll({
        target: visualRef,
        offset: ['start end', 'end start'],
    })
    const y = useTransform(scrollYProgress, [0, 1], prefersReduced ? ['0%', '0%'] : ['-8%', '8%'])

    return (
        <div ref={visualRef} className="relative h-[20rem] overflow-hidden rounded-[1.8rem] border border-white/[0.05] bg-[#050816] md:h-[24rem]">
            <motion.div
                style={{ y }}
                animate={isHovered && !prefersReduced ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="absolute inset-[-8%]"
            >
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(145deg, rgba(${item.accentRgb},0.34) 0%, rgba(8,12,28,0.18) 34%, rgba(8,12,28,0.82) 72%, rgba(${item.accentRgb},0.18) 100%)`,
                    }}
                />
                <div
                    className="absolute left-[12%] top-[14%] h-40 w-40 rounded-full blur-3xl"
                    style={{ background: `radial-gradient(circle, rgba(${item.accentRgb},0.4) 0%, transparent 72%)` }}
                />
                <div
                    className="absolute bottom-[12%] right-[10%] h-48 w-48 rounded-full blur-3xl"
                    style={{ background: `radial-gradient(circle, rgba(${item.accentRgb},0.22) 0%, transparent 72%)` }}
                />

                <div className="absolute inset-0 p-5 md:p-7">
                    <div className="h-full rounded-[1.6rem] border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-xl">
                        <div className="mb-4 flex items-center gap-2">
                            {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
                                <div key={color} className="h-2.5 w-2.5 rounded-full" style={{ background: color, opacity: 0.85 }} />
                            ))}
                            <div className="ml-auto rounded-full border border-white/[0.06] bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/30">
                                {item.visualTitle}
                            </div>
                        </div>

                        <div className="grid h-[calc(100%-1.75rem)] gap-3 md:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-[1.25rem] border border-white/[0.05] bg-black/20 p-4">
                                <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">{item.industry}</div>
                                <div className="mt-3 text-4xl">{item.icon}</div>
                                <div className="mt-4 max-w-[12rem] text-2xl font-black leading-none tracking-[-0.04em] text-white">
                                    {item.client}
                                </div>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {item.visualStats.map((stat) => (
                                        <span
                                            key={stat}
                                            className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/45"
                                        >
                                            {stat}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {item.metrics.map((metric, index) => (
                                    <div
                                        key={metric.label}
                                        className="rounded-[1.1rem] border border-white/[0.05] bg-white/[0.03] p-4"
                                        style={{
                                            transform: `translateY(${index * 10}px)`,
                                        }}
                                    >
                                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/30">{metric.label}</div>
                                        <div
                                            className="mt-2 text-2xl font-black leading-none tracking-[-0.04em]"
                                            style={{ color: item.accentColor }}
                                        >
                                            {metric.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                animate={isHovered ? { opacity: 0.26 } : { opacity: 0.48 }}
                transition={{ duration: 0.7, ease }}
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12)_0%,rgba(2,6,23,0.3)_38%,rgba(2,6,23,0.72)_100%)]"
            />
        </div>
    )
}

function CaseCard({
    item,
    index,
    reducedMotion,
    onHoverStart,
    onHoverEnd,
}: {
    item: (typeof cases)[number]
    index: number
    reducedMotion: boolean | null
    onHoverStart: () => void
    onHoverEnd: () => void
}) {
    const [isHovered, setIsHovered] = useState(false)

    const handleStart = () => {
        setIsHovered(true)
        onHoverStart()
    }

    const handleEnd = () => {
        setIsHovered(false)
        onHoverEnd()
    }

    return (
        <motion.article
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: reducedMotion ? 0 : 0.72, delay: 0.08 + index * 0.12, ease }}
            onHoverStart={handleStart}
            onHoverEnd={handleEnd}
            onPointerEnter={handleStart}
            onPointerLeave={handleEnd}
            className="group relative overflow-hidden rounded-[2rem] border border-white/[0.05] bg-white/[0.02] p-4 backdrop-blur-xl"
            style={{
                boxShadow: `0 24px 80px rgba(0,0,0,0.34), 0 0 0 1px rgba(${item.accentRgb},0.05)`,
                cursor: 'none',
            }}
        >
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.34),transparent)]" />

            <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:gap-8">
                <div className="relative overflow-hidden rounded-[1.85rem]">
                    <CaseVisual item={item} isHovered={isHovered} />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-6 md:p-7">
                        <div className="overflow-hidden">
                            <motion.h3
                                animate={isHovered && !reducedMotion ? { y: 0 } : { y: 10 }}
                                transition={{ duration: 0.55, ease }}
                                className="text-[clamp(1.9rem,4vw,3rem)] font-black leading-[0.94] tracking-[-0.05em] text-white"
                            >
                                {item.client}
                            </motion.h3>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/50">
                            <span>{item.industry}</span>
                            <span className="h-1 w-1 rounded-full bg-white/20" />
                            <span>{item.location}</span>
                            <span className="h-1 w-1 rounded-full bg-white/20" />
                            <span style={{ color: item.accentColor }}>{item.timeline}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-between p-3 md:p-4">
                    <div>
                        <div
                            className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.22em]"
                            style={{
                                borderColor: `rgba(${item.accentRgb},0.2)`,
                                background: `rgba(${item.accentRgb},0.08)`,
                                color: item.accentColor,
                            }}
                        >
                            <span>{item.icon}</span>
                            Caso real
                        </div>

                        <p className="max-w-xl text-sm leading-7 text-white/52 md:text-base">
                            {item.description}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {item.tech.map((tech) => (
                                <span
                                    key={tech}
                                    className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/42"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 grid gap-3">
                        {item.metrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="flex items-center justify-between rounded-[1.3rem] border border-white/[0.05] bg-white/[0.03] px-4 py-4"
                            >
                                <div className="text-sm text-white/42">{metric.label}</div>
                                <div className="text-right text-xl font-black tracking-[-0.04em]" style={{ color: item.accentColor }}>
                                    {metric.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.article>
    )
}

export default function PortfolioWebCases() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
    const reducedMotion = useReducedMotion()
    const [cursorVisible, setCursorVisible] = useState(false)
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)
    const springX = useSpring(cursorX, { stiffness: 320, damping: 28, mass: 0.3 })
    const springY = useSpring(cursorY, { stiffness: 320, damping: 28, mass: 0.3 })

    const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
        const bounds = sectionRef.current?.getBoundingClientRect()
        if (!bounds) return
        cursorX.set(event.clientX - bounds.left)
        cursorY.set(event.clientY - bounds.top)
    }

    return (
        <section
            ref={sectionRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setCursorVisible(false)}
            className="relative w-full overflow-hidden bg-[#030014] px-6 py-20 md:px-12 md:py-32"
            style={{ cursor: 'none' }}
        >
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 z-0 h-[32rem] w-[58rem] -translate-x-1/2"
                style={{
                    background: 'radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, rgba(123,47,255,0.04) 48%, transparent 72%)',
                    filter: 'blur(90px)',
                }}
            />

            {!reducedMotion && (
                <motion.div
                    aria-hidden="true"
                    animate={{ opacity: cursorVisible ? 1 : 0, scale: cursorVisible ? 1 : 0.72 }}
                    transition={{ duration: 0.22, ease }}
                    className="pointer-events-none absolute left-0 top-0 z-30 hidden md:block"
                    style={{ x: springX, y: springY }}
                >
                    <div className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.08] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-xl shadow-[0_0_30px_rgba(0,229,255,0.12)]">
                        Ver Proyecto
                    </div>
                </motion.div>
            )}

            <div className="relative z-10 mx-auto max-w-6xl">
                <motion.div
                    initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease }}
                    className="mb-14 text-center"
                >
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-cyan-400">
                            [ Casos de éxito ]
                        </span>
                    </div>
                    <h2 className="text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">
                        Resultados que se miden.
                    </h2>
                    <p className="mx-auto mt-4 max-w-lg text-base text-white/40">
                        Cada número es real. Son negocios del NOA que ya tienen su sucursal digital activa.
                    </p>
                </motion.div>

                <div className="flex flex-col gap-8">
                    {cases.map((item, index) => (
                        <CaseCard
                            key={item.client}
                            item={item}
                            index={index}
                            reducedMotion={reducedMotion}
                            onHoverStart={() => setCursorVisible(true)}
                            onHoverEnd={() => setCursorVisible(false)}
                        />
                    ))}
                </div>

                <motion.p
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.45 }}
                    className="mt-12 text-center text-sm text-white/25"
                >
                    ¿Tu negocio podría ser el próximo caso?{' '}
                    <span
                        className="cursor-none text-cyan-400/60 transition-colors hover:text-cyan-400"
                        onClick={() => document.getElementById('vault-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Conversemos →
                    </span>
                </motion.p>
            </div>
        </section>
    )
}
