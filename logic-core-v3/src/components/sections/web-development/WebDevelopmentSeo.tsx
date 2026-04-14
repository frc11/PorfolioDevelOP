"use client"

import React, { useEffect, useState } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { ArrowUpRight, Check, Map, Search, Sparkles } from "lucide-react"

interface Query {
    text: string
    rubro: string
}

const queries: Query[] = [
    { text: "Corralón en Yerba Buena", rubro: "Corralón" },
    { text: "Estética en Barrio Norte Tucumán", rubro: "Estética" },
    { text: "Clínica odontológica en Salta", rubro: "Clínica" },
    { text: "Distribuidora de alimentos Tucumán", rubro: "Distribuidora" },
    { text: "Restaurante en San Miguel Tucumán", rubro: "Restaurante" },
]

const checks = [
    "Google te encuentra primero con estructura optimizada.",
    "Tu negocio aparece en mapa, ficha y búsqueda local.",
    "La velocidad acompaña el ranking y la conversión.",
]

const seoTitleStatic = "Si no estas en Google,"
const seoTitleDynamicPhrases = [
    "no existis.",
    "perdes plata.",
    "perdes el tiempo.",
    "vas atras.",
]
const seoLongestDynamicPhrase = seoTitleDynamicPhrases.reduce((longest, phrase) =>
    phrase.length > longest.length ? phrase : longest
)
const ease = [0.16, 1, 0.3, 1] as const
const floatingIconClass =
    "animate-[float_3s_ease-in-out_infinite] text-white/80 drop-shadow-[0_0_24px_rgba(94,234,212,0.15)]"
const centerHoverBand = "-45% 0px -45% 0px"

type CenterHoverMotionState = {
    scale: number
    x: number
    y: number
    boxShadow: string
    backgroundColor: string
    borderColor: string
}

function CenterHoverCard({
    centerMode,
    className,
    base,
    hover,
    children,
}: {
    centerMode: boolean
    className: string
    base: CenterHoverMotionState
    hover: CenterHoverMotionState
    children: React.ReactNode
}) {
    const cardRef = React.useRef<HTMLDivElement>(null)
    const isInCenterBand = useInView(cardRef, {
        amount: 0,
        margin: centerHoverBand,
    })
    const centerActiveState: CenterHoverMotionState = centerMode
        ? { ...hover, scale: 1, x: 0, y: 0 }
        : hover

    return (
        <motion.div
            ref={cardRef}
            animate={centerMode && isInCenterBand ? centerActiveState : base}
            whileHover={centerMode ? {} : hover}
            transition={{ duration: 0.11, ease: "linear" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

function GoogleSimulator({ centerMode }: { centerMode: boolean }) {
    const [currentQuery, setCurrentQuery] = useState("")
    const [activeRubro, setActiveRubro] = useState(0)
    const [showResults, setShowResults] = useState(false)
    const [isClearingResults, setIsClearingResults] = useState(false)
    const [typing, setTyping] = useState(false)
    const [searchPressed, setSearchPressed] = useState(false)
    const [searchClickPulse, setSearchClickPulse] = useState(0)
    const prefersReduced = useReducedMotion()

    useEffect(() => {
        const timers: number[] = []
        let cancelled = false

        const sleep = (ms: number) =>
            new Promise<void>((resolve) => {
                const id = window.setTimeout(resolve, ms)
                timers.push(id)
            })

        const typeForward = async (text: string) => {
            for (let i = 1; i <= text.length; i += 1) {
                if (cancelled) return false
                setCurrentQuery(text.slice(0, i))
                await sleep(55)
            }
            return !cancelled
        }

        const eraseBackward = async (text: string) => {
            for (let i = text.length - 1; i >= 0; i -= 1) {
                if (cancelled) return false
                setCurrentQuery(text.slice(0, i))
                await sleep(22)
            }
            return !cancelled
        }

        if (prefersReduced) {
            const timer = window.setTimeout(() => {
                setActiveRubro((prev) => (prev + 1) % queries.length)
            }, 4000)
            return () => window.clearTimeout(timer)
        }

        const runSequence = async () => {
            const query = queries[activeRubro]
            setShowResults(false)
            setIsClearingResults(false)
            setSearchPressed(false)
            setCurrentQuery("")
            setTyping(true)

            const typed = await typeForward(query.text)
            if (!typed || cancelled) return

            setTyping(false)
            setSearchPressed(true)
            setSearchClickPulse((prev) => prev + 1)
            await sleep(120)
            if (cancelled) return
            setSearchPressed(false)
            await sleep(160)
            if (cancelled) return

            setShowResults(true)
            await sleep(2850)
            if (cancelled) return

            setIsClearingResults(true)
            await sleep(460)
            if (cancelled) return

            setShowResults(false)
            setIsClearingResults(false)
            const erased = await eraseBackward(query.text)
            if (!erased || cancelled) return
            await sleep(110)
            if (cancelled) return

            setActiveRubro((prev) => (prev + 1) % queries.length)
        }

        runSequence()

        return () => {
            cancelled = true
            timers.forEach((id) => window.clearTimeout(id))
        }
    }, [activeRubro, prefersReduced])

    const displayQuery = prefersReduced ? queries[activeRubro].text : currentQuery
    const displayResults = prefersReduced || showResults || isClearingResults
    const showCursor = !prefersReduced && typing
    const buttonPressed = !prefersReduced && searchPressed

    return (
        <div className="mx-auto w-full min-w-0 max-w-[860px] overflow-hidden lg:max-w-[760px] xl:max-w-[790px]">
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-200/[0.09] bg-white/[0.025] p-4 backdrop-blur-xl shadow-[0_24px_90px_rgba(0,0,0,0.48),0_0_72px_rgba(34,211,238,0.08)] md:p-5 lg:p-4 xl:p-5">
                <div className="pointer-events-none absolute -left-[8%] -top-[16%] h-56 w-56 rounded-full blur-[68px]" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.22) 0%, transparent 72%)" }} />
                <div className="pointer-events-none absolute -right-[10%] bottom-[-14%] h-64 w-64 rounded-full blur-[76px]" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 74%)" }} />

                <div className="relative overflow-hidden rounded-[1.7rem] border border-cyan-200/[0.08] bg-[#050816]/82 p-4 md:p-5 lg:p-4 xl:p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="grid size-11 place-items-center rounded-[1rem] border border-cyan-200/[0.15] bg-white/[0.04] shadow-[0_0_26px_rgba(34,211,238,0.1)]">
                                <Search className={`size-5 text-cyan-200 ${floatingIconClass}`} />
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.32em] text-white/35">Búsqueda activa</div>
                                <div className="mt-1 text-sm text-white/75">Así se ve una intención real de compra</div>
                            </div>
                        </div>
                        <div className="hidden rounded-full border border-cyan-200/[0.12] bg-cyan-300/[0.08] px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-cyan-200/80 shadow-[0_0_22px_rgba(34,211,238,0.1)] md:inline-flex">
                            SEO local en movimiento
                        </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/[0.05] bg-white/[0.03] px-4 py-4 md:px-5">
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2.5 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-3 sm:rounded-full sm:px-4">
                            <Search className="size-4 shrink-0 text-white/40" />
                            <div className="min-h-[42px] min-w-0 overflow-hidden pt-0.5 text-sm text-white/80 sm:min-h-[22px] sm:pt-0 md:text-[15px]">
                                <span className="block min-w-0">
                                    <span className="block min-w-0 max-h-[2.5em] overflow-hidden break-words leading-[1.25] sm:hidden">
                                        {displayQuery || "\u00A0"}
                                        {showCursor && (
                                            <span className="ml-1 inline-block h-[1em] w-[2px] align-[-0.08em] [animation:cursorBlink_0.7s_ease-in-out_infinite] bg-cyan-300" />
                                        )}
                                    </span>
                                    <span className="hidden min-w-0 items-center align-middle sm:inline-flex">
                                        <span className="min-w-0 truncate leading-normal">
                                            {displayQuery || "\u00A0"}
                                        </span>
                                        {showCursor && (
                                            <span className="ml-1 inline-block h-[18px] w-[2px] shrink-0 align-middle [animation:cursorBlink_0.7s_ease-in-out_infinite] bg-cyan-300" />
                                        )}
                                    </span>
                                </span>
                            </div>
                            <motion.button
                                type="button"
                                tabIndex={-1}
                                aria-hidden="true"
                                animate={
                                    buttonPressed
                                        ? { scale: [1, 0.88, 1.04, 1], boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 0 rgba(34,211,238,0.24)", "0 0 22px rgba(34,211,238,0.34)", "0 0 0 rgba(34,211,238,0)"] }
                                        : { scale: 1, boxShadow: "0 0 0 rgba(34,211,238,0)" }
                                }
                                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], times: [0, 0.34, 0.72, 1] }}
                                className="relative col-span-2 w-[116px] justify-self-end overflow-hidden rounded-full border border-cyan-300/30 bg-cyan-300/14 px-0 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/90 shadow-[0_0_18px_rgba(34,211,238,0.14)] sm:col-span-1 sm:w-auto sm:shrink-0 sm:px-3 sm:text-[11px] sm:tracking-[0.24em]"
                            >
                                <span className="relative z-10">Buscar</span>
                                {searchClickPulse > 0 && (
                                    <>
                                        <motion.span
                                            key={`ripple-${searchClickPulse}`}
                                            initial={{ scale: 0.24, opacity: 0.72 }}
                                            animate={{ scale: 2.1, opacity: 0 }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                            className="pointer-events-none absolute inset-0 rounded-full border border-cyan-100/70"
                                        />
                                        <motion.span
                                            key={`drop-${searchClickPulse}`}
                                            initial={{ y: "-68%", scale: 0.58, opacity: 0 }}
                                            animate={{ y: ["-68%", "8%", "40%"], scale: [0.58, 1.08, 0.82], opacity: [0, 0.96, 0] }}
                                            transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
                                            className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_14px_rgba(165,243,252,0.95)]"
                                        />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[1.6fr_0.8fr]">
                        <motion.div
                            initial={false}
                            animate={
                                displayResults
                                    ? isClearingResults
                                        ? { opacity: 0, y: -6, scale: 0.985, filter: "blur(14px)" }
                                        : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                                    : { opacity: 0, y: -6, scale: 0.985, filter: "blur(14px)" }
                            }
                            transition={{ duration: isClearingResults ? 0.44 : 0.38, ease }}
                            style={{ visibility: displayResults ? "visible" : "hidden" }}
                            aria-hidden={!displayResults}
                            className="space-y-3"
                        >
                            <div className="relative overflow-hidden rounded-[1.6rem] border border-cyan-300/24 bg-[linear-gradient(145deg,rgba(34,211,238,0.14),rgba(255,255,255,0.04)_38%,rgba(167,139,250,0.1))] p-4 md:p-5 shadow-[0_0_56px_rgba(34,211,238,0.14)]">
                                <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.9),rgba(196,181,253,0.8),transparent)]" />
                                <div className="pointer-events-none absolute -left-[16%] top-[12%] h-36 w-36 rounded-full blur-[44px]" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.28) 0%, transparent 74%)" }} />
                                <div className="mb-3 flex items-center gap-2 pr-[7.4rem] max-[424px]:flex-wrap max-[424px]:pr-0 min-[376px]:pr-[7.8rem] sm:pr-0">
                                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                                        #1
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-[11px] uppercase tracking-[0.2em] text-white/35">
                                        {queries[activeRubro].rubro.toLowerCase()}.com.ar
                                    </span>
                                    <span className="hidden rounded-full border border-cyan-300/20 bg-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-100 backdrop-blur-xl max-[375px]:inline-flex">
                                        Tu empresa
                                    </span>
                                </div>
                                <div className="pr-20 text-lg font-bold leading-tight text-cyan-100 max-[375px]:pr-0">
                                    {queries[activeRubro].rubro} - Tu Empresa | DevelOP
                                </div>
                                <p className="mt-3 max-w-xl text-sm leading-[1.55] text-white/55">
                                    El mejor {queries[activeRubro].rubro.toLowerCase()} en tu zona. Consultá precios, pedí presupuesto online y aparecé con autoridad desde el primer resultado.
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/35">
                                    <Map className={`size-4 text-cyan-200 ${floatingIconClass}`} />
                                    Ficha local optimizada
                                </div>
                                <div className="absolute right-3 top-4 max-w-[6.2rem] rounded-full border border-cyan-300/20 bg-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-100 backdrop-blur-xl max-[375px]:hidden min-[376px]:right-4 min-[376px]:max-w-none min-[376px]:px-3 min-[376px]:py-1.5 min-[376px]:text-[10px] min-[376px]:tracking-[0.24em]">
                                    <span className="block truncate">Tu empresa</span>
                                </div>
                            </div>

                            {["Negocios similares en tu zona", "Más resultados relevantes"].map((text, index) => (
                                <div
                                    key={text}
                                    className="rounded-[1.35rem] border border-white/[0.05] bg-white/[0.02] p-3.5 shadow-[0_0_24px_rgba(255,255,255,0.03)]"
                                    style={{ opacity: 0.46 - index * 0.12 }}
                                >
                                    <div className="mb-2 h-3 rounded-full bg-white/[0.13]" style={{ width: `${74 - index * 14}%` }} />
                                    <div className="h-2.5 rounded-full bg-white/[0.08]" style={{ width: `${88 - index * 12}%` }} />
                                    <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/25">{text}</div>
                                </div>
                            ))}
                        </motion.div>

                        <div className="grid gap-3">
                            <div className="rounded-[1.6rem] border border-cyan-300/[0.12] bg-white/[0.02] p-4 shadow-[0_0_36px_rgba(34,211,238,0.08)]">
                                <div className="mb-3 flex items-center gap-3">
                                    <Sparkles className={`size-5 text-violet-200 ${floatingIconClass}`} />
                                    <span className="text-[11px] uppercase tracking-[0.28em] text-white/35">Señales que importan</span>
                                </div>
                                <div className="space-y-3">
                                    {["Título relevante", "Ficha local completa", "Velocidad mobile"].map((item) => (
                                        <CenterHoverCard
                                            key={item}
                                            centerMode={centerMode}
                                            base={{
                                                scale: 1,
                                                x: 0,
                                                y: 0,
                                                boxShadow: "0 0 0 rgba(34,211,238,0)",
                                                backgroundColor: "rgba(255,255,255,0.02)",
                                                borderColor: "rgba(255,255,255,0.05)",
                                            }}
                                            hover={{
                                                scale: 1.01,
                                                x: centerMode ? 0 : 2,
                                                y: 0,
                                                boxShadow: "0 0 24px rgba(34,211,238,0.28), inset 0 0 0 1px rgba(103,232,249,0.4)",
                                                backgroundColor: "rgba(34,211,238,0.12)",
                                                borderColor: "rgba(103,232,249,0.42)",
                                            }}
                                            className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5"
                                        >
                                            <span className="text-sm text-white/65">{item}</span>
                                            <ArrowUpRight className="size-4 text-cyan-200/70" />
                                        </CenterHoverCard>
                                    ))}
                                </div>
                            </div>

                            <CenterHoverCard
                                centerMode={centerMode}
                                base={{
                                    scale: 1,
                                    x: 0,
                                    y: 0,
                                    boxShadow: "0 0 0 rgba(34,211,238,0)",
                                    backgroundColor: "rgba(255,255,255,0.02)",
                                    borderColor: "rgba(196,181,253,0.12)",
                                }}
                                hover={{
                                    scale: 1.01,
                                    x: centerMode ? 0 : 2,
                                    y: 0,
                                    boxShadow: "0 0 24px rgba(34,211,238,0.28), inset 0 0 0 1px rgba(103,232,249,0.4)",
                                    backgroundColor: "rgba(34,211,238,0.12)",
                                    borderColor: "rgba(103,232,249,0.42)",
                                }}
                                className="rounded-[1.6rem] border border-violet-300/[0.12] bg-white/[0.02] p-4 shadow-[0_0_30px_rgba(139,92,246,0.12)]"
                            >
                                <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">Lectura rápida</div>
                                <p className="mt-3 text-sm leading-7 text-white/55">
                                    Esto es lo que ven tus clientes cuando te buscan. Si no estás arriba, ese clic termina en otra marca.
                                </p>
                            </CenterHoverCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function WebDevelopmentSeo() {
    const prefersReduced = useReducedMotion()
    const titleRef = React.useRef<HTMLHeadingElement>(null)
    const titleInView = useInView(titleRef, { once: true, amount: 0.7 })
    const [typedStaticTitle, setTypedStaticTitle] = useState("")
    const [typedDynamicTitle, setTypedDynamicTitle] = useState("")
    const [isBelowLg, setIsBelowLg] = useState(false)
    const displayStaticTitle = prefersReduced ? seoTitleStatic : typedStaticTitle
    const displayDynamicTitle = prefersReduced ? seoTitleDynamicPhrases[0] : typedDynamicTitle

    useEffect(() => {
        const media = window.matchMedia("(max-width: 1023.98px)")
        const sync = () => setIsBelowLg(media.matches)
        sync()

        media.addEventListener("change", sync)
        return () => media.removeEventListener("change", sync)
    }, [])

    useEffect(() => {
        if (prefersReduced || !titleInView) return

        let cancelled = false
        const timers: number[] = []

        const sleep = (ms: number) =>
            new Promise<void>((resolve) => {
                const id = window.setTimeout(resolve, ms)
                timers.push(id)
            })

        const typeText = async (
            text: string,
            setter: React.Dispatch<React.SetStateAction<string>>,
            pace: number
        ) => {
            for (let i = 1; i <= text.length; i += 1) {
                if (cancelled) return false
                setter(text.slice(0, i))
                await sleep(pace)
            }
            return !cancelled
        }

        const eraseText = async (
            text: string,
            setter: React.Dispatch<React.SetStateAction<string>>,
            pace: number
        ) => {
            for (let i = text.length - 1; i >= 0; i -= 1) {
                if (cancelled) return false
                setter(text.slice(0, i))
                await sleep(pace)
            }
            return !cancelled
        }

        const runTitleLoop = async () => {
            setTypedStaticTitle("")
            setTypedDynamicTitle("")
            const typedStatic = await typeText(seoTitleStatic, setTypedStaticTitle, 34)
            if (!typedStatic || cancelled) return

            await sleep(140)
            if (cancelled) return

            let index = 0
            while (!cancelled) {
                const phrase = seoTitleDynamicPhrases[index]
                const typedDynamic = await typeText(phrase, setTypedDynamicTitle, 48)
                if (!typedDynamic || cancelled) return

                await sleep(1850)
                if (cancelled) return

                const erased = await eraseText(phrase, setTypedDynamicTitle, 26)
                if (!erased || cancelled) return

                await sleep(170)
                if (cancelled) return
                index = (index + 1) % seoTitleDynamicPhrases.length
            }
        }

        runTitleLoop()

        return () => {
            cancelled = true
            timers.forEach((id) => window.clearTimeout(id))
        }
    }, [prefersReduced, titleInView])

    return (
        <section className="relative overflow-hidden border-y border-white/5 bg-[#030014] px-4 py-20 sm:px-6 sm:py-24 lg:min-h-screen lg:px-8 lg:py-10 xl:py-14">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
                @keyframes cursorBlink {
                    0%, 49%, 100% { opacity: 1; }
                    50%, 99% { opacity: 0; }
                }
                @keyframes seoCursorBlink {
                    0%, 44%, 100% { opacity: 1; }
                    45%, 82% { opacity: 0.12; }
                }
                @keyframes seoCursorGlow {
                    0%, 100% {
                        box-shadow: 0 0 0 rgba(34,211,238,0), 0 0 22px rgba(34,211,238,0.4);
                        transform: scaleY(1);
                    }
                    50% {
                        box-shadow: 0 0 12px rgba(125,211,252,0.95), 0 0 34px rgba(103,232,249,0.7);
                        transform: scaleY(1.08);
                    }
                }
                @keyframes seoTitleShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes seoTitlePulse {
                    0%, 100% {
                        text-shadow: 0 0 10px rgba(34,211,238,0.2), 0 0 24px rgba(167,139,250,0.14);
                    }
                    50% {
                        text-shadow: 0 0 16px rgba(34,211,238,0.34), 0 0 34px rgba(167,139,250,0.24);
                    }
                }
            `}</style>

            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-full w-[60rem] -translate-x-1/2 blur-[100px]"
                animate={
                    prefersReduced
                        ? { opacity: 1, x: "-50%", y: 0 }
                        : { opacity: [1, 0.86, 1], x: ["-50%", "calc(-50% + 24px)", "-50%"], y: [0, -18, 0] }
                }
                transition={
                    prefersReduced
                        ? { duration: 0 }
                        : { duration: 11.2, repeat: Infinity, ease: "easeInOut" }
                }
                style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.12) 0%, transparent 65%)" }}
            />
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-8rem] top-20 h-[28rem] w-[28rem] rounded-full blur-[140px]"
                animate={
                    prefersReduced
                        ? { opacity: 1, x: 0, y: 0 }
                        : { opacity: [1, 0.82, 1], x: [0, -22, 0], y: [0, 14, 0] }
                }
                transition={
                    prefersReduced
                        ? { duration: 0 }
                        : { duration: 12.4, repeat: Infinity, ease: "easeInOut" }
                }
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 72%)" }}
            />
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute left-[8%] bottom-[-8rem] h-[22rem] w-[22rem] rounded-full blur-[120px]"
                animate={
                    prefersReduced
                        ? { opacity: 1, x: 0, y: 0 }
                        : { opacity: [1, 0.78, 1], x: [0, 16, 0], y: [0, -12, 0] }
                }
                transition={
                    prefersReduced
                        ? { duration: 0 }
                        : { duration: 10.8, repeat: Infinity, ease: "easeInOut" }
                }
                style={{ background: "radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 74%)" }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                    background:
                        "radial-gradient(90% 52% at 50% 14%, rgba(0,229,255,0.16) 0%, rgba(0,229,255,0) 72%), linear-gradient(165deg, rgba(14,11,42,0.16) 0%, rgba(19,48,93,0.08) 42%, rgba(42,12,74,0.1) 100%)",
                }}
            />
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[14%] top-[18%] h-[32rem] w-[36rem] rounded-full blur-[120px]"
                animate={
                    prefersReduced
                        ? { opacity: 1, x: 0, y: 0 }
                        : { opacity: [0.42, 0.7, 0.42], x: [0, 72, 0], y: [0, -20, 0] }
                }
                transition={
                    prefersReduced
                        ? { duration: 0 }
                        : { duration: 14.8, repeat: Infinity, ease: "easeInOut" }
                }
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.28) 0%, rgba(14,165,233,0.14) 38%, transparent 74%)" }}
            />
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-10%] bottom-[8%] h-[29rem] w-[33rem] rounded-full blur-[120px]"
                animate={
                    prefersReduced
                        ? { opacity: 1, x: 0, y: 0 }
                        : { opacity: [0.32, 0.58, 0.32], x: [0, -56, 0], y: [0, 22, 0] }
                }
                transition={
                    prefersReduced
                        ? { duration: 0 }
                        : { duration: 13.4, repeat: Infinity, ease: "easeInOut" }
                }
                style={{ background: "radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(236,72,153,0.12) 42%, transparent 76%)" }}
            />
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.16]"
                animate={
                    prefersReduced
                        ? { backgroundPositionX: "0px", backgroundPositionY: "0px" }
                        : { backgroundPositionX: ["0px", "74px", "0px"], backgroundPositionY: ["0px", "102px", "0px"] }
                }
                transition={
                    prefersReduced
                        ? { duration: 0 }
                        : { duration: 17, repeat: Infinity, ease: "linear" }
                }
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(103,232,249,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(167,139,250,0.12) 1px, transparent 1px)",
                    backgroundSize: "5.8rem 5.8rem",
                    maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.72) 24%, transparent 86%)",
                }}
            />

            <div className="relative z-10 mx-auto w-full max-w-[1380px]">
                <div className="grid items-start gap-10 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-center lg:gap-8 xl:gap-12">
                    <div className="min-w-0 text-center lg:text-left">
                        <motion.div
                            initial={prefersReduced ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: 56, filter: "blur(10px)" }}
                            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            viewport={{ once: true, amount: 0.75 }}
                            transition={{ duration: prefersReduced ? 0 : 0.85, ease, delay: 0.02 }}
                            className="mb-5 inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/[0.05] bg-white/[0.02] px-3 py-2 backdrop-blur-md sm:gap-3 sm:px-4"
                        >
                            <span className="inline-block h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.85)]" />
                            <span className="truncate text-[10px] uppercase tracking-[0.26em] text-cyan-200/85 sm:text-[11px] sm:tracking-[0.34em]">[ Posicionamiento local ]</span>
                        </motion.div>

                        <motion.h2
                            ref={titleRef}
                            initial={prefersReduced ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 28, filter: "blur(12px)" }}
                            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            viewport={{ once: true, amount: 0.7 }}
                            transition={{ duration: prefersReduced ? 0 : 1.1, delay: 0.1, ease }}
                            className="mx-auto w-full max-w-[16ch] text-[clamp(1.88rem,8.7vw,4.8rem)] font-black leading-[1.02] tracking-[-0.06em] text-white lg:mx-0 lg:max-w-none"
                        >
                            <span className="relative block text-white">
                                <span
                                    aria-hidden="true"
                                    className="invisible pointer-events-none block select-none"
                                >
                                    {seoTitleStatic}
                                </span>
                                <span className="absolute inset-0 block">{displayStaticTitle}</span>
                            </span>
                            <span className="mt-2 block overflow-visible pb-[0.2em]">
                                <span className="relative mx-auto block w-full max-w-[16.2ch] overflow-visible pb-[0.03em] leading-[1.08] lg:mx-0 lg:max-w-[11.4ch] xl:max-w-[12.8ch] 2xl:max-w-none">
                                    <span
                                        aria-hidden="true"
                                        className="invisible pointer-events-none block select-none whitespace-normal break-words"
                                    >
                                        {seoLongestDynamicPhrase}
                                        <span className="ml-[0.08em] inline-block h-[0.98em] w-[3px] align-baseline" />
                                    </span>
                                    <span
                                        className="absolute inset-0 block overflow-visible whitespace-normal break-words bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-center text-transparent lg:text-left"
                                        style={{
                                            backgroundSize: "220% 100%",
                                            animation: prefersReduced ? "none" : "seoTitleShift 6s ease-in-out infinite, seoTitlePulse 3.8s ease-in-out infinite",
                                        }}
                                    >
                                        {displayDynamicTitle}
                                        <span
                                            className="ml-[0.08em] inline-block h-[0.98em] w-[3px] translate-y-[0.02em] rounded-full bg-cyan-300 align-baseline"
                                            style={{
                                                animation: prefersReduced ? "none" : "seoCursorBlink 0.95s step-end infinite, seoCursorGlow 2.2s ease-in-out infinite",
                                            }}
                                        />
                                    </span>
                                </span>
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={prefersReduced || isBelowLg ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: -92, filter: "blur(14px)" }}
                            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            viewport={{ once: true, amount: isBelowLg ? 0.08 : 0.75 }}
                            transition={{ duration: prefersReduced || isBelowLg ? 0 : 1.05, delay: isBelowLg ? 0 : 0.24, ease }}
                            className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/54 md:text-lg lg:mx-0 lg:max-w-[43ch]"
                        >
                            Cada dia, cientos de personas buscan tu rubro en su ciudad. La diferencia entre vender o desaparecer empieza en esa pantalla.
                        </motion.p>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-7">
                            {checks.map((check, index) => (
                                <motion.div
                                    key={check}
                                    initial={prefersReduced || isBelowLg ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: 68, filter: "blur(12px)" }}
                                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    viewport={{ once: true, amount: isBelowLg ? 0.08 : 0.9 }}
                                    transition={{ duration: prefersReduced || isBelowLg ? 0 : 0.92, delay: isBelowLg ? 0 : 0.42 + index * 0.1, ease }}
                                    className={index === 2 ? "sm:col-span-2 lg:max-w-[28rem]" : ""}
                                >
                                    <CenterHoverCard
                                        centerMode={isBelowLg}
                                        base={{
                                            scale: 1,
                                            x: 0,
                                            y: 0,
                                            boxShadow: "0 0 0 rgba(34,211,238,0)",
                                            backgroundColor: "rgba(255,255,255,0.03)",
                                            borderColor: "rgba(255,255,255,0.07)",
                                        }}
                                        hover={{
                                            scale: 1.015,
                                            x: 0,
                                            y: -1,
                                            boxShadow: "0 0 28px rgba(34,211,238,0.3), inset 0 0 0 1px rgba(103,232,249,0.46)",
                                            backgroundColor: "rgba(34,211,238,0.16)",
                                            borderColor: "rgba(103,232,249,0.52)",
                                        }}
                                        className="inline-flex w-full items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2 text-sm text-white/68 backdrop-blur-sm"
                                    >
                                        <span className="grid size-6 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/10">
                                            <Check className="size-3.5 text-cyan-200" />
                                        </span>
                                        {check}
                                    </CenterHoverCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={
                            prefersReduced || isBelowLg
                                ? { opacity: 1, x: 0, filter: "blur(0px)" }
                                : { opacity: 0, x: -120, filter: "blur(18px)" }
                        }
                        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        viewport={{ once: true, amount: isBelowLg ? 0.08 : 0.42 }}
                        transition={{ duration: prefersReduced || isBelowLg ? 0 : 1.2, delay: isBelowLg ? 0 : 0.75, ease }}
                        className="w-full min-w-0 lg:justify-self-end"
                    >
                        <GoogleSimulator centerMode={isBelowLg} />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
