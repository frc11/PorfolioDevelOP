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

const cardRevealVariants = {
    hidden: {
        opacity: 0,
        y: 42,
        scale: 0.965,
        filter: "blur(12px) brightness(1.35) saturate(1.2)",
    },
    show: (delay: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px) brightness(1) saturate(1)",
        transition: {
            duration: 0.86,
            delay,
            ease,
        },
    }),
}

const burnVeilVariants = {
    hidden: { y: "0%", opacity: 1 },
    show: (delay: number) => ({
        y: "108%",
        opacity: 0.04,
        transition: {
            duration: 1.08,
            delay: delay + 0.04,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    }),
}

const burnEdgeVariants = {
    hidden: { y: "-8%", opacity: 0 },
    show: (delay: number) => ({
        y: "114%",
        opacity: [0, 0.95, 0],
        transition: {
            duration: 1.12,
            delay: delay + 0.06,
            ease: [0.22, 1, 0.36, 1] as const,
            times: [0, 0.2, 1] as const,
        },
    }),
}

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
        <div ref={containerRef} className="relative flex h-40 w-40 items-center justify-center overflow-visible">
            <div className="pointer-events-none absolute -inset-2 rounded-full bg-cyan-400/12 blur-[34px]" />
            <svg className="h-full w-full -rotate-90 overflow-visible" viewBox="0 0 120 120">
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

const BurnRevealCard = ({
    children,
    className,
    delay,
    prefersReduced,
    centerActivateByViewport = false,
}: {
    children: React.ReactNode
    className: string
    delay: number
    prefersReduced: boolean
    centerActivateByViewport?: boolean
}) => {
    const cardRef = useRef<HTMLElement>(null)
    const isCentered = useInView(cardRef, { margin: "-45% 0px -45% 0px", amount: 0.08 })
    const centerActive = centerActivateByViewport && isCentered
    const hoverMotionClass = prefersReduced
        ? ""
        : "will-change-transform transition-transform duration-150 ease-out hover:scale-[1.022]"

    return (
        <motion.article
            ref={cardRef}
            custom={delay}
            initial={prefersReduced ? false : "hidden"}
            whileInView={prefersReduced ? undefined : "show"}
            viewport={{ once: true, amount: 0.32 }}
            variants={cardRevealVariants}
            className={`${className} group/bento-card isolate ${hoverMotionClass}`}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-[-1px] z-20 rounded-[inherit] border border-cyan-300/0 opacity-0 transition-all duration-150 ease-out group-hover/bento-card:border-cyan-300/40 group-hover/bento-card:opacity-100"
                style={{
                    boxShadow:
                        "0 0 24px rgba(34,211,238,0.26), 0 0 44px rgba(167,139,250,0.2), inset 0 0 18px rgba(34,211,238,0.16)",
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-150 ease-out group-hover/bento-card:opacity-100"
                style={{
                    background:
                        "radial-gradient(85% 60% at 0% 0%, rgba(34,211,238,0.24) 0%, transparent 52%), radial-gradient(90% 64% at 100% 0%, rgba(167,139,250,0.22) 0%, transparent 56%), radial-gradient(82% 60% at 0% 100%, rgba(34,211,238,0.2) 0%, transparent 54%), radial-gradient(90% 62% at 100% 100%, rgba(167,139,250,0.2) 0%, transparent 56%)",
                }}
            />
            {centerActive && (
                <>
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-[-1px] z-20 rounded-[inherit] border border-cyan-300/40 opacity-100"
                        style={{
                            boxShadow:
                                "0 0 24px rgba(34,211,238,0.26), 0 0 44px rgba(167,139,250,0.2), inset 0 0 18px rgba(34,211,238,0.16)",
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-100"
                        style={{
                            background:
                                "radial-gradient(85% 60% at 0% 0%, rgba(34,211,238,0.24) 0%, transparent 52%), radial-gradient(90% 64% at 100% 0%, rgba(167,139,250,0.22) 0%, transparent 56%), radial-gradient(82% 60% at 0% 100%, rgba(34,211,238,0.2) 0%, transparent 54%), radial-gradient(90% 62% at 100% 100%, rgba(167,139,250,0.2) 0%, transparent 56%)",
                        }}
                    />
                </>
            )}
            {!prefersReduced && (
                <>
                    <motion.div
                        aria-hidden="true"
                        custom={delay}
                        variants={burnVeilVariants}
                        className="pointer-events-none absolute inset-[-1px] z-30 rounded-[inherit]"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(4,7,18,0.98) 0%, rgba(4,7,18,0.94) 55%, rgba(4,7,18,0.9) 100%)",
                        }}
                    />
                    <motion.div
                        aria-hidden="true"
                        custom={delay}
                        variants={burnEdgeVariants}
                        className="pointer-events-none absolute left-[-12%] right-[-12%] top-0 z-40 h-16 rounded-full blur-[20px]"
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(255,148,87,0) 0%, rgba(255,186,124,0.72) 25%, rgba(255,129,43,0.88) 50%, rgba(255,186,124,0.72) 75%, rgba(255,148,87,0) 100%)",
                        }}
                    />
                </>
            )}
            {children}
        </motion.article>
    )
}

export const WebDevelopmentBento = () => {
    const sectionRef = useRef<HTMLElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const prefersReduced = useReducedMotion()
    const [isTabletOrMobile, setIsTabletOrMobile] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const centerHoverByViewport = !prefersReduced && isTabletOrMobile

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

    useEffect(() => {
        if (typeof window === "undefined") return

        const mediaQuery = window.matchMedia("(max-width: 1024px)")
        const syncViewport = () => setIsTabletOrMobile(mediaQuery.matches)
        syncViewport()

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", syncViewport)
            return () => mediaQuery.removeEventListener("change", syncViewport)
        }

        mediaQuery.addListener(syncViewport)
        return () => mediaQuery.removeListener(syncViewport)
    }, [])

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
                    initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.55 }}
                    transition={{ duration: prefersReduced ? 0 : 0.72, ease }}
                    className="mx-auto mb-14 max-w-4xl text-center"
                >
                    <motion.span
                        initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: prefersReduced ? 0 : 0.54, delay: 0.04, ease }}
                        className="mb-5 inline-flex rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-cyan-300/85 backdrop-blur-xl"
                    >
                        [ Por qué la web cambia todo ]
                    </motion.span>
                    <div className="relative">
                        {!prefersReduced && (
                            <motion.div
                                aria-hidden="true"
                                initial={{ opacity: 0, y: 22, scale: 0.84 }}
                                whileInView={{ opacity: [0, 1, 0.22], y: [22, 2, -4], scale: [0.84, 1.08, 1] }}
                                viewport={{ once: true, amount: 0.6 }}
                                transition={{
                                    duration: 1.05,
                                    delay: 0.08,
                                    ease: [0.16, 1, 0.3, 1] as const,
                                    times: [0, 0.4, 1],
                                }}
                                className="pointer-events-none absolute inset-x-[18%] top-[38%] h-24 rounded-full blur-[38px]"
                                style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.75) 0%, rgba(167,139,250,0.6) 45%, rgba(167,139,250,0.02) 100%)" }}
                            />
                        )}
                        <motion.h2
                            initial={
                                prefersReduced
                                    ? { opacity: 1, y: 0 }
                                    : {
                                          opacity: 0,
                                          y: 42,
                                          filter: "blur(10px) brightness(2.25)",
                                          textShadow:
                                              "0 0 60px rgba(34,211,238,0.95), 0 0 120px rgba(167,139,250,0.75)",
                                      }
                            }
                            whileInView={{
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px) brightness(1)",
                                textShadow: "0 0 20px rgba(34,211,238,0.2), 0 0 48px rgba(167,139,250,0.18)",
                            }}
                            viewport={{ once: true, amount: 0.6 }}
                            transition={{ duration: prefersReduced ? 0 : 1, delay: 0.1, ease }}
                            className="relative text-[clamp(2.25rem,5vw,4rem)] font-black leading-[0.95] tracking-[-0.05em] text-white"
                        >
                            No es una página web.
                            <br />
                            <span className="bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                                Es tu vendedor más eficiente.
                            </span>
                        </motion.h2>
                    </div>
                    <motion.p
                        initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: prefersReduced ? 0 : 0.64, delay: 0.2, ease }}
                        className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/52 md:text-lg"
                    >
                        Diseñamos una presencia que convence en segundos, aparece en el momento correcto y convierte incluso cuando vos no estás frente al mostrador.
                    </motion.p>
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

                    <div className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5 lg:grid-rows-[minmax(18rem,auto)_minmax(14rem,auto)]">
                        <BurnRevealCard
                            delay={0.08}
                            prefersReduced={prefersReduced}
                            centerActivateByViewport={centerHoverByViewport}
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
                        </BurnRevealCard>

                        <BurnRevealCard
                            delay={0.16}
                            prefersReduced={prefersReduced}
                            centerActivateByViewport={centerHoverByViewport}
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
                        </BurnRevealCard>

                        <BurnRevealCard
                            delay={0.24}
                            prefersReduced={prefersReduced}
                            centerActivateByViewport={centerHoverByViewport}
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
                        </BurnRevealCard>

                        <BurnRevealCard
                            delay={0.32}
                            prefersReduced={prefersReduced}
                            centerActivateByViewport={centerHoverByViewport}
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
                        </BurnRevealCard>
                    </div>
                </div>

                <ScrollCue />
            </div>
        </section>
    )
}

