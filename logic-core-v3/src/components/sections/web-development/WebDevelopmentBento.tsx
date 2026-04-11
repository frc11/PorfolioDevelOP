"use client"

import React, { useEffect, useRef, useState } from "react"
import {
    motion,
    useInView,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
} from "framer-motion"
import { Bolt, MapPinned, MousePointerClick, Orbit, ScanSearch } from "lucide-react"
import { VideoCard } from "@/components/ui/VideoCard"

const ease = [0.16, 1, 0.3, 1] as const

const floatingIconClass = "text-white/80 drop-shadow-[0_0_24px_rgba(94,234,212,0.15)]"
const glassCardClass =
    "relative overflow-hidden rounded-[2rem] border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.38)]"

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, delay, ease },
})

const cardGlow =
    "pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_28%,transparent_70%,rgba(34,211,238,0.08))]"

const metricPills = ["UX que retiene", "Carga ultra rápida", "Conversión mobile"]
const seoPills = ["Google Maps", "Búsqueda local", "NOA"]
const motionPills = ["WhatsApp", "Formularios", "Catálogo"]

const IconOrb = ({
    icon: Icon,
    accent,
    className = "",
}: {
    icon: React.ComponentType<{ className?: string }>
    accent: string
    className?: string
}) => (
    <div
        className={`relative grid size-14 place-items-center rounded-[1.35rem] border border-white/10 bg-white/[0.03] ${className}`}
        style={{ boxShadow: `0 0 50px ${accent}` }}
    >
        <div
            className="absolute inset-2 rounded-[1rem] blur-2xl"
            style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 75%)` }}
        />
        <Icon className={`relative z-10 size-6 ${floatingIconClass}`} />
    </div>
)

const LighthouseGauge = () => {
    const prefersReduced = useReducedMotion()
    const containerRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: true, amount: 0.5 })
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!isInView) return
        if (prefersReduced) return

        const duration = 1500
        const end = 100
        let startTime: number | null = null
        let frame = 0

        const animate = (time: number) => {
            if (!startTime) startTime = time
            const progress = Math.min((time - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 4)
            setCount(Math.round(eased * end))

            if (progress < 1) {
                frame = requestAnimationFrame(animate)
            }
        }

        frame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(frame)
    }, [isInView, prefersReduced])

    const displayCount = prefersReduced && isInView ? 100 : count

    return (
        <div ref={containerRef} className="relative flex h-40 w-40 items-center justify-center">
            <div className="absolute inset-5 rounded-full bg-cyan-400/10 blur-2xl" />
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <motion.circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke="url(#bentoGauge)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.35))" }}
                    initial={{ strokeDasharray: "283", strokeDashoffset: prefersReduced ? 0 : 283 }}
                    animate={isInView ? { strokeDashoffset: 0 } : { strokeDashoffset: 283 }}
                    transition={{ duration: prefersReduced ? 0 : 1.8, ease }}
                />
                <defs>
                    <linearGradient id="bentoGauge" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#67e8f9" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-[clamp(36px,5vw,52px)] font-black leading-none text-white">{displayCount}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.32em] text-white/35">Lighthouse</div>
                </div>
            </div>
        </div>
    )
}

const ScrollCue = () => {
    const handleClick = () => {
        document.getElementById("web-development-timeline")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <div onClick={handleClick} className="group relative z-20 mt-16 flex w-full cursor-pointer flex-col items-center pb-12">
            <span className="mb-4 text-[11px] uppercase tracking-[0.36em] text-white/35">Mirá cómo lo hacemos</span>
            <div className="rounded-full border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition-transform duration-500 group-hover:translate-y-1">
                <div className="text-cyan-300/70 [animation:bounce-chevron-bento_1.5s_infinite_ease-in-out]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 15L12 21L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
            <p className="mt-6 text-center text-sm italic text-white/40">
                Una web que no convierte es decoración cara.
            </p>
        </div>
    )
}

export const WebDevelopmentBento = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const isSectionInView = useInView(sectionRef, { once: true, amount: 0.12 })
    const prefersReduced = useReducedMotion()
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const spotlight = useMotionTemplate`
        radial-gradient(380px circle at ${mouseX}px ${mouseY}px, rgba(34,211,238,0.15), rgba(167,139,250,0.09) 35%, transparent 70%)
    `

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (prefersReduced || !gridRef.current) return
        const bounds = gridRef.current.getBoundingClientRect()
        mouseX.set(event.clientX - bounds.left)
        mouseY.set(event.clientY - bounds.top)
    }

    const handlePointerLeave = () => {
        if (!gridRef.current) return
        mouseX.set(gridRef.current.clientWidth / 2)
        mouseY.set(gridRef.current.clientHeight / 2)
    }

    useEffect(() => {
        if (!gridRef.current) return
        mouseX.set(gridRef.current.clientWidth / 2)
        mouseY.set(gridRef.current.clientHeight / 2)
    }, [mouseX, mouseY])

    return (
        <section ref={sectionRef} className="relative z-10 w-full overflow-hidden bg-transparent px-4 py-24">
            <style>{`
                @keyframes bounce-chevron-bento {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(8px); }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full blur-[120px]"
                style={{ background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 72%)" }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-28 top-1/3 h-[28rem] w-[28rem] rounded-full blur-[140px]"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.11) 0%, transparent 74%)" }}
            />

            <div className="relative z-10 mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={isSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                    transition={{ duration: 0.7, ease }}
                    className="mx-auto mb-14 max-w-4xl text-center"
                >
                    <span className="mb-5 inline-flex rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-cyan-300/85 backdrop-blur-xl">
                        [ Por qué la web cambia todo ]
                    </span>
                    <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-black leading-[0.95] tracking-[-0.05em] text-white">
                        No es una página web.
                        <br />
                        <span className="bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                            Es tu vendedor más eficiente.
                        </span>
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/52 md:text-lg">
                        Diseñamos una presencia que convence en segundos, aparece en el momento correcto y convierte incluso cuando vos no estás frente al mostrador.
                    </p>
                </motion.div>

                <div
                    ref={gridRef}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={handlePointerLeave}
                    className="relative isolate"
                >
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-[-8%] z-0 hidden rounded-[3rem] opacity-100 blur-3xl lg:block"
                        style={{ background: spotlight }}
                    />

                    <div className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-[minmax(18rem,auto)_minmax(14rem,auto)]">
                        <motion.article
                            {...fadeUp(0.12)}
                            className={`${glassCardClass} min-h-[22rem] lg:col-span-7 lg:row-span-1`}
                        >
                            <div className={cardGlow} />
                            <div className="relative z-10 flex h-full flex-col md:flex-row">
                                <div className="flex flex-1 flex-col justify-between p-8 md:p-10">
                                    <div>
                                        <div className="mb-6 flex items-center gap-3">
                                            <IconOrb icon={Orbit} accent="rgba(34,211,238,0.22)" />
                                            <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">Primer impacto</span>
                                        </div>
                                        <h3 className="max-w-lg text-3xl font-black leading-[0.95] tracking-[-0.04em] text-white md:text-5xl">
                                            Confianza en
                                            <br />
                                            tres segundos.
                                        </h3>
                                        <p className="mt-5 max-w-md text-sm leading-7 text-white/55 md:text-base">
                                            La sensación de orden, velocidad y claridad define si el cliente sigue explorando o vuelve al resultado anterior.
                                        </p>
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-2">
                                        {metricPills.map((pill) => (
                                            <span
                                                key={pill}
                                                className="rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/50"
                                            >
                                                {pill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative min-h-[16rem] w-full md:w-[44%]">
                                    <div className="absolute inset-4 overflow-hidden rounded-[1.6rem] border border-white/[0.07] bg-black/20">
                                        <VideoCard />
                                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,18,0.9)_0%,rgba(4,6,18,0.2)_38%,rgba(4,6,18,0.12)_100%)]" />
                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.18),transparent_40%)]" />
                                        <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70 backdrop-blur-xl">
                                            En vivo
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.article>

                        <motion.article
                            {...fadeUp(0.2)}
                            className={`${glassCardClass} min-h-[24.5rem] lg:col-span-5 lg:row-span-1`}
                        >
                            <div className={cardGlow} />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.08),transparent_62%)]" />
                            <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 py-9 text-center">
                                <IconOrb icon={Bolt} accent="rgba(34,211,238,0.22)" className="mb-5" />
                                <LighthouseGauge />
                                <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                                    El cliente que espera, se va.
                                </h3>
                                <p className="mt-3 max-w-sm text-sm leading-7 text-white/52">
                                    La carga se siente inmediata en desktop y mobile para que la intención no se enfríe antes del primer scroll.
                                </p>
                                <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-white/35">
                                    <span>Mobile first</span>
                                    <span className="h-1 w-1 rounded-full bg-white/20" />
                                    <span>Core Web Vitals</span>
                                    <span className="h-1 w-1 rounded-full bg-white/20" />
                                    <span>Sin fricción</span>
                                </div>
                            </div>
                        </motion.article>

                        <motion.article
                            {...fadeUp(0.28)}
                            className={`${glassCardClass} min-h-[18.5rem] lg:col-span-4 lg:row-span-1`}
                        >
                            <div className={cardGlow} />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.08),transparent_58%)]" />
                            <div className="relative z-10 flex h-full flex-col justify-between p-8">
                                <div>
                                    <div className="mb-5 flex items-center gap-3">
                                        <IconOrb icon={MapPinned} accent="rgba(34,211,238,0.2)" />
                                        <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">SEO local</span>
                                    </div>
                                    <h3 className="max-w-xs text-[1.75rem] font-black leading-[1] tracking-[-0.04em] text-white">
                                        Primero en Google en tu ciudad.
                                    </h3>
                                    <p className="mt-4 max-w-sm text-sm leading-7 text-white/55">
                                        Cuando alguien busca tu rubro en Tucumán, Salta o Jujuy, la intención cae sobre tu negocio antes que sobre la competencia.
                                    </p>
                                </div>

                                <div className="mt-6 rounded-[1.4rem] border border-cyan-300/12 bg-cyan-300/[0.05] p-4">
                                    <div className="flex items-end gap-3">
                                        <span className="text-5xl font-black leading-none tracking-[-0.06em] text-cyan-200">3x</span>
                                        <div className="pb-1 text-sm leading-tight text-white/58">
                                            más consultas
                                            <br />
                                            desde búsqueda local
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {seoPills.map((pill) => (
                                            <span
                                                key={pill}
                                                className="rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/45"
                                            >
                                                {pill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.article>

                        <motion.article
                            {...fadeUp(0.36)}
                            className={`${glassCardClass} min-h-[16.75rem] lg:col-span-8 lg:row-span-1`}
                        >
                            <div className={cardGlow} />
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.12),transparent_35%,rgba(34,211,238,0.08))]" />
                            <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-10">
                                <div className="flex items-center gap-3">
                                    <IconOrb icon={MousePointerClick} accent="rgba(167,139,250,0.18)" />
                                    <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">Conversión B2B</span>
                                </div>

                                <div className="mt-8 max-w-3xl">
                                    <h3 className="text-3xl font-black leading-[0.95] tracking-[-0.05em] text-white md:text-5xl">
                                        Tu web
                                        <span className="bg-gradient-to-r from-violet-200 to-cyan-200 bg-clip-text text-transparent"> vende mientras dormís.</span>
                                    </h3>
                                    <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
                                        Formularios, WhatsApp integrado y productos listos para consultar. Todo armado para que el siguiente clic suceda sin depender de tu presencia.
                                    </p>
                                </div>

                                <div className="mt-7 flex flex-wrap items-center gap-3">
                                    {motionPills.map((pill) => (
                                        <span
                                            key={pill}
                                            className="rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/50"
                                        >
                                            {pill}
                                        </span>
                                    ))}
                                    <div className="ml-auto hidden items-center gap-3 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-cyan-200/75 md:inline-flex">
                                        <ScanSearch className={`size-4 ${floatingIconClass}`} />
                                        Venta 24/7
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    </div>
                </div>

                <ScrollCue />
            </div>
        </section>
    )
}
