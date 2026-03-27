"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion"
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

const ease = [0.16, 1, 0.3, 1] as const
const floatingIconClass =
    "animate-[float_3s_ease-in-out_infinite] text-white/80 drop-shadow-[0_0_24px_rgba(94,234,212,0.15)]"

function GoogleSimulator() {
    const [currentQuery, setCurrentQuery] = useState("")
    const [activeRubro, setActiveRubro] = useState(0)
    const [showResults, setShowResults] = useState(false)
    const [typing, setTyping] = useState(false)
    const prefersReduced = useReducedMotion()

    useEffect(() => {
        if (prefersReduced) {
            const timer = setTimeout(() => {
                setActiveRubro((prev) => (prev + 1) % queries.length)
            }, 4000)
            return () => clearTimeout(timer)
        }

        const query = queries[activeRubro]
        let charIdx = 0
        let typeInterval: ReturnType<typeof setInterval> | null = null
        const kickoff = setTimeout(() => {
            setCurrentQuery("")
            setShowResults(false)
            setTyping(true)

            typeInterval = setInterval(() => {
                if (charIdx < query.text.length) {
                    setCurrentQuery(query.text.slice(0, charIdx + 1))
                    charIdx += 1
                } else if (typeInterval) {
                    clearInterval(typeInterval)
                    setTyping(false)
                    setTimeout(() => {
                        setShowResults(true)
                        setTimeout(() => {
                            setActiveRubro((prev) => (prev + 1) % queries.length)
                        }, 3300)
                    }, 350)
                }
            }, 55)
        }, 0)

        return () => {
            clearTimeout(kickoff)
            if (typeInterval) clearInterval(typeInterval)
        }
    }, [activeRubro, prefersReduced])

    const displayQuery = prefersReduced ? queries[activeRubro].text : currentQuery
    const displayResults = prefersReduced || showResults

    return (
        <div className="mx-auto w-full max-w-[860px]">
            <div className="rounded-[2rem] border border-white/[0.05] bg-white/[0.02] p-4 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.4)] md:p-6">
                <div className="rounded-[1.7rem] border border-white/[0.05] bg-[#050816]/80 p-4 md:p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="grid size-11 place-items-center rounded-[1rem] border border-white/10 bg-white/[0.03]">
                                <Search className={`size-5 text-cyan-200 ${floatingIconClass}`} />
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.32em] text-white/35">Búsqueda activa</div>
                                <div className="mt-1 text-sm text-white/75">Así se ve una intención real de compra</div>
                            </div>
                        </div>
                        <div className="hidden rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-cyan-200/70 md:inline-flex">
                            SEO local en movimiento
                        </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/[0.05] bg-white/[0.03] px-4 py-4 md:px-5">
                        <div className="flex items-center gap-3 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                            <Search className="size-4 shrink-0 text-white/40" />
                            <div className="min-h-[22px] flex-1 text-sm text-white/80 md:text-[15px]">
                                {displayQuery}
                                {typing && (
                                    <span className="ml-1 inline-block h-[18px] w-[2px] align-middle [animation:cursorBlink_0.7s_ease-in-out_infinite] bg-cyan-300" />
                                )}
                            </div>
                            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                                Buscar
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_0.8fr]">
                        <AnimatePresence mode="wait">
                            {displayResults && (
                                <motion.div
                                    key={activeRubro}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.35, ease }}
                                    className="space-y-3"
                                >
                                    <div className="relative overflow-hidden rounded-[1.6rem] border border-cyan-300/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.1),rgba(255,255,255,0.03)_38%,rgba(167,139,250,0.08))] p-5 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
                                        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.9),rgba(196,181,253,0.8),transparent)]" />
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                                                #1
                                            </span>
                                            <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">
                                                {queries[activeRubro].rubro.toLowerCase()}.com.ar
                                            </span>
                                        </div>
                                        <div className="pr-20 text-lg font-bold leading-tight text-cyan-100">
                                            {queries[activeRubro].rubro} - Tu Empresa | DevelOP
                                        </div>
                                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                                            El mejor {queries[activeRubro].rubro.toLowerCase()} en tu zona. Consultá precios, pedí presupuesto online y aparecé con autoridad desde el primer resultado.
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/35">
                                            <Map className={`size-4 text-cyan-200 ${floatingIconClass}`} />
                                            Ficha local optimizada
                                        </div>
                                        <div className="absolute right-4 top-4 rounded-full border border-cyan-300/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100 backdrop-blur-xl">
                                            Tu empresa
                                        </div>
                                    </div>

                                    {["Negocios similares en tu zona", "Más resultados relevantes"].map((text, index) => (
                                        <div
                                            key={text}
                                            className="rounded-[1.35rem] border border-white/[0.05] bg-white/[0.02] p-4"
                                            style={{ opacity: 0.46 - index * 0.12 }}
                                        >
                                            <div className="mb-2 h-3 rounded-full bg-white/[0.13]" style={{ width: `${74 - index * 14}%` }} />
                                            <div className="h-2.5 rounded-full bg-white/[0.08]" style={{ width: `${88 - index * 12}%` }} />
                                            <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/25">{text}</div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid gap-3">
                            <div className="rounded-[1.6rem] border border-white/[0.05] bg-white/[0.02] p-5">
                                <div className="mb-3 flex items-center gap-3">
                                    <Sparkles className={`size-5 text-violet-200 ${floatingIconClass}`} />
                                    <span className="text-[11px] uppercase tracking-[0.28em] text-white/35">Señales que importan</span>
                                </div>
                                <div className="space-y-3">
                                    {["Título relevante", "Ficha local completa", "Velocidad mobile"].map((item) => (
                                        <div key={item} className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                                            <span className="text-sm text-white/65">{item}</span>
                                            <ArrowUpRight className="size-4 text-cyan-200/70" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[1.6rem] border border-white/[0.05] bg-white/[0.02] p-5">
                                <div className="text-[11px] uppercase tracking-[0.28em] text-white/35">Lectura rápida</div>
                                <p className="mt-3 text-sm leading-7 text-white/55">
                                    Esto es lo que ven tus clientes cuando te buscan. Si no estás arriba, ese clic termina en otra marca.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function WebDevelopmentSeo() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
    const prefersReduced = useReducedMotion()
    const shouldReveal = prefersReduced || isInView

    return (
        <section ref={sectionRef} className="relative overflow-hidden border-y border-white/5 bg-[#030014] px-4 py-24">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
                @keyframes cursorBlink {
                    0%, 49%, 100% { opacity: 1; }
                    50%, 99% { opacity: 0; }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-full w-[60rem] -translate-x-1/2 blur-[100px]"
                style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.08) 0%, transparent 65%)" }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-8rem] top-20 h-[28rem] w-[28rem] rounded-full blur-[140px]"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 72%)" }}
            />

            <div className="relative z-10 mx-auto max-w-6xl">
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-2 backdrop-blur-xl"
                    >
                        <span className="inline-block h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.85)]" />
                        <span className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/85">[ Posicionamiento local ]</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.7, delay: 0.08, ease }}
                        className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.06em] text-white"
                    >
                        Si no estás en Google,
                        <br />
                        <span className="bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent">
                            no existís.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                        transition={{ duration: 0.55, delay: 0.18, ease }}
                        className="mx-auto mt-7 max-w-3xl text-base leading-8 text-white/52 md:text-xl"
                    >
                        Cada día, cientos de personas buscan tu rubro en su ciudad. La diferencia entre vender o desaparecer empieza en esa pantalla.
                    </motion.p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        {checks.map((check, index) => (
                            <motion.div
                                key={check}
                                initial={{ opacity: 0, y: 10 }}
                                animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                transition={{ duration: 0.45, delay: 0.26 + index * 0.08, ease }}
                                className="inline-flex items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-sm text-white/62 backdrop-blur-xl"
                            >
                                <span className="grid size-6 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/10">
                                    <Check className="size-3.5 text-cyan-200" />
                                </span>
                                {check}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 26 }}
                    animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
                    transition={{ duration: 0.8, delay: 0.3, ease }}
                >
                    <GoogleSimulator />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 flex w-full justify-center"
                >
                    <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20aparecer%20primero%20en%20Google%20en%20mi%20ciudad`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-8 py-4 text-[13px] font-extrabold uppercase tracking-[0.24em] text-white shadow-[0_18px_40px_rgba(37,211,102,0.16)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.03]"
                    >
                        <Search className={`size-4 ${floatingIconClass}`} />
                        Quiero aparecer primero
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
